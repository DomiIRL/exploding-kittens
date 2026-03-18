import {FnContext} from '../models';
import {PlayerWrapper} from './player-wrapper';
import {DeckLogic} from './deck-logic';
import {GameStateLogic} from './game-state-logic';
import {PlayerLogic} from './player-logic';
import {Card} from '../models';
import {PendingCardPlay, GameRules} from '../models';

export class GameLogic {
  public readonly deck: DeckLogic;
  public readonly state: GameStateLogic;
  public readonly players: PlayerLogic;

  constructor(context: FnContext) {
    this.deck = new DeckLogic(context);
    this.state = new GameStateLogic(context);
    this.players = new PlayerLogic(context);
  }

  /**
   * Get a player wrapper instance for a specific player ID.
   * Throws if player data not found.
   */
  getPlayer(id: string): PlayerWrapper {
    return this.players.getPlayer(id);
  }

  /**
   * Get a wrapper for the current player based on context.currentPlayer
   */
  get currentPlayer(): PlayerWrapper {
    return this.players.currentPlayer;
  }

  /**
   * Get a wrapper for the player executing the move (if playerID available in context)
   * Falls back to currentPlayer if playerID not set
   */
  get actingPlayer(): PlayerWrapper {
    return this.players.actingPlayer;
  }

  /**
   * Get all players as wrappers
   */
  get allPlayers(): PlayerWrapper[] {
    return this.players.allPlayers;
  }

  /**
   * Get pending card play
   */
  get pendingCardPlay(): PendingCardPlay | null {
    return this.state.pendingCardPlay;
  }

  /**
   * Add a card to the discard pile
   */
  discardCard(card: Card): void {
    this.deck.discardCard(card);
  }

  /**
   * Get the last discarded card
   */
  get lastDiscardedCard(): Card | null {
    return this.deck.lastDiscardedCard;
  }

  /**
   * Draw a card from the top of the draw pile
   */
  drawCardFromPile(): Card | undefined {
    return this.deck.drawCardFromPile();
  }

  /**
   * Insert a card into the draw pile at a specific index
   */
  insertCardIntoDrawPile(card: Card, index: number): void {
    this.deck.insertCardIntoDrawPile(card, index);
  }

  /**
   * Get draw pile size
   */
  get drawPileSize(): number {
    return this.deck.drawPileSize;
  }

  set pendingCardPlay(pending: PendingCardPlay | null) {
    this.state.pendingCardPlay = pending;
  }

  set lobbyReady(ready: boolean) {
    this.state.lobbyReady = ready;
  }

  get gameRules(): GameRules {
    return this.state.gameRules;
  }

  /**
   * Validate if a player is a valid target for an action.
   * Checks if target is alive, has cards, and is not the current player.
   */
  validateTarget(targetPlayerId: string): PlayerWrapper {
    return this.players.validateTarget(targetPlayerId);
  }
}
