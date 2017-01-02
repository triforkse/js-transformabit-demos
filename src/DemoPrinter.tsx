import { JsCode, JsNode, GenericJsNode } from 'js-transformabit';
import * as js from 'js-transformabit';

let node: GenericJsNode;

// node = (
//   <js.ReactClassComponent id='MyComponent'>
//     <js.ReactComponentRender>
//       {'<h1>Trifork ftw!</h1>'}
//     </js.ReactComponentRender>
//     <js.ReactComponentEventHandler name='handleLife'>
//       {JsNode.fromFunctionBody('return 42;').at(0)}
//     </js.ReactComponentEventHandler>
//   </js.ReactClassComponent>
// ) as js.ReactClassComponent;
// console.log(node.format());

// Demo: format and re-parse
// node = JsNode.fromCode(node.format()).at(0) as any;

// Demo: finding complex components
// console.log(node.findFirstChildOfType(ReactComponentRender).format());

// Demo: editor
import { DemoEditor } from './DemoEditor';
node = JsNode.fromModuleCode(`class Foo extends React.Component {
  constructor(props) {
    super(props);
    this.props.name = 'foo';
    this.props.count = 42;
    this.props.mystery = someVar;
  }
}`);
node = new DemoEditor().edit(node);
console.log(node.format());

// Demo: add constructor
// console.log(node.createConstructor().format());

// Demo: bind web sockets
// import { AddWebSocket } from '../.atomist/editors/AddWebSocket';
// node = new AddWebSocket().editNode(JsNode.fromModuleCode('class Foo extends React.Component {}'), {
//   component: 'Foo',
//   address: 'localhost'
// });
// console.log(node.format());

// Demo: type guards
// if (node.check(ClassDeclaration)) {
//   let superClass = node.superClass();
//   if (superClass.check(MemberExpression)) {
//     let object = superClass.object();
//     if (object.check(Identifier)) {
//       console.log(object.name);
//     }
//   }
// }

// Demo: type specific methods
// console.log(node.getRenderMethod().format());
