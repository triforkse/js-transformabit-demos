import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

export class ConvertToReactComponent extends JsProjectEditor {
  get description() {
    return 'Converts React.createClass components to React ES6 class components.';
  }

  editJs() {
    this.tryEditReactComponents(component => {
      return component.convertToReactComponent();
    }, js.ReactClassComponent);
  }
}

const convertToReactComponent = new ConvertToReactComponent();
