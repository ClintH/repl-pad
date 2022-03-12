import {LineSpan} from "./text"

export type Import = {
  module: string
  named: boolean
}

export type ImportResults = {
  resolved: any;
  errors: string
}
export type BlockKind = `run` | `import` | `skip`;

export type ExecutionBlock = {
  statement: string
  span: LineSpan
  cumulative: boolean
  wrapAsync: boolean
  kind: BlockKind
  imports?: Map<string, Import>;
}

export type ExecutionState = `` | `error` | `info`;
export type ExecutionResult = {
  msg: string
  state: ExecutionState
  keep: boolean
  details: string
}

export type ParseResult = {
  blocks: ExecutionBlock[]
}

export type ReplOptions = {
  reevalConsole: boolean
  reevalUndef: boolean
  wrapAsync: boolean
}
