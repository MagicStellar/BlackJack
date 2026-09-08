import React from 'react';
import { Card as CardType } from '../../../../shared/types';
import { PlayingCard } from '../PlayerSeat/PlayingCard';

interface DealerHandProps {
  cards: CardType[];
  score: number;
  isBusted: boolean;
  phase: string;
}

export const DealerHand: React.FC<DealerHandProps> = ({ cards, score, isBusted, phase }) => {
  const isDealerResolving = ['dealerResolve', 'scoring', 'rouletteCheck', 'matchEnd'].includes(phase);

  return (
    <div className="flex flex-col items-center gap-0.5">
      {/* Compact placard */}
      <div className="flex items-center gap-2 px-3 py-0.5 rounded-full bg-bg-surface/90 border border-neutral-700/80 shadow-sm">
        <span className="text-[10px] uppercase tracking-widest font-bold text-accent-gold font-serif">
          House Dealer
        </span>
        {cards.length > 0 && (
          <div
            className={`text-[10px] px-1.5 py-0.5 rounded font-bold font-serif ${
              isBusted
                ? 'bg-danger-red/30 text-danger-glow border border-danger-red/50'
                : 'bg-neutral-800 text-text-primary border border-neutral-700'
            }`}
          >
            {isBusted ? 'BUST' : isDealerResolving ? score : '??'}
          </div>
        )}
      </div>

      {/* Cards — compact so they fit in the top strip */}
      <div className="flex items-center justify-center" style={{ minHeight: '76px' }}>
        {cards.length === 0 ? (
          <div className="w-12 h-[72px] rounded-lg border-2 border-dashed border-felt-line/40 flex items-center justify-center text-felt-line/50 text-[9px]">
            Shoe
          </div>
        ) : (
          <div className="flex items-center -space-x-8">
            {cards.map((card, idx) => (
              <PlayingCard
                key={card.id || `dealer-${idx}`}
                card={card}
                index={idx}
                compact
              />
            ))}
          </div>
        )}
      </div>

      <span className="text-[9px] text-felt-line/70 uppercase tracking-wider">
        Stands on all 17s
      </span>
    </div>
  );
};
