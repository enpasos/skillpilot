import {createServer} from 'node:http'
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs'
import {resolve} from 'node:path'
import {createHash} from 'node:crypto'
import {createRequire} from 'node:module'
const root=resolve('.');const own='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v1'
const scope=JSON.parse(readFileSync(resolve(root,own,'current25-provisional-scope-and-valid-existing-bindings.author.json'),'utf8'))
const rows=scope.selectedWholeCurrentRows
const sha=(b:Buffer)=>'sha256:'+createHash('sha256').update(b).digest('hex')
const server=createServer((req,res)=>{try{const path=decodeURIComponent(new URL(req.url!,'http://localhost').pathname);if(!path.startsWith('/assets/goal-visualizations/chemie/'))throw new Error('bounded assets only');const bytes=readFileSync(resolve(root,'app/public'+path));res.writeHead(200,{'content-type':'image/jpeg'});res.end(bytes)}catch{res.writeHead(404);res.end()}})
await new Promise<void>(r=>server.listen(0,'127.0.0.1',r))
const port=(server.address() as any).port
const require=createRequire(resolve(root,'app/package.json'));const {chromium}=require('playwright')
const browser=await chromium.launch({headless:true});const out=resolve(root,own,'actual-existing-raster-width-views');mkdirSync(out,{recursive:true})
const files:any[]=[]
try{for(const width of [360,680]){const page=await browser.newPage({viewport:{width,height:900},deviceScaleFactor:1})
 for(let group=0;group<5;group++){const selected=rows.slice(group*5,group*5+5);await page.setContent('<!doctype html><html lang="de"><head><meta charset="utf-8"><style>*{box-sizing:border-box}body{margin:0;background:#fff;font:12px sans-serif}article{margin:0 0 12px}header{padding:4px;font-size:12px;line-height:1.25}img{display:block;width:'+width+'px;height:auto}</style></head><body>'+selected.map((r:any)=>{const goal=r.wholeCurrentGoal;const link=goal.resourceLinks.find((l:any)=>l.type==='goal-visualization');return '<article><header>'+goal.id+'<br>'+goal.title+'</header><img src="http://127.0.0.1:'+port+link.url+'" alt="'+goal.title.replaceAll('"','&quot;')+'"></article>'}).join('')+'</body></html>')
 await page.locator('img').evaluateAll((images:any[])=>Promise.all(images.map(i=>i.complete?Promise.resolve():new Promise(r=>i.addEventListener('load',r,{once:true})))))
 const bounds=await page.locator('img').evaluateAll((images:any[])=>images.map(i=>({src:new URL(i.src).pathname,naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,renderedWidth:i.getBoundingClientRect().width,renderedHeight:i.getBoundingClientRect().height,complete:i.complete})))
 if(bounds.some(b=>b.naturalWidth!==2752||b.renderedWidth!==width||!b.complete))throw new Error('Actual current raster load/width mismatch')
 const name='actual-current-five-group-'+(group+1)+'.width-'+width+'.png';await page.screenshot({path:resolve(out,name),fullPage:true})
 if(width===680){for(const [j,r] of selected.entries()){const n='actual-current-'+r.goalId+'.width-680.png';await page.locator('article').nth(j).screenshot({path:resolve(out,n)});const bytes=readFileSync(resolve(out,n));files.push({path:own+'/actual-existing-raster-width-views/'+n,sha256:sha(bytes),bytes:bytes.length,actualWidth:680,goalIds:[r.goalId],actualImages:[bounds[j]].map(b=>({...b,sourcePath:'app/public'+b.src,sourceSha256:sha(readFileSync(resolve(root,'app/public'+b.src)))}))})}}
 const bytes=readFileSync(resolve(out,name));files.push({path:own+'/actual-existing-raster-width-views/'+name,sha256:sha(bytes),bytes:bytes.length,actualWidth:width,goalIds:selected.map((r:any)=>r.goalId),actualImages:bounds.map(b=>({...b,sourcePath:'app/public'+b.src,sourceSha256:sha(readFileSync(resolve(root,'app/public'+b.src)))}))})
 }await page.close()}
 }finally{await browser.close();await new Promise<void>(r=>server.close(()=>r()))}
writeFileSync(resolve(root,own,'actual-current25-raster-browser-width-rendering.receipt.json'),JSON.stringify({role:'AUTHOR actual read-only browser renders of unchanged current JPG bytes; not independent V acceptance',createdAtUTC:new Date().toISOString(),browserEngine:'Chromium via installed Playwright',actualImageWidths:[360,680],imageCount:25,screenshotCount:35,deviceScaleFactor:1,actualSubject:'Chemie',sourceCopiesCreated:false,activeWrites:false,files},null,2)+'\n')
console.log(JSON.stringify({actualCurrentImages:25,widths:[360,680],screenshots:35,bytes:files.reduce((n,r)=>n+r.bytes,0),nativeApproval:false}))
