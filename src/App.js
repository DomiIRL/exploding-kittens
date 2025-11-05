import React from 'react';
import ReactDOM from 'react-dom/client';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { ExplodingKittens } from './Game';
import {ExplodingKittensBoard} from "./Board";

const ExplodingKittensClient = Client({
  game: ExplodingKittens,
  board: ExplodingKittensBoard,
  numPlayers: 5,
  multiplayer: SocketIO({ server: process.env.API_URL || 'http://localhost:8000' }),
});

class App extends React.Component {
  state = { playerID: null };

  render() {
    if (this.state.playerID === null) {
      return (
        <div>
          <p>Play as</p>
          <button onClick={() => this.setState({ playerID: "0" })}>
            Spieler 1
          </button>
          <button onClick={() => this.setState({ playerID: "1" })}>
            Spieler 2
          </button>
          <button onClick={() => this.setState({ playerID: "2" })}>
            Spieler 3
          </button>
          <button onClick={() => this.setState({ playerID: "3" })}>
            Spieler 4
          </button>
            <button onClick={() => this.setState({ playerID: "4" })}>
                Spieler 5
            </button>
        </div>
      );
    }
    return (
      <div>
        <ExplodingKittensClient playerID={this.state.playerID} />
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
