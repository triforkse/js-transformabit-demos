import * as editors from './Editors';
import { VirtualNodeProject } from './NodeProject';

const editorName = process.argv[2];
const showDiff = process.argv.length > 2 && process.argv[3];

console.log(`Running editor ${editorName}`);
const editorClass = editors[editorName];
if (!editorClass) {
  throw new Error(`Found no editor called ${editorName}; ` +
    `valid editors are: ${Object.keys(editors)}`);
}
const editor = new editorClass();

const project = VirtualNodeProject.fromExistingApp('../sample_app_src');
editor.edit(project, {
  component: 'App',
  address: 'localhost'
});
if (showDiff) {
  project.printDiff();
} else {
  project.print();
}
