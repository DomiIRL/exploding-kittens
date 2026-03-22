import {ICard, Player, TheGame} from '../../common';
import { IContext } from '../../common';
import {PlayerID} from "boardgame.io";
import {Card} from "../../common/entities/card.ts";
import {NAME_NOPE} from "../../common/constants/cards.ts";

export class TheGameClient extends TheGame {
  public readonly moves: Record<string, (...args: any[]) => void>;
  public readonly matchID: string;
  public readonly playerID: string | null;
  public readonly matchData: any;
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
    this.playerID = playerID;
    this.matchData = matchData;
    this.sendChatMessage = sendChatMessage;
    this.chatMessages = chatMessages;
    this.isMultiplayer = isMultiplayer;
  }

  get isSpectator(): boolean {
    return this.playerID === null;
  }

  get selfPlayerId(): PlayerID | null {
    return this.isSpectator ? null : this.playerID;
  }

  get selfPlayer(): Player | null {
    if (this.isSpectator) return null;
    return this.players.getPlayer(this.selfPlayerId!);
  }

  get isSelfCurrentPlayer(): boolean {
    return this.selfPlayerId === this.players.currentPlayer.id;
  }

  playDrawCard() {
    if (!this.isSpectator && this.moves.drawCard) {
      this.moves.drawCard();
    }
  }

  playCard(cardIndex: number) {
    if (this.selfPlayer && this.moves.playCard) {
      const cardAt = this.selfPlayer.getCardAt(cardIndex);
      if (!cardAt) {
        console.error(`No card at index ${cardIndex} in player's hand`);
        return;
      }
      if (!cardAt.canPlay()) {
        console.error(`Card ${cardAt.name} at index ${cardIndex} cannot be played right now`);
        return;
      }
      this.moves.playCard(cardIndex);
    }
  }

  playNope() {
    if (this.selfPlayer?.canNope && this.piles.pendingCard && this.moves.playNowCard) {
      this.moves.playNowCard(this.selfPlayer?.findCardIndex(NAME_NOPE))
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

