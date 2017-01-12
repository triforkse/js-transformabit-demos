import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

const JsCode = js.JsCode;

interface AddWebSocketParams {
  component: string;
  address: string;
};

export class AddWebSocket extends JsProjectEditor {
  get description() {
    return 'Adds a websocket to a React component';
  }
  get parameters() {
    return [
      {
        name: 'component',
        required: true,
        pattern: '^.+$'
      },
      {
        name: 'address',
        required: true,
        description: 'address to connect to',
        pattern: '^.+$'
      }
    ];
  }

  editJS() {
    this.tryEditReactComponents(component => {
      if (component.name === this.params.component) {
        const ctor = component.findOrCreate(component.findConstructor, component.createConstructor);
        this.addHandlers(ctor);
        this.addConnection(ctor);
        return component;
      }
    });
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

  private hasMethod(methodName: string, ctor: js.GenericJsNode): boolean {
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

  private addConnection(ctor: js.MethodDefinition) {
    const body = ctor.body();
    if (body.check(js.BlockStatement)) {
      body.append(this.connectionInitStatement());
      body.append(this.eventConnection('open'));
      body.append(this.eventConnection('error'));
      body.append(this.eventConnection('error'));
    }
  }

  private connectionInitStatement(): js.ExpressionStatement {
    return (
      <js.ExpressionStatement>
        <js.AssignmentExpression>
          <js.MemberExpression object='this' property='connection' />
          <js.NewExpression callee='WebSocket'>
            <js.Literal value={'wss://' + this.params.address} />
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
