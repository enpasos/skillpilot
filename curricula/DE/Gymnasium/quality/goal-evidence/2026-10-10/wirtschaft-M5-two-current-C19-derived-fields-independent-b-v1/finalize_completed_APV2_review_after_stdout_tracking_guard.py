#!/usr/bin/env python3
"""Additive artifact-tracking guard completion; no repeat of passed native checks."""
import hashlib,json,subprocess
from datetime import datetime,timezone
from pathlib import Path
ROOT=Path('/home/enpasos/projects/skillpilot');OUT=Path(__file__).resolve().parent
def bind(p):
 p=Path(p);p=p if p.is_absolute() else ROOT/p;b=p.read_bytes()
 return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'symlink':p.is_symlink()}
def save(n,o):
 p=OUT/n;assert not p.exists();p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n');return bind(p)
def load(n):return json.loads((OUT/n).read_text())
save('actual-artifact-tracking-only-original-seal-failure-and-bounded-remedy.json',{'failedCommand':['python3',str(OUT.relative_to(ROOT)/'seal_actual_bounded_APV2_independent_KEEP.py')],'exitCode':1,'actualFailure':'git check-ignore guard found actual-native-command.stdout.log excluded by .gitignore line3 *.log; all three native runs had already passed and no scientific/content/native assertion failed.','boundedRemedy':'An evidence-package-local exact filename exception keeps this one real stdout receipt trackable. No global ignore change, source-availability exception, native code/threshold/profile change or new native run.','scopedIgnoreFile':bind(OUT/'.gitignore'),'actualNativeCommandExitStill':0,'scienceOrPayloadChanges':0,'historicalArtifactsOverwritten':0})
frame=load('actual-private-capsule-current-code-and-complete-physical-input-bindings.json');summary=load('actual-two-field-native-positive-negative-and64-scope-invariance.summary.json');cap=Path(load('actual-own-private-capsule.command-exit.json')['capsule'])
guards=[]
for b in frame['actualBoundRepositoryInputs']:
 a=bind(b['path']);guards.append({'before':b,'after':a,'wholeExact':b==a})
assert all(g['wholeExact'] for g in guards)
prod=(ROOT/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes();assert (cap/'app/scripts/generateCurriculumQualityStatus.ts').read_bytes()==prod+frame['privateReadonlyExportSuffix'].encode()
assert (cap/'app/scripts/applicabilityCompiler.ts').read_bytes()==(ROOT/'app/scripts/applicabilityCompiler.ts').read_bytes()
candidate=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current496-whole-qualified-M3-M5-large-integration-candidate-root-v2/whole496-current-qualified-science-and-bounded-bindings-only.INERT.json'
assert candidate.read_bytes()==(cap/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json').read_bytes()
required=[str(p.relative_to(ROOT)) for p in sorted(OUT.iterdir()) if p.is_file()]
ignored=subprocess.run(['git','check-ignore','--',*required],cwd=ROOT,text=True,capture_output=True);assert ignored.returncode==1 and not ignored.stdout
assert not [p for p in OUT.rglob('*') if p.is_symlink()]
guard=save('actual-completed-independent-code-and-input-endguards.json',{'allBoundRepositoryInputsWholeExact':True,'wholeInputEndBindings':guards,'wholeProductionCodeExactExceptNamedReadonlyExports':True,'wholeCompilerCodeExact':True,'positiveCapsuleWholeRestored':True,'requiredIgnoredPaths':[],'symlinkErrors':0,'ignoreCommand':{'argv':['git','check-ignore','--',*required],'exitCode':ignored.returncode,'stdout':ignored.stdout,'stderr':ignored.stderr},'activeWrites':0})
science=bind(OUT/'actual-two-current-C19-and-Q2-parent-derived-field-followers-scientific-KEEP.independent-b.json');command=bind(OUT/'actual-native-three-frame-command-exit-and-pinned-node.receipt.json')
manifest=save('actual-two-current-derived-fields-independent-b.manifest.json',{'reviewer':'/root/economics_m2_views_independent_b','sealedAt':datetime.now(timezone.utc).isoformat(),'outputs':[bind(p) for p in sorted(OUT.iterdir()) if p.is_file()],'status':'KEEP bounded two fields only','historyPreserved':True,'nativeRetestingAfterPass':0})
receipt=save('actual-final-two-current-C19-and-Q2-parent-fields-independent-b-KEEP.handoff.receipt.json',{'reviewer':'/root/economics_m2_views_independent_b','status':'KEEP bounded two fields only','science':science,'manifest':manifest,'inputGuards':guard,'actualNativeCommand':command,'exactWholeCandidateSHA256':'a56fb8a41a0efb7fb4cb9bdd100fbb4ae5ebc3fa33c1930ba4ba6d087421a310','nativeCompilerPositive':summary['compilerPositive'],'actualCompilerNegativeWarnings':1,'all64OrdinarySupportMemoryOrientationAllAtomicScopeSetsExact':True,'wholeSourceRouteAndAll20ForeignReportsExact':True,'sourceTupleWholeScienceOrNewC19ViewAccessClaimed':False,'activeWrites':0,'strictGain':0,'newFachClosures':0,'restoredActiveBindings':0,'humanReleaseM6M7Claimed':False})
print(json.dumps({'receipt':receipt,'science':science,'manifest':manifest,'positive':summary['compilerPositive'],'negativeWarnings':1,'ignoredRequiredPaths':0,'symlinks':0}))
