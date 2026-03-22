import {ICard, IPendingCardPlay, IPiles} from '../models';
import {TheGame} from "./game";
import {Card} from "./card";
import {Pile} from "./pile";

export class Piles {
  constructor(private game: TheGame, public piles: IPiles) {
  }

  get drawPile(): Pile {
    return new Pile(this.game, this.piles.drawPile);
  }

  set drawPile(pile: ICard[]) {
    this.piles.drawPile = pile;
  }

  get discardPile(): Pile {
    return new Pile(this.game, this.piles.discardPile);
  }

  set discardPile(pile: ICard[]) {
    this.piles.discardPile = pile;
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

