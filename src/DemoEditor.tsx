import {
  GenericJsNode,
  Transformation,
  JsCode
} from 'js-transformabit';
import * as js from 'js-transformabit/dist/JsCode';
import { inferPropType } from 'js-transformabit/dist/PropTypes';

export class DemoEditor implements Transformation {

  edit(root: GenericJsNode): GenericJsNode {
    root.findChildrenOfType(js.ReactClassComponent).forEach(component => {
      let props = {};
      component.findChildrenOfType(js.MemberExpression).forEach(memberExpression => {
        const property = memberExpression.property();
        if (property.check(js.Identifier)) {
          if (memberExpression.object().format() === 'this.props') {
            const type = inferPropType(root, property.name);
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
              object={component.id()}
              property="propTypes" /> as js.MemberExpression}
            right={
              <js.ObjectExpression>
                {propNode}
              </js.ObjectExpression> as js.ObjectExpression
            }
            />
        </js.ExpressionStatement>
      );
    });
    return root;
  }
}
