'use client';

import { useRef, useEffect } from 'react';
import { useGameStore } from '@/store/game-store';

export default function GameLog() {
  const log = useGameStore(s => s.gameState?.log ?? []);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [log.length]);

  return (
    <div className="bg-gray-900 rounded-lg p-3">
      <h3 className="text-sm font-semibold text-gray-400 mb-2">Game Log</h3>
      <div ref={scrollRef} className="space-y-1 max-h-40 overflow-y-auto text-xs">
        {log.length === 0 ? (
          <p className="text-gray-600">No activity yet...</p>
        ) : (
          log.map((entry, i) => (
            <p key={i} className="text-gray-400">{entry.message}</p>
          ))
        )}
      </div>
    </div>
  );
}
