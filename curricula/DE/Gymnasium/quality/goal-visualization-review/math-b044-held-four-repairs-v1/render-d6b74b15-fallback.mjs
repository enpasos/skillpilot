import fs from 'node:fs'
import path from 'node:path'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import { chromium } from '../../../../../../app/node_modules/playwright/index.mjs'

// Narrow, root-authorized new construction after three actually inspected
// Nano candidates failed the geometric ratio. No retouch of a rejected raster.
const output = path.dirname(fileURLToPath(import.meta.url))
const unit = 60
const B = { x: 270, y: 680 }
const A = { x: B.x, y: B.y - 4 * unit }
const C = { x: B.x + 3 * unit, y: B.y }
const Ap = { x: B.x, y: B.y - 8 * unit }
const Cp = { x: B.x + 6 * unit, y: B.y }
const length = (p, q) => Math.hypot(p.x - q.x, p.y - q.y) / unit
const triangleArea = (p, q, r) => Math.abs((q.x-p.x)*(r.y-p.y)-(r.x-p.x)*(q.y-p.y)) / (2 * unit ** 2)
assert.equal(length(B,A),4)
assert.equal(length(B,C),3)
assert.equal(length(A,C),5)
assert.equal(length(B,Ap),8)
assert.equal(length(B,Cp),6)
assert.equal(length(Ap,Cp),10)
assert.equal((Cp.x-B.x)/(B.y-Ap.y),3/4)
assert.equal((C.x-B.x)/(B.y-A.y),3/4)
assert.equal((Cp.x-B.x)/(C.x-B.x),2)
assert.equal((B.y-Ap.y)/(B.y-A.y),2)
assert.equal(triangleArea(A,B,C),6)
assert.equal(triangleArea(Ap,B,Cp),24)
const slope = (p,q) => (q.y-p.y)/(q.x-p.x)
assert.equal(slope(A,C),slope(Ap,Cp))
const angle = Math.atan2(C.y-A.y,C.x-A.x)*180/Math.PI
const points = p => p.map(q=>q.x+','+q.y).join(' ')
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto-start-reverse"><path d="M0 0L8 4L0 8Z" fill="#334155"/></marker></defs>
<style>text{font-family:"DejaVu Sans",sans-serif;fill:#17324d}.title{font-size:40px;font-weight:700}.body{font-size:25px}.formula{font-size:30px}.small{font-size:21px}.vertex{font-size:28px;font-weight:700}.edge{stroke:#17324d;stroke-width:4;stroke-linejoin:round}.dim{fill:none;stroke:#334155;stroke-width:2}.card{fill:white;stroke:#cbdde7;stroke-width:2}</style>
<rect width="1600" height="900" rx="24" fill="#f1f7fb"/>
<text x="48" y="66" class="title">Ähnlichkeit: Längen und Flächen</text>
<text x="48" y="110" class="body">Alle entsprechenden Seiten wachsen mit demselben Faktor.</text>
<rect x="40" y="145" width="755" height="690" rx="20" class="card"/>
<rect x="820" y="145" width="740" height="690" rx="20" class="card"/>
<polygon data-role="large-triangle" points="${points([Ap,B,Cp])}" fill="#ffe0af" class="edge"/>
<polygon data-role="small-triangle" points="${points([A,B,C])}" fill="#98cbee" class="edge"/>
<path d="M270 650H300V680" class="dim"/>
<text x="270" y="184" text-anchor="middle" class="vertex">A′</text>
<text x="252" y="440" text-anchor="end" class="vertex">A</text>
<text x="252" y="711" text-anchor="end" class="vertex">B = B′</text>
<text x="450" y="713" text-anchor="middle" class="vertex">C</text>
<text x="650" y="689" class="vertex">C′</text>

<path d="M174 200H254M174 680H254M185 200V680" class="dim" marker-end="url(#arrow)"/>
<path d="M185 680V200" class="dim" marker-end="url(#arrow)"/>
<text x="165" y="452" text-anchor="end" class="body">8 cm</text>
<text x="287" y="573" class="body">4 cm</text>
<text x="360" y="715" text-anchor="middle" class="body">3 cm</text>
<path d="M270 747V793M630 700V793M270 780H630" class="dim" marker-end="url(#arrow)"/>
<path d="M630 780H270" class="dim" marker-end="url(#arrow)"/>
<text x="450" y="815" text-anchor="middle" class="body">6 cm</text>
<text x="376" y="548" transform="rotate(${angle} 376 548)" text-anchor="middle" class="body">5 cm</text>
<text x="472" y="425" transform="rotate(${angle} 472 425)" text-anchor="middle" class="body">10 cm</text>

<text x="850" y="194" class="body">A und C halbieren die großen Katheten.</text>
<text x="850" y="251" class="formula">6/3 = 8/4 = 10/5 = 2</text>
<text x="850" y="306" class="formula">Streckfaktor k = 2</text>
<text x="850" y="376" class="body">Jede Seite wird doppelt so lang.</text>
<text x="850" y="450" class="formula">A<tspan baseline-shift="sub" font-size="19">klein</tspan> = ½ · 3 · 4 = 6 cm²</text>
<text x="850" y="510" class="formula">A<tspan baseline-shift="sub" font-size="19">groß</tspan> = ½ · 6 · 8 = 24 cm²</text>
<text x="850" y="585" class="formula">24/6 = 4 = 2²</text>
<text x="850" y="657" class="body">Längenfaktor 2 → Flächenfaktor 4</text>
<text x="850" y="731" class="small">Klein: blaue Fläche.</text>
<text x="850" y="771" class="small">Groß: gesamte blaue und orange Fläche.</text>
<text x="48" y="877" class="small">Die maßstäblichen Dreiecke haben einen gemeinsamen rechten Winkel bei B = B′.</text>
</svg>`
const svgPath=path.join(output,'d6b74b15-fallback.svg')
const pngPath=path.join(output,'d6b74b15-fallback.png')
fs.writeFileSync(svgPath,svg,{flag:'wx'})
assert.ok(!fs.existsSync(pngPath),'Do not overwrite an inspected candidate PNG')
const browser=await chromium.launch({headless:true})
let textBounds
try{
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1})
 await page.setContent(svg)
 await page.evaluate(()=>{document.body.style.margin='0'})
 await page.evaluate(()=>document.fonts.ready)
 textBounds=await page.locator('svg text').evaluateAll(nodes=>nodes.map(node=>{const b=node.getBBox();return{text:node.textContent,x:b.x,y:b.y,width:b.width,height:b.height}}))
 assert.ok(textBounds.every(b=>b.x>=0&&b.y>=0&&b.x+b.width<=1600&&b.y+b.height<=900),'Text outside image')
 await page.screenshot({path:pngPath,clip:{x:0,y:0,width:1600,height:900}})
}finally{await browser.close()}
console.log(JSON.stringify({svgPath,pngPath,unitPixelsPerCm:unit,points:{A,B,C,Ap,Cp},lengths:{AB:length(A,B),BC:length(B,C),AC:length(A,C),ApB:length(Ap,B),BCp:length(B,Cp),ApCp:length(Ap,Cp)},areas:{small:triangleArea(A,B,C),large:triangleArea(Ap,B,Cp)},sameSlope:slope(A,C),textBounds},null,2))
