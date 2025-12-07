import type {FnContext, Player} from "../models";
import type {PlayerID} from "boardgame.io";

/**
 * Validates that a target player can be selected for card transfer
 */
export function validateTargetPlayer(
  context: FnContext,
  targetPlayerId: PlayerID
): Player {
  const {player, ctx} = context;

  // Can't target yourself
  if (targetPlayerId === ctx.currentPlayer) {
    throw Error('Cannot target yourself');
  }

  const targetPlayerData: Player = player.state[targetPlayerId];

  // Check if target player exists and is alive
  if (!targetPlayerData || !targetPlayerData.isAlive) {
    throw Error('Target player does not exist or is dead');
  }

  // Check if target has any cards
  if (targetPlayerData.hand.length === 0) {
    throw Error('Target player has no cards');
  }

  return targetPlayerData;
}

/**
 * Transfers a card from one player to another
 */
export function transferCard(
  context: FnContext,
  fromPlayerId: PlayerID,
  toPlayerId: PlayerID,
  cardIndex: number
): void {
  const {player} = context;

  const fromPlayerData = player.state[fromPlayerId];
  const toPlayerData = player.state[toPlayerId];

  // Validate card index
  if (cardIndex < 0 || cardIndex >= fromPlayerData.hand.length) {
    throw Error('Invalid card index');
  }

  // Get the card to transfer
  const card = fromPlayerData.hand[cardIndex];

  // Remove card from source player's hand
  const newFromHand = fromPlayerData.hand.filter((_, idx) => idx !== cardIndex);

  // Update source player
  player.state[fromPlayerId] = {
    ...fromPlayerData,
    hand: newFromHand,
    hand_count: newFromHand.length,
  };

  // Add card to destination player's hand
  const newToHand = [...toPlayerData.hand, card];

  player.state[toPlayerId] = {
    ...toPlayerData,
    hand: newToHand,
    hand_count: newToHand.length,
  };
}

