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

console.log('🔗 API URL:', SERVER_URL);

interface AppState {
  inMatch: boolean;
  matchID: string | null;
  playerID: string | null;
  credentials: string | null;
  matchName?: string;
  numPlayers?: number;
}

export default class App extends Component<{}, AppState> {
  private lobbyClient = new BgioLobbyClient({server: SERVER_URL});

  state: AppState = {
    inMatch: false,
    matchID: null,
    playerID: null,
    credentials: null,
    matchName: undefined,
    numPlayers: undefined
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
        const matchName = data.setupData.matchName;
        const numPlayers = data.setupData.maxPlayers;

        this.setState({
          inMatch: true,
          matchID,
          playerID,
          credentials,
          matchName,
          numPlayers
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
      const matchID = this.state.matchID;
      const playerID = this.state.playerID;
      const credentials = this.state.credentials;

      console.log('Leaving match...');

      this.setState({
        inMatch: false,
        matchID: null,
        playerID: null,
        credentials: null,
        matchName: undefined,
        numPlayers: undefined
      });

      console.log('Returned to lobby');

      // Wait for React to process the state change and unmount the component
      // This ensures Socket.IO disconnects before we call the API
      await new Promise(resolve => setTimeout(resolve, 200));

      // Now leave the match via the lobby API
      // By this time, the client has been unmounted and Socket.IO has disconnected
      try {
        await this.lobbyClient.leaveMatch(GAME_NAME, matchID, {
          playerID: playerID,
          credentials: credentials
        });
        console.log('Successfully left match via API');
      } catch (err) {
        console.error('Error calling leaveMatch API:', err);
      }

      console.log('Successfully left match');
    }
  };

  render() {
    const {inMatch, matchID, playerID, credentials, matchName, numPlayers} = this.state;

    if (!inMatch) {
      return (
        <LobbyClient
          gameServer={SERVER_URL}
          gameName={GAME_NAME}
          onJoinMatch={this.handleJoinMatch}
        />
      );
    }

    console.log('Mounting game view for match', matchID, 'with player', playerID);

    if (!matchID || !playerID || !credentials) {
      return <div>Error: Invalid match data</div>;
    }

    // Create a fresh client component for each match
    const ExplodingKittensClient = Client({
      game: ExplodingKittens,
      board: ExplodingKittensBoard,
      debug: {
        collapseOnLoad: true,
      },
      multiplayer: SocketIO({server: SERVER_URL}),
    });

    return (
      <GameView
        matchID={matchID}
        matchName={matchName}
        numPlayers={numPlayers}
        onLeave={this.handleLeaveMatch}
      >
        <ExplodingKittensClient
          key={matchID}
          matchID={matchID}
          playerID={playerID}
          credentials={credentials}
        />
      </GameView>
    );
  }
}