import { Project, File } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

// Import in this exact order, or disaster strikes!
import { JsNode, GenericJsNode } from 'js-transformabit/dist/JsNode';
import * as js from 'js-transformabit/dist/JsCode';

import {ReactContext} from '../ReactContext';

class Truthinator implements ProjectEditor {
    tags = ['truthy', 'boolean'];
    name = 'Truthinator';
    description = 'Switches != to !== and == to ===';
    parameters: Parameter[] = []

    edit(project: Project, params: Parameter[]): Result {
      const rc = new ReactContext(project);
      rc.jsFiles().forEach(jsFile => {
        this.exec(jsFile);
      });

    return new Result(Status.Success);
    }

    private exec(jsFile: File) {
      const root = JsNode.fromModuleCode(jsFile.content())
      root.findChildrenOfType(js.BinaryExpression).forEach(binaryExpression => {
        if (this.isDangerousOperator(binaryExpression.operator)) {
          binaryExpression.operator = this.asSafeOperator(binaryExpression.operator);
        }
      });
      jsFile.setContent(root.format());
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
