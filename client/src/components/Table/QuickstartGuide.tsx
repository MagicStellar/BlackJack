import React from 'react';
import { X, Target, Shield } from 'lucide-react';

interface QuickstartGuideProps {
  onClose: () => void;
}

export const QuickstartGuide: React.FC<QuickstartGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-lg bg-bg-surface border-2 border-accent-gold/50 rounded-2xl shadow-gold-glow overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-neutral-800 transition-colors"
          title="Close guide"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 pt-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3 pr-8">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/20 border border-accent-gold/50 flex items-center justify-center text-accent-gold font-serif font-black text-xl">♠</div>
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">How to Play</h2>
              <p className="text-xs text-text-muted mt-0.5">Play blackjack. Last place faces the revolver.</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4 text-sm">
          <section className="space-y-2">
            <h3 className="font-serif text-base font-bold text-danger-glow tracking-wide flex items-center gap-2">
              <Target className="w-4 h-4" /> Who faces the revolver
            </h3>
            <ul className="text-[13px] text-text-muted space-y-2 leading-relaxed list-disc list-inside">
              <li>If anyone busted, last place is a busted player — not the person with 12 or 14 who stayed in.</li>
              <li>If several people busted, the one with more cards faces the gun.</li>
              <li>If nobody busted, the lowest total faces it. Same score → the one with more cards is last.</li>
            </ul>
          </section>

          <section className="p-3.5 rounded-xl border border-accent-gold/30 bg-accent-gold/5">
            <h3 className="font-serif text-sm font-bold text-accent-gold tracking-wide flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4" /> Items
            </h3>
            <p className="text-[13px] text-text-muted leading-relaxed">
              Peek checks the next chamber, Shield auto-blocks a bullet, Redraw replaces one of your cards, Swap trades a card with an opponent, and Force Hit makes them draw — Peek anytime before the gun; the rest only on your turn; Shield is passive.
            </p>
          </section>
        </div>

        <div className="px-6 pb-5 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-gold to-accent-goldDark text-neutral-950 font-serif font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-gold-glow"
          >
            Got it — Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};
