import {IContext, IGameState} from '../models';
import {Piles} from './piles';
import {Players} from './players';
import {TurnManager} from './turn-manager';
import {IPendingCardPlay, IGameRules} from '../models';
import {Card} from "./card";
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";
import {EventsAPI} from "boardgame.io/dist/types/src/plugins/events/events";


export class TheGame {
  public readonly context: IContext;
  public readonly gameState: IGameState;
  public readonly events: EventsAPI;
  public readonly random: RandomAPI;

  public readonly piles: Piles;
  public readonly players: Players;
  public readonly turnManager: TurnManager;

  constructor(context: IContext) {
    this.context = context;
    this.gameState = context.G;
    this.events = context.events;
    this.random = context.random;

    this.piles = new Piles(this, this.gameState.piles);
    this.players = new Players(this, this.context.player);
    this.turnManager = new TurnManager(this);
  }


  /**
   * Get pending card play
   */
  get pendingCardPlay(): IPendingCardPlay | null {
    return this.gameState.pendingCardPlay;
  }

  set pendingCardPlay(pending: IPendingCardPlay | null) {
    this.gameState.pendingCardPlay = pending;
  }

  set lobbyReady(ready: boolean) {
    this.gameState.lobbyReady = ready;
  }

  get gameRules(): IGameRules {
    return this.gameState.gameRules;
  }

  /**
   * Resolve any pending card play if the window (timer) has expired.
   */
  resolvePendingCard(): void {
    const pendingCardPlay = this.pendingCardPlay;

    if (!pendingCardPlay) {
      return;
    }

    // Check if the timer has expired
    if (Date.now() < pendingCardPlay.expiresAtMs) {
      return;
    }

    this.pendingCardPlay = null;

    const card = new Card(this, pendingCardPlay.card);
    card.type.cleanupPendingState(this);

    if (!pendingCardPlay.isNoped) {
      card.play();
    }
  }
}
