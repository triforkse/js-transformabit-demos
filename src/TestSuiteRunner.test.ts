import * as path from 'path';
import { TestSuiteRunner } from 'js-transformabit';
import { BindWebSocket } from './BindWebSocket';
import { CreateClassToComponent } from './CreateClassToComponent';
import { AddVarToAllDeclarations } from './AddVarToAllDeclarations';
import { PropTypeTemplate } from './PropTypeTemplate'
import { Truthinator } from './Truthinator';
import { RenameVariable } from './RenameVariable';

describe('TestSuiteRunner', () => {
  it('Transformations', () => {
    let runner = new TestSuiteRunner(
      path.join(__dirname, '../tests'),
      path.join(__dirname, '../tests/inputs'),
      [
        BindWebSocket,
        CreateClassToComponent,
        RenameVariable,
        Truthinator,
        PropTypeTemplate,
        AddVarToAllDeclarations
      ]
    );
    runner.run();
  });
});
