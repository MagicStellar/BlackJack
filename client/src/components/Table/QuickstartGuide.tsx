import React from 'react';
import { X, Spade, Target, Shield, Eye, RefreshCw, Repeat, ArrowDownCircle } from 'lucide-react';

interface QuickstartGuideProps {
  onClose: () => void;
}

export const QuickstartGuide: React.FC<QuickstartGuideProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-2xl bg-bg-surface border-2 border-accent-gold/50 rounded-2xl shadow-gold-glow overflow-hidden flex flex-col max-h-[90vh]">

        {/* ── Header ── */}
        <div className="relative shrink-0 px-6 pt-6 pb-4 border-b border-neutral-800 bg-gradient-to-b from-felt-dark/60 to-transparent">
          {/* Dismiss immediately */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-neutral-800 transition-colors"
            title="Close guide"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-gold/20 border border-accent-gold/50 flex items-center justify-center text-accent-gold font-serif font-black text-xl">♠</div>
            <div>
              <h2 className="font-serif text-xl font-bold text-text-primary">How to Play — Blackjack Roulette</h2>
              <p className="text-xs text-text-muted mt-0.5">Buckshot Roulette meets the blackjack table</p>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 text-sm">

          {/* Core loop */}
          <section className="space-y-3">
            <h3 className="font-serif text-base font-bold text-accent-gold tracking-wide flex items-center gap-2">
              <Target className="w-4 h-4" /> The Core Loop
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  step: '1',
                  title: 'Play Blackjack',
                  desc: 'Everyone gets 2 cards. Hit (draw more) or Stand (lock in). Try to reach 21 without going over.',
                  color: 'border-accent-gold/40 bg-accent-gold/5',
                },
                {
                  step: '2',
                  title: 'Rank & Reward',
                  desc: '1st place earns a random item. Last place gets something worse — the gun.',
                  color: 'border-state-safe/40 bg-state-safe/5',
                },
                {
                  step: '3',
                  title: 'Roulette Check',
                  desc: '6 chambers, 1 bullet. Last place pulls the trigger. Survive = next round. Hit = eliminated.',
                  color: 'border-danger-red/50 bg-danger-red/5',
                },
              ].map(({ step, title, desc, color }) => (
                <div key={step} className={`p-3.5 rounded-xl border ${color} space-y-1.5`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-[10px] font-black text-accent-gold">{step}</span>
                    <span className="font-serif font-bold text-text-primary text-sm">{title}</span>
                  </div>
                  <p className="text-[11px] text-text-muted leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Blackjack scoring */}
          <section className="space-y-2">
            <h3 className="font-serif text-base font-bold text-accent-gold tracking-wide">Card Values</h3>
            <div className="flex flex-wrap gap-2 text-[11px]">
              {[
                { label: 'A (Ace)', val: '1 or 11', cls: 'text-amber-300 border-amber-500/30 bg-amber-950/30' },
                { label: '2–9', val: 'Face Value', cls: 'text-text-muted border-neutral-700 bg-neutral-900' },
                { label: '10, J, Q, K', val: '10 pts each', cls: 'text-text-muted border-neutral-700 bg-neutral-900' },
                { label: 'Bust', val: '>21 = Last', cls: 'text-danger-glow border-danger-red/40 bg-danger-red/10' },
                { label: 'Tie-break', val: 'Fewer cards wins', cls: 'text-cyan-300 border-cyan-700/40 bg-cyan-950/20' },
              ].map(({ label, val, cls }) => (
                <div key={label} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${cls}`}>
                  <span className="font-bold">{label}:</span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Items */}
          <section className="space-y-2">
            <h3 className="font-serif text-base font-bold text-accent-gold tracking-wide flex items-center gap-2">
              <Shield className="w-4 h-4" /> Survival Items (max 3 in inventory)
            </h3>
            <div className="space-y-2">
              {ITEMS.map(item => (
                <div key={item.name} className={`flex items-start gap-3 p-3 rounded-xl border ${item.borderCls}`}>
                  <div className={`shrink-0 w-7 h-7 rounded-lg flex items-center justify-center ${item.iconBg}`}>
                    {item.icon}
                  </div>
                  <div>
                    <div className={`font-serif font-bold text-sm ${item.textCls}`}>{item.name}</div>
                    <div className="text-[11px] text-text-muted leading-relaxed mt-0.5">{item.desc}</div>
                    <div className="text-[10px] text-accent-gold/60 mt-1 font-medium">{item.cost}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 space-y-1.5">
            <h3 className="font-serif text-sm font-bold text-accent-gold">💡 Quick Tips</h3>
            <ul className="text-[11px] text-text-muted space-y-1 list-disc list-inside leading-relaxed">
              <li>You can use an item AND still hit/stand in the same turn.</li>
              <li>Shield is passive — it auto-blocks the bullet if you have it equipped and get hit.</li>
              <li>Peek early if you're nervous about the roulette round.</li>
              <li>Use Force Hit on someone at 18+ to potentially bust them.</li>
              <li>You don't have to play items. Saving them for later is often smarter.</li>
            </ul>
          </section>
        </div>

        {/* ── Footer CTA ── */}
        <div className="shrink-0 px-6 pb-5 pt-3 border-t border-neutral-800">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-accent-gold to-accent-goldDark text-neutral-950 font-serif font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-gold-glow flex items-center justify-center gap-2"
          >
            Got it — Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

const ITEMS = [
  {
    name: '👁️ Chamber Peek',
    desc: "Preview whether the upcoming roulette check is loaded or empty before the cylinder spins. Only you see the result.",
    cost: 'Does NOT consume your turn.',
    icon: <Eye className="w-4 h-4 text-cyan-400" />,
    iconBg: 'bg-cyan-950/50 border border-cyan-600/40',
    textCls: 'text-cyan-300',
    borderCls: 'border-cyan-700/30 bg-cyan-950/10',
  },
  {
    name: '🛡️ Aegis Shield',
    desc: "Passively blocks the next fatal roulette bullet. Automatically consumed at the moment of impact — no manual activation needed.",
    cost: 'Passive — consumed automatically on elimination trigger.',
    icon: <Shield className="w-4 h-4 text-emerald-400" />,
    iconBg: 'bg-emerald-950/50 border border-emerald-600/40',
    textCls: 'text-emerald-300',
    borderCls: 'border-emerald-700/30 bg-emerald-950/10',
  },
  {
    name: '🔄 Redraw',
    desc: "Discard your worst card and draw a fresh replacement from the deck. Great for escaping a bust or soft hand.",
    cost: 'Does NOT consume your turn.',
    icon: <RefreshCw className="w-4 h-4 text-amber-300" />,
    iconBg: 'bg-amber-950/50 border border-amber-600/40',
    textCls: 'text-amber-300',
    borderCls: 'border-amber-700/30 bg-amber-950/10',
  },
  {
    name: '🔁 Card Swap',
    desc: "Trade one of your cards with a chosen opponent's card. Use it to sabotage someone near 21, or rescue yourself from a bust.",
    cost: 'Does NOT consume your turn. Select opponent when prompted.',
    icon: <Repeat className="w-4 h-4 text-purple-400" />,
    iconBg: 'bg-purple-950/50 border border-purple-600/40',
    textCls: 'text-purple-300',
    borderCls: 'border-purple-700/30 bg-purple-950/10',
  },
  {
    name: '⬇️ Force Hit',
    desc: "Curse an opponent to draw an extra card on their next turn. Highly effective against players sitting pretty at 18–20.",
    cost: 'Does NOT consume your turn. Select target when prompted.',
    icon: <ArrowDownCircle className="w-4 h-4 text-orange-400" />,
    iconBg: 'bg-orange-950/50 border border-orange-600/40',
    textCls: 'text-orange-300',
    borderCls: 'border-orange-700/30 bg-orange-950/10',
  },
];
