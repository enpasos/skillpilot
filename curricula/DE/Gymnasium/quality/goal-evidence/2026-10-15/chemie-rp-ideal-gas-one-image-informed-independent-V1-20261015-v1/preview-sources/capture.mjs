import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createServer} from '../../../app/node_modules/vite/dist/node/index.js';
import react from '../../../app/node_modules/@vitejs/plugin-react/dist/index.js';
import tailwind from '../../../app/node_modules/@tailwindcss/vite/dist/index.mjs';
import {chromium} from '../../../app/node_modules/playwright/index.mjs';
const preview=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(preview,'../../..');
const own=path.join(repo,'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/chemie-rp-ideal-gas-one-image-informed-independent-V1-20261015-v1');
const out=path.join(own,'browser'); fs.mkdirSync(out,{recursive:true});
const data=JSON.parse(fs.readFileSync(path.join(preview,'whole-contexts.json')));
const ref=p=>({path:path.relative(repo,p),sha256:'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),bytes:fs.statSync(p).size});
const assetPlugin={name:'bounded-review-assets',configureServer(server){server.middlewares.use((req,res,next)=>{if(req.url?.startsWith('/review-assets/')){const id=req.url.split('/').pop();const row=data.wholeContexts.find(r=>r.goal.id===id);if(!row){res.statusCode=404;res.end();return;} const asset=path.join(preview,'assets',id+'.png');res.setHeader('Content-Type',asset.endsWith('.jpg')?'image/jpeg':'image/png');res.end(fs.readFileSync(asset));return;}next();});}};
const server=await createServer({configFile:false,root:preview,cacheDir:path.join(preview,'.vite-cache'),plugins:[assetPlugin,react(),tailwind()],server:{host:'127.0.0.1',port:0,strictPort:false,fs:{allow:[repo]}},resolve:{dedupe:['react','react-dom']},optimizeDeps:{include:['react','react-dom/client','lucide-react','react-markdown','remark-gfm','remark-math','rehype-katex']}});
let browser;
try{await server.listen(); const address=server.httpServer.address(); const base='http://127.0.0.1:'+address.port;
 browser=await chromium.launch({headless:true});const records=[];
 for(const width of [360,680]){const page=await browser.newPage({viewport:{width:720,height:1200},deviceScaleFactor:1}); const pageErrors=[]; page.on('pageerror',e=>pageErrors.push(e.message));
 await page.route('**/repositoryGoalSourceRationales*',route=>route.abort());
 await page.route('**/api/**',route=>route.fulfill({status:404,body:'{}',contentType:'application/json'}));
 await page.goto(base+'/?width='+width,{waitUntil:'networkidle',timeout:60000});
 for(const row of data.wholeContexts){const id=row.goal.id;const section=page.locator('#review-'+id);await section.locator('figure img').scrollIntoViewIfNeeded();await section.locator('figure img').evaluate(i=>i.decode());
 const metrics=await section.locator('figure img').evaluate(i=>{const b=i.getBoundingClientRect(),s=getComputedStyle(i);const effectiveScale=Math.min(b.width/i.naturalWidth,b.height/i.naturalHeight);return{naturalWidth:i.naturalWidth,naturalHeight:i.naturalHeight,imageElementWidth:b.width,imageElementHeight:b.height,objectFit:s.objectFit,maxHeight:s.maxHeight,actualContainedRasterWidth:i.naturalWidth*effectiveScale,actualContainedRasterHeight:i.naturalHeight*effectiveScale,complete:i.complete,currentSrc:i.currentSrc}});
 const name=`GoalCard.${id}.container-${width}.png`; await section.screenshot({path:path.join(out,name),animations:'disabled'});
 records.push({goalId:id,containerWidth:width,viewport:{width:720,height:1200},deviceScaleFactor:1,metrics,screenshot:ref(path.join(out,name)),sourceImage:ref(path.join(repo,row.physicalImagePath)),pageErrors:[...pageErrors]});}
 await page.close();}
 const receipt={schemaVersion:1,role:'Own actual unchanged React GoalCard component and repository CSS rendering; bounded container review',observedAtUTC:new Date().toISOString(),browserVersion:browser.version(),goalCardComponent:ref(path.join(repo,'app/src/components/GoalCard.tsx')),goalCardImageClass:'block h-auto max-h-[28rem] w-full object-contain',sourceCss:ref(path.join(repo,'app/src/index.css')),input:ref(path.join(own,'inputs/one-whole-goal-image-and-corrected-transfers.exact.json')),preview:ref(path.join(own,'preview-sources/index.html')),temporaryCssSourceDirective:ref(path.join(own,'preview-sources/style.css')),captureScript:ref(path.join(own,'preview-sources/capture.mjs')),sourceUnmodified:true,cssOverrides:false,records,scope:'360/680 px actual React GoalCard containers in 720 px viewport; unintegrated candidate only; no full-book, Native, D or host acceptance',sourceModalBoundary:'Unrelated lazy source rationale module request aborted; actual GoalCard catches failure.',humanApproval:false,humanTrial:false};
 fs.writeFileSync(path.join(out,'RECEIPT.actual-unchanged-GoalCard-360-680.json'),JSON.stringify(receipt,null,2)+'\n');console.log(JSON.stringify(receipt.records.map(r=>({id:r.goalId,width:r.containerWidth,metrics:r.metrics,pageErrors:r.pageErrors})),null,2));
} finally {if(browser)await browser.close();await server.close();}
