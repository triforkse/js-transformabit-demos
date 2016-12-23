import {
  GenericJsNode,
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

  check(root: GenericJsNode): boolean {
    return true;
  }

  // apply(root: GenericJsNode): GenericJsNode {
  //   root
  //     .findChildrenOfType(MethodDefinition)
  //     .filter(node => node.methodName() === 'render')
  //     .removeAll();
  //   return root;
  // }

  apply(root: GenericJsNode): ReactComponent {
    if (root.check(ReactClassComponent)) {
      return root.convertToReactComponent();
    }
  }
}
