export class CardType {

  constructor(name) {
    this.name = name;
  }

  inDeckByDefault() {
    return false;
  }

  createCard(index) {
    return { name, index };
  }

}
