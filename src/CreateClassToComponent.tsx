import {
  GenericJsNode,
  Transformation,
  JsCode,
  ReactComponent
} from 'js-transformabit';

export class CreateClassToComponent implements Transformation {
  configure(args: any[]): void {
  }

  check(root: GenericJsNode): boolean {
    return root.findChildrenOfType(ReactComponent) !== undefined;
  }

  apply(root: GenericJsNode): GenericJsNode {
    root
      .findChildrenOfType(ReactComponent)
      .forEach(c => c.convertToReactClassComponent());
    return root;
  }
}
