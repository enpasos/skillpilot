import { chromium } from '/home/enpasos/projects/skillpilot/app/node_modules/playwright/index.mjs';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const [source, output] = process.argv.slice(2);
const bytes = await readFile(source);
const componentSource = await readFile('app/src/components/GoalCard.tsx','utf8');
if (!componentSource.includes('className="block h-auto max-h-[28rem] w-full object-contain"')) throw new Error('GoalCard img CSS changed');
const browser = await chromium.launch({headless:true,args:['--no-sandbox']});
const captures=[];
await mkdir(output,{recursive:true});
try {
 for (const width of [360,680]) {
  const page=await browser.newPage({viewport:{width:width+32,height:800},deviceScaleFactor:1});
  await page.route('https://skillpilot-review.invalid/**', async route=>{
   const p=new URL(route.request().url()).pathname;
   if(p==='/image.png') return route.fulfill({contentType:'image/png',body:bytes});
   if(p==='/')return route.fulfill({contentType:'text/html',body:`<!doctype html><meta charset="utf-8"><style>html{font-size:16px;}body{margin:0;background:#fff;}figure{width:${width}px;margin:0;overflow:hidden;}img{display:block;height:auto;max-height:28rem;width:100%;object-fit:contain;}</style><figure><img src="/image.png" alt="Silikon-Strukturmodell"></figure>`});
   throw new Error('Unexpected request');
  });
  await page.goto('https://skillpilot-review.invalid/',{waitUntil:'networkidle'});
  const im=page.locator('img');await im.evaluate(x=>x.decode());
  const bounds=await im.boundingBox();
  const natural=await im.evaluate(x=>({width:x.naturalWidth,height:x.naturalHeight}));
  const scale=Math.min(bounds.width/natural.width,bounds.height/natural.height);
  const content={width:natural.width*scale,height:natural.height*scale,x:bounds.x+(bounds.width-natural.width*scale)/2,y:bounds.y+(bounds.height-natural.height*scale)/2};
  const screenshot=`${output}/actual-goalcard-${width}px.png`;await im.screenshot({path:screenshot});
  const containedScreenshot=`${output}/actual-contained-${width===680?'672x448':'360x240'}.png`;
  await page.screenshot({path:containedScreenshot,clip:content});
  captures.push({viewport:{width:width+32,height:800},deviceScaleFactor:1,imgElementBounds:bounds,naturalSize:natural,containedImageBounds:content,screenshot,containedScreenshot});
  await page.close();
 }
 await writeFile(`${output}/browser-render.actual.json`,JSON.stringify({schemaVersion:1,browser:'Playwright Chromium',sourcePath:source,sourceSha256:createHash('sha256').update(bytes).digest('hex'),sourceBytes:bytes.length,renderContract:'Exact GoalCard image CSS reproduced in an isolated browser harness; not a full mounted GoalCard application or native goal-page approval',componentSourcePath:'app/src/components/GoalCard.tsx',componentSourceSha256:createHash('sha256').update(componentSource).digest('hex'),css:'display:block;height:auto;max-height:28rem;width:100%;object-fit:contain;root-font-size:16px',captures},null,2)+'\n',{flag:'wx'});
 process.stdout.write(JSON.stringify(captures)+'\n');
} finally {await browser.close();}
