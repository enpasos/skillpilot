import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
const req=createRequire(resolve('app/package.json'));
const {chromium}=req('playwright');
const root=resolve('tmp/chemie-m7-resumed-20261016/F03-image-author-v1');
const file=resolve(root,'8b2d351e-e44f-5385-9b89-13ef54b5918f.png');
const data=readFileSync(file).toString('base64');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const rows=[];
try { for(const width of [360,680]) {
 const page=await browser.newPage({viewport:{width,height:600},deviceScaleFactor:1});
 await page.setContent(`<style>html,body{margin:0;padding:0}img{display:block;width:${width}px;height:auto;max-height:448px;object-fit:contain}</style><img src="data:image/png;base64,${data}">`);
 await page.locator('img').evaluate(async img=>{await img.decode()});
 const box=await page.locator('img').boundingBox();
 const path=resolve(root,`actual-css-${width}.png`);
 await page.locator('img').screenshot({path});
 rows.push({width,actualBox:box,path});await page.close();
 }} finally {await browser.close()}
writeFileSync(resolve(root,'ACTUAL.css-size-render-captures.json'),JSON.stringify({role:'Actual CSS image render captures for author/independent inspection, not approval',source:file,rows},null,2)+'\n');
console.log(JSON.stringify(rows));
