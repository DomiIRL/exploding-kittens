import {CardType} from "../CardType";

export class DefuseCard extends CardType {

  constructor() {
    super('defuse');
  }

  inDeckByDefault() {
    return true;
  }

}
