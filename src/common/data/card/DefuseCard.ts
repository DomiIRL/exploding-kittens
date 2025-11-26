import { CardType } from "../CardType";

export class DefuseCard extends CardType {
  constructor() {
    super('defuse');
  }

  inDeckByDefault(): boolean {
    return true;
  }
}

