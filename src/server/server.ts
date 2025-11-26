import { Server, Origins } from 'boardgame.io/dist/cjs/server.js';
import { ExplodingKittens } from '../common/game';

const port = parseInt(process.env.SERVER_PORT || '8000');

let origins: string | string[] | boolean | RegExp = Origins.LOCALHOST_IN_DEVELOPMENT;
if (process.env.SERVER_ORIGINS) {
  origins = process.env.SERVER_ORIGINS.split(',');
}

const server = Server({
  games: [ExplodingKittens],
  origins,
});

server.run(port);

