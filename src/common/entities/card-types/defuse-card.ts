import {CardType} from '../card-type';
import {ICard, IContext} from "../../models";

export class DefuseCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(_context: IContext, _card: ICard): boolean {
    return false;
  }

  sortOrder(): number {
    return 99;
  }
}
