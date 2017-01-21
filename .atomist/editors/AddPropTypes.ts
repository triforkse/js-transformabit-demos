import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';
const JsCode = js.JsCode;
export class AddPropTypes extends JsProjectEditor {
    get description() {
        return 'Adds a PropTypes to a React component';
    }
    editJs() {
        this.tryEditReactComponents(component => {
            let props = {};
            component.findChildrenOfType(js.MemberExpression).forEach(memberExpression => {
                const property = memberExpression.property();
                if (property instanceof js.Identifier) {
                    if (memberExpression.object().format() === 'this.props') {
                        if (props[property.name] === undefined) {
                            props[property.name] = null;
                        }
                        const type = js.inferPropType(component, property.name);
                        if (type) {
                            props[property.name] = type;
                        }
                    }
                }
            });
            const propNode = Object.keys(props).map(name => JsCode.createElement(js.Property, { key: name, kind: 'init' },
                JsCode.createElement(js.MemberExpression, { object: JsCode.createElement(js.MemberExpression, { object: "React", property: "PropTypes" }), property: props[name] || 'any' })));
            component.insertAfter(JsCode.createElement(js.ExpressionStatement, null,
                JsCode.createElement(js.AssignmentExpression, { left: JsCode.createElement(js.MemberExpression, { object: JsCode.createElement(js.Identifier, { name: component.name }), property: "propTypes" }), right: JsCode.createElement(js.ObjectExpression, null, propNode) })));
            return component;
        });
    }
}
const addPropTypes = new AddPropTypes();
