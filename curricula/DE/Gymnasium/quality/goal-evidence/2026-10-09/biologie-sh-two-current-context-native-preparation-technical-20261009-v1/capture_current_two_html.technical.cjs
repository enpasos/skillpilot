// SPDX-License-Identifier: Apache-2.0
const assert=require('node:assert/strict');
const {createRequire}=require('node:module');
const {resolve}=require('node:path');
const {readFileSync,writeFileSync}=require('node:fs');
const {chromium}=createRequire(resolve(process.cwd(),'app/package.json'))('playwright');
const author=__dirname;
(async()=>{
 const browser=await chromium.launch({headless:true});
 try {
  const page=await browser.newPage({viewport:{width:1100,height:1400},deviceScaleFactor:1});
  await page.route('**/assets/**',async route=>{
   const url=new URL(route.request().url());
   const asset=resolve(author,'.'+url.pathname);
   assert.ok(asset.startsWith(author+'/assets/'),'Only exact bound author assets allowed');
   await route.fulfill({body:readFileSync(asset),contentType:'image/png'});
  });
  await page.goto('file://'+resolve(author,'native/actual-two/bundle/book.html'),{waitUntil:'networkidle'});
  const rows=[];
  for(const goalId of ['e5f97788-c2ac-5f42-b5a5-55605b563a79','2ae2da43-73d5-578f-84f4-be0585a7d8f9']) {
   const article=page.locator(`article.goal-page[data-goal-id="${goalId}"]`);
   const image=await article.locator('img').evaluate(i=>({complete:i.complete,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,alt:i.alt,source:i.getAttribute('src')}));
   assert.ok(image.complete&&image.naturalWidth>0,'Actual goal image must load');
   const screenshot='captures/current-HTML-'+goalId+'.png';
   await article.screenshot({path:resolve(author,screenshot)});
   const text=await article.innerText();
   writeFileSync(resolve(author,'captures/current-HTML-'+goalId+'.actual.txt'),text+'\n');
   rows.push({goalId,image,screenshot,actualPageText:text});
  }
  writeFileSync(resolve(author,'captures/current-two-HTML-loaded-assets.actual.json'),JSON.stringify({schemaVersion:1,role:'Actual Chromium capture of current source-bound HTML articles',viewport:{width:1100,height:1400},rows,newScienceReview:false,humanApproval:false},null,2)+'\n');
  console.log(JSON.stringify(rows.map(({goalId,image,screenshot})=>({goalId,actualImageLoaded:image.complete,naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,screenshot}))));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
