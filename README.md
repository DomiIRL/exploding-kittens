# Exploding Kittens (Work in Progress)

A fanmade webbased multiplayer version of the popular board game [Exploding Kittens](https://www.explodingkittens.com/).
Consider buying the board game and support the creators of the game.
This project is for educational purposes only. If requested I will gladly take it offline.

## 📦 Installation

```bash
npm install
```

## 🛠️ Development

### Run Client (Frontend)

```bash
npm run dev
```

Access at: http://localhost:5173

### Run Server (Game Server)

```bash
npm run server
```

Server runs at: http://localhost:51399

### Watch Mode (Auto-restart on changes)

```bash
npm run server:dev
```

### Run Both (Two Terminals)

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run server:dev
```

## 🏗️ Production Build

```bash
npm run build
npm run build:server
npm start
```

The server also serves the built client from `dist/client`, so one process on port 51399 is the whole game.
`docker build .` produces the same thing as an image. Every push to `main` runs the tests and publishes
`ghcr.io/domiirl/exploding-kittens`, which runs at https://boom.svrt.dev.

## 🧪 Tests

```bash
npm test
```

## 🎮 Current State

<img width="1894" height="972" alt="image" src="https://github.com/user-attachments/assets/3323e5e1-513a-47ce-94b7-767bec6732a8" />
<img width="1894" height="972" alt="image" src="https://github.com/user-attachments/assets/ea99c717-1863-4203-95d6-dd1245fcc90d" />

## 📜 License

See [LICENSE](./LICENSE) file for details.

