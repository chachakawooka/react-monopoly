'use client';

import { useState } from 'react';
import { useGameStore } from '@/store/game-store';
import { TOKEN_EMOJI, TOKEN_LABELS } from '@/game/constants';
import type { TokenType } from '@/game/types';

const TOKENS: TokenType[] = ['boot', 'car', 'hat', 'iron'];

export default function Lobby() {
  const { gameState, playerId, sendMessage } = useGameStore();
  const [name, setName] = useState('');
  const [selectedToken, setSelectedToken] = useState<TokenType>('car');

  if (!gameState) return null;

  const hasJoined = gameState.players.some(p => p.id === playerId);
  const isHost = gameState.players[0]?.id === playerId;
  const takenTokens = gameState.players.map(p => p.token);

  const handleJoin = () => {
    if (!name.trim()) return;
    sendMessage({ type: 'join', name: name.trim(), token: selectedToken });
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Game Lobby</h2>
        <p className="text-gray-400 text-sm mt-1">Room: {gameState.id}</p>
        <p className="text-gray-500 text-xs mt-1">Share this room code with friends</p>
      </div>

      {/* Players list */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-400 mb-3">
          Players ({gameState.players.length}/4)
        </h3>
        {gameState.players.length === 0 ? (
          <p className="text-gray-600 text-sm">No players yet...</p>
        ) : (
          <div className="space-y-2">
            {gameState.players.map((player, idx) => (
              <div key={player.id} className="flex items-center gap-3 text-sm">
                <span className="text-lg">{TOKEN_EMOJI[player.token]}</span>
                <span className={player.id === playerId ? 'text-blue-400 font-semibold' : 'text-white'}>
                  {player.name}
                  {player.id === playerId && ' (You)'}
                </span>
                {idx === 0 && (
                  <span className="text-xs bg-yellow-600/30 text-yellow-400 px-1.5 py-0.5 rounded">Host</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join form */}
      {!hasJoined && (
        <div className="bg-gray-800 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Your Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={20}
              placeholder="Enter your name..."
              className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={e => e.key === 'Enter' && handleJoin()}
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Choose Token</label>
            <div className="flex gap-3">
              {TOKENS.map(token => {
                const taken = takenTokens.includes(token);
                return (
                  <button
                    key={token}
                    onClick={() => !taken && setSelectedToken(token)}
                    disabled={taken}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${
                      taken ? 'opacity-30 cursor-not-allowed' :
                      selectedToken === token ? 'bg-blue-600 ring-2 ring-blue-400' : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    <span className="text-2xl">{TOKEN_EMOJI[token]}</span>
                    <span className="text-[10px] text-gray-300">{TOKEN_LABELS[token]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleJoin}
            disabled={!name.trim() || takenTokens.includes(selectedToken)}
            className="btn-primary w-full"
          >
            Join Game
          </button>
        </div>
      )}

      {/* Start game button */}
      {isHost && gameState.players.length >= 2 && (
        <button onClick={() => sendMessage({ type: 'start-game' })} className="btn-primary w-full text-lg py-3">
          Start Game ({gameState.players.length} players)
        </button>
      )}

      {hasJoined && !isHost && (
        <p className="text-center text-gray-400 text-sm">Waiting for host to start...</p>
      )}
    </div>
  );
}
