import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class SeeTheFutureCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  canBePlayed(_context: FnContext, _card: Card): boolean {
    return false;
  }
}
