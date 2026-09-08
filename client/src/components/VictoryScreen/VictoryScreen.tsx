import React, { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { net } from '../../net/colyseusClient';
import { Trophy, RotateCcw, Skull, Award, Flame } from 'lucide-react';
import confetti from 'canvas-confetti';

export const VictoryScreen: React.FC = () => {
  const { winnerId, players, roundNumber } = useGameStore();

  const winner = Object.values(players).find(p => p.id === winnerId);
  const isMeWinner = winner?.sessionId === useGameStore.getState().mySessionId;

  useEffect(() => {
    // Launch celebratory noir gold confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#C9A24B', '#E8C676', '#EDE6D6', '#0F3D2E']
    });
  }, []);

  const handleRestart = () => {
    net.restartMatch();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-lg p-4 animate-fade-in">
      <div className="relative w-full max-w-lg bg-bg-surface border-2 border-accent-gold/60 rounded-3xl p-8 shadow-gold-glow text-center space-y-6 overflow-hidden">
        {/* Top Gold Halo Graphic */}
        <div className="w-20 h-20 rounded-full bg-accent-gold/20 border border-accent-gold mx-auto flex items-center justify-center text-accent-gold shadow-gold-glow">
          <Trophy className="w-10 h-10 animate-bounce-short text-accent-gold" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/40 text-accent-gold text-xs uppercase tracking-widest font-bold">
            Match Decided — Sole Survivor
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-text-primary">
            {winner ? winner.name : 'Unknown Champion'}
          </h2>

          <p className="text-sm text-text-muted">
            {isMeWinner
              ? 'Congratulations! You outplayed the table and survived every chamber!'
              : 'Survived all rounds and outlasted the chamber.'}
          </p>
        </div>

        {/* Match Recap Stats Box */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-left">
          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-accent-gold" /> Total Rounds
            </div>
            <div className="text-base font-serif font-bold text-text-primary">
              {roundNumber} Rounds
            </div>
          </div>

          <div className="space-y-1">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
              <Skull className="w-3.5 h-3.5 text-danger-red" /> Eliminations
            </div>
            <div className="text-base font-serif font-bold text-text-primary">
              3 Casualties
            </div>
          </div>
        </div>

        {/* Restart Rematch Button */}
        <div className="pt-2">
          <button
            onClick={handleRestart}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-gold to-accent-goldDark text-neutral-950 font-serif font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-gold-glow flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Play Rematch (Reset Lobby)
          </button>
        </div>
      </div>
    </div>
  );
};
