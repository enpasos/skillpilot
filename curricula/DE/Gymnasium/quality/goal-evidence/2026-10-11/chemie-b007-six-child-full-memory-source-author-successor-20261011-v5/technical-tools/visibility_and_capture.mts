import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
const root=process.cwd()
const pkg='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/chemie-b007-six-child-full-memory-source-author-successor-20261011-v5'
const cap=path.join(root,'tmp/m7-resumption-20261011/b007-v5-author/capsule')
const read=(name:string)=>JSON.parse(fs.readFileSync(path.resolve(root,name),'utf8'))
const ref=(name:string)=>{const b=fs.readFileSync(path.resolve(root,name));return{path:name,bytes:b.length,sha256:'sha256:'+createHash('sha256').update(b).digest('hex')}}
const write=(name:string,data:any)=>{fs.mkdirSync(path.dirname(path.resolve(root,name)),{recursive:true});fs.writeFileSync(path.resolve(root,name),JSON.stringify(data,null,2)+'\n');read(name)}
const canon=await import(pathToFileURL(path.join(root,'app/src/utils/authoring/canonicalAuthoring.ts')).href)
const views=await import(pathToFileURL(path.join(root,'app/src/utils/authoring/compositionViewAuthoring.ts')).href)
const full=read(`${pkg}/candidate/whole523-six-child-DE15-deck.inactive.json`)
const landscape=canon.normalizeCanonicalLandscape(full)
const goals=new Map(full.goals.map((g:any)=>[g.id,g]))
const memoryCfg=read(`${pkg}/candidate/full-memory-review.actual-pending.config.json`)
const scopes=[...memoryCfg.visibilityScopes,{label:'HE GK supplementary actual learner scope',viewPath:'curricula/DE/Gymnasium/composition-views/chemie/de-he-gk.view.json'},{label:'HE LK supplementary actual learner scope',viewPath:'curricula/DE/Gymnasium/composition-views/chemie/de-he-lk.view.json'}]
const memory='1e372b97-6f1c-596c-8a8b-fc03193d784a'
const origins=['4aeced1e-15cd-58df-83f7-68e2531c2d32','49d42c38-419c-5048-b7e9-860645dd122d']
const visibility=[]
for(const scope of scopes){
 const view=views.normalizeCompositionView(read(scope.viewPath))
 const compiled=views.compileCompositionView(view,landscape)
 assert.deepEqual(compiled.findings.filter((f:any)=>f.severity==='error'),[])
 const roles=views.collectCompositionProjectionRoleGoalIds(view.rootNodes,goals)
 const originPresent=origins.map(id=>({goalId:id,targetVisible:roles.targetGoalIds.has(id),prerequisiteOnly:roles.prerequisiteOnlyGoalIds.has(id)}))
 const memoryVisible=roles.targetGoalIds.has(memory)
 assert.ok(originPresent.every(v=>!v.targetVisible||memoryVisible))
 visibility.push({...scope,originPresent,memoryGoalId:memory,memoryTargetVisible:memoryVisible,ordinaryCompilerFindings:compiled.findings})
}
write(`${pkg}/checks/actual-nine-learner-visibility-scopes.author-technical.json`,{schemaVersion:1,role:'actual unchanged composition compilation and membership only; card necessity and scientific visibility review remain pending',originalConfiguredScopesRetained:7,supplementaryHEScopes:2,visibility,sharedDeckBoundary:'The existing shared basics node/deck is visible nationally. New goal origin tags do not create a runtime per-origin applicability filter; universally stated definitions do not establish national HE curriculum obligations.',independentCardAndMemoryReviewStatus:'pending',humanApproval:false})
const va='curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b007-six-child-images-genuine-independent-a-20261010-v1/FIRST.six-child-images-independent-a.verdicts.json'
const vb='curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b007-six-child-images-genuine-independent-b-20261011-v1/chemie.six-child-images.independent-b.qa.json'
const a=read(va),b=read(vb), tuples=[]
for(const row of a.verdicts){
 const goal=goals.get(row.goalId)
 assert.deepEqual(goal,row.wholeCurrentGoal)
 const qb=b.records.find((x:any)=>x.goalId===row.goalId)
 assert.equal(qb.title,goal.title);assert.equal(qb.description,goal.description)
 assert.equal(qb.umlautsCorrectChatGpt,'yes');assert.equal(qb.contentApprovedChatGpt,'yes');assert.equal(qb.humanApproved,'no')
 const asset=ref(qb.canonicalAssetPath)
 assert.equal(asset.sha256,qb.assetSha256)
 tuples.push({goalId:row.goalId,exactWholeGoalUnchanged:true,asset,priorIndependentA:ref(va),priorIndependentB:ref(vb),v5TechnicalTupleMatch:true,newVisualReview:false,humanApproval:false})
}
assert.equal(tuples.length,6)
write(`${pkg}/after-FIRST/six-prior-genuine-visual-tuples.exact-binding.json`,{schemaVersion:1,role:'reuse proof of unchanged actual prior independently reviewed V tuples; no new visual approval',tuples,activeImageWrites:false,humanApproval:false})
const cfg=read(`${pkg}/candidate/six-plus-eight-current402.normal-batch.config.json`)
const bundle=path.join(root,cfg.outputDirectory,'bundle')
const model=read(`${cfg.outputDirectory}/bundle/book-model.json`)
assert.equal(model.pages.length,14)
const renderer=await import(pathToFileURL(path.join(cap,'app/scripts/goalBookRenderer.ts')).href)
const playwright=await import(pathToFileURL(path.join(root,'app/node_modules/playwright/index.mjs')).href)
const html=fs.readFileSync(path.join(bundle,'book.html'))
const assets=new Map<string,{bytes:Buffer,source:string}>()
for(const page of model.pages){
 assert(page.visualization)
 const source=path.join(cap,'app/public',page.visualization.url.slice(1))
 const bytes=fs.readFileSync(source)
 assert.equal('sha256:'+createHash('sha256').update(bytes).digest('hex'),page.visualization.originalDigest)
 assets.set(page.visualization.url,{bytes,source})
}
fs.mkdirSync(path.join(root,pkg,'captures'),{recursive:true})
const browser=await playwright.chromium.launch({headless:true,args:['--disable-background-networking']})
const captures=[]
try{
 const page=await browser.newPage({viewport:{width:1000,height:1400},deviceScaleFactor:1})
 const unexpected:string[]=[]
 await page.route('**/*',async(route:any)=>{
  const u=new URL(route.request().url())
  if(u.origin!=='https://goal-book.skillpilot.invalid'){unexpected.push(u.href);return route.abort()}
  if(u.pathname==='/book.html')return route.fulfill({status:200,contentType:'text/html; charset=utf-8',body:html})
  const asset=assets.get(decodeURIComponent(u.pathname));if(!asset){unexpected.push(u.href);return route.abort()}
  return route.fulfill({status:200,contentType:u.pathname.endsWith('.jpg')?'image/jpeg':'image/png',body:asset.bytes})
 })
 await page.emulateMedia({media:'print'})
 await page.goto('https://goal-book.skillpilot.invalid/book.html',{waitUntil:'load'})
 await page.evaluate(async()=>{await document.fonts.ready;await Promise.all(Array.from(document.images).map(i=>i.decode()))})
 const layout=await renderer.inspectGoalBookPageLayout(page,14)
 assert.deepEqual(unexpected,[])
 for(const goal of model.pages){
  const element=page.locator('#goal-'+goal.goalId)
  const dest=`${pkg}/captures/${goal.goalId}.whole-html.png`
  await element.screenshot({path:path.join(root,dest)})
  captures.push({goalId:goal.goalId,capture:ref(dest),actualVisibleText:await element.innerText(),originalImageDigest:goal.visualization.originalDigest})
 }
 write(`${pkg}/checks/fourteen-actual-normal-html-captures.technical.json`,{schemaVersion:1,role:'actual dedicated ordinary HTML page captures only; no independent approval',bookHtml:ref(`${cfg.outputDirectory}/bundle/book.html`),bookModel:ref(`${cfg.outputDirectory}/bundle/book-model.json`),normalPageLayoutMetrics:layout,captureConditions:{viewport:{width:1000,height:1400},deviceScaleFactor:1,media:'print',imageServing:'Exact original PNG/JPG bytes via normal HTML URLs, no claim these captures serve the independently verified print derivatives.'},captures,independentReviewExecuted:false,humanApproval:false})
}finally{await browser.close()}
console.log(JSON.stringify({ordinaryVisibilityScopes:9,unchangedPriorGenuineVTupleMatches:6,actualWholeHtmlCaptures:14,newReviewedJudgments:0}))
