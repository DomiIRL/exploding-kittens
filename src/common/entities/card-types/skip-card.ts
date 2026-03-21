import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class SkipCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  onPlayed(game: TheGame, _card: Card) {
    game.turnManager.endTurn();
  }


  sortOrder(): number {
    return 2;
  }
}
