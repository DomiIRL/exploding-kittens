# Exploding Kittens Codebase Guide

## 🧠 Core Architecture

This project implements Exploding Kittens using **React** (frontend) and **boardgame.io** (game engine).

### Key Directories
- **`src/common/`**: Shared game logic, state definitions, and move implementations. Start here to understand game mechanics.
- **`src/client/`**: React frontend.
- **`src/server/`**: `boardgame.io` game server.

### Game State Management
The project uses a custom wrapper pattern over standard `boardgame.io` state (`G` and `ctx`):
- **`TheGame` Class** (`src/common/entities/game.ts`): Wraps the raw context. Always instantiate this to interact with game state.
- **`IGameState`** (`src/common/models/game-state.model.ts`): Defines the shape of `G` (piles, deck type, etc.).
- **Moves with `inGame` HOC**: All game moves are wrapped with the `inGame` higher-order function (`src/common/moves/in-game.ts`).
  - *Pattern*: Define moves as `(game: TheGame, ...args) => void`. The HOC handles context injection.
  - *Example*: See `src/common/moves/draw-move.ts`.

### Client Context
The React app accesses game state via `GameContext` (`src/client/context/GameContext.tsx`).
- **`TheGameClient`**: Extends `TheGame` with client-specific features (match ID, chat, multiplayer flags).
- Use `useGame()` hook to access the current game instance in components.

## 🛠️ Developer Workflows

### Running the Project
The project requires two concurrent processes:
1. **Game Server**: `npm run server:watch` (Runs on `http://localhost:51399`)
2. **Client**: `npm run dev` (Runs on `http://localhost:5173`)

### Building
- **Client**: `npm run build`
- **Server**: `npm run build:server`

### Testing
- Currently, there is **no automated test suite**. Verification is manual via playing the game in browsers.

## 🧩 Patterns & Conventions

### Move Mechanics
When implementing game moves (actions):
1. Create a function in `src/common/moves/`.
2. Function signature must be `(game: TheGame, ...args)`.
3. Mutate state via `game.piles`, `game.players`, or `game.gameState`.
4. Register the move in `src/common/game.ts` using `inGame(yourMove)`.

**Example Move:**
```typescript
import { TheGame } from "../entities/game";

export const myMove = (game: TheGame, argument: string) => {
  // Use entity helpers
  if (game.players.actingPlayer.hasCard(argument)) {
     game.players.actingPlayer.discard(argument);
  }
};
```

### Component Structure
- **Game View**: `src/client/components/game-view/` handles the main game screen.
- **Board**: `src/client/components/board/` handles the visual representation of the table.

### Docker
- `docker-compose.yml` orchestrates both client and server containers.
- Environment variables are managed in `stack.env` and passed to containers.

