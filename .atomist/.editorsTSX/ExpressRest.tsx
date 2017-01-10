import { Project, File } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

import * as js from 'js-transformabit/dist/JsCode';
import { JsNode, GenericJsNode } from 'js-transformabit/dist/JsNode';

import { ReactContext } from '../ReactContext';

const JsCode = js.JsCode;

interface ExpressRestParams {
  uri: string;
};

export class ExpressRest implements ProjectEditor {
  tags = ['express'];
  name = 'ExpressRest';
  description = 'TODO';
  parameters: Parameter[] = [
    {
      name: 'uri',
      required: true,
      description: 'URI',
      displayName: 'URI',
      validInput: 'URI',
      pattern: '^.+$'
    }
  ];
  project: Project;

  edit(project: Project, params: ExpressRestParams): Result {
    this.project = project;
    let rc = new ReactContext(project);
    rc.jsFiles().forEach(file => {
      let root = JsNode.fromModuleCode(file.content());
      root = this.editModule(root, params);
      if (root) {
        file.setContent(root.format());
      }
    });
    return new Result(Status.Success);
  }

  editModule(file: js.File, params: ExpressRestParams): js.File {
    const expressId = this.getExpressIdentifier(file);
    const listenFunc = this.getListenInvoke(file, expressId);

    listenFunc.insertBefore(
      <js.ExpressionStatement>
        <js.CallExpression callee={expressId.name + ".get"}>
          <js.Literal value={params.uri}/>
          <js.FunctionExpression>
            <js.Identifier name="req"/>
            <js.Identifier name="res"/>
            <js.BlockStatement>
            </js.BlockStatement>
          </js.FunctionExpression>
        </js.CallExpression>
      </js.ExpressionStatement>);
    return file;
  }

  private getCurrentListen(root: GenericJsNode, expressId: js.Identifier): js.ExpressionStatement {
    const listens = root.findChildrenOfType(js.CallExpression).filter(ce => {
      return (ce.callee().format().indexOf(expressId.name + ".listen") === 0);
    })

    if (listens.size() > 0) {
      return listens.at(0).findParentOfType(js.ExpressionStatement);
    }
    return null;
  }

  private getListenInvoke(root: GenericJsNode, expressId: js.Identifier) {

    const currentListen = this.getCurrentListen(root, expressId);
    if (currentListen !== null) {
      return currentListen;
    }

    const expressListen = (
      <js.MemberExpression object={expressId} property="listen"/>
    );

    const listen = (
      <js.ExpressionStatement>
        <js.CallExpression callee={expressListen as js.MemberExpression}>
          <js.Literal value={8080}/>
        </js.CallExpression>
      </js.ExpressionStatement> as js.ExpressionStatement
    );

    root.findFirstChildOfType(js.Program).append(listen);
    return this.getCurrentListen(root, expressId);

  }

  private getExpressIdentifier(root: GenericJsNode): js.Identifier {
    const importExpressId = this.getExistingImportExpressDeclaration(root);
    if (importExpressId === null) {
      return this.addExpressImport(root);
    }
    if (importExpressId.init) {
      return importExpressId.id;
    }
    const expressInit = this.getLeftIdentifierForCallExpression(root, importExpressId.id.name, args =>  true);
    if (expressInit !== null) {
      return expressInit.id;
    }
    importExpressId.declaration.replace(this.importAndInitExpressNode());
    return new js.Identifier().build({name: "express"}, []);
  }

  private getExistingImportExpressDeclaration(root: GenericJsNode) {
    return this.getLeftIdentifierForCallExpression(root, "require", args => {
      if (args.length !== 1) {
          return false;
        }
        const arg = args[0];
        if (arg.check(js.Literal)) {
          return arg.value === "express";
        }
    });
  }

  private getLeftIdentifierForCallExpression(root: GenericJsNode, calleeName: string, argValidator: (args: js.GenericExpression[]) => boolean) {
    const varDecs = root.findChildrenOfType(js.VariableDeclarator).toList();
    for (const varDec of varDecs) {
      let init = varDec.init();
      if (init.check(js.CallExpression)) {
        let callee = init.callee();
        if (callee.check(js.Identifier)) {

          if (callee.name !== calleeName) {
            continue;
          }
          const args = init.children().toList().slice(1).map(node => node as js.GenericExpression);
          if (argValidator(args)) {
            return {declaration: varDec.findClosestParentOfType(js.VariableDeclaration), id: varDec.id(), init: false};
          }
        } else if (callee.check(js.CallExpression)) {
          let calleeCallee = callee.callee();
          if (calleeCallee.check(js.Identifier)) {
            if (calleeCallee.name !== calleeName) {
              continue;
            }
            const args = callee.children().toList().slice(1).map(node => node as js.GenericExpression);
            if (argValidator(args)) {
              return {declaration: varDec.findClosestParentOfType(js.VariableDeclaration), id: varDec.id(), init: true};
            }
          }
        } else {
          continue;
        }
      }
    };
    return null;
  }

  private importAndInitExpressNode(): GenericJsNode {
    const require = (
      <js.CallExpression callee='require'>
       <js.Literal value="express" />
      </js.CallExpression>
    ) as js.CallExpression;
    const varDec = (
      <js.VariableDeclaration kind='var'>
        <js.VariableDeclarator name="express">
          <js.CallExpression callee={require}/>
        </js.VariableDeclarator>
      </js.VariableDeclaration>
    );
    return varDec;
  }

  private addExpressImport(root: GenericJsNode): js.Identifier {
    const requires = this.getRequires(root);
    if (requires.length === 0) {
      if (root.children().first().children().size() === 0) {
        root.findFirstChildOfType(js.Program).replace(
          <js.Program>
            {this.importAndInitExpressNode()}
          </js.Program>
        );
      }
    } else {
      requires[0].insertBefore(this.importAndInitExpressNode());
    }
    return new js.Identifier().build({name: "express"}, []);
  }

  private getRequires(root: GenericJsNode): js.VariableDeclarator[] {
    return root.findChildrenOfType(js.VariableDeclarator).filter(varDec => {
      let init = varDec.init();
      if (init.check(js.CallExpression)) {
        let callee = init.callee();
        if (callee.check(js.Identifier)) {
          return callee.name === "require";
        }
      }
      return false;
    }).toList();
  }
}
