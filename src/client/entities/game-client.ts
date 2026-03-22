import {ICard, Player, TheGame} from '../../common';
import { IContext } from '../../common';
import {Card} from "../../common/entities/card.ts";
import {NAME_NOPE} from "../../common/constants/cards.ts";
import {
  CHOOSE_CARD_TO_GIVE,
  CHOOSE_PLAYER_TO_REQUEST_FROM,
  CHOOSE_PLAYER_TO_STEAL_FROM
} from "../../common/constants/stages.ts";
import {MatchPlayer} from "../utils/matchData.ts";
import {PlayerID} from "boardgame.io";

export class TheGameClient extends TheGame {
  public readonly moves: Record<string, (...args: any[]) => void>;
  public readonly matchID: string;
  public readonly selfPlayerId: string | null;
  public readonly matchData: MatchPlayer[];
  public readonly sendChatMessage: (message: string) => void;
  public readonly chatMessages: any[];
  public readonly isMultiplayer: boolean;

  constructor(
    context: IContext,
    moves: Record<string, (...args: any[]) => void>,
    matchID: string,
    playerID: string | null,
    matchData: any,
    sendChatMessage: (message: string) => void,
    chatMessages: any[],
    isMultiplayer: boolean
  ) {
    super(context);
    
    this.moves = moves;
    this.matchID = matchID;
    this.selfPlayerId = playerID;
    this.matchData = matchData;
    this.sendChatMessage = sendChatMessage;
    this.chatMessages = chatMessages;
    this.isMultiplayer = isMultiplayer;
  }

  get isSpectator(): boolean {
    return this.selfPlayerId === null;
  }

  get selfPlayer(): Player | null {
    if (!this.selfPlayerId) {
      return null;
    }
    return this.players.getPlayer(this.selfPlayerId);
  }

  get isSelfAlive(): boolean {
    const selfPlayer = this.selfPlayer;
    return !!selfPlayer && selfPlayer.isAlive;
  }

  get isSelfCurrentPlayer(): boolean {
    return this.selfPlayerId === this.players.currentPlayer.id;
  }

  isSelf(player: Player | PlayerID | MatchPlayer | null) {
    if (!this.selfPlayerId || !player) {
      return false;
    }
    const playerId = typeof player === 'string' ? player : player.id;
    return this.selfPlayerId === playerId;
  }

  playDrawCard() {
    if (this.selfPlayer && this.moves.drawCard) {
      this.moves.drawCard();
    }
  }

  selectCard(cardIndex: number) {
    if (!this.selfPlayer) {
      console.error("No self player found");
      return;
    }
    if (this.canGiveCard()) {
      this.giveCard(cardIndex);
    } else {
      this.playCard(cardIndex);
    }
  }

  canPlayCard(cardIndex: number): boolean {
    if (!this.isSelfCurrentPlayer) {
      return false;
    }
    const cardAt = this.selfPlayer?.getCardAt(cardIndex);
    if (!cardAt) {
      console.error(`No card at index ${cardIndex} in player's hand`);
      return false;
    }
    return this.piles.canCardBePlayed(cardAt);
  }

  playCard(cardIndex: number) {
    if (this.selfPlayer && this.moves.playCard) {
      const cardAt = this.selfPlayer.getCardAt(cardIndex);
      if (!cardAt) {
        console.error(`No card at index ${cardIndex} in player's hand`);
        return;
      }
      if (!this.canPlayCard(cardIndex)) {
        console.error(`Card ${cardAt.name} at index ${cardIndex} cannot be played right now`);
        return;
      }
      this.moves.playCard(cardIndex);
    }
  }

  playNope() {
    if (this.selfPlayer && this.selfPlayer.canNope && this.piles.pendingCard && this.moves.playCard) {
      const number = this.selfPlayer.findCardIndex(NAME_NOPE);
      this.moves.playCard(number)
    }
  }

  canGiveCard(): boolean {
    if (!this.selfPlayer) {
      return false;
    }
    return this.selfPlayer.isInStage(CHOOSE_CARD_TO_GIVE);
  }

  giveCard(cardIndex: number) {
    if (!this.selfPlayer) {
      console.error("No self player found");
      return;
    }

    if (!this.canGiveCard()) {
      console.error("Player cannot give a card right now");
      return;
    }

    if (this.moves.giveCard) {
      this.moves.giveCard(cardIndex);
    }
  }

  selectPlayer(player: Player) {
    if (!this.selfPlayer) {
      return false;
    }
    if (!this.selfPlayer.canSelectPlayer()) {
      console.error("Player cannot be selected right now");
      return false;
    }
    if (!player.isValidCardTarget) {
      return false;
    }
    if (this.selfPlayer.isInStage(CHOOSE_PLAYER_TO_STEAL_FROM) && this.moves.stealCard) {
      this.moves.stealCard(player.id);
    } else if (this.selfPlayer.isInStage(CHOOSE_PLAYER_TO_REQUEST_FROM) && this.moves.requestCard) {
      this.moves.requestCard(player.id);
    }
  }

  getDiscardCardTexture(): string {
    return TheGameClient.getCardTexture(this.piles.discardPile.topCard);
  }

  getCardTexture(card: Card | ICard | null): string {
    return TheGameClient.getCardTexture(card);
  }

  static getCardTexture(card: Card | ICard | null): string {
    if (!card) {
      return "/assets/cards/backside.png";
    }
    return `/assets/cards/${card.name}/${card.index}.png`;
  }
}

