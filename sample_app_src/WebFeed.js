class WebFeed extends React.Component {
  constructor() {
    super();
    this.connection = new WebSocket("wss://localhost");
    this.connection.onOpen = this.onOpen;
    this.connection.onError = this.onError;
    this.connection.onError = this.onError;
  }
  onError() {}
  onMessage() {}
  onOpen() {}
  render() {
    return (
      <div>
        <ul>
          {this.props.fetchedData.forEach(item => {
            return (<li>{item.data}{this.props.name}</li>);
          })}
        </ul>
      </div>
    )
  }
}
