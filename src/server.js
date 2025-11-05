const { Server, Origins } = require('boardgame.io/server');
const { ExplodingKittens } = require('./Game');

const port = parseInt(process.env.SERVER_PORT || '8000');
const origins = (process.env.SERVER_ORIGINS || 'http://localhost:1234').split(',');

const server = Server({
  games: [ExplodingKittens],
  origins: origins,
});

server.run(port);
