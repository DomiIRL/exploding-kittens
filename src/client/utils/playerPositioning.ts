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
 * Calculate the angle for a player position around the table
 * Takes into account whether the viewer is alive or dead
 */
export const calculatePlayerAngle = (
  playerIdStr: string,
  alivePlayers: string[],
  selfPlayerId: number | null,
  isSelfDead: boolean
): number => {
  const alivePlayersSorted = [...alivePlayers].sort((a, b) => parseInt(a) - parseInt(b));
  const aliveIndex = alivePlayersSorted.indexOf(playerIdStr);

  // Self is alive or spectator: normal circular distribution
  if (!isSelfDead) {
    const numAlive = alivePlayers.length;
    const selfIndex = selfPlayerId !== null
      ? alivePlayersSorted.findIndex(p => parseInt(p) === selfPlayerId)
      : 0;

    const angleStep = 360 / numAlive;
    const relativePosition = (aliveIndex - selfIndex + numAlive) % numAlive;
    return 180 + (relativePosition * angleStep);
  }

  // Self is dead: leave empty slot at position 0 (bottom)
  const totalSlotsToUse = alivePlayers.length + 1;
  const angleStep = 360 / totalSlotsToUse;
  const positionIndex = aliveIndex + 1;
  return 180 + (positionIndex * angleStep);
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

  const cardRadius = 'min(35vw, 35vh)';
  const cardPosition: CardPosition = {
    ...calculateCircularPosition(angle, cardRadius),
    angle: angle - 90,
  };

  const tableRadius = 'min(45vw, 45vh)';
  const infoPosition = calculateCircularPosition(angle, tableRadius);

  return {cardPosition, infoPosition};
};

