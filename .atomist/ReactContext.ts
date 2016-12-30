import { Project, File } from '@atomist/rug/model/Core';


export class ReactContext {

  private project: Project;

  constructor(proj: Project) {
    this.project = proj;
  }

  jsxFiles(): File[] {
    return this.projectFiles("jsx");
  }

  jsFiles(): File[] {
    return this.projectFiles("js");
  }

  private projectFiles(ext: string): File[] {
    return this.project.files().filter(file => this.hasExtension(file.filename(), ext) && this.notOobDir(file));
  }

  private notOobDir(file: File): boolean {
    if (file.path().indexOf(".atomist/") === 0) {
      return false;
    }
    if (file.path().indexOf(".git") === 0) {
      return false;
    }
    if (file.path().indexOf("node_modules") === 0) {
      return false;
    }
    return true;
  }

  private hasExtension(filename: string, ext: string): boolean {
    let extension = "." + ext;
    return filename.lastIndexOf(extension) === filename.length - extension.length;
  }
}
