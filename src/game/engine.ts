import { GameState, Player, OwnedProperty, CardDefinition, AuctionState, TradeOffer, LogEntry } from './types';
import { BOARD_SPACES, getSpacesByColor } from './board-data';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS, shuffleDeck } from './cards';
import {
  STARTING_MONEY, GO_SALARY, JAIL_POSITION, GO_TO_JAIL_POSITION,
  JAIL_FINE, MAX_JAIL_TURNS, BOARD_SIZE, TOTAL_HOUSES, TOTAL_HOTELS,
  MORTGAGE_RATE, UNMORTGAGE_RATE, COLOR_GROUP_SIZES,
} from './constants';

// --- Helpers ---

function log<T extends GameState>(state: T, message: string): T {
  return {
    ...state,
    log: [...state.log.slice(-49), { timestamp: Date.now(), message }],
  };
}

function currentPlayer(state: GameState): Player {
  return state.players[state.currentPlayerIndex];
}

function updatePlayer(state: GameState, playerId: string, updates: Partial<Player>): GameState {
  return {
    ...state,
    players: state.players.map(p => p.id === playerId ? { ...p, ...updates } : p),
  };
}

function getProperty(state: GameState, spaceIndex: number): OwnedProperty | undefined {
  return state.properties.find(p => p.spaceIndex === spaceIndex);
}

function playerOwnsFullGroup(state: GameState, playerId: string, color: string): boolean {
  const groupSpaces = getSpacesByColor(color);
  return groupSpaces.every(s => {
    const prop = getProperty(state, s.index);
    return prop && prop.ownerId === playerId && !prop.mortgaged;
  });
}

function countRailroads(state: GameState, playerId: string): number {
  return state.properties.filter(p => {
    const space = BOARD_SPACES[p.spaceIndex];
    return space.type === 'railroad' && p.ownerId === playerId && !p.mortgaged;
  }).length;
}

function countUtilities(state: GameState, playerId: string): number {
  return state.properties.filter(p => {
    const space = BOARD_SPACES[p.spaceIndex];
    return space.type === 'utility' && p.ownerId === playerId && !p.mortgaged;
  }).length;
}

function countPlayerHousesAndHotels(state: GameState, playerId: string): { houses: number; hotels: number } {
  let houses = 0;
  let hotels = 0;
  for (const prop of state.properties) {
    if (prop.ownerId === playerId) {
      if (prop.houses === 5) hotels++;
      else houses += prop.houses;
    }
  }
  return { houses, hotels };
}

function activePlayers(state: GameState): Player[] {
  return state.players.filter(p => !p.bankrupt);
}

// --- Game Creation ---

export function createInitialState(roomId: string): GameState {
  return {
    id: roomId,
    phase: 'lobby',
    players: [],
    properties: [],
    currentPlayerIndex: 0,
    turnPhase: 'pre-roll',
    lastDice: [0, 0],
    doublesCount: 0,
    houses: TOTAL_HOUSES,
    hotels: TOTAL_HOTELS,
    chanceDrawPile: shuffleDeck(CHANCE_CARDS),
    communityChestDrawPile: shuffleDeck(COMMUNITY_CHEST_CARDS),
    auction: null,
    tradeOffer: null,
    winner: null,
    log: [],
    lastCardDrawn: null,
  };
}

export function addPlayer(state: GameState, id: string, name: string, token: string): GameState {
  if (state.phase !== 'lobby') return state;
  if (state.players.length >= 4) return state;
  if (state.players.some(p => p.id === id)) return state;
  if (state.players.some(p => p.token === token)) return state;

  const player: Player = {
    id,
    name,
    token: token as Player['token'],
    money: STARTING_MONEY,
    position: 0,
    jailTurns: 0,
    getOutOfJailCards: 0,
    bankrupt: false,
    connected: true,
  };

  let s = { ...state, players: [...state.players, player] };
  return log(s, `${name} joined the game`);
}

export function startGame(state: GameState, requesterId: string): GameState {
  if (state.phase !== 'lobby') return state;
  if (state.players.length < 2) return state;
  if (state.players[0].id !== requesterId) return state; // only host can start

  let s = { ...state, phase: 'playing' as const, currentPlayerIndex: 0, turnPhase: 'pre-roll' as const };
  s = log(s, `Game started! ${currentPlayer(s).name}'s turn.`);
  return s;
}

// --- Dice & Movement ---

export function rollDice(state: GameState, playerId: string): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId) return state;
  if (state.turnPhase !== 'pre-roll') return state;

  const die1 = Math.floor(Math.random() * 6) + 1;
  const die2 = Math.floor(Math.random() * 6) + 1;
  const isDoubles = die1 === die2;
  const total = die1 + die2;

  let s: GameState = { ...state, lastDice: [die1, die2], lastCardDrawn: null };
  s = log(s, `${player.name} rolled ${die1} + ${die2} = ${total}${isDoubles ? ' (doubles!)' : ''}`);

  // In jail?
  if (player.jailTurns > 0) {
    if (isDoubles) {
      s = updatePlayer(s, player.id, { jailTurns: 0 });
      s = log(s, `${player.name} rolled doubles and is free from jail!`);
      return movePlayer(s, player.id, total);
    } else {
      const newJailTurns = player.jailTurns + 1;
      if (newJailTurns > MAX_JAIL_TURNS) {
        // Must pay and move
        s = updatePlayer(s, player.id, { jailTurns: 0, money: player.money - JAIL_FINE });
        s = log(s, `${player.name} paid £${JAIL_FINE} to leave jail.`);
        return movePlayer(s, player.id, total);
      }
      s = updatePlayer(s, player.id, { jailTurns: newJailTurns });
      s = { ...s, turnPhase: 'post-roll' };
      return log(s, `${player.name} is still in jail.`);
    }
  }

  // Doubles tracking
  const doublesCount = isDoubles ? state.doublesCount + 1 : 0;
  s = { ...s, doublesCount };

  if (doublesCount >= 3) {
    s = log(s, `${player.name} rolled 3 doubles in a row — go to jail!`);
    return sendToJail(s, player.id);
  }

  return movePlayer(s, player.id, total);
}

function movePlayer(state: GameState, playerId: string, spaces: number): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const oldPosition = player.position;
  const newPosition = (oldPosition + spaces) % BOARD_SIZE;
  const passedGo = newPosition < oldPosition && spaces > 0;

  let s = updatePlayer(state, playerId, { position: newPosition });
  const updatedPlayer = s.players.find(p => p.id === playerId)!;

  if (passedGo) {
    s = updatePlayer(s, playerId, { money: updatedPlayer.money + GO_SALARY });
    s = log(s, `${updatedPlayer.name} passed GO and collected £${GO_SALARY}.`);
  }

  return handleLanding(s, playerId);
}

function handleLanding(state: GameState, playerId: string): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const space = BOARD_SPACES[player.position];
  let s = state;

  switch (space.type) {
    case 'property':
    case 'railroad':
    case 'utility': {
      const owned = getProperty(s, space.index);
      if (!owned) {
        // Unowned — player can buy
        s = { ...s, turnPhase: 'rolled' };
        return log(s, `${player.name} landed on ${space.name}. Price: £${space.price}.`);
      }
      if (owned.ownerId === playerId || owned.mortgaged) {
        s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
        return log(s, `${player.name} landed on ${space.name}.`);
      }
      // Pay rent
      const rent = calculateRent(s, space.index);
      s = payRent(s, playerId, owned.ownerId, rent, space.name);
      return s;
    }

    case 'tax': {
      const amount = space.taxAmount!;
      s = updatePlayer(s, playerId, { money: player.money - amount });
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return log(s, `${player.name} paid £${amount} ${space.name}.`);
    }

    case 'chance': {
      return drawCard(s, playerId, 'chance');
    }

    case 'community-chest': {
      return drawCard(s, playerId, 'community-chest');
    }

    case 'go-to-jail': {
      s = log(s, `${player.name} landed on Go To Jail!`);
      return sendToJail(s, playerId);
    }

    case 'go':
    case 'jail':
    case 'free-parking':
    default: {
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return log(s, `${player.name} landed on ${space.name}.`);
    }
  }
}

// --- Rent Calculation ---

function calculateRent(state: GameState, spaceIndex: number): number {
  const space = BOARD_SPACES[spaceIndex];
  const owned = getProperty(state, spaceIndex)!;

  if (space.type === 'railroad') {
    const count = countRailroads(state, owned.ownerId);
    return 25 * Math.pow(2, count - 1); // 25, 50, 100, 200
  }

  if (space.type === 'utility') {
    const count = countUtilities(state, owned.ownerId);
    const diceTotal = state.lastDice[0] + state.lastDice[1];
    return count === 1 ? diceTotal * 4 : diceTotal * 10;
  }

  // Property
  if (owned.houses === 0 && space.color && playerOwnsFullGroup(state, owned.ownerId, space.color)) {
    return space.rent![0] * 2; // double rent for monopoly with no houses
  }

  return space.rent![owned.houses];
}

function payRent(state: GameState, payerId: string, ownerId: string, amount: number, spaceName: string): GameState {
  const payer = state.players.find(p => p.id === payerId)!;
  const owner = state.players.find(p => p.id === ownerId)!;

  let s = state;
  if (payer.money < amount) {
    // Player goes bankrupt to owner
    return handleBankruptcy(s, payerId, ownerId);
  }

  s = updatePlayer(s, payerId, { money: payer.money - amount });
  s = updatePlayer(s, ownerId, { money: owner.money + amount });
  s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
  return log(s, `${payer.name} paid £${amount} rent to ${owner.name} for ${spaceName}.`);
}

// --- Cards ---

function drawCard(state: GameState, playerId: string, deck: 'chance' | 'community-chest'): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const cards = deck === 'chance' ? CHANCE_CARDS : COMMUNITY_CHEST_CARDS;
  const pile = deck === 'chance' ? [...state.chanceDrawPile] : [...state.communityChestDrawPile];

  if (pile.length === 0) {
    // Reshuffle
    pile.push(...shuffleDeck(cards));
  }

  const cardId = pile.shift()!;
  const card = cards.find(c => c.id === cardId)!;

  let s: GameState = deck === 'chance'
    ? { ...state, chanceDrawPile: pile }
    : { ...state, communityChestDrawPile: pile };

  s = { ...s, lastCardDrawn: { deck, card } };
  s = log(s, `${player.name} drew: "${card.text}"`);

  return applyCardAction(s, playerId, card);
}

function applyCardAction(state: GameState, playerId: string, card: CardDefinition): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  const action = card.action;
  let s = state;

  switch (action.type) {
    case 'collect':
      s = updatePlayer(s, playerId, { money: player.money + action.amount });
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return s;

    case 'pay':
      if (player.money < action.amount) return handleBankruptcy(s, playerId, null);
      s = updatePlayer(s, playerId, { money: player.money - action.amount });
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return s;

    case 'move-to': {
      const passGo = action.position < player.position && action.position !== JAIL_POSITION;
      s = updatePlayer(s, playerId, { position: action.position });
      if (passGo) {
        const p = s.players.find(p => p.id === playerId)!;
        s = updatePlayer(s, playerId, { money: p.money + GO_SALARY });
        s = log(s, `${player.name} passed GO and collected £${GO_SALARY}.`);
      }
      return handleLanding(s, playerId);
    }

    case 'move-to-nearest': {
      const railroadPositions = [5, 15, 25, 35];
      const utilityPositions = [12, 28];
      const positions = action.group === 'railroad' ? railroadPositions : utilityPositions;
      let nearest = positions[0];
      for (const pos of positions) {
        if (pos > player.position) { nearest = pos; break; }
      }
      if (nearest <= player.position) {
        // Wrapped around — pass GO
        s = updatePlayer(s, playerId, { money: player.money + GO_SALARY });
        s = log(s, `${player.name} passed GO and collected £${GO_SALARY}.`);
      }
      s = updatePlayer(s, playerId, { position: nearest });
      return handleLanding(s, playerId);
    }

    case 'move-back': {
      const newPos = (player.position - action.spaces + BOARD_SIZE) % BOARD_SIZE;
      s = updatePlayer(s, playerId, { position: newPos });
      return handleLanding(s, playerId);
    }

    case 'jail':
      return sendToJail(s, playerId);

    case 'get-out-of-jail':
      s = updatePlayer(s, playerId, { getOutOfJailCards: player.getOutOfJailCards + 1 });
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return s;

    case 'repairs': {
      const { houses, hotels } = countPlayerHousesAndHotels(s, playerId);
      const cost = houses * action.perHouse + hotels * action.perHotel;
      if (player.money < cost) return handleBankruptcy(s, playerId, null);
      s = updatePlayer(s, playerId, { money: player.money - cost });
      s = log(s, `${player.name} paid £${cost} in repairs.`);
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return s;
    }

    case 'collect-from-all': {
      let total = 0;
      for (const other of activePlayers(s)) {
        if (other.id === playerId) continue;
        const payment = Math.min(other.money, action.amount);
        s = updatePlayer(s, other.id, { money: other.money - payment });
        total += payment;
      }
      const p = s.players.find(p => p.id === playerId)!;
      s = updatePlayer(s, playerId, { money: p.money + total });
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return s;
    }

    case 'pay-to-all': {
      const others = activePlayers(s).filter(p => p.id !== playerId);
      const totalCost = others.length * action.amount;
      if (player.money < totalCost) return handleBankruptcy(s, playerId, null);
      s = updatePlayer(s, playerId, { money: player.money - totalCost });
      for (const other of others) {
        const o = s.players.find(p => p.id === other.id)!;
        s = updatePlayer(s, other.id, { money: o.money + action.amount });
      }
      s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
      return s;
    }
  }

  return s;
}

// --- Jail ---

function sendToJail(state: GameState, playerId: string): GameState {
  let s = updatePlayer(state, playerId, { position: JAIL_POSITION, jailTurns: 1 });
  s = { ...s, doublesCount: 0, turnPhase: 'post-roll' };
  return s;
}

export function jailPayFine(state: GameState, playerId: string): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId || player.jailTurns === 0) return state;
  if (player.money < JAIL_FINE) return state;

  let s = updatePlayer(state, playerId, { money: player.money - JAIL_FINE, jailTurns: 0 });
  s = log(s, `${player.name} paid £${JAIL_FINE} to get out of jail.`);
  s = { ...s, turnPhase: 'pre-roll' };
  return s;
}

export function jailUseCard(state: GameState, playerId: string): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId || player.jailTurns === 0) return state;
  if (player.getOutOfJailCards <= 0) return state;

  let s = updatePlayer(state, playerId, { getOutOfJailCards: player.getOutOfJailCards - 1, jailTurns: 0 });
  s = log(s, `${player.name} used a Get Out of Jail Free card.`);
  s = { ...s, turnPhase: 'pre-roll' };
  return s;
}

// --- Property Actions ---

export function buyProperty(state: GameState, playerId: string): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId || state.turnPhase !== 'rolled') return state;

  const space = BOARD_SPACES[player.position];
  if (!space.price) return state;
  if (getProperty(state, space.index)) return state;
  if (player.money < space.price) return state;

  const prop: OwnedProperty = {
    spaceIndex: space.index,
    ownerId: playerId,
    houses: 0,
    mortgaged: false,
  };

  let s: GameState = {
    ...state,
    properties: [...state.properties, prop],
    turnPhase: state.doublesCount > 0 ? 'pre-roll' : 'post-roll',
  };
  s = updatePlayer(s, playerId, { money: player.money - space.price });
  return log(s, `${player.name} bought ${space.name} for £${space.price}.`);
}

export function declineProperty(state: GameState, playerId: string): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId || state.turnPhase !== 'rolled') return state;

  const space = BOARD_SPACES[player.position];
  if (!space.price || getProperty(state, space.index)) return state;

  // Start auction
  const participants = activePlayers(state).map(p => p.id);
  const auction: AuctionState = {
    spaceIndex: space.index,
    currentBid: 0,
    currentBidderId: null,
    participants,
  };

  let s: GameState = { ...state, auction };
  return log(s, `${player.name} declined to buy ${space.name}. Auction starting!`);
}

export function auctionBid(state: GameState, playerId: string, amount: number): GameState {
  if (!state.auction) return state;
  const player = state.players.find(p => p.id === playerId);
  if (!player || !state.auction.participants.includes(playerId)) return state;
  if (amount <= state.auction.currentBid || amount > player.money) return state;

  let s: GameState = {
    ...state,
    auction: { ...state.auction, currentBid: amount, currentBidderId: playerId },
  };
  return log(s, `${player.name} bid £${amount}.`);
}

export function auctionPass(state: GameState, playerId: string): GameState {
  if (!state.auction) return state;
  if (!state.auction.participants.includes(playerId)) return state;

  const remaining = state.auction.participants.filter(id => id !== playerId);
  const player = state.players.find(p => p.id === playerId)!;
  let s: GameState = { ...state, auction: { ...state.auction, participants: remaining } };
  s = log(s, `${player.name} passed on the auction.`);

  // If one person left, they win
  if (remaining.length <= 1 && state.auction.currentBidderId) {
    return resolveAuction(s);
  }
  // If nobody bid and nobody left
  if (remaining.length === 0) {
    s = { ...s, auction: null, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
    return log(s, 'Auction ended with no buyer.');
  }

  return s;
}

function resolveAuction(state: GameState): GameState {
  if (!state.auction || !state.auction.currentBidderId) {
    return { ...state, auction: null, turnPhase: state.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
  }

  const { spaceIndex, currentBid, currentBidderId } = state.auction;
  const winner = state.players.find(p => p.id === currentBidderId)!;
  const space = BOARD_SPACES[spaceIndex];

  const prop: OwnedProperty = {
    spaceIndex,
    ownerId: currentBidderId,
    houses: 0,
    mortgaged: false,
  };

  let s: GameState = {
    ...state,
    properties: [...state.properties, prop],
    auction: null,
    turnPhase: state.doublesCount > 0 ? 'pre-roll' : 'post-roll',
  };
  s = updatePlayer(s, currentBidderId, { money: winner.money - currentBid });
  return log(s, `${winner.name} won the auction for ${space.name} at £${currentBid}.`);
}

// --- Building ---

export function buildHouse(state: GameState, playerId: string, spaceIndex: number): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId) return state;
  if (state.turnPhase !== 'pre-roll' && state.turnPhase !== 'post-roll') return state;

  const space = BOARD_SPACES[spaceIndex];
  if (space.type !== 'property' || !space.color) return state;

  const owned = getProperty(state, spaceIndex);
  if (!owned || owned.ownerId !== playerId || owned.mortgaged) return state;
  if (!playerOwnsFullGroup(state, playerId, space.color)) return state;

  // Check even building
  const groupSpaces = getSpacesByColor(space.color);
  const groupHouses = groupSpaces.map(gs => {
    const gp = getProperty(state, gs.index);
    return gp ? gp.houses : 0;
  });
  const minHouses = Math.min(...groupHouses);
  if (owned.houses > minHouses) return state; // must build evenly

  if (owned.houses >= 5) return state; // already has hotel

  const isHotel = owned.houses === 4;
  if (isHotel && state.hotels <= 0) return state;
  if (!isHotel && state.houses <= 0) return state;

  const cost = space.houseCost!;
  if (player.money < cost) return state;

  let s = updatePlayer(state, playerId, { money: player.money - cost });
  s = {
    ...s,
    properties: s.properties.map(p =>
      p.spaceIndex === spaceIndex ? { ...p, houses: p.houses + 1 } : p
    ),
    houses: isHotel ? s.houses + 4 : s.houses - 1, // hotel returns 4 houses
    hotels: isHotel ? s.hotels - 1 : s.hotels,
  };
  const buildType = isHotel ? 'a hotel' : `house #${owned.houses + 1}`;
  return log(s, `${player.name} built ${buildType} on ${space.name} for £${cost}.`);
}

export function sellHouse(state: GameState, playerId: string, spaceIndex: number): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId) return state;

  const space = BOARD_SPACES[spaceIndex];
  if (space.type !== 'property' || !space.color) return state;

  const owned = getProperty(state, spaceIndex);
  if (!owned || owned.ownerId !== playerId || owned.houses === 0) return state;

  // Check even selling
  const groupSpaces = getSpacesByColor(space.color);
  const groupHouses = groupSpaces.map(gs => {
    const gp = getProperty(state, gs.index);
    return gp ? gp.houses : 0;
  });
  const maxHouses = Math.max(...groupHouses);
  if (owned.houses < maxHouses) return state;

  const refund = Math.floor(space.houseCost! / 2);
  const isHotel = owned.houses === 5;

  let s = updatePlayer(state, playerId, { money: player.money + refund });
  s = {
    ...s,
    properties: s.properties.map(p =>
      p.spaceIndex === spaceIndex ? { ...p, houses: p.houses - 1 } : p
    ),
    houses: isHotel ? s.houses - 4 : s.houses + 1,
    hotels: isHotel ? s.hotels + 1 : s.hotels,
  };
  return log(s, `${player.name} sold a ${isHotel ? 'hotel' : 'house'} on ${space.name} for £${refund}.`);
}

// --- Mortgage ---

export function mortgage(state: GameState, playerId: string, spaceIndex: number): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const owned = getProperty(state, spaceIndex);
  if (!owned || owned.ownerId !== playerId || owned.mortgaged) return state;
  if (owned.houses > 0) return state; // must sell houses first

  const space = BOARD_SPACES[spaceIndex];
  const mortgageValue = Math.floor(space.price! * MORTGAGE_RATE);

  let s = updatePlayer(state, playerId, { money: player.money + mortgageValue });
  s = {
    ...s,
    properties: s.properties.map(p =>
      p.spaceIndex === spaceIndex ? { ...p, mortgaged: true } : p
    ),
  };
  return log(s, `${player.name} mortgaged ${space.name} for £${mortgageValue}.`);
}

export function unmortgage(state: GameState, playerId: string, spaceIndex: number): GameState {
  const player = state.players.find(p => p.id === playerId);
  if (!player) return state;

  const owned = getProperty(state, spaceIndex);
  if (!owned || owned.ownerId !== playerId || !owned.mortgaged) return state;

  const space = BOARD_SPACES[spaceIndex];
  const cost = Math.ceil(space.price! * UNMORTGAGE_RATE);
  if (player.money < cost) return state;

  let s = updatePlayer(state, playerId, { money: player.money - cost });
  s = {
    ...s,
    properties: s.properties.map(p =>
      p.spaceIndex === spaceIndex ? { ...p, mortgaged: false } : p
    ),
  };
  return log(s, `${player.name} unmortgaged ${space.name} for £${cost}.`);
}

// --- Trading ---

export function proposeTrade(state: GameState, fromId: string, toId: string, offer: { offerMoney: number; offerProperties: number[]; requestMoney: number; requestProperties: number[] }): GameState {
  if (state.tradeOffer) return state;
  // Validate ownership
  for (const idx of offer.offerProperties) {
    const prop = getProperty(state, idx);
    if (!prop || prop.ownerId !== fromId || prop.houses > 0) return state;
  }
  for (const idx of offer.requestProperties) {
    const prop = getProperty(state, idx);
    if (!prop || prop.ownerId !== toId || prop.houses > 0) return state;
  }

  const trade: TradeOffer = {
    id: `${Date.now()}`,
    fromId,
    toId,
    ...offer,
  };

  const from = state.players.find(p => p.id === fromId)!;
  const to = state.players.find(p => p.id === toId)!;
  let s: GameState = { ...state, tradeOffer: trade };
  return log(s, `${from.name} proposed a trade to ${to.name}.`);
}

export function acceptTrade(state: GameState, playerId: string): GameState {
  if (!state.tradeOffer || state.tradeOffer.toId !== playerId) return state;

  const trade = state.tradeOffer;
  const from = state.players.find(p => p.id === trade.fromId)!;
  const to = state.players.find(p => p.id === trade.toId)!;

  if (from.money < trade.offerMoney || to.money < trade.requestMoney) {
    return { ...state, tradeOffer: null };
  }

  let s = updatePlayer(state, trade.fromId, { money: from.money - trade.offerMoney + trade.requestMoney });
  s = updatePlayer(s, trade.toId, { money: to.money - trade.requestMoney + trade.offerMoney });

  // Transfer properties
  s = {
    ...s,
    properties: s.properties.map(p => {
      if (trade.offerProperties.includes(p.spaceIndex) && p.ownerId === trade.fromId) {
        return { ...p, ownerId: trade.toId };
      }
      if (trade.requestProperties.includes(p.spaceIndex) && p.ownerId === trade.toId) {
        return { ...p, ownerId: trade.fromId };
      }
      return p;
    }),
    tradeOffer: null,
  };

  return log(s, `${from.name} and ${to.name} completed a trade.`);
}

export function declineTrade(state: GameState, playerId: string): GameState {
  if (!state.tradeOffer || state.tradeOffer.toId !== playerId) return state;
  let s: GameState = { ...state, tradeOffer: null };
  return log(s, 'Trade declined.');
}

// --- Bankruptcy ---

function handleBankruptcy(state: GameState, playerId: string, creditorId: string | null): GameState {
  const player = state.players.find(p => p.id === playerId)!;
  let s = updatePlayer(state, playerId, { bankrupt: true, money: 0 });

  if (creditorId) {
    // Transfer properties to creditor
    const creditor = s.players.find(p => p.id === creditorId)!;
    s = updatePlayer(s, creditorId, { money: creditor.money + player.money });
    s = {
      ...s,
      properties: s.properties.map(p =>
        p.ownerId === playerId ? { ...p, ownerId: creditorId } : p
      ),
    };
    s = log(s, `${player.name} went bankrupt! Properties transferred to ${creditor.name}.`);
  } else {
    // Bankrupt to bank — remove all properties
    s = {
      ...s,
      properties: s.properties.filter(p => p.ownerId !== playerId),
    };
    s = log(s, `${player.name} went bankrupt!`);
  }

  // Check winner
  const remaining = activePlayers(s);
  if (remaining.length === 1) {
    s = { ...s, phase: 'finished', winner: remaining[0].id };
    s = log(s, `${remaining[0].name} wins the game!`);
  }

  s = { ...s, turnPhase: s.doublesCount > 0 ? 'pre-roll' : 'post-roll' };
  return s;
}

// --- Turn Management ---

export function endTurn(state: GameState, playerId: string): GameState {
  const player = currentPlayer(state);
  if (player.id !== playerId) return state;
  if (state.turnPhase !== 'post-roll') return state;

  let nextIndex = state.currentPlayerIndex;
  const playerCount = state.players.length;
  do {
    nextIndex = (nextIndex + 1) % playerCount;
  } while (state.players[nextIndex].bankrupt && nextIndex !== state.currentPlayerIndex);

  let s: GameState = {
    ...state,
    currentPlayerIndex: nextIndex,
    turnPhase: 'pre-roll',
    doublesCount: 0,
    lastCardDrawn: null,
  };
  return log(s, `${s.players[nextIndex].name}'s turn.`);
}

// --- Player Connection ---

export function setPlayerConnected(state: GameState, playerId: string, connected: boolean): GameState {
  return updatePlayer(state, playerId, { connected });
}

export function removePlayer(state: GameState, playerId: string): GameState {
  if (state.phase === 'lobby') {
    return {
      ...state,
      players: state.players.filter(p => p.id !== playerId),
    };
  }
  return updatePlayer(state, playerId, { connected: false });
}
