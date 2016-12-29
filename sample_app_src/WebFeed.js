class WebFeed extends React.Component {
  constructor() {
    super();

    this.connection = new WebSocket("wss://127.0.0.2");
    this.connection.onOpen = this.onOpen;
    this.connection.onError = this.onError;
    this.connection.onError = this.onError;
  }



  onOpen() {}
  onError() {}
  onMessage() {}




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



WebFeed.propTypes = {
  fetchedData: React.PropTypes.any,
  name: React.PropTypes.any
};



