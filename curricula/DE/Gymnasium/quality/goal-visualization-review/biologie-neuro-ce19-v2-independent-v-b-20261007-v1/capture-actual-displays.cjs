const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const crypto=require('node:crypto');
const {chromium}=require('/home/enpasos/projects/skillpilot/app/node_modules/playwright');
const root='/home/enpasos/projects/skillpilot';
const out=__dirname;
const rel='curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro-ce19-axon-leader-targeted-correction-author-20261007-v2/original-generated-targeted-axon-leader-attempt-02.png';
const asset=path.join(root,rel);
function binding(file) { const b=fs.readFileSync(file); return {path:path.relative(root,file),sha256:crypto.createHash('sha256').update(b).digest('hex'),bytes:b.length}; }
(async()=>{
 const startedAt=new Date().toISOString();
 const browser=await chromium.launch({headless:true});
 const context=await browser.newContext({viewport:{width:720,height:480},deviceScaleFactor:1});
 const page=await context.newPage();
 const displays=[];
 for(const width of [360,680]) {
  const htmlPath=path.join(out,'actual-displays',`ce19.${width}.html`);
  const html='<!doctype html><html lang="de"><meta charset="utf-8"><style>html,body{margin:0;padding:0;background:#fff}img{display:block;width:'+width+'px;height:auto;max-height:448px;object-fit:contain;object-position:center}</style><img id="review-image" src="'+pathToFileURL(asset).href+'" alt="Modell einer Nervenzelle: Dendriten führen zum Zellkörper, ein Axon verbindet ihn mit Endknöpfchen. Orange Pfeile zeigen eine mögliche Signalroute; die nächste Zelle liegt getrennt hinter dem synaptischen Spalt."></html>\n';
  fs.writeFileSync(htmlPath,html);
  await page.goto(pathToFileURL(htmlPath).href);
  await page.locator('#review-image').evaluate(async img=>{await img.decode()});
  const measured=await page.locator('#review-image').evaluate(img=>{const r=img.getBoundingClientRect(); const c=getComputedStyle(img); return {imageBounds:{x:r.x,y:r.y,width:r.width,height:r.height},naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,devicePixelRatio:window.devicePixelRatio,viewport:{width:innerWidth,height:innerHeight},css:{width:c.width,height:c.height,maxHeight:c.maxHeight,objectFit:c.objectFit},src:img.src,complete:img.complete};});
  if(measured.imageBounds.width!==width||measured.naturalWidth!==1672||measured.naturalHeight!==941||measured.devicePixelRatio!==1||!measured.complete) throw new Error('unexpected actual browser display');
  const imagePath=path.join(out,'actual-displays',`ce19.${width}.png`);
  await page.locator('#review-image').screenshot({path:imagePath});
  displays.push({requestedImageWidth:width,measured,html:binding(htmlPath),screenshot:binding(imagePath)});
 }
 const receipt={role:'independent-v-b-actual-browser-display-evidence',startedAt,finishedAt:new Date().toISOString(),renderer:'installed Playwright Chromium headless',browserVersion:browser.version(),input:binding(asset),displays};
 fs.writeFileSync(path.join(out,'actual-displays','actual-360-680-display.receipt.json'),JSON.stringify(receipt,null,2)+'\n');
 await browser.close();
 console.log(JSON.stringify(receipt,null,2));
})().catch(e=>{console.error(e);process.exit(1)});
