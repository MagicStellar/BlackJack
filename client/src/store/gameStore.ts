import { create } from 'zustand';
import {
  MatchState,
  PlayerState,
  Card,
  Item,
  RoundPhase,
  RouletteCheckStartedEvent,
  RouletteCheckResolvedEvent,
  NotificationEvent
} from '../../../shared/types';

interface GameStoreState {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  mySessionId: string | null;
  myPlayerId: string | null;
  playerName: string;

  // Synced room state
  matchId: string;
  isStarted: boolean;
  players: Record<string, PlayerState>;
  phase: RoundPhase;
  roundNumber: number;
  activePlayerId: string | null;
  turnOrder: string[];
  dealerCards: Card[];
  dealerScore: number;
  dealerBusted: boolean;
  lowestFinisherId: string | null;
  topFinisherId: string | null;
  winnerId: string | null;
  turnExpiresAt: number;
  turnDuration: number;

  // Roulette dramatic scene state
  rouletteActive: boolean;
  rouletteTargetPlayer: { id: string; name: string; shieldActive: boolean } | null;
  rouletteResolved: RouletteCheckResolvedEvent | null;
  rouletteChamberSpinning: boolean;
  screenShake: boolean;
  flashBang: boolean;

  // Peek outcome modal
  peekResult: { bulletInChamber: boolean } | null;

  // Notifications feed
  notifications: NotificationEvent[];

  // Actions
  setConnectionState: (connected: boolean, connecting: boolean, error?: string | null) => void;
  setMySession: (sessionId: string, playerId: string) => void;
  setPlayerName: (name: string) => void;
  syncStateFromRoom: (state: any) => void;
  startRouletteScene: (data: RouletteCheckStartedEvent) => void;
  resolveRouletteScene: (data: RouletteCheckResolvedEvent) => void;
  closeRouletteScene: () => void;
  setPeekResult: (result: { bulletInChamber: boolean } | null) => void;
  addNotification: (notification: NotificationEvent) => void;
  triggerScreenShake: () => void;
  triggerFlashBang: () => void;
}

export const useGameStore = create<GameStoreState>((set, get) => ({
  isConnected: false,
  isConnecting: false,
  error: null,
  mySessionId: null,
  myPlayerId: null,
  playerName: localStorage.getItem('bj_player_name') || 'Player 1',

  matchId: '',
  isStarted: false,
  players: {},
  phase: 'lobby',
  roundNumber: 1,
  activePlayerId: null,
  turnOrder: [],
  dealerCards: [],
  dealerScore: 0,
  dealerBusted: false,
  lowestFinisherId: null,
  topFinisherId: null,
  winnerId: null,
  turnExpiresAt: 0,
  turnDuration: 30,

  rouletteActive: false,
  rouletteTargetPlayer: null,
  rouletteResolved: null,
  rouletteChamberSpinning: false,
  screenShake: false,
  flashBang: false,

  peekResult: null,
  notifications: [],

  setConnectionState: (connected, connecting, error = null) => {
    set({ isConnected: connected, isConnecting: connecting, error });
  },

  setMySession: (sessionId, playerId) => {
    set({ mySessionId: sessionId, myPlayerId: playerId });
  },

  setPlayerName: (name) => {
    localStorage.setItem('bj_player_name', name);
    set({ playerName: name });
  },

  syncStateFromRoom: (schemaState: any) => {
    if (!schemaState) return;

    const playersRecord: Record<string, PlayerState> = {};
    if (schemaState.players) {
      schemaState.players.forEach((p: any, key: string) => {
        const handArr: Card[] = [];
        if (p.hand) {
          p.hand.forEach((c: any) => {
            handArr.push({
              id: c.id,
              suit: c.suit,
              rank: c.rank,
              faceUp: c.faceUp
            });
          });
        }

        const invArr: Item[] = [];
        if (p.inventory) {
          p.inventory.forEach((i: any) => {
            invArr.push({
              id: i.id,
              type: i.type
            });
          });
        }

        playersRecord[key] = {
          id: p.id,
          sessionId: p.sessionId,
          name: p.name,
          hand: handArr,
          inventory: invArr,
          status: p.status,
          standing: p.standing,
          shieldPending: p.shieldPending,
          forcedHit: p.forcedHit,
          isBot: p.isBot,
          score: p.score,
          isBusted: p.isBusted
        };
      });
    }

    const dealerArr: Card[] = [];
    if (schemaState.round && schemaState.round.dealer && schemaState.round.dealer.hand) {
      schemaState.round.dealer.hand.forEach((c: any) => {
        dealerArr.push({
          id: c.id,
          suit: c.suit,
          rank: c.rank,
          faceUp: c.faceUp
        });
      });
    }

    const turnOrderArr: string[] = [];
    if (schemaState.round && schemaState.round.turnOrder) {
      schemaState.round.turnOrder.forEach((id: string) => turnOrderArr.push(id));
    }

    set({
      matchId: schemaState.matchId || '',
      isStarted: schemaState.isStarted || false,
      players: playersRecord,
      phase: (schemaState.round?.phase as RoundPhase) || 'lobby',
      roundNumber: schemaState.round?.roundNumber || 1,
      activePlayerId: schemaState.round?.activePlayerId || null,
      turnOrder: turnOrderArr,
      dealerCards: dealerArr,
      dealerScore: schemaState.round?.dealer?.score || 0,
      dealerBusted: schemaState.round?.dealer?.isBusted || false,
      lowestFinisherId: schemaState.round?.lowestFinisherId || null,
      topFinisherId: schemaState.round?.topFinisherId || null,
      winnerId: schemaState.winnerId || null,
      turnExpiresAt: schemaState.round?.turnExpiresAt || 0,
      turnDuration: schemaState.round?.turnDuration || 30,
    });
  },

  startRouletteScene: (data) => {
    set({
      rouletteActive: true,
      rouletteTargetPlayer: {
        id: data.playerId,
        name: data.playerName,
        shieldActive: data.shieldActive
      },
      rouletteResolved: null,
      rouletteChamberSpinning: true
    });
  },

  resolveRouletteScene: (data) => {
    set({
      rouletteResolved: data,
      rouletteChamberSpinning: false
    });
    if (data.isEliminated) {
      get().triggerScreenShake();
      get().triggerFlashBang();
    }
  },

  closeRouletteScene: () => {
    set({
      rouletteActive: false,
      rouletteTargetPlayer: null,
      rouletteResolved: null,
      rouletteChamberSpinning: false
    });
  },

  setPeekResult: (result) => {
    set({ peekResult: result });
  },

  addNotification: (notification) => {
    set(state => ({
      notifications: [notification, ...state.notifications].slice(0, 8)
    }));
  },

  triggerScreenShake: () => {
    set({ screenShake: true });
    setTimeout(() => set({ screenShake: false }), 800);
  },

  triggerFlashBang: () => {
    set({ flashBang: true });
    setTimeout(() => set({ flashBang: false }), 1200);
  }
}));
