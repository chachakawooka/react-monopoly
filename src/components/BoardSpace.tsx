'use client';

import { SpaceDefinition } from '@/game/types';
import { COLOR_HEX } from '@/game/constants';
import { useGameStore } from '@/store/game-store';

interface BoardSpaceProps {
  space: SpaceDefinition;
  side: 'bottom' | 'left' | 'top' | 'right' | 'corner';
}

export default function BoardSpace({ space, side }: BoardSpaceProps) {
  const gameState = useGameStore(s => s.gameState);
  const owned = gameState?.properties.find(p => p.spaceIndex === space.index);
  const owner = owned ? gameState?.players.find(p => p.id === owned.ownerId) : null;

  const isCorner = side === 'corner';
  const isVertical = side === 'left' || side === 'right';

  // Color bar for properties
  const colorBar = space.color ? (
    <div
      className={`${
        isVertical
          ? (side === 'left' ? 'absolute right-0 top-0 w-[25%] h-full' : 'absolute left-0 top-0 w-[25%] h-full')
          : (side === 'top' ? 'absolute bottom-0 left-0 w-full h-[25%]' : 'absolute top-0 left-0 w-full h-[25%]')
      }`}
      style={{ backgroundColor: COLOR_HEX[space.color] }}
    >
      {owned && owned.houses > 0 && (
        <div className="flex justify-center items-center h-full gap-px">
          {owned.houses === 5 ? (
            <span className="text-[8px] md:text-[10px]">🏨</span>
          ) : (
            Array.from({ length: owned.houses }).map((_, i) => (
              <span key={i} className="text-[6px] md:text-[8px]">🏠</span>
            ))
          )}
        </div>
      )}
    </div>
  ) : null;

  const nameSize = isCorner ? 'text-[7px] md:text-[10px]' : 'text-[6px] md:text-[9px]';
  const priceSize = 'text-[5px] md:text-[8px]';

  return (
    <div className={`w-full h-full bg-board flex flex-col items-center justify-center overflow-hidden relative p-0.5 ${
      isVertical ? 'writing-mode-vertical' : ''
    }`}>
      {colorBar}

      <div className={`flex flex-col items-center justify-center z-[1] ${
        isVertical ? 'rotate-0' : ''
      } ${space.color && !isCorner ? (
        side === 'bottom' ? 'mt-[28%]' :
        side === 'top' ? 'mb-[28%]' :
        side === 'left' ? 'mr-[28%]' : 'ml-[28%]'
      ) : ''}`}>
        <span className={`${nameSize} font-semibold text-center leading-tight text-board-border`}>
          {getSpaceLabel(space)}
        </span>

        {space.price && (
          <span className={`${priceSize} text-board-border/70 mt-0.5`}>
            £{space.price}
          </span>
        )}

        {owned && owner && !space.color && (
          <span className={`${priceSize} text-board-border/50`}>
            ({owner.name})
          </span>
        )}
      </div>

      {owned?.mortgaged && (
        <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center z-[2]">
          <span className="text-[6px] md:text-[8px] text-red-800 font-bold -rotate-45">MORTGAGED</span>
        </div>
      )}
    </div>
  );
}

function getSpaceLabel(space: SpaceDefinition): string {
  switch (space.type) {
    case 'go': return '← GO';
    case 'jail': return 'JAIL';
    case 'free-parking': return 'FREE PARKING';
    case 'go-to-jail': return 'GO TO JAIL';
    case 'chance': return '?';
    case 'community-chest': return 'CHEST';
    case 'tax': return space.name;
    default: return space.name;
  }
}
