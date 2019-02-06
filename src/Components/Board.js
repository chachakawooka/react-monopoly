import React from 'react';
import boardSpaces from '../configs/boardSpaces'
import './Board.scss';

class Board extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){

    return (
      <div class="board">
        <div class="center" />
        <div class="boardSpaces">
          {
            boardSpaces.map(function(boardSpace) {
                return   <boardSpace.type name={boardSpace.name} color={boardSpace.color}/>
            })
          }
        </div>
      </div>
    )

  }
}

export default Board
