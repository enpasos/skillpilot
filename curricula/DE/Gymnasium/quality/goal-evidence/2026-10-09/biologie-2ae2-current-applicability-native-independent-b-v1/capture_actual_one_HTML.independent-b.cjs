// SPDX-License-Identifier: Apache-2.0
const {createRequire}=require('node:module');
const {resolve}=require('node:path');
const {readFileSync,writeFileSync}=require('node:fs');
const {chromium}=createRequire(resolve(process.cwd(),'app/package.json'))('playwright');
const author=resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-2ae2-applicability-current-native-preparation-root-v1');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1100,height:1400},deviceScaleFactor:1});
 await page.route('**/assets/**',async route=>{
  const url=new URL(route.request().url());
  const path=resolve(author,'.'+url.pathname);
  if(!path.startsWith(author+'/assets/'))throw new Error('Asset route outside bound author assets');
  await route.fulfill({body:readFileSync(path),contentType:'image/png'});
 });
 await page.goto('file://'+resolve(author,'native/actual-one/bundle/book.html'),{waitUntil:'networkidle'});
 const image=page.locator('article.goal-page img');
 const actual=await image.evaluate(i=>({complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,alt:i.alt,source:i.getAttribute('src')}));
 if(!actual.complete||actual.naturalWidth===0)throw new Error('Actual goal image did not load');
 const out=resolve(__dirname,'actual-one-current-HTML-goal-page.png');
 await page.locator('article.goal-page').screenshot({path:out});
 const text=await page.locator('article.goal-page').innerText();
 writeFileSync(resolve(__dirname,'actual-one-current-HTML-goal-page.text.txt'),text+'\n');
 writeFileSync(resolve(__dirname,'actual-one-current-HTML-image-load.actual.json'),JSON.stringify({schemaVersion:1,role:'Actual Chromium capture of bound current HTML goal page',image:actual,viewport:{width:1100,height:1400},actualPageText:text,noSourceApproval:true,humanApproval:false},null,2)+'\n');
 await browser.close();
 console.log(JSON.stringify({HTMLActualImageLoaded:actual.complete,actualWidth:actual.naturalWidth,actualHeight:actual.naturalHeight,screenshot:out}));
})().catch(e=>{console.error(e);process.exit(1)});
