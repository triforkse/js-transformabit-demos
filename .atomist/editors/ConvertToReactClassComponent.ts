import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

export class ConvertToReactClassComponent extends JsProjectEditor {
  get description() {
    return 'Converts React.createClass components to React ES6 class components.';
  }

  editJs() {
    this.tryEditReactComponentsOfType(js.ReactComponent, component => {
      return component.convertToReactClassComponent();
    });
  }
}

const convertToReactClassComponent = new ConvertToReactClassComponent();
