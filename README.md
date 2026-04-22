# MM4E: Constrained Round Robin with Exclusions

A dynamic, social performance game where 8 participants progress through structured rounds of choreographed performances with music and props. Perfect for events, team building, or just for fun!

## Table of Contents

- [Gameplay Rules](#gameplay-rules)
- [Game Phases](#game-phases)
- [Mathematical Model](#mathematical-model)
- [Developer Notes](#developer-notes)
- [Technical Stack](#technical-stack)
- [Getting Started](#getting-started)

---

## Gameplay Rules

### Core Concept

**MM4E** is a turn-based social game where 8 participants are paired up and perform choreographed routines with songs and props across 4 consecutive rounds. Each participant performs exactly 4 times (once per round), always paired with exactly one partner per round. The game incorporates exclusion preferences and role assignments to create balanced, constrained pairings.

### The 8 Participants

Exactly **8 participants** are required for a complete game:
- Each participant has a unique name and a 4-digit PIN for authentication
- Participants have complete visibility of other participants' preferences
- Organizers manage the game flow and break ties

### Game Setup & Sequence

#### Phase 1: **Setup** (Organizer Only)
- Organizer adds 8 participants with names and 4-digit PINs
- Participants can be added/removed until all 8 are present
- Once ready, organizer advances to song submission

#### Phase 2: **Song Submission**
- **Duration**: All 8 participants must submit their songs to proceed
- **Per Participant**: Submit exactly 2 songs with Spotify or YouTube URLs
  - One **Energetic/Sassy** song (⚡ vibe)
  - One **Calm/Sensual** song (🌙 vibe)
- **Rules**:
  - Songs can be any genre; vibe classification is up to the submitter
  - A song, once used in any performance, is permanently retired from the available pool
  - This ensures variety across the 4 rounds of performances

#### Phase 3: **Exclusion Setting**
- **Duration**: All 8 participants must submit exclusions to proceed
- **Per Participant**: Deselect anyone you'd prefer NOT to be paired with
  - All participants start selected (no exclusions)
  - Click to toggle exclusions on/off
- **Rules**:
  - Exclusions are **mutual** during pairing computation
  - If you exclude someone, you will not be paired with them, and vice versa
  - The system automatically checks if a valid pairing exists given the exclusions
  - If too many exclusions make pairing impossible, participants must relax their exclusions
- **Feasibility Check**: The system displays a warning if current exclusions make valid pairings impossible

#### Phase 4: **Role Selection**
- **Duration**: All 8 participants must select a role to proceed
- **Per Participant**: Choose one of two roles
  - 🧍 **Standing (Role A)**: Physical movements and gestures from a standing position
  - 🪑 **Seated (Role B)**: Physical movements and gestures while seated
- **Constraint**: Exactly 4 participants must choose Standing and 4 must choose Seated
- **Rules**:
  - Role distributes evenly across the group
  - Selection is final once all 8 participants have chosen
  - In Rounds 2 and 4, roles are swapped (more on this below)

#### Phase 5: **Pairing Computation** (Organizer Triggers)
- System computes 4 valid pairings for each round (16 pairings total across all rounds)
- Pairings respect all exclusions set in Phase 3
- Pairings form a perfect matching on a bipartite graph (see [Mathematical Model](#mathematical-model))
- If no valid pairing exists, error message is displayed; participants must return to Phase 3 and relax exclusions

### The 4 Rounds

Once pairings are computed, the game runs through **4 consecutive rounds**. Each round progresses through **4 pairs** in sequence.

#### Round Structure

Each round involves:
- **4 pairs** (covering all 8 participants, 2 per pair)
- **4 sub-phases per pair**: Draw → Song Selection → Props → Performance
- **Role Swapping**: Rounds 2 and 4 automatically swap which role is "Standing" vs "Seated"
- **Pair Shifting**: Rounds 3 and 4 shift pair positions (see [Technical Details](#pairing-algorithm) for formulas)

#### Round 1: Base Pairings
- Participants are paired in order (A₁ with B₁, A₂ with B₂, etc.)
- Standing Role = Group A / Seated Role = Group B
- All participants experience their initial role choice

#### Round 2: Roles Reversed
- **Same pairs** as Round 1
- Standing Role = Group B / Seated Role = Group A
- Participants experience the opposite role
- Allows each person to try both positions

#### Round 3: Pairs Shifted
- Pairings are rotated (A₁ with B₂, A₂ with B₃, A₃ with B₄, A₄ with B₁)
- Standing Role = Group A / Seated Role = Group B (reverted to original)
- Creates new partnerships and variety

#### Round 4: Shifted + Roles Reversed
- **Same pairs** as Round 3
- Standing Role = Group B / Seated Role = Group A (swapped again)
- Final round with maximum diversity in experiences

### Sub-Phase Details (Per Pair, Per Round)

Each pair goes through 4 sequential sub-phases:

#### Sub-Phase A: **The Draw** 🎰
- **Animation**: A slot-machine animation randomly "draws" which participant gets which role for this round
- **Outcome**: Determines who stands and who sits for this specific performance
- **Participants See**: Organizers and displays watch the draw; the active pair observes the outcome
- **Next Step**: Automatically advances to song selection

#### Sub-Phase B: **Song Selection** 🎵
- **Available Songs**: The 2 participants draw from a pool of available songs not yet used in previous rounds
- **Voting**: Both participants in the pair **vote** on which song to perform to
  - Each person votes for their preferred song
  - Votes are simultaneous and visible to each other
- **Tie Breaking**:
  - If both vote for the **same song**: That song is selected ✓
  - If each votes for a **different song**: Organizer breaks the tie by choosing one of the two
- **Next Step**: Advances to props selection once a song is chosen

#### Sub-Phase C: **Props & Furniture Selection**
- **Selecting Participant**: One member of the pair submits prop and furniture selections
  - **Props** (pick one): Mop, Sash/Ribbon, or Belt
  - **Furniture** (pick up to 2): Chair, Table, or Wide Couch
- **Confirming Participant**: The other member confirms the selections
- **Choreography Guidance**: Props and furniture inform the choreography and performance style
- **Next Step**: Advances to performance once both selections are submitted and confirmed

#### Sub-Phase D: **Performance** ✨
- **Display**: Full performance information displayed on organizer screens
  - Pair names (with assigned roles)
  - Song & vibe (with playable link)
  - Prop and furniture selections
- **Live Performance**: The pair performs a spontaneous choreographed routine to the selected song, using the props and furniture as inspiration
- **Organizer Control**: After performance concludes, organizer advances to the next draw (or next round if complete)
- **Next Step**: Moves to the next pair in the round, or to the next round if all 4 pairs have performed

### Victory Condition

All participants complete **4 rounds** × **4 pairs per round** = **16 sub-phase sequences**. Once the final performance in Round 4, Pair 4 is complete, the game advances to **Complete** state.

---

## Game Phases

### Phase State Diagram

```
SETUP
  ↓
SONG_SUBMISSION (all 8 must submit)
  ↓
EXCLUSION_SETTING (all 8 must set exclusions; feasibility checked)
  ↓
ROLE_SELECTION (all 8 choose; 4 Standing, 4 Seated)
  ↓
PAIRING_COMPUTED (organizer triggers; computes all 4 rounds)
  ↓
ROUND_1_PAIR_0_DRAW
  ↓
ROUND_1_PAIR_0_SONG
  ↓
ROUND_1_PAIR_0_PROPS
  ↓
ROUND_1_PAIR_0_PERFORM
  ↓
ROUND_1_PAIR_1_DRAW ... → ... ROUND_1_PAIR_3_PERFORM
  ↓
ROUND_2_PAIR_0_DRAW ... → ... ROUND_2_PAIR_3_PERFORM
  ↓
ROUND_3_PAIR_0_DRAW ... → ... ROUND_3_PAIR_3_PERFORM
  ↓
ROUND_4_PAIR_0_DRAW ... → ... ROUND_4_PAIR_3_PERFORM
  ↓
COMPLETE
```

---

## Mathematical Model

### Bipartite Graph Perfect Matching Problem

The pairing system solves a **constrained bipartite matching** problem with exclusions.

#### Problem Formulation

**Participants are split into two groups:**
- **Group A** (4 participants who selected Standing role in Role Selection)
- **Group B** (4 participants who selected Seated role in Role Selection)

**In Round 1 and 2:**
- Participants from Group A are paired with participants from Group B
- In even rounds (2, 4), roles are swapped, but pairings remain the same

**In Round 3 and 4:**
- The same Group A and Group B are re-paired with a different pairing scheme (shifted)

#### Graph Representation

For each Round pair (e.g., Round 1), model as a **bipartite graph** $G = (A \cup B, E)$:

$$
\text{Vertices: } V = A \cup B, \quad |A| = |B| = 4
$$

$$
\text{Edges: } E = \{(a, b) : a \in A, b \in B, \text{ and } (a, b) \text{ not in Exclusions}\}
$$

An **exclusion** is a pair $(a, b)$ where participant $a$ excludes participant $b$, or vice versa. Excluded pairs have no edge.

#### Matching Constraint

A **perfect matching** $M$ in $G$ is a set of edges such that:

$$
|M| = 4 \quad \text{and} \quad \text{each vertex in } A \cup B \text{ is incident to exactly one edge in } M
$$

Formally:

$$
\forall v \in A \cup B, \quad |\{e \in M : v \in e\}| = 1
$$

**Goal**: Find a perfect matching $M$ that respects all exclusions.

#### Existence Condition (Hall's Marriage Theorem)

A perfect matching exists if and only if for every subset $S \subseteq A$:

$$
|N(S)| \geq |S|
$$

where $N(S) = \bigcup_{a \in S} \{b \in B : (a, b) \in E\}$ is the set of neighbors of $S$ in $B$.

The system checks this feasibility before allowing play to proceed. If infeasible, participants must relax exclusions.

### Pairing Algorithm: Backtracking

The system uses a **backtracking algorithm with constraint propagation** to find a valid perfect matching.

#### Algorithm Pseudocode

```
function COMPUTE_PAIRINGS(groupA, groupB):
    allowed ← 4×4 boolean matrix where allowed[i][j] = not excluded(A[i], B[j])
    assignment ← array of size 4, initially all -1
    taken ← array of size 4, initially all false
    
    function BACKTRACK(i):
        if i == 4:
            return true  // all A participants paired
        
        for j in 0 to 3:
            if allowed[i][j] AND not taken[j]:
                assignment[i] ← j
                taken[j] ← true
                
                if BACKTRACK(i + 1):
                    return true
                
                assignment[i] ← -1
                taken[j] ← false
        
        return false  // no valid pairing from here
    
    if BACKTRACK(0):
        return [(0, assignment[0]), (1, assignment[1]), (2, assignment[2]), (3, assignment[3])]
    else:
        return null  // no perfect matching exists
```

**Time Complexity**: $O(4! \cdot C) = O(24 \cdot C)$ in worst case, where $C$ is the cost of checking each partial assignment (at most $O(1)$ per step in this problem due to small input size).

**Space Complexity**: $O(1)$ (fixed-size group of 4).

### Pair Assignment for Each Round

Once a perfect matching is computed from groupA and groupB, pairs are assigned as follows:

Let $M = \{(i, \pi(i)) : i = 0, 1, 2, 3\}$ be the matching where $\pi$ is a permutation of $\{0, 1, 2, 3\}$.

#### Round 1 Pairs
$$
\text{Pair}_i = (A_i, B_{\pi(i)}) \quad \text{for } i \in \{0, 1, 2, 3\}
$$

Standing role = A, Seated role = B.

#### Round 2 Pairs
$$
\text{Same pairs as Round 1, but roles swapped}
$$

Standing role = B, Seated role = A.

#### Round 3 Pairs
$$
\text{Pair}_i = (A_i, B_{(\pi(i) + 1) \mod 4}) \quad \text{for } i \in \{0, 1, 2, 3\}
$$

This shifts the pairing by rotating the indices in group B by 1 position.

Standing role = A, Seated role = B.

#### Round 4 Pairs
$$
\text{Same pairs as Round 3, but roles swapped}
$$

Standing role = B, Seated role = A.

### Song Pool Management

**Initial Pool**: Each of the 8 participants submits 2 songs → **16 total songs**.

**Availability Rule**: A song becomes "unavailable" once it is performed in a pair's performance. The song is marked `used: true` and filtered out of future selections.

**Available Song Selection**: For each pair in each round, the available songs are all songs not yet used, excluding:
- Songs submitted by participants in the current pair (to maintain fairness/avoid self-selection)

Formally, for pair $(A_i, B_j)$ at any round:

$$
\text{available songs} = \{s : s.used = \text{false AND } s.\text{submittedBy} \not\in \{A_i, B_j\}\}
$$

**Design Rationale**: By Round 4, song variety ensures each pair experiences different musical contexts. With strategic song submission (mix of energetic/calm), the available pool for later rounds balances both vibes.

---

## Developer Notes

### Architecture Overview

The application is a **monorepo** with two main workspaces:

```
MM4E/
├── root package.json (workspace definition)
├── server/                    # Node.js Express + WebSocket backend
│   ├── src/
│   │   ├── index.ts          # Server entry point
│   │   ├── config.ts         # Configuration (port, etc.)
│   │   ├── state/            # Game state management
│   │   │   ├── store.ts      # In-memory state store
│   │   │   ├── types.ts      # Type definitions
│   │   │   └── persist.ts    # Disk persistence
│   │   ├── engine/           # Game logic
│   │   │   ├── pairingAlgo.ts    # Perfect matching algorithm
│   │   │   ├── roundBuilder.ts   # Round structure generation
│   │   │   ├── phaseRunner.ts    # Phase state machine
│   │   │   └── songPool.ts       # Song availability logic
│   │   ├── ws/               # WebSocket
│   │   │   ├── wsServer.ts   # WebSocket server setup
│   │   │   ├── handlers.ts   # Message handlers
│   │   │   └── broadcast.ts  # State broadcasting
│   │   └── http/             # HTTP API
│   │       └── router.ts     # Express routes
│   ├── tsconfig.json
│   └── package.json
│
└── client/                    # React + Vite frontend
    ├── src/
    │   ├── main.tsx          # React entry point
    │   ├── App.tsx           # Root component
    │   ├── components/       # Reusable UI components
    │   ├── phases/           # Phase-specific UI (PhaseDispatcher routes to these)
    │   ├── views/            # Organizer/Participant/Display views
    │   ├── socket/           # WebSocket client utilities
    │   │   ├── useSocket.ts  # Custom React hook for WebSocket
    │   │   └── protocol.ts   # Message types
    │   ├── store/            # Zustand store (game state)
    │   │   └── gameStore.ts
    │   └── index.css         # Tailwind styles
    ├── tsconfig.json
    ├── vite.config.ts
    ├── tailwind.config.js
    └── package.json
```

### Key Modules

#### Server: `src/state/types.ts`
Core data structures:

```typescript
interface Participant {
  id: string;
  name: string;
  pinHash: string;           // Bcrypt hash (never broadcast)
  role: "A" | "B" | null;
  songs: Song[];
  exclusions: string[];      // Participant IDs
  songsSubmitted: boolean;
  exclusionsSubmitted: boolean;
}

interface Pair {
  id: string;
  roundNumber: 1 | 2 | 3 | 4;
  pairIndex: 0 | 1 | 2 | 3;
  participantA: string;
  participantB: string;
  availableSongs: string[];  // Song IDs available for this pair
  selectedSong: string | null;
  songVotes: Record<string, string>;  // participantId → songId
  selectedProp: Prop | null;
  selectedFurniture: Furniture[];
  propsSubmittedBy: string | null;
  propsConfirmedBy: string | null;
}

interface GameState {
  phase: PhaseId;  // Current game phase
  participants: SafeParticipant[];  // pinHash stripped
  rounds: Round[];
  drawRevealComplete: boolean;
  pairingFeasible: boolean;
  updatedAt: string;
}
```

#### Server: `src/engine/pairingAlgo.ts`
Core pairing logic:

- `computePairings(groupA, groupB)`: Implements backtracking to find a perfect bipartite matching respecting exclusions
- `buildPairsForRound(orderedA, orderedB, roundNumber, shifted)`: Constructs pair objects from group orderings and round-specific shifts

#### Server: `src/engine/phaseRunner.ts`
Game flow orchestration:

- `handleAddParticipant`: Adds participant in setup phase
- `handleAdvancePhase`: State transitions between phases; validates preconditions
- `handleComputePairings`: Triggers the pairing algorithm; validates feasibility
- `handleDrawComplete`, `handleVoteSong`, `handleBreakSongTie`, etc.: Handles user actions

#### Client: `src/phases/`
Each phase has a corresponding React component:

- `SetupPhase.tsx`: Participant registration + organizer management
- `SongSubmissionPhase.tsx`: Submit songs with vibe classification
- `ExclusionPhase.tsx`: Set exclusions; displays feasibility warnings
- `RoleSelectionPhase.tsx`: Choose Standing (A) or Seated (B)
- `PairingComputedPhase.tsx`: Display that pairings are computed
- `DrawPhase.tsx`: Animated slot machine for role assignment
- `SongSelectPhase.tsx`: Pair votes on available songs; organizer breaks ties
- `PropSelectPhase.tsx`: Submit and confirm props/furniture
- `PerformPhase.tsx`: Display performance info; organizer advances
- `CompletePhase.tsx`: Game conclusion screen

#### Client: `src/components/`
Reusable UI components:

- `PairCard.tsx`: Displays pair information
- `PhaseHeader.tsx`: Current phase/round/pair label
- `SongCard.tsx`: Audio/video link with vibe tag
- `VoteButton.tsx`: Interactive voting UIs
- `SlotMachine.tsx`: Animated draw reveal
- `PropGrid.tsx`: Prop/furniture selection UI
- `PinGate.tsx`: PIN authentication entry

### WebSocket Protocol

#### Connection Flow
1. Client connects to `/ws`
2. Server broadcasts current `GameState` to all connected clients

#### Message Types (Client → Server)

```typescript
// Participant Management
{ type: "ADD_PARTICIPANT", name: string, pin: string }
{ type: "REMOVE_PARTICIPANT", participantId: string }
{ type: "AUTHENTICATE", participantId: string, pin: string }  // Set participantId session

// Global Phase Control
{ type: "ADVANCE_PHASE" }
{ type: "COMPUTE_PAIRINGS" }

// Participant Actions
{ type: "SUBMIT_SONGS", participantId: string, songs: Song[] }
{ type: "SET_EXCLUSIONS", participantId: string, excludedIds: string[] }
{ type: "SELECT_ROLE", participantId: string, role: "A" | "B" }
{ type: "VOTE_SONG", participantId: string, songId: string }
{ type: "BREAK_SONG_TIE", songId: string }
{ type: "SUBMIT_PROPS", participantId: string, prop: Prop, furniture: Furniture[] }
{ type: "CONFIRM_PROPS", participantId: string }
{ type: "DRAW_COMPLETE" }
```

#### Message Types (Server → Client - Broadcast)

```typescript
{ type: "STATE_UPDATE", gameState: GameState }
{ type: "ERROR", message: string }
```

### State Persistence

- **Disk Persistence**: `src/state/persist.ts` saves/loads `InternalGameState` (with pinHash) to/from `server/src/data/state.json`
- **Broadcasts**: After every state mutation, state is persisted and broadcasted to all connected clients
- **Recovery**: On server restart, previous state is loaded from disk

### Client State Management

- **Zustand Store**: `src/store/gameStore.ts` holds:
  - `gameState: GameState` (safe, no pinHash)
  - `error: string | null`
  - Subscribe/refetch mechanisms
- **WebSocket Hook**: `src/socket/useSocket.ts` manages connection and message sending

### User Authentication

- **PIN-based**: Each participant has a 4-digit PIN hashed with bcrypt
- **Organizer Mode**: Special organizer account with fixed PIN (configured in `.env`)
- **Display Mode**: Read-only view for projecting to audience; no authentication needed

### Views

Each view (Organizer, Participant, Display) receives different information:

- **OrganizerView**: Full control; sees all participants, can advance phases, break ties
- **ParticipantView**: Only their data visible; votes/selections are private; read-only for others' data
- **DisplayView**: Projection-friendly; shows current pair, song, props, no participant UI controls

### Configuration

Environment variables in `.env` (or `.env.example`):

```bash
PORT=3000                      # Server port
NODE_ENV=development|production
ORGANIZER_PIN=1234            # PIN for organizer
VITE_API_URL=http://localhost:3000  # For client
```

### Testing & Debugging

#### Manual Testing Checklist

- [ ] Setup phase: Add 8 participants with unique names
- [ ] Song submission: Each participant submits 2 songs
- [ ] Exclusion setting: All participants set some exclusions (test feasibility warnings)
- [ ] Role selection: 4 choose Standing, 4 choose Seated
- [ ] Pairing computation: Verify no errors; inspect round structure
- [ ] Round 1, Pair 0:
  - [ ] Draw animates correctly
  - [ ] Song selection displays available songs (not by pair members)
  - [ ] Organizer can break ties
  - [ ] Props/furniture selection works
  - [ ] Performance info displays correctly
- [ ] Fast-forward through all 4 rounds × 4 pairs
- [ ] Verify completion phase

#### Live Inspection

- **WebSocket Messages**: Open browser DevTools → Network → WS → Messages to see real-time messages
- **Server Logs**: Check terminal running `npm run dev --workspace=server` for detailed logs
- **Game State**: Inspect `server/src/data/state.json` to see persisted state

### Performance Considerations

- **Backtracking Algorithm**: $O(\text{factorial})$ worst case, but with 4 participants, negligible
- **Song Pool**: Linear scan to filter available songs; $O(n \text{ participants} \times 2)$ per pair
- **WebSocket Broadcasts**: Entire game state is sent to all clients on every change; consider diff/patch optimization for large-scale deployments

### Future Enhancements

- [ ] Database integration (currently JSON file)
- [ ] Spectator mode with real-time leaderboard
- [ ] Prop/furniture points or scoring system
- [ ] Music streaming integration (Spotify API playback)
- [ ] Automatic music selection based on vibe/energy balance
- [ ] Multi-event persistence (replay past games)
- [ ] Accessibility features (captions, mode descriptions)
- [ ] Mobile-responsive UI refinements
- [ ] Recording/replay of performances

---

## Technical Stack

### Backend
- **Node.js** (ES modules, TypeScript)
- **Express.js** (HTTP API)
- **WebSocket** (ws library) for real-time state sync
- **Bcrypt** for PIN hashing
- **UUID** for entity IDs
- **TypeScript** for type safety

### Frontend
- **React 18** with TypeScript
- **Vite** build tool
- **React Router** (v6) for multi-view navigation
- **Zustand** for state management
- **Tailwind CSS** + PostCSS for styling
- **Framer Motion** for animations (slot machine, phase transitions)

### Deployment
- **Railway.json** prepared for Railway hosting
- **Docker** compatible (Node.js base image)
- **Production Build**: `npm run build` generates optimized client + server

---

## Getting Started

### Installation

```bash
# Clone repository
git clone <repo-url>
cd MM4E

# Install dependencies (root + workspaces)
npm install

# Install dotenv if not already
npm install dotenv --workspace=server
```

### Configuration

Create a `.env` file in the root:

```bash
PORT=3000
NODE_ENV=development
ORGANIZER_PIN=1234
```

### Running Locally

```bash
# Development (both server and client watch mode)
npm run dev

# Client will be at http://localhost:5173
# Server at http://localhost:3000
```

### Building for Production

```bash
npm run build

# To run built version:
NODE_ENV=production npm start --workspace=server
# Client is auto-served by Express from dist/
```

### Heroku/Railway Deployment

```json
{
  "buildpacks": [
    { "url": "heroku/nodejs" }
  ],
  "scripts": {
    "web": "npm start --workspace=server"
  }
}
```

On Railway: Connect repo → auto-deploy on git push.

---

## Notes for Organizers

### Tips for Running a Game

1. **Participant Selection**: Works best with 8 people who are comfortable with physical activity and improvisation.
2. **Venue Setup**: Ensure clear space for standing and seated participants. Have fun props/furniture available.
3. **Music**: Quality speakers strongly recommended for audible songs during performances.
4. **Timing**: Each round takes ~10-15 minutes depending on song lengths and improv style.
5. **Engagement**: The draw animation and props add energy; encourage audience participation/cheering.
6. **Fairness**: Exclusions are respected; if someone excludes too many people, it may block valid pairings.

### Accessibility

- Provide alternative participation options for those unable to perform physically (judge, props master, etc.).
- Offer different role types or simplified movements as needed.
- Ensure audio descriptions of phases for those with visual impairments.

---

## License & Attribution

This project was created as a tool for hosting MM4E games. Feel free to adapt, extend, and use for non-commercial events.

---

**Questions or Issues?** Check the server/client package.json scripts, review phase logic in `src/engine/phaseRunner.ts`, or inspect the state in `server/src/data/state.json`.

Good luck, and have fun perfoming! 🎉✨
