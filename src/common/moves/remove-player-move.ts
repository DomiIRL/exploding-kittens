import type {Game, PlayerID} from 'boardgame.io';
import {TheGame} from '../entities/game';
import {inGame} from './in-game';
import {CHOOSE_CARD_TO_GIVE} from '../constants/stages';
import {PLAY} from '../constants/phases';

export const REMOVE_PLAYER = 'removePlayer';

// Takes a player who left out of a running game, as if they had exploded, so the others can play on.
export const removePlayer = (game: TheGame, targetId: PlayerID) => {
  const target = game.players.getPlayer(targetId);
  if (!target.isAlive) return;

  const wasGivingCard = target.isInStage(CHOOSE_CARD_TO_GIVE);
  if (game.piles.pendingCard?.playedBy === targetId) {
    game.piles.pendingCard = null;
  }

  target.eliminate();

  // A favor waits for the target to pick a card; without them the requester just carries on.
  if (wasGivingCard && !target.isCurrentPlayer) {
    game.turnManager.setActivePlayers({value: {}});
  }
};

// Returns a copy of the game whose play phase accepts `removePlayer` from every player and stage, guarded by a
// secret only the server knows, so no client can remove somebody else.
export const withPlayerRemoval = <G, P extends Record<string, unknown>>(base: Game<G, P>, secret: string): Game<G, P> => {
  const move = {
    move: (context: any, targetId: PlayerID, given: string) => {
      if (given !== secret) return;
      inGame(removePlayer)(context, targetId);
    },
    client: false,
  };

  const play = base.phases![PLAY];
  const stages = Object.fromEntries(Object.entries(play.turn?.stages ?? {}).map(([name, stage]) => [
    name,
    {...stage, moves: {...stage.moves, [REMOVE_PLAYER]: move}},
  ]));

  return {
    ...base,
    phases: {
      ...base.phases,
      [PLAY]: {
        ...play,
        moves: {...play.moves, [REMOVE_PLAYER]: move},
        turn: {...play.turn, stages},
      },
    },
  } as Game<G, P>;
};
