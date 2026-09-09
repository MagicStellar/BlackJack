import React from 'react';
import { Card as CardType } from '../../../../shared/types';
import { PlayingCard } from '../PlayerSeat/PlayingCard';

interface DealerHandProps {
  cards: CardType[];
  score: number;
  isBusted: boolean;
  phase: string;
}

function dealerCaption(cards: CardType[], score: number, isBusted: boolean, revealed: boolean): string {
  if (cards.length === 0) return '';
  if (isBusted && revealed) return 'BUST';
  if (!revealed) {
    const up = cards.find((c) => c.faceUp);
    return up ? `Shows ${up.rank}` : '';
  }

  let total = 0;
  let aces = 0;
  for (const card of cards) {
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
  return isSoft ? `Soft ${score}` : String(score);
}

export const DealerHand: React.FC<DealerHandProps> = ({ cards, score, isBusted, phase }) => {
  const isDealerResolving = ['dealerResolve', 'scoring', 'rouletteCheck', 'matchEnd'].includes(phase);
  const caption = dealerCaption(cards, score, isBusted, isDealerResolving);

  return (
    <div className="flex flex-col items-center gap-1.5 sm:gap-2">
      <div className="flex items-center gap-1.5 px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-full bg-neutral-950/95 border border-neutral-700 shadow-md backdrop-blur-sm">
        <span className="text-[10px] sm:text-xs uppercase tracking-[0.18em] font-black text-text-primary font-serif">
          Dealer
        </span>
        {caption && (
          <span
            className={`text-[10px] sm:text-xs font-bold font-serif ${
              isBusted && isDealerResolving ? 'text-danger-glow' : 'text-text-muted'
            }`}
          >
            {caption}
          </span>
        )}
      </div>

      <div className="flex items-center justify-center overflow-visible min-h-[92px] sm:min-h-[104px] py-2">
        {cards.length === 0 ? (
          <div className="w-14 sm:w-16 aspect-[5/7] rounded-lg border-2 border-dashed border-felt-line/40 flex items-center justify-center text-felt-line/50 text-[10px] font-mono">
            Shoe
          </div>
        ) : (
          <div className="flex items-center -space-x-3 sm:-space-x-4 overflow-visible py-1">
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
    </div>
  );
};
