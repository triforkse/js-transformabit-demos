import {
  File,
  Project,
  ProjectEditor,
  Result,
  Status,
  Parameter
} from './Rug';

export abstract class JsProjectEditor implements ProjectEditor {
  get tags() {
    return ['react'];
  }

  get name() {
    return this.constructor['name'];
  }

  get description() {
    return this.name;
  }

  get parameters(): Parameter[] {
    return [];
  }

  private project_: Project;
  get project() {
    return this.project_;
  }

  private params_: { [key: string]: any };
  get params() {
    return this.params;
  }

  edit(project: Project, params?: {}): Result {
    params = params || {};
    this.project_ = project;
    this.params_ = params;
    return this.editJS() || new Result(Status.Success);
  }

  abstract editJS(): void | Result;

  isHidden(file: File) {
    const filePath = file.path();
    return (filePath[0] !== '.' && filePath.indexOf('node_modules') !== 0);
  }

  hasExtension(file: File, extension: string) {
    const fileName = file.name();
    return fileName.lastIndexOf(extension) === fileName.length - extension.length;
  }

  isJsFile(file: File) {
    return this.hasExtension(file, '.js');
  }

  tryForFiles(filter: (file: File) => boolean, callback: (file: File) => void) {
    this.project_
      .files()
      .filter(this.isHidden)
      .filter(filter)
      .forEach(file => {
        try {
          callback(file);
        } catch (error) {
          this.project_.println(`Failed to apply editor ${this.name} on ${file.path()}: ${error.stack}`);
        }
      });
  }
}
