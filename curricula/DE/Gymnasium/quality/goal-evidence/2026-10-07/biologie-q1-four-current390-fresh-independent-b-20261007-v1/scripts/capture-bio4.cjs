// SPDX-License-Identifier: Apache-2.0
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const {pathToFileURL}=require('url');
const root='/home/enpasos/projects/skillpilot';
const out=path.resolve(__dirname,'..');
const author=path.join(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-q1-four-current390-native-source-operator-candidate-author-20261007-v1');
const {chromium}=require(path.join(root,'app/node_modules/playwright'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
(async()=>{
 for(const d of ['browser','receipts'])fs.mkdirSync(path.join(out,d),{recursive:true});
 const input=JSON.parse(fs.readFileSync(path.join(author,'four-current-native-whole-goals-cases-source-review-input.author.raw.json')));
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:760,height:600},deviceScaleFactor:1});
 const records=[];
 try{
  for(const goal of input.wholeFourGoals){
   const id=goal.goalId, asset=path.join(author,'selected-existing-images',id+'.png');
   const expected=goal.nativeWholeInput.reviewContext.page.visualization.originalDigest.replace('sha256:','');
   if(sha(asset)!==expected)throw Error('Image SHA mismatch '+id);
   for(const width of [360,680]){
    const fixture=path.join(out,'browser',id+'.'+width+'.html');
    fs.writeFileSync(fixture,`<!doctype html><html lang="de"><meta charset="utf-8"><title>Independent Bio V-B isolated view</title><style>html,body{margin:0;background:white}img{display:block;height:auto;max-height:448px;width:${width}px;object-fit:contain}</style><img src="${pathToFileURL(asset).href}">`);
    await page.goto(pathToFileURL(fixture).href);await page.locator('img').evaluate(img=>img.decode());
    const geometry=await page.locator('img').evaluate(img=>{const b=img.getBoundingClientRect(),c=getComputedStyle(img);return {src:img.src,naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,imageBox:{x:b.x,y:b.y,width:b.width,height:b.height},computed:{maxHeight:c.maxHeight,objectFit:c.objectFit},devicePixelRatio:devicePixelRatio};});
    if(geometry.imageBox.width!==width||geometry.naturalWidth!==1672||geometry.naturalHeight!==941||geometry.computed.maxHeight!=='448px'||geometry.computed.objectFit!=='contain')throw Error('Geometry mismatch '+id);
    const screenshot=path.join(out,'browser',id+'.'+width+'.png');await page.locator('img').screenshot({path:screenshot});
    records.push({goalId:id,assetPath:path.relative(root,asset),assetSha256:expected,requestedActualWidth:width,fixture:path.relative(root,fixture),fixtureSha256:sha(fixture),screenshot:path.relative(root,screenshot),screenshotSha256:sha(screenshot),geometry});
   }
  }
  fs.writeFileSync(path.join(out,'receipts/own-four-isolated-browser.actual.json'),JSON.stringify({role:'Independent B actual four current selected raster source/geometry binding',actualScreens:records.length,noCssException:true,appAcceptance:false,humanApproval:false,records},null,2)+'\n');
  console.log(JSON.stringify({selectedCount:input.wholeFourGoals.length,actualScreenshotCount:records.length}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
