import * as js from 'js-transformabit';
import { Project, Result, Status } from '../Rug';
import { JsProjectEditor } from '../JsProjectEditor';

export class AddUnitTestForReactComponent extends JsProjectEditor {
  get description() {
    return 'Creates a minimal unit test for React components.';
  }

  edit(project: Project, params: {}): Result {
    super.edit(project, params);
    this.tryForFiles(file => this.isJsFile(file), file => {
      const component = js.JsNode
        .fromModuleCode(file.content())
        .findFirstChildOfType(js.ReactClassComponent);
      const testPath = file.path().replace('.js', '.test.js');
      const hasTestFile = project.fileExists(testPath);
      if (component && !hasTestFile) {
        const componentName = component.id().name;
        project.addFile(testPath,
`import React from 'react';
import ReactDOM from 'react-dom';
import ${componentName} from './${file.name()}';

it('renders without crashing', () => {
const div = document.createElement('div');
ReactDOM.render(<${componentName} />, div);
});`);
      }
    });
    return new Result(Status.Success);
  }
}

const addUnitTestForReactComponent = new AddUnitTestForReactComponent();
