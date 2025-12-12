import {Component} from 'react';
import {Client} from 'boardgame.io/react';
import {SocketIO} from 'boardgame.io/multiplayer';
import {ExplodingKittens} from '../../../common';
import ExplodingKittensBoard from "../board/Board";
import LobbyClient from '../lobby/LobbyClient';
import GameView from '../game-view/GameView';
import {preloadCardImages} from '../../utils/preloadImages';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const GAME_NAME = 'Exploding-Kittens'; // Must match the name in game.ts exactly

interface AppState {
  inMatch: boolean;
  matchID: string | null;
  playerID: string | null;
  credentials: string | null;
  matchName?: string;
}

export default class App extends Component<{}, AppState> {
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

    // Check for saved match session
    const savedMatch = localStorage.getItem('currentMatch');
    if (savedMatch) {
      const matchData = JSON.parse(savedMatch);
      this.setState({
        inMatch: true,
        matchID: matchData.matchID,
        playerID: matchData.playerID,
        credentials: matchData.credentials,
        matchName: matchData.matchName
      });
    }
  }

  handleJoinMatch = (matchID: string, playerID: string, credentials: string) => {
    // Fetch match details to get the name
    fetch(`${SERVER_URL}/games/${GAME_NAME}/${matchID}`)
      .then(res => res.json())
      .then(data => {
        const matchName = data.setupData?.matchName;

        // Save match session
        const matchData = {matchID, playerID, credentials, matchName};
        localStorage.setItem('currentMatch', JSON.stringify(matchData));

        this.setState({
          inMatch: true,
          matchID,
          playerID,
          credentials,
          matchName
        });
      })
      .catch(() => {
        // If fetch fails, still join but without name
        const matchData = {matchID, playerID, credentials};
        localStorage.setItem('currentMatch', JSON.stringify(matchData));

        this.setState({
          inMatch: true,
          matchID,
          playerID,
          credentials
        });
      });
  };

  handleLeaveMatch = async () => {
    // Attempt to leave the match on the server
    if (this.state.matchID && this.state.playerID && this.state.credentials) {
      try {
        await fetch(
          `${SERVER_URL}/games/${GAME_NAME}/${this.state.matchID}/leave`,
          {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              playerID: this.state.playerID,
              credentials: this.state.credentials
            })
          }
        );
      } catch (err) {
        console.error('Error leaving match:', err);
      }
    }

    // Clear local state
    localStorage.removeItem('currentMatch');
    this.setState({
      inMatch: false,
      matchID: null,
      playerID: null,
      credentials: null,
      matchName: undefined
    });
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

