import {Origins, Server} from 'boardgame.io/dist/cjs/server.js';
import {ExplodingKittens} from '../common';

const port = parseInt(process.env.SERVER_PORT || '8000');

let origins: string | string[] | boolean | RegExp = Origins.LOCALHOST_IN_DEVELOPMENT;
if (process.env.SERVER_ORIGINS) {
  origins = process.env.SERVER_ORIGINS.split(',');
}

const server = Server({
  games: [ExplodingKittens as any],
  origins,
});

server.router.use('/games/:name', async (ctx, next) => {
  await next();

  if (ctx.method === 'GET' && ctx.body && ctx.body.matches) {
    ctx.body.matches = ctx.body.matches.filter((match: any) => {
      return match.players.some((player: any) => player.isConnected === true);
    });
  }
});

server.run(port, () => {
  console.log(`🎮 Exploding Kittens server running on port ${port}`);
  console.log(`🌐 Lobby API enabled at http://localhost:${port}/games`);
  console.log(`📡 Server environment: ${process.env.NODE_ENV || 'development'}`);
});