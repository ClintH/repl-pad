import * as ts from 'typescript';
import {lineSpan, splitRanges} from './text';
import {ExecutionBlock, Import, ParseResult, ReplOptions} from './types';


export const parse = (source: string, opts: ReplOptions): ParseResult => {
  const ranges = splitRanges(source, '\n');
  const src = ts.createSourceFile(
    `s.ts`,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS);

  const blocks: ExecutionBlock[] = [];
  //const imports = new Map<string, Import>();

  //console.log(ranges);
  for (const s of src.statements) {
    const sStart = s.getStart(src);
    //console.log(`statement: ${s.getText()} kind: ${s.kind} start: ${sStart} end: ${s.end}`);
    const span = lineSpan(ranges, sStart, s.end);
    const block: ExecutionBlock = {
      statement: s.getText(),
      cumulative: true,
      span,
      wrapAsync: false,
      kind: `run`
    };

    // By default, add the block
    //let addBlock = true;

    if (s.kind === ts.SyntaxKind.VariableStatement) {
      // eg. let x = 1;
      const varDeclaration = s as ts.VariableStatement;
      for (const vd of varDeclaration.declarationList.declarations) {
        if (`escapedText` in vd.name) {
          block.statement += ';' + vd.name.escapedText;
        }
      }
    } else if (s.kind === ts.SyntaxKind.FunctionDeclaration) {
      const funcDecl = s as ts.FunctionDeclaration;
      if (funcDecl.modifiers !== undefined) {
        for (const m of funcDecl.modifiers) {
          if (m.kind === ts.SyntaxKind.AsyncKeyword) {
            block.wrapAsync = true;
          }
        }
      }
    } else if (s.kind == ts.SyntaxKind.ForOfStatement) {
      // @ts-ignore
      block.wrapAsync = s.awaitModifier !== undefined;
    } else if (s.kind === ts.SyntaxKind.ExpressionStatement) {
      // eg. Math.random();
      // Shouldn't be needed to push expressions if everything was purely functional,
      // but...
      // block.cumulative = false
      //console.log(s);
      const exprS = s as ts.ExpressionStatement;
      //console.log(exprS.expression.getText(src));
      if (!opts.reevalConsole && block.statement.startsWith(`console.`)) {
        block.cumulative = false;
      }
    } else if (s.kind === ts.SyntaxKind.ImportDeclaration) {
      const importS = s as ts.ImportDeclaration;
      const bindings = importS.importClause?.namedBindings as ts.NamedImportBindings;
      const moduleSpecifier = importS.moduleSpecifier.getText();
      block.kind = `import`;
      block.imports = new Map<string, Import>();
      if (`elements` in bindings) {
        for (const b of bindings.elements) {
          // import {foo} from 'foo.js'
          block.imports.set(b.name.escapedText.toString(), {
            module: moduleSpecifier,
            named: true
          });

        }

        //addBlock = false;
      } else if (`name` in bindings) {
        // import * as foo from 'foo.js'
        block.imports.set(bindings.name.escapedText.toString(), {
          module: moduleSpecifier,
          named: false
        });
        //addBlock = false;
      } else {
        console.warn(s);
      }
    } else {
      //console.warn(s);
    }

    blocks.push(block);
  }

  return {blocks};
}

