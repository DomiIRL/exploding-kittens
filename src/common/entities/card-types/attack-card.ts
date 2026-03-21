import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class AttackCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    const { turnManager } = game;
    const { ctx } = game.context;

    // Add 3 to turnsRemaining for proper 2, 4, 6, 8 stacking
    // Formula: current + 2 (attack bonus) + 1 (compensate for onEnd decrement)
    // Example: turnsRemaining = 1 → 4, after onEnd = 3, next player takes 2 turns
    // Stacking: turnsRemaining = 2 → 5, after onEnd = 4, next player takes 4 turns (2+2)
    const remaining = turnManager.turnsRemaining;
    turnManager.turnsRemaining = remaining + 3;

    // End turn and force move to next player
    const nextPlayer = ctx.playOrderPos + 1;
    const nextPlayerIndex = nextPlayer % ctx.numPlayers;
    turnManager.endTurn({ next: nextPlayerIndex + "" });
  }


  sortOrder(): number {
    return 1;
  }
}
