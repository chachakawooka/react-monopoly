import React from 'react';
import './CommunityChest.scss';
import store from '../../store';

class CommunityChest extends React.Component {
  constructor(props) {
    super(props);

  }
  update(){
    console.log('test')
    store.dispatch({
        type: 'UPDATE_SQUARE_NAME',
        payload: {
          num:1,
          name:'my test'
        }
    });
  }
  render(){
    return (
      <div class="CommunityChest" onClick={this.update}>
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
