/**
 * These imports are no longer used, but we keep them to demonstrate the problem
 * with using CommonJS in Nashorn. If you actually try and import this file it
 * will fracture all the exported symbols in js-transformabit and fail miserably.
 */

import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { File } from 'js-transformabit/dist/JsCode';

export interface EditorParams {
  [param: string]: string;
}

export interface ReactEditor extends ProjectEditor {
  editNode(file: File, params: EditorParams): File;
}
