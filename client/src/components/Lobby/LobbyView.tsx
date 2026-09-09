import React, { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { net } from '../../net/colyseusClient';
import {
  Users,
  Bot,
  Play,
  HelpCircle,
  Shield,
  Eye,
  Repeat,
  RefreshCw,
  ArrowDownCircle,
  Volume2,
  VolumeX
} from 'lucide-react';
import { sounds } from '../AudioController/SoundEffects';

export const LobbyView: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    error,
    players,
    playerName,
    setPlayerName,
    matchId
  } = useGameStore();

  const [inputName, setInputName] = useState(playerName);
  const [showRules, setShowRules] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  const playerList = Object.values(players);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputName.trim()) return;
    setPlayerName(inputName.trim());
    await net.connect(inputName.trim());
  };

  const handleAddBots = () => {
    net.addBots();
  };

  const handleToggleSound = () => {
    const newState = sounds.toggleMute();
    setIsMuted(newState);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-bg-base overflow-hidden selection:bg-accent-gold/30">
      {/* Background Ambience Gradient */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80 pointer-events-none" />

      {/* Sound Toggle (Top Right) */}
      <div className="absolute top-6 right-6 z-20">
        <button
          onClick={handleToggleSound}
          className="p-3 rounded-xl bg-bg-surface border border-neutral-800 text-text-muted hover:text-accent-gold transition-colors shadow-lg"
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-6">
        {/* Main Branding Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-gold/10 border border-accent-gold/30 text-accent-gold text-xs uppercase tracking-widest font-semibold">
            ♠ High-Stakes Turn Strategy ♠
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold tracking-tight text-text-primary text-shadow-lg">
            BLACKJACK ROULETTE
          </h1>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Buckshot Roulette meets the blackjack table. 4 players, survival items, and one loaded chamber.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-danger-red/20 border border-danger-red text-danger-glow text-xs text-center">
            {error}
          </div>
        )}

        {/* Card Panel */}
        <div className="bg-bg-surface/95 border border-neutral-800 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {!isConnected ? (
            // Join Room Form
            <form onSubmit={handleJoin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-text-muted font-semibold mb-2">
                  Player Alias
                </label>
                <input
                  type="text"
                  value={inputName}
                  onChange={(e) => setInputName(e.target.value)}
                  placeholder="Enter your name..."
                  maxLength={18}
                  className="w-full px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 focus:border-accent-gold text-text-primary placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-accent-gold/30 text-sm font-medium transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isConnecting || !inputName.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-gold to-accent-goldDark text-neutral-950 font-serif font-bold text-sm uppercase tracking-wider hover:brightness-110 active:scale-[0.99] transition-all shadow-gold-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isConnecting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-neutral-950 border-t-transparent animate-spin" />
                    Connecting to Casino Table...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-neutral-950" />
                    Enter Casino Table
                  </>
                )}
              </button>
            </form>
          ) : (
            // Connected Lobby Seat Manager
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent-gold" />
                  <span className="text-xs uppercase tracking-wider text-text-muted font-semibold">
                    Table Seats ({playerList.length}/4)
                  </span>
                </div>
                <span className="text-xs text-accent-gold font-mono bg-neutral-900 px-2.5 py-1 rounded-md border border-neutral-800">
                  Room: {matchId.substring(0, 8)}
                </span>
              </div>

              {/* 4 Player Slot Grid */}
              <div className="grid grid-cols-2 gap-3">
                {[0, 1, 2, 3].map((slotIdx) => {
                  const p = playerList[slotIdx];
                  if (p) {
                    return (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-xl bg-neutral-900 border border-accent-gold/40 flex items-center gap-3 shadow-inner"
                      >
                        <div className="w-8 h-8 rounded-full bg-accent-gold/20 text-accent-gold flex items-center justify-center text-xs font-bold font-serif">
                          {p.isBot ? <Bot className="w-4 h-4" /> : slotIdx + 1}
                        </div>
                        <div className="truncate">
                          <div className="text-sm font-semibold text-text-primary truncate">
                            {p.name}
                          </div>
                          <span className="text-[10px] text-accent-gold font-medium">
                            {p.isBot ? 'AI Bot' : 'Player Ready'}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`empty-${slotIdx}`}
                      className="p-3.5 rounded-xl border border-dashed border-neutral-800 bg-black/20 flex items-center gap-3 text-neutral-600"
                    >
                      <div className="w-8 h-8 rounded-full border border-neutral-800 flex items-center justify-center text-xs">
                        {slotIdx + 1}
                      </div>
                      <span className="text-xs italic">Open Seat</span>
                    </div>
                  );
                })}
              </div>

              {/* Action Buttons: Add Bots or Wait */}
              <div className="space-y-2 pt-2">
                {playerList.length < 4 && (
                  <button
                    onClick={handleAddBots}
                    className="w-full py-3 rounded-xl bg-neutral-800 border border-accent-gold/60 text-accent-gold font-serif font-bold text-xs uppercase tracking-wider hover:bg-neutral-700 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Bot className="w-4 h-4" />
                    Fill Empty Seats with AI Bots & Start
                  </button>
                )}

                <p className="text-[11px] text-center text-text-muted">
                  Match automatically commences once 4 seats are filled.
                </p>
              </div>
            </div>
          )}

          {/* Quick Rules Toggle */}
          <div className="pt-2 border-t border-neutral-800/80 flex items-center justify-between text-xs">
            <button
              onClick={() => setShowRules(!showRules)}
              className="inline-flex items-center gap-1.5 text-text-muted hover:text-accent-gold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {showRules ? 'Hide Rules & Items' : 'How to Play & Items Guide'}
            </button>
            <span className="text-neutral-600">MVP Prototype v1.0</span>
          </div>

          {/* Expandable Rules Sheet */}
          {showRules && (
            <div className="space-y-4 pt-3 border-t border-neutral-800 text-xs text-text-muted animate-fade-in">
              <div>
                <span className="font-bold text-text-primary">1. Blackjack Round:</span> Hit or Stand against the dealer (who stands on 17+).
              </div>
              <div>
                <span className="font-bold text-text-primary">2. Rewards & Roulette:</span> Top scorer gets a survival item. Lowest scorer pulls the trigger on a 6-chamber revolver (1 bullet loaded)!
              </div>
              <div className="space-y-1.5 pt-1">
                <span className="font-bold text-text-primary">Survival Items:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-cyan-300">
                    <span className="font-bold">👁️ Peek:</span> View upcoming chamber danger
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-emerald-300">
                    <span className="font-bold">🛡️ Shield:</span> Tap to block one fatal bullet
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-amber-300">
                    <span className="font-bold">🔄 Redraw:</span> Swap 1 card for a new draw
                  </div>
                  <div className="p-2 rounded bg-neutral-900 border border-neutral-800 text-purple-300">
                    <span className="font-bold">🔁 Card Swap:</span> Trade card with opponent
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
