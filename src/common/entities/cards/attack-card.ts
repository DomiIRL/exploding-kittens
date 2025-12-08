import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class AttackCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: FnContext, _card: Card) {
    const { G, ctx, events } = context;

    // Add 3 to turnsRemaining for proper 2, 4, 6, 8 stacking
    // Formula: current + 2 (attack bonus) + 1 (compensate for onEnd decrement)
    // Example: turnsRemaining = 1 → 4, after onEnd = 3, next player takes 2 turns
    // Stacking: turnsRemaining = 2 → 5, after onEnd = 4, next player takes 4 turns (2+2)
    G.turnsRemaining = G.turnsRemaining + 3;

    // End turn and force move to next player
    const nextPlayer = ctx.playOrderPos + 1;
    const nextPlayerIndex = nextPlayer % ctx.numPlayers;
    events.endTurn({ next: nextPlayerIndex + "" });
  }
}
