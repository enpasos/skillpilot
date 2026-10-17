import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs';
const root='/mnt/e/skillpilot-chemie-L7-20261017/chemie-current439-material4-v3-fresh-independent-a-v1';
const list=JSON.parse(await fs.readFile(path.join(root,'INPUT.current4-v3.actual-images.json'),'utf8'));
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
await fs.mkdir(path.join(root,'screenshots'),{recursive:true});
const browser=await chromium.launch({executablePath:'/home/enpasos/.cache/ms-playwright/chromium-1217/chrome-linux64/chrome',headless:true,args:['--no-sandbox']});
const manifest={role:'Actual current4 V3 goal-card image browser renders for independent D/P review A',createdAtUTC:new Date().toISOString(),browser:await browser.version(),deviceScaleFactor:1,widths:[360,680],maxHeight:448,objectFit:'contain',images:[]};
for(const item of list){
 const bytes=await fs.readFile(item.path);if(sha(bytes)!==item.sha256)throw Error('Current image changed');
 for(const width of [360,680]){
  const context=await browser.newContext({viewport:{width,height:900},deviceScaleFactor:1});const page=await context.newPage();
  const mime=item.path.endsWith('.png')?'image/png':'image/jpeg';
  await page.setContent(`<style>html,body,figure{margin:0;padding:0;background:white}figure{width:${width}px;overflow:hidden}img{display:block;width:100%;height:auto;max-height:448px;object-fit:contain}</style><figure><img alt="Current goal visual" src="data:${mime};base64,${bytes.toString('base64')}"></figure>`);
  await page.locator('img').evaluate(async image=>{await image.decode()});
  const geometry=await page.locator('img').evaluate(image=>({naturalWidth:image.naturalWidth,naturalHeight:image.naturalHeight,width:image.width,height:image.height,complete:image.complete}));
  const output=path.join(root,'screenshots',`${item.goalId}.width-${width}.png`);await page.locator('figure').screenshot({path:output});
  const shot=await fs.readFile(output);manifest.images.push({goalId:item.goalId,inputPath:item.path,inputSha256:item.sha256,width,geometry,screenshot:{path:output,sha256:sha(shot),bytes:shot.length}});await context.close();
 }
}
await browser.close();await fs.writeFile(path.join(root,'TECHNICAL.current4-v3-real-browser-images.json'),JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({images:list.length,screenshots:manifest.images.length,allDecoded:manifest.images.every(x=>x.geometry.complete)}));
