# DEAD SIGNAL
### Real-Time Multiplayer Horror Strategy Game

[![Tests](https://img.shields.io/badge/tests-25%20passed-brightgreen.svg)]()
[![Frontend](https://img.shields.io/badge/frontend-Nuxt%203%20%7C%20Vue%203-00DC82.svg)]()
[![Backend](https://img.shields.io/badge/backend-Express%20%7C%20Socket.IO%20%7C%20TypeScript-000000.svg)]()
[![Engine](https://img.shields.io/badge/engine-Authoritative%20State%20Machine-A71922.svg)]()

> A tense, minimalist two-player psychological horror strategy game inspired by shotgun-shell Russian roulette. Enter a private chamber, invite a friend using a 6-character room code, and compete in alternating turns where every choice tests risk calculation, deduction, and nerve.

---

## 1. GAME ARCHITECTURE & MECHANICS

### Authoritative Architecture
- **Server-Authoritative State:** Health, turns, shells, items, damage, and win outcomes are calculated strictly server-side in `server/src/game/engine.ts`.
- **Zero Secret Leaks:** Clients receive only public state (`shellsRemaining`, round number, player vitals). The hidden shell sequence is **never** sent to any client or stored in public logs.
- **Private Data Delivery:** When using tactical items like the **Magnifier**, private reveals (`game:private`) are dispatched only to that specific player's socket connection.
- **Synchronized Rematch:** Both players must independently confirm rematch before a new match begins.

### Rules of Engagement
- **Players:** Exactly 2 players per chamber. Starting health: `4 HP` each.
- **Dynamic Shell Counts (3 to 6 Shells):**
  - Each round loads between **3 and 6 shells** into the chamber (minimum 1 Live, minimum 1 Blank).
  - **Round Ammo Intel:** At the start of each round, the exact count of **Live** and **Blank** shells is explicitly announced to both players so they can count shots and calculate odds.
  - The actual order remains strictly randomized and hidden server-side.
- **Turn Actions:**
  1. **Shoot Opponent:**
     - **Live Shell:** Deals 1 damage (or 2 damage if sawed-off!). If opponent survives, turn passes. If opponent reaches 0 HP, match ends in victory.
     - **Blank Shell:** Deals 0 damage. Turn passes to opponent.
  2. **Shoot Yourself (Tactical Risk/Reward):**
     - **Blank Shell:** Deals 0 damage and **YOU RETAIN YOUR TURN** to act again!
     - **Live Shell:** Deals 1 damage to yourself (or 2 if sawed-off). Turn passes to opponent.
- **Strategic Tactical Items (Refreshes each round, 1 use each):**
  - 🪚 **Blade (Handsaw):** Saws off the shotgun barrel! The next live shot deals **DOUBLE DAMAGE (2 HP)**! Consumed on discharge.
  - 🔍 **Magnifier:** Secretly inspects the next shell in the chamber. Revealed **only** to you. Does not consume shell or pass turn.
  - ⛓️ **Handcuffs:** Restrains opponent. When the turn next transitions to them, their turn is skipped and remains with you.
  - 💉 **Medkit:** Emergency adrenaline injection. Restores 1 HP (up to 4 HP maximum). Cannot be used when already at full health.
- **Round Exhaustion:** When all shells are expended without elimination, a new round immediately begins: fresh 3–6 shells loaded with new ammo intel, all 4 items refreshed, and remaining player health is preserved.

---

## 2. REPOSITORY MONOREPO STRUCTURE

```
dead-signal/
├── client/                     # Nuxt 3 Frontend Application
│   ├── assets/css/main.css     # Design system, scanlines & horror themes
│   ├── components/
│   │   ├── lobby/              # CreateRoomCard, JoinRoomCard, RoomCodeDisplay
│   │   ├── game/               # GameHeader, PlayerCard, HealthBar, ShellCounter,
│   │   │                       # ActionPanel, ItemInventory, ActionLog,
│   │   │                       # TurnIndicator, ConnectionStatus, GameOverModal
│   │   └── ui/                 # AppButton, AppInput, AppModal, LoadingSpinner
│   ├── composables/
│   │   ├── useSocket.ts        # Singleton Socket.IO client with typed events
│   │   ├── useGame.ts          # Reactive game state, turns, sound triggers
│   │   └── useSound.ts         # Procedural Web Audio horror SFX & ambient drone
│   ├── pages/
│   │   ├── index.vue           # Landing page with host/join lobby & rules modal
│   │   └── game/[roomCode].vue # Full multiplayer game chamber
│   ├── types/game.ts           # Frontend game types & event contracts
│   ├── nuxt.config.ts          # Nuxt 3 config with Tailwind CSS & runtime env
│   ├── tailwind.config.ts      # Custom horror palette & monospace typography
│   └── package.json
├── server/                     # Authoritative Node.js / TypeScript Game Server
│   ├── src/
│   │   ├── game/
│   │   │   ├── engine.ts       # Authoritative GameEngine lifecycle
│   │   │   ├── actions.ts      # Shooting mechanics, damage, turn resolution
│   │   │   ├── items.ts        # Magnifier, Cuffs, Medkit validators
│   │   │   ├── room-manager.ts # In-memory room tracking & automatic cleanup
│   │   │   └── state-serializer.ts # State sanitizer & personalized client view
│   │   ├── socket/
│   │   │   ├── handlers.ts     # Socket.IO event handlers
│   │   │   ├── events.ts       # Strongly typed event contract constants
│   │   │   └── middleware.ts   # Rate limiter & throttle protection
│   │   ├── validation/
│   │   │   └── schemas.ts      # Zod validation for all client payloads
│   │   ├── utils/
│   │   │   ├── random.ts       # Crypto-grade random integers & shuffle
│   │   │   └── room-code.ts    # 6-character room code generator & validator
│   │   ├── types/game.ts       # Authoritative server types
│   │   └── index.ts            # Express server, CORS, health check endpoint
│   ├── tests/
│   │   ├── engine.test.ts      # Shell distribution, shooting, win conditions
│   │   ├── items.test.ts       # Item validation, cuffs skip, medkit caps
│   │   └── rooms.test.ts       # Multiplayer rooms, 2-player max, rematch agreement
│   ├── tsconfig.json
│   └── package.json
├── package.json                # Root package with npm workspaces & scripts
├── .env.example                # Root environment configuration template
└── README.md
```

---

## 3. GETTING STARTED

### Prerequisites
- **Node.js**: v18+ (tested on Node v20 & v24)
- **npm** or **bun**

### Installation

Clone the repository and install all dependencies:

```bash
# In project root:
npm install --workspaces
```

Or using Bun:
```bash
bun install --cwd server
bun install --cwd client
```

### Running Locally

To run both the server and the frontend client simultaneously:

```bash
npm run dev
```

Or run services in separate terminal windows:

```bash
# Terminal 1: Backend Game Server (Runs on http://localhost:4000)
npm run dev:server

# Terminal 2: Frontend Nuxt Application (Runs on http://localhost:3000)
npm run dev:client
```

Open `http://localhost:3000` in your web browser. To test multiplayer locally, open a second browser window (e.g. Incognito or a different browser), enter the host's 6-character room code, and begin the match!

---

## 4. RUNNING AUTOMATED TESTS

The game engine and multiplayer state transitions are tested with **Vitest**:

```bash
# Run all automated tests
npm run test

# Run tests in watch mode
npm run test:watch
```

### Test Coverage Highlights
- ✅ **Shell Generation:** Ensures 6 shells total, 2–4 live shells, remainder blanks, strictly server-only sequence.
- ✅ **Shooting Logic:** Live damage (-1 HP), elimination on 0 HP, blank shell retention on self-shot, turn pass on opponent shot.
- ✅ **Strategic Items:** Magnifier private reveal, Cuffs turn-skip mechanics, Medkit HP restoration and max HP validation, single-use per round enforcement.
- ✅ **Multiplayer Rooms:** 2-player capacity enforcement (rejecting 3rd player), invalid room code rejection, personalized state delivery, synchronized rematch agreement.

---

## 5. BUILDING FOR PRODUCTION

Build both applications:

```bash
npm run build
```

- **Backend:** Compiles TypeScript to `server/dist/`. Run with `npm run start:server` or `node server/dist/index.js`.
- **Frontend:** Prepares optimized Nuxt production bundle in `client/.output/`. Run with `node client/.output/server/index.mjs` or deploy as static/SPA.

---

## 6. DEPLOYMENT & NETWORKING CONFIGURATION

### Server Environment Variables (`server/.env`)
```ini
PORT=4000
CLIENT_ORIGIN=https://your-frontend-domain.com
NODE_ENV=production
```

### Client Environment Variables (`client/.env`)
```ini
NUXT_PUBLIC_SOCKET_URL=https://your-backend-domain.com
```

### WebSocket / Reverse Proxy Notice (Nginx / Caddy / Cloudflare)
When deploying behind a reverse proxy (such as Nginx):
```nginx
location /socket.io/ {
    proxy_pass http://localhost:4000/socket.io/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

---

## 7. ATMOSPHERIC SOUND & ACCESSIBILITY

- **Procedural Web Audio Engine:** All audio effects (shotgun pump, live explosive blast, blank click, item activation, eerie drone, victory/defeat stingers) are synthesized via Web Audio API. No external audio files to break or load slowly.
- **Audio Controls:** Persistent Mute toggle in the top header.
- **Accessibility:** Reduced-motion responsive, high-contrast borders, clear text indicators alongside color status.
