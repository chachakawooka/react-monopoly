'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

function generateRoomId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

export default function HomePage() {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState('');

  const handleCreate = () => {
    const roomId = generateRoomId();
    router.push(`/game/${roomId}`);
  };

  const handleJoin = () => {
    const code = joinCode.trim().toUpperCase();
    if (code.length >= 4) {
      router.push(`/game/${code}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-wider mb-2">MONOPOLY</h1>
          <p className="text-gray-400">UK Classic Edition - Online Multiplayer</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleCreate}
            className="btn-primary w-full text-lg py-4"
          >
            Create New Game
          </button>

          <div className="relative flex items-center">
            <div className="flex-grow border-t border-gray-700" />
            <span className="mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-700" />
          </div>

          <div className="space-y-3">
            <input
              type="text"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter room code..."
              maxLength={8}
              className="w-full bg-gray-800 text-white text-center text-2xl tracking-[0.3em] px-4 py-3 rounded-lg border border-gray-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none uppercase"
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
            <button
              onClick={handleJoin}
              disabled={joinCode.trim().length < 4}
              className="btn-secondary w-full"
            >
              Join Game
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-gray-600 space-y-1">
          <p>2-4 Players | Real-time Multiplayer</p>
          <p>Built with Next.js + Partykit</p>
        </div>
      </div>
    </div>
  );
}
