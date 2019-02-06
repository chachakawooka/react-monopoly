import React from 'react';
import './Property.scss';

class Property extends React.Component {
  constructor(props) {
    super(props);

  }
  render(){
    var text = this.props.name;

    const style = {
      backgroundColor: this.props.color,
    }

    return (
      <div class="Property">
        <div class="container">
  				<div class="color-bar" style={style}></div>
  				<div class="name">{this.props.name}</div>
  				<div class="price">Price $50</div>
  			</div>
      </div>
    )

  }
}

export default Property
