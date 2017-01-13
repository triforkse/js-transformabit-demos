import React from 'react';

const Greeting = React.createClass({
  render: function() {
    return <h1>Hello,{this.props.name}</h1>;
  }
});
