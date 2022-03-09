var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined")
    return require.apply(this, arguments);
  throw new Error('Dynamic require of "' + x + '" is not supported');
});
var __commonJS = (cb, mod) => function __require2() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __reExport = (target, module, copyDefault, desc) => {
  if (module && typeof module === "object" || typeof module === "function") {
    for (let key of __getOwnPropNames(module))
      if (!__hasOwnProp.call(target, key) && (copyDefault || key !== "default"))
        __defProp(target, key, { get: () => module[key], enumerable: !(desc = __getOwnPropDesc(module, key)) || desc.enumerable });
  }
  return target;
};
var __toESM = (module, isNodeMode) => {
  return __reExport(__markAsModule(__defProp(module != null ? __create(__getProtoOf(module)) : {}, "default", !isNodeMode && module && module.__esModule ? { get: () => module.default, enumerable: true } : { value: module, enumerable: true })), module);
};

// src/text.ts
var unwrap = (source, ...wrappers) => {
  let matched = false;
  do {
    matched = false;
    for (const w of wrappers) {
      if (source.startsWith(w) && source.endsWith(w)) {
        source = source.substring(w.length, source.length - w.length * 2 + 1);
        matched = true;
      }
    }
  } while (matched);
  return source;
};
var lineSpan = (ranges, start, end) => {
  let s = -1;
  let e = -1;
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    s = i;
    if (r.text.length === 0)
      continue;
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
  return { length: e - s, start: s, end: e };
};
var splitRanges = (source, split) => {
  let start = 0;
  let text = ``;
  const ranges = [];
  let index = 0;
  for (let i = 0; i < source.length; i++) {
    if (source.indexOf(split, i) === i) {
      let end = i;
      ranges.push({
        text,
        start,
        end,
        index
      });
      start = end + 1;
      text = ``;
      index++;
    } else {
      text += source.charAt(i);
    }
  }
  if (start < source.length) {
    ranges.push({ text, start, index, end: source.length });
  }
  return ranges;
};
var countCharsFromStart = (source, ...chars) => {
  let counted = 0;
  for (let i = 0; i < source.length; i++) {
    if (chars.includes(source.charAt(i))) {
      counted++;
    } else {
      break;
    }
  }
  return counted;
};

export {
  __require,
  __commonJS,
  __toESM,
  unwrap,
  lineSpan,
  splitRanges,
  countCharsFromStart
};
//# sourceMappingURL=chunk-5MYXZ2DM.js.map