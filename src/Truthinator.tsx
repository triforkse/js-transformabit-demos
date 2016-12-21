import {
  GenericJsNode,
  JsNodeList,
  Project,
  Transformation,
  JsCode,
  BinaryExpression,
  BinaryOperator
} from 'js-transformabit';

export class Truthinator implements Transformation {

  configure(args: any[]): void {

  }

  check(root: GenericJsNode, project: Project): boolean {
    return root.findChildrenOfType(BinaryExpression).size() > 0;
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root.findChildrenOfType(BinaryExpression).forEach(binaryExpression => {
      if (this.isDangerousOperator(binaryExpression.node.operator)) {
        binaryExpression.node.operator = this.asSafeOperator(binaryExpression.node.operator) as BinaryOperator;
      }
    })
    return root;
  }

  private isDangerousOperator(operator: string): boolean {
    return (operator === "==" || operator === "!=");
  }

  private asSafeOperator(operator: string): string {
    switch (operator) {
      case "==" : return "===";
      case "!=" : return "!==";
      default: return operator;
    }
  }


}
