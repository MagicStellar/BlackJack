import React from 'react';
import { useGameStore } from './store/gameStore';
import { LobbyView } from './components/Lobby/LobbyView';
import { GameTable } from './components/Table/GameTable';
import { RouletteModal } from './components/RouletteScene/Roulette3D';
import { VictoryScreen } from './components/VictoryScreen/VictoryScreen';

export const App: React.FC = () => {
  const { isConnected, phase } = useGameStore();

  const isLobby = !isConnected || phase === 'lobby';

  return (
    <div className="min-h-screen bg-bg-base text-text-primary">
      {isLobby ? (
        <LobbyView />
      ) : (
        <GameTable />
      )}

      {/* 3D Russian Roulette Check Modal Overlay */}
      <RouletteModal />

      {/* Victory / Game Over Screen Overlay */}
      {phase === 'matchEnd' && <VictoryScreen />}
    </div>
  );
};

export default App;
