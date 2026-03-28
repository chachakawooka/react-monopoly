'use client';

import { useGameStore } from '@/store/game-store';

export default function CardDisplay() {
  const lastCard = useGameStore(s => s.gameState?.lastCardDrawn);

  if (!lastCard) return null;

  const isChance = lastCard.deck === 'chance';

  return (
    <div className={`p-3 rounded-lg border ${
      isChance ? 'bg-orange-900/30 border-orange-500/50' : 'bg-blue-900/30 border-blue-500/50'
    }`}>
      <div className="text-xs font-bold mb-1" style={{ color: isChance ? '#f59e0b' : '#60a5fa' }}>
        {isChance ? '? CHANCE' : 'COMMUNITY CHEST'}
      </div>
      <p className="text-sm text-white">{lastCard.card.text}</p>
    </div>
  );
}
