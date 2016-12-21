import {
  GenericJsNode,
  Project,
  Transformation,
  JsCode,
  MethodDefinition,
  MemberExpression,
  ExpressionStatement,
  AssignmentExpression,
  NewExpression,
  Literal,
  ClassDeclaration,
  BlockStatement,
  ReactClassComponent
} from 'js-transformabit';

export class BindWebSocket implements Transformation {
  component: string;
  address: string;

  configure(args: any[]): void {
    this.component = args[0];
    this.address = args[1];
  }

  check(root: GenericJsNode, project: Project): boolean {
    return this.getMatchingReactComponents(root).size() > 0;
  }

  private getMatchingReactComponents(root: GenericJsNode) {
    return root.findChildrenOfType(ClassDeclaration, null, true)
      .filter(k => k.id().name === this.component && ReactClassComponent.check(k));
  }

  apply(root: GenericJsNode, project: Project): GenericJsNode {
    const component = this.getMatchingReactComponents(root).first();
    let ctor = component.findConstructor();
    if (!ctor) {
      component.createConstructor();
      ctor = component.findConstructor();
    }
    this.addHandlers(ctor);
    this.addConnection(ctor);
    return root;
  }

  private addHandlers(ctor: MethodDefinition) {
    ctor.insertAfter(<MethodDefinition key={"onMessage"} kind='method' />);
    ctor.insertAfter(<MethodDefinition key={"onOpen"} kind='method' />);
    ctor.insertAfter(<MethodDefinition key={"onError"} kind='method' />);
  }

  private addConnection(ctor: MethodDefinition) {
    ctor
      .body<BlockStatement>()
      .appendStatement(
        <ExpressionStatement>
          <AssignmentExpression>
            <MemberExpression object="this" property="connection" />
            <NewExpression callee='WebSocket'>
              <Literal value={"wss://" + this.address} />
            </NewExpression>
          </AssignmentExpression>
        </ExpressionStatement> as ExpressionStatement
      );
  }
}
