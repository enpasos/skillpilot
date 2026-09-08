/** Read-only exact patch emitter. Send stdout to the apply_patch tool, never a history restore. */
import {readFileSync,existsSync} from 'node:fs'
import {spawnSync} from 'node:child_process'
import {resolve} from 'node:path'
import {buildCandidate} from './build-candidate.ts'
import {packagePath} from './assessment-drafts.mjs'
import {evaluateCandidateRoutes} from './native-shadow-routes.ts'
import {testCandidate} from './test-candidate.ts'

async function main(){
  const candidate=await buildCandidate(),artifact=packagePath+'/current-field-leased-plan.json'
  if(process.argv.includes('--seal-and-patch')){
    const tests=testCandidate(candidate)
    const routes=await evaluateCandidateRoutes(candidate)
    // All genuine native profile results are retained, including any failure.
    // The caller must inspect the route result before applying the emitted patch.
    candidate.files.push({path:artifact,before:existsSync(artifact)?readFileSync(artifact,'utf8'):null,after:JSON.stringify(candidate.plan,null,2)+'\n'})
    const p=packagePath+'/native-route-shadow.json'
    candidate.files.push({path:p,before:existsSync(p)?readFileSync(p,'utf8'):null,after:JSON.stringify(routes,null,2)+'\n'})
    const testPath=packagePath+'/native-candidate-tests.json'
    candidate.files.push({path:testPath,before:existsSync(testPath)?readFileSync(testPath,'utf8'):null,after:JSON.stringify(tests,null,2)+'\n'})
    console.error(JSON.stringify({type:'NATIVE_ROUTE_RESULTS',routes}))
    if(process.argv.includes('--require-route-pass')&&routes.actualProposedNeedsReviewState.some((p:any)=>p.rules.some((r:any)=>r.status!=='pass')))
      throw Error('Refusing operative patch emission: a native route rule is not PASS; inspect the complete preserved result without weakening the gate')
  }
  if(process.argv.includes('--seal-candidate-only')){
    if(process.argv.includes('--seal-and-patch')||process.argv.includes('--require-route-pass'))throw Error('Candidate-only and full-route modes must not be conflated')
    const tests=testCandidate(candidate)
    // Explicit Root authorization: apply independently checked Astro fields
    // while separately owned B034 placement debt remains openly FAIL. This is
    // not a current global route/M6 pass and never replaces a failed receipt.
    candidate.plan.applicationBoundary='Root explicitly authorized current field-leased Astro integration with separately documented open B034 CQR104 debt; final global M6 PASS remains mandatory before handoff.'
    candidate.files.push({path:artifact,before:existsSync(artifact)?readFileSync(artifact,'utf8'):null,after:JSON.stringify(candidate.plan,null,2)+'\n'})
    const testPath=packagePath+'/native-candidate-tests.json'
    candidate.files.push({path:testPath,before:existsSync(testPath)?readFileSync(testPath,'utf8'):null,after:JSON.stringify(tests,null,2)+'\n'})
    console.error(JSON.stringify({type:'NATIVE_CANDIDATE_RESULTS',tests,globalM6Confirmed:false}))
  }
  const planOnly=process.argv.includes('--plan-only')
  const text=JSON.stringify(candidate.plan,null,2)+'\n'
  const files=planOnly?[{path:artifact,before:existsSync(artifact)?readFileSync(artifact,'utf8'):null,after:text}]:candidate.files
  // Python is only an in-memory line-diff implementation: no file access/writes.
  const program=`import sys,json,difflib
files=json.load(sys.stdin)
print('*** Begin Patch')
for f in files:
 if f['before']==f['after']: continue
 if f['before'] is None:
  print('*** Add File: '+f['path'])
  for line in f['after'].splitlines(): print('+'+line)
 else:
  print('*** Update File: '+f['path'])
  diff=list(difflib.unified_diff(f['before'].splitlines(),f['after'].splitlines(),n=3,lineterm=''))
  for line in diff[2:]: print('@@' if line.startswith('@@ ') else line)
print('*** End Patch')`
  const result=spawnSync('python3',['-B','-c',program],{input:JSON.stringify(files),encoding:'utf8',maxBuffer:16*1024*1024})
  if(result.status!==0)throw Error(result.stderr)
  // Fail closed on any concurrent write, even an unrelated one in the same file.
  for(const f of files)if(f.before===null?existsSync(resolve(f.path)):readFileSync(resolve(f.path),'utf8')!==f.before)throw Error('Concurrent change during emit: '+f.path)
  if(!planOnly&&!process.argv.includes('--seal-and-patch')&&!process.argv.includes('--seal-candidate-only')){
    const frozen=JSON.parse(readFileSync(artifact,'utf8'))
    for(const key of ['operations','generatorSplices','newTextFiles','fileDigests'])
      if(JSON.stringify(frozen[key])!==JSON.stringify(candidate.plan[key]))throw Error('Candidate changed since persisted field plan: '+key+'; explicitly rebuild plan after inspecting current delta')
  }
  if(process.argv.includes('--stream-patch')){
    // Transport only: bounded JSON chunks avoid tool-output truncation. The
    // caller acknowledges each chunk, reconstructs exact bytes, then applies.
    const chunks=result.stdout.match(/[\s\S]{1,100000}/g)??[]
    for(let index=0;index<chunks.length;index++){
      process.stdout.write(JSON.stringify({type:'PATCH_CHUNK',index,count:chunks.length,text:chunks[index]})+'\n')
      await new Promise<void>(done=>process.stdin.once('data',()=>done()))
    }
    for(const f of files)if(f.before===null?existsSync(resolve(f.path)):readFileSync(resolve(f.path),'utf8')!==f.before)throw Error('Concurrent change during chunk transport: '+f.path)
    console.log(JSON.stringify({type:'PATCH_TRANSPORT_COMPLETE',chunkCount:chunks.length}))
    process.stdin.pause()
  }else process.stdout.write(result.stdout)
}
main().catch(error=>{console.error(error.stack);process.exitCode=1})
