// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const root=process.cwd();
const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-v3-current353-genuine-independent-b-fresh-20261010-v1';
const author='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/biologie-bio8-atomicity-source-visual-findings-targeted-author-successor-v3';
const require=createRequire(path.join(root,'app/package.json'));
const {chromium}=require('playwright');
const ref=p=>({path:p,sha256:'sha256:'+createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size});
const source=author+'/native/portable-final19/bundle/book.html';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1200,height:1400},deviceScaleFactor:1});
 await page.goto(pathToFileURL(path.join(root,source)).href);
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
 const rows=[];
 const articles=page.locator('article.goal-page');
 for(let n=0;n<await articles.count();n++) {
  const element=articles.nth(n);const info=await element.evaluate(e=>({id:e.id,text:e.innerText,rect:{width:e.getBoundingClientRect().width,height:e.getBoundingClientRect().height},scrollHeight:e.scrollHeight,clientHeight:e.clientHeight,images:[...e.querySelectorAll('img')].map(i=>({src:i.getAttribute('src'),complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight}))}));
  const out=own+'/native/'+String(n+1).padStart(2,'0')+'.whole-portable-page.png';await element.screenshot({path:out});rows.push({...info,capture:ref(out)});
 }
 fs.writeFileSync(own+'/native/actual-portable19-browser.receipt.json',JSON.stringify({input:ref(source),rows,actualBrowser:'Playwright Chromium',aiCandidate:true,humanApproval:false,scientificApprovalByCapture:false},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({pages:rows.length,images:rows.reduce((n,r)=>n+r.images.length,0),receipt:own+'/native/actual-portable19-browser.receipt.json'}));
}finally{await browser.close();}
