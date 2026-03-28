'use client';

import { useState } from 'react';
import { useGameStore, isMyTurn, getMyPlayer } from '@/store/game-store';
import { BOARD_SPACES, getSpacesByColor } from '@/game/board-data';
import { COLOR_HEX } from '@/game/constants';
import DiceRoll from './DiceRoll';
import CardDisplay from './CardDisplay';

export default function ActionPanel() {
  const store = useGameStore();
  const { gameState, sendMessage } = store;
  const myTurn = isMyTurn(store);
  const myPlayer = getMyPlayer(store);

  if (!gameState || !myPlayer || gameState.phase !== 'playing') return null;
  if (myPlayer.bankrupt) return <div className="text-red-400 text-center p-4">You are bankrupt.</div>;

  const currentSpace = BOARD_SPACES[myPlayer.position];
  const currentPlayerName = gameState.players[gameState.currentPlayerIndex]?.name;

  return (
    <div className="space-y-3">
      <DiceRoll />
      <CardDisplay />

      {/* Current space info */}
      <div className="text-sm text-gray-400">
        You are on: <span className="text-white font-semibold">{currentSpace.name}</span>
      </div>

      {!myTurn ? (
        <div className="text-yellow-400 text-sm">{currentPlayerName}&apos;s turn...</div>
      ) : (
        <div className="space-y-2">
          {/* Jail options */}
          {myPlayer.jailTurns > 0 && gameState.turnPhase === 'pre-roll' && (
            <div className="space-y-2 p-3 bg-orange-900/30 rounded-lg">
              <p className="text-sm text-orange-300">You&apos;re in jail! Choose:</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => sendMessage({ type: 'jail-roll' })} className="btn-primary text-sm">
                  Roll for Doubles
                </button>
                <button onClick={() => sendMessage({ type: 'jail-pay' })} className="btn-secondary text-sm"
                  disabled={myPlayer.money < 50}>
                  Pay £50 Fine
                </button>
                {myPlayer.getOutOfJailCards > 0 && (
                  <button onClick={() => sendMessage({ type: 'jail-card' })} className="btn-secondary text-sm">
                    Use GOOJF Card
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Roll dice */}
          {myPlayer.jailTurns === 0 && gameState.turnPhase === 'pre-roll' && (
            <button onClick={() => sendMessage({ type: 'roll-dice' })} className="btn-primary w-full">
              🎲 Roll Dice
            </button>
          )}

          {/* Buy / Decline */}
          {gameState.turnPhase === 'rolled' && (
            <div className="flex gap-2">
              <button
                onClick={() => sendMessage({ type: 'buy-property' })}
                className="btn-primary flex-1"
                disabled={myPlayer.money < (currentSpace.price ?? Infinity)}
              >
                Buy £{currentSpace.price}
              </button>
              <button
                onClick={() => sendMessage({ type: 'decline-property' })}
                className="btn-secondary flex-1"
              >
                Auction
              </button>
            </div>
          )}

          {/* Auction */}
          {gameState.auction && <AuctionControls />}

          {/* Build houses */}
          {(gameState.turnPhase === 'pre-roll' || gameState.turnPhase === 'post-roll') && (
            <BuildControls />
          )}

          {/* Mortgage controls */}
          {(gameState.turnPhase === 'pre-roll' || gameState.turnPhase === 'post-roll') && (
            <MortgageControls />
          )}

          {/* End turn */}
          {gameState.turnPhase === 'post-roll' && (
            <button onClick={() => sendMessage({ type: 'end-turn' })} className="btn-primary w-full">
              End Turn
            </button>
          )}
        </div>
      )}

      {/* Trade is accessible even when not your turn */}
      {gameState.tradeOffer && <TradeNotification />}
    </div>
  );
}

function AuctionControls() {
  const [bidAmount, setBidAmount] = useState(10);
  const { gameState, sendMessage, playerId } = useGameStore();
  const auction = gameState?.auction;
  if (!auction) return null;

  const inAuction = auction.participants.includes(playerId!);
  if (!inAuction) return <div className="text-sm text-gray-400">Watching auction...</div>;

  const space = BOARD_SPACES[auction.spaceIndex];
  const minBid = auction.currentBid + 1;

  return (
    <div className="p-3 bg-purple-900/30 rounded-lg space-y-2">
      <p className="text-sm text-purple-300">
        Auction: <span className="font-bold">{space.name}</span>
        {auction.currentBid > 0 && ` — Current bid: £${auction.currentBid}`}
      </p>
      <div className="flex gap-2">
        <input
          type="number"
          value={bidAmount}
          onChange={e => setBidAmount(Math.max(minBid, parseInt(e.target.value) || 0))}
          min={minBid}
          className="bg-gray-700 text-white px-2 py-1 rounded w-24 text-sm"
        />
        <button onClick={() => { sendMessage({ type: 'auction-bid', amount: bidAmount }); setBidAmount(bidAmount + 10); }} className="btn-primary text-sm">
          Bid
        </button>
        <button onClick={() => sendMessage({ type: 'auction-pass' })} className="btn-secondary text-sm">
          Pass
        </button>
      </div>
    </div>
  );
}

function BuildControls() {
  const { gameState, sendMessage, playerId } = useGameStore();
  if (!gameState || !playerId) return null;

  const myProperties = gameState.properties.filter(p => p.ownerId === playerId && !p.mortgaged);
  const buildable = myProperties.filter(prop => {
    const space = BOARD_SPACES[prop.spaceIndex];
    if (space.type !== 'property' || !space.color) return false;
    // Check full group
    const group = getSpacesByColor(space.color);
    const ownsAll = group.every(gs =>
      gameState.properties.some(p => p.spaceIndex === gs.index && p.ownerId === playerId && !p.mortgaged)
    );
    return ownsAll && prop.houses < 5;
  });

  if (buildable.length === 0) return null;

  return (
    <div className="p-3 bg-green-900/30 rounded-lg space-y-2">
      <p className="text-sm text-green-300">Build Houses/Hotels:</p>
      <div className="flex flex-wrap gap-1">
        {buildable.map(prop => {
          const space = BOARD_SPACES[prop.spaceIndex];
          return (
            <button
              key={prop.spaceIndex}
              onClick={() => sendMessage({ type: 'build-house', spaceIndex: prop.spaceIndex })}
              className="text-xs px-2 py-1 rounded bg-green-800 hover:bg-green-700 text-white"
              style={{ borderLeft: `3px solid ${COLOR_HEX[space.color!]}` }}
            >
              {space.name} (£{space.houseCost}) {prop.houses === 4 ? '→Hotel' : `→${prop.houses + 1}H`}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function MortgageControls() {
  const { gameState, sendMessage, playerId } = useGameStore();
  if (!gameState || !playerId) return null;

  const mortgageable = gameState.properties.filter(p =>
    p.ownerId === playerId && !p.mortgaged && p.houses === 0
  );
  const unmortgageable = gameState.properties.filter(p =>
    p.ownerId === playerId && p.mortgaged
  );

  if (mortgageable.length === 0 && unmortgageable.length === 0) return null;

  return (
    <details className="p-3 bg-gray-800 rounded-lg">
      <summary className="text-sm text-gray-300 cursor-pointer">Mortgage / Unmortgage</summary>
      <div className="flex flex-wrap gap-1 mt-2">
        {mortgageable.map(prop => {
          const space = BOARD_SPACES[prop.spaceIndex];
          const value = Math.floor(space.price! * 0.5);
          return (
            <button
              key={prop.spaceIndex}
              onClick={() => sendMessage({ type: 'mortgage', spaceIndex: prop.spaceIndex })}
              className="text-xs px-2 py-1 rounded bg-red-900 hover:bg-red-800 text-white"
            >
              Mortgage {space.name} (+£{value})
            </button>
          );
        })}
        {unmortgageable.map(prop => {
          const space = BOARD_SPACES[prop.spaceIndex];
          const cost = Math.ceil(space.price! * 0.55);
          return (
            <button
              key={prop.spaceIndex}
              onClick={() => sendMessage({ type: 'unmortgage', spaceIndex: prop.spaceIndex })}
              className="text-xs px-2 py-1 rounded bg-blue-900 hover:bg-blue-800 text-white"
            >
              Unmortgage {space.name} (-£{cost})
            </button>
          );
        })}
      </div>
    </details>
  );
}

function TradeNotification() {
  const { gameState, sendMessage, playerId } = useGameStore();
  const trade = gameState?.tradeOffer;
  if (!trade) return null;

  const from = gameState?.players.find(p => p.id === trade.fromId);
  const isForMe = trade.toId === playerId;

  return (
    <div className="p-3 bg-blue-900/30 rounded-lg space-y-2">
      <p className="text-sm text-blue-300">
        Trade from <span className="font-bold">{from?.name}</span>
      </p>
      {trade.offerMoney > 0 && <p className="text-xs text-green-400">Offers: £{trade.offerMoney}</p>}
      {trade.requestMoney > 0 && <p className="text-xs text-red-400">Wants: £{trade.requestMoney}</p>}
      {trade.offerProperties.length > 0 && (
        <p className="text-xs text-green-400">
          Offers: {trade.offerProperties.map(i => BOARD_SPACES[i].name).join(', ')}
        </p>
      )}
      {trade.requestProperties.length > 0 && (
        <p className="text-xs text-red-400">
          Wants: {trade.requestProperties.map(i => BOARD_SPACES[i].name).join(', ')}
        </p>
      )}
      {isForMe && (
        <div className="flex gap-2">
          <button onClick={() => sendMessage({ type: 'trade-accept' })} className="btn-primary text-sm">Accept</button>
          <button onClick={() => sendMessage({ type: 'trade-decline' })} className="btn-secondary text-sm">Decline</button>
        </div>
      )}
    </div>
  );
}
