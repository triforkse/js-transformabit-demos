class InferPropTypes extends React.Component {
  constructor(props) {
    super(props);
    this.props.name = 'foo';
    this.props.count = 42;
    this.props.hasName = true;
    this.props.data = { foo: 'bar' };
    this.props.nameList[23] = 'bob'
    this.props.otherNames = ['bob', 'alice'];
    this.props.makeName = function () { return 'bob' };
    this.props.nameFactory = new NameFactory();
    this.props.mystery = someVar;
  }

  foo() {
    if (this.props.binaryCount <= 20) {
      return;
    }
  }
}
