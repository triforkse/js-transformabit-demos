import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';
const JsCode = js.JsCode;
;
export class ExpressRest extends JsProjectEditor {
    get parameters() {
        return [
            {
                name: 'uri',
                required: true,
                description: 'URI',
                displayName: 'URI',
                validInput: 'URI',
                pattern: '^.+$'
            }
        ];
    }
    editJs() {
        this.tryEditJsFiles(file => {
            let root = js.JsNode.fromModuleCode(file.content());
            const expressId = this.getExpressIdentifier(root);
            const listenFunc = this.getListenInvoke(root, expressId);
            listenFunc.insertBefore(JsCode.createElement(js.ExpressionStatement, null,
                JsCode.createElement(js.CallExpression, { callee: expressId.name + ".get" },
                    JsCode.createElement(js.Literal, { value: this.params['uri'] }),
                    JsCode.createElement(js.FunctionExpression, null,
                        JsCode.createElement(js.Identifier, { name: "req" }),
                        JsCode.createElement(js.Identifier, { name: "res" }),
                        JsCode.createElement(js.BlockStatement, null)))));
            file.setContent(root.format());
        });
    }
    getCurrentListen(root, expressId) {
        const listens = root.findChildrenOfType(js.CallExpression).filter(ce => {
            return (ce.callee().format().indexOf(expressId.name + ".listen") === 0);
        });
        if (listens.size() > 0) {
            return listens.at(0).findParentOfType(js.ExpressionStatement);
        }
        return null;
    }
    getListenInvoke(root, expressId) {
        const currentListen = this.getCurrentListen(root, expressId);
        if (currentListen !== null) {
            return currentListen;
        }
        const expressListen = (JsCode.createElement(js.MemberExpression, { object: expressId, property: "listen" }));
        const listen = JsCode.createElement(js.ExpressionStatement, null,
            JsCode.createElement(js.CallExpression, { callee: expressListen },
                JsCode.createElement(js.Literal, { value: 8080 })));
        root.findFirstChildOfType(js.Program).append(listen);
        return this.getCurrentListen(root, expressId);
    }
    getExpressIdentifier(root) {
        const importExpressId = this.getExistingImportExpressDeclaration(root);
        if (importExpressId === null) {
            return this.addExpressImport(root);
        }
        if (importExpressId.init) {
            return importExpressId.id;
        }
        const expressInit = this.getLeftIdentifierForCallExpression(root, importExpressId.id.name, args => true);
        if (expressInit !== null) {
            return expressInit.id;
        }
        importExpressId.declaration.replace(this.importAndInitExpressNode());
        return new js.Identifier().build({ name: "express" }, []);
    }
    getExistingImportExpressDeclaration(root) {
        return this.getLeftIdentifierForCallExpression(root, "require", args => {
            if (args.length !== 1) {
                return false;
            }
            const arg = args[0];
            if (arg instanceof js.Literal) {
                return arg.value === "express";
            }
        });
    }
    getLeftIdentifierForCallExpression(root, calleeName, argValidator) {
        const varDecs = root.findChildrenOfType(js.VariableDeclarator).toList();
        for (const varDec of varDecs) {
            let init = varDec.init();
            if (init instanceof js.CallExpression) {
                let callee = init.callee();
                if (callee instanceof js.Identifier) {
                    if (callee.name !== calleeName) {
                        continue;
                    }
                    const args = init.children().toList().slice(1).map(node => node);
                    if (argValidator(args)) {
                        return { declaration: varDec.findClosestParentOfType(js.VariableDeclaration), id: varDec.id(), init: false };
                    }
                }
                else if (callee instanceof js.CallExpression) {
                    let calleeCallee = callee.callee();
                    if (calleeCallee instanceof js.Identifier) {
                        if (calleeCallee.name !== calleeName) {
                            continue;
                        }
                        const args = callee.children().toList().slice(1).map(node => node);
                        if (argValidator(args)) {
                            return { declaration: varDec.findClosestParentOfType(js.VariableDeclaration), id: varDec.id(), init: true };
                        }
                    }
                }
                else {
                    continue;
                }
            }
        }
        ;
        return null;
    }
    importAndInitExpressNode() {
        const require = (JsCode.createElement(js.CallExpression, { callee: 'require' },
            JsCode.createElement(js.Literal, { value: "express" })));
        const varDec = (JsCode.createElement(js.VariableDeclaration, { kind: 'var' },
            JsCode.createElement(js.VariableDeclarator, { name: "express" },
                JsCode.createElement(js.CallExpression, { callee: require }))));
        return varDec;
    }
    addExpressImport(root) {
        const requires = this.getRequires(root);
        if (requires.length === 0) {
            if (root.children().first().children().size() === 0) {
                root.findFirstChildOfType(js.Program).replace(JsCode.createElement(js.Program, null, this.importAndInitExpressNode()));
            }
        }
        else {
            requires[0].insertBefore(this.importAndInitExpressNode());
        }
        return new js.Identifier().build({ name: "express" }, []);
    }
    getRequires(root) {
        return root.findChildrenOfType(js.VariableDeclarator).filter(varDec => {
            let init = varDec.init();
            if (init instanceof js.CallExpression) {
                let callee = init.callee();
                if (callee instanceof js.Identifier) {
                    return callee.name === "require";
                }
            }
            return false;
        }).toList();
    }
}
