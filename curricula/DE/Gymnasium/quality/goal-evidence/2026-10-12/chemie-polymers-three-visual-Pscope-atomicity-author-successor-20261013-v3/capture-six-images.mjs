// Technical scoped rendering fixture, Apache-2.0. No app acceptance claim.
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=process.cwd(),out=dirname(fileURLToPath(import.meta.url));
const {chromium: browserType}=await import(resolve(root,'app/node_modules/playwright/index.mjs'));
const browser=await browserType.launch({executablePath:'/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
const bindings=JSON.parse(readFileSync(resolve(out,'six.additive-resource-links-and-original-png-bindings.json'),'utf8')).bindings;
mkdirSync(resolve(out,'inspection'),{recursive:true});const rows=[];
for(const b of bindings){
 const bytes=readFileSync(resolve(root,b.actualCandidateAssetPath)),sha256='sha256:'+createHash('sha256').update(bytes).digest('hex');
 for(const [name,width]of [['mobile316',316],['phone360',360],['wide680',680],['desktop800',800]]){
  const page=await browser.newPage({viewport:{width:width+32,height:900},deviceScaleFactor:1});
  await page.setContent(`<style>body{margin:16px}figure{margin:0;width:${width}px}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain}</style><figure><img src="data:image/png;base64,${bytes.toString('base64')}"></figure>`);
  const img=page.locator('img');await img.evaluate(i=>i.decode());
  const dimensions=await img.evaluate(i=>{const r=i.getBoundingClientRect(),scale=Math.min(r.width/i.naturalWidth,r.height/i.naturalHeight);return {naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,domWidth:r.width,domHeight:r.height,paintedWidth:i.naturalWidth*scale,paintedHeight:i.naturalHeight*scale}});
  const file=`inspection/${b.goalId}.${name}.actual.png`;await img.screenshot({path:resolve(out,file)});rows.push({goalId:b.goalId,assetSha256:sha256,size:name,dimensions,capturePath:file});await page.close();
 }
}
await browser.close();writeFileSync(resolve(out,'inspection/six.exact-native-image-CSS-dimensions.actual.json'),JSON.stringify({schemaVersion:1,actualCapturedAtUTC:new Date().toISOString(),fixture:'Exact native img CSS: block;height:auto;max-height:28rem;width:100%;object-fit:contain',fullReactGoalCardOrHostAcceptance:false,actualProductionMobilePaintedWidthFromRoot:316,rows},null,2)+'\n');
console.log(JSON.stringify({assets:bindings.length,captures:rows.length,actualMobile316:true,fullAppAcceptance:false}));
