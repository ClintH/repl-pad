export const css = `
    :host {
      // --blue: hsl(212, 100%, 50%);
      // --red: hsl(351, 100%, 50%);
      --ui-font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      --mono-font: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;);
      --font-size: 1em;
      // --fg: hsl(200, 16%, 42%);
      // --fg-dim: hsl(200, 16%, 32%);
      --padding: 0.5em;
      --output: yellow;
      --ui-pinstripe: whitesmoke;
      --ui-highlight-bg: yellow;
      --ui-highlight-fg: black;
      --line-height: 1.4em;
      --console-bg: black;
      --console-fg: white;
      --console-error: red;
      --console-warn: yellow;
      box-sizing: border-box;
    }

    #container {
      font-size: var(--font-size);
      font-family: var(--mono-font);
      line-height: var(--line-height);
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    ::selection {
      background: var(--ui-highlight-bg);
      color: var(--ui-highlight-fg);
    }

    #top {
      display: flex;
      flex-direction: row;
    }

    #bottom {
      overflow: hidden;
      display: flex;
      flex-direction: column;
      font-size: 0.8em;
      line-height: 1.4em;
    }

    #console {
      flex-grow: 1;
      overflow-y: auto;
      // display:none;
      box-sizing: border-box;
      background-color: var(--console-bg);
      color: var(--console-fg);
    }

    #console>div {
      outline: 1px solid var(--ui-pinstripe);
      padding: 0.4em;
      opacity: 0.7;
    }


    #console>div.log-info {
      color: var(--console-info);
    }

    #console>div.log-warn {
      color: var(--console-warn);
    }

    #console>div.log-error {
      color: var(--console-error);
      outline: 1px solid var(--console-error);
    }
    
    #console>div:hover {
      background-color: var(--fg-dim);
      opacity: 0.9;
    }

    #console>div:focus {
      outline:1px solid var(--ui-highlight-bg);
      opacity: 1;
     }

    #left {
      display: flex;
    }
  
    #input {
      background-color: transparent;
      color: inherit;
      border: 0;
      font-family: var(--font-family);
      font-size: var(--font-size);
      line-height: var(--line-height);
      width: 100%;
      height: 100%;
      margin: 0;
      padding: var(--padding);
      resize: none;
    }

    #input:focus {
      outline: none;
    }

    #right {
      flex-grow: 1;
      color: var(--output, gray);
    }

    #toolbar {
      font-family: var(--ui-font);
      display: flex;
      justify-content: flex-end;
      background-color: var(--ui-bg);
      color: var(--ui-fg);
    }

    #output {
      white-space: nowrap;
      overflow: hidden;
      padding: var(--padding);
    }
    #output .error {
      color: var(--console-error, red);
    }
    
    #output .info {
      font-style: italic;
    }

    .gutter {
      background-color: var(--ui-pinstripe);
      background-repeat: no-repeat;
      background-position: 50%;
    }
    .gutter.gutter-vertical {
      cursor: ns-resize;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFAQMAAABo7865AAAABlBMVEVHcEzMzMzyAv2sAAAAAXRSTlMAQObYZgAAABBJREFUeF5jOAMEEAIEEFwAn3kMwcB6I2AAAAAASUVORK5CYII=');
    }
    .gutter.gutter-horizontal {
      cursor: ew-resize;
      background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==');
    }
    `