import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../../../../../app/node_modules/playwright/index.mjs'

// Deliberate narrow fallback after two independently inspected Nano Banana
// repair attempts failed at the actual derivative/graph correspondence.
// The path is sampled from the displayed function, not hand-shaped.
const output = path.dirname(fileURLToPath(import.meta.url))
const h = x => x * x * Math.exp(-x)
const ox = 110, oy = 680, sx = 65, sy = 550
const px = x => ox + sx * x
const py = y => oy - sy * y
const maximum = h(2)
const samples = Array.from({ length: 801 }, (_, i) => i / 100)
const curve = samples.map((x, i) => `${i ? 'L' : 'M'}${px(x).toFixed(3)},${py(h(x)).toFixed(3)}`).join(' ')
const xTicks = [0, 2, 4, 6, 8].map(x => `<path d="M${px(x)} 680v8" class="axis"/><text x="${px(x)}" y="714" text-anchor="middle" class="small">${x}</text>`).join('')
const yTicks = [0.2, 0.4, 0.6].map(y => `<path d="M110 ${py(y)}H650" class="grid"/><path d="M102 ${py(y)}h8" class="axis"/><text x="91" y="${py(y) + 7}" text-anchor="end" class="small">${String(y).replace('.', ',')}</text>`).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="#334155" stroke-width="1.5"/></marker></defs>
<style>
text{font-family:"DejaVu Sans",sans-serif;fill:#17324d} .title{font-size:38px;font-weight:700}.heading{font-size:27px;font-weight:700}.body{font-size:25px}.small{font-size:22px}.formula{font-size:30px}.axis{fill:none;stroke:#334155;stroke-width:2}.grid{fill:none;stroke:#d9e4ed;stroke-width:1.3}.hint{fill:#476175}.card{fill:white;stroke:#cadce9;stroke-width:2}
</style>
<rect width="1600" height="900" rx="24" fill="#f1f7fb"/>
<text x="48" y="66" class="title">Analysisgrundlagen gezielt verbinden</text>
<text x="48" y="112" class="body">Ein Beispiel für den Übergang von der E-Phase zu Q1</text>
<rect x="40" y="145" width="1510" height="81" rx="18" fill="#dfeff8"/>
<text x="67" y="194" class="formula">h(x) = x² · e⁻ˣ, x ≥ 0</text>
<text x="680" y="193" class="body">Darstellen → passende Regeln wählen → Verlauf begründen</text>

<rect x="40" y="255" width="690" height="597" rx="20" class="card"/>
<text x="66" y="304" class="heading">1 · Funktion und Graph zusammenbringen</text>
${yTicks}
<path d="M110 680H674M110 680V327" class="axis" marker-end="url(#arrow)"/>
${xTicks}
<text x="682" y="687" class="small">x</text><text x="68" y="332" class="small">h(x)</text>
<path d="M${px(2)} 680V${py(maximum)}H110" fill="none" stroke="#829aae" stroke-dasharray="6 6" stroke-width="1.8"/>
<path d="${curve}" fill="none" stroke="#087eaf" stroke-width="4.5" stroke-linecap="round"/>
<path d="M110 680H143" stroke="#16806b" stroke-width="5"/>
<path d="M${px(2) - 26} ${py(maximum)}H${px(2) + 26}" stroke="#16806b" stroke-width="4"/>
<circle cx="${px(2)}" cy="${py(maximum)}" r="6" fill="#df8b12"/>
<path d="M${px(2) + 8} ${py(maximum) - 3}L317 367" class="axis"/>
<text x="329" y="369" class="small">Maximum (2; 4/e²)</text>
<text x="69" y="762" class="small">Bei x = 0 und x = 2 ist die Tangente waagerecht.</text>
<text x="69" y="806" class="small">Für x &gt; 0 bleibt h(x) positiv; rechts nähert sich h(x) der 0.</text>

<rect x="765" y="255" width="785" height="298" rx="20" class="card"/>
<text x="793" y="305" class="heading">2 · Produktregel und Kettenregel begründen</text>
<text x="793" y="354" class="body">Faktoren: x² und e⁻ˣ. Innere Funktion: −x.</text>
<text x="793" y="405" class="formula">h′(x) = 2x · e⁻ˣ + x² · (−e⁻ˣ)</text>
<text x="793" y="451" class="formula">          = e⁻ˣ · x · (2 − x)</text>
<text x="793" y="505" class="small">Der Faktor −1 stammt aus der Ableitung der inneren Funktion.</text>

<rect x="765" y="579" width="785" height="273" rx="20" class="card"/>
<text x="793" y="629" class="heading">3 · Aus der Ableitung den Verlauf erklären</text>
<text x="793" y="675" class="body">e⁻ˣ &gt; 0: Das Vorzeichen von x · (2 − x) entscheidet.</text>
<text x="793" y="720" class="body">0 &lt; x &lt; 2: h′(x) &gt; 0  →  h steigt.</text>
<text x="793" y="761" class="body">x &gt; 2: h′(x) &lt; 0  →  h fällt.</text>
<text x="793" y="807" class="small">h′(0) = h′(2) = 0. Randpunkt: x = 0. Maximum: h(2) = 4/e².</text>
</svg>`

const svgPath = path.join(output, '2713980f-fallback.svg')
const pngPath = path.join(output, '2713980f-fallback.png')
fs.writeFileSync(svgPath, svg)
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  await page.setContent(svg)
  await page.evaluate(() => { document.body.style.margin = '0' })
  await page.evaluate(() => document.fonts.ready)
  await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1600, height: 900 } })
} finally {
  await browser.close()
}
console.log(JSON.stringify({ svgPath, pngPath, sampleCount: samples.length, controlPoints: [0, 0.5, 1, 2, 3, 4, 6, 8].map(x => ({ x, h: h(x) })) }, null, 2))
