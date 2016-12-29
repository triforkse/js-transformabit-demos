"use strict";
var js_transformabit_1 = require('js-transformabit');
var BindWebSocket = (function () {
    function BindWebSocket() {
    }
    BindWebSocket.prototype.configure = function (args) {
        this.component = args[0];
        this.address = args[1];
    };
    BindWebSocket.prototype.check = function (root) {
        return this.getMatchingReactComponents(root).size() > 0;
    };
    BindWebSocket.prototype.getMatchingReactComponents = function (root) {
        var _this = this;
        return root.findChildrenOfType(js_transformabit_1.ClassDeclaration, null, true)
            .filter(function (k) { return k.id().name === _this.component && js_transformabit_1.ReactClassComponent.check(k); });
    };
    BindWebSocket.prototype.apply = function (root) {
        var component = this.getMatchingReactComponents(root).first();
        var ctor = component.findConstructor();
        if (!ctor) {
            component.createConstructor();
            ctor = component.findConstructor();
        }
        this.addHandlers(ctor);
        this.addConnection(ctor);
        return root;
    };
    BindWebSocket.prototype.addHandlers = function (ctor) {
        ctor.insertAfter(js_transformabit_1.JsCode.createElement(js_transformabit_1.MethodDefinition, {key: "onMessage", kind: 'method'}));
        ctor.insertAfter(js_transformabit_1.JsCode.createElement(js_transformabit_1.MethodDefinition, {key: "onOpen", kind: 'method'}));
        ctor.insertAfter(js_transformabit_1.JsCode.createElement(js_transformabit_1.MethodDefinition, {key: "onError", kind: 'method'}));
    };
    BindWebSocket.prototype.addConnection = function (ctor) {
        var body = ctor.body();
        if (body.check(js_transformabit_1.BlockStatement)) {
            body.appendStatement(js_transformabit_1.JsCode.createElement(js_transformabit_1.ExpressionStatement, null, 
                js_transformabit_1.JsCode.createElement(js_transformabit_1.AssignmentExpression, null, 
                    js_transformabit_1.JsCode.createElement(js_transformabit_1.MemberExpression, {object: "this", property: "connection"}), 
                    js_transformabit_1.JsCode.createElement(js_transformabit_1.NewExpression, {callee: 'WebSocket'}, 
                        js_transformabit_1.JsCode.createElement(js_transformabit_1.Literal, {value: "wss://" + this.address})
                    ))
            ));
        }
    };
    return BindWebSocket;
}());
exports.BindWebSocket = BindWebSocket;
