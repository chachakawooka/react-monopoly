import { SpaceDefinition } from './types';

export const BOARD_SPACES: SpaceDefinition[] = [
  // Bottom row (right to left): indices 0-10
  { index: 0, name: 'GO', type: 'go' },
  { index: 1, name: 'Old Kent Road', type: 'property', color: 'brown', price: 60, rent: [2, 10, 30, 90, 160, 250], houseCost: 50 },
  { index: 2, name: 'Community Chest', type: 'community-chest' },
  { index: 3, name: 'Whitechapel Road', type: 'property', color: 'brown', price: 60, rent: [4, 20, 60, 180, 320, 450], houseCost: 50 },
  { index: 4, name: 'Income Tax', type: 'tax', taxAmount: 200 },
  { index: 5, name: 'King\'s Cross Station', type: 'railroad', price: 200 },
  { index: 6, name: 'The Angel Islington', type: 'property', color: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { index: 7, name: 'Chance', type: 'chance' },
  { index: 8, name: 'Euston Road', type: 'property', color: 'lightblue', price: 100, rent: [6, 30, 90, 270, 400, 550], houseCost: 50 },
  { index: 9, name: 'Pentonville Road', type: 'property', color: 'lightblue', price: 120, rent: [8, 40, 100, 300, 450, 600], houseCost: 50 },
  { index: 10, name: 'Just Visiting / Jail', type: 'jail' },

  // Left column (bottom to top): indices 11-19
  { index: 11, name: 'Pall Mall', type: 'property', color: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { index: 12, name: 'Electric Company', type: 'utility', price: 150 },
  { index: 13, name: 'Whitehall', type: 'property', color: 'pink', price: 140, rent: [10, 50, 150, 450, 625, 750], houseCost: 100 },
  { index: 14, name: 'Northumberland Avenue', type: 'property', color: 'pink', price: 160, rent: [12, 60, 180, 500, 700, 900], houseCost: 100 },
  { index: 15, name: 'Marylebone Station', type: 'railroad', price: 200 },
  { index: 16, name: 'Bow Street', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { index: 17, name: 'Community Chest', type: 'community-chest' },
  { index: 18, name: 'Marlborough Street', type: 'property', color: 'orange', price: 180, rent: [14, 70, 200, 550, 750, 950], houseCost: 100 },
  { index: 19, name: 'Vine Street', type: 'property', color: 'orange', price: 200, rent: [16, 80, 220, 600, 800, 1000], houseCost: 100 },

  // Top row (left to right): indices 20-30
  { index: 20, name: 'Free Parking', type: 'free-parking' },
  { index: 21, name: 'Strand', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { index: 22, name: 'Chance', type: 'chance' },
  { index: 23, name: 'Fleet Street', type: 'property', color: 'red', price: 220, rent: [18, 90, 250, 700, 875, 1050], houseCost: 150 },
  { index: 24, name: 'Trafalgar Square', type: 'property', color: 'red', price: 240, rent: [20, 100, 300, 750, 925, 1100], houseCost: 150 },
  { index: 25, name: 'Fenchurch St. Station', type: 'railroad', price: 200 },
  { index: 26, name: 'Leicester Square', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { index: 27, name: 'Coventry Street', type: 'property', color: 'yellow', price: 260, rent: [22, 110, 330, 800, 975, 1150], houseCost: 150 },
  { index: 28, name: 'Water Works', type: 'utility', price: 150 },
  { index: 29, name: 'Piccadilly', type: 'property', color: 'yellow', price: 280, rent: [22, 120, 360, 850, 1025, 1200], houseCost: 150 },
  { index: 30, name: 'Go To Jail', type: 'go-to-jail' },

  // Right column (top to bottom): indices 31-39
  { index: 31, name: 'Regent Street', type: 'property', color: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { index: 32, name: 'Oxford Street', type: 'property', color: 'green', price: 300, rent: [26, 130, 390, 900, 1100, 1275], houseCost: 200 },
  { index: 33, name: 'Community Chest', type: 'community-chest' },
  { index: 34, name: 'Bond Street', type: 'property', color: 'green', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], houseCost: 200 },
  { index: 35, name: 'Liverpool Street Station', type: 'railroad', price: 200 },
  { index: 36, name: 'Chance', type: 'chance' },
  { index: 37, name: 'Park Lane', type: 'property', color: 'blue', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], houseCost: 200 },
  { index: 38, name: 'Super Tax', type: 'tax', taxAmount: 100 },
  { index: 39, name: 'Mayfair', type: 'property', color: 'blue', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], houseCost: 200 },
];

export function getSpacesByColor(color: string): SpaceDefinition[] {
  return BOARD_SPACES.filter(s => s.color === color);
}

export function getRailroads(): SpaceDefinition[] {
  return BOARD_SPACES.filter(s => s.type === 'railroad');
}

export function getUtilities(): SpaceDefinition[] {
  return BOARD_SPACES.filter(s => s.type === 'utility');
}
