import { Project, File, Yml } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

let editor: ProjectEditor = {
  tags: ['websocket', 'react'],
  name: 'AddWebSocket',
  description: 'Adds a websocket to a React component',
  edit(project: Project, params: {}): Result {
    return new Result(Status.Success, 'Hooray!');
  }
};
