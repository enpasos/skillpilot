// Extend the already reviewed code-native fallback; do not retouch a raster or modify its geometry.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from '../../../../../../app/node_modules/playwright/index.mjs';
const base=path.dirname(new URL(import.meta.url).pathname);
const input=path.join(base,'fallback-v1/grating.svg');
const sha=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(sha(input),'sha256:83305a7f770af99d5eca51e569439bd6661cd7a75d8cd78918f295a9c91669c1');
let svg=fs.readFileSync(input,'utf8');
const replacements=[
  ['Optisches Gitter: Hauptmaxima','Gitter: Hauptmaxima und Spektren'],
  ['<text x="66" y="927" font-size="30" fill="#26764e" >Warum entstehen dort Hauptmaxima?</text>',
   '<text x="66" y="923" font-size="28" fill="#26764e">Andere Quelle: zwei Spektrallinien bei 450 nm und 600 nm, gleiches Gitter</text>'],
  ['<text x="66" y="969" font-size="26" fill="#243445" >Der Gangunterschied benachbarter Spalte ist ein ganzzahliges Vielfaches von λ: Die Beiträge verstärken sich.</text>',
   '<text x="66" y="960" font-size="25" fill="#243445">Erste Ordnung: |θ₁| ≈ 13,00° (450 nm) und 17,46° (600 nm); kürzere Wellen liegen näher am Zentrum.</text>'],
  ['<text x="66" y="1011" font-size="26" fill="#243445" >Die Bedingung beschreibt Hauptmaxima, nicht alle Nebenmaxima oder Minima eines realen Gitters.</text>',
   '<text x="66" y="994" font-size="24" fill="#243445">Bei m = 0 überlagern sich beide Linien. Aus bekanntem m und gemessenem θ folgt λ = g sin θ / m (m ≠ 0).</text><text x="66" y="1025" font-size="22" fill="#277393">Gezeigt werden Hauptmaxima; für Nebenmaxima und Minima gilt keine allgemeine Doppelspaltregel.</text>'],
];
for(const [from,to] of replacements){assert.ok(svg.includes(from),from);svg=svg.replaceAll(from,to)}
assert.ok(Math.abs(Math.asin(.225)*180/Math.PI-13.0028781629)<1e-9);
assert.ok(Math.abs(Math.asin(.3)*180/Math.PI-17.4576031237)<1e-9);
const dir=path.join(base,'fallback-v2-existing-grating-spectrum');
const sp=path.join(dir,'grating.svg'),pp=path.join(dir,'grating.png');
if(process.argv.includes('--check')){
  assert.equal(fs.readFileSync(sp,'utf8'),svg);
  console.log(JSON.stringify({status:'PASS',scope:'Exact unchanged reviewed geometry plus four spectral explanation lines; not a visual approval',svgSha256:sha(sp),pngSha256:sha(pp)}));
}else{
  assert.equal(fs.existsSync(sp),false);assert.equal(fs.existsSync(pp),false);
  fs.mkdirSync(dir,{recursive:true});fs.writeFileSync(sp,svg);
  const browser=await chromium.launch({headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1.5});
    await page.setContent('<html><head><style>html,body{margin:0;padding:0}</style></head><body>'+svg+'</body></html>');
    await page.evaluate(()=>document.fonts.ready);
    const labels=await page.locator('svg text').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBBox();return{text:n.textContent,x:b.x,y:b.y,width:b.width,height:b.height}}));
    assert.deepEqual(labels.filter(b=>b.x<0||b.y<0||b.x+b.width>1920||b.y+b.height>1080),[]);
    assert.ok(labels.filter(b=>b.y>884).every(b=>b.x+b.width<1884&&b.y+b.height<1042));
    await page.screenshot({path:pp});
    console.log(JSON.stringify({status:'RENDERED_REQUIRES_VISUAL_REVIEW',svgSha256:sha(sp),pngSha256:sha(pp),spectralLabels:labels.filter(b=>b.y>884)}));
  }finally{await browser.close()}
}
