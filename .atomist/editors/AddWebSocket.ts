import { Project, File } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

// Import in this exact order, or disaster strikes!
import { JsNode, GenericJsNode } from 'js-transformabit/dist/JsNode';
import * as js from 'js-transformabit/dist/JsCode';

import {ReactContext} from '../ReactContext';

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

  project: Project;
  edit(project: Project, params: AddWebSocketParams): Result {
    this.project = project;
    let rc = new ReactContext(project);
    rc.jsFiles().forEach(file => this.exec(file, params));
    return new Result(Status.Success);
  }

  private exec(file: File, params: AddWebSocketParams) {
      try {
        const root = JsNode.fromModuleCode(file.content());
        const component = root.findChildrenOfType(js.ClassDeclaration)
          .filter(k => {
            this.project.println(k.id().name);
          return k.id().name === params.component && js.ReactClassComponent.check(k);
        }).first();
        if (typeof component === "undefined") {
          return;
        }
        this.project.println(component.constructor().name);
        this.project.println("component.id.name");
        this.project.println("\""+component.id().format() +"\"");
        let ctor = component.findConstructor();
        if (!ctor) {
          component.createConstructor();
          ctor = component.findConstructor();
        }
        this.addHandlers(ctor);
        this.addConnection(ctor, params);
        file.setContent(root.format());
      } catch (error) {
        this.project.println(error.toString());
      }
  }

  private addHandlers(ctor: js.MethodDefinition) {
    if (!this.hasMethod('onOpen', ctor)) {
      ctor.insertAfter(new js.MethodDefinition().build({key: 'onOpen', kind: 'method' }, []));
    }
        if (!this.hasMethod('onMessage', ctor)) {
      ctor.insertAfter(new js.MethodDefinition().build({key: 'onMessage', kind: 'method' }, []));
    }
    if (!this.hasMethod('onError', ctor)) {
      ctor.insertAfter(new js.MethodDefinition().build({key: 'onError', kind: 'method' }, []));
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
      body.appendStatement(this.connectionInitStatement(params));
		  body.appendStatement(this.eventConnection('open'));
	  	body.appendStatement(this.eventConnection('error'));
		  body.appendStatement(this.eventConnection('error'));

    }
  }

  private connectionInitStatement(params: AddWebSocketParams): js.ExpressionStatement {
	  return new js.ExpressionStatement().build({}, [
		 new js.AssignmentExpression().build({}, [
			new js.MemberExpression().build({object: 'this', property: 'connection'}, []),
			new js.NewExpression().build({callee: 'WebSocket'}, [
			  new js.Literal().build({value: 'wss://' + params.address}, [])
			])
		 ])
	 ]);
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
	  let thisConnection = new js.MemberExpression().build({object: 'this', property: 'connection'}, []);
	  let leftHand = new js.MemberExpression().build({object: thisConnection, property: 'on' + this.capitalizeFirstLetter(event)}, []);
	  let rightHand = new js.MemberExpression().build({object: 'this', property: 'on' + this.capitalizeFirstLetter(event)}, []);
	  return new js.ExpressionStatement().build({}, [
		  new js.AssignmentExpression().build({}, [leftHand, rightHand])
	  	]);
  }

	private capitalizeFirstLetter(string: string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

}

const addWebSocketEditor = new AddWebSocket();
