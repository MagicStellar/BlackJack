import React, { useEffect, useState } from 'react';
import { Card as CardType } from '../../../../shared/types';

interface PlayingCardProps {
  card: CardType;
  index?: number;
  isSelected?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  compact?: boolean;
}

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  hearts: { symbol: '♥', color: 'text-red-500' },
  diamonds: { symbol: '♦', color: 'text-red-500' },
  clubs: { symbol: '♣', color: 'text-neutral-900' },
  spades: { symbol: '♠', color: 'text-neutral-900' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  index = 0,
  isSelected = false,
  onClick,
  selectable = false,
  compact = false,
}) => {
  const suitInfo = SUIT_SYMBOLS[card.suit] || { symbol: '♠', color: 'text-neutral-900' };
  const [shownFaceUp, setShownFaceUp] = useState(card.faceUp);
  const [tilting, setTilting] = useState(false);

  useEffect(() => {
    if (card.faceUp === shownFaceUp) return;
    setTilting(true);
    const swap = window.setTimeout(() => {
      setShownFaceUp(card.faceUp);
      setTilting(false);
    }, 160);
    return () => window.clearTimeout(swap);
  }, [card.faceUp, shownFaceUp]);

  const widthClass = compact
    ? 'w-14 sm:w-16'
    : 'w-16 sm:w-[4.5rem]';
  const rankClass = compact
    ? 'text-[10px] sm:text-[11px] font-bold font-serif leading-none'
    : 'text-sm font-bold font-serif leading-none';
  const pipClass = compact
    ? 'text-[8px] sm:text-[9px] leading-none'
    : 'text-xs leading-none';
  const centerClass = compact ? 'text-lg sm:text-xl' : 'text-2xl';

  return (
    <div
      onClick={selectable ? onClick : undefined}
      style={{ animationDelay: `${index * 120}ms` }}
      className={`relative ${widthClass} aspect-[5/7] shrink-0 animate-card-deal select-none ${
        selectable ? 'cursor-pointer hover:-translate-y-1.5 active:scale-95' : ''
      } ${isSelected ? '-translate-y-2 ring-2 ring-accent-gold shadow-gold-glow' : ''}`}
    >
      <div
        className="w-full h-full transition-transform duration-150 ease-in"
        style={{ transform: tilting ? 'rotateY(90deg)' : 'rotateY(0deg)' }}
      >
        {shownFaceUp ? (
          <div className={`w-full h-full rounded-md sm:rounded-lg bg-gradient-to-br from-[#FDFBF7] to-[#EDE6D6] border border-neutral-300 flex flex-col justify-between shadow-card box-border ${
            compact ? 'px-1 py-1' : 'px-1.5 py-1.5 sm:px-2 sm:py-2'
          }`}>
            <div className="flex flex-col items-start gap-0 leading-none">
              <span className={`${rankClass} ${suitInfo.color}`}>{card.rank}</span>
              <span className={`${pipClass} ${suitInfo.color}`}>{suitInfo.symbol}</span>
            </div>
            <div className="flex items-center justify-center">
              <span className={`${centerClass} ${suitInfo.color} select-none leading-none`}>
                {suitInfo.symbol}
              </span>
            </div>
            <div className="flex flex-col items-end gap-0 leading-none" style={{ transform: 'rotate(180deg)' }}>
              <span className={`${rankClass} ${suitInfo.color}`}>{card.rank}</span>
              <span className={`${pipClass} ${suitInfo.color}`}>{suitInfo.symbol}</span>
            </div>
          </div>
        ) : (
          <div className="w-full h-full rounded-md sm:rounded-lg bg-neutral-900 border sm:border-2 border-[#8F6E25] p-1 flex items-center justify-center shadow-card box-border">
            <div className="w-full h-full rounded card-back-pattern flex items-center justify-center border border-accent-gold/40">
              <div className="w-5 h-5 sm:w-7 sm:h-7 rounded-full border border-accent-gold/60 flex items-center justify-center bg-black/40">
                <span className="text-accent-gold text-[8px] sm:text-xs font-serif font-bold">BR</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
