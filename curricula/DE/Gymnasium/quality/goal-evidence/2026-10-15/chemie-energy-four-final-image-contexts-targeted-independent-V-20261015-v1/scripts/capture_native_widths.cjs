const fs=require('node:fs'); const path=require('node:path');
const {chromium}=require(path.resolve('app/node_modules/playwright'));
const R=process.cwd(); const O=path.resolve(__dirname,'..');
const P=path.resolve('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-energy-four-final-contexts-native-preparation-technical-20261015-v1');
const selector=JSON.parse(fs.readFileSync(path.join(P,'NEUTRAL.BLIND4.current-four-native-inputs.json'),'utf8'));
(async()=>{
 const browser=await chromium.launch({headless:true}); const page=await browser.newPage({viewport:{width:1000,height:1200},deviceScaleFactor:1});
 const requests=[];
 await page.route('**/assets/goal-visualizations/**',async route=>{
  const url=new URL(route.request().url());const id=url.pathname.split('/').at(-2);const row=selector.unchangedPixelInputs.find(x=>x.path.includes('/'+id+'/'));if(!row)throw Error('Unexpected image '+id);
  requests.push({url:route.request().url(),source:row.path}); await route.fulfill({path:path.resolve(row.path),contentType:'image/jpeg'});
 });
 await page.goto('file://'+path.join(P,'native-four/bundle/book.html'));
 await page.locator('article.goal-page img').evaluateAll(imgs=>Promise.all(imgs.map(img=>img.decode())));
 const observations=[];
 for(const width of [360,680]){
  await page.locator('article.goal-page img').evaluateAll((imgs,width)=>imgs.forEach(img=>{img.style.width=width+'px';img.style.height='auto';img.style.maxWidth='none';}),width);
  for(const id of selector.goalIds){
   const img=page.locator('article[data-goal-id="'+id+'"] img');
   const output=path.join(O,'inspection',id+'.native-'+width+'.png'); await img.screenshot({path:output});
   observations.push(await img.evaluate((img,{id,width,output})=>({goalId:id,widthRequested:width,boundingWidth:img.getBoundingClientRect().width,boundingHeight:img.getBoundingClientRect().height,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,complete:img.complete,alt:img.alt,title:img.closest('article').querySelector('.goal-title').textContent,description:img.closest('article').querySelector('.goal-description p:last-child').textContent,output}),{id,width,output:path.relative(R,output)}));
  }
 }
 fs.writeFileSync(path.join(O,'inspection','NATIVE.actual-browser-width-observations.json'),JSON.stringify({sourceHtml:selector.actualHtml.path,role:'Actual Chromium renders of the unchanged JPG elements in the frozen native HTML. Only CSS image width/auto height were controlled for 360/680 inspection; these are screenshots, not replacement assets or runtime-host acceptance.',deviceScaleFactor:1,requests,observations},null,2)+'\n');
 await browser.close();console.log(JSON.stringify({screenshots:observations.length,allComplete:observations.every(x=>x.complete),widths:observations.map(x=>x.boundingWidth)}));
})();
