import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { File } from 'js-transformabit/dist/JsCode';

export interface EditorParams {
  [param: string]: string;
}

export interface ReactEditor extends ProjectEditor {
  editNode(file: File, params: EditorParams): File;
}
