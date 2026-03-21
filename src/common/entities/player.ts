import {ICard, IPlayer} from '../models';
import {Game} from "./game";

export class Player {
  constructor(
    private game: Game,
    private _state: IPlayer,
    public readonly id: string
  ) {}

  /**
   * Get the underlying raw state object.
   * Useful if direct property access or modification is needed.
   */
  get state(): IPlayer {
    return this._state;
  }

  /**
   * Get the player's hand of card-types
   */
  get hand(): ICard[] {
    return this._state.hand;
  }

  /**
   * Check if player is alive in game terms (not eliminated)
   */
  get isAlive(): boolean {
    return this._state.isAlive;
  }

  /**
   * Check if the player has at least one card of the given type
   */
  hasCard(cardName: string): boolean {
    return this._state.hand.some(c => c.name === cardName);
  }

  /**
   * Get all card-types of a specific type from hand, or all card-types if no type specified
   */
  getCards(cardName?: string): ICard[] {
    if (!cardName) return this._state.hand;
    return this._state.hand.filter(c => c.name === cardName);
  }

  /**
   * Get the count of card-types in hand
   */
  getCardCount(): number {
    return this._state.hand.length;
  }

  /**
   * Add a card to the player's hand
   */
  addCard(card: ICard): void {
    // Clone to avoid Proxy issues
    this._state.hand.push({...card});
    this._updateClientState();
  }

  /**
   * Remove a card at a specific index
   * @returns The removed card, or undefined if index invalid
   */
  removeCardAt(index: number): ICard | undefined {
    if (index < 0 || index >= this._state.hand.length) return undefined;
    const [card] = this._state.hand.splice(index, 1);
    this._updateClientState();
    return card;
  }

  /**
   * Remove the first occurrence of a specific card type
   * @returns The removed card, or undefined if not found
   */
  removeCard(cardName: string): ICard | undefined {
    const index = this._state.hand.findIndex(c => c.name === cardName);
    if (index === -1) return undefined;
    return this.removeCardAt(index);
  }

  /**
   * Remove all card-types of a specific type
   * @returns Array of removed card-types
   */
  removeAllCards(cardName: string): ICard[] {
    const removed: ICard[] = [];
    // Iterate backwards to safely remove
    for (let i = this._state.hand.length - 1; i >= 0; i--) {
      if (this._state.hand[i].name === cardName) {
        const [card] = this._state.hand.splice(i, 1);
        removed.push(card);
      }
    }
    if (removed.length > 0) {
      this._updateClientState();
    }
    return removed;
  }

  /**
   * Remove all card-types from hand
   * @returns Array of all removed card-types
   */
  removeAllCardsFromHand(): ICard[] {
    const removed = [...this._state.hand];
    this._state.hand = [];
    this._updateClientState();
    return removed;
  }

  eliminate(): void {
    this._state.isAlive = false;
    // put all hand card-types in discard pile
    this._state.hand.forEach(card => this.game.discardCard(card));
  }

  /**
   * Transfers a card at specific index to another playerWrapper
   */
  giveCard(cardIndex: number, recipient: Player): ICard {
    const card = this.removeCardAt(cardIndex);
    if (!card) {
       throw new Error("Card not found or invalid index");
    }
    recipient.addCard(card);
    return card;
  }

  private _updateClientState() {
     if (this._state.client) {
         this._state.client.handCount = this._state.hand.length;
     }
  }
}
