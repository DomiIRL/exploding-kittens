import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class NopeCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(_context: FnContext, _card: Card): boolean {
    return false;
  }
}
