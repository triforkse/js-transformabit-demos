import {
  GenericJsNode,
  JsNodeList,
  Transformation,
  JsCode,
  BinaryExpression,
  BinaryOperator
} from 'js-transformabit';

export class Truthinator implements Transformation {

  configure(args: any[]): void {
  }

  check(root: GenericJsNode): boolean {
    return root.findChildrenOfType(BinaryExpression).size() > 0;
  }

  apply(root: GenericJsNode): GenericJsNode {
    root.findChildrenOfType(BinaryExpression).forEach(binaryExpression => {
      if (this.isDangerousOperator(binaryExpression.operator)) {
        binaryExpression.operator = this.asSafeOperator(binaryExpression.operator);
      }
    })
    return root;
  }

  private isDangerousOperator(operator: string): boolean {
    return (operator === "==" || operator === "!=");
  }

  private asSafeOperator(operator: BinaryOperator): BinaryOperator {
    switch (operator) {
      case "==" : return "===";
      case "!=" : return "!==";
      default: return operator;
    }
  }
}
