import { Project } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';
import { JsNode } from 'js-transformabit/dist/JsNode';
import * as x from 'js-transformabit/dist/JsCode';

type AddWebSocketParams = {
  component: string;
  address: string;
};

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
    const component = root.findChildrenOfType(x.ClassDeclaration, null, true)
      .filter(k => k.id().name === params.component && x.ReactClassComponent.check(k))
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

  private addHandlers(ctor: x.MethodDefinition) {
    ctor.insertAfter(new x.MethodDefinition().build({key: 'onMessage', kind: 'method' }, []));
    ctor.insertAfter(new x.MethodDefinition().build({key: 'onOpen', kind: 'method' }, []));
    ctor.insertAfter(new x.MethodDefinition().build({key: 'onError', kind: 'method' }, []));
  }

  private addConnection(ctor: x.MethodDefinition, params: AddWebSocketParams) {
    const body = ctor.body();
    if (body.check(x.BlockStatement)) {
      body.appendStatement(
        new x.ExpressionStatement().build({}, [
          new x.AssignmentExpression().build({}, [
            new x.MemberExpression().build({object: 'this', property: 'connection'}, []),
            new x.NewExpression().build({callee: 'WebSocket'}, [
              new x.Literal().build({value: 'wss://' + params.address}, [])
            ])
          ])
        ])
      );
    }
  }
}

const editor = new AddWebSocket();
