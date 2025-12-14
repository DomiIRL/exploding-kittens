import {Component} from 'react';
import {Client} from 'boardgame.io/react';
import {SocketIO} from 'boardgame.io/multiplayer';
import {LobbyClient as BgioLobbyClient} from 'boardgame.io/client';
import {ExplodingKittens} from '../../../common';
import ExplodingKittensBoard from "../board/Board";
import LobbyClient from '../lobby/LobbyClient';
import GameView from '../game-view/GameView';
import {preloadCardImages} from '../../utils/preloadImages';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const GAME_NAME = 'Exploding-Kittens';

interface AppState {
  inMatch: boolean;
  matchID: string | null;
  playerID: string | null;
  credentials: string | null;
  matchName?: string;
}

// Create the Client instance once outside the component
const ExplodingKittensClient = Client({
  game: ExplodingKittens,
  board: ExplodingKittensBoard,
  debug: {
    collapseOnLoad: true,
  },
  multiplayer: SocketIO({server: SERVER_URL}),
});

export default class App extends Component<{}, AppState> {
  private lobbyClient = new BgioLobbyClient({server: SERVER_URL});

  state: AppState = {
    inMatch: false,
    matchID: null,
    playerID: null,
    credentials: null,
    matchName: undefined
  };

  componentDidMount() {
    preloadCardImages().then(() => {
      console.log('All card images preloaded successfully');
    }).catch((err) => {
      console.error('Error preloading card images:', err);
    });
  }

  handleJoinMatch = (matchID: string, playerID: string, credentials: string) => {
    this.lobbyClient.getMatch(GAME_NAME, matchID)
      .then(data => {
        const matchName = data.setupData?.matchName;

        this.setState({
          inMatch: true,
          matchID,
          playerID,
          credentials,
          matchName
        });
      })
      .catch(() => {
        this.setState({
          inMatch: true,
          matchID,
          playerID,
          credentials
        });
      });
  };

  handleLeaveMatch = async () => {
    if (this.state.matchID && this.state.playerID && this.state.credentials) {
      await this.lobbyClient.leaveMatch(GAME_NAME, this.state.matchID, {
        playerID: this.state.playerID,
        credentials: this.state.credentials
      }).then(() => {
        this.setState({
          inMatch: false,
          matchID: null,
          playerID: null,
          credentials: null,
          matchName: undefined
        });
      }).catch(err => {
        console.error('Error leaving match:', err);
      });
    }
  };

  render() {
    const {inMatch, matchID, playerID, credentials, matchName} = this.state;

    if (!inMatch) {
      return (
        <LobbyClient
          gameServer={SERVER_URL}
          gameName={GAME_NAME}
          onJoinMatch={this.handleJoinMatch}
        />
      );
    }

    if (!matchID || !playerID || !credentials) {
      return <div>Error: Invalid match data</div>;
    }

    return (
      <GameView
        matchID={matchID}
        matchName={matchName}
        onLeave={this.handleLeaveMatch}
      >
        <ExplodingKittensClient
          matchID={matchID}
          playerID={playerID}
          credentials={credentials}
        />
      </GameView>
    );
  }
}