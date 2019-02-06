import Property from '../Components/Squares/Property';
import Chance from '../Components/Squares/Chance';
import CommunityChest from '../Components/Squares/CommunityChest';
import Go from '../Components/Squares/Go';

const boardSpaces = [
  { type: Go },
  { type: Property, name: "Old Kent Road", color: '#8B4513' },
  { type: CommunityChest},
  { type: Property, name: "White Chapel", color: '#8B4513' }
]

export default boardSpaces
