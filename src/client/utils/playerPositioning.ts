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

const calculateAngleFromSlot = (slotPosition: number, totalSlots: number): number => {
  return 180 + (slotPosition * (360 / totalSlots));
};

const getRelativePosition = (
  targetIndex: number,
  referenceIndex: number,
  arrayLength: number
): number => {
  return (targetIndex - referenceIndex + arrayLength) % arrayLength;
};

export const calculatePlayerAngle = (
  playerIndex: number,
  totalPlayers: number,
  selfIndex: number | null,
  isSelfDead: boolean
): number => {
  if (isSelfDead) {
    // Slot 0 (bottom) is always the empty seat for the dead viewer.
    // Shift all alive players by 1 to leave that slot vacant.
    const relativePosition = (playerIndex + 1) % (totalPlayers + 1);
    return calculateAngleFromSlot(relativePosition, totalPlayers + 1);
  }

  const relativePosition = getRelativePosition(playerIndex, selfIndex ?? 0, totalPlayers);
  return calculateAngleFromSlot(relativePosition, totalPlayers);
};

export const calculatePlayerPositions = (
  playerIndex: number,
  totalPlayers: number,
  selfIndex: number | null,
  isSelfDead: boolean
): PlayerPositions => {
  const angle = calculatePlayerAngle(playerIndex, totalPlayers, selfIndex, isSelfDead);
  return {
    cardPosition: {
      ...calculateCircularPosition(angle, 'min(35vw, 35vh)'),
      angle: angle - 90,
    },
    infoPosition: calculateCircularPosition(angle, 'min(45vw, 45vh)'),
  };
};
