import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import crypto from 'node:crypto';
const root='/home/enpasos/projects/skillpilot';
const own=path.join(root,'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-c441-gasfoermige-caption-independent-v-b-20261007-v1');
const require=createRequire(path.join(root,'app/package.json'));
const {chromium}=require('playwright');
const startedAtUTC=new Date().toISOString();
const input=JSON.parse(await fs.readFile(path.join(own,'one-whole-current-goal-profile-two-cases-and-native-context.independent-read-input.json'),'utf8'));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const results=[];
for(const row of [input]){
  for(const width of [360,680]){
    const htmlPath=path.join(own,'browser',`${row.goalId}.${width}px.actual.html`);
    const source=pathToFileURL(path.join(root,row.actualFinalOriginal.path)).href;
    const html=`<!doctype html><html><head><meta charset="utf-8"><style>html{font-size:16px}body{margin:0;background:white}figure{margin:0;width:${width}px;overflow:hidden;background:white}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}</style></head><body><figure><img src="${source}" alt="" class="block h-auto max-h-[28rem] w-full object-contain"></figure></body></html>`;
    await fs.writeFile(htmlPath,html);
    const page=await browser.newPage({viewport:{width:740,height:900},deviceScaleFactor:1});
    await page.goto(pathToFileURL(htmlPath).href);
    await page.locator('img').evaluate(el=>el.decode());
    const metrics=await page.locator('img').evaluate(el=>{const r=el.getBoundingClientRect(),s=getComputedStyle(el);return {naturalWidth:el.naturalWidth,naturalHeight:el.naturalHeight,width:r.width,height:r.height,computedDisplay:s.display,computedWidth:s.width,computedHeight:s.height,computedMaxHeight:s.maxHeight,computedObjectFit:s.objectFit,rootFontSize:getComputedStyle(document.documentElement).fontSize,viewportWidth:innerWidth,viewportHeight:innerHeight,devicePixelRatio}});
    if(metrics.width!==width || metrics.computedMaxHeight!=='448px' || metrics.computedObjectFit!=='contain')throw new Error('Actual image CSS or width differs');
    const pngPath=path.join(own,'browser',`${row.goalId}.${width}px.actual.png`);
    await page.locator('img').screenshot({path:pngPath});
    const bytes=await fs.readFile(pngPath);
    results.push({goalId:row.goalId,assetHash:row.actualFinalOriginal.sha256,requestedImageWidth:width,actualMetrics:metrics,screenshot:{path:path.relative(root,pngPath),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length},fixtureHtml:path.relative(root,htmlPath),screenshotGenerationIsSight:false});
    await page.close();
  }
}
const report={documentType:'independent-isolated-goalcard-image-css-browser-render-receipt',startedAtUTC,completedAtUTC:new Date().toISOString(),browserVersion:browser.version(),browserExecutable:chromium.executablePath(),actualCssSource:'app/src/components/GoalCard.tsx:672',viewportWidthIsNotImageWidth:true,fullAppReviewed:false,nativeBookReviewed:false,activeWrites:false,results};
await browser.close();
const destination=path.join(own,'browser','independent-360-680-image-widths.actual.browser.receipt.json');
await fs.writeFile(destination+'.tmp',JSON.stringify(report,null,2)+'\n');await fs.rename(destination+'.tmp',destination);
console.log(JSON.stringify({actualScreenshots:results.length,actualWidths:results.map(r=>r.actualMetrics.width),browser:report.browserVersion,report:path.relative(root,destination)}));
