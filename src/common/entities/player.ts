import {ICard, IPlayer} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {EXPLODING_KITTEN, DEFUSE} from "../registries/card-registry";
import {DEFUSE_EXPLODING_KITTEN} from "../constants/stages";
import {PlayerID} from "boardgame.io";
import {NAME_NOPE} from "../constants/cards";

export class Player {
  constructor(
    private game: TheGame,
    private _state: IPlayer,
    public readonly id: PlayerID
  ) {}

  /**
   * Get the player's hand of card-types
   */
  get hand(): Card[] {
    return this._state.hand.map(c => new Card(this.game, c));
  }

  /**
   * Check if player is alive in game terms (not eliminated)
   */
  get isAlive(): boolean {
    return this._state.isAlive;
  }

  /**
   * Get the count of card-types in hand
   */
  get cardCount(): number {
    return this._state.hand.length;
  }

  get canNope(): boolean {
    if (!this.hand.some(c => c.name === NAME_NOPE)) {
      return false;
    }
    if (!this.game.pendingCardPlay) {
      return false;
    }

    const pending = this.game.pendingCardPlay;

    // Player cannot nope their own card play if it hasn't been noped yet
    // If it HAS been noped, they can re-nope (un-nope) it, unless they were the last person to nope it
    if (!pending.isNoped && pending.playedBy === this.id) {
      return false;
    }

    // Player cannot nope their own nope card (cannot double-nope themselves immediately)
    if (pending.lastNopeBy === this.id) {
      return false;
    }

    // Check expiration
    // Note: Date.now() on client might differ from server, but usually this is acceptable for UI state
    return Date.now() <= pending.expiresAtMs;
  }

  /**
   * Check if the player has at least one card of the given type
   */
  hasCard(cardName: string): boolean {
    return this._state.hand.some(c => c.name === cardName);
  }

  findCardIndex(cardName: string): number {
    return this._state.hand.findIndex(c => c.name === cardName);
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
   * Add a card to the player's hand
   */
  addCard(card: Card | ICard): void {
    const cardData: ICard = {name: card.name, index: card.index};

    // Clone to avoid Proxy issues
    this._state.hand.push({...cardData});
    this._updateClientState();
  }

  /**
   * Remove a card at a specific index
   * @returns The removed card, or undefined if index invalid
   */
  removeCardAt(index: number): Card | undefined {
    if (index < 0 || index >= this._state.hand.length) return undefined;
    const [card] = this._state.hand.splice(index, 1);
    this._updateClientState();
    return new Card(this.game, card);
  }

  /**
   * Remove the first occurrence of a specific card type
   * @returns The removed card, or undefined if not found
   */
  removeCard(cardName: string): Card | undefined {
    const index = this._state.hand.findIndex(c => c.name === cardName);
    if (index === -1) return undefined;
    return this.removeCardAt(index);
  }

  /**
   * Remove all card-types of a specific type
   * @returns Array of removed card-types
   */
  removeAllCards(cardName: string): Card[] {
    const removed: Card[] = [];
    // Iterate backwards to safely remove
    for (let i = this._state.hand.length - 1; i >= 0; i--) {
      if (this._state.hand[i].name === cardName) {
        const [card] = this._state.hand.splice(i, 1);
        removed.push(new Card(this.game, card));
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
  removeAllCardsFromHand(): Card[] {
    const removed = [...this._state.hand];
    this._state.hand = [];
    this._updateClientState();
    return removed.map(c => new Card(this.game, c));
  }

  eliminate(): void {
    this._state.isAlive = false;
    // put all hand card-types in discard pile
    this._state.hand.forEach(card => this.game.piles.discardCard(card));
  }

  /**
   * Transfers a card at specific index to another playerWrapper
   */
  giveCard(cardIndex: number, recipient: Player): Card {
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

    const card = this.hand[cardIndex];
    
    if (!card.type.canBePlayed(this.game, card)) {
       throw new Error(`Card cannot be played: ${card.name}`);
    }

    // Remove card from hand
    const playedCard = this.removeCardAt(cardIndex);
    if (!playedCard) return; // Should not happen

    this.game.piles.discardCard(playedCard);
    card.afterPlay();

    if (card.type.isNowCard()) {
       card.play();
       return;
    }

    // Setup pending state
    const startedAtMs = Date.now();
    this.game.pendingCardPlay = {
        card: {...playedCard.data},
        playedBy: this.id,
        startedAtMs, 
        expiresAtMs: startedAtMs + (this.game.gameRules.pendingTimerMs || 5000),
        lastNopeBy: null,
        nopeCount: 0,
        isNoped: false
    };

    card.type.setupPendingState(this.game);
  }

  draw(): void {
      if (!this.isAlive) throw new Error("Dead player cannot draw");

      const cardData = this.game.piles.drawCard();
      if (!cardData) throw new Error("No cards left to draw");

      this.addCard(cardData);

      if (cardData.name === EXPLODING_KITTEN.name) {
          const hasDefuse = this.hasCard(DEFUSE.name);
          if (hasDefuse) {
              this.game.turnManager.setStage(DEFUSE_EXPLODING_KITTEN);
          } else {
              this.eliminate();
              this.game.turnManager.endTurn();
          }
      } else {
          this.game.turnManager.endTurn();
      }
  }

  defuseExplodingKitten(insertIndex: number): void {
      if (insertIndex < 0 || insertIndex > this.game.piles.drawPile.size) {
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
      this.game.piles.drawPile.insertCard(kittenCard, insertIndex);
      
      this.game.turnManager.endStage();
      this.game.turnManager.endTurn();
  }

  stealRandomCardFrom(target: Player): Card {
      const count = target.cardCount;
      if (count === 0) throw new Error("Target has no cards");
      
      // Use game context random
      const index = Math.floor(this.game.random.Number() * count);
      // Give card from target to this player
      return target.giveCard(index, this);
  }

  private _updateClientState() {
     if (this._state.client) {
         this._state.client.handCount = this._state.hand.length;
     }
  }
}
