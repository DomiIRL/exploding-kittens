import {CardType} from '../card-type';
import {ICard, IContext} from "../../models";
import {validateNope} from '../../utils/action-validation';
import {Game} from '../game';

export class NopeCard extends CardType {

  constructor(name: string) {
    super(name);
  }

  isNowCard(_context: IContext, _card: ICard): boolean {
    return true;
  }

  canBePlayed(context: IContext, _card: ICard): boolean {
    const {G, playerID} = context;
    return validateNope(G, playerID);
  }

  onPlayed(context: IContext, _card: ICard): void {
    const game = new Game(context);
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
