export type DebouncedFunction = (...args: readonly unknown[]) => void

export const debounce = (callback: () => void | Promise<unknown>, timeoutMs: number): DebouncedFunction => {
  const t = timeout(callback, timeoutMs);
  return (...args: unknown[]) => t.start(undefined, args);
};

export type HasCompletion = {
  get isDone(): boolean;
}

export type TimeoutSyncCallback = (elapsedMs?: number, ...args: readonly unknown[]) => void
export type TimeoutAsyncCallback = (elapsedMs?: number, ...args: readonly unknown[]) => Promise<void>


export type Timeout = HasCompletion & {
  start(altTimeoutMs?: number, args?: readonly unknown[]): void;
  cancel(): void;
  get isDone(): boolean;
}

export const timeout = (callback: TimeoutSyncCallback | TimeoutAsyncCallback, timeoutMs: number): Timeout => {
  if (callback === undefined) throw new Error(`callback parameter is undefined`);

  //eslint-disable-next-line functional/no-let
  let timer = 0;
  //eslint-disable-next-line functional/no-let
  let startedAt = 0;
  const start = async (altTimeoutMs: number = timeoutMs, ...args: unknown[]): Promise<void> => {
    const p = new Promise<void>((resolve, reject) => {
      startedAt = performance.now();
      if (timer !== 0) cancel();
      timer = window.setTimeout(async () => {
        await callback(performance.now() - startedAt, ...args);
        timer = 0;
        resolve(undefined);
      }, altTimeoutMs);
    });
    return p;
  };

  const cancel = () => {
    if (timer === 0) return;
    startedAt = 0;
    window.clearTimeout(timer);
  };

  return {
    start,
    cancel,
    get isDone() {
      return timer !== 0;
    },
  };
};