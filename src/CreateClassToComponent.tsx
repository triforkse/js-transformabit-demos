import {
  GenericJsNode,
  Project,
  Transformation,
  JsCode,
  ReactComponent
} from 'js-transformabit';

export class CreateClassToComponent implements Transformation {
  configure(args: any[]): void {
  }

  check(root: GenericJsNode, project: Project): boolean {
    return root.findChildrenOfType(ReactComponent) !== undefined;
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    root
      .findChildrenOfType(ReactComponent)
      .forEach(c => c.convertToReactClassComponent());
    return root;
  }
}
