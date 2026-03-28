'use client';

import { BOARD_SPACES } from '@/game/board-data';
import { useGameStore } from '@/store/game-store';
import BoardSpace from './BoardSpace';
import PlayerToken from './PlayerToken';

// Board layout: spaces go clockwise from GO (bottom-right corner)
// Bottom row: 0(GO) to 10(Jail) — right to left
// Left column: 11 to 19 — bottom to top
// Top row: 20(Free Parking) to 30(Go To Jail) — left to right
// Right column: 31 to 39 — top to bottom

function getSpacePosition(index: number): { row: number; col: number; side: 'bottom' | 'left' | 'top' | 'right' | 'corner' } {
  if (index === 0) return { row: 11, col: 11, side: 'corner' };
  if (index >= 1 && index <= 9) return { row: 11, col: 10 - (index - 1), side: 'bottom' };
  if (index === 10) return { row: 11, col: 1, side: 'corner' };
  if (index >= 11 && index <= 19) return { row: 10 - (index - 11), col: 1, side: 'left' };
  if (index === 20) return { row: 1, col: 1, side: 'corner' };
  if (index >= 21 && index <= 29) return { row: 1, col: 2 + (index - 21), side: 'top' };
  if (index === 30) return { row: 1, col: 11, side: 'corner' };
  if (index >= 31 && index <= 39) return { row: 2 + (index - 31), col: 11, side: 'right' };
  return { row: 1, col: 1, side: 'corner' };
}

export default function Board() {
  const gameState = useGameStore(s => s.gameState);
  const players = gameState?.players ?? [];

  return (
    <div className="relative w-full max-w-[800px] aspect-square mx-auto">
      <div
        className="grid w-full h-full bg-board border-2 border-board-border"
        style={{
          gridTemplateColumns: '1.5fr repeat(9, 1fr) 1.5fr',
          gridTemplateRows: '1.5fr repeat(9, 1fr) 1.5fr',
        }}
      >
        {BOARD_SPACES.map(space => {
          const pos = getSpacePosition(space.index);
          const playersHere = players.filter(p => !p.bankrupt && p.position === space.index);
          return (
            <div
              key={space.index}
              style={{ gridRow: pos.row, gridColumn: pos.col }}
              className="relative border border-board-border/30"
            >
              <BoardSpace space={space} side={pos.side} />
              {playersHere.length > 0 && (
                <div className="absolute bottom-0.5 left-0.5 flex flex-wrap gap-0.5 z-10">
                  {playersHere.map(player => (
                    <PlayerToken key={player.id} player={player} />
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Center area */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ gridRow: '2 / 11', gridColumn: '2 / 11' }}
        >
          <h1 className="text-3xl md:text-5xl font-bold text-board-border tracking-wider text-center">
            MONOPOLY
          </h1>
          <p className="text-xs md:text-sm text-board-border/60 mt-1">UK Classic Edition</p>
        </div>
      </div>
    </div>
  );
}
