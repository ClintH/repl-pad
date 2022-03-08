import Split from 'split.js';

import {css} from './style';
import {debounce} from './timer';
import {execute, ExecutionResult, parse, resolveImports} from './parse';
import {appendToElement, ConsoleIntercept} from './consoleIntercept';

export class ReplPadElement extends HTMLElement {
  code: string;
  outputEl: HTMLElement | undefined;
  textEl: HTMLTextAreaElement | undefined;
  codeEditDebounceMs = 400;

  constructor(code: string = ``) {
    super();
    if (code.length === 0 && location.hash.length > 0) {
      this.code = atob(location.hash.substring(1));
    } else {
      this.code = code;
    }
    this.render();
    this.textEl?.focus();

    setTimeout(() => this.codeChange(), this.codeEditDebounceMs);
  }

  private async codeChange() {
    const txt = this.textEl;
    const output = this.outputEl;

    if (txt === undefined) return;

    const p = parse(txt.value);
    const results: ExecutionResult[] = [];
    let lines = 0;
    const context = await resolveImports(p.imports);

    for (const b of p.blocks) {
      //console.log(b.statement + ' start: ' + b.span.start);
      while (lines < b.span.start) {
        results.push({msg: `&nbsp;`, state: ``, details: ``, keep: true});
        lines++;
      }

      const result = await execute(b, context);
      results.push(result);
      lines++;
    }

    const resultsHtml = results.map(b => `<div title="${b.details}" class="${b.state}">${b.msg}</div>`)
    if (output !== undefined) output.innerHTML = resultsHtml.join('\n');

    let enc = btoa(txt.value);
    //location.hash = enc;
    window.location.replace(`#${enc}`)
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

    const btnClear = document.createElement(`button`);
    btnClear.innerText = `Clear`;
    btnClear.addEventListener(`click`, () => {
      consoleEl.innerHTML = ``;
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
      sizes: [25, 75]
    });

    const splitTopBottom = Split([top, bottom], {
      sizes: [100, 0],
      minSize: [100, 0],
      direction: `vertical`,
      onDrag: (sizes) => {
        const bottomSize = sizes[1];
        consoleEl.style.display = bottomSize > 1 ? `block` : `none`;
      },
    });
    splitTopBottom.collapse(1);
  }
}
customElements.define('repl-pad', ReplPadElement);