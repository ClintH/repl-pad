import {countCharsFromStart} from './text';

/**
 * Returns a URI for source contained in an element's innerText
 * 
 * ```js
 * const uri = fromInnerText(document.getELementById(`someEl`), `pad.html`);
 * // Yields: pad.html#...
 * ```
 * 
 * @param dom Dom element
 * @param baseUri Base uri to prefix
 * @returns String
 */
export const fromInnerText = (dom: HTMLElement, baseUri: string = ''): string => {
  if (dom === null) throw new Error(`dom parameter is null`);
  if (dom === undefined) throw new Error(`dom parameter is undefined`);
  let src = dom.innerText;

  // Check for consistent indents
  let lines = src.split('\n');
  let spacing = Number.MAX_SAFE_INTEGER;

  lines.forEach(l => {
    if (l.trim().length == 0) return;
    spacing = Math.min(spacing, countCharsFromStart(l, ` `));
  });

  src = lines.map(l => l.substring(spacing)).join('\n');

  if (!baseUri.endsWith(`#`)) baseUri += `#`;
  return baseUri + btoa(src);
}

export type Result = {el: HTMLElement, uri: string};

/**
 * Returns an array of [element,string] pairs, from the basis of a DOM query.
 * 
 * ```js
 * // Generate URIs for every PRE on the page
 * const r = fromQuery(`pre`, `pad.html`);
 * 
 * for (const pair in r) {
 *  pair[0].append(pair[1]);
 * }
 * ```
 * @param q 
 * @param baseUri 
 * @returns 
 */
export const fromQuery = (q: string, baseUri: string = ''): ReadonlyArray<Result> => {
  const els = document.querySelectorAll(q);
  const results: Result[] = [];
  for (const el of els) {
    const uri = fromInnerText(el as HTMLElement, baseUri);
    results.push({el: el as HTMLElement, uri});
  }
  return results;
}
