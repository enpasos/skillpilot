import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../../../../../app/node_modules/playwright/index.mjs'

// Narrow, explicitly authorized native replacement after two targeted Nano
// Banana reference edits left N(0)=100 at an incorrect y-axis position.
// This is a newly calculated diagram, not a pixel retouch of a rejected image.
const output = path.dirname(fileURLToPath(import.meta.url))
const population = t => 1000 / (1 + 9 * Math.exp(-0.6 * t))
const growth = t => 0.6 * population(t) * (1 - population(t) / 1000)
const inflectionTime = Math.log(9) / 0.6
const px = t => 110 + 74 * t
const py = n => 575 - 0.33 * n
const samples = Array.from({ length: 1001 }, (_, i) => i / 100)
const curve = samples.map((t, i) => `${i ? 'L' : 'M'}${px(t).toFixed(3)},${py(population(t)).toFixed(3)}`).join(' ')
if (population(0) !== 100 || Math.abs(population(inflectionTime) - 500) > 1e-10 || Math.abs(growth(inflectionTime) - 150) > 1e-10) throw new Error('Logistic controls failed')
const xTicks = [0, 2, 4, 6, 8, 10].map(t => `<path d="M${px(t)} 575v8" class="axis"/><text x="${px(t)}" y="609" text-anchor="middle" class="small">${t}</text>`).join('')
const yTicks = [0, 100, 250, 500, 750, 1000].map(n => `${n > 100 ? `<path d="M110 ${py(n)}H867" class="grid"/>` : ''}<path d="M102 ${py(n)}h8" class="axis"/><text x="92" y="${py(n) + 7}" text-anchor="end" class="small">${n}</text>`).join('')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="#334155" stroke-width="1.5"/></marker></defs>
<style>
text{font-family:"DejaVu Sans",sans-serif;fill:#17324d}.title{font-size:39px;font-weight:700}.heading{font-size:26px;font-weight:700}.body{font-size:24px}.small{font-size:22px}.formula{font-size:27px}.axis{fill:none;stroke:#334155;stroke-width:2}.grid{fill:none;stroke:#d9e4ed;stroke-width:1.3}.card{fill:white;stroke:#cadce9;stroke-width:2}
</style>
<rect width="1600" height="900" rx="24" fill="#f1f7fb"/>
<text x="48" y="62" class="title">Logistisches Wachstum untersuchen</text>
<text x="48" y="107" class="body">Ein Modell mit Anfangsbestand 100 und Tragfähigkeit 1000; t ≥ 0.</text>

<rect x="40" y="135" width="875" height="490" rx="20" class="card"/>
<text x="67" y="175" class="heading">Logistischer Verlauf auf linearen Achsen</text>
${yTicks}
<path d="M110 575H878" class="axis" marker-end="url(#arrow)"/>
<path d="M110 575V204" class="axis" marker-end="url(#arrow)"/>
${xTicks}
<text x="879" y="609" class="small">t</text><text x="61" y="207" class="small">N(t)</text>
<path d="M110 ${py(1000)}H867" fill="none" stroke="#c78123" stroke-dasharray="9 7" stroke-width="2.5"/>
<text x="577" y="231" class="small">Tragfähigkeit K = 1000</text>
<path d="M110 ${py(500)}H${px(inflectionTime)}V575" fill="none" stroke="#829aae" stroke-dasharray="6 6" stroke-width="1.8"/>
<path data-role="logistic-curve" d="${curve}" fill="none" stroke="#087eaf" stroke-width="4.5" stroke-linecap="round"/>
<circle data-role="initial-point" cx="${px(0)}" cy="${py(100)}" r="6" fill="#087eaf"/>
<path d="M117 ${py(100) + 3}L157 555" class="axis"/>
<text x="165" y="563" class="small">N(0) = 100</text>
<circle data-role="inflection-point" cx="${px(inflectionTime)}" cy="${py(500)}" r="7" fill="#d56831"/>
<path d="M${px(inflectionTime) + 8} ${py(500) + 3}L449 443" class="axis"/>
<text x="461" y="451" class="small">Wendepunkt W (3,66; 500)</text>

<rect x="940" y="135" width="620" height="490" rx="20" class="card"/>
<text x="966" y="175" class="heading">Modell und begründete Folgerungen</text>
<text x="971" y="246" class="formula">N(t) =</text>
<text x="1306" y="219" text-anchor="middle" class="formula">1000</text>
<path d="M1099 231H1510" class="axis"/>
<text x="1306" y="266" text-anchor="middle" class="formula">1 + 9 · e<tspan baseline-shift="super" font-size="20">−0,6t</tspan></text>
<text x="969" y="313" class="formula">N′ = 0,6 · N · (1 − N/1000)</text>
<text x="969" y="353" class="body">N(0) = 100; 0 &lt; N(t) &lt; 1000.</text>
<text x="969" y="391" class="body">Zuwachs proportional zu N und zum</text>
<text x="969" y="423" class="body">Abstand von der Tragfähigkeit.</text>
<text x="969" y="468" class="body">Wendepunkt: t = ln(9)/0,6 ≈ 3,66.</text>
<text x="969" y="505" class="body">Dort: N = 500 (= K/2).</text>
<text x="969" y="547" class="body">Maximaler absoluter Zuwachs:</text>
<text x="969" y="584" class="body">N′ = 150 pro Modellzeiteinheit.</text>

<rect x="40" y="650" width="485" height="205" rx="20" class="card"/>
<text x="64" y="691" class="heading">Exponentielles Wachstum</text>
<text x="64" y="731" class="body">E(t) = 100 · exp(0,6t)</text>
<text x="64" y="771" class="small">Zuwachs ∝ Bestand; keine obere Grenze.</text>
<text x="64" y="811" class="small">Immer steiler; kein Wendepunkt.</text>

<rect x="555" y="650" width="490" height="205" rx="20" class="card"/>
<text x="579" y="691" class="heading">Begrenztes Wachstum</text>
<text x="579" y="731" class="body">B(t) = 1000 − 900 · exp(−0,6t)</text>
<text x="579" y="771" class="small">Zuwachs ∝ verbleibender Abstand.</text>
<text x="579" y="811" class="small">Immer flacher; kein Wendepunkt.</text>

<rect x="1075" y="650" width="485" height="205" rx="20" class="card"/>
<text x="1099" y="691" class="heading">Logistisches Wachstum</text>
<text x="1099" y="731" class="body">L(t) = N(t) (oben)</text>
<text x="1099" y="771" class="small">Zuerst steiler, nach W flacher.</text>
<text x="1099" y="811" class="small">Annäherung an 1000; S-Verlauf.</text>
<text x="48" y="887" font-size="18">Modellannahmen prüfen: Ressourcen, Bestand und Zeitraum bestimmen, ob ein Wachstumsgesetz passt.</text>
</svg>`

const svgPath = path.join(output, 'df7338ef-fallback.svg')
const pngPath = path.join(output, 'df7338ef-fallback.png')
// A second run must not silently overwrite an already reviewed candidate.
fs.writeFileSync(svgPath, svg, { flag: 'wx' })
if (fs.existsSync(pngPath)) throw new Error('Refusing to overwrite an existing PNG')
const browser = await chromium.launch({ headless: true })
try {
  const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 })
  await page.setContent(svg)
  await page.evaluate(() => { document.body.style.margin = '0' })
  await page.evaluate(() => document.fonts.ready)
  const overflowingText = await page.locator('svg text').evaluateAll(nodes => nodes.flatMap(node => {
    const b = node.getBBox()
    return b.x < 0 || b.y < 0 || b.x + b.width > 1600 || b.y + b.height > 900 ? [node.textContent] : []
  }))
  if (overflowingText.length) throw new Error(`Text outside viewport: ${JSON.stringify(overflowingText)}`)
  await page.screenshot({ path: pngPath, clip: { x: 0, y: 0, width: 1600, height: 900 } })
} finally {
  await browser.close()
}
console.log(JSON.stringify({ svgPath, pngPath, sampleCount: samples.length, inflectionTime, controlPoints: [0, 1, 2, inflectionTime, 4, 6, 8, 10].map(t => ({ t, population: population(t), growth: growth(t), x: px(t), y: py(population(t)) })) }, null, 2))
