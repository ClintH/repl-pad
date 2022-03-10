import {
  countCharsFromStart
} from "./chunk-RPFPAI5T.js";

// src/link.ts
var fromInnerText = (dom, baseUri = "") => {
  if (dom === null)
    throw new Error(`dom parameter is null`);
  if (dom === void 0)
    throw new Error(`dom parameter is undefined`);
  let src = dom.innerText;
  return fromText(src, baseUri);
};
var fromText = (src, baseUri = "") => {
  let lines = src.split("\n");
  let spacing = Number.MAX_SAFE_INTEGER;
  lines.forEach((l) => {
    if (l.trim().length == 0)
      return;
    spacing = Math.min(spacing, countCharsFromStart(l, ` `));
  });
  src = lines.map((l) => l.substring(spacing)).join("\n");
  if (!baseUri.endsWith(`#`))
    baseUri += `#`;
  return baseUri + btoa(src);
};
var fromQuery = (q, baseUri = "") => {
  const els = document.querySelectorAll(q);
  const results = [];
  for (const el of els) {
    const uri = fromInnerText(el, baseUri);
    results.push({ el, uri });
  }
  return results;
};
export {
  fromInnerText,
  fromQuery,
  fromText
};
