import type {Server as ServerTypes, State} from 'boardgame.io';

// The subset of boardgame.io's storage API the sweep needs; its InMemory and FlatFile both provide it.
export interface MatchStore {
  listMatches(opts?: object): Promise<string[]> | string[];
  fetch(matchID: string, opts: {state: true; metadata: true}): Promise<{state?: State; metadata?: ServerTypes.MatchData}> | {state?: State; metadata?: ServerTypes.MatchData};
  setMetadata(matchID: string, metadata: ServerTypes.MatchData): Promise<void> | void;
  wipe(matchID: string): Promise<void> | void;
}

export interface CleanupOptions {
  // A seat whose player has been gone this long is freed while the match still waits in the lobby.
  lobbySeatGraceMs: number;
  // A player gone this long from a running game is taken out of it, so the others can play on.
  inGameGraceMs: number;
  // A match nobody has been connected to for this long is deleted.
  emptyMatchGraceMs: number;
}

export const DEFAULT_CLEANUP: CleanupOptions = {
  lobbySeatGraceMs: 30_000,
  inGameGraceMs: 60_000,
  emptyMatchGraceMs: 5 * 60_000,
};

// boardgame.io only knows whether a player is connected right now, so the sweep remembers since when they are not.
export class MatchCleanup {
  private readonly absentSince = new Map<string, number>();

  constructor(
    private readonly db: MatchStore,
    private readonly removePlayer: (matchID: string, playerID: string) => Promise<unknown>,
    private readonly options: CleanupOptions = DEFAULT_CLEANUP,
  ) {
  }

  async sweep(now = Date.now()): Promise<void> {
    const matchIDs = await this.db.listMatches();
    const live = new Set<string>();

    for (const matchID of matchIDs) {
      const {state, metadata} = await this.db.fetch(matchID, {state: true, metadata: true});
      if (!metadata) continue;

      const matchKey = `${matchID}:*`;
      live.add(matchKey);
      const anyoneConnected = Object.values(metadata.players).some(p => p.isConnected);
      if (this.elapsed(matchKey, !anyoneConnected, now) >= this.options.emptyMatchGraceMs) {
        await this.db.wipe(matchID);
        continue;
      }

      if (state?.ctx.phase === 'play') {
        await this.removeGonePlayers(matchID, state, metadata, live, now);
        continue;
      }
      if (state?.ctx.phase !== 'lobby') continue;

      let freed = false;
      for (const [id, player] of Object.entries(metadata.players)) {
        const seatKey = `${matchID}:${id}`;
        live.add(seatKey);
        if (this.elapsed(seatKey, !!player.name && !player.isConnected, now) >= this.options.lobbySeatGraceMs) {
          delete player.name;
          delete player.credentials;
          this.absentSince.delete(seatKey);
          freed = true;
        }
      }
      if (freed) {
        await this.db.setMetadata(matchID, metadata);
      }
    }

    for (const key of this.absentSince.keys()) {
      if (!live.has(key)) this.absentSince.delete(key);
    }
  }

  private async removeGonePlayers(matchID: string, state: State, metadata: ServerTypes.MatchData, live: Set<string>, now: number) {
    const dead: string[] = (state.G as {deadPlayers?: string[]}).deadPlayers ?? [];
    for (const [id, player] of Object.entries(metadata.players)) {
      if (dead.includes(id)) continue;
      const seatKey = `${matchID}:${id}`;
      live.add(seatKey);
      // A player who pressed leave has no name any more; one who closed the tab gets time to come back.
      const left = !player.name;
      if (left || this.elapsed(seatKey, !player.isConnected, now) >= this.options.inGameGraceMs) {
        this.absentSince.delete(seatKey);
        await this.removePlayer(matchID, id);
      }
    }
  }

  start(intervalMs = 10_000): NodeJS.Timeout {
    const timer = setInterval(() => {
      this.sweep().catch(err => console.error('Match cleanup failed:', err));
    }, intervalMs);
    timer.unref();
    return timer;
  }

  private elapsed(key: string, absent: boolean, now: number): number {
    if (!absent) {
      this.absentSince.delete(key);
      return 0;
    }
    if (!this.absentSince.has(key)) {
      this.absentSince.set(key, now);
    }
    return now - this.absentSince.get(key)!;
  }
}
