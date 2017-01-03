import { Result, Status } from '@atomist/rug/operations/RugOperation';
import * as js from 'js-transformabit/dist/JsCode';
import { JsNode } from 'js-transformabit/dist/JsNode';
import { ReactContext } from '../ReactContext';
const JsCode = js.JsCode;
;
export class AddWebSocket {
    tags:any;name:any;description:any;parameters:any;project:any; constructor() {
        this.tags = ['websocket', 'react'];
        this.name = 'AddWebSocket';
        this.description = 'Adds a websocket to a React component';
        this.parameters = [
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
    edit(project, params) {
        this.project = project;
        let rc = new ReactContext(project);
        rc.jsFiles().forEach(file => this.exec(file, params));
        return new Result(Status.Success);
    }
    editModule(file, params) {
        const component = file
            .findFirstChildOfType(js.ReactClassComponent, node => node.id().name === params.component);
        if (component !== undefined) {
            let ctor = component.findConstructor();
            if (!ctor) {
                component.createConstructor();
                ctor = component.findConstructor();
            }
            this.addHandlers(ctor);
            this.addConnection(ctor, params);
        }
        return file;
    }
    exec(file, params) {
        try {
            let root = JsNode.fromModuleCode(file.content());
            root = this.editModule(root, params);
            if (root) {
                file.setContent(root.format());
            }
        }
        catch (error) {
            this.project.println(error.toString());
        }
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
    addConnection(ctor, params) {
        const body = ctor.body();
        if (body.check(js.BlockStatement)) {
            body.appendStatement(this.connectionInitStatement(params));
            body.appendStatement(this.eventConnection('open'));
            body.appendStatement(this.eventConnection('error'));
            body.appendStatement(this.eventConnection('error'));
        }
    }
    connectionInitStatement(params) {
        return JsCode.createElement(js.ExpressionStatement, null,
            JsCode.createElement(js.AssignmentExpression, null,
                JsCode.createElement(js.MemberExpression, { object: 'this', property: 'connection' }),
                JsCode.createElement(js.NewExpression, { callee: 'WebSocket' },
                    JsCode.createElement(js.Literal, { value: 'wss://' + params.address }))));
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
