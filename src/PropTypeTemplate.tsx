
import {
  GenericJsNode,
  JsNodeList,
  Project,
  Transformation,
  JsCode,
  ReactClassComponent,
  ThisExpression,
  Identifier,
  MemberExpression,
  ExpressionStatement,
  ObjectExpression,
  AssignmentExpression,
  Property,
  Literal
} from 'js-transformabit';

export class PropTypeTemplate implements Transformation {


  configure(args: any[]): void {

  }

  check(root: GenericJsNode, project: Project): boolean {
    return root.findChildrenOfType(ReactClassComponent).filter(component => {
        return component.findChildrenOfType(MemberExpression).filter(memberExpression => {
           return memberExpression.object().format() === "this.props";
        }).size() > 0;
    }).size() > 0;
  }

  private propsIdentifierOrNull(expression: MemberExpression): Identifier {
    if (expression.object().format() === "this.props") {
        return expression.property() as Identifier;
    }
    return null;
  }


  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root.findChildrenOfType(ReactClassComponent).forEach(component => {
        let props = new Array<Property>();
        component.findChildrenOfType(MemberExpression).forEach(memberExpression => {
           if (memberExpression.object().format() === "this.props") {
               props.push(
                    <Property key={(memberExpression.property() as Identifier).name} kind='init'>
                        <MemberExpression
                            object={<MemberExpression object="React" property="PropTypes"/> as MemberExpression}
                            property="any"
                        />
                    </Property> as Property
                )
           }
        });
        component.insertAfter(
            <ExpressionStatement>
                <AssignmentExpression
                    left={<MemberExpression object={component.id()} property="propTypes"/> as MemberExpression}
                    right={
                        <ObjectExpression>
                            {props}
                        </ObjectExpression> as ObjectExpression
                    }
                />
            </ExpressionStatement>
        );
    });
    return root;
  }

}
