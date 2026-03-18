import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";

export class NopeCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  isNowCard(_context: FnContext, _card: Card): boolean {
    return true;
  }

  canBePlayed(context: FnContext, _card: Card): boolean {
    const {G, playerID} = context;
    const pendingCardPlay = G.pendingCardPlay;

    if (!playerID) {
      console.error("No playerID in context");
      return false;
    }

    if (!pendingCardPlay) {
      console.log("No pending card play to nope");
      return false;
    }

    if ((!pendingCardPlay.isNoped && pendingCardPlay.playedBy === playerID) || pendingCardPlay.lastNopeBy === playerID) {
      console.log("Player cannot nope their own card play or their nope card");
      return false;
    }

    if (Date.now() > pendingCardPlay.expiresAtMs) {
      console.log("Pending card play has already expired");
      return false;
    }

    return true;

  }

  onPlayed(context: FnContext, _card: Card): void {
    const {G, playerID} = context;

    if (!playerID) {
      console.error("No playerID in context");
      return;
    }

    const pendingCardPlay = G.pendingCardPlay;
    if (!pendingCardPlay) {
      console.log("No pending card play to nope");
      return;
    }

    const nowMs = Date.now();
    const windowDurationMs = Math.max(0, pendingCardPlay.expiresAtMs - pendingCardPlay.startedAtMs);

    pendingCardPlay.lastNopeBy = playerID;
    pendingCardPlay.nopeCount = (pendingCardPlay.nopeCount || 0) + 1;
    pendingCardPlay.startedAtMs = nowMs;
    pendingCardPlay.expiresAtMs = nowMs + windowDurationMs;
    pendingCardPlay.isNoped = !pendingCardPlay.isNoped;
  }

  sortOrder(): number {
    return 6;
  }
}
