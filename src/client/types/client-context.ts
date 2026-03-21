import type { BoardProps } from 'boardgame.io/react';
import type { IBoardPlugins } from '../models/client.model';
import {IContext, IGameState} from "../../common";

export type IClientContext =
  Pick<IContext, 'G' | 'ctx' | 'playerID'> &
  Pick<BoardProps<IGameState>, 'moves' | 'chatMessages' | 'sendChatMessage'> & {
  plugins: IBoardPlugins;
};
