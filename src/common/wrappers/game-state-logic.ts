import {FnContext} from '../models';
import {PendingCardPlay, GameRules} from '../models';

export class GameStateLogic {
  constructor(private context: FnContext) {}

  /**
   * Get pending card play
   */
  get pendingCardPlay(): PendingCardPlay | null {
    return this.context.G.pendingCardPlay;
  }

  set pendingCardPlay(pending: PendingCardPlay | null) {
    this.context.G.pendingCardPlay = pending;
  }

  set lobbyReady(ready: boolean) {
    this.context.G.lobbyReady = ready;
  }

  get gameRules(): GameRules {
    return this.context.G.gameRules;
  }
}

