import type {FnContext, Player} from "../models";
import type {PlayerID} from "boardgame.io";

export const stealCard = (context: FnContext, targetPlayerId: PlayerID) => {
  const {player, ctx, events, random} = context;

  // Can't steal from yourself
  if (targetPlayerId === ctx.currentPlayer) {
    throw Error('Cannot steal from yourself');
  }

  const currentPlayerData: Player = player.get();
  const targetPlayerData: Player = player.state[targetPlayerId];

  // Check if target player exists and is alive
  if (!targetPlayerData || !targetPlayerData.isAlive) {
    throw Error('Target player does not exist or is dead');
  }

  // Check if target has any cards
  if (targetPlayerData.hand.length === 0) {
    throw Error('Target player has no cards');
  }

  // Pick a random card from target player
  const randomIndex = random.Die(targetPlayerData.hand.length) - 1;
  const stolenCard = targetPlayerData.hand[randomIndex];

  const newTargetHand = targetPlayerData.hand.filter((_, idx) => idx !== randomIndex);

  player.state[targetPlayerId] = {
    ...targetPlayerData,
    hand: newTargetHand,
    hand_count: newTargetHand.length,
  };

  player.set({
    ...currentPlayerData,
    hand: [...currentPlayerData.hand, stolenCard],
  });

  events.endStage();
};

