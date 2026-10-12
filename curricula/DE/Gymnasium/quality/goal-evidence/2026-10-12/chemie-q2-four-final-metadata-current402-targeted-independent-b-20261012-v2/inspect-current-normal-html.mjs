import {dirname,resolve} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
const own=dirname(fileURLToPath(import.meta.url));let root=own;for(let i=0;i<7;i++)root=dirname(root);
const {chromium}=await import(pathToFileURL(resolve(root,'app/node_modules/playwright/index.mjs')).href);
const base=resolve(root,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12');
const prep=resolve(base,'chemie-q2-four-final-resource-metadata-current402-root-preparation-20261012-v2');
const prior=resolve(base,'chemie-q2-four-joint-current402-root-integration-preparation-20261012-v1');
const input=resolve(prep,'native-D4/bundle/book.html');const dir=resolve(own,'inspection');mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({headless:true});const page=await browser.newPage({viewport:{width:1000,height:1300},deviceScaleFactor:1});
const assets=[];
await page.route('http://current-normal-native.invalid/**',async route=>{
 const path=new URL(route.request().url()).pathname;
 if(path==='/book.html')return route.fulfill({body:readFileSync(input),contentType:'text/html'});
 if(path.startsWith('/assets/goal-visualizations/chemie/')){
  const parts=path.split('/');const id=parts.at(-2);const name=parts.at(-1);
  const f=['127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a','197bc2c5-835e-59e7-9263-5684e89799cc'].includes(id)?resolve(prior,'assets',id,name):resolve(root,'app/public'+path);
  const body=readFileSync(f);assets.push({url:path,path:f.slice(root.length+1),digest:'sha256:'+createHash('sha256').update(body).digest('hex')});
  return route.fulfill({body,contentType:name.endsWith('.png')?'image/png':'image/jpeg'});
 }
 return route.abort();
});
await page.goto('http://current-normal-native.invalid/book.html');await page.emulateMedia({media:'print'});await page.evaluate(()=>document.fonts.ready);await page.evaluate(async()=>await Promise.all([...document.images].map(i=>i.decode())));
const report=[];
for(const id of ['014e6d85-eecf-5228-9031-52a39981cd0d','127e2fc9-23f3-5ce8-a1c9-8c9e014c8a8a','197bc2c5-835e-59e7-9263-5684e89799cc','7b477c2b-0919-5d70-810b-188a88c55ffc']){
 const el=page.locator('#goal-'+id);await el.screenshot({path:resolve(dir,id+'.current-HTML.png')});
 const complete=await el.locator('img').evaluate(i=>i.complete&&i.naturalWidth>0);if(!complete)throw new Error('Actual image missing '+id);
 report.push({goalId:id,box:await el.boundingBox(),altText:await el.locator('img').getAttribute('alt'),complete,text:await el.innerText()});
}
writeFileSync(resolve(dir,'actual-rendered-HTML-receipt.json'),JSON.stringify({input:input.slice(root.length+1),htmlDigest:'sha256:'+createHash('sha256').update(readFileSync(input)).digest('hex'),renderContext:'Exact unchanged HTML served with its exact four referenced asset bytes, intercepted locally; direct file URL did not resolve absolute /assets routes and was corrected before final review.',assets,pages:report},null,2)+'\n');
await browser.close();console.log('Captured all four actual current normal HTML goal elements with exact loaded image bytes.');
