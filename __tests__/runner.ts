import * as path from 'path';
import { TransformationTest, TransformationClass } from 'js-transformabit';

const transformations: TransformationClass<any>[] = require('../src/Main');
const testRoot = path.join(__dirname, '../../tests');

describe('Transformations', () => {
  transformations.forEach(t =>
    it(t.name, () => {
      new TransformationTest(t, testRoot).run();
    })
  );
});
