"use strict";
var js_transformabit_1 = require('js-transformabit');
var CreateClassToComponent = (function () {
    function CreateClassToComponent() {
    }
    CreateClassToComponent.prototype.configure = function (args) {
    };
    CreateClassToComponent.prototype.check = function (root) {
        return root.findChildrenOfType(js_transformabit_1.ReactComponent) !== undefined;
    };
    CreateClassToComponent.prototype.apply = function (root) {
        root
            .findChildrenOfType(js_transformabit_1.ReactComponent)
            .forEach(function (c) { return c.convertToReactClassComponent(); });
        return root;
    };
    return CreateClassToComponent;
}());
exports.CreateClassToComponent = CreateClassToComponent;
