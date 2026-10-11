#!/usr/bin/env python3
"""Private native capsule with frozen prospective inputs; no repository mutation."""
import hashlib,json,shutil
from pathlib import Path
ROOT=Path('/home/enpasos/projects/skillpilot')
OUT=Path(__file__).resolve().parent
CAP=Path(json.loads((OUT/'actual-own-private-capsule.command-exit.json').read_text())['capsule'])
AUTHOR=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-current496-whole-qualified-M3-M5-large-integration-candidate-root-v2')
CAN=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
inputs=[]
def bind(p):
 b=(ROOT/p).read_bytes();r={'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'symlink':(ROOT/p).is_symlink()}
 if r not in inputs:inputs.append(r)
 return r
def save(n,o):
 p=OUT/n;assert not p.exists();p.write_text(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
h=json.loads((ROOT/AUTHOR/'actual-whole-current496-batch-guarded-inputs-and-fieldwise-changes.handoff.json').read_text())
assert bind(AUTHOR/'actual-whole-current496-batch-guarded-inputs-and-fieldwise-changes.handoff.json')['sha256']=='5dbfa353fa3b8c7ca2c0e7cfc3117521372353e826e5e1d9d4a59368857f4547'
rows=json.loads((ROOT/Path(h['requiredIndependentAPV2']['path'])).read_text());bind(Path(h['requiredIndependentAPV2']['path']))
after=json.loads((ROOT/Path(h['canonicalCandidate']['path'])).read_text());bind(Path(h['canonicalCandidate']['path']))
assert bind(Path(h['canonicalCandidate']['path']))['sha256']=='a56fb8a41a0efb7fb4cb9bdd100fbb4ae5ebc3fa33c1930ba4ba6d087421a310'
idx={g['id']:g for g in after['goals']}
before=json.loads(json.dumps(after))
bidx={g['id']:g for g in before['goals']}
for r in rows:
 assert idx[r['goalId']]==r['wholeCandidateGoal']
 old,new=r['wholeBeforeGoal'],r['wholeCandidateGoal']
 assert {k for k in set(old)|set(new) if old.get(k)!=new.get(k)}=={'applicability'}
 bidx[r['goalId']]['applicability']=old['applicability']
assert len(rows)==2 and len(before['goals'])==len(after['goals'])==496
save('whole-current-qualified-composition-only-two-declared-fields-restored.BEFORE-INERT.json',before)
shutil.copyfile(OUT/'whole-current-qualified-composition-only-two-declared-fields-restored.BEFORE-INERT.json',CAP/CAN)
for v in h['views']:
 bind(Path(v['candidate']['path']));shutil.copyfile(ROOT/v['candidate']['path'],CAP/v['activePath'])
mapping=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-Source125-one-qualified-money-member-technical-root-author-v2/whole125-exact208partial-only-one-money-union-reference.conditional-mapping.json')
mapping_active=Path('curricula/DE/Gymnasium/mapping/DE-BE/upper-secondary/be_wirtschaft_current125_source_extraction_to_canonical_wirtschaft.review.json')
mapping_binding=bind(mapping);assert mapping_binding['sha256'].startswith('e699')
shutil.copyfile(ROOT/mapping,CAP/mapping_active)
checker=Path('app/scripts/generateCurriculumQualityStatus.ts');compiler=Path('app/scripts/applicabilityCompiler.ts')
production=(ROOT/checker).read_bytes();readonly=(CAP/checker).read_bytes()
suffix=b'\nexport { routeProfiles, evaluateRouteProfile, collectRenderedAtomicGoalIdsFromCompositionView, collectWholeMaterialPrerequisiteClosure, readJurisdictionCoverageByLandscapeId };\n'
assert readonly==production+suffix
assert (CAP/compiler).read_bytes()==(ROOT/compiler).read_bytes()
assert bind(checker)['sha256']=='656084b7cd9d6cb5324361b927b9f761596c572d7e4f616c7b13da061f4b1336'
assert bind(compiler)['sha256']=='50f4a09007cece8119c53f665b6442e028e4ffb3910fda7b377e60f8cb6c81dd'
reg=Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');registry=json.loads((ROOT/reg).read_text());bind(reg)
subject=next(s for s in registry['subjects'] if s['subject']=='wirtschaftswissenschaften')
sem=Path(subject['semanticKindLedgerPath']);bind(sem)
source_sem=json.loads((ROOT/sem).read_text())
save('whole-current-semantic-kind-decisions-for64-scope-tests.exact-input.json',source_sem)
foreignscience=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M3-M4-C19-real-fiscal-rules-whole-material-independent-a-v1/actual-final-C19-V2-science-and-portable17259-whole-guarded-handoff-KEEP.receipt.json');bind(foreignscience)
approved=Path(h['foreignWholeScienceAndMachineStatus'][1]['approvedWholeBodyPath']);released=Path(h['foreignWholeScienceAndMachineStatus'][1]['releasedWholeGoal']);bind(approved);bind(released)
draft=json.loads((ROOT/approved).read_text());release=json.loads((ROOT/released).read_text())
assert draft['id']==release['id']==rows[0]['goalId']
expected=json.loads(json.dumps(draft));expected['examData']['reviewStatus']='released';assert expected==release
actual=json.loads(json.dumps(rows[0]['wholeBeforeGoal']));actual['applicability']=release['applicability'];assert actual==release
ordinary=[idx[i] for i in rows[0]['wholeCandidateGoal']['requires']]
parent_children=[idx[i] for i in rows[1]['wholeCandidateGoal']['contains']]
save('actual-two-whole-field-candidates-four-ordinary-contracts-and-four-child-objects.intake.json',{'wholeCandidates':rows,'wholeOrdinaryRequires':ordinary,'wholeParentChildren':parent_children,'allNonApplicabilityGoalFieldsExact':True,'actualForeignScienceReuse':bind(foreignscience),'wholeQualifiedDraftToMachineReleaseOnlyStatus':True,'qualifiedBeforeToMetadataCandidateOnlyJurisdiction':True,'scientificReviewRestarted':False,'actualBaseMeaning':'Full composed INERT large batch; before is this SAME qualified composition with ONLY the two requested declared fields restored. It is not active ae2 or pre-C19 APV6.','activeWrites':0})
physical=[]
for folder in ['curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/mapping','curricula/DE/Gymnasium/provenance','curricula/DE/Gymnasium/composition-views/wirtschaft']:
 for p in sorted((CAP/folder).rglob('*.json')):
  if 'quality' in p.relative_to(CAP).parts:continue
  physical.append({'capsulePath':str(p.relative_to(CAP)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size})
save('actual-private-capsule-current-code-and-complete-physical-input-bindings.json',{'capsule':str(CAP),'wholeCheckerProductionSHA256':hashlib.sha256(production).hexdigest(),'privateReadonlyExportSuffix':suffix.decode(),'privateCheckerSHA256':hashlib.sha256(readonly).hexdigest(),'wholeCompilerExact':True,'actualBoundRepositoryInputs':inputs,'allPhysicalCanonicalMappingProvenanceAndEconomicsViewJSONInputs':physical,'conditionalMoneySourceMapping':mapping_binding,'conditionalMappingScienceBoundary':'An author source successor is used equally in both isolated frames. This review proves APV2 source invariance, not independent scientific approval of that source tuple. A handles Source1 separately.','activeWrites':0})
print(json.dumps({'capsule':str(CAP),'inputs':len(inputs),'physical':len(physical),'APV2GoalIds':[r['goalId'] for r in rows],'wholeProductionCodeExactExceptReadonlyExports':True}))
