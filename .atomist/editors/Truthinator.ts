import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

export class Truthinator extends JsProjectEditor {
  get description() {
    return 'Switches != to !== and == to ===';
  }

  editJs() {
    this.tryEditFiles(file => this.isJsFile(file), file => {
      const root = js.JsNode.fromModuleCode(file.content());
      root.findChildrenOfType(js.BinaryExpression).forEach(binaryExpression => {
        if (this.isDangerousOperator(binaryExpression.operator)) {
          binaryExpression.operator = this.asSafeOperator(binaryExpression.operator);
        }
      });
      file.setContent(root.format());
    });
  }

  private isDangerousOperator(operator: string): boolean {
    return (operator === "==" || operator === "!=");
  }

  private asSafeOperator(operator: js.BinaryOperator): js.BinaryOperator {
    switch (operator) {
      case "==" : return "===";
      case "!=" : return "!==";
      default: return operator;
    }
  }
}

const truthinatorEditor = new Truthinator();
