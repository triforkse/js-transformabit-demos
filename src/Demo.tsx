import { JsCode, JsNode, GenericJsNode } from 'js-transformabit';
import * as js from 'js-transformabit';
import { VirtualNodeProject } from './NodeProject';

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

// Demo: add constructor
// console.log(node.createConstructor().format());

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

// Demo: add prop types
// import { AddPropTypes } from '../.atomist/.editorsTSX/AddPropTypes';
// const project = new VirtualNodeProject();
// project.addInitialFile('/foo.js',
// `class Foo extends React.Component {
//   constructor(props) {
//     super(props);
//     this.props.name = 'foo';
//     this.props.count = 42;
//     this.props.hasName = true;
//     this.props.data = {foo: 'bar'};
//     this.props.nameList[23] = 'bob'
//     this.props.otherNames = ['bob', 'alice'];
//     this.props.makeName = function() { return 'bob' };
//     this.props.nameFactory = new NameFactory();
//     this.props.mystery = someVar;
//   }

//   foo() {
//     if (this.props.binaryCount <= 20) {
//       return;
//     } else if (this.props.binaryCount === undefined) {
//       return;
//     }
//   }
// }`);
// new AddPropTypes().edit(project);
// project.printDiff();

// Demo: bind web sockets
import { AddWebSocket } from '../.atomist/.editorsTSX/AddWebSocket';
const project = VirtualNodeProject.fromExistingApp('./sample_app_src');
new AddWebSocket().edit(project, {
  component: 'App',
  address: 'localhost'
});
project.printDiff();

// Demo: create unit tests
// import { AddUnitTestForReactComponent } from '../.atomist/editors/AddUnitTestForReactComponent';
// const project = VirtualNodeProject.fromExistingApp('./sample_app_src');
// new AddUnitTestForReactComponent().edit(project);
// project.printDiff();

// Demo: convert components
// import { ConvertToReactComponent } from '../.atomist/editors/ConvertToReactComponent';
// const project = VirtualNodeProject.fromExistingApp('./sample_app_src');
// new ConvertToReactComponent().edit(project);
// project.print();
