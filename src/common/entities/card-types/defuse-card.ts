import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class DefuseCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(_game: TheGame, _card: Card): boolean {
    return false;
  }


  sortOrder(): number {
    return 100;
  }
}
