import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class ShuffleCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    game.piles.drawPile.shuffle();
  }

  sortOrder(): number {
    return 4;
  }
}
