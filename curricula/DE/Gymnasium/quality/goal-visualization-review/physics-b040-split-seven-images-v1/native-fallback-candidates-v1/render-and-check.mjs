import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
const { chromium } = await import(path.resolve('app/node_modules/playwright/index.mjs'));
const directory = path.dirname(fileURLToPath(import.meta.url));
const goalIds = [
  "af5dfdbc-5fd6-5c3e-a81b-093cb7c14b93",
  "37013646-f13a-5faf-954c-940f2fd7502f",
  "c52d55c3-b687-586c-b0f9-8ffcd1069424"
];
const checkOnly = process.argv.includes('--check-only');
const digest = bytes => 'sha256:' + createHash('sha256').update(bytes).digest('hex');
const records = [];
const browser = await chromium.launch({headless:true});
try {
 for(const goalId of goalIds) {
  const svgPath=path.join(directory,goalId+'.svg'), pngPath=path.join(directory,goalId+'.png');
  const svg=fs.readFileSync(svgPath,'utf8');
  const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
  await page.route('**/*',route=>route.abort());
  await page.setContent('<html><head><meta charset="utf-8"><style>html,body{margin:0;width:1600px;height:900px}</style></head><body>'+svg+'</body></html>');
  await page.evaluate(()=>document.fonts.ready);
  const checks=await page.evaluate(({goalId,svg})=>{
   const xml=new DOMParser().parseFromString(svg,'image/svg+xml');
   const n=(e,key)=>Number(e.getAttribute(key));
   const pointList=e=>[...e.getAttribute('d').matchAll(/[ML](-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/g)].map(m=>[Number(m[1]),Number(m[2])]);
   const texts=[...document.querySelectorAll('svg text')].map(e=>{const r=e.getBoundingClientRect();return{text:e.textContent,x:r.x,y:r.y,width:r.width,height:r.height};});
   const outOfFrame=texts.filter(r=>r.x<-.5||r.y<-.5||r.x+r.width>1600.5||r.y+r.height>900.5);
   const mathematicalChecks={};
   if(document.querySelector('[data-comet-orbit]')){
    const ellipse=document.querySelector('[data-comet-orbit]'),sun=document.querySelector('[data-comet-sun]'),comet=document.querySelector('[data-comet]');
    const a=n(ellipse,'rx'),b=n(ellipse,'ry'),cx=n(ellipse,'cx'),cy=n(ellipse,'cy'),c=Math.sqrt(a*a-b*b);
    mathematicalChecks.solar={a,b,c,focusErrorPixels:Math.hypot(n(sun,'cx')-(cx-c),n(sun,'cy')-cy),cometEllipseResidual:Math.abs(((n(comet,'cx')-cx)/a)**2+((n(comet,'cy')-cy)/b)**2-1),planetCount:document.querySelectorAll('[data-planet-orbit]').length,planetRadialErrors:[...document.querySelectorAll('[data-planet-orbit]')].map(p=>{const o=document.querySelector('[data-orbit="'+p.getAttribute('data-planet-orbit')+'"]');return Math.abs(Math.hypot(n(p,'cx')-n(o,'cx'),n(p,'cy')-n(o,'cy'))-n(o,'r'));})};
   }
   if(document.querySelector('[data-absolute]')){
    const widths=selector=>[...document.querySelectorAll(selector)].map(e=>{const ps=pointList(e),xs=ps.map(p=>p[0]);return {label:e.getAttribute('data-absolute')??e.getAttribute('data-relative'),actualWidth:Math.max(...xs)-Math.min(...xs),startX:ps[0][0],tipX:ps[3][0]};});
    mathematicalChecks.tides={absolute:widths('[data-absolute]'),relative:widths('[data-relative]'),absoluteMoonDistance:[515,370,225],relativeMagnification:2};
   }
   if(document.querySelector('[data-wave]')){
    const waves=[...document.querySelectorAll('[data-wave]')].map(e=>{const name=e.getAttribute('data-wave'),lambda=name==='emitted'?140:280,cy=name==='emitted'?350:540,ps=pointList(e);return{name,samples:ps.length,lambda,xStart:ps[0][0],xEnd:ps.at(-1)[0],maxErrorPixels:Math.max(...ps.map(([x,y])=>Math.abs(y-(cy-32*Math.sin(2*Math.PI*(x-140)/lambda)))))};});
    const rays=[...document.querySelectorAll('[data-cmb-ray]')].map(e=>{const ps=pointList(e),a=ps[0],b=ps.at(-1);return{index:Number(e.getAttribute('data-cmb-ray')),startRadius:Math.hypot(a[0]-1190,a[1]-425),endRadius:Math.hypot(b[0]-1190,b[1]-425),markerEnd:e.getAttribute('marker-end')};});
    mathematicalChecks.cosmology={waves,rays,emittedBracket:[175,315],observedBracket:[210,490]};
   }
   return {xmlErrors:[...xml.querySelectorAll('parsererror')].map(e=>e.textContent),textCount:texts.length,outOfFrame,mathematicalChecks};
  },{goalId,svg});
  assert.deepEqual(checks.xmlErrors,[]);
  assert.deepEqual(checks.outOfFrame,[],JSON.stringify(checks.outOfFrame));
  const m=checks.mathematicalChecks;
  if(m.solar){assert.equal(m.solar.focusErrorPixels,0);assert.equal(m.solar.cometEllipseResidual,0);assert.equal(m.solar.planetCount,3);assert(m.solar.planetRadialErrors.every(e=>e<0.0001));}
  if(m.tides){const a=m.tides.absolute,r=m.tides.relative;assert(a[0].actualWidth<a[1].actualWidth&&a[1].actualWidth<a[2].actualWidth);assert(a.every(x=>x.tipX>x.startX));assert(r[0].tipX<r[0].startX&&r[1].tipX>r[1].startX);for(let i=0;i<3;i++)assert(Math.abs(a[i].actualWidth-50*(370/m.tides.absoluteMoonDistance[i])**2)<0.0002);assert(Math.abs(r[0].actualWidth-2*(a[1].actualWidth-a[0].actualWidth))<0.0002);assert(Math.abs(r[1].actualWidth-2*(a[2].actualWidth-a[1].actualWidth))<0.0002);}
  if(m.cosmology){assert(m.cosmology.waves.every(w=>w.samples===281&&w.xStart===140&&w.xEnd===700&&w.maxErrorPixels<0.0001));assert.equal(m.cosmology.rays.length,8);assert(m.cosmology.rays.every(r=>r.startRadius>r.endRadius&&Math.abs(r.startRadius-170)<0.0001&&Math.abs(r.endRadius-60)<0.0001&&r.markerEnd==='url(#incoming-head)'));}
  if(!checkOnly)await page.screenshot({path:pngPath,clip:{x:0,y:0,width:1600,height:900}});
  records.push({goalId,svgFile:path.basename(svgPath),svgSha256:digest(svg),pngFile:path.basename(pngPath),pngSha256:digest(fs.readFileSync(pngPath)),...checks});
  await page.close();
 }
}finally{await browser.close();}
console.log(JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),status:'TECHNICAL_CHECKS_PASS_NOT_VISUAL_OR_HUMAN_APPROVAL',checkOnly,records},null,2));

