import React from 'react';
import { Card as CardType } from '../../../../shared/types';

interface PlayingCardProps {
  card: CardType;
  index?: number;
  isSelected?: boolean;
  onClick?: () => void;
  selectable?: boolean;
  compact?: boolean;
}

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string; fill: string }> = {
  hearts: { symbol: '♥', color: 'text-red-500', fill: '#ef4444' },
  diamonds: { symbol: '♦', color: 'text-red-500', fill: '#ef4444' },
  clubs: { symbol: '♣', color: 'text-neutral-900', fill: '#171717' },
  spades: { symbol: '♠', color: 'text-neutral-900', fill: '#171717' },
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  index = 0,
  isSelected = false,
  onClick,
  selectable = false,
  compact = false,
}) => {
  const suitInfo = SUIT_SYMBOLS[card.suit] || { symbol: '♠', color: 'text-neutral-900', fill: '#171717' };
  const sizeClass = compact ? 'w-12 h-[72px]' : 'w-14 h-[88px] sm:w-16 sm:h-[96px]';

  return (
    <div
      onClick={selectable ? onClick : undefined}
      style={{ animationDelay: `${index * 120}ms` }}
      className={`relative ${sizeClass} rounded-lg select-none transition-all duration-300 transform animate-card-deal ${
        selectable ? 'cursor-pointer hover:-translate-y-2 hover:shadow-gold-glow' : ''
      } ${
        isSelected ? '-translate-y-3 ring-2 ring-accent-gold shadow-gold-glow' : 'shadow-card'
      }`}
    >
      {card.faceUp ? (
        // Face Up Card
        <div className="w-full h-full rounded-lg bg-gradient-to-br from-[#FDFBF7] to-[#EDE6D6] border border-neutral-300 p-1.5 flex flex-col justify-between overflow-hidden shadow-sm">
          {/* Top Corner Rank & Suit */}
          <div className="flex flex-col items-start leading-none">
            <span className={`text-sm sm:text-base font-bold font-serif ${suitInfo.color}`}>
              {card.rank}
            </span>
            <span className={`text-xs sm:text-sm ${suitInfo.color}`}>
              {suitInfo.symbol}
            </span>
          </div>

          {/* Center Suit Graphic */}
          <div className="flex items-center justify-center -my-2">
            <span className={`text-2xl sm:text-3xl ${suitInfo.color} select-none`}>
              {suitInfo.symbol}
            </span>
          </div>

          {/* Bottom Inverted Rank & Suit */}
          <div className="flex flex-col items-end leading-none rotate-180">
            <span className={`text-sm sm:text-base font-bold font-serif ${suitInfo.color}`}>
              {card.rank}
            </span>
            <span className={`text-xs sm:text-sm ${suitInfo.color}`}>
              {suitInfo.symbol}
            </span>
          </div>
        </div>
      ) : (
        // Face Down Card (Noir Vintage Pattern)
        <div className="w-full h-full rounded-lg bg-neutral-900 border-2 border-[#8F6E25] p-1 flex items-center justify-center overflow-hidden shadow-card">
          <div className="w-full h-full rounded card-back-pattern flex items-center justify-center border border-accent-gold/40">
            <div className="w-7 h-7 rounded-full border border-accent-gold/60 flex items-center justify-center bg-black/40">
              <span className="text-accent-gold text-xs font-serif font-bold">BR</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
