import type {IContext} from '../models';
import {TheGame} from '../entities/game';

type GameMove<Args extends unknown[]> = (game: TheGame, ...args: Args) => void;

export function inGame<Args extends unknown[]>(move: GameMove<Args>) {
  return (context: IContext, ...args: Args): void => {
    try {
      const game = new TheGame(context);
      game.animationsQueue.clear()
      move(game, ...args);
    } catch (error) {
      console.error(`Move failed: ${move.name || 'anonymous move'}`, error, {args});
    }
  };
}

