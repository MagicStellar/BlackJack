export type Suit = "clubs" | "diamonds" | "hearts" | "spades";
export type Rank = "A" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "J" | "Q" | "K";

export interface Card {
  id: string; // unique per dealt instance, e.g. "AS-1"
  suit: Suit;
  rank: Rank;
  faceUp: boolean;
}

export type ItemType = "peek" | "forceHit" | "cardSwap" | "shield" | "redraw";

export interface Item {
  id: string;
  type: ItemType;
}

export interface PlayerState {
  id: string;
  sessionId: string;
  name: string;
  hand: Card[];
  inventory: Item[]; // max length 3
  status: "active" | "eliminated";
  standing: boolean; // has this player stood this round
  shieldPending: boolean; // true after the player taps Shield, until it blocks a bullet
  forcedHit: boolean; // whether player is forced to hit on next turn
  isBot?: boolean;
  score?: number;
  isBusted?: boolean;
}

export interface DealerState {
  hand: Card[];
  score?: number;
  isBusted?: boolean;
}

export type RoundPhase =
  | "lobby"
  | "dealing"
  | "playerTurns"
  | "dealerResolve"
  | "scoring"
  | "rouletteCheck"
  | "roundEnd"
  | "matchEnd";

export interface RoundState {
  roundNumber: number;
  phase: RoundPhase;
  activePlayerId: string | null;
  turnOrder: string[];
  dealer: DealerState;
  lowestFinisherId: string | null;
  topFinisherId: string | null;
  roundWinnerItemAwarded?: {
    playerId: string;
    itemType: ItemType;
  } | null;
  peekInfo?: {
    playerId: string;
    bulletInChamber: boolean;
  } | null;
  turnExpiresAt?: number;
  turnDuration?: number;
}

export interface MatchState {
  matchId: string;
  players: Record<string, PlayerState>;
  round: RoundState;
  winnerId: string | null;
  createdAt: number;
}

// Client -> Server messages
export interface JoinPayload {
  name: string;
}

export interface UseItemPayload {
  itemId: string;
  targetPlayerId?: string;
  sourceCardId?: string;
  targetCardId?: string;
}

// Server -> Client animation & event signals
export interface RouletteCheckStartedEvent {
  playerId: string;
  playerName: string;
  shieldActive: boolean;
}

export interface RouletteCheckResolvedEvent {
  playerId: string;
  playerName: string;
  isEliminated: boolean;
  shieldUsed: boolean;
  chamberNumber: number; // 1 to 6
  bulletChamber: number; // 1 to 6
}

export interface NotificationEvent {
  id: string;
  type: "info" | "warning" | "danger" | "success" | "item";
  title: string;
  message: string;
  timestamp: number;
}
