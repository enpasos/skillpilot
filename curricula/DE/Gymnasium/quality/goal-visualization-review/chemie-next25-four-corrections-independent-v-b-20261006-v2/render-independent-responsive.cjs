const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { chromium } = require('/home/enpasos/projects/skillpilot/app/node_modules/playwright');
const out=__dirname;
const bind=p=>({path:path.relative('/home/enpasos/projects/skillpilot',p),sha256:'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size});
(async()=>{
 const browser=await chromium.launch({headless:true});
 const inputs=JSON.parse(fs.readFileSync(path.join(out,'whole-current-seven-and-three-exact-historical-carry.actual.json'),'utf8'));
 const receipt={createdAtUTC:new Date().toISOString(),probeKind:'independent local GoalCard-equivalent CSS scaffold; not full app',browserVersion:browser.version(),playwrightVersion:require('/home/enpasos/projects/skillpilot/app/node_modules/playwright/package.json').version,productionComponent:bind('/home/enpasos/projects/skillpilot/app/src/components/GoalCard.tsx'),productionImageClass:'block h-auto max-h-[28rem] w-full object-contain',productionCardClass:'bg-sidebar-bg border border-border-color rounded-3xl p-5 shadow-none dark:shadow-card-2xl transition-colors relative group',specialCSSForAssets:false,imageFilters:false,deviceScaleFactor:1,rows:[]};
 for(const item of inputs.newIndependentContentReviewInputs){
  for(const width of [360,680,404,724]){
   const page=await browser.newPage({viewport:{width,height:1000},deviceScaleFactor:1});
   const htmlpath=path.join(out,'responsive',item.goalId+'.html');
   await page.goto('file://'+htmlpath);
   await page.locator('img').evaluate(async im=>{await im.decode()});
   const metrics=await page.evaluate(()=>{const im=document.querySelector('img');const c=getComputedStyle(im);const b=im.getBoundingClientRect();const fig=document.querySelector('figure').getBoundingClientRect();return {viewportWidth:window.innerWidth,cardWidth:document.querySelector('.card').getBoundingClientRect().width,imageBox:{x:b.x,y:b.y,width:b.width,height:b.height},figureBox:{x:fig.x,y:fig.y,width:fig.width,height:fig.height},naturalSize:[im.naturalWidth,im.naturalHeight],computedImageCSS:{display:c.display,width:c.width,height:c.height,maxHeight:c.maxHeight,objectFit:c.objectFit},complete:im.complete,bodyScrollWidth:document.body.scrollWidth}});
   if(metrics.computedImageCSS.maxHeight!=='448px'||metrics.computedImageCSS.objectFit!=='contain'||metrics.bodyScrollWidth!==width)throw new Error(JSON.stringify(metrics));
   const cardpath=path.join(out,'responsive',`${item.goalId}.card-${width}.png`);
   const figurepath=path.join(out,'responsive',`${item.goalId}.figure-${width}.png`);
   await page.screenshot({path:cardpath,fullPage:true});
   await page.locator('figure').screenshot({path:figurepath});
   receipt.rows.push({goalId:item.goalId,asset:item.selectedPNG,viewportWidth:width,interpretation:[404,724].includes(width)?'requested actual image widths 360/680':'additional actual container widths 360/680, images 316/636',html:bind(htmlpath),metrics,actualCardScreenshot:bind(cardpath),actualFigureScreenshot:bind(figurepath),modelActualSightPending:true});
   await page.close();
  }
 }
 await browser.close();
 fs.writeFileSync(path.join(out,'independent-responsive-browser-render.actual.json'),JSON.stringify(receipt,null,2)+'\n');
 process.stdout.write(JSON.stringify({browserVersion:receipt.browserVersion,actualViews:receipt.rows.length,imageWidths:receipt.rows.map(r=>r.metrics.imageBox.width),allMaxHeight448:true,allContain:true})+'\n');
})().catch(e=>{process.stderr.write(e.stack+'\n');process.exit(1)});
