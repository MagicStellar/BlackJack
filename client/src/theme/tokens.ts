export const TOKENS = {
  bg: {
    base: '#14120F',
    surface: '#1E1B17',
    elevated: '#28241F',
  },
  felt: {
    primary: '#0F3D2E',
    dark: '#08241B',
    line: '#1C5B45',
  },
  accent: {
    gold: '#C9A24B',
    goldLight: '#E8C676',
    goldDark: '#8F6E25',
  },
  danger: {
    red: '#B3261E',
    glow: '#E5484D',
    dark: '#6E130E',
  },
  state: {
    safe: '#4E9E6B',
    eliminated: '#5C5650',
  },
  text: {
    primary: '#EDE6D6',
    muted: '#A69C89',
  }
};

export const ITEM_INFO = {
  peek: {
    name: 'Chamber Peek',
    description: 'Inspect the upcoming roulette chamber to see if danger lurks.',
    icon: 'Eye',
    color: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/30',
  },
  forceHit: {
    name: 'Force Hit',
    description: 'Compel an opponent to draw an extra card on their next turn.',
    icon: 'ArrowDownCircle',
    color: 'text-amber-400 border-amber-500/40 bg-amber-950/30',
  },
  cardSwap: {
    name: 'Card Swap',
    description: 'Trade one of your cards with an opponent to hijack their hand.',
    icon: 'Repeat',
    color: 'text-purple-400 border-purple-500/40 bg-purple-950/30',
  },
  shield: {
    name: 'Aegis Shield',
    description: 'Blocks one fatal roulette bullet automatically if targeted.',
    icon: 'Shield',
    color: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/30',
  },
  redraw: {
    name: 'Redraw',
    description: 'Discard one card from your hand and draw a fresh replacement.',
    icon: 'RefreshCw',
    color: 'text-amber-300 border-amber-500/40 bg-amber-950/30',
  },
};
