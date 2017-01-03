import {
  JsCode,
  File,
  Transformation,
  TransformationParams
} from 'js-transformabit';
import * as js from 'js-transformabit/dist/JsCode';

export class DemoEditor implements Transformation {
  editModule(file: File, params: TransformationParams): File {
    return file;
  }
}
