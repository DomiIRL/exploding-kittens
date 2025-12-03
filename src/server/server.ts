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

server.run(port);
