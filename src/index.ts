
import {between} from './text';
import {css} from './style';
import {debounce} from './timer';

type BlockResult = {
  msg: string,
  state: `` | `error` | `info`,
  keep: boolean
}

export class ReplPad extends HTMLElement {
  code: string;
  outputEl: HTMLElement | undefined;
  textEl: HTMLTextAreaElement | undefined;

  constructor(code: string = ``) {
    super();
    if (code.length === 0 && location.hash.length > 0) {
      this.code = atob(location.hash.substring(1));
    } else {
      this.code = code;
    }
    this.render();
    this.textEl?.focus();

    setTimeout(() => this.codeChange(), 300);
  }

  formatValue(r: any): string {
    let msg = r;
    if (r === undefined) msg = `undef.`;
    else if (typeof r === `number`) {
      msg = r.toString();
    } else if (typeof r === `string`) {
      msg = `"${r}"`;
    } else if (typeof r === `object`) {
      msg = JSON.stringify(r);
    }
    return msg;
  }

  /**
   * Simple tokeniser
   * TODO: Use a proper parser like typescript or recast
   * https://astexplorer.net/
   * @param l Text
   * @returns 
   */
  statementBreaker(l: string): string[] {
    let blocks = [];
    let parenth = 0;
    let curlies = 0;
    let square = 0;
    let mark = 0;

    let backticked = false;
    let singleQuote = false;
    let doubleQuote = false;

    for (let i = 0; i < l.length; i++) {
      const c = l.charAt(i);
      const prevC = i > 0 ? l.charAt(i - 1) : ``;

      if (c === '`') {
        backticked = !backticked;
      } else if (backticked) continue;

      if (c === "'" && prevC !== "\\") {
        singleQuote = !singleQuote;
      } else if (singleQuote) continue;

      if (c === '"' && prevC !== "\\") {
        doubleQuote = !doubleQuote;
      } else if (doubleQuote) continue;

      if (c === `[`) square++;
      else if (c === '{') curlies++;
      else if (c === '(') parenth++;
      else if (c === ']') square--;
      else if (c === '}') curlies--;
      else if (c === ')') parenth--;
      else if (c === '\n' || c === '\r' || c === `;`) {
        // New line
        if (parenth || curlies || square) {
          // Ignore, because we're inside a region
        } else {
          // End of line
          blocks.push(l.substring(mark, i));
          mark = i + 1;
        }
      }
    }
    blocks.push(l.substring(mark, l.length));
    return blocks;
  }

  async importIntercept(l: string): Promise<BlockResult> {
    const skipReply: BlockResult = {msg: ``, state: ``, keep: false};

    // Find URI
    const uriDouble = between(l, '"');
    const uriSingle = between(l, "'");
    if (uriDouble === undefined && uriSingle === undefined) return skipReply;

    const uri = uriDouble ?? uriSingle;
    const importWhat = between(l, '{', '}');
    if (importWhat === undefined) return skipReply;

    let importWhatSplit = importWhat.split(',');

    try {
      // @ts-ignore
      let module = await import(uri);
      const keys = Object.keys(module);

      keys.forEach(k => {
        if (importWhatSplit.includes(k)) {
          // @ts-ignore
          window[k] = module[k];
        } else {
          //console.warn(`Skipping from imported module: ${k}`);
        }
      });
      return {msg: `(imported)`, keep: false, state: `info`};
    } catch (ex) {
      return {msg: (ex as Error).toString(), state: `error`, keep: false}
    }
  }

  /**
   * Executes a block of code: a statement, or a block like a function or loop
   * 
   * TODO: Ideally it steps through lines within a function
   * @param block 
   * @param prior 
   */
  async block(block: string, prior: string): Promise<BlockResult> {
    let result: BlockResult = {msg: `&nbsp;`, state: ``, keep: false};
    let l = block.trim();

    const isDeclaration = (l.startsWith(`let `) || l.startsWith(`const `) || l.startsWith(`var `));

    if (l.length == 0 || l.startsWith('//')) return result;

    try {
      if (l.startsWith(`import `)) return await this.importIntercept(l);

      const js = prior + `;\n` + l;

      const r = eval(js);
      if (!isDeclaration) result = {msg: this.formatValue(r), state: ``, keep: true};
      result.keep = true;

    } catch (ex) {
      result = {keep: false, msg: (ex as Error).toString(), state: `error`};
    }
    return result;
  }

  private async codeChange() {
    const txt = this.textEl;
    const output = this.outputEl;

    if (txt === undefined) return;
    const blocks = this.statementBreaker(txt.value);
    const results = [];
    let prior = ``;

    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].length == 0) continue;
      const r = await this.block(blocks[i], prior);
      results.push(r);
      if (r.keep) prior += blocks[i] + ';\n';
    }

    const resultsHtml = results.map(b => `<div title="${b.msg}" class="${b.state}">${b.msg}</div>`)

    if (output !== undefined) output.innerHTML = resultsHtml.join('\n');

    let enc = btoa(txt.value); //Buffer.from(txt.substring(1), `base64`).toString();
    location.hash = enc;
  }

  focus() {
    this.textEl?.focus();
  }

  render() {
    const shadow = this.attachShadow({mode: 'open'});

    const container = document.createElement(`div`);
    container.id = `container`;

    const left = document.createElement(`div`);
    left.id = `left`;

    const textEl = document.createElement(`textarea`);
    textEl.spellcheck = false;
    textEl.id = `input`;
    textEl.value = this.code;
    const codeChangeDebounced = debounce(() => {
      this.codeChange();
    }, 200);
    textEl.addEventListener(`input`, codeChangeDebounced);
    this.textEl = textEl;

    left.appendChild(textEl);

    const right = document.createElement(`div`);
    right.id = `right`;

    this.outputEl = document.createElement(`div`);
    this.outputEl.id = `output`;

    right.append(this.outputEl);

    container.appendChild(left);
    container.appendChild(right);

    const style = document.createElement('style');
    style.textContent = css;

    shadow.appendChild(style);
    shadow.appendChild(container);
  }
}
customElements.define('repl-pad', ReplPad);