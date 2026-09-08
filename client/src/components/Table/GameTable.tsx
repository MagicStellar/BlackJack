import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PlayerSeat } from '../PlayerSeat/PlayerSeat';
import { DealerHand } from '../DealerHand/DealerHand';
import { ItemControls } from '../ItemBar/ItemControls';
import { sounds } from '../AudioController/SoundEffects';
import { QuickstartGuide } from './QuickstartGuide';
import { ItemGuideModal } from './ItemGuideModal';
import { Volume2, VolumeX, Flame, BookOpen } from 'lucide-react';

const QUICKSTART_KEY = 'bj_quickstart_v1_seen';

export const GameTable: React.FC = () => {
  const {
    players, myPlayerId, phase, roundNumber, activePlayerId,
    dealerCards, dealerScore, dealerBusted,
    notifications, screenShake, flashBang, peekResult, setPeekResult,
  } = useGameStore();

  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [showQuickstart, setShowQuickstart] = useState(() => !localStorage.getItem(QUICKSTART_KEY));
  const [showItemGuide, setShowItemGuide] = useState(false);

  const handleToggleSound = () => setIsMuted(sounds.toggleMute());
  const dismissQuickstart = () => {
    localStorage.setItem(QUICKSTART_KEY, '1');
    setShowQuickstart(false);
  };

  const playerList = Object.values(players);
  const myPlayer   = playerList.find(p => p.id === myPlayerId);

  // Reorder so "me" is always index 0
  const seats = React.useMemo(() => {
    const myIdx = playerList.findIndex(p => p.id === myPlayerId);
    if (myIdx === -1) return playerList;
    return Array.from({ length: playerList.length }, (_, i) => playerList[(myIdx + i) % playerList.length]);
  }, [playerList, myPlayerId]);

  // Clock-face assignment:  0=bottom(me)  1=left(9 o'clock)  2=upper-left(11)  3=right(3 o'clock)
  const [me, leftP, upperLeftP, rightP] = seats;

  const phaseLabel = () => {
    switch (phase) {
      case 'dealing':       return 'Dealing Cards…';
      case 'playerTurns': {
        const a = playerList.find(p => p.id === activePlayerId);
        return a ? `${a.name}'s Turn` : 'Player Turns';
      }
      case 'dealerResolve': return 'Dealer Drawing…';
      case 'scoring':       return 'Evaluating Scores…';
      case 'rouletteCheck': return '⚠ ROULETTE CHECK';
      default:              return '';
    }
  };

  return (
    <div
      className={`relative w-full flex flex-col bg-bg-base select-none overflow-hidden ${screenShake ? 'animate-bounce' : ''}`}
      style={{ height: '100dvh' }}
    >
      {/* Flash-bang */}
      {flashBang && <div className="fixed inset-0 z-50 pointer-events-none animate-flash-bang" />}

      {/* ── HEADER ── */}
      <header className="shrink-0 z-20 flex items-center justify-between px-4 py-2 bg-bg-surface/90 border-b border-neutral-800/70 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold font-serif font-black text-sm">♠</div>
          <div className="leading-none">
            <div className="font-serif text-sm font-bold text-text-primary tracking-wide">BLACKJACK ROULETTE</div>
            <div className="text-[9px] text-text-muted tracking-widest uppercase">Noir Survival</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neutral-900 border border-accent-gold/30 text-[11px] font-serif text-accent-gold">
            <Flame className="w-3 h-3" />
            <span className="font-bold">Round {roundNumber}</span>
          </div>
          {phaseLabel() && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900/90 border border-neutral-700 text-[11px] text-text-primary max-w-[220px] truncate">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${phase === 'rouletteCheck' ? 'bg-danger-red animate-pulse' : 'bg-accent-gold animate-pulse'}`} />
              {phaseLabel()}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowItemGuide(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-neutral-900 border border-accent-gold/30 text-accent-gold hover:bg-neutral-800 transition-colors text-[11px] font-semibold"
            title="Item Guide">
            <BookOpen className="w-3.5 h-3.5" /> Items
          </button>
          <button onClick={handleToggleSound}
            className="p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-text-muted hover:text-accent-gold transition-colors">
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── MAIN TABLE ── */}
      <main className="relative flex-1 flex items-center justify-center overflow-hidden p-2">

        {/* Oval felt table — fills most of the viewport */}
        <div
          className="relative table-wood-rim shadow-2xl"
          style={{ width: 'min(98vw, 1160px)', height: 'min(75vh, 600px)', borderRadius: '50%', padding: '10px' }}
        >
          <div className="relative w-full h-full table-felt overflow-hidden" style={{ borderRadius: '50%' }}>
            {/* Inner ring */}
            <div className="absolute inset-4 pointer-events-none" style={{ borderRadius: '50%', border: '1px solid rgba(28,91,69,0.30)' }} />
            {/* Spotlight */}
            <div className="absolute inset-0 spotlight-overlay" />

            {/* ── DEALER  top-center ── */}
            <div className="absolute z-10" style={{ top: '3%', left: '50%', transform: 'translateX(-50%)' }}>
              <DealerHand cards={dealerCards} score={dealerScore} isBusted={dealerBusted} phase={phase} />
            </div>

            {/* ── PLAYER 3  upper-LEFT (11 o'clock) ── */}
            {upperLeftP && (
              <div className="absolute z-10" style={{ top: '12%', left: '18%', transform: 'translate(-50%, 0)' }}>
                <PlayerSeat player={upperLeftP} isActiveTurn={upperLeftP.id === activePlayerId} isMe={upperLeftP.id === myPlayerId} phase={phase} compact />
              </div>
            )}

            {/* ── PLAYER 2  left (9 o'clock) ── */}
            {leftP && (
              <div className="absolute z-10" style={{ top: '56%', left: '3%', transform: 'translateY(-50%)' }}>
                <PlayerSeat player={leftP} isActiveTurn={leftP.id === activePlayerId} isMe={leftP.id === myPlayerId} phase={phase} compact />
              </div>
            )}

            {/* ── PLAYER 4  right (3 o'clock) ── */}
            {rightP && (
              <div className="absolute z-10" style={{ top: '50%', right: '3%', transform: 'translateY(-50%)' }}>
                <PlayerSeat player={rightP} isActiveTurn={rightP.id === activePlayerId} isMe={rightP.id === myPlayerId} phase={phase} compact />
              </div>
            )}

            {/* ── Table center logo ── */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1.5 pointer-events-none">
              <div className="w-14 h-14 rounded-full border border-felt-line/40 flex items-center justify-center bg-black/20">
                <span className="font-serif text-accent-gold/30 text-xl font-black">BR</span>
              </div>
              {phaseLabel() && (
                <div className={`text-[10px] uppercase tracking-widest font-serif font-bold text-center max-w-[120px] leading-tight px-2 py-0.5 rounded ${phase === 'rouletteCheck' ? 'text-danger-red' : 'text-accent-gold/70'}`}>
                  {phaseLabel()}
                </div>
              )}
            </div>

            {/* ── ME (Player 1)  bottom-center ── */}
            {me && (
              <div className="absolute z-10" style={{ bottom: '3%', left: '50%', transform: 'translateX(-50%)' }}>
                <PlayerSeat player={me} isActiveTurn={me.id === activePlayerId} isMe={me.id === myPlayerId} phase={phase} />
              </div>
            )}
          </div>
        </div>

        {/* Notification ticker — left side */}
        <div className="absolute top-2 left-2 z-30 space-y-1 pointer-events-none hidden xl:block max-w-[200px]">
          {notifications.slice(0, 3).map(n => (
            <div key={n.id} className="px-2.5 py-1.5 rounded-lg bg-bg-surface/90 border border-neutral-800 backdrop-blur-md shadow-md">
              <div className="text-[10px] font-bold text-accent-gold">{n.title}</div>
              <div className="text-[10px] text-text-primary leading-tight">{n.message}</div>
            </div>
          ))}
        </div>
      </main>

      {/* ── ACTION BAR ── */}
      <footer className="shrink-0 z-20 pb-2">
        <ItemControls myPlayer={myPlayer} isMyTurn={activePlayerId === myPlayer?.id} phase={phase} allPlayers={players} />
      </footer>

      {/* ── Peek modal ── */}
      {peekResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-bg-surface border-2 border-cyan-500/60 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="text-3xl">👁️</div>
            <h3 className="font-serif text-xl font-bold text-text-primary">Chamber Peek</h3>
            <p className="text-sm">
              {peekResult.bulletInChamber
                ? <span className="text-danger-red font-bold">⚠️ LOADED! The upcoming chamber has a bullet.</span>
                : <span className="text-state-safe font-bold">✅ CLEAR! The upcoming chamber is empty.</span>
              }
            </p>
            <button onClick={() => setPeekResult(null)}
              className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-bold text-xs uppercase tracking-wider hover:bg-cyan-500/30">
              Got It
            </button>
          </div>
        </div>
      )}

      {/* ── Quickstart guide (first-time visitors) ── */}
      {showQuickstart && <QuickstartGuide onClose={dismissQuickstart} />}

      {/* ── Item reference guide ── */}
      {showItemGuide && <ItemGuideModal onClose={() => setShowItemGuide(false)} />}
    </div>
  );
};
