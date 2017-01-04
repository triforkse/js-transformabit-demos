// import {
//   GenericJsNode,
//   Transformation,
//   Identifier,
// } from 'js-transformabit';

// export class RenameVariable implements Transformation {
//   oldName: string;
//   newName: string;

//   configure(args: any[]): void {
//     this.oldName = args[0];
//     this.newName = args[1];
//   }

//   check(root: GenericJsNode): boolean {
//     return root
//       .findChildrenOfType(Identifier)
//       .has(n => n.node.name === this.oldName);
//   }

//   apply(root: GenericJsNode): GenericJsNode {
//     root
//       .findChildrenOfType(Identifier)
//       .forEach(n => {
//         if (n.node.name === this.oldName) {
//           n.node.name = this.newName;
//         }
//       });
//     return root;
//   }
// }
