export type MessageTypes = `log` | `info` | `warn` | `error` | `debug` | `dir` | `table` | `trace`;

export type ConsoleListener = {
  log(type: MessageTypes, ...data: any[]): void
  clear(): void
}
/**
 * Returns a {@link ConsoleListener} that appends to a provided HTMLElement
 * @param el Element to append to
 * @returns ConsoleListener instance
 */
export const appendToElement = (el: HTMLElement): ConsoleListener => {
  if (el === null) throw new Error(`el param is null`);
  if (el === undefined) throw new Error(`el param is undefined`);
  el.classList.add(`empty`);

  const log = (type: MessageTypes, ...data: any[]) => {
    const stringify = (v: any): string => {
      if (v === null) return `(null)`;
      if (v === undefined) return `(undef.)`;
      if (typeof v === `string`) return v;
      if (typeof v === `object`) {
        let t = `{<br />`;
        for (const [key, value] of Object.entries(v)) {
          t += "&nbsp;" + key + ": " + value + ';<br />';
        }
        t += `}`;
        return t;
      }
      return v.toString();
    };
    const msg = data.reduce((prev, d) => stringify(d), ``);

    el.innerHTML += `<div tabindex=0 class="log-${type}">${msg}</div>`;
    el.scrollTop = el.scrollHeight;
    if (el.classList.contains(`empty`)) {
      el.classList.remove(`empty`);
      el.dispatchEvent(new Event(`non-empty`));

    }
  };

  const clear = () => {
    el.innerHTML = ``;
    el.classList.add(`empty`);
    el.dispatchEvent(new Event(`empty`));
  }

  return {log, clear};
}

export class ConsoleIntercept implements Console {
  orig: Console;
  listeners: ConsoleListener[];

  constructor() {
    this.orig = console;
    this.listeners = [];
    // @ts-ignore
    window.consoleOrig = this.orig;
    window.console = this;
  }

  private addListener(cl: ConsoleListener) {
    this.listeners.push(cl);
  }

  dispose() {
    window.console = this.orig;
    this.listeners = [];
  }

  static init(listener: ConsoleListener): ConsoleIntercept {
    let cl: ConsoleIntercept;
    if (`onMessage` in console) {
      // Assume it is an instance
      cl = (console as any) as ConsoleIntercept;
    } else {
      cl = new ConsoleIntercept();
    }
    cl.addListener(listener);
    return cl;
  }

  onMessage(type: MessageTypes, ...data: any[]) {
    try {
      this.listeners.forEach(l => {
        l.log(type, ...data);
      })
    } catch (ex) {
      this.orig.error(ex);
    }
  }

  logRaw(...data: any[]): void {
    this.orig.log(...data);
  }

  assert(condition?: boolean, ...data: any[]): void {
    this.orig.assert(condition, ...data);
  }

  clear(): void {
    try {
      this.listeners.forEach(l => {
        l.clear();
      })
    } catch (ex) {
      this.orig.error(ex);
    }
    this.orig.clear();
  }

  count(label?: string): void {
    this.orig.count(label);
  }

  countReset(label?: string): void {
    this.orig.countReset(label);
  }

  debug(...data: any[]): void {
    this.orig.debug(...data);
    this.onMessage(`debug`, ...data);
  }

  dir(item?: any, options?: any): void {
    this.orig.dir(item, options);
    this.onMessage(`dir`, item);
  }
  dirxml(...data: any[]): void {
    this.orig.dirxml(...data);
    this.onMessage(`dir`, ...data);
  }

  error(...data: any[]): void {
    this.orig.error(...data);
    this.onMessage(`error`, ...data);
  }

  group(...data: any[]): void {
    this.orig.group(...data);
  }

  groupCollapsed(...data: any[]): void {
    this.orig.groupCollapsed(...data);
  }

  groupEnd(): void {
    this.orig.groupEnd();
  }

  info(...data: any[]): void {
    this.orig.info(...data);
    this.onMessage(`info`, ...data);
  }
  log(...data: any[]): void {
    this.orig.log(...data);
    this.onMessage(`log`, ...data);
  }

  table(tabularData?: any, properties?: string[]): void {
    this.orig.table(tabularData, properties);
    this.onMessage(`table`, tabularData);
  }

  time(label?: string): void {
    this.orig.time(label);
  }
  timeEnd(label?: string): void {
    this.orig.timeEnd(label);
  }
  timeLog(label?: string, ...data: any[]): void {
    this.orig.timeLog(label, ...data);
  }
  timeStamp(label?: string): void {
    this.orig.timeStamp(label);

  }
  trace(...data: any[]): void {
    this.orig.trace(...data);
    this.onMessage(`trace`, ...data);
  }

  warn(...data: any[]): void {
    this.orig.warn(...data);
    this.onMessage(`warn`, ...data);
  }
}