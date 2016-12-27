import { Project, File, Yml } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';
import {
  JsNode,
  GenericJsNode
} from 'js-transformabit/dist/JsNode';
import {
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
} from 'js-transformabit/dist/JsCode';

type AddWebSocketParams = {
  component: string;
  address: string;
}

class AddWebSocket implements ProjectEditor {
  tags = ['websocket', 'react'];
  name = 'AddWebSocket';
  description = 'Adds a websocket to a React component';
  parameters: Parameter[] = [
    {
      name: 'component',
      required: true,
      description: 'component name',
      displayName: 'component name',
      validInput: 'name of a component',
      pattern: '^.+$',
      minLength: 1,
      maxLength: 20
    },
    {
      name: 'address',
      required: true,
      description: 'address to connect to',
      displayName: 'address',
      validInput: 'ip address',
      pattern: '^.+$',
      minLength: 1,
      maxLength: 20
    }
  ];

  edit(project: Project, params: AddWebSocketParams): Result {
    const file = project.findFile('dummy.js');
    const root = JsNode.fromModuleCode(file.content());
    const component = root.findChildrenOfType(ClassDeclaration, null, true)
      .filter(k => k.id().name === params.component && ReactClassComponent.check(k))
      .first();
    let ctor = component.findConstructor();
    if (!ctor) {
      component.createConstructor();
      ctor = component.findConstructor();
    }
    this.addHandlers(ctor);
    this.addConnection(ctor, params);
    file.setContent(root.format());
    return new Result(Status.Success, 'Hooray!');
  }

  private addHandlers(ctor: MethodDefinition) {
    ctor.insertAfter(new MethodDefinition().build({key: 'onMessage', kind: 'method' }, []));
    ctor.insertAfter(new MethodDefinition().build({key: 'onOpen', kind: 'method' }, []));
    ctor.insertAfter(new MethodDefinition().build({key: 'onError', kind: 'method' }, []));
  }

  private addConnection(ctor: MethodDefinition, params: AddWebSocketParams) {
    const body = ctor.body();
    if (body.check(BlockStatement)) {
      body.appendStatement(
        new ExpressionStatement().build({}, [
          new AssignmentExpression().build({}, [
            new MemberExpression().build({object: 'this', property: 'connection'}, []),
            new NewExpression().build({callee: 'WebSocket'}, [
              new Literal().build({value: 'wss://' + params.address}, [])
            ])
          ])
        ])
      );
    }
  }
}

let editor = new AddWebSocket();
