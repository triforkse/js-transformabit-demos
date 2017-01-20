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
