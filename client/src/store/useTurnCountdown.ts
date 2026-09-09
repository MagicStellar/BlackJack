import { useState, useEffect } from 'react';
import { useGameStore } from './gameStore';

export function useTurnCountdown() {
  const { turnExpiresAt, turnDuration, phase, activePlayerId } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (phase !== 'playerTurns' || !turnExpiresAt || turnExpiresAt <= 0) {
      setTimeLeft(0);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((turnExpiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
    };

    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [turnExpiresAt, phase, activePlayerId]);

  return {
    timeLeft,
    turnDuration: turnDuration || 30,
    isUrgent: timeLeft > 0 && timeLeft <= 5,
  };
}
