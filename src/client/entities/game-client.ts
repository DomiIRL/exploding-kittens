import { TheGame } from '../../common';
import { IContext } from '../../common';

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
}

