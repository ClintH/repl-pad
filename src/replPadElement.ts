import Split from 'split.js';
import {css} from './style';
import {debounce} from './timer';
import {parse} from './parse';
import {appendToElement, ConsoleIntercept} from './consoleIntercept';
import {resolveImports, execute} from './execute';
import {ReplOptions, ExecutionResult} from './types';

export class ReplPadElement extends HTMLElement {
  code: string;
  outputEl: HTMLElement | undefined;
  textEl: HTMLTextAreaElement | undefined;
  codeEditDebounceMs = 400;
  replOptions: ReplOptions;

  constructor(code: string = ``) {
    super();
    if (code.length === 0 && location.hash.length > 0) {
      this.code = atob(location.hash.substring(1));
    } else {
      this.code = code;
    }
    this.render();
    this.textEl?.focus();

    const opts: ReplOptions = {
      reevalConsole: false,
      reevalUndef: true,
      wrapAsync: false
    };

    const attribToBool = (name: string, prev: boolean): boolean => {
      name = name.toLocaleLowerCase();
      if (this.hasAttribute(name)) {
        const v = this.getAttribute(name);
        if (v === `false`) return false;
        else if (v === `true` || v === ``) return true;
      }
      return prev;
    }

    // Apply options from attribute
    opts.reevalConsole = attribToBool(`reevalConsole`, opts.reevalConsole);
    opts.reevalUndef = attribToBool(`reevalUndef`, opts.reevalUndef);

    // Apply options from URI
    const paramToBool = (p: string | null, prev: boolean): boolean => {
      if (p === null || p === undefined) return prev;
      return p === `true`;
    }
    const params = new URLSearchParams(window.location.search);
    opts.reevalConsole = paramToBool(params.get('reevalConsole'), opts.reevalConsole);
    opts.reevalUndef = paramToBool(params.get('reevalUndef'), opts.reevalUndef);

    this.replOptions = opts;

    // Handle initial code
    setTimeout(() => this.codeChange(), this.codeEditDebounceMs);
  }

  private async codeChange() {
    const txt = this.textEl;
    const output = this.outputEl;

    if (txt === undefined) return;

    const p = parse(txt.value, this.replOptions);
    const results: ExecutionResult[] = [];
    let lines = 0;
    let context = {}
    let prepend = ``;

    const containsAsync = p.blocks.some(b => b.wrapAsync === true);
    const opts = {...this.replOptions};
    opts.wrapAsync = containsAsync;

    for (const b of p.blocks) {
      //console.log(b.statement + ' start: ' + b.span.start + ' kind: ' + b.kind);
      while (lines < b.span.start) {
        results.push({msg: `&nbsp;`, state: ``, details: ``, keep: true});
        lines++;
      }

      let result: ExecutionResult = {msg: `&nbsp;`, state: `info`, keep: false, details: ``};
      if (b.kind === `import` && b.imports) {
        const importResult = await resolveImports(b.imports);
        if (importResult.errors.length > 0) {
          result = {msg: importResult.errors, state: 'error', keep: false, details: ``};
        } else {
          context = {...context, ...importResult.resolved};
        }
      } else if (b.kind === `run`) {
        result = await execute(b, context, prepend, opts);
      }

      results.push(result);
      lines++;
      if (result.keep && b.cumulative) {
        prepend += b.statement;
        if (!prepend.endsWith(';')) prepend += ';';
      }

    }

    const resultsHtml = results.map(b => `<div title="${b.details}" class="${b.state}">${b.msg}</div>`)
    if (output !== undefined) output.innerHTML = resultsHtml.join('\n');

    let enc = btoa(txt.value);
    //location.hash = enc;  // Back button acts as an undo stack
    window.location.replace(`#${enc}`); // Back button will returns to referer page
  }

  focus() {
    this.textEl?.focus();
  }

  render() {
    const shadow = this.attachShadow({mode: 'open'});

    const container = document.createElement(`div`);
    container.id = `container`;

    const top = document.createElement(`div`);
    top.id = `top`;

    const bottom = document.createElement(`div`);
    bottom.id = `bottom`;

    const left = document.createElement(`div`);
    left.id = `left`;

    const textEl = document.createElement(`textarea`);
    textEl.spellcheck = false;
    textEl.setAttribute(`wrap`, `off`);
    textEl.id = `input`;
    textEl.value = this.code;

    textEl.addEventListener(`keydown`, (evt) => {
      // TODO: shift+tab remove indent
      // TODO: indent whole selection
      if (evt.code === "Tab") {
        const s = textEl.selectionStart;
        const e = textEl.selectionEnd;
        const v = textEl.value;
        textEl.value = v.substring(0, s) + '  ' + v.substring(e);
        textEl.selectionStart = textEl.selectionEnd = s + 2;
        evt.preventDefault();
      }
    }, false);

    const codeChangeDebounced = debounce(() => {
      this.codeChange();
    }, this.codeEditDebounceMs);
    textEl.addEventListener(`input`, codeChangeDebounced);
    this.textEl = textEl;

    left.appendChild(textEl);

    const right = document.createElement(`div`);
    right.id = `right`;

    this.outputEl = document.createElement(`div`);
    this.outputEl.id = `output`;

    right.append(this.outputEl);

    const consoleEl = document.createElement(`div`);
    consoleEl.id = `console`;


    ConsoleIntercept.init(appendToElement(consoleEl));

    const bottomToolbar = document.createElement(`div`);
    bottomToolbar.id = `toolbar`;

    const btnClear = document.createElement(`div`);
    btnClear.innerText = `C`
    btnClear.title = `Clear console`;
    btnClear.addEventListener(`click`, () => {
      console.clear();
    });

    bottomToolbar.appendChild(btnClear);

    top.appendChild(left);
    top.appendChild(right);

    bottom.appendChild(bottomToolbar);
    bottom.appendChild(consoleEl);

    container.appendChild(top);
    container.appendChild(bottom);

    const style = document.createElement('style');
    style.textContent = css;

    shadow.appendChild(style);
    shadow.appendChild(container);

    const splitLeftRight = Split([left, right], {
      sizes: [75, 25],
      gutterSize: 20
    });

    let lastBottomSize = 0;
    const splitTopBottom = Split([top, bottom], {
      sizes: [100, 0],
      minSize: [100, 0],
      gutterSize: 20,
      direction: `vertical`,
      onDragEnd: (sizes) => {
        const bottomSize = sizes[1];
        consoleEl.style.display = bottomSize > 1 ? `block` : `none`;
        lastBottomSize = bottomSize;
      }
    });
    splitTopBottom.collapse(1);


    consoleEl.addEventListener(`empty`, () => {
      splitTopBottom.collapse(1);
    });

    consoleEl.addEventListener(`non-empty`, () => {
      const sizes = splitTopBottom.getSizes();

      // Pop-up console if it's tiny
      if (sizes[1] < 1) {
        let bottomSize = Math.max(lastBottomSize, 20);
        splitTopBottom.setSizes([100 - bottomSize, bottomSize]);
        lastBottomSize = bottomSize;
      }
    })
  }
}
customElements.define('repl-pad', ReplPadElement);