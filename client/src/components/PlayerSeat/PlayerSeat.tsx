import React from 'react';
import { PlayerState, Card } from '../../../../shared/types';
import { PlayingCard } from './PlayingCard';
import { Shield, Bot, User, Skull, Lock, AlertCircle, Clock } from 'lucide-react';
import { useTurnCountdown } from '../../store/useTurnCountdown';

const ITEM_EMOJI: Record<string, { emoji: string; label: string; color: string }> = {
  peek:      { emoji: '👁️', label: 'Chamber Peek',  color: 'text-cyan-400'   },
  shield:    { emoji: '🛡️', label: 'Aegis Shield',  color: 'text-emerald-400' },
  redraw:    { emoji: '🔄', label: 'Redraw',         color: 'text-amber-300'  },
  cardSwap:  { emoji: '🔁', label: 'Card Swap',      color: 'text-purple-400' },
  forceHit:  { emoji: '⬇️', label: 'Force Hit',      color: 'text-orange-400' },
};

const DEALER_BUST_PCT: Record<string, number> = {
  A: 17, '2': 35, '3': 37, '4': 40, '5': 42, '6': 42,
  '7': 26, '8': 24, '9': 23, '10': 23, J: 23, Q: 23, K: 23,
};

function describeHand(hand: Card[]): { label: string; total: number; isSoft: boolean } | null {
  if (hand.length === 0) return null;
  let total = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.rank === 'A') {
      aces++;
      total += 11;
    } else if (['K', 'Q', 'J', '10'].includes(card.rank)) {
      total += 10;
    } else {
      total += parseInt(card.rank, 10);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces--;
  }
  const isSoft = aces > 0 && total <= 21;
  if (total > 21) return { label: `Bust ${total}`, total, isSoft: false };
  return { label: `${isSoft ? 'Soft' : 'Hard'} ${total}`, total, isSoft };
}

interface PlayerSeatProps {
  player: PlayerState;
  isActiveTurn: boolean;
  isMe: boolean;
  phase?: string;
  onSelectCard?: (card: Card) => void;
  selectedCardId?: string;
  selectableCards?: boolean;
  compact?: boolean;
  dealerUpRank?: string;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isActiveTurn,
  isMe,
  phase = '',
  onSelectCard,
  selectedCardId,
  selectableCards = false,
  compact = false,
  dealerUpRank,
}) => {
  const { timeLeft, isUrgent } = useTurnCountdown();
  const isEliminated = player.status === 'eliminated';
  const isScoringPhase = ['scoring', 'rouletteCheck', 'roundEnd', 'matchEnd'].includes(phase);
  const revealCards = isMe || isScoringPhase;
  const handInfo = revealCards ? describeHand(player.hand) : null;
  const useCompactCards = compact && !isMe;

  const scoreBadge = !isEliminated && player.hand.length > 0 && (
    <span
      className={`shrink-0 text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded font-bold font-serif ${
        !revealCards
          ? 'bg-neutral-800/80 text-text-muted border border-neutral-700/70 tracking-wider'
          : player.isBusted
          ? 'bg-danger-red/30 text-danger-glow border border-danger-red/50'
          : player.score === 21
          ? 'bg-accent-gold text-neutral-950'
          : 'bg-neutral-800 text-text-primary border border-neutral-700'
      }`}
    >
      {!revealCards ? '???' : player.isBusted ? 'BUST' : player.score}
    </span>
  );

  const statusIcons = (
    <>
      {player.shieldPending && !isEliminated && (
        <span className="shrink-0 text-emerald-400" title="Aegis Shield armed">
          <Shield className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </span>
      )}
      {player.forcedHit && !isEliminated && (
        <span className="shrink-0 text-amber-400 animate-pulse" title="Forced to hit next turn">
          <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
        </span>
      )}
      {player.standing && !player.isBusted && !isEliminated && (
        <span className="shrink-0 text-accent-gold/70" title="Stood">
          <Lock className="w-2.5 h-2.5" />
        </span>
      )}
    </>
  );

  const turnTimer =
    isActiveTurn && phase === 'playerTurns' && timeLeft > 0 ? (
      <span
        className={`flex items-center justify-center gap-0.5 px-1.5 py-0.5 rounded font-mono font-bold text-[9px] sm:text-[10px] transition-colors ${
          isUrgent
            ? 'bg-danger-red/30 text-danger-glow border border-danger-red/60 animate-pulse shadow-[0_0_8px_rgba(229,72,77,0.5)]'
            : 'bg-accent-gold/20 text-accent-gold border border-accent-gold/40'
        }`}
        title="Time remaining to choose an action"
      >
        <Clock className="w-2.5 h-2.5" />
        <span>{timeLeft}s</span>
      </span>
    ) : null;

  const nameTag = (
    <div
      className={`flex items-center justify-center gap-1 sm:gap-1.5 w-full px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full border text-[10px] sm:text-[11px] transition-colors duration-300 shadow-sm ${
        isMe
          ? 'bg-neutral-950 border-accent-gold text-text-primary font-bold'
          : isActiveTurn
          ? 'bg-bg-elevated border-accent-gold font-bold'
          : isEliminated
          ? 'bg-neutral-900/70 border-neutral-700 text-state-eliminated'
          : 'bg-neutral-950/90 border-neutral-700 text-text-muted'
      }`}
    >
      <div
        className={`shrink-0 w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center ${
          isEliminated
            ? 'bg-neutral-800 text-neutral-500'
            : isActiveTurn || isMe
            ? 'bg-accent-gold text-neutral-950 font-bold'
            : 'bg-neutral-800 text-accent-gold'
        }`}
      >
        {isEliminated ? <Skull className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-danger-red" /> :
         player.isBot   ? <Bot className="w-2.5 h-2.5 sm:w-3 sm:h-3" />                  :
                          <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />}
      </div>

      <span className="truncate font-medium min-w-0">
        {isMe ? 'YOU' : player.name}
      </span>

      {statusIcons}
      {scoreBadge}
    </div>
  );

  const cards = (
    <div className="flex items-center justify-center overflow-visible py-2" style={{ minHeight: useCompactCards ? '104px' : '128px' }}>
      {player.hand.length === 0 ? (
        <div className={`rounded-md sm:rounded-lg border-2 border-dashed border-felt-line/35 flex items-center justify-center text-felt-line/40 text-[9px] aspect-[5/7] ${
          useCompactCards ? 'w-14 sm:w-16' : 'w-16 sm:w-[4.5rem]'
        }`}>
          —
        </div>
      ) : (
        <div className={`flex items-center overflow-visible ${useCompactCards ? '-space-x-3 sm:-space-x-4' : '-space-x-4 sm:-space-x-5'}`}>
          {player.hand.map((card, idx) => (
            <PlayingCard
              key={card.id || `${player.id}-${idx}`}
              card={revealCards ? { ...card, faceUp: true } : { ...card, faceUp: false }}
              index={idx}
              compact={useCompactCards}
              isSelected={selectedCardId === card.id}
              onClick={() => onSelectCard?.(card)}
              selectable={selectableCards && revealCards}
            />
          ))}
        </div>
      )}
    </div>
  );

  const inventory = !isMe && player.inventory.length > 0 && (
    <div className="flex items-center gap-0.5 sm:gap-1 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-md sm:rounded-lg bg-bg-surface/80 border border-neutral-800/60 shadow-sm">
      {player.inventory.slice(0, 3).map((item, i) => {
          const info = ITEM_EMOJI[item.type];
          return (
            <div key={item.id || i} className="relative group" title={info?.label ?? item.type}>
              <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-[9px] sm:text-[11px] cursor-default select-none hover:scale-125 transition-transform">
                {info?.emoji ?? item.type[0].toUpperCase()}
              </div>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block z-50 pointer-events-none">
                <div className={`whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-700 ${info?.color ?? 'text-accent-gold'}`}>
                  {info?.label ?? item.type}
                </div>
              </div>
            </div>
          );
        })}
      {player.inventory.length > 3 && (
        <span className="text-[8px] sm:text-[9px] text-text-muted font-bold">+{player.inventory.length - 3}</span>
      )}
    </div>
  );

  const hint =
    isMe && handInfo && !isEliminated && player.hand.length > 0 ? (
      <p className="text-[9px] sm:text-[10px] text-state-safe font-medium text-center max-w-[240px] leading-tight">
        {player.isBusted ? 'Busted' : handInfo.label}
        {dealerUpRank ? ` • Dealer Shows ${dealerUpRank}` : ''}
        {dealerUpRank && DEALER_BUST_PCT[dealerUpRank] != null && !player.isBusted
          ? ` (Dealer Bust Risk: ${DEALER_BUST_PCT[dealerUpRank]}%)`
          : ''}
      </p>
    ) : null;

  return (
    <div
      className={`flex flex-col items-center gap-1 sm:gap-1.5 w-full transition-opacity duration-300 ${
        isEliminated ? 'opacity-35 grayscale' : ''
      }`}
    >
      {nameTag}
      {turnTimer}
      {cards}
      {hint}
      {inventory}
    </div>
  );
};
