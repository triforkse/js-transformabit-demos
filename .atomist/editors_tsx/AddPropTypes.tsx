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
              // Register the property name, even if the type can't be inferred
              props[property.name] = null;
            }
            const type = js.inferPropType(component, property.name);
            if (type) {
              props[property.name] = type;
            }
          }
        }
      });
      const propNode = Object.keys(props).map(name =>
        <js.Property key={name} kind='init'>
          <js.MemberExpression
            object={<js.MemberExpression
              object="React"
              property="PropTypes" /> as js.MemberExpression}
            property={props[name] || 'any'}
            />
        </js.Property> as js.Property
      );
      component.insertAfter(
        <js.ExpressionStatement>
          <js.AssignmentExpression
            left={<js.MemberExpression
              object={<js.Identifier name={component.name} /> as js.Identifier}
              property="propTypes" /> as js.MemberExpression}
            right={
              <js.ObjectExpression>
                {propNode}
              </js.ObjectExpression> as js.ObjectExpression
            }
            />
        </js.ExpressionStatement>
      );
      return component;
    });
  }
}
