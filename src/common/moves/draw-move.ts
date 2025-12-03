import type {Card, GameState, Player} from "../models";
import {EXPLODING_KITTEN} from "../constants/card-types";

export const drawCard = ({ G, player, events }: { G: GameState; player: any; events: any }) => {
    const cardToDraw = G.drawPile.pop();
    if (!cardToDraw) {
        throw new Error('No card to draw');
    }

    const playerData: Player = player.get();
    let alive: boolean = playerData.isAlive;

    if (!alive) {
        throw new Error('Dead player cannot draw cards');
    }
    let newHand: Card[]
    const discardPile = G.discardPile;

    // Handle drawing an exploding kitten
    if (cardToDraw.name === EXPLODING_KITTEN.name) {
        alive = false;
        newHand = []
        // push all hand cards to discard pile
        discardPile.push(...playerData.hand, cardToDraw);
    } else {
        newHand = playerData.hand.map((card: any) => ({ ...card }));
        newHand.push({ ...cardToDraw });
    }

    player.set({
        ...playerData,
        hand: newHand,
        hand_count: newHand.length,
        isAlive: alive,
    });

    events.endTurn();
}
