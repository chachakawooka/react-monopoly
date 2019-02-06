import React from 'react';
import './CommunityChest.scss';

class CommunityChest extends React.Component {
  constructor(props) {
    super(props);

  }
  render(){
    return (
      <div class="CommunityChest">
        <div class="container">
					<div class="name">Community Chest</div>
					<i class="drawing fa fa-cube"></i>
					<div class="instructions">Follow instructions on top card</div>
				</div>
      </div>
    )

  }
}

export default CommunityChest
