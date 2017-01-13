import * as js from 'js-transformabit';
import { JsProjectEditor } from '../JsProjectEditor';

export class AddUnitTestForReactComponent extends JsProjectEditor {
  get description() {
    return 'Creates a minimal unit test for React components.';
  }

  editJs() {
    this.tryEditJsFiles(file => {
      const node = js.JsNode.fromModuleCode(file.content());
      const component = node.findFirstChildOfType(js.ReactClassComponent) ||
        node.findFirstChildOfType(js.ReactComponent);
      const testPath = file.path().replace('.js', '.test.js');
      const hasTestFile = this.project.fileExists(testPath);
      if (component && !hasTestFile) {
        this.project.addFile(testPath,
`import React from 'react';
import ReactDOM from 'react-dom';
import ${component.name} from './${file.name()}';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<${component.name} />, div);
});`);
      }
    });
  }
}

const addUnitTestForReactComponent = new AddUnitTestForReactComponent();
