export const between = (source: string, start: string, end?: string, lastEndMatch = true): string | undefined => {
  const startPos = source.indexOf(start);
  if (startPos < 0) return;

  if (end === undefined) end = start;

  const endPos = (lastEndMatch) ? source.lastIndexOf(end) : source.indexOf(end, startPos + 1);
  if (endPos < 0) return;

  return source.substring(startPos + 1, endPos);
};


export const unwrap = (source: string, ...wrappers: string[]): string => {
  let matched = false;
  do {
    matched = false;
    for (const w of wrappers) {
      if (source.startsWith(w) && source.endsWith(w)) {
        source = source.substring(w.length, source.length - (w.length * 2) + 1);
        matched = true;
      }
    }
  } while (matched);

  return source;
}

export type Range = {
  text: string
  start: number
  end: number
  index: number
}

export type LineSpan = {
  start: number
  end: number
  length: number
}
export const lineSpan = (ranges: Range[], start: number, end: number): LineSpan => {
  let s = -1;
  let e = -1;
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    s = i;
    if (r.text.length === 0) continue;
    if (start < r.end) {
      break;
    }
  }

  for (let i = s; i < ranges.length; i++) {
    const r = ranges[i];
    e = i;
    if (end === r.end) {
      e = i + 1;
      break;
    }
    if (end < r.end) {
      break;
    }
  }
  return {length: e - s, start: s, end: e};
}

export const splitRanges = (source: string, split: string) => {
  let start = 0;
  let text = ``;
  const ranges: Range[] = [];
  let index = 0;
  for (let i = 0; i < source.length; i++) {
    if (source.indexOf(split, i) === i) {
      //i += split.length - 1;
      let end = i;
      ranges.push({
        text, start, end, index
      });
      start = end + 1;
      text = ``;
      index++;
    } else {
      text += source.charAt(i);
    }
  }
  if (start < source.length) {
    ranges.push({text, start, index, end: source.length});
  }
  return ranges;
}

export const countCharsFromStart = (source: string, ...chars: string[]): number => {
  let counted = 0;
  for (let i = 0; i < source.length; i++) {
    if (chars.includes(source.charAt(i))) {
      counted++;
    } else {
      break;
    }
  }
  return counted;
}

/**
 * Returns _true_ if `source` starts and ends with `start` and `end`. Case-sensitive.
 * If _end_ is omitted, the the `start` value will be used.
 * 
 * ```js
 * startsEnds(`This is a string`, `This`, `string`); // True
 * startsEnds(`This is a string`, `is`, `a`); // False
 * starsEnds(`test`, `t`); // True, starts and ends with 't'
 * ```
 * @param source String to search within 
 * @param start Start
 * @param end End (if omitted, start will be looked for at end as well)
 * @returns True if source starts and ends with provided values.
 */
export const startsEnds = (source: string, start: string, end: string = start): boolean => source.startsWith(start) && source.endsWith(end);
