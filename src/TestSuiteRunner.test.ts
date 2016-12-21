import * as path from 'path';
import { TestSuiteRunner } from 'js-transformabit';
import { BindWebSocket } from './BindWebSocket';
import { CreateClassToComponent } from './CreateClassToComponent';
import { RenameVariable } from './RenameVariable';

describe('TestSuiteRunner', () => {
  it('Transformations', () => {
    let runner = new TestSuiteRunner(
      path.join(__dirname, '../tests'),
      path.join(__dirname, '../tests/inputs'),
      [
        BindWebSocket,
        CreateClassToComponent,
        RenameVariable
      ]
    );
    runner.run();
  });
});
