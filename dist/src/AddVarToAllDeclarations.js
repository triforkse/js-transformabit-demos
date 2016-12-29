"use strict";
var js_transformabit_1 = require('js-transformabit');
var AddVarToAllDeclarations = (function () {
    function AddVarToAllDeclarations() {
    }
    AddVarToAllDeclarations.prototype.configure = function (args) {
        this.useLet = args[0];
        this.useConst = args[1];
    };
    AddVarToAllDeclarations.prototype.check = function (root) {
        return this.findExpressionStatements(root).size() > 0;
    };
    AddVarToAllDeclarations.prototype.findExpressionStatements = function (root) {
        return root.findChildrenOfType(js_transformabit_1.ExpressionStatement).filter(function (expression) {
            if (expression.children().at(0).check(js_transformabit_1.AssignmentExpression)) {
                var assignment = expression.children().at(0);
                return assignment.operator === "=";
            }
            return false;
        });
    };
    AddVarToAllDeclarations.prototype.apply = function (root) {
        var _this = this;
        root.findChildrenOfType(js_transformabit_1.FunctionDeclaration).forEach(function (functionDeclaration) {
            var statements = _this.findExpressionStatements(functionDeclaration);
            var firstEncounters = statements.filter(function (expression) {
                var assignment = expression.children().at(0);
                return _this.isEarliestEncounter(functionDeclaration, expression);
            });
            _this.replaceAsVariableDelcarations(firstEncounters);
        });
        return root;
    };
    AddVarToAllDeclarations.prototype.isEarliestEncounter = function (root, exp) {
        var name = exp.children().at(0).children().at(0).name;
        var start = exp.sourceLocation.start.line;
        var firstExpression = this.earliestExpressionEncounter(root, name);
        var firstDeclaration = this.earliestDeclarationEncounter(root, name);
        if (firstDeclaration === -1) {
            return start === firstExpression;
        }
        else if (start > firstDeclaration) {
            return false;
        }
        else {
            return start == firstExpression;
        }
    };
    AddVarToAllDeclarations.prototype.earliestExpressionEncounter = function (root, name) {
        var parent = root.findClosestParentOfType(js_transformabit_1.FunctionDeclaration);
        if (parent != null) {
            var parentEarliest = this.earliestExpressionEncounter(parent, name);
            if (parentEarliest !== -1) {
                return parentEarliest;
            }
        }
        var first = null;
        this.findExpressionStatements(root).forEach(function (expression) {
            var left = expression.children().at(0).children().at(0).name;
            if (name === left) {
                if (first === null || first > expression.sourceLocation.start.line) {
                    first = expression.sourceLocation.start.line;
                }
            }
        });
        return first;
    };
    AddVarToAllDeclarations.prototype.earliestDeclarationEncounter = function (root, name) {
        var parent = root.findClosestParentOfType(js_transformabit_1.FunctionDeclaration);
        if (parent != null) {
            var parentEarliest = this.earliestDeclarationEncounter(parent, name);
            if (parentEarliest !== -1) {
                return parentEarliest;
            }
        }
        var decs = root.findChildrenOfType(js_transformabit_1.VariableDeclaration).filter(function (variableDec) {
            var declarators = variableDec.declarations().filter(function (dec) {
                var declarator = dec;
                return declarator.id().name === name;
            });
            return declarators.size() !== 0;
        });
        if (decs.size() === 0) {
            return -1;
        }
        else {
            return decs.first().sourceLocation.start.line;
        }
    };
    AddVarToAllDeclarations.prototype.replaceAsVariableDelcarations = function (expressions) {
        var _this = this;
        expressions.forEach(function (expression) {
            var assignment = expression.children().at(0);
            var left = assignment.children().at(0).name;
            var right = assignment.children().last();
            var variableDeclaration = (js_transformabit_1.JsCode.createElement(js_transformabit_1.VariableDeclaration, {name: left, kind: _this.getKind(expression, left)}, right));
            variableDeclaration.sourceLocation = {
                start: {
                    line: expression.sourceLocation.start.line,
                    column: expression.sourceLocation.start.column
                },
                end: {
                    line: expression.sourceLocation.start.line,
                    column: expression.sourceLocation.start.column + variableDeclaration.format().length
                }
            };
            expression.replace(variableDeclaration);
        });
    };
    AddVarToAllDeclarations.prototype.getKind = function (expression, name) {
        if (this.useConst) {
            var parent_1 = expression.findClosestParentOfType(js_transformabit_1.BlockStatement);
            var assigns = parent_1.findChildrenOfType(js_transformabit_1.AssignmentExpression).filter(function (assignmentExpression) {
                return assignmentExpression.children().at(0).name === name;
            }).size();
            if (assigns === 1) {
                return "const";
            }
        }
        if (this.useLet) {
            return "let";
        }
        return "var";
    };
    return AddVarToAllDeclarations;
}());
exports.AddVarToAllDeclarations = AddVarToAllDeclarations;
