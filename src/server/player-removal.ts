import type {Game, PlayerID, State} from 'boardgame.io';
import {Master} from 'boardgame.io/dist/cjs/master.js';
import {REMOVE_PLAYER} from '../common/moves/remove-player-move';
import type {MatchStore} from './cleanup';

// What the sweep needs from boardgame.io's SocketIO transport. Neither member is public API: the queue keeps this
// move in line with the players' own, the pub/sub reaches every socket connected to the match.
export interface MatchTransport {
  getMatchQueue(matchID: string): {add<T>(task: () => Promise<T>): Promise<T>};
  pubSub: {publish(channelId: string, payload: unknown): void};
}

// boardgame.io only accepts a move from a player who may act right now, so the move is made in the name of one.
export const actingPlayer = (state: State, targetId: PlayerID): PlayerID => {
  const active = state.ctx.activePlayers;
  if (!active) return state.ctx.currentPlayer;
  if (targetId in active) return targetId;
  return Object.keys(active)[0] ?? state.ctx.currentPlayer;
};

export const createPlayerRemover = (game: Game, db: MatchStore, transport: MatchTransport, secret: string) =>
  (matchID: string, targetId: PlayerID): Promise<unknown> =>
    transport.getMatchQueue(matchID).add(async () => {
      const {state} = await db.fetch(matchID, {state: true, metadata: true});
      if (!state) return;

      const actor = actingPlayer(state, targetId);
      // No auth: the move carries the secret instead of a player's credentials.
      const master = new Master(game, db as any, {
        send: () => {},
        sendAll: (payload: unknown) => transport.pubSub.publish(`MATCH-${matchID}`, payload),
      }, undefined);
      await master.onUpdate(
        {type: 'MAKE_MOVE', payload: {type: REMOVE_PLAYER, args: [targetId, secret], playerID: actor}} as any,
        state._stateID,
        matchID,
        actor,
      );
    });
