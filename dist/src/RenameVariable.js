"use strict";
var js_transformabit_1 = require('js-transformabit');
var RenameVariable = (function () {
    function RenameVariable() {
    }
    RenameVariable.prototype.configure = function (args) {
        this.oldName = args[0];
        this.newName = args[1];
    };
    RenameVariable.prototype.check = function (root) {
        var _this = this;
        return root
            .findChildrenOfType(js_transformabit_1.Identifier)
            .has(function (n) { return n.node.name === _this.oldName; });
    };
    RenameVariable.prototype.apply = function (root) {
        var _this = this;
        root
            .findChildrenOfType(js_transformabit_1.Identifier)
            .forEach(function (n) {
            if (n.node.name === _this.oldName) {
                n.node.name = _this.newName;
            }
        });
        return root;
    };
    return RenameVariable;
}());
exports.RenameVariable = RenameVariable;
