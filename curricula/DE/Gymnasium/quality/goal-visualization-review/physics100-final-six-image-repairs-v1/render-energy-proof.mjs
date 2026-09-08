import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {chromium} from '../../../../../../app/node_modules/playwright/index.mjs';
const dir=path.dirname(fileURLToPath(import.meta.url));
const id='d05a146f-7fcd-56ae-b9b9-b54203328579';
const source=fs.readFileSync(path.join(dir,id+'.svg'),'utf8');
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 await page.route('**/*',r=>r.abort());
 await page.setContent('<html><head><meta charset="utf-8"><style>html,body{margin:0}</style></head><body>'+source+'</body></html>');
 await page.evaluate(()=>document.fonts.ready);
 const proof=await page.evaluate(source=>{
  const xml=new DOMParser().parseFromString(source,'image/svg+xml');
  const levels=[...document.querySelectorAll('[data-n]')].map(n=>({n:+n.getAttribute('data-n'),height:730-+n.getAttribute('y1'),width:+n.getAttribute('x2')-+n.getAttribute('x1')}));
  const clipped=[...document.querySelectorAll('text')].filter(n=>{const b=n.getBoundingClientRect();return b.x<0||b.y<0||b.right>1600||b.bottom>900}).map(n=>n.textContent);
  return {xmlErrors:xml.querySelectorAll('parsererror').length,levels,clipped};
 },source);
 assert.equal(proof.xmlErrors,0);assert.deepEqual(proof.clipped,[]);assert.deepEqual(proof.levels.map(n=>n.height/60),[1,4,9]);assert.ok(proof.levels.every(n=>n.width===660));
 await page.screenshot({path:path.join(dir,id+'.png')});
 const hash=b=>'sha256:'+crypto.createHash('sha256').update(b).digest('hex');
 console.log(JSON.stringify({technicalOnly:true,sourceSha256:hash(source),pngSha256:hash(fs.readFileSync(path.join(dir,id+'.png'))),...proof}));
} finally {await browser.close();}
