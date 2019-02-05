import React from 'react';
import Property from './Property';

class Board extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    return (
      <div>
        <Property name="test" color="red"/>
        <Property name="test" color="green"/>
      </div>
    )

  }
}

export default Board
