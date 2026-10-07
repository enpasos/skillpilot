const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url');
const {chromium}=require(path.resolve(__dirname,'../../../../../../app/node_modules/playwright'));
const raw=JSON.parse(fs.readFileSync(path.join(__dirname,'eleven-whole-current-goals-materials-source-prompt-native-preparation.author.raw.json'),'utf8'));
const stage=process.argv.includes('--final')?'final':'initial';
const changed=['1975','485e','9b96','8b23','080b'];
const out=path.join(__dirname,'author-displays',stage);fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({headless:true}),page=await browser.newPage({viewport:{width:760,height:600},deviceScaleFactor:1}),records=[];
for(const row of raw.plans){const id=row.goalId,attempt=stage==='final'&&changed.some(p=>id.startsWith(p))?'02':'01';
const file=path.join(__dirname,'generated-originals',id,'original-generated-attempt-'+attempt+'.png');
for(const width of [360,680]){const html='<!doctype html><html lang="de"><meta charset="utf-8"><title>Isolierte Autoren-Bilddarstellung</title><style>html,body{margin:0;background:white}figure{margin:16px;overflow:hidden;border-radius:8px;border:1px solid #e2e8f0;background:white;width:'+width+'px}img{display:block;height:auto;max-height:448px;width:100%;object-fit:contain}</style><figure><img src="'+pathToFileURL(file).href+'" alt="Modellillustration im Autorensichttest"></figure></html>';
const fixture=path.join(out,id+'.'+width+'.html');fs.writeFileSync(fixture,html);await page.goto(pathToFileURL(fixture).href);await page.locator('img').evaluate(async im=>await im.decode());
const actual=await page.locator('img').evaluate(im=>{const r=im.getBoundingClientRect(),c=getComputedStyle(im);return {imageBox:{x:r.x,y:r.y,width:r.width,height:r.height},naturalWidth:im.naturalWidth,naturalHeight:im.naturalHeight,css:{display:c.display,height:c.height,maxHeight:c.maxHeight,width:c.width,objectFit:c.objectFit},devicePixelRatio:window.devicePixelRatio};});
if(actual.imageBox.width!==width||actual.css.maxHeight!=='448px'||actual.css.objectFit!=='contain'||actual.devicePixelRatio!==1)throw Error('Actual image width/CSS mismatch');
const screenshot=path.join(out,id+'.'+width+'.png');await page.locator('img').screenshot({path:screenshot});records.push({goalId:id,attempt,requestedActualImageWidth:width,file,fixture,screenshot,...actual});}}
await browser.close();fs.writeFileSync(path.join(out,'actual-360-680-display.receipt.json'),JSON.stringify({role:'image author isolated display; no independent V or full app acceptance',actualGoalCardCssSource:'app/src/components/GoalCard.tsx:665-673',noCssExceptions:true,noOriginalPngModification:true,records},null,2)+'\n');process.stdout.write(JSON.stringify({stage,actualDisplays:records.length,widths:[360,680]})+'\n');})();
