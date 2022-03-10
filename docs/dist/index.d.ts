declare type ReplOptions = {
    reevalConsole: boolean;
    reevalUndef: boolean;
    wrapAsync: boolean;
};

declare class ReplPadElement extends HTMLElement {
    code: string;
    outputEl: HTMLElement | undefined;
    textEl: HTMLTextAreaElement | undefined;
    codeEditDebounceMs: number;
    replOptions: ReplOptions;
    constructor(code?: string);
    private codeChange;
    focus(): void;
    render(): void;
}

export { ReplPadElement };
