export type SpaceType =
  | 'property'
  | 'railroad'
  | 'utility'
  | 'chance'
  | 'community-chest'
  | 'tax'
  | 'go'
  | 'jail'
  | 'free-parking'
  | 'go-to-jail';

export type ColorGroup =
  | 'brown'
  | 'lightblue'
  | 'pink'
  | 'orange'
  | 'red'
  | 'yellow'
  | 'green'
  | 'blue';

export type TokenType = 'boot' | 'car' | 'hat' | 'iron';

export interface SpaceDefinition {
  index: number;
  name: string;
  type: SpaceType;
  color?: ColorGroup;
  price?: number;
  rent?: number[];      // [base, 1house, 2house, 3house, 4house, hotel]
  houseCost?: number;
  taxAmount?: number;
}

export interface OwnedProperty {
  spaceIndex: number;
  ownerId: string;
  houses: number;       // 0-4 houses, 5 = hotel
  mortgaged: boolean;
}

export interface Player {
  id: string;
  name: string;
  token: TokenType;
  money: number;
  position: number;
  jailTurns: number;    // 0 = not in jail, 1-3 = turns spent in jail
  getOutOfJailCards: number;
  bankrupt: boolean;
  connected: boolean;
}

export type GamePhase = 'lobby' | 'playing' | 'finished';
export type TurnPhase = 'pre-roll' | 'rolled' | 'must-pay' | 'post-roll';

export interface AuctionState {
  spaceIndex: number;
  currentBid: number;
  currentBidderId: string | null;
  participants: string[];  // player IDs still in auction
}

export interface TradeOffer {
  id: string;
  fromId: string;
  toId: string;
  offerMoney: number;
  offerProperties: number[];
  requestMoney: number;
  requestProperties: number[];
}

export interface CardDefinition {
  id: number;
  text: string;
  action: CardAction;
}

export type CardAction =
  | { type: 'collect'; amount: number }
  | { type: 'pay'; amount: number }
  | { type: 'move-to'; position: number }
  | { type: 'move-to-nearest'; group: 'railroad' | 'utility' }
  | { type: 'move-back'; spaces: number }
  | { type: 'jail' }
  | { type: 'get-out-of-jail' }
  | { type: 'repairs'; perHouse: number; perHotel: number }
  | { type: 'collect-from-all'; amount: number }
  | { type: 'pay-to-all'; amount: number };

export interface LogEntry {
  timestamp: number;
  message: string;
}

export interface GameState {
  id: string;
  phase: GamePhase;
  players: Player[];
  properties: OwnedProperty[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  lastDice: [number, number];
  doublesCount: number;
  houses: number;       // remaining supply
  hotels: number;       // remaining supply
  chanceDrawPile: number[];
  communityChestDrawPile: number[];
  auction: AuctionState | null;
  tradeOffer: TradeOffer | null;
  winner: string | null;
  log: LogEntry[];
  lastCardDrawn: { deck: 'chance' | 'community-chest'; card: CardDefinition } | null;
}

// WebSocket message types
export type ClientMessage =
  | { type: 'join'; name: string; token: TokenType }
  | { type: 'start-game' }
  | { type: 'roll-dice' }
  | { type: 'buy-property' }
  | { type: 'decline-property' }
  | { type: 'auction-bid'; amount: number }
  | { type: 'auction-pass' }
  | { type: 'build-house'; spaceIndex: number }
  | { type: 'sell-house'; spaceIndex: number }
  | { type: 'mortgage'; spaceIndex: number }
  | { type: 'unmortgage'; spaceIndex: number }
  | { type: 'end-turn' }
  | { type: 'jail-pay' }
  | { type: 'jail-card' }
  | { type: 'jail-roll' }
  | { type: 'trade-propose'; offer: Omit<TradeOffer, 'id' | 'fromId'> }
  | { type: 'trade-accept' }
  | { type: 'trade-decline' };

export type ServerMessage =
  | { type: 'state-update'; state: GameState }
  | { type: 'error'; message: string }
  | { type: 'player-id'; id: string };
