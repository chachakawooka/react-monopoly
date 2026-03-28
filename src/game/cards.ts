import { CardDefinition } from './types';

export const CHANCE_CARDS: CardDefinition[] = [
  { id: 1, text: 'Advance to GO. Collect £200.', action: { type: 'move-to', position: 0 } },
  { id: 2, text: 'Advance to Trafalgar Square. If you pass GO, collect £200.', action: { type: 'move-to', position: 24 } },
  { id: 3, text: 'Advance to Pall Mall. If you pass GO, collect £200.', action: { type: 'move-to', position: 11 } },
  { id: 4, text: 'Advance to the nearest station. Pay the owner twice the rental.', action: { type: 'move-to-nearest', group: 'railroad' } },
  { id: 5, text: 'Advance to the nearest station. Pay the owner twice the rental.', action: { type: 'move-to-nearest', group: 'railroad' } },
  { id: 6, text: 'Advance to the nearest utility. If unowned you may buy it. If owned, throw dice and pay owner 10 times the amount thrown.', action: { type: 'move-to-nearest', group: 'utility' } },
  { id: 7, text: 'Bank pays you dividend of £50.', action: { type: 'collect', amount: 50 } },
  { id: 8, text: 'Get Out of Jail Free.', action: { type: 'get-out-of-jail' } },
  { id: 9, text: 'Go back 3 spaces.', action: { type: 'move-back', spaces: 3 } },
  { id: 10, text: 'Go to Jail. Go directly to Jail. Do not pass GO, do not collect £200.', action: { type: 'jail' } },
  { id: 11, text: 'Make general repairs on all your property. For each house pay £25. For each hotel pay £100.', action: { type: 'repairs', perHouse: 25, perHotel: 100 } },
  { id: 12, text: 'Pay poor tax of £15.', action: { type: 'pay', amount: 15 } },
  { id: 13, text: 'Take a trip to King\'s Cross Station. If you pass GO, collect £200.', action: { type: 'move-to', position: 5 } },
  { id: 14, text: 'Advance to Mayfair.', action: { type: 'move-to', position: 39 } },
  { id: 15, text: 'You have been elected Chairman of the Board. Pay each player £50.', action: { type: 'pay-to-all', amount: 50 } },
  { id: 16, text: 'Your building loan matures. Collect £150.', action: { type: 'collect', amount: 150 } },
];

export const COMMUNITY_CHEST_CARDS: CardDefinition[] = [
  { id: 1, text: 'Advance to GO. Collect £200.', action: { type: 'move-to', position: 0 } },
  { id: 2, text: 'Bank error in your favour. Collect £200.', action: { type: 'collect', amount: 200 } },
  { id: 3, text: 'Doctor\'s fees. Pay £50.', action: { type: 'pay', amount: 50 } },
  { id: 4, text: 'From sale of stock you get £50.', action: { type: 'collect', amount: 50 } },
  { id: 5, text: 'Get Out of Jail Free.', action: { type: 'get-out-of-jail' } },
  { id: 6, text: 'Go to Jail. Go directly to Jail. Do not pass GO, do not collect £200.', action: { type: 'jail' } },
  { id: 7, text: 'Grand Opera Night. Collect £50 from every player for opening night seats.', action: { type: 'collect-from-all', amount: 50 } },
  { id: 8, text: 'Holiday fund matures. Receive £100.', action: { type: 'collect', amount: 100 } },
  { id: 9, text: 'Income tax refund. Collect £20.', action: { type: 'collect', amount: 20 } },
  { id: 10, text: 'It is your birthday. Collect £10 from every player.', action: { type: 'collect-from-all', amount: 10 } },
  { id: 11, text: 'Life insurance matures. Collect £100.', action: { type: 'collect', amount: 100 } },
  { id: 12, text: 'Hospital fees. Pay £100.', action: { type: 'pay', amount: 100 } },
  { id: 13, text: 'School fees. Pay £50.', action: { type: 'pay', amount: 50 } },
  { id: 14, text: 'Consultancy fee. Receive £25.', action: { type: 'collect', amount: 25 } },
  { id: 15, text: 'You are assessed for street repairs. £40 per house, £115 per hotel.', action: { type: 'repairs', perHouse: 40, perHotel: 115 } },
  { id: 16, text: 'You have won second prize in a beauty contest. Collect £10.', action: { type: 'collect', amount: 10 } },
];

export function shuffleDeck(cards: CardDefinition[]): number[] {
  const ids = cards.map(c => c.id);
  for (let i = ids.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }
  return ids;
}
