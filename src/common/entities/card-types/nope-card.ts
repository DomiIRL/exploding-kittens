import {CardType} from '../card-type';
import {TheGame} from '../game';
import {Card} from '../card';

export class NopeCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  isNowCard(): boolean {
    return true;
  }

  canBePlayed(game: TheGame, _card: Card): boolean {
    return game.players.actingPlayer.canNope
  }

  onPlayed(game: TheGame, _card: Card) {
    const pendingCardPlay = game.piles.pendingCard;
    const player = game.players.actingPlayer;

    if (!pendingCardPlay) {
      console.log("No pending card play to nope");
      return;
    }


    const nowMs = Date.now();
    const windowDurationMs = Math.max(0, pendingCardPlay.expiresAtMs - pendingCardPlay.startedAtMs);

    pendingCardPlay.lastNopeBy = player.id;
    pendingCardPlay.nopeCount = (pendingCardPlay.nopeCount || 0) + 1;
    pendingCardPlay.startedAtMs = nowMs;
    pendingCardPlay.expiresAtMs = nowMs + windowDurationMs;
    pendingCardPlay.isNoped = !pendingCardPlay.isNoped;
  }

  sortOrder(): number {
    return 6;
  }
}
