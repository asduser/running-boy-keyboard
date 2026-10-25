## Demo

<a href="http://asduser.github.io/running-boy-keyboard/main/src/index.html" target="_blank"><b>Open demo page.</b></a> 

## Description

<img src="assets/images/screenRB.png?raw=true" alt="running boy keyboard" />

## Local development

Requires Node.js 24+.

```bash
npm install
```

TypeScript sources live in `main/src/ts/`. `tsc` only type-checks (`noEmit`), the JS is produced by esbuild, which bundles `main/src/ts/app.ts` into `main/src/app.js` (loaded by `main/src/index.html`).

Build once:

```bash
npm run build
```

Or rebuild automatically on every change:

```bash
npm run watch
```

Then open `main/src/index.html` in the browser (or serve the folder, e.g. `npx serve main/src`) and reload the page after each build.

Other scripts:

```bash
npm run check   # type-check with tsc
npm run lint    # eslint
npm test        # jest
```
