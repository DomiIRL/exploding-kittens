import React from 'react';
import './Board.css';

export class ExplodingKittensBoard extends React.Component {
  getPlayerPosition(index, playerID) {
    const numPlayers = Object.keys(this.props.ctx.playOrder).length;
    const remainingPlayers = numPlayers;
    const totalAngleSpread = 360;
    const angleStep = totalAngleSpread / remainingPlayers;
    const startAngle = 90 - angleStep * playerID;
    const angle = startAngle + (index * angleStep);
    const radian = (angle * Math.PI) / 180;
    const radius = 40;

    return {
      top: `${50 + radius * Math.sin(radian)}%`,
      left: `${50 + radius * Math.cos(radian)}%`,
      angle: angle
    };
  }

  renderCards(count) {
    return Array(count).fill(null).map((_, index) => (
      <div
        key={index}
        className="card"
        style={{
          marginLeft: index > 0 ? '-15px' : '0'
        }}
      >
        ?
      </div>
    ));
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
            const position = this.getPlayerPosition(index, currentPlayerNumber);
            const isCurrentPlayer = parseInt(player) === currentPlayerNumber;
            const hand_count = all_players[player].hand_count;
            const cardRotation = position.angle - 90; // Rotate cards to point to center

            return (
              <div
                key={player}
                className={`player-position ${isCurrentPlayer ? 'current-player' : ''}`}
                style={{
                  position: 'absolute',
                  top: position.top,
                  left: position.left,
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <div
                  className="player-cards"
                  style={{
                    transform: `translateX(-50%) rotate(${cardRotation}deg)`
                  }}
                >
                  {this.renderCards(hand_count)}
                </div>

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
