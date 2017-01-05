import * as fs from 'fs';
import * as path from 'path';
import { Project, File } from '@atomist/rug/model/Core';
import { ProjectContext } from '@atomist/rug/operations/ProjectEditor';

import 'colors';
const jsdiff = require('diff');

class NodeProjectBase implements Project {
  nodeName(): String {
    return '';
  }
  nodeType(): String {
    return '';
  }
  value(): String {
    return '';
  }
  update(newValue: String) { }
  addDirectory(name: string, parentPath: string): void { }
  addDirectoryAndIntermediates(directoryPath: string): void { }
  addFile(path: string, content: string): void { }
  backingArchiveProject(): Project {
    return;
  }
  context(): ProjectContext {
    return;
  }
  copyEditorBackingFileOrFail(sourcePath: string, destinationPath?: string): void { }
  copyEditorBackingFilesOrFail(sourcePath: string, destinationPath: string): void { }
  copyEditorBackingFilesPreservingPath(sourcePath: string): void { }
  copyEditorBackingFilesWithNewRelativePath(sourcePath: string, destinationPath: string): void { }
  copyFile(sourcePath: string, destinationPath: string): void { }
  copyFileOrFail(sourcePath: string, destinationPath: string): void { }
  countFilesInDirectory(path: string): number {
    return 0;
  }
  deleteDirectory(path: string): void { }
  deleteFile(path: string): void { }
  directoryExists(path: string): boolean {
    return false;
  }
  editWith(editorName: string, params: any): void { }
  fail(msg: string): void { }
  fileContains(path: string, content: string): boolean {
    return false;
  }
  fileCount(): number {
    return 0;
  }
  fileExists(path: string): boolean {
    return false;
  }
  fileHasContent(path: string, content: string): boolean {
    return false;
  }
  files(): File[] {
    return [];
  }
  findFile(path: string): File {
    return;
  }
  merge(template: string, path: string, parameters: any): void { }
  mergeTemplates(templatesPath: string, outputPath: string, ic: any): void { }
  moveUnder(path: string): void { }
  name(): string {
    return '';
  }
  println(msg: string): void {
    console.log(msg);
  }
  projects(): Project[] {
    return [];
  }
  regexpReplace(regexp: string, replacement: string): void { }
  replace(literal: string, replaceWith: string): void { }
  replaceInPath(literal: string, replacement: string): void { }
}

class NodeFileBase implements File {
  nodeName(): String {
    return '';
  }
  nodeType(): String {
    return '';
  }
  value(): String {
    return '';
  }
  update(newValue: String) { }
  append(literal: string): void { }
  contains(what: string): boolean {
    return false;
  }
  containsMatch(regexp: string): boolean {
    return false;
  }
  content(): string {
    return '';
  }
  fail(msg: string): void { }
  filename(): string {
    return '';
  }
  findMatches(regexp: string): string[] {
    return [];
  }
  firstMatch(regexp: string): string {
    return '';
  }
  isJava(): boolean {
    return false;
  }
  isWellFormed(): boolean {
    return true;
  }
  lineCount(): number {
    return 0;
  }
  makeExecutable(): void { }
  mustContain(content: string): void { }
  name(): string {
    return '';
  }
  nameContains(what: string): boolean {
    return false;
  }
  path(): string {
    return '';
  }
  permissions(): number {
    return 0;
  }
  prepend(literal: string): void { }
  println(msg: string): void {
    console.log(msg);
  }
  regexpReplace(regexp: string, replaceWith: string): void { }
  replace(literal: string, replaceWith: string): void { }
  setContent(newContent: string): void { }
  setName(name: string): void { }
  setPath(newPath: string): void { }
  underPath(root: string): boolean {
    return false;
  }
}

export class VirtualNodeFile extends NodeFileBase {
  initialContents: string;
  modifiedContents: string;
  initialPath: string;
  modifiedPath: string;
  filePath: string;

  static fromExistingFile(filePath: string, virtualPath: string): VirtualNodeFile {
    const file = new VirtualNodeFile(virtualPath, null);
    file.filePath = filePath;
    return file;
  }

  constructor(virtualPath: string, contents: string) {
    super();
    this.initialPath = virtualPath;
    this.initialContents = contents;
  }

  path() {
    return this.modifiedPath || this.initialPath;
  }

  name() {
    return this.filename();
  }

  filename() {
    return path.basename(this.path());
  }

  initialContent() {
    return this.filePath ? fs.readFileSync(this.filePath).toString() : this.initialContents;
  }

  content() {
    return this.modifiedContents || this.initialContent();
  }

  setContent(value: string) {
    if (this.content() !== value) {
      this.modifiedContents = value;
    }
  }

  wasModified() {
    return this.modifiedContents !== undefined;
  }

  print() {
    if (this.wasModified()) {
      console.log('=== ' + this.path() + ' ========================================');
      for (const part of jsdiff.diffLines(this.initialContent(), this.modifiedContents, {
        newlineIsToken: true
      })) {
        const color = part.added ? 'green' : part.removed ? 'red' : 'grey';
        console.log(part.value[color] + '\n');
      }
    }
  }
}

export class VirtualNodeProject extends NodeProjectBase {
  virtualFiles: {[path: string]: VirtualNodeFile} = {};

  addExistingApp(root: string) {
    for (const item of fs.readdirSync(root)) {
      const itemPath = path.join(root, item);
      if (fs.statSync(itemPath).isFile()) {
        const virtualPath = path.join('/', path.basename(itemPath));
        this.virtualFiles[virtualPath] = VirtualNodeFile.fromExistingFile(itemPath, virtualPath);
        console.log(`Created virtual copy of "${item}"`);
      }
    }
  }

  addInitialFile(filePath: string, contents: string) {
    const file = new VirtualNodeFile(filePath, contents)
    this.virtualFiles[file.path()] = file;
  }

  files() {
    return <File[]>Object.keys(this.virtualFiles).map(key => this.virtualFiles[key]);
  }

  print() {
    this.files().forEach(file => (<VirtualNodeFile>file).print());
  }
}
