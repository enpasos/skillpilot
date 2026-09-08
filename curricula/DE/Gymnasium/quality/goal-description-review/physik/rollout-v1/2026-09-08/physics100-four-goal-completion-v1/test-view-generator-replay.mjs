// Execute the actual five TS generators against an in-memory output filesystem.
// No source-extraction, mapping, registry, view, or README is written to disk.
import fs from 'node:fs'
import path from 'node:path'
import {createRequire} from 'node:module'
import {pathToFileURL} from 'node:url'
import {createHash} from 'node:crypto'
import {execFileSync} from 'node:child_process'
const root=process.cwd(),require=createRequire(root+'/app/package.json'),ts=require('typescript')
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=s=>'sha256:'+createHash('sha256').update(s).digest('hex')
const helperPath=root+'/app/scripts/lib/physicsB034ViewPlacements.ts',helperSource=fs.readFileSync(helperPath,'utf8'),ids=new Set(helperSource.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gu))
const ownWrapper=id=>id?.startsWith('physics-b034-')||id?.startsWith('b034-preserved-')
function entries(view,selected){const rows=[];function walk(nodes,ancestors=[]){for(const n of nodes){if(n.goalId&&selected(n.goalId))rows.push({ancestors,entry:n});if(n.children)walk(n.children,[...ancestors,n.id])}}walk(view.rootNodes);return rows.sort((a,b)=>JSON.stringify(a).localeCompare(JSON.stringify(b)))}
function foreign(view){function strip(nodes){return nodes.filter(n=>!ids.has(n.goalId)).flatMap(n=>{if(!n.children)return[n];const children=strip(n.children);return ownWrapper(n.id)&&!children.length?[]:[{...n,children}]})}return {...view,rootNodes:strip(view.rootNodes)}}
const comp=await import(pathToFileURL(root+'/app/src/utils/authoring/compositionViewAuthoring.ts')),canon=await import(pathToFileURL(root+'/app/src/utils/authoring/canonicalAuthoring.ts'))
const c=read(root+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json'),math=read(root+'/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'),kinds=new Map(read(root+'/curricula/DE/Gymnasium/quality/release-model/physik.semantic-kinds.json').decisions.map(d=>[d.goalId,d.semanticKind])),decorated={...c,goals:c.goals.map(g=>({...g,semanticKind:kinds.get(g.id)}))},nc=canon.normalizeCanonicalLandscape(decorated),nm=canon.normalizeCanonicalLandscape(math),universe=canon.normalizeCanonicalLandscape({...decorated,goals:[...math.goals,...decorated.goals]})
const compile=v=>comp.compileCompositionView(comp.normalizeCompositionView(v),nc,universe,new Map([[c.landscapeId,nc],[math.landscapeId,nm]]))
function targets(v){const r=compile(v),out=[];function walk(n){if(n.sourceGoalId)out.push(n.sourceGoalId);n.children?.forEach(walk)}r.compiledRootNodes.forEach(walk);return {ids:[...new Set(out)].sort(),errors:r.findings.filter(f=>f.severity==='error')}}
const results=[]
for(const state of ['Bb','Hh','Rp','Sn','Sl','Th']){
 const sourcePath=root+'/app/scripts/generate'+state+'PhysicsSourceExtraction.ts',writes=new Map(),cache=new Map(),calls=[],logs=[]
 const vfs={readFileSync(p,encoding){const key=path.resolve(String(p));if(!writes.has(key))return fs.readFileSync(p,encoding);const bytes=writes.get(key);return encoding?bytes.toString(typeof encoding==='string'?encoding:encoding.encoding):bytes},existsSync(p){return writes.has(path.resolve(String(p)))||fs.existsSync(p)},mkdirSync(){},writeFileSync(p,data){writes.set(path.resolve(String(p)),Buffer.isBuffer(data)?data:Buffer.from(data))}}
 function load(file){if(cache.has(file))return cache.get(file).exports;const mod={exports:{}};cache.set(file,mod);const source=fs.readFileSync(file,'utf8').replaceAll('import.meta.url',JSON.stringify(pathToFileURL(file).href));const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText
  const localRequire=specifier=>{if(specifier==='node:fs'||specifier==='fs')return vfs;if(specifier==='node:child_process')return {execFileSync(cmd,args,options){if(cmd!=='pdftotext'||args.at(-1)!=='-')throw Error('Read-only subprocess boundary');return execFileSync(cmd,args,options)}};if(specifier.startsWith('.')){let dependency=path.resolve(path.dirname(file),specifier);if(!path.extname(dependency))dependency+='.ts';const output=load(dependency);if(dependency===helperPath)return {...output,preservePhysicsB034ViewPlacements(repo,p,draft){const before=structuredClone(draft),current=read(path.resolve(repo,p));const answer=output.preservePhysicsB034ViewPlacements(repo,p,draft);calls.push({file:path.resolve(repo,p),before,current,after:structuredClone(draft)});return answer}};return output}return createRequire(file)(specifier)}
  new Function('require','module','exports','console',compiled)(localRequire,mod,mod.exports,{log:(...items)=>logs.push(items.join(' ')),error:(...items)=>logs.push(items.join(' '))});return mod.exports
 }
 let error=null;try{load(sourcePath)}catch(e){error=e.stack}
 const views=[]
 for(const call of calls){const currentTargets=targets(call.current),afterTargets=targets(call.after),sameOwn=JSON.stringify(entries(call.after,id=>ids.has(id)))===JSON.stringify(entries(call.current,id=>ids.has(id))),sameForeign=JSON.stringify(foreign(call.before))===JSON.stringify(foreign(call.after)),identity=load(helperPath).preserveB034PlacementsFromCurrent(structuredClone(call.current),call.current),sameIdentity=JSON.stringify(identity)===JSON.stringify(call.current)
  const captured=writes.get(call.file),capturedView=captured?JSON.parse(captured.toString()):null
  views.push({file:path.relative(root,call.file),currentSha256:hash(fs.readFileSync(call.file)),generatedSha256:captured?hash(captured):null,ownPlacementsExact:sameOwn,otherGeneratedNodesUnchanged:sameForeign,currentIdentityRoundTrip:sameIdentity,capturedEqualsHelperResult:JSON.stringify(capturedView)===JSON.stringify(call.after),nativeErrors:afterTargets.errors,currentTargetsRemoved:currentTargets.ids.filter(id=>!afterTargets.ids.includes(id)),currentTargetsAdded:afterTargets.ids.filter(id=>!currentTargets.ids.includes(id))})
 }
 // TH deliberately retains existing authored views via its native existsSync
 // branch. Distinguish this genuine no-write path from a replayed helper call.
 const retainedViews=state==='Th'?['gk','lk','sekii-gk','sekii-lk'].map(suffix=>{const file=root+'/curricula/DE/Gymnasium/composition-views/physik/de-th-'+suffix+'.view.json',current=read(file),identity=load(helperPath).preserveB034PlacementsFromCurrent(structuredClone(current),current);return {file:path.relative(root,file),sha256:hash(fs.readFileSync(file)),nativeExistingViewSkip:!writes.has(file),nativeErrors:targets(current).errors,currentIdentityRoundTrip:JSON.stringify(identity)===JSON.stringify(current)}}):[]
 const expectedPath=state==='Th'?views.length===0&&retainedViews.every(v=>v.nativeExistingViewSkip&&v.currentIdentityRoundTrip&&!v.nativeErrors.length):views.length===(state==='Bb'?8:4)&&views.every(v=>v.ownPlacementsExact&&v.otherGeneratedNodesUnchanged&&v.currentIdentityRoundTrip&&v.capturedEqualsHelperResult&&!v.nativeErrors.length)
 results.push({state,sourcePath:path.relative(root,sourcePath),sourceSha256:hash(fs.readFileSync(sourcePath)),status:!error&&expectedPath?'PASS':'FAIL',error,capturedWrites:writes.size,viewCount:views.length,views,retainedViews,logs})
}
const api=await import(pathToFileURL(helperPath)),fixture=read(root+'/curricula/DE/Gymnasium/composition-views/physik/de-rp-gk.view.json')
const expectReject=(name,change,pattern)=>{const draft=structuredClone(fixture);change(draft);let error=null;try{api.preserveB034PlacementsFromCurrent(draft,fixture)}catch(e){error=e.message}return {name,status:error&&pattern.test(error)?'PASS':'FAIL',error}}
const failClosedTests=[expectReject('different jurisdiction is rejected',draft=>draft.scope.jurisdiction='DE-BY',/scope mismatch/u),expectReject('missing existing foreign SekII stage anchor is rejected',draft=>{function prune(nodes){return nodes.filter(n=>n.id!=='physics-sekii-gk').map(n=>n.children?{...n,children:prune(n.children)}:n)}draft.rootNodes=prune(draft.rootNodes)},/missing reviewed non-B034 stage anchor physics-sekii-gk/u)]
const status=results.every(r=>r.status==='PASS')&&failClosedTests.every(r=>r.status==='PASS')?'PASS':'FAIL'
console.log(JSON.stringify({schemaVersion:1,checkedAt:new Date().toISOString(),status,scope:'B034 exact explicit references, other generated nodes unchanged, native CPV and honest current-target drift diagnostic; not a whole-generator source-coverage or global M6 approval',mode:'actual-generator-execution-in-memory-output-filesystem',realFilesystemWrites:0,registryWrites:0,helperSha256:hash(helperSource),failClosedTests,results},null,2))
if(status!=='PASS')process.exitCode=1
