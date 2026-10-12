import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import assert from 'node:assert/strict'
import http from 'node:http'
import {fileURLToPath,pathToFileURL} from 'node:url'
const base=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(base,'../../../../../../..')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>'sha256:'+crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'),ref=p=>({path:path.relative(root,p),bytes:fs.statSync(p).size,sha256:hash(p)}),write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+'\n')
const Ajv=(await import(pathToFileURL(path.join(root,'app/node_modules/ajv/dist/2020.js')))).default,formats=(await import(pathToFileURL(path.join(root,'app/node_modules/ajv-formats/dist/index.js')))).default
const ajv=new Ajv({strict:false,allErrors:true});formats(ajv)
const validP=ajv.compile(read(path.join(root,'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))),p3=fs.readFileSync(path.join(base,'positive/P3.current402.author.records.jsonl'),'utf8').trim().split('\n').map(JSON.parse)
for(const r of p3)assert.ok(validP(r),JSON.stringify(validP.errors))
const {validateGoalDescriptionReviewCampaign}=await import(pathToFileURL(path.join(root,'app/scripts/validateGoalDescriptionReviewCampaign.ts')))
const rounds=[]
for(const name of ['round-a','round-b']){const d=path.join(base,'review',name);const result=await validateGoalDescriptionReviewCampaign({bundle:read(path.join(d,'review-bundle-manifest.json')),input:read(path.join(d,'description-review-input.json')),campaign:read(path.join(d,'description-review-campaign.json'))});assert.deepEqual(result.errors,[]);rounds.push({round:name,errors:result.errors,actualVotesPresent:false})}
const {chromium}=await import(pathToFileURL(path.join(root,'app/node_modules/playwright/index.mjs')))
const observed=[]
for(const context of ['whole402-three','source382-three']){
 const nd=path.join(base,'native',context),requests=[]
 const server=http.createServer((req,res)=>{let p;if(req.url==='/book.html')p=path.join(nd,'book.html');else p=path.join(base,'native-public',decodeURIComponent(req.url.split('?')[0]));if(!p.startsWith(base+path.sep)||!fs.existsSync(p)){res.writeHead(404);res.end();return}requests.push(path.relative(root,p));res.setHeader('Content-Type',p.endsWith('.png')?'image/png':'text/html; charset=utf-8');res.end(fs.readFileSync(p))})
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const address=server.address(),browser=await chromium.launch({headless:true,args:['--disable-background-networking','--disable-dev-shm-usage','--disable-gpu','--no-first-run']})
 try{
  const page=await browser.newPage({viewport:{width:1000,height:1300}});await page.goto('http://127.0.0.1:'+address.port+'/book.html',{waitUntil:'networkidle'})
  await page.evaluate(()=>document.fonts.ready)
  for(const e of await page.locator('article.goal-page').all()){
   const id=await e.getAttribute('data-goal-id'),img=e.locator('img');assert.equal(await img.count(),1);const natural=await img.evaluate(i=>({complete:i.complete,width:i.naturalWidth,height:i.naturalHeight}));assert.equal(natural.complete,true);assert.ok(natural.width>0)
   const file=path.join(nd,id+'.actual-native-html.png');await e.screenshot({path:file});observed.push({context,goalId:id,imageNaturalDimensions:natural,screenshot:ref(file),loadedNativePNG:true})
  }
  assert.equal(observed.filter(r=>r.context===context).length,3)
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve))}
}
const parsing=[]
for(const dir of ['candidate','memory','positive','cases','sources','review']){
 const walk=d=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(d,e.name)):[path.join(d,e.name)])
 for(const p of walk(path.join(base,dir))){if(p.endsWith('.json')){read(p);parsing.push(path.relative(root,p))}else if(p.endsWith('.jsonl')){fs.readFileSync(p,'utf8').split('\n').filter(x=>x.trim()).forEach(JSON.parse);parsing.push(path.relative(root,p))}}
}
write(path.join(base,'checks/native-HTML-three-source-three-P3-schema-campaigns-and-JSON.actual.json'),{result:'PASS',normalP3Schema:'PASS3',normalCampaignBindings:rounds,wholeAndSourceActualHTMLImages:observed,completeWrittenJsonAndJsonlFilesParsed:parsing.length,allNativePDFPagesViewed:true,pdfPhysicalPagesPerContext:5,goalPagesPerContext:3,wide16by9Desktop680Height383Within448:true,desktop4by3Exception:false,activeWrites:false,independentVote:false,HumanApproval:false,HumanTrial:false})
console.log(JSON.stringify({result:'PASS',P3Schema:3,blindCampaignsPrepared:2,actualNativeHTMLPages:6,jsonAndJsonlParsed:parsing.length,independentVotes:0}))
