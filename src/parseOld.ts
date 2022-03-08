
/**
 * Simple tokeniser
 * TODO: Use a proper parser like typescript or recast
 * https://astexplorer.net/
 * @param l Text
 * @returns 
 */
const statementBreaker = (l: string): string[] => {
  let blocks = [];
  let parenth = 0;
  let curlies = 0;
  let square = 0;
  let mark = 0;

  let backticked = false;
  let singleQuote = false;
  let doubleQuote = false;

  for (let i = 0; i < l.length; i++) {
    const c = l.charAt(i);
    const prevC = i > 0 ? l.charAt(i - 1) : ``;

    if (c === '`') {
      backticked = !backticked;
    } else if (backticked) continue;

    if (c === "'" && prevC !== "\\") {
      singleQuote = !singleQuote;
    } else if (singleQuote) continue;

    if (c === '"' && prevC !== "\\") {
      doubleQuote = !doubleQuote;
    } else if (doubleQuote) continue;

    if (c === `[`) square++;
    else if (c === '{') curlies++;
    else if (c === '(') parenth++;
    else if (c === ']') square--;
    else if (c === '}') curlies--;
    else if (c === ')') parenth--;
    else if (c === '\n' || c === '\r' || c === `;`) {
      // New line
      if (parenth || curlies || square) {
        // Ignore, because we're inside a region
      } else {
        // End of line
        blocks.push(l.substring(mark, i));
        mark = i + 1;
      }
    }
  }
  blocks.push(l.substring(mark, l.length));
  return blocks;
}