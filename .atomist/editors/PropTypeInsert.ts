import { Project, File } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

// Import in this exact order, or disaster strikes!
import { JsNode, GenericJsNode } from 'js-transformabit/dist/JsNode';
import * as js from 'js-transformabit/dist/JsCode';

import {ReactContext} from '../ReactContext';

class PropTypeInsert implements ProjectEditor {
    tags = ['proptypes', 'react'];
    name = 'PropTypeInsert';
    description = 'Add prop types to react components';
    parameters: Parameter[] = []

    edit(project: Project, params: Parameter[]): Result {
      const rc = new ReactContext(project);
      rc.jsFiles().forEach(jsFile => {
        this.exec(jsFile);
      });
      return new Result(Status.Success);
    }

    private exec(jsFile: File) {
      const root = JsNode.fromModuleCode(jsFile.content())
      root.findChildrenOfType(js.ReactClassComponent).forEach(component => {
        let props = new Array<js.Property>();

        component.findChildrenOfType(js.MemberExpression).forEach(memberExpression => {
            if (memberExpression.object().format() === "this.props") {
              const property = new js.Property().build({
                key: (memberExpression.property() as js.Identifier).name,
                kind: 'init'
              }, [new js.MemberExpression().build({
                object: new js.MemberExpression().build({object: "React", property:"PropTypes"},[]),
                property: "any"
              },[])]);
              props.push(property);
            }
        });
        this.setPropTypes(root, component, props, jsFile);
      });
    }

    private setPropTypes(root: GenericJsNode, component: js.ReactClassComponent, props: Array<js.Property>, jsFile: File) {
        if (props.length === 0) {
          return;
        }
        const assignment = this.getPropTypesAssignment(root, component.id().name);

        if (assignment !== null) {
          assignment.findClosestParentOfType(js.ExpressionStatement).remove();
        }
        component.insertAfter(new js.ExpressionStatement().build({}, [new js.AssignmentExpression().build({
            left: new js.MemberExpression().build({object: component.id(), property: "propTypes"}, []),
            right: new js.ObjectExpression().build({}, props)
          },[])]));


        jsFile.setContent(root.format());
    }

    private getPropTypesAssignment(root: GenericJsNode, componentName: string): js.AssignmentExpression {
      const results= root.findChildrenOfType(js.AssignmentExpression).filter(assignment => {
        const expected = componentName + ".propTypes";
        return assignment.left().format() == expected;
      });
      if (results.size() === 0) {
        return null;
      }
      return results.first();
    }
}

const propTypeInsertEditor = new PropTypeInsert();
