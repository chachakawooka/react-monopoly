'use client';

import { useGameStore } from '@/store/game-store';
import { TOKEN_EMOJI } from '@/game/constants';
import { BOARD_SPACES } from '@/game/board-data';
import { COLOR_HEX } from '@/game/constants';

export default function PlayerPanel() {
  const gameState = useGameStore(s => s.gameState);
  const playerId = useGameStore(s => s.playerId);

  if (!gameState) return null;

  return (
    <div className="space-y-2">
      {gameState.players.map((player, idx) => {
        const isCurrentTurn = idx === gameState.currentPlayerIndex && gameState.phase === 'playing';
        const isMe = player.id === playerId;
        const myProperties = gameState.properties.filter(p => p.ownerId === player.id);

        return (
          <div
            key={player.id}
            className={`rounded-lg p-3 ${
              player.bankrupt ? 'opacity-40 bg-gray-800' :
              isCurrentTurn ? 'bg-yellow-900/40 ring-2 ring-yellow-500' :
              'bg-gray-800'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{TOKEN_EMOJI[player.token]}</span>
                <span className={`font-semibold ${isMe ? 'text-blue-400' : 'text-white'}`}>
                  {player.name} {isMe && '(You)'}
                </span>
                {!player.connected && !player.bankrupt && (
                  <span className="text-xs text-red-400">(disconnected)</span>
                )}
              </div>
              <span className={`font-bold ${player.money < 100 ? 'text-red-400' : 'text-green-400'}`}>
                £{player.money}
              </span>
            </div>

            {player.jailTurns > 0 && (
              <div className="text-xs text-orange-400 mt-1">
                In Jail (turn {player.jailTurns}/3)
                {player.getOutOfJailCards > 0 && ` | ${player.getOutOfJailCards} GOOJF card(s)`}
              </div>
            )}

            {myProperties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {myProperties.map(prop => {
                  const space = BOARD_SPACES[prop.spaceIndex];
                  return (
                    <div
                      key={prop.spaceIndex}
                      className={`text-[9px] md:text-[10px] px-1.5 py-0.5 rounded ${
                        prop.mortgaged ? 'opacity-50 line-through' : ''
                      }`}
                      style={{
                        backgroundColor: space.color ? COLOR_HEX[space.color] + '40' : '#4b5563',
                        border: space.color ? `1px solid ${COLOR_HEX[space.color]}` : '1px solid #6b7280',
                      }}
                      title={`${space.name}${prop.houses > 0 ? ` (${prop.houses === 5 ? 'Hotel' : prop.houses + ' houses'})` : ''}`}
                    >
                      {space.name.split(' ').map(w => w[0]).join('')}
                      {prop.houses > 0 && prop.houses < 5 && ` ${prop.houses}H`}
                      {prop.houses === 5 && ' 🏨'}
                    </div>
                  );
                })}
              </div>
            )}

            {player.bankrupt && (
              <div className="text-xs text-red-500 mt-1 font-bold">BANKRUPT</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
