import {IContext, IGameState, IPlayers, ICard} from '../models';
import {Piles} from './piles';
import {Players} from './players';
import {TurnManager} from './turn-manager';
import {IGameRules} from '../models';
import {RandomAPI} from "boardgame.io/dist/types/src/plugins/random/random";
import {EventsAPI} from "boardgame.io/dist/types/src/plugins/events/events";
import {Ctx} from "boardgame.io";
import {GAME_OVER, LOBBY, PLAY} from "../constants/phases";
import {AnimationQueue} from "./animation-queue";


export class TheGame {
  public readonly context: IContext;
  protected readonly gameState: IGameState;
  protected readonly bgContext: Ctx;
  public readonly events: EventsAPI;
  public readonly random: RandomAPI;

  public readonly piles: Piles;
  public readonly turnManager: TurnManager;
  public players: Players;
  public animationsQueue: AnimationQueue;

  constructor(context: IContext) {
    this.context = context;
    this.gameState = context.G;
    this.bgContext = context.ctx;
    this.events = context.events;
    this.random = context.random;

    this.piles = new Piles(this, this.gameState.piles);
    this.turnManager = new TurnManager(this.context);
    this.animationsQueue = new AnimationQueue(this.gameState.animationsQueue);

    if (this.context?.player?.state) {
      this.players = new Players(this, this.gameState, this.context.player.state);
    } else {
      this.players = new Players(this, this.gameState, {});
    }
  }

  setPlayers(players: IPlayers) {
    this.players = new Players(this, this.gameState, players);
  }

  findAndRemoveCardById(id: number): { card: ICard, source: string } | null {
    for (const player of this.players.allPlayers) {
      const removed = player.removeCardById(id);
      if (removed) return { card: removed.data, source: player.id };
    }

    let removed = this.piles.drawPile.removeCardById(id);
    if (removed) return { card: removed.data, source: this.piles.drawPile.name };

    removed = this.piles.discardPile.removeCardById(id);
    if (removed) return { card: removed.data, source: this.piles.discardPile.name };

    // Assuming pending play might not be a source but keeping it clean
    return null;
  }

  generateCardId(): number {
    return this.gameState.nextCardId++;
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
