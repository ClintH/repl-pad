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
declare const fromInnerText: (dom: HTMLElement, baseUri?: string) => string;
/**
 * Returns a URI for source contained in a string
 * @param src
 * @param baseUri
 * @returns
 */
declare const fromText: (src: string, baseUri?: string) => string;
declare type Result = {
    el: HTMLElement;
    uri: string;
};
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
declare const fromQuery: (q: string, baseUri?: string) => ReadonlyArray<Result>;

export { Result, fromInnerText, fromQuery, fromText };
