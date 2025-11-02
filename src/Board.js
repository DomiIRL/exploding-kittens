import React from 'react';
import './Board.css';

export class ExplodingKittensBoard extends React.Component {
  getPositions(index, playerID) {
    const numPlayers = Object.keys(this.props.ctx.playOrder).length;
    const angleStep = 360 / numPlayers;

    // Calculate relative position - how far this player is from the current player
    const relativePosition = (index - playerID + numPlayers) % numPlayers;
    // Start at bottom (180 degrees) and work counterclockwise
    const angle = 180 + (relativePosition * angleStep);
    const radian = (angle * Math.PI) / 180;

    const cardRadius = 38;
    const cardPosition = {
      top: `${50 - cardRadius * Math.cos(radian)}%`,
      left: `${50 + cardRadius * Math.sin(radian)}%`,
      angle: angle - 90
    };

    // Player info is in an outer circle (45% from center)
    const infoRadius = 45;
    const infoPosition = {
      top: `${50 - infoRadius * Math.cos(radian)}%`,
      left: `${50 + infoRadius * Math.sin(radian)}%`
    };

    return { cardPosition, infoPosition };
  }

  renderCards(count) {
    const fanSpread = Math.min(count * 5, 30); // Maximum spread angle of 30 degrees
    const angleStep = count > 1 ? fanSpread / (count - 1) : 0;
    const baseOffset = -fanSpread / 2; // Start from negative angle to center the fan

    return Array(count).fill(null).map((_, index) => {
      const angle = baseOffset + (angleStep * index);
      return (
        <div
          key={index}
          className="card"
          style={{
            position: 'absolute',
            transform: `rotate(${angle}deg)`,
            transformOrigin: 'center 120%' // Position below the card for natural fan
          }}
        >
          ?
        </div>
      );
    });
  }

  render() {
    const { ctx, G, moves, plugins, playerID } = this.props;
    const players = Object.keys(ctx.playOrder);
    const all_players = plugins.player.data.players;
    const currentPlayerNumber = parseInt(playerID);

    return (
      <div className={"w-full h-full flex flex-col items-center justify-center bg-blue-200"}>
        <div className="board-container">
          {/* Center table */}
          <div className="table">
            <div className="table-center">
              {/* Central play area */}
            </div>
          </div>

          {players.map((player, index) => {
            const { cardPosition, infoPosition } = this.getPositions(index, currentPlayerNumber);
            const isCurrentPlayer = parseInt(player) === currentPlayerNumber;
            const hand_count = all_players[player].hand_count;
            const cardRotation = cardPosition.angle - 90; // Rotate cards to face the player

            return (
              <React.Fragment key={player}>
                <div
                  className="player-cards-container"
                  style={{
                    position: 'absolute',
                    top: cardPosition.top,
                    left: cardPosition.left,
                    transform: `translate(-50%, -50%) rotate(${cardRotation}deg)`,
                    zIndex: isCurrentPlayer ? 2 : 1
                  }}
                >
                  <div className="player-cards">
                    {this.renderCards(hand_count)}
                  </div>
                </div>

                <div
                  className={`player-position ${isCurrentPlayer ? 'current-player' : ''}`}
                  style={{
                    position: 'absolute',
                    top: infoPosition.top,
                    left: infoPosition.left,
                    transform: 'translate(-50%, -50%)',
                    zIndex: 3
                  }}
                >
                  <div className="player-area flex flex-col items-center">
                    <div className="player-hand border-2 border-black bg-white p-2 rounded">
                      Hand Cards: {hand_count}
                    </div>
                    <div className="player-id mt-2 font-bold">
                      Player {parseInt(player) + 1}
                      {isCurrentPlayer && " (You)"}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>
        <div>
          <h2 className="text-xl font-bold mb-4">Game Debug</h2>
          <div>
            <pre className="bg-gray-100 p-4 rounded">
              {JSON.stringify(this.props, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }
}
