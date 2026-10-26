import {createReadStream, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import serve from 'koa-static';
import {Origins, Server} from 'boardgame.io/dist/cjs/server.js';
import {ExplodingKittens} from '../common';

const port = parseInt(process.env.SERVER_PORT || '51399');
// Compiled to dist/server/server/, next to the client build in dist/client/.
const clientDir = process.env.CLIENT_DIR || resolve(__dirname, '../../client');

let origins: string | string[] | boolean | RegExp = Origins.LOCALHOST_IN_DEVELOPMENT;

if (process.env.NODE_ENV === 'production') {
  if (process.env.SERVER_ORIGINS) {
    if (process.env.SERVER_ORIGINS === '*') {
      origins = true;
    } else {
      origins = process.env.SERVER_ORIGINS.split(',');
    }
  }
} else {
  // Always allow all origins in development
  origins = true;
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

if (existsSync(clientDir)) {
  // Match links are /<matchID>; the client reads the ID from the path, so unknown paths get the app.
  server.app.use(async (ctx, next) => {
    await next();
    if (ctx.method === 'GET' && ctx.status === 404 && ctx.body == null && !ctx.path.startsWith('/games') && !ctx.path.includes('.')) {
      ctx.type = 'html';
      ctx.body = createReadStream(resolve(clientDir, 'index.html'));
    }
  });
  server.app.use(serve(clientDir));
}

server.run(port, () => {
  console.log(`🎮 Exploding Kittens server running on port ${port}`);
  console.log(`🌐 Lobby API enabled at http://localhost:${port}/games`);
  console.log(`📡 Server environment: ${process.env.NODE_ENV || 'development'}`);
});
