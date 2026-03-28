import {IPlayer} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {EXPLODING_KITTEN, DEFUSE} from "../registries/card-registry";
import {CHOOSE_PLAYER_TO_REQUEST_FROM, DEFUSE_EXPLODING_KITTEN} from "../constants/stages";
import {PlayerID} from "boardgame.io";
import {NAME_NOPE} from "../constants/cards";
import {CardList} from "./card-list";

export class Player extends CardList {
  constructor(
    game: TheGame,
    public _state: IPlayer,
    public readonly id: PlayerID
  ) {
    super(
      game,
      () => _state.hand,
      (cards) => { _state.hand = cards; },
      () => { _state.handSize = _state.hand.length; }
    );
  }

  /**
   * Get the player's hand of card-types
   */
  get hand(): Card[] {
    return this.cards;
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

  eliminate(): void {
    this._state.isAlive = false;
    // put all hand card-types in discard pile
    const cards = this.removeAllCardsFromList();
    cards.forEach(card => this.game.piles.discardCard(card));
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
    const card = this.getCardAt(cardIndex);
    if (!card) {
      throw new Error("Card not found or invalid index");
    }
    card.moveTo(recipient);
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

    const cardData = {...card.data}; // save before moveTo

    // Move to discard
    card.moveTo(this.game.piles.discardPile);
    
    card.afterPlay();

    if (card.type.isNowCard()) {
      card.play();
      return;
    }

    // Setup pending state
    const startedAtMs = Date.now();
    this.game.piles.pendingCard = {
      card: cardData,
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

    const cards = this.game.piles.drawPile.allCards;
    if (cards.length === 0) {
      console.error("Draw pile is empty, cannot draw");
      this.eliminate();
      return;
    }
    const card = cards[0];

    const explodingKittenDrawn = card.name === EXPLODING_KITTEN.name;

    card.moveTo(this, { visibleTo: explodingKittenDrawn ? [] : [this.id] });

    if (!explodingKittenDrawn) {
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

    // We can't just removeCard anymore, we need the Card object to move it
    const defuseCardIdx = this.findCardIndex(DEFUSE.name);
    const kittenCardIdx = this.findCardIndex(EXPLODING_KITTEN.name);

    if (defuseCardIdx === -1 || kittenCardIdx === -1) {
      // Should not happen if UI is correct, but safer to eliminate
      this.eliminate();
      return;
    }

    const defuseCard = this.hand[defuseCardIdx];
    const kittenCard = this.hand[kittenCardIdx];

    const discardPile = this.game.piles.discardPile;
    
    defuseCard.moveTo(discardPile);
    kittenCard.moveTo(drawPile, { insertIndex: insertIndex });

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
}
