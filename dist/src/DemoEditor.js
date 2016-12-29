"use strict";
var js_transformabit_1 = require('js-transformabit');
var DemoEditor = (function () {
    function DemoEditor() {
    }
    DemoEditor.prototype.configure = function (args) {
    };
    DemoEditor.prototype.check = function (root) {
        return true;
    };
    // apply(root: GenericJsNode): GenericJsNode {
    //   root
    //     .findChildrenOfType(MethodDefinition)
    //     .filter(node => node.methodName() === 'render')
    //     .removeAll();
    //   return root;
    // }
    DemoEditor.prototype.apply = function (root) {
        if (root.check(js_transformabit_1.ReactClassComponent)) {
            return root.convertToReactComponent();
        }
    };
    return DemoEditor;
}());
exports.DemoEditor = DemoEditor;
