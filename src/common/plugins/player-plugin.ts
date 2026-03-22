import {PluginPlayer} from 'boardgame.io/dist/cjs/plugins.js';
import {createPlayerState, filterPlayerView} from '../setup/player-setup';
import type {Ctx, Plugin} from 'boardgame.io';
import type {IContext, IGameState} from '../models';
import {TheGame} from "../entities/game";

export const createPlayerPlugin = (): Plugin => {
  const basePlugin = PluginPlayer({
    setup: createPlayerState,
  });

  // Wrap the playerView to access G from the State
  return {
    ...basePlugin,
    playerView: ({G, ctx, data, playerID}: {G: IGameState, data: any, ctx: Ctx, playerID?: string | null}) => {
      const context = {
        G,
        ctx,
        playerID: playerID,
      } as IContext;

      const game = new TheGame(context);
      game.setPlayers(data.players);

      // Use our custom filterPlayerView that has access to G
      const filteredPlayers = filterPlayerView(game);
      return { players: filteredPlayers };
    },
  };
};

