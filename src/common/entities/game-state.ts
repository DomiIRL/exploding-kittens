import {IPendingCardPlay, IGameRules} from '../models';
import {Game} from "./game";

export class GameState {
  constructor(private game: Game) {}

  /**
   * Get pending card play
   */
  get pendingCardPlay(): IPendingCardPlay | null {
    return this.game.context.G.pendingCardPlay;
  }

  set pendingCardPlay(pending: IPendingCardPlay | null) {
    this.game.context.G.pendingCardPlay = pending;
  }

  set lobbyReady(ready: boolean) {
    this.game.context.G.lobbyReady = ready;
  }

  get gameRules(): IGameRules {
    return this.game.context.G.gameRules;
  }
}

