class NameBadge extends React.Component {
  render() {
    return (
      <h1>Hi, my name is {this.props.firstName} {this.props.lastName}</h1>
    );
  }
}