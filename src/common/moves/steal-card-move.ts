import type {FnContext, Player} from "../models";
import type {PlayerID} from "boardgame.io";

export const stealCard = (context: FnContext, targetPlayerId: PlayerID) => {
  const {player, ctx, events, random} = context;

  // Can't steal from yourself
  if (targetPlayerId === ctx.currentPlayer) {
    console.error('Cannot steal from yourself');
    return;
  }

  const currentPlayerData: Player = player.get();
  const targetPlayerData: Player = player.state[targetPlayerId];

  // Check if target player exists and is alive
  if (!targetPlayerData || !targetPlayerData.isAlive) {
    console.error('Invalid target player');
    return;
  }

  // Check if target has any cards
  if (targetPlayerData.hand.length === 0) {
    console.log('Target player has no cards');
    events.endStage();
    return;
  }

  // Pick a random card from target player using boardgame.io's random API
  const randomIndex = random.Die(targetPlayerData.hand.length) - 1;
  const stolenCard = targetPlayerData.hand[randomIndex];

  // Remove card from target player
  const newTargetHand = targetPlayerData.hand.filter((_, idx) => idx !== randomIndex);

  // Update target player state through the player plugin
  player.state[targetPlayerId] = {
    ...targetPlayerData,
    hand: newTargetHand,
    hand_count: newTargetHand.length,
  };

  // Add card to current player
  player.set({
    ...currentPlayerData,
    hand: [...currentPlayerData.hand, stolenCard],
  });

  // End the stage
  events.endStage();
};

