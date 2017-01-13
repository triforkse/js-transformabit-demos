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

  editJs() {
    this.tryEditReactComponentsOfType(js.ReactComponent, this.editComponent);
    this.tryEditReactComponentsOfType(js.ReactClassComponent, this.editComponent);
  }

  editComponent(component: js.StatefulReactComponent) {
    if (component.name === this.params['component']) {
      const ctor = component.findOrCreate(component.findConstructor, component.createConstructor);
      // Add handlers
      ['onOpen', 'onMessage', 'onError'].forEach(s => {
        if (!component.findMethod(s)) {
          component.addMethod(<js.MethodDefinition key={s} /> as js.MethodDefinition);
        }
      });
      // Add connection
      const body = ctor.body();
      if (body instanceof js.BlockStatement) {
        body.append(this.connectionInitStatement());
        ['open', 'message', 'error'].forEach(s => body.append(this.eventConnection(s)));
      }
      return component;
    }
  }

  private connectionInitStatement(): js.ExpressionStatement {
    return (
      <js.ExpressionStatement>
        <js.AssignmentExpression>
          <js.MemberExpression object='this' property='connection' />
          <js.NewExpression callee='WebSocket'>
            <js.Literal value={'wss://' + this.params['address']} />
          </js.NewExpression>
        </js.AssignmentExpression>
      </js.ExpressionStatement> as js.ExpressionStatement
    );
  }

  private eventConnection(event: string) {
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

  private capitalizeFirstLetter(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}

const addWebSocketEditor = new AddWebSocket();
