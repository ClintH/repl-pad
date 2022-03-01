# repl-pad

Repl-pad takes some Javascript and presents it in an editable REPL-like environment. It is meant for trying out simple function calls and seeing the result.

_diag__

Repl-pad gives the illusion that each line of code is executed independently, with the result shown to the side. But in reality, each line is executed along with every line that precedes it.

_diag_

URL-based imports can be used as well:

_diag_

# Usage

Repl-pad is a vanilla web component. It can be used programatically, but it was meant to be hosted in a stand-alone simple HTML page. Code source comes in, base64-encoded via a URI anchor:

```
pad.html#ugly-base-64-string
```

A small helper function allows you to generate this URL automatically, from the basis of a HTML element's innerText. This is meant to convert a static code example into something runnable.

In your HTML:

```html
<pre id="eg1">
const x = 1;
</pre>
```

In your JS:

```js
import {fromInnerText} from '@clinth/repl-pad';
const el = document.getElementById(`eg1`);

// Yields: pad.html#...
const uri = fromInnerText(el, `pad.html`);

// Create an edit link and add after example
const link = document.createElement(`a`);
link.href = uri;
link.innerText = `Edit`;
el.parentNode.insertBefore(link, el.nextSibling);
```

One can add edit links for all elements that match a query.

Eg, you have HTML with:

```html
<pre>
  const x = 1;
</pre>

<pre>
  const x = Math.random();
</pre>
```

And then in JS:

```js
import {fromQuery} from '@clinth/repl-pad/link.js';
const r = fromQuery(`pre`, `pad.html`);

for (const {el, uri} of r) {
  const link = document.createElement(`a`);
  link.href = uri;
  link.innerText = `Edit`;
  el.parentNode.insertBefore(link, el.nextSibling);
}
```

## Programmatic

It's also possible to send JS code programmatically:

```
const r = new ReplPad(`
  const x = 1;
  x;
`);
```

## Notes

repl-pad is basic, breaking up provided code in a naive way. It can handle multi-line functions, arrow syntax and so on, but it's not too savvy. It should be using a proper parsing library.

It could also use a pretty-printer, or a component like Monaco or ProseMirror.

