import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';
const JsCode = js.JsCode;
;
export class AddWebSocket extends JsProjectEditor {
    get description() {
        return 'Adds a websocket to a React component';
    }
    get parameters() {
        return [
            {
                name: 'component',
                required: true,
                description: 'component name',
                displayName: 'component name',
                validInput: 'name of a component',
                pattern: '^.+$',
                minLength: 1,
                maxLength: 20
            },
            {
                name: 'address',
                required: true,
                description: 'address to connect to',
                displayName: 'address',
                validInput: 'ip address',
                pattern: '^.+$',
                minLength: 1,
                maxLength: 20
            }
        ];
    }
    editJS() {
        this.tryForFiles(file => this.isJsFile(file), file => {
            const root = js.JsNode.fromModuleCode(file.content());
            const component = root.findFirstChildOfType(js.ReactClassComponent, node => node.id().name === this.params.component);
            if (component !== undefined) {
                const ctor = component.findOrCreate(component.findConstructor, component.createConstructor);
                this.addHandlers(ctor);
                this.addConnection(ctor);
                file.setContent(root.format());
            }
        });
    }
    addHandlers(ctor) {
        if (!this.hasMethod('onOpen', ctor)) {
            ctor.insertAfter(new js.MethodDefinition().build({ key: 'onOpen', kind: 'method' }, []));
        }
        if (!this.hasMethod('onMessage', ctor)) {
            ctor.insertAfter(new js.MethodDefinition().build({ key: 'onMessage', kind: 'method' }, []));
        }
        if (!this.hasMethod('onError', ctor)) {
            ctor.insertAfter(new js.MethodDefinition().build({ key: 'onError', kind: 'method' }, []));
        }
    }
    hasMethod(methodName, ctor) {
        let root = ctor.findClosestParentOfType(js.ClassDeclaration);
        if (root === null) {
            return false;
        }
        return root.findChildrenOfType(js.MethodDefinition).filter(md => {
            const key = md.key();
            if (key.check(js.Identifier)) {
                return key.name === methodName;
            }
            return false;
        }).size() > 0;
    }
    addConnection(ctor) {
        const body = ctor.body();
        if (body.check(js.BlockStatement)) {
            body.append(this.connectionInitStatement());
            body.append(this.eventConnection('open'));
            body.append(this.eventConnection('error'));
            body.append(this.eventConnection('error'));
        }
    }
    connectionInitStatement() {
        return JsCode.createElement(js.ExpressionStatement, null,
            JsCode.createElement(js.AssignmentExpression, null,
                JsCode.createElement(js.MemberExpression, { object: 'this', property: 'connection' }),
                JsCode.createElement(js.NewExpression, { callee: 'WebSocket' },
                    JsCode.createElement(js.Literal, { value: 'wss://' + this.params.address }))));
    }
    eventConnection(event) {
        let thisConnection = JsCode.createElement(js.MemberExpression, { object: 'this', property: 'connection' });
        let eventMethod = `on${this.capitalizeFirstLetter(event)}`;
        return JsCode.createElement(js.ExpressionStatement, null,
            JsCode.createElement(js.AssignmentExpression, null,
                JsCode.createElement(js.MemberExpression, { object: thisConnection, property: eventMethod }),
                JsCode.createElement(js.MemberExpression, { object: 'this', property: eventMethod })));
    }
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
}
const addWebSocketEditor = new AddWebSocket();
