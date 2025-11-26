import {Ctx} from "boardgame.io";
import type { GameState } from "../data/GameState";

import { OriginalDeck } from "../data/decks/OriginalDeck";
import { dealHands } from "./playerSetup";
import {Card} from "../data/Card";
import {PlayerAPI} from "../data/PlayerAPI";

export const setupGame = ({ ctx, player }: { ctx: Ctx, player: PlayerAPI}): GameState => {
  const deck = new OriginalDeck();

  const pile: Card[] = shuffle(deck.buildBaseDeck());

  dealHands(pile, player.state, deck);

  deck.addPostDealCards(pile, Object.keys(ctx.playOrder).length);

  return {
    drawPile: shuffle(pile),
    discardPile: []
  };
};

const shuffle = <T>(arr: T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5);
