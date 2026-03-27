import PartySocket from 'partysocket';
import { useGameStore } from '@/store/game-store';
import type { ServerMessage } from '@/game/types';

const PARTYKIT_HOST = process.env.NEXT_PUBLIC_PARTYKIT_HOST || 'localhost:1999';

let socket: PartySocket | null = null;

export function connectToRoom(roomId: string) {
  const store = useGameStore.getState();

  if (socket) {
    socket.close();
  }

  socket = new PartySocket({
    host: PARTYKIT_HOST,
    room: roomId,
    party: 'monopoly',
  });

  socket.addEventListener('open', () => {
    store.setConnected(true);
    store.setSocket(socket as unknown as WebSocket);
    store.setError(null);
  });

  socket.addEventListener('message', (event) => {
    try {
      const msg: ServerMessage = JSON.parse(event.data);

      switch (msg.type) {
        case 'state-update':
          store.setGameState(msg.state);
          break;
        case 'player-id':
          store.setPlayerId(msg.id);
          break;
        case 'error':
          store.setError(msg.message);
          break;
      }
    } catch (e) {
      console.error('Failed to parse message:', e);
    }
  });

  socket.addEventListener('close', () => {
    store.setConnected(false);
  });

  socket.addEventListener('error', () => {
    store.setError('Connection error');
  });

  return socket;
}

export function disconnectFromRoom() {
  if (socket) {
    socket.close();
    socket = null;
  }
  const store = useGameStore.getState();
  store.setSocket(null);
  store.setConnected(false);
  store.setGameState(null);
  store.setPlayerId(null);
}
