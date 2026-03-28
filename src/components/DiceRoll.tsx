'use client';

import { useGameStore } from '@/store/game-store';

const DICE_FACES: Record<number, string> = {
  1: '⚀', 2: '⚁', 3: '⚂', 4: '⚃', 5: '⚄', 6: '⚅',
};

export default function DiceRoll() {
  const lastDice = useGameStore(s => s.gameState?.lastDice);

  if (!lastDice || (lastDice[0] === 0 && lastDice[1] === 0)) {
    return null;
  }

  const isDoubles = lastDice[0] === lastDice[1];

  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl">{DICE_FACES[lastDice[0]]}</span>
      <span className="text-4xl">{DICE_FACES[lastDice[1]]}</span>
      <span className="text-sm text-gray-300">
        = {lastDice[0] + lastDice[1]}
        {isDoubles && <span className="text-yellow-400 ml-1">Doubles!</span>}
      </span>
    </div>
  );
}
