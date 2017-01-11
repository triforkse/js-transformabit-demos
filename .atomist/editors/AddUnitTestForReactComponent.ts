import { Project, File } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

import * as js from 'js-transformabit/dist/JsCode';
import { JsNode, GenericJsNode } from 'js-transformabit/dist/JsNode';

import { ReactContext } from '../ReactContext';

export class AddUnitTestForReactComponent implements ProjectEditor {
  tags = ['react'];
  name = 'AddUnitTestForReactComponent';
  description = 'Creates a minimal unit test for React components.';
  parameters: Parameter[] = [];
  project: Project;

  edit(project: Project, params: {}): Result {
    this.project = project;
    let rc = new ReactContext(project);
    rc.jsFiles().forEach(file => {
      try {
        const component = JsNode
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
      } catch (error) {
        this.project.println(error.toString());
      }
    });
    return new Result(Status.Success);
  }
}

const addUnitTestForReactComponent = new AddUnitTestForReactComponent();
