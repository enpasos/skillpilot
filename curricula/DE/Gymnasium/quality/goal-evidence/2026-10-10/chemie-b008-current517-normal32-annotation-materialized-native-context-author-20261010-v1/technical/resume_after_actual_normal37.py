# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,datetime,shutil,subprocess,time,os
R=Path.cwd();Q=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');N=Q/'chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1';P=Q/'chemie-b008-current517-seven-BY-source-two-direct-routes-author-20261010-v1';I=Q/'chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1';C=R/'tmp/m7-resumption-20261010/chemistry-b008-P26-native-author/isolated-normal-capsule';canon=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
def read(p):return json.loads(Path(p).read_text())
def put(p,x):p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def bind(p):p=Path(p);return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
before=read(N/'inputs/whole517.pre-annotation.exact.json');after=read(N/'candidate/whole517.normal32-materialized.author-candidate.json');bg={g['id']:g for g in before['goals']};ag={g['id']:g for g in after['goals']};assert set(bg)==set(ag);rows=[]
for id,g in ag.items():
 keys={k for k in set(g)|set(bg[id])if g.get(k)!=bg[id].get(k)}
 if keys:assert keys=={'applicability'};rows.append({'goalId':id,'title':g['title'],'changedFields':sorted(keys),'before':bg[id].get('applicability'),'after':g.get('applicability'),'wholeBeforeGoal':bg[id],'wholeAfterGoal':g})
assert len(rows)==37;expected={r['goalId']:r['literalNormalCompiledApplicability']for r in read(P/'checks/remaining-32-APV203-baseline-before-after-and-literal-current-compiled-source-contexts.actual.json')['rows']};assert set(expected).issubset({r['goalId']for r in rows});assert all(ag[id].get('applicability',{})==app for id,app in expected.items())
put(N/'checks/normal32-materializer-literal-goal-deltas.actual.json',{'schemaVersion':1,'normalMaterializerUnchanged':True,'normalCompilerUnchanged':True,'all517IDsExact':True,'goalCount':517,'changedFieldsOnly':['applicability'],'changedGoals':37,'CQR501PreviouslyWarnedGoalCount':32,'additionalNormalDerivedGoals':5,'rows':rows,'goalTextsRequiresResourceLinksExamDataExtendedDataAllExact':True,'twentyAtlasHoldsCleared':False,'C11HoldExact':ag['eed5eda3-2daf-5d48-b935-23dadd622d9b']['extendedData']['courseScopeHold'],'source7StillAuthorProposals':True,'route2StillAuthorProposals':True,'technicalAnnotationMaterializationIsNotScienceApproval':True,'activeWrites':[]})
for filename in ['current517.semantic-kinds.author-portable.json','current517.semantic-kinds.author-future-active.json']:
 x=read(P/'candidate'/filename)
 if filename.endswith('portable.json'):x['sourceLandscapePath']=str(N/'candidate/whole517.normal32-materialized.author-candidate.json')
 put(N/'candidate'/filename,x)
shutil.copyfile(I/'candidate/current398-normal-whole-context-QA.additive.future-active.json',N/'candidate/current398-normal-QA.exact-retained.json')
link=C/N;link.parent.mkdir(parents=True,exist_ok=True)
if not link.exists():link.symlink_to(R/N,target_is_directory=True)
assert link.resolve()==R/N
registryPath=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');shutil.copyfile(registryPath,N/'inputs/current-root-registry.temporal-base.exact.json');root=read(registryPath);chem=next(s for s in read(I/'registry/all-subjects.chemie-only-merge.future-active.config.json')['subjects']if s['subject']=='chemie');diagnostic=json.loads(json.dumps(root));diagnostic['subjects']=[chem if s['subject']=='chemie'else s for s in root['subjects']];put(N/'candidate/current-root-four-subjects-plus-prior-reviewed-Chemistry.diagnostic.config.json',diagnostic);dest=C/registryPath;assert dest.parent.resolve().is_relative_to(C.resolve());dest.unlink();shutil.copyfile(N/'candidate/current-root-four-subjects-plus-prior-reviewed-Chemistry.diagnostic.config.json',dest)
captured=[]
for s in root['subjects']:
 for key in ['landscapePath','visualizationQaPath','semanticKindLedgerPath']:
  if s.get(key)and Path(s[key]).is_file():captured.append({'subject':s['subject'],'role':key,**bind(s[key]),'capsuleBytesSame':(C/s[key]).is_file()and(C/s[key]).read_bytes()==Path(s[key]).read_bytes()})
put(N/'inputs/current-root-and-cached-capsule-temporal-subject-bindings.actual.json',{'schemaVersion':1,'capturedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'rootRegistry':bind(registryPath),'ChemOnlyDiagnosticRegistryOtherFourSubjectObjectsExact':True,'bindings':captured,'cachedBiologyStateNotCurrentRootCoverageClaim':True,'activeWrites':[]})
print('Exact normal37 materialization including32 warning corrections;  whole517 IDs/text/science/2requires unchanged. Current root temporal base captured; no active writes.',flush=True)
