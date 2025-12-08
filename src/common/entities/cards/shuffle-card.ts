import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class ShuffleCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: FnContext, _card: Card) {
    const { G, random } = context;
    G.drawPile = random.Shuffle(G.drawPile)
  }

  sortOrder(): number {
    return 4;
  }
}
