import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PlayerSeat } from '../PlayerSeat/PlayerSeat';
import { DealerHand } from '../DealerHand/DealerHand';
import { ItemControls } from '../ItemBar/ItemControls';
import { sounds } from '../AudioController/SoundEffects';
import { QuickstartGuide } from './QuickstartGuide';
import { ItemGuideModal } from './ItemGuideModal';
import { Volume2, VolumeX, Flame, BookOpen, Clock } from 'lucide-react';
import { useTurnCountdown } from '../../store/useTurnCountdown';
import { Card, PlayerState, RoundPhase } from '../../../../shared/types';

function opponentSlots(opponents: PlayerState[]): (PlayerState | null)[] {
  const slots: (PlayerState | null)[] = [null, null, null];
  if (opponents.length === 1) {
    slots[1] = opponents[0];
  } else if (opponents.length === 2) {
    slots[0] = opponents[0];
    slots[2] = opponents[1];
  } else {
    opponents.slice(0, 3).forEach((player, i) => {
      slots[i] = player;
    });
  }
  return slots;
}

interface TableFeltProps {
  myPlayer: PlayerState | undefined;
  opponents: PlayerState[];
  myPlayerId: string | null;
  activePlayerId: string | null;
  phase: RoundPhase;
  dealerCards: Card[];
  dealerScore: number;
  dealerBusted: boolean;
}

const EmptySeat: React.FC = () => (
  <div className="w-full max-w-[200px] h-full min-h-[132px] sm:min-h-[150px] rounded-2xl border-2 border-dashed border-felt-line/40 bg-black/15 flex items-center justify-center">
    <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-felt-line/50 font-semibold">Open</span>
  </div>
);

const TableFelt: React.FC<TableFeltProps> = ({
  myPlayer,
  opponents,
  myPlayerId,
  activePlayerId,
  phase,
  dealerCards,
  dealerScore,
  dealerBusted,
}) => {
  const dealerUpRank = dealerCards.find((c) => c.faceUp)?.rank;
  const slots = opponentSlots(opponents);

  return (
    <div className="w-full h-full max-w-5xl mx-auto p-2 sm:p-3 flex">
      <div className="flex-1 table-wood-rim rounded-[28px] p-[7px] sm:p-[9px] min-h-0">
        <div className="relative w-full h-full table-felt rounded-[22px] flex flex-col px-2 sm:px-6 py-2 sm:py-3 overflow-visible">
          <div className="absolute inset-3 sm:inset-4 rounded-[18px] border border-accent-gold/20 pointer-events-none" />
          <div className="absolute inset-0 spotlight-overlay" />

          {/* Dealer */}
          <div className="relative z-10 flex justify-center shrink-0 pt-1 overflow-visible">
            <DealerHand cards={dealerCards} score={dealerScore} isBusted={dealerBusted} phase={phase} />
          </div>

          {/* Felt markings — sit under the dealer, not between the seats */}
          <div className="relative z-10 shrink-0 flex flex-col items-center pointer-events-none select-none px-3 pt-1 pb-0.5">
            <div className="text-[8px] sm:text-[10px] uppercase tracking-[0.18em] text-accent-gold/50 font-semibold">
              {phase === 'rouletteCheck'
                ? 'Roulette Check — 1 in 6 Chamber'
                : 'Blackjack Roulette • 6 Chambers • 1 Loaded'}
            </div>
            <div className="mt-0.5 font-serif text-[11px] sm:text-sm md:text-base tracking-[0.2em] text-accent-gold/45 font-bold">
              BLACKJACK PAYS 3 TO 2
            </div>
            <div className="mt-0.5 text-[7px] sm:text-[9px] tracking-[0.16em] text-accent-gold/30 uppercase font-semibold">
              Dealer must draw to 16 and stand on all 17s
            </div>
          </div>

          <div className="relative z-10 flex-1 min-h-2" />

          {/* Opponents — middle of the table, equal slots */}
          <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-6 px-1 sm:px-8 items-stretch">
            {slots.map((player, i) => {
              const isActive = Boolean(player && player.id === activePlayerId && player.status !== 'eliminated');
              return (
                <div key={player?.id ?? `open-${i}`} className="flex justify-center min-w-0">
                  {player ? (
                    <div
                      className={`w-full max-w-[240px] rounded-2xl px-2 py-2.5 sm:px-3 sm:py-3 flex items-center justify-center overflow-visible transition-shadow duration-300 ${
                        isActive
                          ? 'border-2 border-accent-gold bg-accent-gold/10 shadow-gold-glow'
                          : 'border border-white/10 bg-black/20'
                      }`}
                    >
                      <PlayerSeat
                        player={player}
                        isActiveTurn={player.id === activePlayerId}
                        isMe={player.id === myPlayerId}
                        phase={phase}
                        compact
                      />
                    </div>
                  ) : (
                    <EmptySeat />
                  )}
                </div>
              );
            })}
          </div>

          <div className="relative z-10 flex-1 min-h-2" />

          {/* Local player — larger, bottom center */}
          {myPlayer && (
            <div className="relative z-10 flex justify-center shrink-0 pb-3 sm:pb-4">
              <div
                className={`w-full max-w-md rounded-2xl px-3 py-3 sm:px-6 sm:py-4 overflow-visible transition-shadow duration-300 ${
                  myPlayer.id === activePlayerId && myPlayer.status !== 'eliminated'
                    ? 'border-2 border-accent-gold bg-accent-gold/10 shadow-gold-glow'
                    : 'border border-accent-gold/35 bg-black/30'
                }`}
              >
                <PlayerSeat
                  player={myPlayer}
                  isActiveTurn={myPlayer.id === activePlayerId}
                  isMe
                  phase={phase}
                  dealerUpRank={dealerUpRank}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

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
  const { timeLeft, isUrgent } = useTurnCountdown();

  const handleToggleSound = () => setIsMuted(sounds.toggleMute());
  const dismissQuickstart = () => {
    localStorage.setItem(QUICKSTART_KEY, '1');
    setShowQuickstart(false);
  };

  const playerList = Object.values(players);
  const myPlayer   = playerList.find(p => p.id === myPlayerId);

  // Seat assignment: me first, then others in order
  const orderedPlayers = React.useMemo(() => {
    const myIdx = playerList.findIndex(p => p.id === myPlayerId);
    if (myIdx === -1) return playerList;
    return Array.from({ length: playerList.length }, (_, i) =>
      playerList[(myIdx + i) % playerList.length]
    );
  }, [playerList, myPlayerId]);

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
      className={`relative w-full flex flex-col dot-grid-bg select-none overflow-hidden ${screenShake ? 'animate-bounce' : ''}`}
      style={{ height: '100dvh' }}
    >
      {/* Flash-bang */}
      {flashBang && <div className="fixed inset-0 z-50 pointer-events-none animate-flash-bang" />}

      {/* ── HEADER ── */}
      <header className="shrink-0 z-20 flex items-center justify-between px-2.5 sm:px-4 py-1.5 sm:py-2 bg-bg-surface/90 border-b border-neutral-800/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-accent-gold/20 border border-accent-gold/40 flex items-center justify-center text-accent-gold font-serif font-black text-xs sm:text-sm">♠</div>
          <div className="leading-none">
            <div className="font-serif text-xs sm:text-sm font-bold text-text-primary tracking-wide">BLACKJACK ROULETTE</div>
            <div className="text-[8px] sm:text-[9px] text-text-muted tracking-widest uppercase hidden xs:block">Noir Survival</div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-neutral-900 border border-accent-gold/30 text-[10px] sm:text-[11px] font-serif text-accent-gold">
            <Flame className="w-3 h-3" />
            <span className="font-bold">R{roundNumber}</span>
          </div>
          {phaseLabel() && (
            <div className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-[11px] text-text-primary max-w-[150px] sm:max-w-[240px] truncate transition-colors ${
              isUrgent
                ? 'bg-danger-red/20 border-danger-red/60 animate-pulse text-danger-glow font-semibold'
                : 'bg-neutral-900/90 border-neutral-700'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${phase === 'rouletteCheck' ? 'bg-danger-red animate-pulse' : isUrgent ? 'bg-danger-red animate-ping' : 'bg-accent-gold animate-pulse'}`} />
              <span className="truncate">{phaseLabel()}</span>
              {phase === 'playerTurns' && timeLeft > 0 && (
                <span className={`shrink-0 flex items-center gap-0.5 font-mono font-bold text-[9px] sm:text-[10px] ml-0.5 px-1 py-0.5 rounded ${
                  isUrgent ? 'bg-danger-red/40 text-danger-glow' : 'bg-neutral-800 text-accent-gold'
                }`}>
                  <Clock className="w-2.5 h-2.5" />
                  {timeLeft}s
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button onClick={() => setShowItemGuide(true)}
            className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-neutral-900 border border-accent-gold/30 text-accent-gold hover:bg-neutral-800 transition-colors text-[10px] sm:text-[11px] font-semibold"
            title="Item Guide">
            <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="hidden xs:inline">Items</span>
          </button>
          <button onClick={handleToggleSound}
            className="p-1 sm:p-1.5 rounded-lg bg-neutral-900 border border-neutral-800 text-text-muted hover:text-accent-gold transition-colors">
            {isMuted ? <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
          </button>
        </div>
      </header>

      {/* ── MAIN TABLE AREA ── */}
      <main className="relative flex-1 overflow-visible dot-grid-bg px-1">
        <TableFelt
          myPlayer={myPlayer}
          opponents={orderedPlayers.filter((p) => p.id !== myPlayerId)}
          myPlayerId={myPlayerId}
          activePlayerId={activePlayerId}
          phase={phase}
          dealerCards={dealerCards}
          dealerScore={dealerScore}
          dealerBusted={dealerBusted}
        />

        {/* Notification ticker — desktop only */}
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
      <footer className="shrink-0 z-20 bg-neutral-950/85 border-t border-neutral-800/80 backdrop-blur-md">
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
