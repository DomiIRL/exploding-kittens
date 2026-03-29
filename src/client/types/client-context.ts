import type { BoardProps } from 'boardgame.io/react';
import type { IBoardPlugins } from '../models/client.model';
import { IGameState, IPlayerAPI } from '../../common';

export type IClientContext = BoardProps<IGameState> & {
  plugins: IBoardPlugins;
  player: IPlayerAPI;
};
