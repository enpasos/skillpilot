import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

// Runs after the ordinary production build in CI. The browser test checks cold
// module requests; this also catches eager downloads caused by SW installation.
// This is the ordinary output directory configured by app/vite.config.ts.
const dist = fileURLToPath(new URL('../../backend/src/main/resources/static/', import.meta.url))
const files = await readdir(`${dist}/assets`)
const mapJs = files.filter(file => /^LearnerGoalNavigationMap-[\w-]+\.js$/u.test(file))
const mapCss = files.filter(file => /^LearnerGoalNavigationMap-[\w-]+\.css$/u.test(file))
const workerJs = files.filter(file => /^elk-worker(?:\.min)?-[\w-]+\.js$/u.test(file))
assert.equal(mapJs.length, 1, 'native map must have one separate lazy JavaScript entry')
assert(mapCss.length > 0, 'native map styles must remain in the lazy entry')
assert(workerJs.length > 0, 'the native map must emit its local ELK worker')
const sw = await readFile(`${dist}/sw.js`, 'utf8')
const mapAssets = files.filter(file => /^(?:LearnerGoalNavigationMap-|elk-worker)/u.test(file))
for (const file of mapAssets) assert(!sw.includes(`assets/${file}`), `${file} must not enter the service-worker precache`)
console.log(`Native map build isolation passed: ${mapAssets.length} lazy map/ELK assets outside the shell precache.`)
