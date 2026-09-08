# ♠ Blackjack Roulette

> *Buckshot Roulette meets the blackjack table.*

A multiplayer, real-time strategy game that fuses classic **Blackjack** with a **Russian Roulette** elimination mechanic. Every round the lowest-scoring player faces a loaded 6-chamber cylinder — but a small inventory of survival items gives everyone a fighting chance.

![Game Preview](./docs/preview.png)

---

## 🎮 Concept

Four players compete at a noir casino table. Each round:

1. **Play Blackjack** — Hit or Stand trying to reach 21 without going bust.
2. **Rank & Reward** — 1st place earns a survival item. Last place earns the trigger.
3. **Roulette Check** — The lowest scorer faces a 1-in-6 chance of elimination. Survive long enough and outlast everyone else.

The tension comes from the items — five unique cards that let you peek at the chamber, shield yourself from a bullet, redraw a bad hand, swap cards with opponents, or curse someone into drawing a fatal extra card.

---

## ✨ Features

- **Real-time multiplayer** via WebSockets (Colyseus authoritative server)
- **Full Blackjack engine** — Ace soft/hard logic, bust detection, dealer draws to 17
- **6-chamber Russian Roulette** — true RNG, tracked server-side to prevent cheating
- **5 survival items** with distinct mechanics (Peek, Shield, Redraw, Card Swap, Force Hit)
- **3D revolver cylinder** rendered with React Three Fiber + metallic PBR materials
- **Procedural Web Audio** noir sound effects (zero external audio files)
- **Bot opponents** fill any empty seats automatically
- **Quickstart guide** for new players with full rules + item reference
- **Compact responsive table** — all 4 player seats visible without scrolling
- Noir casino aesthetic — dark felt, gold accents, animated elimination sequences

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Server** | Node.js · [Colyseus 0.15](https://colyseus.io/) · TypeScript |
| **Client** | React 18 · Vite · TypeScript |
| **3D Scene** | [React Three Fiber](https://r3f.docs.pmnd.rs/) · [Three.js](https://threejs.org/) · `@react-three/drei` |
| **State** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) |
| **Audio** | Web Audio API (procedural, no file dependencies) |
| **Monorepo** | `concurrently` · shared TypeScript types |

---

## 📁 Project Structure

```
blackjack-roulette/
├── client/                    # Vite + React frontend
│   └── src/
│       ├── components/
│       │   ├── Table/         # GameTable, QuickstartGuide, ItemGuideModal
│       │   ├── PlayerSeat/    # PlayerSeat, PlayingCard
│       │   ├── DealerHand/
│       │   ├── ItemBar/       # ItemControls action dock
│       │   ├── RouletteScene/ # Roulette3D (R3F revolver cylinder)
│       │   └── AudioController/
│       ├── store/             # Zustand game state store
│       ├── net/               # Colyseus client connection
│       └── theme/             # Design tokens
│
├── server/                    # Colyseus authoritative game server
│   └── src/
│       ├── rooms/
│       │   └── BlackjackRouletteRoom.ts   # Full game loop state machine
│       └── index.ts
│
└── shared/
    └── types.ts               # Shared TypeScript interfaces (PlayerState, Card, etc.)
```

---

## 🃏 The Items

| Item | Emoji | Effect | Turn Cost |
|---|---|---|---|
| **Chamber Peek** | 👁️ | See if the upcoming roulette chamber is loaded or empty | Free |
| **Aegis Shield** | 🛡️ | Passively absorbs the next fatal bullet automatically | Passive |
| **Redraw** | 🔄 | Discard your last card and draw a fresh replacement | Free |
| **Card Swap** | 🔁 | Trade one of your cards with a chosen opponent's | Free |
| **Force Hit** | ⬇️ | Curse an opponent to draw an extra card on their next turn | Free |

---

## 🎲 Game Rules

### Blackjack Scoring
- Number cards (2–9) = face value
- Face cards (10, J, Q, K) = 10 points
- Ace = 1 **or** 11 (whichever keeps the hand ≤ 21)
- Bust (>21) = ranked last for that round
- Tie-break: fewer cards in hand wins

### Round Flow
```
lobby → dealing → playerTurns → dealerResolve → scoring → rouletteCheck → [next round or matchEnd]
```

### Roulette Check
- A 6-chamber cylinder is loaded with exactly **1 bullet** per match
- The lowest-ranked player (or busted player) faces the trigger
- If the Aegis Shield is held, the bullet is blocked — no elimination
- Eliminated players are removed from subsequent rounds
- Last player standing wins

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/MagicStellar/blackjack-roulette.git
cd blackjack-roulette

# Install all dependencies (root + server + client)
npm install
npm --prefix server install
npm --prefix client install

# Start both server and client in dev mode
npm run dev
```

Open **http://localhost:5173** — bots fill empty seats automatically so you can test solo.

The Colyseus server runs on **ws://localhost:2567**.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start server + client concurrently |
| `npm run dev:server` | Server only (ts-node-dev with hot reload) |
| `npm run dev:client` | Client only (Vite HMR) |
| `npm --prefix client run build` | Production build of client |

---

## 🔌 Architecture

The server is **fully authoritative** — all game state mutations happen in `BlackjackRouletteRoom.ts`. The client only sends action messages and renders the state pushed by the server. This prevents cheating on card draws, RNG, and scoring.

```
Client (React/Zustand) ←──WebSocket──→ Colyseus Server (Node.js)
                                              │
                                        BlackjackRouletteRoom
                                              │
                                        ┌─────────────┐
                                        │  State Machine│
                                        │  lobby        │
                                        │  dealing      │
                                        │  playerTurns  │
                                        │  dealerResolve│
                                        │  scoring      │
                                        │  rouletteCheck│
                                        │  matchEnd     │
                                        └─────────────┘
```

---

## 🛣️ Roadmap

- [ ] Persistent match history & leaderboard
- [ ] Custom player names & avatars
- [ ] Room codes for private lobbies
- [ ] Mobile layout optimisation
- [ ] Sound pack selector (noir / cyberpunk / western)
- [ ] Spectator mode
- [ ] Capacitor wrapper for native iOS/Android app

---

## 📄 License

MIT — do whatever you want, just don't cheat at the table.

---

<div align="center">
  <sub>Built with ♠ and a healthy fear of loaded chambers.</sub>
</div>
