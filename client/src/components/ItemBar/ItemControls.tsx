import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { PlayerState, Item } from '../../../../shared/types';
import { net } from '../../net/colyseusClient';
import { ITEM_INFO } from '../../theme/tokens';
import {
  Hand,
  CheckCircle,
  Eye,
  Shield,
  RefreshCw,
  Repeat,
  ArrowDownCircle,
  HelpCircle,
  X,
  Clock
} from 'lucide-react';
import { useTurnCountdown } from '../../store/useTurnCountdown';

interface ItemControlsProps {
  myPlayer: PlayerState | undefined;
  isMyTurn: boolean;
  phase: string;
  allPlayers: Record<string, PlayerState>;
}

export const ItemControls: React.FC<ItemControlsProps> = ({
  myPlayer,
  isMyTurn,
  phase,
  allPlayers
}) => {
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [targetPlayerId, setTargetPlayerId] = useState<string>('');
  const [myCardId, setMyCardId] = useState<string>('');
  const [targetCardId, setTargetCardId] = useState<string>('');
  const { timeLeft, isUrgent } = useTurnCountdown();

  if (!myPlayer || myPlayer.status === 'eliminated') {
    return null;
  }

  const isPlayerTurnsPhase = phase === 'playerTurns';
  const canAct = isMyTurn && isPlayerTurnsPhase && !myPlayer.standing && !myPlayer.isBusted;
  const canUseBeforeRoulette = ['dealing', 'playerTurns', 'dealerResolve', 'scoring'].includes(phase);
  const canShield = canUseBeforeRoulette && !myPlayer.shieldPending;

  const canUseItem = (type: string) => {
    if (type === 'shield') return canShield;
    if (type === 'peek') return canUseBeforeRoulette;
    return canAct;
  };

  useEffect(() => {
    if (!canAct) setSelectedItem(null);
  }, [canAct]);

  const handleHit = () => {
    if (canAct) net.hit();
  };

  const handleStand = () => {
    if (canAct) net.stand();
  };

  const handleItemClick = (item: Item) => {
    if (!canUseItem(item.type)) return;

    if (item.type === 'peek' || item.type === 'shield') {
      net.useItem({ itemId: item.id });
      return;
    }

    if (item.type === 'redraw') {
      if (myPlayer.hand.length > 0) {
        net.useItem({ itemId: item.id, sourceCardId: myPlayer.hand[myPlayer.hand.length - 1].id });
      }
      return;
    }

    // Items requiring target (Force Hit, Card Swap)
    setSelectedItem(item);
    const firstOpponent = Object.values(allPlayers).find(
      p => p.id !== myPlayer.id && p.status === 'active'
    );
    if (firstOpponent) {
      setTargetPlayerId(firstOpponent.id);
    }
  };

  const executeTargetedItem = () => {
    if (!selectedItem || !canAct) return;

    if (selectedItem.type === 'forceHit') {
      net.useItem({
        itemId: selectedItem.id,
        targetPlayerId
      });
      setSelectedItem(null);
    } else if (selectedItem.type === 'cardSwap') {
      const myCard = myCardId || myPlayer.hand[0]?.id;
      const targetP = Object.values(allPlayers).find(p => p.id === targetPlayerId);
      const targetCard = targetCardId || targetP?.hand[0]?.id;

      net.useItem({
        itemId: selectedItem.id,
        targetPlayerId,
        sourceCardId: myCard,
        targetCardId: targetCard
      });
      setSelectedItem(null);
    }
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'peek': return <Eye className="w-5 h-5 text-cyan-400" />;
      case 'forceHit': return <ArrowDownCircle className="w-5 h-5 text-amber-400" />;
      case 'cardSwap': return <Repeat className="w-5 h-5 text-purple-400" />;
      case 'shield': return <Shield className="w-5 h-5 text-emerald-400" />;
      case 'redraw': return <RefreshCw className="w-5 h-5 text-amber-300" />;
      default: return <HelpCircle className="w-5 h-5 text-accent-gold" />;
    }
  };

  const activeOpponents = Object.values(allPlayers).filter(
    p => p.id !== myPlayer.id && p.status === 'active'
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2">
      {/* Bottom Floating Action Bar */}
      <div className="flex flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Inventory Section */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-text-muted font-serif hidden md:inline">
            Items:
          </span>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {[0, 1, 2].map((slotIdx) => {
              const item = myPlayer.inventory[slotIdx];
              if (item) {
                const info = (ITEM_INFO as any)[item.type] || { name: item.type, description: '' };
                const usable = canUseItem(item.type);
                const waitHint =
                  item.type === 'peek' || item.type === 'shield'
                    ? 'Usable until the cylinder spins'
                    : 'Only on your turn';
                return (
                  <button
                    key={item.id || slotIdx}
                    onClick={() => handleItemClick(item)}
                    disabled={!usable}
                    className={`relative flex items-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl border transition-all duration-200 group ${
                      usable
                        ? 'bg-neutral-900/90 border-accent-gold/40 hover:border-accent-gold hover:bg-neutral-800 shadow-md active:scale-95'
                        : 'bg-neutral-900/50 border-neutral-800 text-neutral-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {getItemIcon(item.type)}
                    <div className="flex flex-col text-left hidden sm:flex">
                      <span className="text-xs font-semibold text-text-primary capitalize">
                        {info.name}
                      </span>
                      <span className="text-[9px] text-text-muted hidden lg:inline">
                        {usable ? 'Use' : waitHint}
                      </span>
                    </div>

                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 sm:w-48 p-2 rounded-lg bg-bg-base border border-accent-gold/50 text-[11px] text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                      <div className="font-bold text-accent-gold">{info.name}</div>
                      <div className="text-text-muted mt-0.5">{info.description}</div>
                      <div className="text-accent-gold/80 mt-1 text-[10px]">
                        {waitHint}
                      </div>
                    </div>
                  </button>
                );
              }
              return (
                <div
                  key={slotIdx}
                  className="w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl border border-dashed border-neutral-800 bg-black/30 flex items-center justify-center text-neutral-600 text-[10px]"
                >
                  —
                </div>
              );
            })}
          </div>
        </div>

        {/* Turn Action Buttons: HIT & STAND */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 justify-center">
          {canAct && timeLeft > 0 && (
            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg sm:rounded-xl border font-mono font-bold text-xs transition-all ${
                isUrgent
                  ? 'bg-danger-red/25 border-danger-red text-danger-glow animate-pulse shadow-[0_0_12px_rgba(229,72,77,0.5)]'
                  : 'bg-neutral-900 border-accent-gold/40 text-accent-gold shadow-sm'
              }`}
              title="Time left to choose an action"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s</span>
            </div>
          )}

          <button
            onClick={handleHit}
            disabled={!canAct}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-serif text-xs sm:text-base font-bold uppercase tracking-wider transition-all duration-200 shadow-lg ${
              canAct
                ? 'bg-gradient-to-r from-accent-gold to-accent-goldDark text-neutral-950 hover:brightness-110 active:scale-95 ring-2 ring-accent-goldLight/40'
                : 'bg-neutral-800/80 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <Hand className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Hit
          </button>

          <button
            onClick={handleStand}
            disabled={!canAct}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-serif text-xs sm:text-base font-bold uppercase tracking-wider transition-all duration-200 shadow-lg ${
              canAct
                ? 'bg-neutral-800 text-accent-gold border border-accent-gold/60 hover:bg-neutral-700 active:scale-95'
                : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
            Stand
          </button>
        </div>

        <div className="hidden sm:flex flex-col items-end shrink-0 px-3 py-1.5 rounded-xl bg-neutral-900/80 border border-neutral-800 min-w-[108px]">
          <span className="text-[8px] uppercase tracking-[0.18em] text-text-muted font-semibold">Your Hand</span>
          <span className={`font-serif font-bold text-lg leading-tight ${
            myPlayer.isBusted ? 'text-danger-glow' : 'text-accent-gold'
          }`}>
            {myPlayer.hand.length === 0 ? '—' : myPlayer.isBusted ? 'BUST' : (myPlayer.score ?? '—')}
          </span>
        </div>
      </div>

      {/* Portal to body so backdrop-blur on the footer can't trap `fixed` */}
      {selectedItem && createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-bg-surface border border-accent-gold/60 rounded-2xl p-6 shadow-gold-glow">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-text-primary"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              {getItemIcon(selectedItem.type)}
              <div>
                <h3 className="font-serif text-lg font-bold text-text-primary capitalize">
                  Activate {selectedItem.type}
                </h3>
                <p className="text-xs text-text-muted">Select target player to apply effect</p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                Select Target Opponent:
              </label>
              <div className="grid grid-cols-1 gap-2">
                {activeOpponents.map((opp) => (
                  <button
                    key={opp.id}
                    onClick={() => setTargetPlayerId(opp.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-sm transition-all ${
                      targetPlayerId === opp.id
                        ? 'bg-accent-gold/20 border-accent-gold text-accent-gold font-bold shadow-md'
                        : 'bg-neutral-900 border-neutral-800 text-text-primary hover:bg-neutral-800'
                    }`}
                  >
                    <span>{opp.name}</span>
                    <span className="text-xs text-text-muted">Hand: {opp.hand.length} cards</span>
                  </button>
                ))}
              </div>
            </div>

            {selectedItem.type === 'cardSwap' && (
              <div className="space-y-3 mb-4">
                <div className="text-xs text-text-muted">
                  Will swap your card with target player's card.
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setSelectedItem(null)}
                className="px-4 py-2 rounded-xl text-xs uppercase tracking-wider text-text-muted hover:text-text-primary"
              >
                Cancel
              </button>
              <button
                onClick={executeTargetedItem}
                disabled={!targetPlayerId}
                className="px-5 py-2.5 rounded-xl bg-accent-gold text-neutral-950 font-serif font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-md"
              >
                Confirm & Use
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};
