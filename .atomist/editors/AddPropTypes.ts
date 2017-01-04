import { Result, Status } from '@atomist/rug/operations/RugOperation';
import * as js from 'js-transformabit/dist/JsCode';
import { JsNode } from 'js-transformabit/dist/JsNode';
import { inferPropType } from 'js-transformabit/dist/PropTypes';
import { ReactContext } from '../ReactContext';
const JsCode = js.JsCode;
;
export class AddPropTypes {
    tags:any;name:any;description:any;parameters:any;project:any; constructor() {
        this.tags = ['proptypes', 'react'];
        this.name = 'AddPropTypes';
        this.description = 'Adds a PropTypes to a React component';
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
        rc.jsFiles().forEach(file => this.editFile(file, params));
        return new Result(Status.Success);
    }
    editFile(file, params) {
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
    editModule(file, params) {
        file.findChildrenOfType(js.ReactClassComponent).forEach(component => {
            let props = {};
            component.findChildrenOfType(js.MemberExpression).forEach(memberExpression => {
                const property = memberExpression.property();
                if (property.check(js.Identifier)) {
                    if (memberExpression.object().format() === 'this.props') {
                        if (props[property.name] === undefined) {
                            props[property.name] = null;
                        }
                        const type = inferPropType(file, property.name);
                        if (type) {
                            props[property.name] = type;
                        }
                    }
                }
            });
            const propNode = Object.keys(props).map(name => JsCode.createElement(js.Property, { key: name, kind: 'init' },
                JsCode.createElement(js.MemberExpression, { object: JsCode.createElement(js.MemberExpression, { object: "React", property: "PropTypes" }), property: props[name] || 'any' })));
            component.insertAfter(JsCode.createElement(js.ExpressionStatement, null,
                JsCode.createElement(js.AssignmentExpression, { left: JsCode.createElement(js.MemberExpression, { object: component.id(), property: "propTypes" }), right: JsCode.createElement(js.ObjectExpression, null, propNode) })));
        });
        return file;
    }
}
