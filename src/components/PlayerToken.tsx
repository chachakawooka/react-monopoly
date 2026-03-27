'use client';

import { Player } from '@/game/types';
import { TOKEN_EMOJI } from '@/game/constants';

interface PlayerTokenProps {
  player: Player;
}

const TOKEN_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];

export default function PlayerToken({ player }: PlayerTokenProps) {
  return (
    <div
      className="w-3 h-3 md:w-4 md:h-4 rounded-full flex items-center justify-center text-[6px] md:text-[8px] border border-white shadow-sm"
      style={{ backgroundColor: getTokenColor(player.token) }}
      title={`${player.name} (${player.token})`}
    >
      {TOKEN_EMOJI[player.token]}
    </div>
  );
}

function getTokenColor(token: string): string {
  const colors: Record<string, string> = {
    boot: '#ef4444',
    car: '#3b82f6',
    hat: '#8b5cf6',
    iron: '#f59e0b',
  };
  return colors[token] || '#6b7280';
}
