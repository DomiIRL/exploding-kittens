import {CardType} from "../CardType";

export class ExplodingKittenCard extends CardType {

  constructor() {
    super('exploding_kitten');
  }

  inDeckByDefault() {
    return true;
  }

}
