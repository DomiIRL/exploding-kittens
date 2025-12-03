import type {GameState, Card} from "../models";

export const playCard = ({ G, player }: { G: GameState; player: any }, cardIndex: number) => {
    const playerData = player.get();

    if (cardIndex < 0 || cardIndex >= playerData.hand.length) {
        console.error('Invalid card index:', cardIndex);
        return;
    }

    const cardToPlay = playerData.hand[cardIndex];

    const newHand = playerData.hand.filter((_: Card, index: number) => index !== cardIndex);

    player.set({
        ...playerData,
        hand: newHand,
        hand_count: newHand.length
    });

    G.discardPile.push(cardToPlay);

    // TODO: Implement card-specific logic
}