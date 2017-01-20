import { Project } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status } from '@atomist/rug/operations/RugOperation';

import { JsNode } from 'js-transformabit/dist/JsNode';

let editor: ProjectEditor = {
  tags: ['test'],
  name: 'Test',
  description: 'Test',
  parameters: [],
  edit(project: Project) {
    project.println(JsNode.fromModuleCode('let foo = 42;').format());
    return new Result(Status.Success);
  }
};
