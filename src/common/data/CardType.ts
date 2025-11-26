import {Card} from "./Card";

export class CardType {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  inDeckByDefault(): boolean {
    return false;
  }

  createCard(index: number): Card {
    return { name: this.name, index };
  }
}

