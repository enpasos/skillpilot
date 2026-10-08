"""Append-only pre-seal corrections; keep every initial output and failure."""
from pathlib import Path
import copy, hashlib, json
OWN=Path(__file__).parent
def read(n):return json.loads((OWN/n).read_text())
def write(n,x):
 with (OWN/n).open('x') as f:f.write(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def rel(n):return str(OWN/n)
entry=read('neutral-operative-eighteen-source-review.entry.json')
ex=read(Path(entry['sourceExtractionCandidatePath']).name)
mapping=read(Path(entry['mappingReviewCandidatePath']).name)
delta=read('targeted-eighteen-operative-source-before-after.author.json')
selected={d['sourceGoalId'] for d in delta['deltas']}
changes=[]
for passage in ex['passages']:
 if passage['id'].startswith('he-bio-sekii:evolution18-v2:'):continue
 old=copy.deepcopy(passage);current=passage.get('sourceGoalIds',[])
 passage['sourceGoalIds']=[s for s in current if s not in selected]
 if passage!=old:changes.append({'passageId':passage['id'],'changedField':'sourceGoalIds','before':current,'after':passage['sourceGoalIds'],'reason':'These eighteen newly bounded source rows now point exclusively to their actual v2 primary components, not also to historically normalized parent text. All other passage fields and nonselected memberships retained.'})
assert len(changes)==4
en='DE_HE_BIOLOGIE_SEKII_KC2024.evolution18-operative-source-candidate-final-20261008-v2.source-extraction.json'
mn='hessen_biology_upper_secondary.evolution18-operative-source-candidate-final-20261008-v2.review.json'
write(en,ex);mapping['sourceExtractionPath']=rel(en);write(mn,mapping)
cfg=read('atlas.after-source-change.native-config.actual.json')
cfg['mappingPaths']=[rel(mn) if p==entry['mappingReviewCandidatePath'] else p for p in cfg['mappingPaths']]
write('atlas.final-after-source-change.native-config.actual.json',cfg)
pcfg=read('P18.current-whole-source-v2.native-config.actual.json');assert 'reportPath' in pcfg
pcfg.pop('reportPath')
write('P18.current-whole-source-v2.corrected-native-config.actual.json',pcfg)
write('preseal-targeted-corrections.actual.json',{'schemaVersion':1,'initialOutputsRetainedUnchanged':True,'passageMembershipChanges':changes,'eighteenSourceRowBodiesChangedByThisCorrection':0,'unaffectedRowsChanged':0,'unaffectedDecisionsChanged':0,'sourceMappingPointerChanged':True,'PConfigCorrection':'Remove author-added reportPath: native closed positive-evidence config does not allow this field. Initial actual exit1/config/log retained unchanged; no validator exception.','canonicalBodiesChanged':0,'sourceIndependentApprovalCount':0,'activeWrites':0})
entry['sourceExtractionCandidatePath']=rel(en);entry['mappingReviewCandidatePath']=rel(mn)
entry['presealCorrectionPath']=rel('preseal-targeted-corrections.actual.json')
entry['initialEntryPreservedUnchanged']=True
write('neutral-operative-eighteen-source-review.final.entry.json',entry)
# Correct the earlier descriptive hypothesis of the full native diagnostic by
# recording the actual known existing cause, without editing the first record.
blocked=[d for d in mapping['decisions'] if d['decision']!='mapped']
assert len(blocked)==1 and blocked[0]['sourceGoalId']=='ca155d02-5fae-5222-85a4-881c0a69b0de'
write('native-full144-projection-diagnostic-cause.actual.json',{'schemaVersion':1,'actualCause':'Existing unrelated Neuro GK2 needs_canonical_goal decision, not a completed mapping. The native release compiler correctly rejects it. The first diagnostic record speculative redundant-edge description was not the actual cause.','existingUnchangedHold':blocked,'boundedEvolution18NativeClosedProjectionPassed':True,'debtPreserved':True,'activeWrites':0})
print(json.dumps({'sourceRowBodiesSame':18,'oldPassageMembershipsCorrected':len(changes),'unaffectedRowsKept':126,'PClosedConfigCorrected':True,'unrelatedNeuroGK2HoldPreserved':True}))
