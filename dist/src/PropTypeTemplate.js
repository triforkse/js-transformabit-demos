"use strict";
var js_transformabit_1 = require('js-transformabit');
var PropTypeTemplate = (function () {
    function PropTypeTemplate() {
    }
    PropTypeTemplate.prototype.configure = function (args) {
    };
    PropTypeTemplate.prototype.check = function (root) {
        return root.findChildrenOfType(js_transformabit_1.ReactClassComponent).filter(function (component) {
            return component.findChildrenOfType(js_transformabit_1.MemberExpression).filter(function (memberExpression) {
                return memberExpression.object().format() === "this.props";
            }).size() > 0;
        }).size() > 0;
    };
    PropTypeTemplate.prototype.propsIdentifierOrNull = function (expression) {
        if (expression.object().format() === "this.props") {
            return expression.property();
        }
        return null;
    };
    PropTypeTemplate.prototype.apply = function (root) {
        root.findChildrenOfType(js_transformabit_1.ReactClassComponent).forEach(function (component) {
            var props = new Array();
            component.findChildrenOfType(js_transformabit_1.MemberExpression).forEach(function (memberExpression) {
                if (memberExpression.object().format() === "this.props") {
                    props.push(js_transformabit_1.JsCode.createElement(js_transformabit_1.Property, {key: memberExpression.property().name, kind: 'init'}, 
                        js_transformabit_1.JsCode.createElement(js_transformabit_1.MemberExpression, {object: js_transformabit_1.JsCode.createElement(js_transformabit_1.MemberExpression, {object: "React", property: "PropTypes"}), property: "any"})
                    ));
                }
            });
            component.insertAfter(js_transformabit_1.JsCode.createElement(js_transformabit_1.ExpressionStatement, null, 
                js_transformabit_1.JsCode.createElement(js_transformabit_1.AssignmentExpression, {left: js_transformabit_1.JsCode.createElement(js_transformabit_1.MemberExpression, {object: component.id(), property: "propTypes"}), right: js_transformabit_1.JsCode.createElement(js_transformabit_1.ObjectExpression, null, props)})
            ));
        });
        return root;
    };
    return PropTypeTemplate;
}());
exports.PropTypeTemplate = PropTypeTemplate;
