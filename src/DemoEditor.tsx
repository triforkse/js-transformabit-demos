import {
  GenericJsNode,
  Project,
  Transformation,
  JsCode,
  ReactComponent,
  ReactClassComponent
} from 'js-transformabit';

export class DemoEditor implements Transformation {
  constructor() {
  }

  configure(args: any[]): void {
  }

  check(root: GenericJsNode, project: Project): boolean {
    return true;
  }

  // apply(root: GenericJsNode, project: Project): GenericJsNode {
  //   root
  //     .findChildrenOfType(MethodDefinition)
  //     .filter(node => node.methodName() === 'render')
  //     .removeAll();
  //   return root;
  // }

  apply(root: GenericJsNode, project: Project): ReactComponent {
    if (root.check(ReactClassComponent)) {
      return root.convertToReactComponent();
    }
  }
}
