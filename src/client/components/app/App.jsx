import React from 'react';
import ReactDOM from 'react-dom/client';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { ExplodingKittens } from '../../../common/Game';
import ExplodingKittensBoard from "../board/Board.jsx";

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ExplodingKittensClient = Client({
  game: ExplodingKittens,
  board: ExplodingKittensBoard,
  numPlayers: 5,
  multiplayer: SocketIO({ server: SERVER_URL }),
});


export default class App extends React.Component {
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
