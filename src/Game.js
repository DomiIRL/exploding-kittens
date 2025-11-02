import { PluginPlayer } from 'boardgame.io/plugins';

const playerSetup = (playerID) => ({
  hand: [],
  hand_count: 0,
  isAlive: true,
});

const playerView = (players, playerID) => {
  const view = {};

  Object.entries(players).forEach(([id, pdata]) => {
    if (id === playerID) {
      view[id] = { ...pdata };
    } else {
      view[id] = {
        hand_count: pdata.hand_count,
        isAlive: pdata.isAlive,
      };
    }
  });

  return view;
};

export const ExplodingKittens = {
  name: 'ExplodingKittens',

  plugins: [
    PluginPlayer({
      setup: playerSetup,
      playerView: playerView,
    }),
  ],

  setup: ({ ctx, player }) => {
    const normalCards = [
      { name: 'Angriff', count: 4 },
      { name: 'Hops', count: 4 },
      { name: 'Mischen', count: 4 },
      { name: 'Wunsch', count: 4 },
      { name: 'Nö', count: 5 },
      { name: 'Blick in die Zukunft', count: 5 },
      { name: 'Baratze', count: 4 },
      { name: 'Regenbogen-Rülpsende Katze', count: 4 },
      { name: 'Tacocat', count: 4 },
      { name: 'Katzelone', count: 4 },
      { name: 'Behaarte Katze', count: 4 },
    ];

    let deck = [];
    normalCards.forEach((card) => {
      for (let i = 0; i < card.count; i++) {
        deck.push(card.name);
      }
    });

    deck.sort(() => Math.random() - 0.5);

    const startingHandSize = 7;

    ctx.playOrder.forEach((playerID) => {
      const hand = deck.splice(0, startingHandSize);
      player.state[playerID] = {
        hand,
        hand_count: hand.length,
        isAlive: true,
      };
    });

    ctx.playOrder.forEach((playerID) => {
      player.state[playerID].hand.push('Entschärfung');
      player.state[playerID].hand_count += 1;
    });

    const totalDefuse = 6;
    const remainingDefuse = Math.min(totalDefuse - ctx.playOrder.length, 2);
    for (let i = 0; i < remainingDefuse; i++) {
      deck.push('Entschärfung');
    }

    const explodingKittens = ctx.playOrder.length - 1;
    for (let i = 0; i < explodingKittens; i++) {
      deck.push('Exploding Kitten');
    }

    deck.sort(() => Math.random() - 0.5);

    return {
      deck,
      discardPile: [],
    };
  },

  turn: {
    minMoves: 1,
  },

  moves: {
  },
};
