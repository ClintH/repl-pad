import {unwrap} from "./text";
import {Import, ExecutionBlock, ReplOptions, ExecutionResult, ExecutionState, ImportResults} from "./types";


export async function resolveImports(imports: Map<string, Import>): Promise<ImportResults> {
  let resolved = {};
  let errors = ``;
  for (const [name, imp] of imports) {
    //console.log(name);
    //console.log(`-> ${imp.module} named ${imp.named}`);

    try {
      let module = await import(unwrap(imp.module, "'", '"'));
      //console.log(module);
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
    } catch (ex) {
      // @ts-ignore
      errors += ex.message + ' ';
      //console.log(ex.message);
      //console.log(ex);
    }
  }
  errors = errors.trim();
  return {resolved, errors};
}

export async function execute(b: ExecutionBlock, context: any, prepend: string, opts: ReplOptions): Promise<ExecutionResult> {
  let code = prepend + b.statement;
  if (opts.wrapAsync) {
    code = `(async () => {${code}})()`;
  }

  //console.log(`exec: ${code} with context: ${JSON.stringify(context)} wrapAsync: ${b.wrapAsync}`);
  const r = function (src: string) {
    return eval(src);
  }

  return new Promise((resolve, reject) => {
    try {
      const result = r.bind(context)(code);
      Promise.resolve(result).then(resultResolved => {
        //console.log(resultResolved);
        const formatted = formatValue(resultResolved);
        const er: ExecutionResult = {msg: formatted[0], details: formatted[1], keep: true, state: formatted[2]};

        if (resultResolved === undefined && !opts.reevalUndef) er.keep = false;
        resolve(er);
      });
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