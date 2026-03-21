import {CardType} from '../card-type';
import {ICard, IContext} from "../../models";

export class ShuffleCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(context: IContext, _card: ICard) {
    const { G, random } = context;
    G.drawPile = random.Shuffle(G.drawPile)
  }

  sortOrder(): number {
    return 4;
  }
}
