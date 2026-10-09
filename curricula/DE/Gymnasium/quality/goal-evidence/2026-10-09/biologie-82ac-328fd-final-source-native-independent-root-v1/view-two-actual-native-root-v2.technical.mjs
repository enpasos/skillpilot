import { chromium } from '../app/node_modules/playwright/index.mjs';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-82ac-nine-lower-jurisdictions-and-SN-ST-digital-prerequisite-source-author-v1';
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-82ac-328fd-final-source-native-independent-root-v1';
const start=new Date().toISOString(); const allowed=new Set(['/assets/goal-visualizations/biologie/82acfbde-9ce8-5658-892e-4dcfb1c3a1f1/82acfbde-9ce8-5658-892e-4dcfb1c3a1f1.png','/assets/goal-visualizations/biologie/328fd9d3-d3c3-5731-a8da-a909143d3962/328fd9d3-d3c3-5731-a8da-a909143d3962.png']);const server=createServer((req,res)=>{const url=new URL(req.url,'http://localhost').pathname;if(url==='/'){res.setHeader('Content-Type','text/html');res.end(readFileSync(resolve(author,'native/actual-two/book.html')));}else if(allowed.has(url)){res.setHeader('Content-Type','image/png');res.end(readFileSync(resolve('app/public',url.slice(1))));}else{res.statusCode=404;res.end();}});await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:900,height:1400},deviceScaleFactor:1});
 const errors=[];page.on('pageerror',e=>errors.push(String(e)));await page.goto(`http://127.0.0.1:${server.address().port}/`);await page.evaluate(()=>document.fonts.ready);await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete&&i.naturalWidth>0));
 const rows=[];
 for(const id of ['82acfbde-9ce8-5658-892e-4dcfb1c3a1f1','328fd9d3-d3c3-5731-a8da-a909143d3962']) {
  const loc=page.locator(`[data-goal-id="${id}"]`);const path=`${own}/${id}.actual-native-HTML-root.png`;
  await loc.screenshot({path});const text=await loc.innerText();writeFileSync(`${own}/${id}.actual-native-HTML-whole-root.txt`,text+'\n');
  rows.push({goalId:id,screenshot:{path,bytes:readFileSync(path).length,sha256:createHash('sha256').update(readFileSync(path)).digest('hex')},wholeText:{path:`${own}/${id}.actual-native-HTML-whole-root.txt`,sha256:createHash('sha256').update(text+'\n').digest('hex')},allImagesLoaded:true}); console.log(id,text);
 }
 writeFileSync(`${own}/actual-two-HTML-browser-execution-root.actual.json`,JSON.stringify({schemaVersion:1,role:'Own actual two native HTML pages, public curriculum only; screenshot creation is not scientific approval',startedAt:start,completedAt:new Date().toISOString(),actualErrors:errors,rows},null,2)+'\n');if(errors.length)throw Error(errors.join('\n'));
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
