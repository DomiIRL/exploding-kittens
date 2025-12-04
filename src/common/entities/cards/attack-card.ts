import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class AttackCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: FnContext, _card: Card) {
    const { G, ctx, events } = context;

    // Add 2 turns to the counter (next player will have to play 2 turns)
    // Add 3 turns because endTurn will remove one turn from the counter
    G.turnsRemaining = 3;

    // End the current player's turn
    const nextPlayer = ctx.playOrderPos + 1;
    const nextPlayerIndex = nextPlayer % ctx.numPlayers;
    events.endTurn({ next: nextPlayerIndex + "" });
  }
}
