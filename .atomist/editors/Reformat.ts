import * as js from 'js-transformabit';
import * as prettier from 'prettier';
import { JsProjectEditor } from '../JsProjectEditor';

const defaults = {
  printWidth: 100,
  tabWidth: 2,
  useFlowParser: false,
  singleQuote: true,
  trailingComma: true,
  bracketSpacing: true
};

export class Reformat extends JsProjectEditor {
  editJs() {
    this.tryEditFiles(file => this.isJsFile(file), file => {
      file.setContent(prettier.format(file.content(), defaults));
    });
  }
}

const reformatEditor = new Reformat();
