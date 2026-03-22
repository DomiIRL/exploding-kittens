import { useMatchDetails } from '../../../context/MatchDetailsContext';
import { useState } from 'react';
import './GameStatusList.css';
import { useResponsive } from '../../../context/ResponsiveContext';
import {useGame} from "../../../context/GameContext.tsx";

export default function GameStatusList() {
  const game = useGame();
  const { isMobile } = useResponsive();

  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  const { matchDetails } = useMatchDetails();

  // Use matchPlayers from context, fallback to empty array
  const matchPlayers = matchDetails?.players || [];

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <>
      <div 
        className={`game-info-badge ${isCollapsed ? 'collapsed' : ''}`}
      >
        <div className="game-info-header">
          <button 
            className="collapse-toggle-btn"
            onClick={toggleCollapse}
            aria-label={isCollapsed ? "Show Player List" : "Hide Player List"}
          >
            {isCollapsed ? "▼" : "▲"}
          </button>
          
          <div className="game-info-item">
            <span>{matchDetails?.matchName || 'Match'}</span>
          </div>
            <div className="game-info-item">
              <span>👥</span>
              <span>{game.players.playerCount}</span>
            </div>
        </div>

        {!isCollapsed && (
          <div className="game-player-list">
            <div className="list-section-title">Players</div>
            {game.turnManager.playOrder.map(orderEntry => {
              const player = game.players.getPlayer(orderEntry);

              const matchInfo = matchPlayers.find(p => p.id === player.id);
              const isEmpty = !(matchInfo && matchInfo.name)
              const isConnected = matchInfo ? (matchInfo.isConnected ?? true) : false;
              const name = isEmpty ? 'Empty Seat' : matchInfo.name;

              return (
                <div
                  key={player.id}
                  className={`player-list-item 
                  ${player.isCurrentPlayer ? 'active-turn' : ''} 
                  ${!player.isAlive && !isEmpty ? 'dead' : (isEmpty ? 'empty' : 'occupied')} 
                  ${!isConnected && !isEmpty ? 'disconnected' : ''}`
                  }
                >
                <span
                  className="player-status-dot"
                  style={{
                    backgroundColor: isEmpty ? 'transparent' :
                      (!isConnected ? '#cbd5e0' :
                        (!player.isAlive ? '#ef4444' : '#4ade80')),
                    border: isEmpty ? '1px dashed #cbd5e0' : 'none'
                  }}
                  title={isEmpty ? "Empty Seat" : (!isConnected ? "Disconnected" : (!player.isAlive ? "Dead" : "Alive"))}
                ></span>

                  <span className="player-name">
                  {name} {game.isSelf(player) ? '(You)' : ''}
                </span>

                  {!player.isAlive && (
                    <span className="dead-indicator">☠️</span>
                  )}

                  {player.isCurrentPlayer && (
                    <span className="turn-indicator">🎲</span>
                  )}
                </div>
              );
            })}

            {/* Spectators placeholder - can be implemented if G supports spectators list */}
            {game.isSpectator && (
              <div className="spectator-indicator" style={{marginTop: '0.5rem', fontSize: '0.8rem', color: '#60a5fa'}}>
                You are spectating
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
