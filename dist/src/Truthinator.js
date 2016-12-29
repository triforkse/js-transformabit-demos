"use strict";
var js_transformabit_1 = require('js-transformabit');
var Truthinator = (function () {
    function Truthinator() {
    }
    Truthinator.prototype.configure = function (args) {
    };
    Truthinator.prototype.check = function (root) {
        return root.findChildrenOfType(js_transformabit_1.BinaryExpression).size() > 0;
    };
    Truthinator.prototype.apply = function (root) {
        var _this = this;
        root.findChildrenOfType(js_transformabit_1.BinaryExpression).forEach(function (binaryExpression) {
            if (_this.isDangerousOperator(binaryExpression.operator)) {
                binaryExpression.operator = _this.asSafeOperator(binaryExpression.operator);
            }
        });
        return root;
    };
    Truthinator.prototype.isDangerousOperator = function (operator) {
        return (operator === "==" || operator === "!=");
    };
    Truthinator.prototype.asSafeOperator = function (operator) {
        switch (operator) {
            case "==": return "===";
            case "!=": return "!==";
            default: return operator;
        }
    };
    return Truthinator;
}());
exports.Truthinator = Truthinator;
