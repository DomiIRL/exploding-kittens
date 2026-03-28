import {ICard} from '../models';
import {TheGame} from './game';
import {Card} from './card';

export class CardList {
  constructor(
    protected game: TheGame,
    protected _getRawCards: () => ICard[],
    protected setCards: (cards: ICard[]) => void,
    protected onUpdate?: () => void
  ) {}

  get cards(): Card[] {
    return this._getRawCards().map(c => new Card(this.game, c));
  }

  get rawCards(): ICard[] {
    return this._getRawCards();
  }

  get length(): number {
    return this._getRawCards().length;
  }

  get topCard(): Card | null {
    const cards = this._getRawCards();
    if (cards.length === 0) return null;
    return new Card(this.game, cards[cards.length - 1]);
  }

  hasCard(cardName: string): boolean {
    return this._getRawCards().some(c => c.name === cardName);
  }

  findCardIndex(cardName: string): number {
    return this._getRawCards().findIndex(c => c.name === cardName);
  }

  getCardAt(index: number): Card | null {
    const cards = this._getRawCards();
    if (index < 0 || index >= cards.length) return null;
    return new Card(this.game, cards[index]);
  }

  getCards(cardName: Card | string): Card[] {
    const name = typeof cardName === 'string' ? cardName : cardName.name;
    return this._getRawCards().filter(c => c.name === name).map(c => new Card(this.game, c));
  }

  getMatchingCards(card: Card): Card[] {
    return this.getCards(card.name).filter(c => c.index === card.index);
  }

  addCard(card: Card | ICard): void {
    const cardData: ICard = { id: card.id, name: card.name, index: card.index };
    this._getRawCards().push({ ...cardData });
    this.onUpdate?.();
  }

  insertCard(card: Card | ICard, index: number): void {
    const cardData: ICard = { id: card.id, name: card.name, index: card.index };
    this._getRawCards().splice(index, 0, { ...cardData });
    this.onUpdate?.();
  }

  removeCardAt(index: number): Card | undefined {
    const cards = this._getRawCards();
    if (index < 0 || index >= cards.length) return undefined;
    const [card] = cards.splice(index, 1);
    this.onUpdate?.();
    return new Card(this.game, card);
  }

  removeCardById(id: number): Card | undefined {
    const index = this._getRawCards().findIndex(c => c.id === id);
    if (index === -1) return undefined;
    return this.removeCardAt(index);
  }

  removeAllCardsFromList(): Card[] {
    const cards = this._getRawCards();
    const removed = [...cards];
    // In-place clear
    cards.splice(0, cards.length);
    this.onUpdate?.();
    return removed.map(c => new Card(this.game, c));
  }

  drawCard(): Card | null {
    const cards = this._getRawCards();
    const shift = cards.shift();
    if (shift) {
      this.onUpdate?.();
      return new Card(this.game, shift);
    }
    return null;
  }

  shuffle(): void {
    const cards = this._getRawCards();
    this.setCards(this.game.random.Shuffle(cards));
    this.onUpdate?.();
  }
}
