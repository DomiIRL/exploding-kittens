import type {GameState} from "../models";

export const drawCard = ({ G, player, events }: { G: GameState; player: any; events: any }) => {
    const cardToDraw = G.drawPile.pop();
    if (!cardToDraw) {
        throw new Error('No card to draw');
    }

    const playerData = player.get();

    const newHand = playerData.hand.map((card: any) => ({ ...card }));
    newHand.push({ ...cardToDraw });

    player.set({
        ...playerData,
        hand: newHand,
        hand_count: newHand.length
    });

    events.endTurn();
}