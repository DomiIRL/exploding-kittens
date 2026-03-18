import {GameContext, PlayerStateBundle} from '../../../types/component-props';
import { useMatchDetails } from '../../../context/MatchDetailsContext';
import './GameStatusList.css';

interface GameStatusListProps {
  matchID?: string;
  matchName?: string;
  numPlayers?: number;
  gameContext: GameContext;
  playerState: PlayerStateBundle;
}

export default function GameStatusList({
  matchName,
  numPlayers,
  gameContext,
  playerState
}: GameStatusListProps) {
  const { matchDetails } = useMatchDetails();
  const {ctx} = gameContext;
  const {allPlayers, currentPlayer, isSelfSpectator} = playerState;
  
  // Use matchPlayers from context, fallback to empty array
  const matchPlayers = matchDetails?.players || [];

  // Merge game state (alive/dead) with match data (names/connection)
  // Use ctx.playOrder to respect turn order
  const displayPlayers = ctx.playOrder.map((pid: string) => {
    const playerID = parseInt(pid);
    const playerInfo = allPlayers[pid]; // From G
    const matchInfo = matchPlayers.find(p => p.id === playerID); // From Lobby

    // If matchInfo matches but name is missing, it's an empty seat (or player left)
    // Boardgame.io Lobby usually just removes the player object or sets name undefined
    const hasPlayer = matchInfo && matchInfo.name;

    return {
      id: pid,
      name: hasPlayer ? matchInfo.name : 'Empty Seat',
      isConnected: hasPlayer ? (matchInfo?.isConnected ?? true) : false, 
      isAlive: playerInfo?.isAlive ?? true, // Default to true if not found
      isCurrent: playerID === currentPlayer,
      isSelf: pid === gameContext.playerID,
      isEmpty: !hasPlayer
    };
  });

  return (
    <div className="game-info-badge">
      <div className="game-info-item">
        <span>{matchName || matchDetails?.matchName || 'Match'}</span>
      </div>
      {(numPlayers || ctx.numPlayers) && (
        <div className="game-info-item">
          <span>👥</span>
          <span>{numPlayers || ctx.numPlayers} players</span>
        </div>
      )}

      <div className="game-player-list">
        <div className="list-section-title">Players</div>
        {displayPlayers.map((p: any) => (
          <div 
            key={p.id} 
            className={`player-list-item 
              ${p.isCurrent ? 'active-turn' : ''} 
              ${!p.isAlive && !p.isEmpty ? 'dead' : (p.isEmpty ? 'empty' : 'occupied')} 
              ${!p.isConnected && !p.isEmpty ? 'disconnected' : ''}`
            }
          >
            <span 
              className="player-status-dot" 
              style={{
                backgroundColor: p.isEmpty ? 'transparent' : 
                                 (!p.isConnected ? '#cbd5e0' : 
                                 (!p.isAlive ? '#ef4444' : '#4ade80')),
                border: p.isEmpty ? '1px dashed #cbd5e0' : 'none'
              }}
              title={p.isEmpty ? "Empty Seat" : (!p.isConnected ? "Disconnected" : (!p.isAlive ? "Dead" : "Alive"))}
            ></span>
            
            <span className="player-name">
              {p.name} {p.isSelf ? '(You)' : ''}
            </span>
            
            {!p.isAlive && !p.isEmpty && (
              <span className="dead-indicator">☠️</span>
            )}
            
            {p.isCurrent && p.isAlive && !p.isEmpty && (
              <span className="turn-indicator">🎲</span>
            )}
          </div>
        ))}
        
        {/* Spectators placeholder - can be implemented if G supports spectators list */}
        {isSelfSpectator && (
           <div className="spectator-indicator" style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#60a5fa'}}>
             You are spectating
           </div>
        )}
      </div>
    </div>
  );
}
