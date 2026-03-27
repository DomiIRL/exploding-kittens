import {ICard, IPendingCardPlay, IPiles} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {Pile} from "./pile";
import {DISCARD, DRAW} from "../constants/piles.ts";

export class Piles {
  constructor(private game: TheGame, private piles: IPiles) {
  }

  get drawPile(): Pile {
    return new Pile(DRAW, this.game, this.piles.drawPile);
  }

  set drawPile(pile: ICard[]) {
    this.piles.drawPile = { ...this.piles.drawPile, cards: pile, size: pile.length };
  }

  get discardPile(): Pile {
    return new Pile(DISCARD, this.game, this.piles.discardPile);
  }

  set discardPile(pile: ICard[]) {
    this.piles.discardPile = { ...this.piles.discardPile, cards: pile, size: pile.length };
  }

  /**
   * Add a card to the discard pile
   */
  discardCard(card: Card | ICard): void {
    this.discardPile.addCard(card);
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCard(): Card | null {
    return this.drawPile.drawCard();
  }

  canCardBePlayed(card: Card): boolean {
    if (this.game.piles.pendingCard && !card.type.isNowCard()) {
      return false;
    }

    return card.canPlay();
  }

  /**
   * Pending card logic
   */

  get pendingCard(): IPendingCardPlay | null {
    return this.piles.pendingCardPlay;
  }

  set pendingCard(pending: IPendingCardPlay | null) {
    this.piles.pendingCardPlay = pending;
  }

  /**
   * Resolve any pending card play if the time window has expired.
   */
  resolvePendingCard(): void {
    const pendingCardPlay = this.pendingCard;

    if (!pendingCardPlay) {
      return;
    }

    // Check if the timer has expired
    if (Date.now() < pendingCardPlay.expiresAtMs) {
      return;
    }

    this.pendingCard = null;

    const card = new Card(this.game, pendingCardPlay.card);
    card.type.cleanupPendingState(this.game);

    if (!pendingCardPlay.isNoped) {
      card.play();
    }
  }
}

