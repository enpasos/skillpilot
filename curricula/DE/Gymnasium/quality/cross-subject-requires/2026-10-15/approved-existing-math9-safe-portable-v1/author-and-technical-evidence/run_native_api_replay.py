"""Replay current native projection methods against this private candidate.
SPDX-License-Identifier: Apache-2.0
"""
from pathlib import Path
import datetime,hashlib,json,shutil,subprocess
M=Path('/home/enpasos/projects/skillpilot');O=Path(__file__).resolve().parent;R=O/'isolated-root';B=M/'tmp/cross-subject-requires/adopted-caf-three-native-scope-route-audit-20261014-v1';N=O/'native-api';J=M/'tmp/ci-tools/amazon-corretto-25.0.2.10.1/bin'
def read(p):return json.loads(p.read_text())
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p):return {'path':str(p.relative_to(M)),'bytes':p.stat().st_size,'sha256':'sha256:'+sha(p)}
def write(p,j):
 with p.open('x') as f:json.dump(j,f,ensure_ascii=False,indent=2);f.write('\n')
assert not N.exists();N.mkdir()
sources=read(B/'production-java.before.json');assert len(sources)==444
assert all(sha(M/r['path'])==r['sha256'] for r in sources)
jars=read(B/'dependency-jars.json');assert all(sha(Path(r['path']))==r['sha256'] for r in jars)
classes=[bind(p) for p in sorted((B/'production-classes').rglob('*.class'))]
for name in ['AdoptedNativeAudit.java','native-scope-requests.prepared.json','native-configuration-requests.prepared.json']:shutil.copyfile(B/name,N/name)
cp=str(B/'production-classes')+':'+(B/'dependency-classpath.txt').read_text()
(N/'harness-classes').mkdir()
def run(name,argv):
 start=datetime.datetime.now(datetime.timezone.utc).isoformat()
 with (N/(name+'.stdout.raw.txt')).open('xb') as out,(N/(name+'.stderr.raw.txt')).open('xb') as err:p=subprocess.run([str(x) for x in argv],cwd=R,stdout=out,stderr=err)
 write(N/(name+'.execution.actual.json'),{'argv':[str(x) for x in argv],'cwd':str(R),'startedAtUTC':start,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'exitCode':p.returncode,'stdout':bind(N/(name+'.stdout.raw.txt')),'stderr':bind(N/(name+'.stderr.raw.txt')),'MainWritten':False})
 print(name,p.returncode,flush=True);assert p.returncode==0
write(N/'current-production-source-and-reused-class-bindings.actual.json',{'currentSourceFiles':sources,'all444SourceBytesStillExact':True,'previousActualJavacExecution':bind(B/'compile-current-production.execution.json'),'privateCurrentProductionClasses':classes,'jarBindings':jars,'oldCompiledProductionSourcesExcluded':False,'explanation':'Reuses only previous private production classes compiled from these exact unchanged444current source files; exact class bytes are now bound. Harness is freshly javac compiled. No claim of a new production compilation.'})
run('compile-harness',[J/'javac','-encoding','UTF-8','-cp',cp,'-d',N/'harness-classes',N/'AdoptedNativeAudit.java'])
run('execute-native-projection',[J/'java','-Xmx3g','-cp',str(N/'harness-classes')+':'+cp,'AdoptedNativeAudit',R,N])
after=read(N/'native-learner-projections.actual.json');before=read(B/'native-learner-projections.actual.json');assert len(after)==len(before)==598
oldby={r['key']:r for r in before};target_comparisons=[];missing=[];foreign_rows=[]
math={g['id']:g for g in read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json')['goals']}
physics={g['id']:g for g in read(R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')['goals']}
effective=read(N/'native-effective-requires.actual.json')
for row in after:
 assert not row.get('nativeProjectionError'),row
 old=oldby[row['key']];assert sorted(row['targetGoalIds'])==sorted(old['targetGoalIds']),row['key']
 target_comparisons.append({'key':row['key'],'targetSetUnchanged':True,'MathTargetsUnchanged':sorted(set(row['targetGoalIds'])&set(math))==sorted(set(old['targetGoalIds'])&set(math))})
 if row.get('physicsOnly'):assert not set(row['targetGoalIds'])&set(math)
 available=set(row['targetGoalIds'])|set(row['prerequisiteOnlyGoalIds']);structural=set(row['structuralGoalIds'])
 for gid in available&set(physics):
  for ref in effective.get(gid,[]):
   rid=ref.split(':')[-1]
   if rid not in math:continue
   r={'configurationKey':row['key'],'physicsGoalId':gid,'mathGoalId':rid,'globalDefinitionInstalled':rid in math,'projectedAsAvailable':rid in available,'nativeStructuralDefinitionPresent':rid in structural,'MathTarget':rid in row['targetGoalIds']}
   foreign_rows.append(r)
   if not(r['projectedAsAvailable'] and r['nativeStructuralDefinitionPresent']):missing.append(r)
assert not missing,missing[:5]
matches=read(N/'native-scope-matches.actual.json');assert all(not r.get('nativeError') for r in matches)
assert sources==read(B/'production-java.before.json') and all(sha(M/r['path'])==r['sha256'] for r in sources)
assert classes==[bind(p) for p in sorted((B/'production-classes').rglob('*.class'))]
write(N/'candidate-native-api-reference-and-target-comparison.actual.json',{'scopeMatcherRequests':len(matches),'nativeLearnerConfigurations':len(after),'nativeProjectionErrors':0,'targetSetsEqualBaseline':598,'MathTargetUnionPreservedInAllActualRequests':True,'physicsOnlyNoMathTargets':True,'availablePhysicsForeignRequirementOccurrences':len(foreign_rows),'missingImmediateMathDefinitionsOrProjection':missing,'targetComparisons':target_comparisons,'foreignGuardResolutionRows':foreign_rows,'newTransitiveMathPhysicsGuards':False,'learnerRepositoriesTransactionsWrites':0,'sourcePlacementOrRealLearningAcceptance':False,'notAnInstallableStandalonePhysicsPackageClaim':True})
print(json.dumps({'nativeConfigurations':598,'nativeMatcherRequests':len(matches),'foreignGuardOccurrences':len(foreign_rows),'missing':len(missing),'targetSetChanges':0}),flush=True)
