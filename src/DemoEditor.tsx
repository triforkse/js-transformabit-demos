import {
  GenericJsNode,
  Transformation,
  JsCode
} from 'js-transformabit';
import * as js from 'js-transformabit/dist/JsCode';

export class DemoEditor implements Transformation {

  private propsIdentifierOrNull(expression: js.MemberExpression): js.Identifier {
    if (expression.object().format() === "this.props") {
      return expression.property() as js.Identifier;
    }
    return null;
  }

  private inferType(root: GenericJsNode, identifier: js.Identifier) {
    let memberExpressions = root
      .findChildrenOfType(js.MemberExpression)
      .map(node => node) as js.MemberExpression[];
    for (let memberExpression of memberExpressions) {
      const property = memberExpression.property();
      if (property.check(js.Identifier) && property.name === identifier.name) {
        const parent = memberExpression.ascend();
        if (parent.check(js.AssignmentExpression)
          && parent.format().indexOf(`this.props.${property.name} =`) === 0) {
          const right = parent.right();
          if (right.check(js.Literal)) {
            return typeof right.value;
          }
        }
      }
    });
    return 'any';
  }

  edit(root: GenericJsNode): GenericJsNode {
    root.findChildrenOfType(js.ReactClassComponent).forEach(component => {
      let props = {};
      component.findChildrenOfType(js.MemberExpression).forEach(memberExpression => {
        const property = memberExpression.property();
        if (property.check(js.Identifier)) {
          if (memberExpression.object().format() === "this.props") {
            props[property.name] = this.inferType(root, property);
          }
        }
      });
      const propNode = Object.keys(props).map(name =>
        <js.Property key={name} kind='init'>
          <js.MemberExpression
            object={<js.MemberExpression object="React" property="PropTypes" /> as js.MemberExpression}
            property={props[name]}
            />
        </js.Property> as js.Property
      )
      component.insertAfter(
        <js.ExpressionStatement>
          <js.AssignmentExpression
            left={<js.MemberExpression object={component.id()} property="propTypes" /> as js.MemberExpression}
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
