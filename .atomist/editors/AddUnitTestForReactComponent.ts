import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

export class AddUnitTestForReactComponent extends JsProjectEditor {
  get description() {
    return 'Creates a minimal unit test for React components.';
  }

  editJs() {
    this.tryEditJsFiles(file => {
      const component = js.JsNode
        .fromModuleCode(file.content())
        .findFirstChildOfType(js.ReactClassComponent);
      const testPath = file.path().replace('.js', '.test.js');
      const hasTestFile = this.project.fileExists(testPath);
      if (component && !hasTestFile) {
        const componentName = component.id().name;
        this.project.addFile(testPath,
`import React from 'react';
import ReactDOM from 'react-dom';
import ${componentName} from './${file.name()}';

it('renders without crashing', () => {
const div = document.createElement('div');
ReactDOM.render(<${componentName} />, div);
});`);
      }
    });
  }
}

const addUnitTestForReactComponent = new AddUnitTestForReactComponent();
