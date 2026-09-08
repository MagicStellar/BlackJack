import React, { useState } from 'react';
import { PlayerState, Item, Card } from '../../../../shared/types';
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
  X
} from 'lucide-react';

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

  if (!myPlayer || myPlayer.status === 'eliminated') {
    return null;
  }

  const isPlayerTurnsPhase = phase === 'playerTurns';
  const canAct = isMyTurn && isPlayerTurnsPhase && !myPlayer.standing && !myPlayer.isBusted;

  const handleHit = () => {
    if (canAct) net.hit();
  };

  const handleStand = () => {
    if (canAct) net.stand();
  };

  const handleItemClick = (item: Item) => {
    if (item.type === 'shield') {
      // Shield is passive
      return;
    }

    if (item.type === 'peek') {
      net.useItem({ itemId: item.id });
      return;
    }

    if (item.type === 'redraw') {
      // If 1 or 2 cards, redraw default or open simple card picker
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
    if (!selectedItem) return;

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
    <div className="w-full max-w-4xl mx-auto px-4 py-2">
      {/* Bottom Floating Action Bar */}
      <div className="bg-bg-surface/95 border border-neutral-800 backdrop-blur-md rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Inventory Section */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center md:justify-start">
          <span className="text-xs uppercase tracking-widest text-text-muted font-serif hidden sm:inline">
            Inventory ({myPlayer.inventory.length}/3):
          </span>

          <div className="flex items-center gap-2">
            {[0, 1, 2].map((slotIdx) => {
              const item = myPlayer.inventory[slotIdx];
              if (item) {
                const info = (ITEM_INFO as any)[item.type] || { name: item.type, description: '' };
                const isPassive = item.type === 'shield';
                return (
                  <button
                    key={item.id || slotIdx}
                    onClick={() => handleItemClick(item)}
                    className={`relative flex items-center gap-2 px-3 py-2 rounded-xl border transition-all duration-200 group ${
                      isPassive
                        ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 cursor-default'
                        : 'bg-neutral-900/90 border-accent-gold/40 hover:border-accent-gold hover:bg-neutral-800 shadow-md active:scale-95'
                    }`}
                  >
                    {getItemIcon(item.type)}
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-text-primary capitalize">
                        {info.name}
                      </span>
                      <span className="text-[10px] text-text-muted hidden sm:inline">
                        {isPassive ? 'Passive Protection' : 'Use Item'}
                      </span>
                    </div>

                    {/* Tooltip Hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 rounded-lg bg-bg-base border border-accent-gold/50 text-[11px] text-text-primary opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-xl">
                      <div className="font-bold text-accent-gold">{info.name}</div>
                      <div className="text-text-muted mt-0.5">{info.description}</div>
                    </div>
                  </button>
                );
              }
              return (
                <div
                  key={slotIdx}
                  className="w-12 h-12 rounded-xl border border-dashed border-neutral-800 bg-black/30 flex items-center justify-center text-neutral-700 text-xs"
                >
                  Empty
                </div>
              );
            })}
          </div>
        </div>

        {/* Turn Action Buttons: HIT & STAND */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-center">
          <button
            onClick={handleHit}
            disabled={!canAct}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-serif text-base font-bold uppercase tracking-wider transition-all duration-200 shadow-lg ${
              canAct
                ? 'bg-gradient-to-r from-accent-gold to-accent-goldDark text-neutral-950 hover:brightness-110 active:scale-95 ring-2 ring-accent-goldLight/40'
                : 'bg-neutral-800/80 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <Hand className="w-5 h-5" />
            Hit
          </button>

          <button
            onClick={handleStand}
            disabled={!canAct}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-serif text-base font-bold uppercase tracking-wider transition-all duration-200 shadow-lg ${
              canAct
                ? 'bg-neutral-800 text-accent-gold border border-accent-gold/60 hover:bg-neutral-700 active:scale-95'
                : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            Stand
          </button>
        </div>
      </div>

      {/* Item Targeting Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
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

            {/* Target Player Selector */}
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

            {/* Card Swap specific pickers */}
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
        </div>
      )}
    </div>
  );
};
