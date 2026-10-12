import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createRequire} from 'node:module';
import {createHash} from 'node:crypto';
const req=createRequire(process.cwd()+'/app/package.json');const {chromium}=req('playwright');
const O='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-5169-image-native-successor-independent-a-20261012-v9';
const asset='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q4-5169-current220-final-image-native-root-20261012-v8/assets/5169bb6b-f065-5798-8164-9b4521e44ae8.png';
const bytes=readFileSync(asset),sha=x=>'sha256:'+createHash('sha256').update(x).digest('hex');const browser=await chromium.launch({headless:true});const results=[];
mkdirSync(O+'/own-image-frames',{recursive:true});
for(const width of [360,680]){const page=await browser.newPage({viewport:{width,height:800},deviceScaleFactor:1});await page.setContent('<html><body style="margin:16px"><div style="width:100%;max-width:597px;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center"><img id="goal" style="width:100%;height:100%;object-fit:contain" src="data:image/png;base64,'+bytes.toString('base64')+'"></div></body></html>');await page.locator('#goal').evaluate(async im=>{if(!im.complete)await new Promise(r=>{im.onload=r});});const loc=page.locator('div'),bounds=await loc.boundingBox();const p=O+'/own-image-frames/viewport-'+width+'.png';await loc.screenshot({path:p});results.push({viewportWidth:width,actualBounds:bounds,path:p,sha256:sha(readFileSync(p)),capturedAtUTC:new Date().toISOString()});await page.close();}
await browser.close();writeFileSync(O+'/own-image-frames/capture.actual.json',JSON.stringify({assetPath:asset,assetSHA256:sha(bytes),realChromiumRasterCapture:true,semanticImageEditing:false,deviceScaleFactor:1,results},null,2)+'\n');
