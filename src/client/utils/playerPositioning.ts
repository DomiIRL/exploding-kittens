/**
 * Position calculation utilities for player positioning around the table
 */

export interface Position {
  top: string;
  left: string;
}

export interface CardPosition extends Position {
  angle: number;
}

export interface PlayerPositions {
  cardPosition: CardPosition;
  infoPosition: Position;
}

/**
 * Calculate position on a circle given an angle and radius
 */
export const calculateCircularPosition = (
  angle: number,
  radius: string
): Position => {
  const radian = (angle * Math.PI) / 180;
  return {
    top: `calc(50% - ${radius} * ${Math.cos(radian)})`,
    left: `calc(50% + ${radius} * ${Math.sin(radian)})`,
  };
};

/**
 * Calculate angle from slot position
 */
const calculateAngleFromSlot = (slotPosition: number, totalSlots: number): number => {
  const angleStep = 360 / totalSlots;
  return 180 + (slotPosition * angleStep);
};

/**
 * Find relative position in a circular array
 */
const getRelativePosition = (
  targetIndex: number,
  referenceIndex: number,
  arrayLength: number
): number => {
  return (targetIndex - referenceIndex + arrayLength) % arrayLength;
};

/**
 * Calculate the angle for a player position around the table
 * Takes into account whether the viewer is alive or dead
 */
export const calculatePlayerAngle = (
  playerIdStr: string,
  alivePlayers: string[],
  selfPlayerId: number | null,
  isSelfDead: boolean
): number => {
  const alivePlayerIds = [...alivePlayers]
    .map(p => parseInt(p))
    .sort((a, b) => a - b);

  const playerId = parseInt(playerIdStr);
  const playerIndex = alivePlayerIds.indexOf(playerId);

  // Self is alive or spectator: distribute alive players evenly
  if (!isSelfDead || selfPlayerId === null) {
    const selfIndex = selfPlayerId !== null
      ? alivePlayerIds.indexOf(selfPlayerId)
      : 0;

    const relativePosition = getRelativePosition(playerIndex, selfIndex, alivePlayerIds.length);
    return calculateAngleFromSlot(relativePosition, alivePlayerIds.length);
  }

  // Self is dead: leave empty slot at position 0 where self was
  // Maintain relative positions based on original player IDs
  const allPlayerIds = [...alivePlayerIds, selfPlayerId].sort((a, b) => a - b);
  const selfIndex = allPlayerIds.indexOf(selfPlayerId);
  const fullPlayerIndex = allPlayerIds.indexOf(playerId);

  const relativePosition = getRelativePosition(fullPlayerIndex, selfIndex, allPlayerIds.length);
  return calculateAngleFromSlot(relativePosition, allPlayerIds.length);
};

/**
 * Calculate both card and info positions for a player
 */
export const calculatePlayerPositions = (
  playerIdStr: string,
  alivePlayers: string[],
  selfPlayerId: number | null,
  isSelfDead: boolean
): PlayerPositions => {
  const angle = calculatePlayerAngle(playerIdStr, alivePlayers, selfPlayerId, isSelfDead);

  return {
    cardPosition: {
      ...calculateCircularPosition(angle, 'min(35vw, 35vh)'),
      angle: angle - 90,
    },
    infoPosition: calculateCircularPosition(angle, 'min(45vw, 45vh)'),
  };
};

