// import {
//   GenericJsNode,
//   JsNodeList,
//   Transformation,
//   JsCode,
//   BinaryExpression,
//   ExpressionStatement,
//   AssignmentExpression,
//   VariableDeclaration,
//   VariableDeclarator,
//   FunctionDeclaration,
//   BlockStatement,
//   Identifier
// } from 'js-transformabit';

// export class AddVarToAllDeclarations implements Transformation {

//     useLet: boolean
//     useConst: boolean

//     configure(args: any[]): void {
//         this.useLet = args[0] as boolean;
//         this.useConst = args[1] as boolean;
//     }

//     check(root: GenericJsNode): boolean {
//         return this.findExpressionStatements(root).size() > 0;
//     }

//     private findExpressionStatements(root: GenericJsNode): JsNodeList<ExpressionStatement> {
//         return root.findChildrenOfType(ExpressionStatement).filter(expression => {
//             if (expression.children().at(0).check(AssignmentExpression)) {
//                 const assignment = expression.children().at(0) as AssignmentExpression;
//                 return assignment.operator === "=";
//             }
//             return false;
//         });
//     }

//     apply(root: GenericJsNode): GenericJsNode {
//         root.findChildrenOfType(FunctionDeclaration).forEach(functionDeclaration => {
//             const statements = this.findExpressionStatements(functionDeclaration);
//             const firstEncounters = statements.filter(expression => {
//                 const assignment = expression.children().at(0) as AssignmentExpression;
//                 return this.isEarliestEncounter(functionDeclaration, expression);
//             });
//             this.replaceAsVariableDelcarations(firstEncounters);
//         });
//         return root;
//     }

//     private isEarliestEncounter(root: GenericJsNode, exp: ExpressionStatement): boolean {
//         let name = ((exp.children().at(0) as AssignmentExpression).children().at(0) as Identifier).name;
//         let start = exp.sourceLocation.start.line;
//         let firstExpression: number = this.earliestExpressionEncounter(root, name);
//         let firstDeclaration: number = this.earliestDeclarationEncounter(root, name);
//         if (firstDeclaration === -1) {
//             return start === firstExpression;
//         } else if (start > firstDeclaration) {
//             return false;
//         } else {
//             return start == firstExpression;
//         }
//     }

//     private earliestExpressionEncounter(root: GenericJsNode, name: string): number {
//         const parent = root.findClosestParentOfType(FunctionDeclaration);
//         if (parent != null) {
//             const parentEarliest = this.earliestExpressionEncounter(parent, name);
//             if (parentEarliest !== -1) {
//                 return parentEarliest;
//             }
//         }
//         let first: number = null;
//         this.findExpressionStatements(root).forEach(expression => {
//             const left = ((expression.children().at(0) as AssignmentExpression).children().at(0) as Identifier).name;
//             if (name === left) {
//                 if (first === null || first > expression.sourceLocation.start.line) {
//                     first = expression.sourceLocation.start.line;
//                 }
//             }
//         });
//         return first;
//     }

//     private earliestDeclarationEncounter(root: GenericJsNode, name: string): number {
//         const parent = root.findClosestParentOfType(FunctionDeclaration);
//         if (parent != null) {
//             const parentEarliest = this.earliestDeclarationEncounter(parent, name);
//             if (parentEarliest !== -1) {
//                 return parentEarliest;
//             }
//         }
//         const decs = root.findChildrenOfType(VariableDeclaration).filter(variableDec => {
//             const declarators = variableDec.declarations().filter(dec => {
//                 const declarator = (dec as VariableDeclarator);
//                 return declarator.id().name === name;
//             });
//             return declarators.size() !== 0;
//         });
//         if (decs.size() === 0) {
//             return -1;
//         } else {
//             return decs.first().sourceLocation.start.line;
//         }
//     }

//     private replaceAsVariableDelcarations(expressions: JsNodeList<ExpressionStatement>): void {
//         expressions.forEach(expression => {
//             const assignment = expression.children().at(0) as AssignmentExpression;
//             const left = (assignment.children().at(0) as Identifier).name;
//             const right = (assignment.children().last() as GenericJsNode);
//             let variableDeclaration = (
//                 <VariableDeclaration name={left} kind={this.getKind(expression, left)}>
//                     {right}
//                 </VariableDeclaration>
//             );
//             variableDeclaration.sourceLocation = {
//                 start: {
//                     line: expression.sourceLocation.start.line,
//                     column: expression.sourceLocation.start.column
//                 },
//                 end: {
//                     line: expression.sourceLocation.start.line,
//                     column: expression.sourceLocation.start.column + variableDeclaration.format().length
//                 }
//             };
//             expression.replace(variableDeclaration);
//         });
//     }

//     private getKind(expression: ExpressionStatement, name: string): "var" | "let" | "const" {
//         if (this.useConst) {
//             const parent = expression.findClosestParentOfType(BlockStatement);
//             const assigns = parent.findChildrenOfType(AssignmentExpression).filter(assignmentExpression => {
//                 return (assignmentExpression.children().at(0) as Identifier).name === name;
//             }).size();
//             if (assigns === 1) {
//                 return "const";
//             }
//         }
//         if (this.useLet) {
//             return "let";
//         }
//         return "var";
//     }
// }
