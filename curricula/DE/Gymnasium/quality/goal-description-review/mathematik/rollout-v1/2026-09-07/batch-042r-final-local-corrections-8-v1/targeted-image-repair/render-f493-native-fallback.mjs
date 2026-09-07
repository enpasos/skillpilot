import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
const require = createRequire(path.join(process.cwd(), 'app/package.json'))
const { chromium } = require('playwright')
const output=path.dirname(fileURLToPath(import.meta.url))
const px=x=>110+650*x, py=y=>735-80*y, f=x=>1/Math.sqrt(x)
const minX=1/36
const samples=Array.from({length:2001},(_,i)=>minX+(1-minX)*i/2000)
const curve=samples.map((x,i)=>`${i?'L':'M'}${px(x).toFixed(4)},${py(f(x)).toFixed(4)}`).join(' ')
const shade=`M110,735L110,255L${px(minX).toFixed(4)},255 ${curve.replace(/^M/,'L')}L760,735Z`
const xticks=[0,.25,.5,.75,1].map(x=>`<path d="M${px(x)} 255V735" class="grid"/><path d="M${px(x)} 735v8" class="axis"/><text x="${px(x)}" y="771" text-anchor="middle" class="small">${String(x).replace('.',',')}</text>`).join('')
const yticks=[1,2,3,4,5,6].map(y=>`<path d="M110 ${py(y)}H760" class="grid"/><path d="M102 ${py(y)}h8" class="axis"/><text x="91" y="${py(y)+7}" text-anchor="end" class="small">${y}</text>`).join('')
const controls=[.0625,.25,.5,.75,1].map(x=>`<circle cx="${px(x)}" cy="${py(f(x))}" r="4.5" fill="#087eaf"/>`).join('')
const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900">
<defs><marker id="arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto"><path d="M0 0L8 4L0 8" fill="none" stroke="#334155" stroke-width="1.5"/></marker></defs>
<style>text{font-family:"DejaVu Sans",sans-serif;fill:#17324d}.title{font-size:36px;font-weight:700}.heading{font-size:26px;font-weight:700}.body{font-size:24px}.small{font-size:21px}.formula{font-size:29px}.axis{fill:none;stroke:#334155;stroke-width:2}.grid{fill:none;stroke:#d9e4ed;stroke-width:1.2}.card{fill:white;stroke:#cadce9;stroke-width:2}.hint{fill:#476175}</style>
<rect width="1600" height="900" rx="24" fill="#f1f7fb"/>
<text x="42" y="62" class="title">Uneigentliche Integrale berechnen (LK)</text>
<text x="42" y="108" class="body">Unbeschränkte Funktionswerte können zu einem endlichen Integral führen.</text>
<rect x="35" y="139" width="755" height="709" rx="20" class="card"/>
<text x="58" y="181" class="heading">Beispiel: f(x) = 1/√x, 0 &lt; x ≤ 1</text>
<text x="58" y="222" class="small hint">Lineare Achsen · Kurve oberhalb des Bildfensters fortgesetzt</text>
<path data-role="area-under-curve" d="${shade}" fill="#fbc56f" fill-opacity=".65"/>
${xticks}${yticks}
<path d="M110 735H773" class="axis" marker-end="url(#arrow)"/>
<path d="M110 735V238" class="axis" marker-end="url(#arrow)"/>
<path d="M110 735V255" fill="none" stroke="#ce614d" stroke-width="2.5" stroke-dasharray="7 6"/>
<path data-role="inverse-sqrt-curve" d="${curve}" fill="none" stroke="#087eaf" stroke-width="4" stroke-linejoin="round"/>
${controls}
<path d="M760 735V655" class="axis"/>
<text x="771" y="778" class="small">x</text><text x="54" y="253" class="small">f(x)</text>
<text x="277" y="559" class="small">(0,25; 2)</text>
<text x="447" y="602" class="small">(0,5; √2)</text>
<text x="678" y="643" class="small">(1; 1)</text>
<text x="60" y="817" class="small">x = 0 ist ausgeschlossen; f(x) → ∞ für x → 0⁺.</text>
<rect x="815" y="139" width="750" height="217" rx="20" class="card"/>
<text x="838" y="181" class="heading">1 · Die problematische Grenze ersetzen</text>
<text x="838" y="223" class="body">Zunächst 0 &lt; a &lt; 1; erst danach a → 0⁺.</text>
<text x="838" y="277" class="formula">∫₀¹ 1/√x dx := lim<tspan baseline-shift="sub" font-size="18">a→0⁺</tspan> ∫ₐ¹ x<tspan baseline-shift="super" font-size="19">−1/2</tspan> dx</text>
<text x="838" y="327" class="small hint">Unendliche Funktionshöhe entscheidet nicht allein.</text>
<rect x="815" y="378" width="750" height="207" rx="20" class="card"/>
<text x="838" y="421" class="heading">2 · Integrieren und den Randwert prüfen</text>
<text x="838" y="481" class="formula">∫ₐ¹ x<tspan baseline-shift="super" font-size="19">−1/2</tspan> dx = [2√x]ₐ¹ = 2 − 2√a</text>
<text x="838" y="542" class="body">Die Stammfunktion ist 2√x für x &gt; 0.</text>
<rect x="815" y="607" width="750" height="241" rx="20" class="card"/>
<text x="838" y="652" class="heading">3 · Den Grenzwert berechnen und deuten</text>
<text x="838" y="708" class="formula">lim<tspan baseline-shift="sub" font-size="18">a→0⁺</tspan> (2 − 2√a) = 2</text>
<text x="838" y="755" class="body">Das uneigentliche Integral konvergiert.</text>
<text x="838" y="795" class="small">Hier gilt f &gt; 0: Integralwert = Flächeninhalt = 2.</text>
<text x="838" y="827" class="small hint">Die Schattierung zeigt nur 0 &lt; x ≤ 1.</text>
</svg>`
const svgPath=path.join(output,'f493-native-fallback.svg'),pngPath=path.join(output,'f493-native-fallback.png')
fs.writeFileSync(svgPath,svg,{flag:'wx'})
if(fs.existsSync(pngPath))throw Error('Refuse overwriting existing reviewed raster')
const browser=await chromium.launch({headless:true})
try {
const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1})
await page.setContent(svg);await page.evaluate(()=>{document.body.style.margin='0'});await page.evaluate(()=>document.fonts.ready)
const overflow=await page.locator('svg text').evaluateAll(nodes=>nodes.flatMap(n=>{const b=n.getBBox();return b.x<0||b.y<0||b.x+b.width>1600||b.y+b.height>900?[n.textContent]:[]}))
if(overflow.length)throw Error('Text outside image: '+JSON.stringify(overflow))
await page.screenshot({path:pngPath,clip:{x:0,y:0,width:1600,height:900}})
} finally {await browser.close()}
console.log(JSON.stringify({svgPath,pngPath,samples:samples.length,xPixelOrigin:110,xPixelsPerUnit:650,yPixelOrigin:735,yPixelsPerUnit:80,controls:[1/36,1/16,1/9,.25,.5,.75,1].map(x=>({x,y:f(x),px:px(x),py:py(f(x))}))}))
