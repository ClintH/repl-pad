import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    index: `./src/index.ts`,
    link: `./src/link.ts`
  },
  dts: true,
  platform: `browser`,
  target: `es2020`,
  format: [
    `esm`
  ]
});