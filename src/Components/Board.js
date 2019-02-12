import React from 'react';
import { connect } from 'react-redux';

import './Board.scss';

class Board extends React.Component {
  render(){
    return (
      <div class="board">
        <div class="center" />
        <div class="boardSpaces">
          {
            this.props.boardSpaces.map(function(boardSpace) {
                return   <boardSpace.type name={boardSpace.name} color={boardSpace.color}/>
            })
          }
        </div>
      </div>
    )

  }
}

const mapStateToProps = (state) => {
  return {
    boardSpaces: state.boardSpaces,
    renderCount: state.test
  }
}

export default  connect(mapStateToProps)(Board);
