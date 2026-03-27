import {ICard, IPlayer} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {EXPLODING_KITTEN, DEFUSE} from "../registries/card-registry";
import {CHOOSE_PLAYER_TO_REQUEST_FROM, DEFUSE_EXPLODING_KITTEN} from "../constants/stages";
import {PlayerID} from "boardgame.io";
import {NAME_NOPE} from "../constants/cards";

export class Player {
  constructor(
    private game: TheGame,
    public _state: IPlayer,
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
  get handSize(): number {
    return this._state.handSize;
  }

  get isCurrentPlayer(): boolean {
    return this.game.players.currentPlayerId === this.id;
  }

  get isActingPlayer(): boolean {
    return this.game.players.actingPlayer.id === this.id;
  }

  get isValidCardTarget(): boolean {
    return this.isAlive && this.handSize > 0;
  }

  get canNope(): boolean {
    if (!this.hand.some(c => c.name === NAME_NOPE)) {
      return false;
    }
    if (!this.game.piles.pendingCard) {
      return false;
    }

    const pending = this.game.piles.pendingCard;

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

  canGiveCard(): boolean {
    return this.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM);
  }

  canSelectPlayer(): boolean {
    return this.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM)
      || this.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM);
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

  getCardAt(index: number): Card | null {
    if (index < 0 || index >= this._state.hand.length) return null;
    return new Card(this.game, this._state.hand[index]);
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
    this.updateHandSize();
  }

  /**
   * Remove a card at a specific index
   * @returns The removed card, or undefined if index invalid
   */
  removeCardAt(index: number): Card | undefined {
    if (index < 0 || index >= this._state.hand.length) return undefined;
    const [card] = this._state.hand.splice(index, 1);
    this.updateHandSize();
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
      this.updateHandSize();
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
    this.updateHandSize();
    return removed.map(c => new Card(this.game, c));
  }

  eliminate(): void {
    this._state.isAlive = false;
    // put all hand card-types in discard pile
    this._state.hand.forEach(card => this.game.piles.discardCard(card));
    if (this.isActingPlayer) {
      this.game.turnManager.endStage(); // could also involve other players but better than being stuck
    }
    if (this.isCurrentPlayer) {
      this.game.turnManager.endTurn();
    }
  }

  isInStage(stage: string): boolean {
    return this.game.turnManager.isInStage(this, stage);
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

    if (!this.game.piles.canCardBePlayed(card)) {
      throw new Error(`Cannot play card: ${card.name}`);
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
    this.game.piles.pendingCard = {
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
    if (!cardData) {
      console.error("Draw pile is empty, cannot draw");
      this.eliminate();
      return;
    }

    this.addCard(cardData);
    this.game.animationsQueue.enqueue(cardData, this.game.piles.drawPile, this);

    if (cardData.name !== EXPLODING_KITTEN.name) {
      this.game.turnManager.endTurn();
      return;
    }

    if (!this.hasCard(DEFUSE.name)) {
      this.eliminate();
      return;
    }

    if (this.game.piles.drawPile.size <= 0) {
      this.defuseExplodingKitten(0); // if no cards left, just put it back on top since it doesn't matter
      return;
    }
    this.game.turnManager.setStage(DEFUSE_EXPLODING_KITTEN);
  }

  defuseExplodingKitten(insertIndex: number): void {
    const drawPile = this.game.piles.drawPile;

    if (insertIndex < 0 || insertIndex > drawPile.size) {
      throw new Error('Invalid insert index');
    }

    const defuseCard = this.removeCard(DEFUSE.name);
    const kittenCard = this.removeCard(EXPLODING_KITTEN.name);

    if (!defuseCard || !kittenCard) {
      // Should not happen if UI is correct, but safer to eliminate
      this.eliminate();
      return;
    }

    const discardPile = this.game.piles.discardPile;
    discardPile.addCard(defuseCard);
    this.game.animationsQueue.enqueue(defuseCard, this, discardPile)
    drawPile.insertCard(kittenCard, insertIndex);
    this.game.animationsQueue.enqueue(kittenCard, this, drawPile)

    this.game.turnManager.endStage();
    this.game.turnManager.endTurn();
  }

  stealRandomCardFrom(target: Player): Card {
    const count = target.handSize;
    if (count === 0) throw new Error("Target has no cards");

    // Use game context random
    const index = Math.floor(this.game.random.Number() * count);
    // Give card from target to this player
    return target.giveCard(index, this);
  }

  private updateHandSize() {
    this._state.handSize = this._state.hand.length;
  }
}
