import React from 'react';
import { X, Eye, Shield, RefreshCw, Repeat, ArrowDownCircle, Info } from 'lucide-react';

interface ItemGuideModalProps {
  onClose: () => void;
}

const ITEMS = [
  {
    key: 'peek',
    emoji: '👁️',
    name: 'Chamber Peek',
    tagline: "See the danger before it sees you.",
    howTo: "Tap on the item in your inventory. Instantly reveals if the upcoming roulette check is loaded or empty — visible only to you.",
    tip: "Best used early in a round when you're ranked low. Knowing the chamber lets you decide whether to save your Shield or not.",
    turnCost: 'Free action — does NOT end your turn',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-950/30',
    border: 'border-cyan-600/40',
    glow: 'shadow-[0_0_20px_rgba(34,211,238,0.15)]',
  },
  {
    key: 'shield',
    emoji: '🛡️',
    name: 'Aegis Shield',
    tagline: "One free pass from the chamber.",
    howTo: "Passive — no action required. Sits in your inventory and automatically absorbs the next fatal bullet if you face the roulette check and the chamber is loaded.",
    tip: "Don't burn it manually. Just hold onto it. It fires automatically right before you'd be eliminated. Also shows as a badge on your seat so opponents know you're protected.",
    turnCost: 'Passive — consumed automatically on fatal hit',
    icon: <Shield className="w-5 h-5" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-950/30',
    border: 'border-emerald-600/40',
    glow: 'shadow-[0_0_20px_rgba(52,211,153,0.15)]',
  },
  {
    key: 'redraw',
    emoji: '🔄',
    name: 'Redraw',
    tagline: "One card back. One card forward.",
    howTo: "Tap the item. Your most-recently drawn card is replaced by a fresh card from the shoe. Use it after a bad hit to try correcting course.",
    tip: "Use when you've busted (>21) or when you're stuck on a hand like 15–16 and scared to hit. Doesn't fix your turn — you still need to Hit or Stand after redrawing.",
    turnCost: 'Free action — does NOT end your turn',
    icon: <RefreshCw className="w-5 h-5" />,
    color: 'text-amber-300',
    bg: 'bg-amber-950/30',
    border: 'border-amber-600/40',
    glow: 'shadow-[0_0_20px_rgba(252,211,77,0.12)]',
  },
  {
    key: 'cardSwap',
    emoji: '🔁',
    name: 'Card Swap',
    tagline: "Their best card becomes yours.",
    howTo: "Tap the item, then select a target opponent. One of your cards trades places with one of their cards. Defaults to last-drawn cards on each side.",
    tip: "Best attack: swap onto someone sitting at 19–20. If you give them a 7 or 8 it might push them to bust. Also works defensively: swap your worst card onto a vulnerable opponent.",
    turnCost: 'Free action — does NOT end your turn',
    icon: <Repeat className="w-5 h-5" />,
    color: 'text-purple-400',
    bg: 'bg-purple-950/30',
    border: 'border-purple-600/40',
    glow: 'shadow-[0_0_20px_rgba(192,132,252,0.15)]',
  },
  {
    key: 'forceHit',
    emoji: '⬇️',
    name: 'Force Hit',
    tagline: "Make them draw. Watch them sweat.",
    howTo: "Tap the item, then select a target. On their very next turn they are automatically forced to draw an extra card before they can decide anything.",
    tip: "Most powerful against an opponent who has 18–20 and has already stood. Even better against someone who is already busted — it does nothing to a bust, so pick wisely.",
    turnCost: 'Free action — does NOT end your turn',
    icon: <ArrowDownCircle className="w-5 h-5" />,
    color: 'text-orange-400',
    bg: 'bg-orange-950/30',
    border: 'border-orange-600/40',
    glow: 'shadow-[0_0_20px_rgba(251,146,60,0.15)]',
  },
];

export const ItemGuideModal: React.FC<ItemGuideModalProps> = ({ onClose }) => {
  const [active, setActive] = React.useState(ITEMS[0].key);
  const item = ITEMS.find(i => i.key === active)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/82 backdrop-blur-md p-4">
      <div className="relative w-full max-w-xl bg-bg-surface border-2 border-accent-gold/50 rounded-2xl shadow-gold-glow overflow-hidden flex flex-col max-h-[88vh]">

        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-gradient-to-b from-neutral-900/60 to-transparent">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-accent-gold" />
            <h2 className="font-serif font-bold text-base text-text-primary">Item Reference Guide</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-neutral-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="shrink-0 flex gap-1.5 px-4 pt-3 pb-2 overflow-x-auto">
          {ITEMS.map(i => (
            <button
              key={i.key}
              onClick={() => setActive(i.key)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${
                active === i.key
                  ? `${i.bg} ${i.border} ${i.color} ${i.glow}`
                  : 'bg-neutral-900 border-neutral-800 text-text-muted hover:text-text-primary'
              }`}
            >
              <span>{i.emoji}</span>
              <span className="hidden sm:inline">{i.name}</span>
            </button>
          ))}
        </div>

        {/* Detail panel */}
        <div className="flex-1 overflow-y-auto px-5 pb-5 pt-2 space-y-4">
          {/* Item hero card */}
          <div className={`p-4 rounded-2xl border ${item.border} ${item.bg} ${item.glow} flex items-start gap-4`}>
            <div className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${item.bg} border ${item.border} text-3xl`}>
              {item.emoji}
            </div>
            <div>
              <div className={`font-serif text-lg font-bold ${item.color}`}>{item.name}</div>
              <div className="text-sm text-text-muted italic mt-0.5">"{item.tagline}"</div>
              <div className={`mt-2 text-[11px] font-semibold flex items-center gap-1.5 px-2 py-1 rounded-full border ${item.border} ${item.bg} w-fit ${item.color}`}>
                ✓ {item.turnCost}
              </div>
            </div>
          </div>

          {/* How to use */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] uppercase tracking-widest text-text-muted font-bold">How to use</h4>
            <p className="text-[12px] text-text-primary leading-relaxed bg-neutral-900/80 border border-neutral-800 rounded-xl p-3">
              {item.howTo}
            </p>
          </div>

          {/* Strategy tip */}
          <div className="space-y-1.5">
            <h4 className="text-[11px] uppercase tracking-widest text-accent-gold/70 font-bold">Strategy tip</h4>
            <div className="text-[12px] text-text-primary leading-relaxed bg-accent-gold/8 border border-accent-gold/25 rounded-xl p-3">
              💡 {item.tip}
            </div>
          </div>

          {/* Other items quick summary */}
          <div className="space-y-1.5 pt-1">
            <h4 className="text-[11px] uppercase tracking-widest text-text-muted font-bold">All Items</h4>
            <div className="grid grid-cols-1 gap-1.5">
              {ITEMS.map(i => (
                <button
                  key={i.key}
                  onClick={() => setActive(i.key)}
                  className={`flex items-center gap-2.5 text-left px-3 py-2 rounded-xl border transition-all text-[11px] ${
                    active === i.key
                      ? `${i.bg} ${i.border} ${i.color} font-bold`
                      : 'bg-neutral-900/60 border-neutral-800 text-text-muted hover:bg-neutral-800'
                  }`}
                >
                  <span className="text-base">{i.emoji}</span>
                  <div>
                    <span className="font-semibold">{i.name}</span>
                    <span className="ml-1.5 opacity-60">— {i.tagline}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
