export const css = `
    :host {
      --blue: hsl(212, 100%, 50%);
      --red: hsl(351, 100%, 50%);
      --font: Consolas, "Andale Mono WT", "Andale Mono", "Lucida Console", "Lucida Sans Typewriter", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Liberation Mono", "Nimbus Mono L", Monaco, "Courier New", Courier, monospace;
      --font-size: 1em;
      --fg: hsl(200, 16%, 42%);
      --fg-dim: hsl(200, 16%, 32%);
      --padding: 0.5em;
    }

    #container {
      font-size: var(--font-size);
      font-family: var(--font);
      display: flex;
      flex-direction: row;
      flex-grow: 1;
    }

    #left {
      display: flex;
      border-right: 3px solid var(--fg-dim);
    }
  
    #input {
      background-color: transparent;
      color: inherit;
      border: 0;
      font-family: var(--font);
      font-size: var(--font-size);
      width: 100%;
      height: 100%;
      margin: 0;
      padding: var(--padding);
    }
    #input:focus {
      outline: none;
    }

    #right {
      flex-grow: 1;
      color: var(--fg-dim, gray);
    }

    #output {
      white-space: nowrap;
      overflow: hidden;
      padding: var(--padding);
    }
    #output .error {
      color: var(--red, red);
    }
    #output .info {
      color: var(--blue, blue);
    }
    `