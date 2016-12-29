"use strict";
var js_transformabit_1 = require('js-transformabit');
var DemoEditor_1 = require('./DemoEditor');
var node = (js_transformabit_1.JsCode.createElement(js_transformabit_1.ReactClassComponent, {id: 'MyComponent'}, 
    js_transformabit_1.JsCode.createElement(js_transformabit_1.ReactComponentRender, null, '<h1>Trifork ftw!</h1>'), 
    js_transformabit_1.JsCode.createElement(js_transformabit_1.ReactComponentEventHandler, {name: 'handleLife'}, js_transformabit_1.JsNode.fromFunctionBody('return 42;').at(0))));
// console.log(node.format());
// Demo: format and re-parse
// node = JsNode.fromCode(node.format()).at(0) as any;
// Demo: finding complex components
// console.log(node.findFirstChildOfType(ReactComponentRender).format());
// Demo: editor
var newNode = new DemoEditor_1.DemoEditor().apply(node, null);
node = newNode.convertToReactClassComponent();
console.log(newNode.format());
// Demo: add constructor
// console.log(node.createConstructor().format());
// Demo: bind web sockets
// let t = new BindWebSocket();
// t.configure(['MyComponent', 'foo']);
// t.apply(node, null);
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
