import {describe, expect, it} from 'vitest';
import {Client} from 'boardgame.io/client';
import {ExplodingKittens} from '../exploding-kittens';
import {REMOVE_PLAYER, withPlayerRemoval} from '../moves/remove-player-move';
import {actingPlayer} from '../../server/player-removal';

const game = withPlayerRemoval(ExplodingKittens as any, 'secret');

const startedGame = (numPlayers: number) => {
  const client = Client({game, numPlayers, playerID: '0'});
  client.start();
  client.moves.startGame();
  return client;
};

const state = (client: any) => client.store.getState();

const remove = (client: any, targetId: string, secret = 'secret') => {
  client.updatePlayerID(actingPlayer(state(client), targetId));
  client.moves[REMOVE_PLAYER](targetId, secret);
};

describe('removePlayer', () => {
  it('takes the current player out and passes the turn', () => {
    const client = startedGame(3);
    const current = state(client).ctx.currentPlayer;
    const handSize = state(client).plugins.player.data.players[current].hand.length;
    const discarded = state(client).G.piles.discardPile.cards.length;

    remove(client, current);

    const after = state(client);
    expect(after.G.deadPlayers).toContain(current);
    expect(after.ctx.currentPlayer).not.toBe(current);
    expect(after.G.piles.discardPile.cards.length).toBe(discarded + handSize);
  });

  it('takes out a player whose turn it is not', () => {
    const client = startedGame(3);
    const current = state(client).ctx.currentPlayer;
    const other = ['0', '1', '2'].find(id => id !== current)!;

    remove(client, other);

    expect(state(client).G.deadPlayers).toContain(other);
    expect(state(client).ctx.currentPlayer).toBe(current);
  });

  it('ignores a request without the secret', () => {
    const client = startedGame(3);
    const current = state(client).ctx.currentPlayer;

    remove(client, current, 'guess');

    expect(state(client).G.deadPlayers).toEqual([]);
  });

  it('ends the game when only one player is left', () => {
    const client = startedGame(3);
    const [first, second] = ['0', '1', '2'];
    remove(client, first);
    remove(client, second);

    expect(state(client).ctx.phase).not.toBe('play');
  });
});
