import {describe, expect, it, vi} from 'vitest';
import {Client} from 'boardgame.io/client';
import {ExplodingKittens} from '../exploding-kittens';
import {NAME_DEFUSE, NAME_EXPLODING_KITTEN} from '../constants/cards';

const startedGame = (numPlayers: number) => {
  const client = Client({game: ExplodingKittens, numPlayers, playerID: '0'});
  client.start();
  client.moves.startGame();
  return client;
};

describe('ExplodingKittens', () => {
  it('starts in the lobby', () => {
    const client = Client({game: ExplodingKittens, numPlayers: 3, playerID: '0'});
    client.start();
    expect((client as any).store.getState().ctx.phase).toBe('lobby');
  });

  it('deals every player a defuse and leaves the kittens in the draw pile', () => {
    const client = startedGame(3);
    const state = (client as any).store.getState();
    expect(state.ctx.phase).toBe('play');

    const players = Object.values((state.plugins.player.data as any).players) as any[];
    expect(players).toHaveLength(3);
    for (const player of players) {
      expect(player.hand.some((c: any) => c.name === NAME_DEFUSE)).toBe(true);
      expect(player.hand.some((c: any) => c.name === NAME_EXPLODING_KITTEN)).toBe(false);
    }

    const kittens = state.G.piles.drawPile.cards.filter((c: any) => c.name === NAME_EXPLODING_KITTEN);
    expect(kittens).toHaveLength(2);
  });

  it('passes the turn after a safe draw', () => {
    const client = startedGame(2);
    const before = (client as any).store.getState();
    const top = before.G.piles.drawPile.cards[0];
    client.updatePlayerID(before.ctx.currentPlayer);
    client.moves.drawCard();
    const after = (client as any).store.getState();

    expect(after.G.piles.drawPile.cards).toHaveLength(before.G.piles.drawPile.cards.length - 1);
    if (top.name !== NAME_EXPLODING_KITTEN) {
      expect(after.ctx.currentPlayer).not.toBe(before.ctx.currentPlayer);
    }
  });

  it('keys animations by a counter, whatever the clock says', () => {
    const client = startedGame(2);
    const before = (client as any).store.getState();
    client.updatePlayerID(before.ctx.currentPlayer);

    const clock = vi.spyOn(Date, 'now').mockReturnValue(4_000_000_000_000);
    client.moves.drawCard();
    clock.mockRestore();

    const after = (client as any).store.getState();
    const keys = Object.keys(after.G.animationsQueue).map(Number);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(key).toBeGreaterThanOrEqual(before.G.nextAnimationId);
      expect(key).toBeLessThan(after.G.nextAnimationId);
    }
  });
});
