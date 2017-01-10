import { Project, File } from '@atomist/rug/model/Core';
import { ProjectEditor } from '@atomist/rug/operations/ProjectEditor';
import { Result, Status, Parameter } from '@atomist/rug/operations/RugOperation';

import * as js from 'js-transformabit/dist/JsCode';
import { JsNode, GenericJsNode } from 'js-transformabit/dist/JsNode';
import { inferPropType } from 'js-transformabit/dist/PropTypes';

import { ReactContext } from '../ReactContext';

const JsCode = js.JsCode;
interface AddPropTypesParams {
  component: string;
};

export class AddPropTypes implements ProjectEditor {
  tags = ['proptypes', 'react'];
  name = 'AddPropTypes';
  description = 'Adds a PropTypes to a React component';
  parameters: Parameter[] = [
    {
      name: 'component',
      required: true,
      description: 'component name',
      displayName: 'component name',
      validInput: 'name of a component',
      pattern: '^.+$',
      minLength: 1,
      maxLength: 20
    },
    {
      name: 'address',
      required: true,
      description: 'address to connect to',
      displayName: 'address',
      validInput: 'ip address',
      pattern: '^.+$',
      minLength: 1,
      maxLength: 20
    }
  ];
  project: Project;

  edit(project: Project, params: AddPropTypesParams): Result {
    this.project = project;
    let rc = new ReactContext(project);
    rc.jsFiles().forEach(file => {
      try {
        let root = JsNode.fromModuleCode(file.content());
        root = this.editModule(root, params);
        if (root) {
          file.setContent(root.format());
        }
      } catch (error) {
        this.project.println(error.toString());
      }
    });
    return new Result(Status.Success);
  }

  editModule(file: js.File, params: AddPropTypesParams): js.File {
    file.findChildrenOfType(js.ReactClassComponent).forEach(component => {
      let props = {};
      component.findChildrenOfType(js.MemberExpression).forEach(memberExpression => {
        const property = memberExpression.property();
        if (property.check(js.Identifier)) {
          if (memberExpression.object().format() === 'this.props') {
            if (props[property.name] === undefined) {
              // Register the property name, even if the type can't be inferred
              props[property.name] = null;
            }
            const type = inferPropType(file, property.name);
            if (type) {
              props[property.name] = type;
            }
          }
        }
      });
      const propNode = Object.keys(props).map(name =>
        <js.Property key={name} kind='init'>
          <js.MemberExpression
            object={<js.MemberExpression
              object="React"
              property="PropTypes" /> as js.MemberExpression}
            property={props[name] || 'any'}
            />
        </js.Property> as js.Property
      );
      component.insertAfter(
        <js.ExpressionStatement>
          <js.AssignmentExpression
            left={<js.MemberExpression
              object={component.id()}
              property="propTypes" /> as js.MemberExpression}
            right={
              <js.ObjectExpression>
                {propNode}
              </js.ObjectExpression> as js.ObjectExpression
            }
            />
        </js.ExpressionStatement>
      );
    });
    return file;
  }
}
