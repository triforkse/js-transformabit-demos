import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

export class ConvertToReactComponent extends JsProjectEditor {
  get description() {
    return 'Converts React.createClass components to React ES6 class components.';
  }

  editJs() {
    this.tryEditReactComponents(component => {
      console.log(component);
      if (js.ReactClassComponent.check(component)) {
        component = component.convert(js.ReactClassComponent);
        return component.convertToReactComponent();
      }
    });
  }
}

const convertToReactComponent = new ConvertToReactComponent();
