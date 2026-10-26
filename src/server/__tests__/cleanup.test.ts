import {describe, expect, it} from 'vitest';
import {MatchCleanup, type MatchStore} from '../cleanup';

type Seat = {id: number; name?: string; credentials?: string; isConnected?: boolean};

const store = (phase: string, seats: Seat[]) => {
  const matches = new Map<string, {phase: string; players: Record<string, Seat>; dead: string[]}>();
  matches.set('m1', {phase, players: Object.fromEntries(seats.map(s => [String(s.id), s])), dead: []});
  const db: MatchStore = {
    listMatches: () => [...matches.keys()],
    fetch: (id) => {
      const m = matches.get(id);
      return m ? {state: {ctx: {phase: m.phase}, G: {deadPlayers: m.dead}} as any, metadata: {players: m.players} as any} : {};
    },
    setMetadata: (id, metadata) => {
      matches.get(id)!.players = metadata.players as any;
    },
    wipe: (id) => {
      matches.delete(id);
    },
  };
  return {db, matches};
};

const options = {lobbySeatGraceMs: 30_000, inGameGraceMs: 60_000, emptyMatchGraceMs: 300_000};

describe('MatchCleanup', () => {
  it('frees a lobby seat once its player has been gone past the grace period', async () => {
    const {db, matches} = store('lobby', [
      {id: 0, name: 'host', credentials: 'a', isConnected: true},
      {id: 1, name: 'ghost', credentials: 'b', isConnected: false},
    ]);
    const cleanup = new MatchCleanup(db, async () => {}, options);

    await cleanup.sweep(0);
    await cleanup.sweep(29_000);
    expect(matches.get('m1')!.players['1'].name).toBe('ghost');

    await cleanup.sweep(30_000);
    expect(matches.get('m1')!.players['1'].name).toBeUndefined();
    expect(matches.get('m1')!.players['1'].credentials).toBeUndefined();
    expect(matches.get('m1')!.players['0'].name).toBe('host');
  });

  it('forgets the absence when the player comes back', async () => {
    const {db, matches} = store('lobby', [
      {id: 0, name: 'host', isConnected: true},
      {id: 1, name: 'reloader', isConnected: false},
    ]);
    const cleanup = new MatchCleanup(db, async () => {}, options);

    await cleanup.sweep(0);
    matches.get('m1')!.players['1'].isConnected = true;
    await cleanup.sweep(20_000);
    matches.get('m1')!.players['1'].isConnected = false;
    await cleanup.sweep(40_000);
    expect(matches.get('m1')!.players['1'].name).toBe('reloader');
  });

  it('takes a player out of a running game once they have been gone past the grace period', async () => {
    const {db, matches} = store('play', [
      {id: 0, name: 'host', isConnected: true},
      {id: 1, name: 'away', isConnected: false},
    ]);
    const removed: string[] = [];
    const cleanup = new MatchCleanup(db, async (_m, id) => {
      removed.push(id);
      matches.get('m1')!.dead.push(id);
    }, options);

    await cleanup.sweep(0);
    await cleanup.sweep(59_000);
    expect(removed).toEqual([]);

    await cleanup.sweep(60_000);
    await cleanup.sweep(70_000);
    expect(removed).toEqual(['1']);
    expect(matches.get('m1')!.players['1'].name).toBe('away');
  });

  it('takes a player who pressed leave out of a running game straight away', async () => {
    const {db} = store('play', [
      {id: 0, name: 'host', isConnected: true},
      {id: 1, isConnected: false},
    ]);
    const removed: string[] = [];
    const cleanup = new MatchCleanup(db, async (_m, id) => {
      removed.push(id);
    }, options);

    await cleanup.sweep(0);
    expect(removed).toEqual(['1']);
  });

  it('deletes a match nobody has been connected to for the grace period', async () => {
    const {db, matches} = store('play', [
      {id: 0, name: 'a', isConnected: false},
      {id: 1, name: 'b', isConnected: false},
    ]);
    const cleanup = new MatchCleanup(db, async () => {}, options);

    await cleanup.sweep(0);
    await cleanup.sweep(299_000);
    expect(matches.has('m1')).toBe(true);

    await cleanup.sweep(300_000);
    expect(matches.has('m1')).toBe(false);
  });
});
