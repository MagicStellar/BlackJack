import React from 'react';
import { PlayerState, Card } from '../../../../shared/types';
import { PlayingCard } from './PlayingCard';
import { Shield, Bot, User, Skull, Lock, AlertCircle } from 'lucide-react';

const ITEM_EMOJI: Record<string, { emoji: string; label: string; color: string }> = {
  peek:      { emoji: '👁️', label: 'Chamber Peek',  color: 'text-cyan-400'   },
  shield:    { emoji: '🛡️', label: 'Aegis Shield',  color: 'text-emerald-400' },
  redraw:    { emoji: '🔄', label: 'Redraw',         color: 'text-amber-300'  },
  cardSwap:  { emoji: '🔁', label: 'Card Swap',      color: 'text-purple-400' },
  forceHit:  { emoji: '⬇️', label: 'Force Hit',      color: 'text-orange-400' },
};

interface PlayerSeatProps {
  player: PlayerState;
  isActiveTurn: boolean;
  isMe: boolean;
  onSelectCard?: (card: Card) => void;
  selectedCardId?: string;
  selectableCards?: boolean;
  compact?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isActiveTurn,
  isMe,
  onSelectCard,
  selectedCardId,
  selectableCards = false,
  compact = false,
}) => {
  const isEliminated = player.status === 'eliminated';

  return (
    <div
      className={`flex flex-col items-center gap-1 transition-all duration-300 ${
        isEliminated ? 'opacity-35 grayscale' : ''
      } ${compact ? 'scale-[0.88]' : ''}`}
    >
      {/* ── Name / score capsule ── */}
      <div
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] transition-all duration-300 whitespace-nowrap ${
          isActiveTurn
            ? 'bg-bg-elevated border-accent-gold ring-2 ring-accent-gold/40 shadow-gold-glow scale-105 font-bold'
            : isEliminated
            ? 'bg-neutral-900/70 border-neutral-700 text-state-eliminated'
            : isMe
            ? 'bg-bg-surface border-accent-gold/50 text-text-primary'
            : 'bg-bg-surface/90 border-neutral-800 text-text-muted'
        }`}
      >
        {/* Avatar icon */}
        <div
          className={`shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
            isEliminated
              ? 'bg-neutral-800 text-neutral-500'
              : isActiveTurn
              ? 'bg-accent-gold text-neutral-950 font-bold'
              : 'bg-neutral-800 text-accent-gold'
          }`}
        >
          {isEliminated ? <Skull className="w-3 h-3 text-danger-red" /> :
           player.isBot   ? <Bot className="w-3 h-3" />                  :
                            <User className="w-3 h-3" />}
        </div>

        {/* Name — truncated */}
        <span className="truncate font-medium" style={{ maxWidth: compact ? '72px' : '100px' }}>
          {player.name}
        </span>

        {/* YOU tag */}
        {isMe && (
          <span className="shrink-0 text-[9px] px-1 py-0.5 rounded bg-accent-gold/20 text-accent-gold font-black leading-none">
            YOU
          </span>
        )}

        {/* Shield indicator */}
        {player.shieldPending && !isEliminated && (
          <span className="shrink-0 text-emerald-400" title="Aegis Shield active">
            <Shield className="w-3 h-3" />
          </span>
        )}

        {/* Force-hit indicator */}
        {player.forcedHit && !isEliminated && (
          <span className="shrink-0 text-amber-400 animate-pulse" title="Forced to hit next turn">
            <AlertCircle className="w-3 h-3" />
          </span>
        )}

        {/* Score badge */}
        {!isEliminated && player.hand.length > 0 && (
          <span
            className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded font-bold font-serif ${
              player.isBusted
                ? 'bg-danger-red/30 text-danger-glow border border-danger-red/50'
                : player.score === 21
                ? 'bg-accent-gold text-neutral-950'
                : 'bg-neutral-800 text-text-primary border border-neutral-700'
            }`}
          >
            {player.isBusted ? 'BUST' : player.score}
          </span>
        )}

        {/* Stood lock */}
        {player.standing && !player.isBusted && !isEliminated && (
          <span className="shrink-0 text-accent-gold/70" title="Stood">
            <Lock className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* ── Cards ── */}
      <div
        className="flex items-center justify-center"
        style={{ minHeight: compact ? '72px' : '92px' }}
      >
        {player.hand.length === 0 ? (
          <div
            className={`rounded-lg border-2 border-dashed border-felt-line/35 flex items-center justify-center text-felt-line/40 text-[9px] ${
              compact ? 'w-12 h-[68px]' : 'w-14 h-[84px]'
            }`}
          >
            —
          </div>
        ) : (
          <div className={`flex items-center ${compact ? '-space-x-9' : '-space-x-8'}`}>
            {player.hand.map((card, idx) => (
              <PlayingCard
                key={card.id || `${player.id}-${idx}`}
                card={card}
                index={idx}
                isSelected={selectedCardId === card.id}
                onClick={() => onSelectCard?.(card)}
                selectable={selectableCards}
                compact={compact}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Inventory bar ── */}
      <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-bg-surface/70 border border-neutral-800/60">
        {player.inventory.length === 0 ? (
          <span className="text-[9px] text-text-muted px-1">No items</span>
        ) : (
          player.inventory.slice(0, 3).map((item, i) => {
            const info = ITEM_EMOJI[item.type];
            return (
              <div
                key={item.id || i}
                className="relative group"
                title={info?.label ?? item.type}
              >
                <div className="w-5 h-5 rounded bg-neutral-900 border border-neutral-700/80 flex items-center justify-center text-[11px] cursor-default select-none hover:scale-125 transition-transform">
                  {info?.emoji ?? item.type[0].toUpperCase()}
                </div>
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-50 pointer-events-none">
                  <div className={`whitespace-nowrap text-[9px] font-bold px-1.5 py-0.5 rounded bg-neutral-950 border border-neutral-700 ${info?.color ?? 'text-accent-gold'}`}>
                    {info?.label ?? item.type}
                  </div>
                </div>
              </div>
            );
          })
        )}
        {/* Overflow count */}
        {player.inventory.length > 3 && (
          <span className="text-[9px] text-text-muted font-bold">+{player.inventory.length - 3}</span>
        )}
      </div>
    </div>
  );
};
