import {ICard, IPlayer} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {EXPLODING_KITTEN, DEFUSE} from "../constants/card-types";

export class Player {
  constructor(
    private game: TheGame,
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
  getCards(cardName: Card | string): Card[] {
    const name = typeof cardName === 'string' ? cardName : cardName.name;
    return this._state.hand.filter(c => c.name === name).map(c => new Card(this.game, c));
  }

  /**
   * Get all card-types that match both name and index of the given card.
   */
  getMatchingCards(card: Card): Card[] {
    return this.getCards(card.name).filter(c => c.index === card.index);
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
    this._state.hand.forEach(card => this.game.piles.discardCard(card));
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

  playCard(cardIndex: number): void {
    if (cardIndex < 0 || cardIndex >= this.hand.length) {
       throw new Error(`Invalid card index: ${cardIndex}`);
    }

    const cardData = this.hand[cardIndex];
    // Create Card wrapper
    const card = new Card(this.game, cardData);
    
    if (!card.type.canBePlayed(this.game, card)) {
       throw new Error(`Card cannot be played: ${card.name}`);
    }

    // Remove card from hand
    const playedCardData = this.removeCardAt(cardIndex);
    if (!playedCardData) return; // Should not happen

    this.game.piles.discardCard(playedCardData);
    card.afterPlay();

    if (card.isNowCard()) {
       card.play();
       return;
    }

    // Setup pending state for non-immediate cards
    const startedAtMs = Date.now();
    this.game.pendingCardPlay = {
        card: {...playedCardData},
        playedBy: this.id,
        startedAtMs, 
        expiresAtMs: startedAtMs + (this.game.gameRules.pendingTimerMs || 5000),
        lastNopeBy: null,
        nopeCount: 0,
        isNoped: false
    };

    // Note: card.type.setupPendingState logic might need valid PendingCardPlay to be set first? 
    // The original setupPendingState in CardType calls setActivePlayers.
    card.type.setupPendingState(this.game);
  }

  draw(): void {
      if (!this.isAlive) throw new Error("Dead player cannot draw");

      const cardData = this.game.piles.drawCardFromPile();
      if (!cardData) throw new Error("No cards left to draw");

      this.addCard(cardData);

      if (cardData.name === EXPLODING_KITTEN.name) {
          const hasDefuse = this.hasCard(DEFUSE.name);
          if (hasDefuse) {
              this.game.turnManager.setStage('defuseExplodingKitten');
          } else {
              this.eliminate();
              this.game.turnManager.endTurn();
          }
      } else {
          this.game.turnManager.endTurn();
      }
  }

  defuseExplodingKitten(insertIndex: number): void {
      if (insertIndex < 0 || insertIndex > this.game.piles.drawPileSize) {
          throw new Error('Invalid insert index');
      }

      const defuseCard = this.removeCard(DEFUSE.name);
      const kittenCard = this.removeCard(EXPLODING_KITTEN.name);

      if (!defuseCard || !kittenCard) {
          // Should not happen if UI is correct, but safer to eliminate
          this.eliminate();
          this.game.turnManager.endStage();
          this.game.turnManager.endTurn();
          return;
      }

      this.game.piles.discardCard(defuseCard);
      this.game.piles.insertCardIntoDrawPile(kittenCard, insertIndex);
      
      this.game.turnManager.endStage();
      this.game.turnManager.endTurn();
  }

  stealRandomCardFrom(target: Player): ICard {
      const count = target.getCardCount();
      if (count === 0) throw new Error("Target has no cards");
      
      // Use game context random
      const index = Math.floor(this.game.context.random.Number() * count);
      // Give card from target to this player
      return target.giveCard(index, this);
  }

  private _updateClientState() {
     if (this._state.client) {
         this._state.client.handCount = this._state.hand.length;
     }
  }
}
