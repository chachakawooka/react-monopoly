import type * as Party from "partykit/server";
import {
  createInitialState, addPlayer, startGame, rollDice, buyProperty,
  declineProperty, auctionBid, auctionPass, buildHouse, sellHouse,
  mortgage, unmortgage, endTurn, jailPayFine, jailUseCard,
  proposeTrade, acceptTrade, declineTrade,
  setPlayerConnected, removePlayer,
} from "../src/game/engine";
import type { GameState, ClientMessage, ServerMessage } from "../src/game/types";

export default class MonopolyServer implements Party.Server {
  state: GameState;
  connectionToPlayer: Map<string, string> = new Map(); // connectionId -> playerId

  constructor(readonly room: Party.Room) {
    this.state = createInitialState(room.id);
  }

  onConnect(conn: Party.Connection) {
    // Send current state and assign player ID
    const msg: ServerMessage = { type: 'player-id', id: conn.id };
    conn.send(JSON.stringify(msg));
    this.broadcastState();
  }

  onClose(conn: Party.Connection) {
    const playerId = this.connectionToPlayer.get(conn.id);
    if (playerId) {
      this.state = setPlayerConnected(this.state, playerId, false);
      this.connectionToPlayer.delete(conn.id);

      // In lobby, remove disconnected players
      if (this.state.phase === 'lobby') {
        this.state = removePlayer(this.state, playerId);
      }

      this.broadcastState();
    }
  }

  onMessage(message: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(message);
    } catch {
      sender.send(JSON.stringify({ type: 'error', message: 'Invalid message' }));
      return;
    }

    const playerId = this.connectionToPlayer.get(sender.id) || sender.id;

    switch (msg.type) {
      case 'join': {
        this.connectionToPlayer.set(sender.id, sender.id);
        this.state = addPlayer(this.state, sender.id, msg.name, msg.token);
        break;
      }

      case 'start-game':
        this.state = startGame(this.state, playerId);
        break;

      case 'roll-dice':
        this.state = rollDice(this.state, playerId);
        break;

      case 'buy-property':
        this.state = buyProperty(this.state, playerId);
        break;

      case 'decline-property':
        this.state = declineProperty(this.state, playerId);
        break;

      case 'auction-bid':
        this.state = auctionBid(this.state, playerId, msg.amount);
        break;

      case 'auction-pass':
        this.state = auctionPass(this.state, playerId);
        break;

      case 'build-house':
        this.state = buildHouse(this.state, playerId, msg.spaceIndex);
        break;

      case 'sell-house':
        this.state = sellHouse(this.state, playerId, msg.spaceIndex);
        break;

      case 'mortgage':
        this.state = mortgage(this.state, playerId, msg.spaceIndex);
        break;

      case 'unmortgage':
        this.state = unmortgage(this.state, playerId, msg.spaceIndex);
        break;

      case 'end-turn':
        this.state = endTurn(this.state, playerId);
        break;

      case 'jail-pay':
        this.state = jailPayFine(this.state, playerId);
        break;

      case 'jail-card':
        this.state = jailUseCard(this.state, playerId);
        break;

      case 'jail-roll':
        this.state = rollDice(this.state, playerId);
        break;

      case 'trade-propose':
        this.state = proposeTrade(this.state, playerId, msg.offer.toId, {
          offerMoney: msg.offer.offerMoney,
          offerProperties: msg.offer.offerProperties,
          requestMoney: msg.offer.requestMoney,
          requestProperties: msg.offer.requestProperties,
        });
        break;

      case 'trade-accept':
        this.state = acceptTrade(this.state, playerId);
        break;

      case 'trade-decline':
        this.state = declineTrade(this.state, playerId);
        break;

      default:
        sender.send(JSON.stringify({ type: 'error', message: 'Unknown action' }));
        return;
    }

    this.broadcastState();
  }

  broadcastState() {
    const msg: ServerMessage = { type: 'state-update', state: this.state };
    const data = JSON.stringify(msg);
    for (const conn of this.room.getConnections()) {
      conn.send(data);
    }
  }
}

MonopolyServer satisfies Party.Worker;
