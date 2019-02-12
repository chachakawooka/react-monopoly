import { createStore } from 'redux';
import Property from './Components/Squares/Property';
import Chance from './Components/Squares/Chance';
import CommunityChest from './Components/Squares/CommunityChest';
import Go from './Components/Squares/Go';


const DEFAULT_STATE = {
  boardSpaces: [
    { type: Go },
    { type: Property, name: "Old Kent Road", color: '#8B4513' },
    { type: CommunityChest},
    { type: Property, name: "White Chapel", color: '#8B4513' }
  ]
}

function store(state = DEFAULT_STATE, action) {
    switch(action.type) {
        case 'UPDATE_SQUARE_NAME':
            let boardSpaces = state.boardSpaces
            boardSpaces[action.payload.num].name = action.payload.name
            return  Object.assign({}, state, {
                boardSpaces: boardSpaces,
                renderCount: state.test++
            });
        case 'UPDATE_BOARD':
            return  Object.assign({}, state, {
                boardSpaces: action.payload
            });
        default:
            return state
    }
}

export default createStore(store);
