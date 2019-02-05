import React from 'react';
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
      <div style={style}>
        {this.props.name}
      </div>
    )

  }
}

export default Property
