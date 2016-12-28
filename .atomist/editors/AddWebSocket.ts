import { Project } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

// Import in this exact order, or disaster strikes!
import { JsNode } from 'js-transformabit/dist/JsNode';
import * as js from 'js-transformabit/dist/JsCode';

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
    const files = project.files()
      .filter(file => file.path().charAt(0) !== '.')
      .filter(file => file.name().match(/\.js$/) !== null);
    for (const file of files) {
      try {
        const root = JsNode.fromModuleCode(file.content());
        const component = root.findChildrenOfType(js.ClassDeclaration)
          .filter(k => k.id().name === params.component && js.ReactClassComponent.check(k))
          .first();
        let ctor = component.findConstructor();
        if (!ctor) {
          component.createConstructor();
          ctor = component.findConstructor();
        }
        this.addHandlers(ctor);
        this.addConnection(ctor, params);
        file.setContent(root.format());
      } catch (error) {
        // project.println(error.toString());
      }
    }
    return new Result(Status.Success);
  }

  private addHandlers(ctor: js.MethodDefinition) {
    ctor.insertAfter(new js.MethodDefinition().build({key: 'onMessage', kind: 'method' }, []));
    ctor.insertAfter(new js.MethodDefinition().build({key: 'onOpen', kind: 'method' }, []));
    ctor.insertAfter(new js.MethodDefinition().build({key: 'onError', kind: 'method' }, []));
  }

  private addConnection(ctor: js.MethodDefinition, params: AddWebSocketParams) {
    const body = ctor.body();
    if (body.check(js.BlockStatement)) {
      body.appendStatement(
        new js.ExpressionStatement().build({}, [
          new js.AssignmentExpression().build({}, [
            new js.MemberExpression().build({object: 'this', property: 'connection'}, []),
            new js.NewExpression().build({callee: 'WebSocket'}, [
              new js.Literal().build({value: 'wss://' + params.address}, [])
            ])
          ])
        ])
      );
    }
  }
}

const editor = new AddWebSocket();
