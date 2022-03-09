import * as ts from 'typescript';
import {LineSpan, lineSpan, splitRanges, unwrap} from './text';

export type Import = {
  module: string
  named: boolean
}
export type ExecutionBlock = {
  statement: string
  span: LineSpan
  cumulative: boolean
}

export type ExecutionState = `` | `error` | `info`;
export type ExecutionResult = {
  msg: string
  state: ExecutionState
  keep: boolean
  details: string
}

export type ParseResult = {
  imports: Map<string, Import>
  blocks: ExecutionBlock[]
}

export type ReplOptions = {
  reevalConsole: boolean
  reevalUndef: boolean
}

export const parse = (source: string, opts: ReplOptions): ParseResult => {
  const ranges = splitRanges(source, '\n');
  const src = ts.createSourceFile(
    `s.ts`,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS);

  const blocks: ExecutionBlock[] = [];
  const imports = new Map<string, Import>();

  //console.log(ranges);
  for (const s of src.statements) {
    const sStart = s.getStart(src);
    //  console.log(`statement: ${s.getText()} kind: ${s.kind} start: ${sStart} end: ${s.end}`);
    const span = lineSpan(ranges, sStart, s.end);
    const block = {
      statement: s.getText(),
      cumulative: true,
      span
    };
    let addBlock = true;

    if (s.kind === ts.SyntaxKind.VariableStatement) {
      // eg. let x = 1;
      const varDeclaration = s as ts.VariableStatement;
      for (const vd of varDeclaration.declarationList.declarations) {
        if (`escapedText` in vd.name) {
          block.statement += ';' + vd.name.escapedText;
        }
      }

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
      if (`elements` in bindings) {
        for (const b of bindings.elements) {
          // import {foo} from 'foo.js'
          imports.set(b.name.escapedText.toString(), {
            module: moduleSpecifier,
            named: true
          });

        }
        addBlock = false;
      } else if (`name` in bindings) {
        // import * as foo from 'foo.js'
        imports.set(bindings.name.escapedText.toString(), {
          module: moduleSpecifier,
          named: false
        });
        addBlock = false;
      } else {
        console.warn(s);
      }
    } else {
      //console.warn(s);
    }

    if (addBlock) blocks.push(block);
  }

  return {
    blocks, imports
  };
}

export async function resolveImports(imports: Map<string, Import>) {
  let resolved = {};
  for (const [name, imp] of imports) {
    //console.log(name);
    //console.log(`-> ${imp.module} named ${imp.named}`);

    let module = await import(unwrap(imp.module, "'", '"'));

    if (imp.named) {
      const m = module[name];
      //console.log(module);
      //console.log(m);
      if (m === undefined) {
        throw new Error(`${name} not found in ${imp.module}`);
      }
      // @ts-ignore
      resolved[name] = m;
      // @ts-ignore
      window[name] = m;
    } else {
      // @ts-ignore
      resolved[name] = module;
      // @ts-ignore
      window[name] = m;
    }
  }
  return resolved;
}

export async function execute(b: ExecutionBlock, context: any, prepend: string, opts: ReplOptions): Promise<ExecutionResult> {
  const code = prepend + b.statement;
  //console.log(`eval: ${code} with context: ${JSON.stringify(context)}`);
  const r = function (src: string) {
    return eval(src);
  }

  return new Promise((resolve, reject) => {
    try {
      const result = r.bind(context)(code);
      const formatted = formatValue(result);
      const er: ExecutionResult = {msg: formatted[0], details: formatted[1], keep: true, state: formatted[2]};

      if (result === undefined && !opts.reevalUndef) er.keep = false;
      resolve(er);
    } catch (ex: unknown) {
      if (ex instanceof Error) {
        const er: ExecutionResult = {msg: ex.message, details: ex.toString(), state: `error`, keep: false};
        resolve(er);
      } else {
        const er: ExecutionResult = {msg: (ex as any).toString(), details: ex as string, state: `error`, keep: false};
        resolve(er);
      }
    }
  });
}

const formatValue = (r: any): [string, string, ExecutionState] => {
  let msg = r;
  let title = r;
  let state: ExecutionState = ``;
  const t = typeof r;
  if (r === undefined) {
    msg = `undefined`;
    state = `info`;
  }
  else if (r === null) {
    msg = `null`;
    state = `info`;
  }
  else if (t === `number`) {
    msg = r.toString();
  } else if (t === `string`) {
    msg = `"${r.replace(`\n`, '\\n')}"`;
  } else if (t === `object`) {
    msg = JSON.stringify(r);
  } else if (t === `function`) {
    msg = `fn()`;
    state = `info`;
    title = r;
  } else {
    msg += ` [${t}]`;
  }
  return [msg, title, state];
}