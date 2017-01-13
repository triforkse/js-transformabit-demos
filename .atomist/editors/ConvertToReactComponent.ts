import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

export class ConvertToReactComponent extends JsProjectEditor {
  get description() {
    return 'Converts ES6 class components to React.createClass components.';
  }

  editJs() {
    this.tryEditReactComponentsOfType(js.ReactClassComponent, component => {
      return component.convertToReactComponent();
    });
  }
}

const convertToReactComponent = new ConvertToReactComponent();
