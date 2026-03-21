import {IContext} from '../models';
import {Player} from './player';
import {Piles} from './piles';
import {GameState} from './game-state';
import {Players} from './players';
import {ICard} from '../models';
import {IPendingCardPlay, IGameRules} from '../models';

export class Game {
  public readonly context: IContext;
  public readonly deck: Piles;
  public readonly state: GameState;
  public readonly players: Players;

  constructor(context: IContext) {
    this.context = context;
    this.deck = new Piles(this);
    this.state = new GameState(this);
    this.players = new Players(this);
  }

  /**
   * Get a player wrapper instance for a specific player ID.
   * Throws if player data not found.
   */
  getPlayer(id: string): Player {
    return this.players.getPlayer(id);
  }

  /**
   * Get a wrapper for the current player based on context.currentPlayer
   */
  get currentPlayer(): Player {
    return this.players.currentPlayer;
  }

  /**
   * Get a wrapper for the player executing the move (if playerID available in context)
   * Falls back to currentPlayer if playerID not set
   */
  get actingPlayer(): Player {
    return this.players.actingPlayer;
  }

  /**
   * Get all players as wrappers
   */
  get allPlayers(): Player[] {
    return this.players.allPlayers;
  }

  /**
   * Get pending card play
   */
  get pendingCardPlay(): IPendingCardPlay | null {
    return this.state.pendingCardPlay;
  }

  /**
   * Add a card to the discard pile
   */
  discardCard(card: ICard): void {
    this.deck.discardCard(card);
  }

  /**
   * Get the last discarded card
   */
  get lastDiscardedCard(): ICard | null {
    return this.deck.lastDiscardedCard;
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCardFromPile(): ICard | undefined {
    return this.deck.drawCardFromPile();
  }

  /**
   * Insert a card into the draw pile at a specific index
   */
  insertCardIntoDrawPile(card: ICard, index: number): void {
    this.deck.insertCardIntoDrawPile(card, index);
  }

  /**
   * Get draw pile size
   */
  get drawPileSize(): number {
    return this.deck.drawPileSize;
  }

  set pendingCardPlay(pending: IPendingCardPlay | null) {
    this.state.pendingCardPlay = pending;
  }

  set lobbyReady(ready: boolean) {
    this.state.lobbyReady = ready;
  }

  get gameRules(): IGameRules {
    return this.state.gameRules;
  }

  /**
   * Validate if a player is a valid target for an action.
   * Checks if target is alive, has card-types, and is not the current player.
   */
  validateTarget(targetPlayerId: string): Player {
    return this.players.validateTarget(targetPlayerId);
  }
}
