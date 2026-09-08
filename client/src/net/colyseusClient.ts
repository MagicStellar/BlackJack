import { Client, Room } from 'colyseus.js';
import { useGameStore } from '../store/gameStore';
import { sounds } from '../components/AudioController/SoundEffects';
import {
  UseItemPayload,
  RouletteCheckStartedEvent,
  RouletteCheckResolvedEvent,
  NotificationEvent
} from '../../../shared/types';

class ColyseusNetworkManager {
  private client: Client | null = null;
  private room: Room | null = null;

  public async connect(playerName: string, hostUrl?: string): Promise<Room> {
    const store = useGameStore.getState();
    store.setConnectionState(false, true, null);

    const wsUrl =
      hostUrl ||
      (window.location.hostname === 'localhost'
        ? 'ws://localhost:2567'
        : import.meta.env.VITE_COLYSEUS_URL);

    try {
      this.client = new Client(wsUrl);
      this.room = await this.client.joinOrCreate('blackjack_room', { name: playerName });

      store.setConnectionState(true, false, null);
      store.setMySession(this.room.sessionId, `player-${this.room.sessionId}`);

      // Setup state synchronization
      this.room.onStateChange((state) => {
        store.syncStateFromRoom(state);
      });

      // Custom server event listeners
      this.room.onMessage('rouletteCheckStarted', (event: RouletteCheckStartedEvent) => {
        sounds.playCylinderSpin();
        store.startRouletteScene(event);
      });

      this.room.onMessage('rouletteCheckResolved', (event: RouletteCheckResolvedEvent) => {
        if (event.isEliminated) {
          sounds.playGunshot();
        } else if (event.shieldUsed) {
          sounds.playShieldDeflect();
        } else {
          sounds.playDryClick();
        }
        store.resolveRouletteScene(event);
      });

      this.room.onMessage('peekResult', (data: { bulletInChamber: boolean }) => {
        store.setPeekResult(data);
      });

      this.room.onMessage('notification', (event: NotificationEvent) => {
        store.addNotification(event);
        if (event.type === 'item') {
          sounds.playItemUse();
        } else if (event.type === 'danger' && event.title === 'Bust!') {
          sounds.playDryClick();
        }
      });

      this.room.onMessage('matchEnded', (data: { winnerId: string; winnerName: string }) => {
        sounds.playVictoryFanfare();
      });

      this.room.onError((code, message) => {
        store.setConnectionState(false, false, `Error (${code}): ${message}`);
      });

      this.room.onLeave((code) => {
        store.setConnectionState(false, false, `Disconnected (code ${code})`);
      });

      return this.room;
    } catch (err: any) {
      store.setConnectionState(false, false, err.message || 'Failed to connect to server');
      throw err;
    }
  }

  public hit() {
    if (this.room) {
      sounds.playCardDeal();
      this.room.send('hit');
    }
  }

  public stand() {
    if (this.room) {
      sounds.playCardFlip();
      this.room.send('stand');
    }
  }

  public useItem(payload: UseItemPayload) {
    if (this.room) {
      this.room.send('useItem', payload);
    }
  }

  public addBots() {
    if (this.room) {
      this.room.send('addBots');
    }
  }

  public restartMatch() {
    if (this.room) {
      this.room.send('restartMatch');
    }
  }

  public disconnect() {
    if (this.room) {
      this.room.leave();
      this.room = null;
    }
    useGameStore.getState().setConnectionState(false, false, null);
  }
}

export const net = new ColyseusNetworkManager();
