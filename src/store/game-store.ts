import { create } from 'zustand';
import type { GameState, ClientMessage, ServerMessage } from '@/game/types';

interface GameStore {
  gameState: GameState | null;
  playerId: string | null;
  connected: boolean;
  socket: WebSocket | null;
  error: string | null;

  setGameState: (state: GameState | null) => void;
  setPlayerId: (id: string | null) => void;
  setConnected: (connected: boolean) => void;
  setSocket: (socket: WebSocket | null) => void;
  setError: (error: string | null) => void;

  sendMessage: (msg: ClientMessage) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  gameState: null,
  playerId: null,
  connected: false,
  socket: null,
  error: null,

  setGameState: (state) => set({ gameState: state }),
  setPlayerId: (id) => set({ playerId: id }),
  setConnected: (connected) => set({ connected }),
  setSocket: (socket) => set({ socket }),
  setError: (error) => set({ error }),

  sendMessage: (msg) => {
    const { socket, connected } = get();
    if (socket && connected) {
      socket.send(JSON.stringify(msg));
    }
  },
}));

export function isMyTurn(store: GameStore): boolean {
  const { gameState, playerId } = store;
  if (!gameState || !playerId) return false;
  return gameState.players[gameState.currentPlayerIndex]?.id === playerId;
}

export function getMyPlayer(store: GameStore) {
  const { gameState, playerId } = store;
  if (!gameState || !playerId) return null;
  return gameState.players.find(p => p.id === playerId) ?? null;
}
