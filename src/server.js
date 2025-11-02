const { Server, Origins } = require('boardgame.io/server');
const { ExplodingKittens } = require('./Game');

const server = Server({
  games: [ExplodingKittens],
  origins: [Origins.LOCALHOST],
});

server.run(8000);
