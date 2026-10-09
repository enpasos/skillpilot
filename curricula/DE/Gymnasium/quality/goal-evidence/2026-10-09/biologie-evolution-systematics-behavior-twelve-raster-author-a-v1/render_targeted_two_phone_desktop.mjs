// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(path.resolve('app/package.json'));
const {chromium}=require('playwright');
const root='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-twelve-raster-author-a-v1';
const executablePath=path.join(process.env.HOME,'.cache/ms-playwright/chromium-1234/chrome-linux64/chrome');
const browser=await chromium.launch({executablePath,headless:true,args:['--no-sandbox']});
const rows=[];
for(const name of fs.readdirSync(root).filter(x=>x.startsWith('ordinal-04-') || x.startsWith('ordinal-09-')).sort()){
 const dir=path.join(root,name);const asset=path.join(dir,fs.existsSync(path.join(dir,'candidate-v2.png'))?'candidate-v2.png':'candidate-v1.png');const base64=fs.readFileSync(asset).toString('base64');
 for(const width of [360,680]){
  const page=await browser.newPage({viewport:{width,height:1},deviceScaleFactor:1});
  await page.setContent(`<html><head><style>html,body{margin:0;padding:0;background:white;width:${width}px}img{display:block;width:100%;height:auto;object-fit:contain;max-height:28rem}</style></head><body><img src="data:image/png;base64,${base64}"></body></html>`);
  await page.locator('img').evaluate(img=>img.decode());
  const geometry=await page.locator('img').evaluate(img=>({naturalWidth:img.naturalWidth,naturalHeight:img.naturalHeight,renderedWidth:img.getBoundingClientRect().width,renderedHeight:img.getBoundingClientRect().height,documentWidth:document.documentElement.scrollWidth}));
  const screenshot=path.join(dir,`actual-selected-v2-${width}.png`);await page.screenshot({path:screenshot,fullPage:true});await page.close();rows.push({ordinal:Number(name.slice(8,10)),asset,path:screenshot,width,...geometry});
 }
}
await browser.close();fs.writeFileSync(path.join(root,'two-targeted-v2-actual-phone-desktop-browser-geometry.author-capture.json'),JSON.stringify({schemaVersion:1,actualBrowser:'Playwright Chromium chromium-1234/chrome-linux64/chrome',rasterEdits:0,rows},null,2)+'\n');console.log(JSON.stringify({captured:rows.length,documentOverflows:rows.filter(r=>r.documentWidth!==r.width).length}));
