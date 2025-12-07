import './Board.css';
import Table from './table/Table';
import Player from './player-area/Player.tsx';
import DebugPanel from './debug-panel/DebugPanel';
import WinnerOverlay from './winner-overlay/WinnerOverlay';
import DeadOverlay from './dead-overlay/DeadOverlay';
import PlayerSelectionOverlay from './player-selection-overlay/PlayerSelectionOverlay';
import {BoardProps} from 'boardgame.io/react';
import {Card, GameState} from '../../../common';
import PlayerState from '../../model/PlayerState';
import {useCardAnimations} from '../../hooks/useCardAnimations';

interface PlayerPlugin {
  data: {
    players: {
      [key: string]: {
        hand: Card[];
        hand_count: number;
        isAlive: boolean;
      };
    };
  };
}

interface BoardPropsWithPlugins extends BoardProps<GameState> {
  plugins: {
    player: PlayerPlugin;
  };
}

interface Position {
  top: string;
  left: string;
}

interface CardPosition extends Position {
  angle: number;
}

interface Positions {
  cardPosition: CardPosition;
  infoPosition: Position;
}

/**
 * Calculate position on a circle
 */
const calculateCircularPosition = (
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
 * Calculate the angle for a player position
 */
const calculatePlayerAngle = (
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

export default function ExplodingKittensBoard({
                                                ctx,
                                                G,
                                                moves,
                                                plugins,
                                                playerID
                                              }: BoardPropsWithPlugins) {
  const allPlayers = plugins.player.data.players;
  const players = Object.keys(ctx.playOrder);
  const alivePlayers = players.filter(player => allPlayers[player].isAlive);

  const {AnimationLayer, triggerCardMovement} = useCardAnimations(G);

  const isSpectator = playerID == null;
  const selfPlayerId = isSpectator ? null : parseInt(playerID || '0');
  const isSelfDead = !isSpectator &&
    selfPlayerId !== null &&
    !allPlayers[selfPlayerId.toString()].isAlive;
  const isSelfSpectator = isSpectator || 
    (isSelfDead && G.gameRules.deadPlayersCanSeeAllCards) || 
    G.gameRules.openCards;

  const isGameOver = ctx.phase === 'gameover';
  const currentPlayer = parseInt(ctx.currentPlayer);

  // Check if the current player is in the "choosePlayerToStealFrom" stage
  const isSelectingPlayer = !isSpectator &&
    selfPlayerId !== null &&
    selfPlayerId === currentPlayer &&
    ctx.activePlayers?.[playerID || ''] === 'choosePlayerToStealFrom';

  /**
   * Handle player selection for stealing a card
   */
  const handlePlayerSelect = (targetPlayerId: string) => {
    if (isSelectingPlayer && moves.stealCard) {
      moves.stealCard(targetPlayerId);
    }
  };

  /**
   * Calculate positions for a player around the table
   */
  const getPositions = (playerIdStr: string): Positions => {
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

  const alivePlayersSorted = [...alivePlayers].sort((a, b) => parseInt(a) - parseInt(b));

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-blue-200">
      <div className={`board-container ${isSelfSpectator ? 'hand-interactable' : ''} ${isSelfDead ? 'dimmed' : ''}`}>
        <Table G={G} moves={moves}/>
        {alivePlayersSorted.map((player) => {
          const {cardPosition, infoPosition} = getPositions(player);
          const playerNumber = parseInt(player);
          const playerInfo = allPlayers[player];

          const playerState = new PlayerState(
            isSelfSpectator,
            selfPlayerId !== null && playerNumber === selfPlayerId,
            playerInfo.isAlive,
            playerNumber === currentPlayer,
            playerInfo.hand_count,
            playerInfo.hand
          );

          const isSelectable = isSelectingPlayer
            && player !== playerID
            && playerState.isAlive
            && playerState.handCount > 0;

          return (
            <Player
              key={player}
              playerID={player}
              playerState={playerState}
              cardPosition={cardPosition}
              infoPosition={infoPosition}
              moves={moves}
              isSelectable={isSelectable}
              onPlayerSelect={handlePlayerSelect}
              triggerCardMovement={triggerCardMovement}
            />
          );
        })}
      </div>
      <AnimationLayer />
      {isSelectingPlayer && <PlayerSelectionOverlay />}
      {isSelfDead && !isGameOver && <DeadOverlay/>}
      {isGameOver && G.winner && (
        <WinnerOverlay winnerID={G.winner} playerID={playerID}/>
      )}
      <DebugPanel data={{ctx, G, moves, plugins, playerID}}/>
    </div>
  );
}
