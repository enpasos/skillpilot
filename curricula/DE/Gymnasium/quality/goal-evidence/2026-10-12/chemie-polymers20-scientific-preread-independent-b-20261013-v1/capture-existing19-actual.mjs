import {chromium} from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs';
import {readFile,writeFile,mkdir} from 'node:fs/promises';import{createHash}from'node:crypto';
const own=process.argv[2];const input='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-polymers-materials20-current402-current220-scientific-author-20261012-v1/author/current20.existing-asset-bindings.json';
const assets=JSON.parse(await readFile(input,'utf8')).assets.filter(a=>a.assetPath);if(assets.length!==19)throw new Error('Expected19');
const component=await readFile('app/src/components/GoalCard.tsx','utf8');if(!component.includes('className="block h-auto max-h-[28rem] w-full object-contain"'))throw new Error('CSS changed');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const captures=[];
try{for(const a of assets){
 const bytes=await readFile(a.assetPath);const sha='sha256:'+createHash('sha256').update(bytes).digest('hex');if(sha!==a.sha256)throw new Error('Asset changed '+a.goalId);
 const out=`${own}/images/${a.goalId}`;await mkdir(out,{recursive:true});const displays=[];
 for(const width of[360,680]){const page=await browser.newPage({viewport:{width:width+32,height:800},deviceScaleFactor:1});
 await page.route('https://skillpilot-review.invalid/**',async route=>{const p=new URL(route.request().url()).pathname;if(p==='/image.jpg')return route.fulfill({contentType:'image/jpeg',body:bytes});if(p==='/')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta charset="utf-8"><style>html{font-size:16px}body{margin:0;background:white}img{display:block;height:auto;max-height:28rem;width:${width}px;object-fit:contain}</style><img src="/image.jpg" alt="Prüfbild">`});throw new Error('unexpected request')});
 await page.goto('https://skillpilot-review.invalid/',{waitUntil:'networkidle'});const img=page.locator('img');await img.evaluate(i=>i.decode());const natural=await img.evaluate(i=>({width:i.naturalWidth,height:i.naturalHeight}));const bounds=await img.boundingBox();const scale=Math.min(bounds.width/natural.width,bounds.height/natural.height);const screenshot=`${out}/actual-${width}px.png`;await img.screenshot({path:screenshot});displays.push({width,screenshot,imgElementBounds:bounds,naturalSize:natural,containedImageBounds:{width:natural.width*scale,height:natural.height*scale}});await page.close();
 }
 captures.push({goalId:a.goalId,sourcePath:a.assetPath,sourceSha256:sha,displays});
}
await writeFile(`${own}/existing19.browser-displays.actual.json`,JSON.stringify({schemaVersion:1,actualBrowser:'Playwright Chromium',renderScope:'Exact current GoalCard image CSS reproduced; not full mounted React/native review',componentSourceSha256:createHash('sha256').update(component).digest('hex'),assets:captures},null,2)+'\n',{flag:'wx'});console.log(JSON.stringify({actualAssets:captures.length,actualDisplays:captures.length*2}));
}finally{await browser.close()}
