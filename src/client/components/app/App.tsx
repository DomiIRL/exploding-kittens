import { Component } from 'react';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { ExplodingKittens } from '../../../common';
import ExplodingKittensBoard from "../board/Board";
import { preloadCardImages } from '../../utils/preloadImages';

const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const ExplodingKittensClient = Client({
    game: ExplodingKittens,
    board: ExplodingKittensBoard,
    numPlayers: 5,
    debug: false,
    multiplayer: SocketIO({ server: SERVER_URL }),
});

interface AppState {
    playerID: string | null;
}

export default class App extends Component<{}, AppState> {
    state: AppState = { playerID: null };

    componentDidMount() {
        preloadCardImages().then(() => {
            console.log('All card images preloaded successfully');
        }).catch((err) => {
            console.error('Error preloading card images:', err);
        });
    }

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

