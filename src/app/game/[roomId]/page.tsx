'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { connectToRoom, disconnectFromRoom } from '@/lib/party-client';
import { useGameStore } from '@/store/game-store';
import Lobby from '@/components/Lobby';
import Board from '@/components/Board';
import PlayerPanel from '@/components/PlayerPanel';
import ActionPanel from '@/components/ActionPanel';
import GameLog from '@/components/GameLog';

export default function GamePage() {
  const params = useParams();
  const roomId = params.roomId as string;
  const { gameState, connected, error } = useGameStore();

  useEffect(() => {
    connectToRoom(roomId);
    return () => disconnectFromRoom();
  }, [roomId]);

  if (!connected) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">🎲</div>
          <p className="text-gray-400">Connecting to room {roomId}...</p>
          {error && <p className="text-red-400 mt-2 text-sm">{error}</p>}
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Loading game state...</p>
      </div>
    );
  }

  // Lobby phase
  if (gameState.phase === 'lobby') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Lobby />
      </div>
    );
  }

  // Game finished
  if (gameState.phase === 'finished') {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Game Over!</h1>
          <p className="text-2xl text-yellow-400">{winner?.name} wins!</p>
          <a href="/" className="btn-primary inline-block">Play Again</a>
        </div>
      </div>
    );
  }

  // Playing phase
  return (
    <div className="min-h-screen p-2 md:p-4">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Board */}
          <div className="flex-shrink-0 lg:w-[65%]">
            <Board />
          </div>

          {/* Side panels */}
          <div className="flex-1 space-y-4 lg:max-h-[800px] lg:overflow-y-auto">
            <PlayerPanel />
            <ActionPanel />
            <GameLog />
          </div>
        </div>
      </div>
    </div>
  );
}
