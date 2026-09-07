// Extend the reviewed editable SVG, not the raster: existing f6 goal includes modelling.
// The earlier Nano candidate failed its intensity-scale/geometry checks.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chromium} from '../../../../../../app/node_modules/playwright/index.mjs';
const base=path.dirname(new URL(import.meta.url).pathname);
const source=path.join(base,'fallback-v1/single-slit.svg');
const digest=p=>'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex');
assert.equal(digest(source),'sha256:8035c1551201ad28f1b2b24f4f49bc63cb8604e99dad77a96a962b47afd5e61f');
const old=fs.readFileSync(source,'utf8');
const supplement='<text x="64" y="809" font-size="22" fill="#243445">I / I₀ = [sin(πu) / (πu)]²</text><text x="64" y="843" font-size="21" fill="#243445">Für u = 0: Grenzwert I / I₀ = 1.</text>';
assert.equal(old.split('<polyline points=').length,2);
const svg=old.replace('<polyline points=',supplement+'<polyline points=');
assert.equal(svg.replace(supplement,''),old);
const out=path.join(base,'fallback-v2-existing-single-slit-model');
const svgPath=path.join(out,'single-slit.svg'),pngPath=path.join(out,'single-slit.png');
if(process.argv.includes('--check')) {
  assert.equal(fs.readFileSync(svgPath,'utf8'),svg);
  console.log(JSON.stringify({status:'PASS',scope:'Exact reviewed source plus two intensity-model labels; not a visual approval.',sourceSha256:digest(source),svgSha256:digest(svgPath),pngSha256:digest(pngPath)}));
} else {
  assert.equal(fs.existsSync(svgPath),false,'Versioned output already exists');
  assert.equal(fs.existsSync(pngPath),false,'Versioned output already exists');
  fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(svgPath,svg);
  const browser=await chromium.launch({headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1.5});
    await page.setContent('<html><head><style>html,body{margin:0;padding:0}</style></head><body>'+svg+'</body></html>');
    await page.evaluate(()=>document.fonts.ready);
    const labels=await page.locator('svg text').evaluateAll(nodes=>nodes.map(n=>{const b=n.getBBox();return {text:n.textContent,x:b.x,y:b.y,width:b.width,height:b.height};}));
    assert.deepEqual(labels.filter(b=>b.x<0||b.y<0||b.x+b.width>1920||b.y+b.height>1080),[]);
    const added=labels.filter(b=>b.text.startsWith('I / I₀ = [')||b.text.startsWith('Für u = 0:'));
    assert.equal(added.length,2);
    for(const b of added)assert.ok(b.x+b.width<440&&b.y+b.height<850,'Model text overlaps graph area');
    await page.screenshot({path:pngPath});
    console.log(JSON.stringify({status:'RENDERED_REQUIRES_VISUAL_REVIEW',sourceSha256:digest(source),files:[svgPath,pngPath].map(p=>({path:path.relative(process.cwd(),p),sha256:digest(p)})),addedLabels:added}));
  } finally {await browser.close();}
}
