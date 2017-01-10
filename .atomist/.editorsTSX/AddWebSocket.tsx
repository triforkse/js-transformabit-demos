import { Project, File } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

import * as js from 'js-transformabit/dist/JsCode';
import { JsNode, GenericJsNode } from 'js-transformabit/dist/JsNode';
import { Transformation, TransformationParams } from 'js-transformabit/dist/Transformation';

import { ReactContext } from '../ReactContext';

const JsCode = js.JsCode;

// import { EditorParams, ReactEditor } from '../ReactEditor';

interface AddWebSocketParams extends TransformationParams {
  component: string;
  address: string;
};

export class AddWebSocket implements ProjectEditor, Transformation {
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
  project: Project;

  edit(project: Project, params: AddWebSocketParams): Result {
    this.project = project;
    let rc = new ReactContext(project);
    rc.jsFiles().forEach(file => this.editFile(file, params));
    return new Result(Status.Success);
  }

  editModule(file: js.File, params: AddWebSocketParams): js.File {
    const component = file
      .findFirstChildOfType(js.ReactClassComponent, node => node.id().name === params.component);
    if (component !== undefined) {
      let ctor = component.findConstructor();
      if (!ctor) {
        component.createConstructor();
        ctor = component.findConstructor();
      }
      this.addHandlers(ctor);
      this.addConnection(ctor, params);
    }
    return file;
  }

  private editFile(file: File, params: AddWebSocketParams) {
    try {
      let root = JsNode.fromModuleCode(file.content());
      root = this.editModule(root, params);
      if (root) {
        file.setContent(root.format());
      }
    } catch (error) {
      this.project.println(error.toString());
    }
  }

  private addHandlers(ctor: js.MethodDefinition) {
    if (!this.hasMethod('onOpen', ctor)) {
      ctor.insertAfter(new js.MethodDefinition().build({ key: 'onOpen', kind: 'method' }, []));
    }
    if (!this.hasMethod('onMessage', ctor)) {
      ctor.insertAfter(new js.MethodDefinition().build({ key: 'onMessage', kind: 'method' }, []));
    }
    if (!this.hasMethod('onError', ctor)) {
      ctor.insertAfter(new js.MethodDefinition().build({ key: 'onError', kind: 'method' }, []));
    }
  }

  private hasMethod(methodName: string, ctor: GenericJsNode): boolean {
    let root = ctor.findClosestParentOfType(js.ClassDeclaration);
    if (root === null) {
      return false;
    }

    return root.findChildrenOfType(js.MethodDefinition).filter(md => {
      const key = md.key();
      if (key.check(js.Identifier)) {
        return key.name === methodName;
      }
      return false;
    }).size() > 0;
  }

  private addConnection(ctor: js.MethodDefinition, params: AddWebSocketParams) {
    const body = ctor.body();
    if (body.check(js.BlockStatement)) {
      body.append(this.connectionInitStatement(params));
      body.append(this.eventConnection('open'));
      body.append(this.eventConnection('error'));
      body.append(this.eventConnection('error'));
    }
  }

  private connectionInitStatement(params: AddWebSocketParams): js.ExpressionStatement {
    return (
      <js.ExpressionStatement>
        <js.AssignmentExpression>
          <js.MemberExpression object='this' property='connection' />
          <js.NewExpression callee='WebSocket'>
            <js.Literal value={'wss://' + params.address} />
          </js.NewExpression>
        </js.AssignmentExpression>
      </js.ExpressionStatement> as js.ExpressionStatement
    );
  }

  /*
    private hasInit(body: js.BlockStatement, params: AddWebSocketParams): boolean {
      return body.findChildrenOfType(js.AssignmentExpression).filter(exp => {
        const left = exp.left();
        if (left.check(js.MemberExpression)) {
          if (left.object.name !== "this" || left.property.name !== "connection") {
            return false;
          }
        } else {
          return false;
        }
        const right = exp.right();
        if (right.check(js.NewExpression)) {
          this.project.println(right.callee().children().at(0).format());
        } else {
          return false;
        }

        return false;
      }).size() > 0;
    }
  */

  private eventConnection(event: string): js.ExpressionStatement {
    let thisConnection = <js.MemberExpression object='this' property='connection' /> as js.MemberExpression;
    let eventMethod = `on${this.capitalizeFirstLetter(event)}`;
    return (
      <js.ExpressionStatement>
        <js.AssignmentExpression>
          <js.MemberExpression object={thisConnection} property={eventMethod} />
          <js.MemberExpression object='this' property={eventMethod} />
        </js.AssignmentExpression>
      </js.ExpressionStatement> as js.ExpressionStatement
    );
  }

  private capitalizeFirstLetter(string: string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

const addWebSocketEditor = new AddWebSocket();
