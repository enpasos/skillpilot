const {chromium}=require('/home/enpasos/projects/skillpilot/app/node_modules/playwright');
const fs=require('node:fs');const path=require('node:path');const crypto=require('node:crypto');
(async()=>{
 const source=path.resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-source-485-ENG-EKG-and-e70-BW-author-20261007-v2');
 const out=path.resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-three-current-fresh-blind-a-20261007-v2');
 const ids=['485ef1c3-8997-52b7-91f5-b1ddf179013d','11675f1a-5de2-5926-be78-1e8275f19f5b','e70d8a85-2dea-5165-919b-200fee9f4db4'];
 const browser=await chromium.launch({headless:true});const rows=[];
 for(const id of ids){
  const sourcePath=path.join(source,'selected-existing-images',id+'.png');const bytes=fs.readFileSync(sourcePath);
  for(const width of [360,680]){
   const page=await browser.newPage({viewport:{width,height:700},deviceScaleFactor:1});
   await page.setContent('<style>html,body{margin:0;padding:0}img{display:block;width:100%;max-height:28rem;object-fit:contain}</style><img alt="didactic source" src="data:image/png;base64,'+bytes.toString('base64')+'">');
   await page.locator('img').evaluate(img=>img.decode());
   const geometry=await page.locator('img').evaluate(img=>({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,width:img.getBoundingClientRect().width,height:img.getBoundingClientRect().height}));
   const target=path.join(out,id+'-actual-'+width+'.png');await page.locator('img').screenshot({path:target});
   rows.push({goalId:id,sourcePath,sourceSha256:crypto.createHash('sha256').update(bytes).digest('hex'),viewportWidth:width,geometry,screenshotPath:target,screenshotSha256:crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')});await page.close();
  }
 }
 await browser.close();fs.writeFileSync(path.join(out,'actual-responsive-bindings.json'),JSON.stringify({reviewer:'A',rows,actualBrowser:'Playwright Chromium',imageCss:'width:100%;max-height:28rem;object-fit:contain'},null,2)+'\n');console.log('Actual responsive browser rasters:',rows.length);
})().catch(e=>{console.error(e);process.exitCode=1});
