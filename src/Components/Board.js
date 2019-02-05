import React from 'react';
import Property from './Property';
import Chance from './Chance';
import CommunityChest from './CommunityChest';

class Board extends React.Component {
  constructor(props) {
    super(props);
  }
  render(){
    return (
      <div>
        <Property name="Old Kent Road" color="#8B4513"/>
        <CommunityChest />
        <Property name="White Chapel" color="#8B4513"/>
      </div>
    )

  }
}

export default Board
