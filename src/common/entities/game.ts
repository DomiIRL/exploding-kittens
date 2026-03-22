import {IContext, IGameState, IPlayerAPI, IPlayers} from '../models';
import {Piles} from './piles';
import {Players} from './players';
import {TurnManager} from './turn-manager';
import {IGameRules} from '../models';
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";
import {EventsAPI} from "boardgame.io/dist/types/src/plugins/events/events";
import {Ctx} from "boardgame.io";
import {GAME_OVER, LOBBY, PLAY} from "../constants/phases";


export class TheGame {
  public readonly context: IContext;
  protected readonly gameState: IGameState;
  protected readonly bgContext: Ctx;
  public readonly events: EventsAPI;
  public readonly random: RandomAPI;

  public readonly piles: Piles;
  public readonly players: Players;
  public readonly turnManager: TurnManager;

  constructor(context: IContext) {
    this.context = context;
    this.gameState = context.G;
    this.bgContext = context.ctx;
    this.events = context.events;
    this.random = context.random;

    this.piles = new Piles(this, this.gameState.piles);
    this.players = new Players(
      this,
      this.gameState,
      this.context.player.state ?? (this.context.player as IPlayerAPI & { data: { players: IPlayers } }).data.players
    );
    this.turnManager = new TurnManager(this.context);
  }

  get phase(): string {
    return this.bgContext.phase;
  }

  isLobbyPhase(): boolean {
    return this.phase === LOBBY;
  }

  isPlayingPhase(): boolean {
    return this.phase === PLAY;
  }

  isGameOver(): boolean {
    return this.bgContext.phase === GAME_OVER;
  }

  get gameRules(): IGameRules {
    return this.gameState.gameRules;
  }
}
