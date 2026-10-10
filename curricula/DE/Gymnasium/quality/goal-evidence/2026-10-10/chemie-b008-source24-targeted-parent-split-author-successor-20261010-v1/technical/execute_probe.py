# SPDX-License-Identifier: Apache-2.0
import json,hashlib,shutil,tempfile,os,subprocess,datetime,time,difflib
from pathlib import Path
R=Path('/home/enpasos/projects/skillpilot');T=R/'tmp/m7-resumption-20261010/chemistry-source24-author';C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule'
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-targeted-parent-split-author-successor-20261010-v1')
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def ref(p):b=(R/p).read_bytes();return {'path':str(p),'sha256':sha(b),'bytes':len(b)}
def put(p,b):
 p=R/p;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),str(p)
 if isinstance(b,(dict,list)):b=(json.dumps(b,ensure_ascii=False,indent=2)+'\n').encode()
 elif isinstance(b,str):b=b.encode()
 with tempfile.NamedTemporaryFile(dir=T,delete=False) as f:f.write(b);stage=f.name
 os.replace(stage,p)
normal=Path('app/scripts/goalBookSourceAtlasInputs.ts');code=(R/normal).read_text();assert (C/normal).read_text()==code
put(P/'technical/ordinary-helper-sources/goalBookSourceAtlasInputs.ts',code)
# Read-only diagnostic, retaining every ordinary selector, rule and assertion verbatim.
insertion="  writeFileSync(local(repoRoot, '"+str(P)+"/checks/actual-normal-whole-source-union-before-unchanged-failing-count-assertion.observed.json'), JSON.stringify({schemaVersion:1,role:'Whole read-only author diagnostic before unchanged ordinary398 count assertion; not compiler PASS or independent source review',actualAtomicGoalIds:sorted(atoms),actualSourceUnionGoalIds:sorted(union),actualMappedAtomicGoalIds:sorted(mappedAtoms),actualUnresolvedAtomicGoalIds:sorted(unresolvedAtoms),actualUnresolvedScopeCount:unresolved.length,actualUnresolvedScopes:unresolved,actualWholeScopes:scopes,wholeOmittedGoalBodies:sorted([...atoms].filter(id=>!union.has(id))).map(goalId=>({goalId,reason:!mappedAtoms.has(goalId)?'no-reviewed-mapped-source-witness':unresolvedAtoms.has(goalId)?'unresolved-source-scope':'no-resolved-source-scope',wholeGoalBody:goals.get(goalId)})),originalBoundInputFiles:[...bindings.entries()].sort(([a],[b])=>compare(a,b)).map(([path,sha256])=>({path,sha256})),expectedWholeCount:config.expectedCurricularAtomicGoalCount,countAssertionKeptUnchanged:true,humanApproval:false,strictGain:0},null,2)+'\\n')\n"
anchor="  assert.equal(union.size, config.expectedCurricularAtomicGoalCount, 'Source-supported atlas goal count changed')"
assert code.count(anchor)==1
observed=code.replace("readdirSync } from 'node:fs'","readdirSync, writeFileSync } from 'node:fs'").replace(anchor,insertion+anchor)
assert observed.replace(insertion,'').replace("readdirSync, writeFileSync } from 'node:fs'","readdirSync } from 'node:fs'")==code
put(P/'technical/ordinary-helper-sources/goalBookSourceAtlasInputs.source24-observation.ts',observed)
put(P/'technical/transparent-observer-exact.diff',''.join(difflib.unified_diff(code.splitlines(True),observed.splitlines(True),fromfile='unchanged-normal-source',tofile='source24-read-only-observation')))
put(P/'checks/source24-observer-exact-instrumentation.actual.json',{'schemaVersion':1,'ordinaryOriginal':ref(normal),'ownOriginalExactCopy':ref(P/'technical/ordinary-helper-sources/goalBookSourceAtlasInputs.ts'),'instrumented':ref(P/'technical/ordinary-helper-sources/goalBookSourceAtlasInputs.source24-observation.ts'),'onlyChanges':['Additional writeFileSync import','One whole actual variable snapshot immediately before unchanged count assertion'],'exactReversalEqualsOriginal':True,'countAssertionsAndRulesUnchanged':True,'ordinaryActiveModuleUnmodified':True,'strictGain':0,'humanApproval':False})
for mode,module in [('normal','goalBookSourceAtlasInputs.ts'),('observation','goalBookSourceAtlasInputs.source24-observation.ts')]:
 driver="""// SPDX-License-Identifier: Apache-2.0
// Execute only in the isolated capsule; normal full-count assertions remain authoritative.
import {readFileSync} from 'node:fs'
import {resolve} from 'node:path'
import {buildGoalBookSourceAtlasInputs} from './"""+module+"""'
const root=resolve('.'), p='"""+str(P)+"""'
const config=JSON.parse(readFileSync(resolve(root,p+'/source-atlas/whole398-source24.normal-probe.inputs.json'),'utf8'))
try { const result=buildGoalBookSourceAtlasInputs(config,root); console.log(JSON.stringify({role:'Actual full normal source compiler result',receipt:result.receipt,strictGain:0,humanApproval:false})) }
catch(error) { console.error(error instanceof Error ? error.stack : String(error)); process.exitCode=1 }
"""
 put(P/'technical'/f'execute-source24-{mode}.mts',driver)
# Existing selective normal capsule, reuse sequentially; every referenced whole author input plain-copied.
shutil.copytree(R/P,C/P,dirs_exist_ok=True)
(C/'app/scripts/goalBookSourceAtlasInputs.source24-observation.ts').write_text(observed)
config=json.loads((R/P/'source-atlas/whole398-source24.normal-probe.inputs.json').read_text())
bindings=[]
for p in [config['landscapePath'],config['semanticKindLedgerPath'],config['durationModelPolicyPath'],*config['mappingPaths'],*config.get('fallbackViewPaths',[])]:
 assert (R/p).is_file() and not (R/p).is_symlink(),p
 target=C/p;target.parent.mkdir(parents=True,exist_ok=True)
 # Only refresh ordinary input copies in ignored capsule, never production paths.
 if not target.exists() or target.read_bytes()!=(R/p).read_bytes():shutil.copy2(R/p,target)
 bindings.append(ref(Path(p)))
# All mapping extraction paths must match exact root originals.
for mapping in config['mappingPaths']:
 x=json.loads((R/mapping).read_text());p=x['sourceExtractionPath'];target=C/p
 if not target.exists() or target.read_bytes()!=(R/p).read_bytes():target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/p,target)
 bindings.append(ref(Path(p)))
put(P/'checks/actual-isolated-normal-whole-input-copies.json',{'schemaVersion':1,'allActualReferencedRootInputsByteExactInCapsule':True,'bindings':bindings,'capsuleRole':'Ignored selective normal execution copy, not portable authority','activeWrites':[]})
for mode in ['normal','observation']:
 driver=C/'app/scripts'/f'source24-execute-{mode}.mts';shutil.copy2(R/P/'technical'/f'execute-source24-{mode}.mts',driver)
 cmd=['node',str(C/'app/node_modules/tsx/dist/cli.mjs'),str(driver)]
 t=time.monotonic();started=datetime.datetime.now(datetime.timezone.utc).isoformat();r=subprocess.run(cmd,cwd=C,capture_output=True);elapsed=time.monotonic()-t
 put(P/'checks'/f'normal-source24-{mode}.actual.stdout.txt',r.stdout)
 put(P/'checks'/f'normal-source24-{mode}.actual.stderr.txt',r.stderr)
 put(P/'checks'/f'normal-source24-{mode}.actual.terminal.json',{'schemaVersion':1,'command':cmd,'cwdRole':'Ignored selective isolated normal capsule','startedAt':started,'elapsedSeconds':elapsed,'exitCode':r.returncode,'stdout':ref(P/'checks'/f'normal-source24-{mode}.actual.stdout.txt'),'stderr':ref(P/'checks'/f'normal-source24-{mode}.actual.stderr.txt'),'actualDriver':ref(P/'technical'/f'execute-source24-{mode}.mts'),'normalSource':ref(normal),'wholeExpectedCount':config['expectedCurricularAtomicGoalCount'],'unresolvedExpectedCount':config['expectedUnresolvedScopeDecisionCount'],'countLimitsUnchanged':True,'compilerPass':r.returncode==0,'strictGain':0,'humanApproval':False,'activeWrites':[]})
 print(mode,'actualEXIT',r.returncode,'elapsed',round(elapsed,3),r.stderr.decode()[:950])
 assert r.returncode==1 and b'Source-supported atlas goal count changed' in r.stderr,'Unexpected normal failure; inspect actual evidence'
p=P/'checks/actual-normal-whole-source-union-before-unchanged-failing-count-assertion.observed.json';put(p,(C/p).read_bytes());x=json.loads((R/p).read_text())
print(json.dumps({'actualSourceUnion':len(x['actualSourceUnionGoalIds']),'whole398Expected':x['expectedWholeCount'],'actualOmitted':len(x['wholeOmittedGoalBodies']),'unresolved':x['actualUnresolvedScopeCount'],'scopes':len(x['actualWholeScopes']),'strictGain':0}))
