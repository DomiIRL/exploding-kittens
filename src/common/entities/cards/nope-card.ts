import {CardType} from '../card-type';
import {Card, FnContext} from "../../models";
import {validateNope} from '../../utils/action-validation';
import {GameLogic} from '../../wrappers/game-logic';

export class NopeCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  isNowCard(_context: FnContext, _card: Card): boolean {
    return true;
  }

  canBePlayed(context: FnContext, _card: Card): boolean {
    const {G, playerID} = context;
    return validateNope(G, playerID);
  }

  onPlayed(context: FnContext, _card: Card): void {
    const game = new GameLogic(context);
    const pendingCardPlay = game.pendingCardPlay;
    const player = game.actingPlayer;

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
