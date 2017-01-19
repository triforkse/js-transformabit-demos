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
                pattern: '^.+$'
            },
            {
                name: 'address',
                required: true,
                description: 'address to connect to',
                pattern: '^.+$'
            }
        ];
    }
    editJs() {
        this.tryEditReactComponentsOfType(js.ReactComponent, this.editComponent);
        this.tryEditReactComponentsOfType(js.ReactClassComponent, this.editComponent);
    }
    editComponent(component) {
        if (component.name === this.params['component']) {
            const ctor = component.findOrCreate(component.findConstructor, component.createConstructor);
            ['onOpen', 'onMessage', 'onError'].forEach(s => {
                if (!component.findMethod(s)) {
                    ctor.insertAfter(new js.MethodDefinition().build({ key: s, kind: 'method' }, []));
                }
            });
            const body = ctor.body();
            if (body instanceof js.BlockStatement) {
                body.append(<any>this.connectionInitStatement());
                ['open', 'message', 'error'].forEach(s => body.append(<any>this.eventConnection(s)));
            }
            return component;
        }
    }
    connectionInitStatement() {
        return JsCode.createElement(js.ExpressionStatement, null,
            JsCode.createElement(js.AssignmentExpression, null,
                JsCode.createElement(js.MemberExpression, { object: 'this', property: 'connection' }),
                JsCode.createElement(js.NewExpression, { callee: 'WebSocket' },
                    JsCode.createElement(js.Literal, { value: 'wss://' + this.params['address'] }))));
    }
    eventConnection(event) {
        let thisConnection = JsCode.createElement(js.MemberExpression, { object: 'this', property: 'connection' });
        let eventMethod = `on${this.capitalizeFirstLetter(event)}`;
        return JsCode.createElement(js.ExpressionStatement, null,
            JsCode.createElement(js.AssignmentExpression, null,
                JsCode.createElement(js.MemberExpression, { object: thisConnection, property: eventMethod }),
                JsCode.createElement(js.MemberExpression, { object: 'this', property: eventMethod })));
    }
    capitalizeFirstLetter(s) {
        return s.charAt(0).toUpperCase() + s.slice(1);
    }
}
const addWebSocketEditor = new AddWebSocket();
