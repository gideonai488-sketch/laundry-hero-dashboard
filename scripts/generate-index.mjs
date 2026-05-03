/**
 * Post-build script: creates dist/client/index.html for Capacitor.
 * Reads the Vite manifest to find the real entry JS and CSS filenames,
 * and injects a minimal window.$_TSR stub so TanStack Start can boot
 * in CSR mode (no SSR server to inject dehydrated state).
 */
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from "fs";
import { join } from "path";

const clientDir = "dist/client";
const manifestPath = join(clientDir, ".vite", "manifest.json");
const assetsDir = join(clientDir, "assets");

let entryJs = null;
const cssFiles = [];

if (existsSync(manifestPath)) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  for (const [, chunk] of Object.entries(manifest)) {
    if (chunk.isEntry && chunk.file) {
      entryJs = chunk.file;
      if (chunk.css) cssFiles.push(...chunk.css);
    }
    // Collect top-level CSS entries (styles.css is its own manifest entry)
    if (chunk.file && chunk.file.endsWith(".css") && chunk.src) {
      if (!cssFiles.includes(chunk.file)) cssFiles.push(chunk.file);
    }
  }
  console.log("Found entry via manifest:", entryJs);
  console.log("CSS files:", cssFiles);
} else {
  console.log("No manifest found, falling back to glob detection.");
}

// Fallback: glob the assets directory
if (!entryJs && existsSync(assetsDir)) {
  const files = readdirSync(assetsDir);
  const jsFiles = files.filter((f) => f.startsWith("index") && f.endsWith(".js"));
  // Pick the smallest index-*.js — that's typically the bootstrap/entry
  jsFiles.sort((a, b) => {
    const sA = statSync(join(assetsDir, a)).size;
    const sB = statSync(join(assetsDir, b)).size;
    return sA - sB;
  });
  if (jsFiles.length) entryJs = `assets/${jsFiles[0]}`;

  const cssEntries = files.filter((f) => f.endsWith(".css"));
  cssFiles.push(...cssEntries.map((f) => `assets/${f}`));
  console.log("Detected entry via glob:", entryJs);
}

if (!entryJs) {
  console.error("Could not detect entry JS file. Aborting index.html generation.");
  process.exit(1);
}

const cssLinks = cssFiles
  .map((f) => `  <link rel="stylesheet" crossorigin href="/${f}">`)
  .join("\n");

/**
 * TanStack Start's client bundle calls `window.$_TSR || en()` where en()
 * throws "Invariant failed". Without a server injecting the SSR dehydrated
 * state, this crashes silently and leaves the app blank.
 *
 * Injecting a minimal stub lets the client detect there is no dehydrated
 * state and fall through to a fresh CSR render instead.
 */
const tsrStub = `
  <script>
    window.$_TSR = {
      initialized: false,
      buffer: [],
      t: new Map(),
      h: function() {},
      router: {
        matches: [],
        lastMatchId: null,
        manifest: null,
        dehydratedData: null,
        ssr: null
      }
    };
  </script>`;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#0ea5e9" />
    <title>Highest Wash</title>
${cssLinks}
${tsrStub}
  </head>
  <body>
    <div id="root"></div>
    <script type="module" crossorigin src="/${entryJs}"></script>
  </body>
</html>
`;

writeFileSync(join(clientDir, "index.html"), html);
console.log(`✅ Generated ${clientDir}/index.html (entry: ${entryJs})`);
