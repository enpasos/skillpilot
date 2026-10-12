import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';
const root='/home/enpasos/projects/skillpilot',own=process.argv[2];
const input=JSON.parse(await readFile(resolve(own,'INPUT.exact-hashes-and-scope.actual.json'),'utf8'));
const component=await readFile(resolve(root,'app/src/components/GoalCard.tsx'),'utf8');
if(!component.includes('className="block h-auto max-h-[28rem] w-full object-contain"'))throw new Error('GoalCard image CSS changed');
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const captures=[];
try{
 for(const a of input.sixAssets){
  const bytes=await readFile(resolve(root,a.path));
  if('sha256:'+createHash('sha256').update(bytes).digest('hex')!==a.sha256)throw new Error('Changed asset');
  const dir=resolve(own,'displays',a.goalId);await mkdir(dir,{recursive:true});
  for(const width of [360,680,316]){
   const page=await browser.newPage({viewport:{width:width+32,height:650},deviceScaleFactor:1});
   await page.route('https://skillpilot-v-review.invalid/**',async route=>{
    const p=new URL(route.request().url()).pathname;
    if(p==='/image.png')return route.fulfill({contentType:'image/jpeg',body:bytes});
    if(p==='/')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta charset="utf-8"><style>html{font-size:16px;}body{margin:0;background:white;}figure{width:${width}px;margin:0;overflow:hidden;}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain;}</style><figure><img src="/image.png" alt="${a.goalId}"></figure>`});
    throw new Error('Unexpected request');
   });
   await page.goto('https://skillpilot-v-review.invalid/',{waitUntil:'networkidle'});
   const im=page.locator('img');await im.evaluate(x=>x.decode());
   const bounds=await im.boundingBox(),natural=await im.evaluate(x=>({width:x.naturalWidth,height:x.naturalHeight}));
   const scale=Math.min(bounds.width/natural.width,bounds.height/natural.height);
   const content={width:natural.width*scale,height:natural.height*scale,x:bounds.x+(bounds.width-natural.width*scale)/2,y:bounds.y+(bounds.height-natural.height*scale)/2};
   const shot=resolve(dir,`actual-image-${width}px.png`);await im.screenshot({path:shot});
   captures.push({goalId:a.goalId,sourcePath:a.path,sourceSha256:a.sha256,imgWidth:width,maxImageHeight:448,naturalSize:natural,imgElementBounds:bounds,actualPaintBounds:content,viewScope:width===316?'supplementary narrow mobile image-content width; exact CSS, not mounted card':width===360?'required mobile image-content width': 'desktop image-content width with real 448px cap',screenshotPath:shot.slice(root.length+1),screenshotSha256:'sha256:'+createHash('sha256').update(await readFile(shot)).digest('hex')});
   await page.close();
  }
 }
 await writeFile(resolve(own,'BROWSER.six-assets.actual-display.receipt.json'),JSON.stringify({schemaVersion:1,browser:'Playwright Chromium',deviceScaleFactor:1,contract:'Exact current GoalCard image CSS in isolated actual browser harness; no full mounted React/native page claim',componentPath:'app/src/components/GoalCard.tsx',componentSha256:'sha256:'+createHash('sha256').update(component).digest('hex'),css:'display:block;height:auto;max-height:28rem;width:100%;object-fit:contain;font-size-root:16px',captures},null,2)+'\n',{flag:'wx'});
 console.log(JSON.stringify({actualCaptures:captures.length,desktopPaint:captures.filter(x=>x.imgWidth===680).map(x=>({goalId:x.goalId,actualPaintBounds:x.actualPaintBounds})),sourceBytesModified:false}));
}finally{await browser.close();}
