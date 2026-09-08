import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { chromium } from '../../../../../../app/node_modules/playwright/index.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const checkOnly = process.argv.includes('--check-only');
const goalIds = [
  "5b8eaf71-96fe-50eb-b9ea-a8fa392df086",
  "89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2",
  "12260012-cf04-5409-b57d-f5b3a46d9126",
  "7f0798cb-5966-5dcb-beb3-84f637ab6139"
];
const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const browser = await chromium.launch({ headless: true });
const records = [];
try {
  for (const goalId of goalIds) {
    const svgPath = path.join(directory, goalId + '.svg');
    const pngPath = path.join(directory, goalId + '.png');
    const source = fs.readFileSync(svgPath);
    const page = await browser.newPage({ viewport: { width: 1600, height: 900 }, deviceScaleFactor: 1 });
    await page.route('**/*', route => route.abort());
    await page.setContent('<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:1600px;height:900px}</style></head><body>' + source.toString('utf8') + '</body></html>');
    await page.evaluate(() => document.fonts.ready);
    const proof = await page.evaluate(({ source, goalId }) => {
      const xml = new DOMParser().parseFromString(source, 'image/svg+xml');
      const xmlErrors = [...xml.querySelectorAll('parsererror')].map(n => n.textContent);
      const text = [...document.querySelectorAll('svg text')].map(n => {
        const b = n.getBoundingClientRect();
        return { text: n.textContent, x: b.x, y: b.y, width: b.width, height: b.height };
      });
      const outOfFrame = text.filter(b => b.x < -0.5 || b.y < -0.5 || b.x + b.width > 1600.5 || b.y + b.height > 900.5);
      const mathematicalChecks = {};
      function points(d) {
        return [...d.matchAll(/[ML](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(m => [Number(m[1]), Number(m[2])]);
      }
      if (goalId === '89a8cf15-7ba4-46c1-b1dc-fd161b20d9c2') {
        const p = points(document.querySelector('path[stroke="#17658a"]').getAttribute('d'));
        mathematicalChecks.parabolaSampleCount = p.length;
        mathematicalChecks.parabolaMaxDeviationPixels = Math.max(...p.map(([x,y]) => Math.abs(y-(233+9*1.25*((x-140)/85)**2))));
        mathematicalChecks.modelTable = [0,1,2,3].map(t => ({t,x:2*t,y:5*t*t}));
      }
      if (goalId === '12260012-cf04-5409-b57d-f5b3a46d9126') {
        mathematicalChecks.forceArrows = [...document.querySelectorAll('[data-force]')].map(n => {
          const coordinates = n.getAttribute('d').match(/-?\d+(?:\.\d+)?/g).map(Number);
          const y = coordinates.filter((_, index) => index % 2 === 1);
          return { force:n.getAttribute('data-force'), length:Number(n.getAttribute('data-length')), actualPolygonLength:Math.max(...y)-Math.min(...y), direction:n.getAttribute('data-direction'), originY:Number(n.getAttribute('data-origin-y')) };
        });
      }
      if (goalId === '7f0798cb-5966-5dcb-beb3-84f637ab6139') {
        mathematicalChecks.chargeCounts = {};
        for(const n of document.querySelectorAll('[data-charge-region]')) {
          const key=n.getAttribute('data-charge-region')+':'+n.getAttribute('data-sign');
          mathematicalChecks.chargeCounts[key]=(mathematicalChecks.chargeCounts[key]??0)+1;
        }
        const p=points(document.querySelector('[data-wave="output"]').getAttribute('d'));
        mathematicalChecks.outputSampleCount=p.length;
        mathematicalChecks.negativeHalfMaxDeviationFromZeroPixels=Math.max(...p.filter(([x])=>x>=1100).map(([,y])=>Math.abs(y-788)));
        mathematicalChecks.outputMaxDeviationPixels=Math.max(...p.map(([x,y])=>Math.abs(y-(788-44*Math.max(0,Math.sin(2*Math.PI*(x-745)/710))))));
      }
      if (goalId === '5b8eaf71-96fe-50eb-b9ea-a8fa392df086') {
        const paths=[...document.querySelectorAll('path[stroke="#183249"][stroke-width="3"]')].map(n=>points(n.getAttribute('d')));
        mathematicalChecks.circularOrbitRadii=[45,133];
        mathematicalChecks.circularOrbitSampleCounts=paths.map(p=>p.length);
        mathematicalChecks.circularOrbitMaxRadialDeviationPixels=paths.map((p,i)=>Math.max(...p.map(([x,y])=>Math.abs(Math.hypot(x-1190,y-346)-[45,133][i]))));
        mathematicalChecks.circulationSigns=paths.map(p=>Math.sign((p[0][0]-1190)*(p[1][1]-346)-(p[0][1]-346)*(p[1][0]-1190)));
      }
      return { xmlErrors, textCount:text.length, outOfFrame, mathematicalChecks };
    }, {source:source.toString('utf8'),goalId});
    assert.deepEqual(proof.xmlErrors, [], 'Invalid XML');
    assert.deepEqual(proof.outOfFrame, [], 'Text outside frame: '+JSON.stringify(proof.outOfFrame));
    const m=proof.mathematicalChecks;
    if(m.parabolaSampleCount) {assert.equal(m.parabolaSampleCount,161);assert.ok(m.parabolaMaxDeviationPixels<0.02);}
    if(m.forceArrows) {assert.ok(m.forceArrows.every(r=>r.length===r.actualPolygonLength));assert.deepEqual(m.forceArrows.filter(r=>r.force.startsWith('FG')).map(r=>r.actualPolygonLength),[130,130,130]);assert.equal(m.forceArrows.find(r=>r.force==='FL-2').actualPolygonLength,130);}
    if(m.outputSampleCount) {assert.equal(m.outputSampleCount,161);assert.equal(m.negativeHalfMaxDeviationFromZeroPixels,0);assert.ok(m.outputMaxDeviationPixels<0.002);assert.equal(m.chargeCounts['p-bulk:+'],m.chargeCounts['p-bulk:−']);assert.equal(m.chargeCounts['n-bulk:+'],m.chargeCounts['n-bulk:−']);}
    if(m.circularOrbitRadii) {assert.deepEqual(m.circulationSigns,[-1,-1]);assert.ok(m.circularOrbitMaxRadialDeviationPixels.every(v=>v<0.002));}
    if (!checkOnly) await page.screenshot({ path:pngPath, clip:{x:0,y:0,width:1600,height:900} });
    records.push({goalId,svgFile:path.basename(svgPath),svgDigest:digest(source),pngFile:path.basename(pngPath),pngDigest:digest(fs.readFileSync(pngPath)),...proof});
    await page.close();
  }
} finally { await browser.close(); }
console.log(JSON.stringify({checkedAt:new Date().toISOString(),mode:checkOnly?'read_only_existing_candidates':'render_candidates',status:'technical_checks_only_not_visual_or_human_approval',records},null,2));
