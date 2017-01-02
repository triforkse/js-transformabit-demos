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

  private inferTypeFromNode(right: GenericJsNode) {
    if (right.check(js.ArrayExpression)) {
      return 'array';
    } else if (right.check(js.Literal)) {
      return typeof right.value;
    } else if (right.check(js.ObjectExpression)) {
      return 'object';
    } else if (right.check(js.FunctionExpression)) {
      return 'func';
    } else if (right.check(js.NewExpression)) {
      return `instanceOf(${right.findFirstChildOfType(js.Identifier).name})`;
    }
  }

  private inferTypeFromAssignment(assignment: js.AssignmentExpression, identifier: js.Identifier) {
    const assignmentIdentifier = assignment.left()
      .findFirstChildOfType(js.Identifier, node => node.name === identifier.name);
    if (assignmentIdentifier) {
      const isArray = assignment.left()
        .findFirstChildOfType(js.MemberExpression, node => {
          const property = node.property();
          return property.check(js.Literal);
        }, true);
      if (isArray) {
        return 'array';
      } else {
        return this.inferTypeFromNode(assignment.right());
      }
    }
  }

  private inferType(root: GenericJsNode, identifier: js.Identifier) {
    let assignments = root
      .findChildrenOfType(js.AssignmentExpression)
      .filter(node => node.left().findFirstChildOfType(js.MemberExpression) !== undefined)
      .map(node => node) as js.AssignmentExpression[];
    for (let assignment of assignments) {
      const type = this.inferTypeFromAssignment(assignment, identifier);
      if (type) {
        return type;
      }
    }
  }

  edit(root: GenericJsNode): GenericJsNode {
    root.findChildrenOfType(js.ReactClassComponent).forEach(component => {
      let props = {};
      component.findChildrenOfType(js.MemberExpression).forEach(memberExpression => {
        const property = memberExpression.property();
        if (property.check(js.Identifier)) {
          if (memberExpression.object().format() === "this.props") {
            const type = this.inferType(root, property);
            if (type) {
              props[property.name] = type;
            }
          }
        }
      });
      const propNode = Object.keys(props).map(name =>
        <js.Property key={name} kind='init'>
          <js.MemberExpression
            object={<js.MemberExpression object="React" property="PropTypes" /> as js.MemberExpression}
            property={props[name] || 'any'}
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
