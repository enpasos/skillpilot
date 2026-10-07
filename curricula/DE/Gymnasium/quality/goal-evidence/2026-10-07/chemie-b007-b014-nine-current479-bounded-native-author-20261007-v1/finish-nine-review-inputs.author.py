# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy, hashlib, json
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
assert not (OWN/'author.final.freeze.json').exists()
PREFIX = ROOT/'curricula/DE/Gymnasium/quality/goal-evidence'
B7 = PREFIX/'2026-10-06/chemie-b007-seven-native-source-preparation-author-v3'
B14 = PREFIX/'2026-10-05/chemie-b014-eleven-source-remediation-independent-a-v1'
ARR = PREFIX/'2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1'

def get(path): return json.loads(Path(path).read_text())
def put(name,value):
    p=OWN/name;p.parent.mkdir(parents=True,exist_ok=True)
    text=value if isinstance(value,str) else json.dumps(value,ensure_ascii=False,indent=2)+'\n'
    if p.exists():
        assert p.read_text()==text, 'Existing author output would drift: '+name
        return
    with p.open('x') as f:f.write(text)
def bind(path):
    p=Path(path);b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}

s=get(OWN/'nine-current-goals-and-four-bounded-candidates.author.raw.json')
old=get(OWN/'declared-input-snapshots/001-DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json.bin')
candidate=get(OWN/'candidate/canonical.current479-four-bounded-proposals.json')
old_by={g['id']:g for g in old['goals']};new_by={g['id']:g for g in candidate['goals']}
assert set(old_by)==set(new_by) and len(new_by)==479
changes=[]
def walk(a,b,path=''):
    if isinstance(a,dict) and isinstance(b,dict):
        out=[]
        for k in sorted(set(a)|set(b)):
            if k not in a:out.append({'pointer':path+'/'+k,'operation':'add','after':b[k]})
            elif k not in b:out.append({'pointer':path+'/'+k,'operation':'remove','before':a[k]})
            else:out+=walk(a[k],b[k],path+'/'+k)
        return out
    if a!=b:return [{'pointer':path,'operation':'replace','before':a,'after':b}]
    return []
for id in new_by:
    d=walk(old_by[id],new_by[id])
    if d:changes.append({'goalId':id,'wholeBefore':old_by[id],'wholeAfter':new_by[id],'fieldChanges':d})
assert {r['goalId'] for r in changes}==set(s['reviewReadyGoalIds'])
assert all(old_by[id]==new_by[id] for id in s['heldGoalIds'])
assert old_by[s['reviewReadyGoalIds'][0]]['requires']==new_by[s['reviewReadyGoalIds'][0]]['requires']
put('exact-four-goal-field-differences-and-475-preservation.author.json',{'role':'Exact current479 before/after; four bounded proposals only','changes':changes,'changedWholeGoals':4,'otherWholeGoalsExact':475,'wholeGoalIdsExact':479,'heldFiveWholeGoalsExact':True,'newCurricularAtomicGoalIds':[],'activeWrites':0,'ownScientificApproval':False})
put('guarded-later-integration-field-intents.author.json',{'role':'Future Root integration advice only, no execution or approval','baselineCanonical':bind(OWN/'declared-input-snapshots/001-DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json.bin'),'applyStrategy':'Read refreshed live479-or-successor canonical and assert each field beforeValue. Apply only selected field changes; preserve every unmentioned current field, all concurrent Chem17 changes and source-lane corrections. If selected beforeValue drifted, reconcile that field and renew affected native D/P input. Never copy complete479/480 clones over live canonical.','goalFieldChanges':[{'goalId':r['goalId'],'fieldChanges':r['fieldChanges']} for r in changes],'memorySupportIntents':get(OWN/'memory/exact-support-integration-field-intents.author.json'),'kindInputBinding':'Only four inert technical source fingerprints changed; classifications and other475 rows exact. These are author book inputs, not new kind/scientific approvals.','existingRasterBytes':'All nine retained; four actually inspected existing JPGs and rendered pages. No new source/public/backend copies needed. Existing V is historical until independent current page binding.','sourceFiles':'No extraction, mapping, reviewed source row or published source PDF modification proposed. Four provenance references reuse existing rows; broader original duties stay open.','evidenceReuse':'Exact prior independent A3/M2 records and exact Arrhenius Memory record/18 cards are reusable after each native input check. Do not rehash historical reviews or all378 bodies. 9e A/M needs targeted current semantic review; four native D/P and current-image decision review remain pending.','strictGain':0})

full=get(OWN/'native/full378.book-model.json');page_by={p['goalId']:p for p in full['pages']}
put('nine-whole-DE-EN-and-native-page-context.author.raw.json',{'role':'All nine whole current/candidate DE/EN goals plus actual current native378 page contexts; five held pages are context only, no new D reviews','wholeGoalCount':479,'curricularAtomicCount':378,'rows':[{'goalId':id,'wholeCurrentGoal':old_by[id],'wholeCandidateGoal':new_by[id],'nativeFullBookPage':page_by[id],'reviewReadyForBoundedDP':id in s['reviewReadyGoalIds'],'wholeGoalHold':s['holds'].get(id)}for id in s['selectedGoalIds']],'fullModelBinding':bind(OWN/'native/full378.book-model.json'),'authorReviewRecords':0,'strictGain':0})

registry=get(OWN/'declared-input-snapshots/002-de-gymnasium-math-physics.config.json.bin');subject=next(r for r in registry['subjects']if r['subject']=='chemie')
am_rows=[]
for cfg_path in subject['semanticAtomicityConfigPaths']:
    cfg=get(ROOT/cfg_path);rev_path=ROOT/cfg['reviewPath']
    for line in rev_path.read_text().splitlines():
        row=json.loads(line)
        if row['goalId'] in s['selectedGoalIds']:am_rows.append({'goalId':row['goalId'],'configBinding':bind(ROOT/cfg_path),'reviewBinding':bind(rev_path),'wholeExistingActiveARecord':row,'candidateReuseScope':'Exact prior-independent native A record reused for f093/28/1c separately; 9e changed title/text needs fresh semantic review. Held five records do not resolve later documented split/source holds.'})
mcfg_path=ROOT/subject['memoryReviewConfigPath'];mcfg=get(mcfg_path);mrev_path=ROOT/mcfg['reviewPath'];mrows=[json.loads(l)for l in mrev_path.read_text().splitlines()if json.loads(l)['goalId']in s['selectedGoalIds']]
memory_goal=old_by['1e372b97-6f1c-596c-8a8b-fc03193d784a']
deck_path=ROOT/'app/public/data/de_gymnasium_chemistry_flashcards_basics_seki.de.json'
card_path=ROOT/mcfg['cardReviewPath'];cards=[json.loads(l)for l in card_path.read_text().splitlines()if json.loads(l)['deckId']=='de_gymnasium_chemistry_basics_seki']
put('memory/current-nine-A-M-whole-records-and-exact-reuse-boundaries.author.raw.json',{'role':'Existing whole current A/M bodies and trace, no fresh author decisions or hash rewrites','wholeCurrentActiveA':am_rows,'currentMConfigBinding':bind(mcfg_path),'currentMReviewBinding':bind(mrev_path),'wholeCurrentSelectedMRecords':mrows,'existingLabelMemoryGoal':memory_goal,'exactLabelDeckBinding':bind(deck_path),'exactLabelCardReviewBinding':bind(card_path),'wholeExistingLabelDeckCardReviewRows':cards,'nativeExactReusedA3':get(OWN/'native/exact-reused-a3-m2.command-results.actual.json'),'nativeExactArrheniusSupportM18':get(OWN/'native/exact-arrhenius-M18-seven-scopes.command-result.actual.json'),'labelCurrentSemanticReviewPending':True,'arrheniusOrdinaryMain479MemorySupportInactive':True,'newAuthorAOrMApproval':False,'fiveHoldsRemainOpen':True,'strictGain':0})

templates=get(PREFIX/'2026-10-05/chemie-b014-eleven-current-source-description-candidate-v1/eleven-description-deltas-and-split-templates.json')
b7uuid=get(B7/'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json')
companion_ids=['22133f29-005d-5c83-8d66-c1d7a4a0c54b','c224281a-24d7-5f99-b0a9-3a302d57c5bc']
# Bind every already-existing companion UUID named in the later source groups/templates.
def collect_ids(obj):
    if isinstance(obj,dict):
        for v in obj.values():yield from collect_ids(v)
    elif isinstance(obj,list):
        for v in obj:yield from collect_ids(v)
    elif isinstance(obj,str):
        if obj in old_by:yield obj
named=set(collect_ids(get(B14/'nine-complete-source-row-remediation-groups.json')))|set(collect_ids(templates))
named|={id for id in old_by if id.startswith(('22133f29','c224281a','965','fd309','277'))}
put('five-held-whole-goals-existing-split-templates-and-companions.author.raw.json',{'role':'Five unresolved whole-goal boundaries; preserve complete original duties, reuse existing IDs first, no split adopted','heldRows':[{'goalId':id,'wholeCurrentGoal':old_by[id],'wholeNativeCurrentPage':page_by[id],'concreteHold':s['holds'][id]}for id in s['heldGoalIds']],'originalB014SplitTemplates':[p for p in templates['proposals']if p['fromGoalId']in s['heldGoalIds']],'laterB014WholeSourceGroups':get(B14/'nine-complete-source-row-remediation-groups.json'),'currentNamedExistingCompanionGoals':[old_by[id]for id in sorted(named)],'originalB007SevenRoutinesAndUUIDCaseBinders':b7uuid,'B007SourceViewHolds':get(B7/'seven-source-placement-intents-and-national-holds.author-candidate.json'),'oldNullIdTemplateIsNotAnInstructionToMintId':'Existing c224 pH atom is the first reuse candidate; no new atomic UUID generated here. Historical complete landscapes are not the current479 base.','sourceDutiesRemoved':0,'heldGoalsCountedStrict':0,'activeWrites':0})

cases=get(OWN/'materials/eight-complete-DE-EN-native-P-case-materials.author.json')['cases']
records=[json.loads(l)for l in (OWN/'native/positive-four.current-author-candidate.jsonl').read_text().splitlines()]
md=['<!-- SPDX-License-Identifier: CC-BY-4.0 -->','# Chemie: vollständige vier Zielkontexte und acht DE/EN-Fälle','','Author material; synthetic cases, E1/G1 AI candidate, no learner work, human approval or own independent review. Two earlier label materials are preserved exactly in a separate JSON file. Their native case text combines all original material/task/transfer and answers without omissions.','','The case count is a review fixture. Actual learner mastery follows demonstrated understanding and transfer; multi-step transfer within one task can suffice.','']
for id in s['reviewReadyGoalIds']:
    g=new_by[id];r=next(r for r in records if r['goalId']==id)
    md += ['## '+id,'','### Whole goal DE','',g['title'],'',g['description'],'','### Whole goal EN','',g['titleEn'],'',g['descriptionEn'],'','### Current direct prerequisites','',json.dumps(g['requires']), '']
    for e in r['profile']['expectations']:
        md += ['### Expectation '+e['id'],'','DE essential: '+e['essentialUnderstandingDe'],'','EN essential: '+e['essentialUnderstandingEn'],'','DE observable: '+e['observablePerformanceDe'],'','EN observable: '+e['observablePerformanceEn'],'']
    for c in cases:
        if c['goalId']!=id:continue
        md += ['### Case '+c['id'],'']
        for key,label in [('taskDemandDe','Task/material/transfer DE'),('taskDemandEn','Task/material/transfer EN'),('expectedPerformanceDe','Expected complete answer DE'),('expectedPerformanceEn','Expected complete answer EN'),('understandingFocusDe','Reasoning focus DE'),('understandingFocusEn','Reasoning focus EN')]:md += ['#### '+label,'',c[key],'']
put('materials/four-whole-goals-eight-complete-DE-EN-cases.reviewer-ready.md','\n'.join(md))

cur_source_path=ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json';cur_source=get(cur_source_path);old_source=get(ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024.source-extraction.json')
source_ids=['he-chem-sekii-e-1-b07-a01-e3d57612','he-chem-sekii-e-2-b01-a01-4b89f4d7','he-chem-sekii-e-2-b05-a01-0713a913']
comp=[]
for id in source_ids:
    a=next(g for g in old_source['sourceGoals']if g['id']==id);b=next(g for g in cur_source['sourceGoals']if g['id']==id);assert a==b;comp.append({'sourceGoalId':id,'wholeOldAndCurrent2026SourceRow':b,'exactRowIdentity':True})
put('source/current2026-primary-author-reading-and-bounded-lineage.actual.json',{'role':'Actual targeted author source reading/identity and exact older lineage; no new scientific source approval','HEG9Physical12Reading':bind(OWN/'source/HE-G9-physical12.actual-author-reading.txt'),'HECurrent2026Physical34to35Reading':bind(OWN/'source/HE-current2026-physical34-35.actual-author-reading.txt'),'HEOldPDFPhysical34to35Reading':bind(OWN/'source/HE-KC2024-physical34-35.actual-author-reading.txt'),'localPrimaryPDFBindings':[bind(ROOT/'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf'),bind(ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf'),bind(ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf')],'officialCurrentPDFWebOpen':{'url':'https://kultus.hessen.de/sites/kultus.hessen.de/files/2026-07/kcgo_chemie_21.04.2026.pdf','success':True,'pages':52,'documentEdition':'Ausgabe2024, Stand21.04.2026','remoteLocalByteIdentityClaimed':False},'exactThreeSourceRowsCurrent2026':comp,'current2026ExtractionBinding':bind(cur_source_path),'wholeExtractionPipelineFreshApproval':False,'actualAuthorObservations':['HE G9 grade8 compulsory labelling, disposal and protection are distinct named components; label candidate covers bounded label component.','Current HE page35 galvanic example is distinct from standard-reference and numerical-voltage source duty; those companion duties remain open.','Arrhenius source explicitly names five acids and four hydroxides/aqueous solution names and salts. Exact18 primary recall cards cover the nine selected name/formula associations, not the salts duty.','Brønsted donor/acceptor and aqueous species are named; water ampholyte/fresh charged transfer is an author operationalization of the connected proton-transfer model.'],'newCaseModelPrimaryReferences':[{'url':'https://openstax.org/books/chemistry-2e/pages/17-2-galvanic-cells','actualSuccessfulWebOpen':True,'usedFor':'Qualitative cell, electron path and charge-compensation mechanisms.'},{'url':'https://openstax.org/books/chemistry-2e/pages/14-1-bronsted-lowry-acids-and-bases','actualSuccessfulWebOpen':True,'usedFor':'Donor/acceptor roles, conjugate pairs and water ampholyte.'},{'url':'https://goldbook.iupac.org/terms/view/B00744','successfulRead':False,'error':'HTTP403; not used as read source.'}],'priorB007ActualSourceAndReviewedMaterialLineage':get(B7/'primary-source-reading-and-exact-material-review-lineage.actual.json'),'authorSourceHoldsCleared':0,'strictGain':0})

pdf_pages=[bind(OWN/f'native/four/actual-page-{n}.png')for n in [3,4,5,6]]
put('visualization/four-actual-native-PDF-page-author-inspection.actual.json',{'role':'Actual author view_image inspection of all four rendered goal pages plus original four images; independently reviewed V remains pending','pages':pdf_pages,'goalIdsInPDFOrder':s['reviewReadyGoalIds'],'authorObservation':'Four target descriptions, exact retained illustration and full direct/external prerequisites are rendered without observed clipping. Complete DE/EN is supplied in raw/material files. This is author preparation, no independent D/V judgment.','KEEPIntentOnly':True,'newRasterGenerated':False,'humanApproval':False,'strictGain':0})

index=get(OWN/'declared-input-snapshot-index.actual.json');paths=[]
for cfg_path in subject['semanticAtomicityConfigPaths']:
    paths.extend([ROOT/cfg_path,ROOT/get(ROOT/cfg_path)['reviewPath']])
paths += [ROOT/'AGENTS.md',ROOT/'docs/qa-ci/chemie-biologie-m7-twenty-five-current-chemistry-continuation-2026-10-07.md',mcfg_path,mrev_path,card_path,deck_path,cur_source_path,ROOT/'curricula/DE/Gymnasium/input/HE/lower-secondary/g9-chemie.pdf',ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf',ROOT/'curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf',B7/'primary-source-reading-and-exact-material-review-lineage.actual.json',B7/'seven-routine-uuid-and-fourteen-case-two-card-binders.author-candidate.json',PREFIX/'2026-10-05/chemie-b014-eleven-current-source-description-candidate-v1/eleven-description-deltas-and-split-templates.json',B14/'a-scoped.config.json',B14/'m-scoped.config.json',B14/'a-scoped.review.jsonl',B14/'m-scoped.review.jsonl',ARR/'memory-one-goal-reviewed.config.json',ARR/'canonical-with-one-memory-goal.reviewed.inactive.candidate.json']
for name in ['one-goal.memory-review.reviewed.candidate.jsonl','eighteen.cards-review.reviewed.candidate.jsonl','de_gymnasium_chemistry_arrhenius_names_formulas.de.reviewed.inactive.candidate.json','de_gymnasium_chemistry_arrhenius_names_formulas.en.reviewed.inactive.candidate.json']:paths.append(ARR/name)
for v in mcfg['visibilityScopes']:paths.append(ROOT/v['viewPath'])
for name in ['goalBookModel.ts','materializeGoalDescriptionRolloutBatch.ts','goalBookRenderer.ts','exportGoalBookReviewBundle.ts','validateGoalDescriptionReviewCampaign.ts','createGoalDescriptionReviewCampaign.ts','positiveGoalEvidenceProfileModel.ts','semanticAtomicityReview.ts','memoryCardReview.ts']:paths.append(ROOT/'app/scripts'/name)
paths += [ROOT/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md',ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md']
for batch in ['2026-09-30/batch-007-open-remainder-current-3-v1.config.json','2026-10-05/batch-014-open-remainder-six-current-v1.config.json']:paths.append(ROOT/'curricula/DE/Gymnasium/quality/goal-description-review/chemie/rollout-v1'/batch)
seen={i['originalPathAtUse']for i in index['inputs']}
for p in paths:
    key=str(p.relative_to(ROOT))
    if key in seen:continue
    seen.add(key);b=p.read_bytes();dest=OWN/'declared-input-snapshots'/f'{len(index["inputs"])+1:03d}-{p.name}.bin';dest.write_bytes(b)
    index['inputs'].append({'path':str(dest.relative_to(ROOT)),'originalPathAtUse':key,'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b),'exactByteSnapshot':True,'snapshotStage':'completion author targeted reading, before final seal'})
put('all-declared-input-snapshot-index.actual.json',index)
drift=[]
for row in index['inputs']:
    p=ROOT/row['originalPathAtUse'];now=bind(p)
    if now['sha256']!=row['sha256']:drift.append({'originalPathAtUse':row['originalPathAtUse'],'sha256AtUse':row['sha256'],'sha256AtPreSealObservation':now['sha256'],'snapshotPreservesActualUsedBytes':True,'mustReconcileBeforeLaterIntegration':True})
put('inputs-at-use-and-live-pre-seal-drift.actual.json',{'role':'Exact used inputs preserved; concurrent live work is not reverted','snapshottedInputs':len(index['inputs']),'liveDriftSinceUse':drift,'doNotOverwriteLiveFromCandidate':True,'activeWrites':0})
put('reviewer-entry-routes.author.json',{'role':'Neutral sealed author inputs for independent review; author has no own approval','selectedNineGoalIds':s['selectedGoalIds'],'reviewReadyFourGoalIds':s['reviewReadyGoalIds'],'heldFiveGoalIds':s['heldGoalIds'],'nineWholeRaw':'nine-whole-DE-EN-and-native-page-context.author.raw.json','fourWholeDPRaw':'four-current-whole-native-D-and-P-review.author.raw.json','PWholeNativeRecords':'native/positive-four.current-author-candidate.jsonl','PFullCasesDEEN':'materials/four-whole-goals-eight-complete-DE-EN-cases.reviewer-ready.md','exactPriorTwoLabelMaterials':'materials/two-exact-previously-reviewed-label-material-bodies.json','exactFieldDeltas':'exact-four-goal-field-differences-and-475-preservation.author.json','AMCurrentAndExactReuse':'memory/current-nine-A-M-whole-records-and-exact-reuse-boundaries.author.raw.json','sourceCurrentPrimaryBoundaries':'source/current2026-primary-author-reading-and-bounded-lineage.actual.json','sourceWholeOriginalDuties':'source/four-bounded-existing-source-rows-and-original-partner-duties.author.json','actualImagesKEEPIntents':'visualization/nine-exact-existing-assets-and-four-actual-author-KEEP-intents.raw.json','actualRenderedPDF':'native/four/book.pdf','actualRenderedHTML':'native/four/book.html','blindNativeRoundA':'native/four/round-a','blindNativeRoundB':'native/four/round-b','openFiveTemplates':'five-held-whole-goals-existing-split-templates-and-companions.author.raw.json','guardedFutureMerge':'guarded-later-integration-field-intents.author.json','memoryInactiveSupportOnly':'memory/canonical.current480-with-exact-support-node.inactive.validation-only.json','humanApproval':False,'actualLearnerPerformance':False,'strictGain':0})
print(json.dumps({'wholeSelectedInputs':9,'boundedReviewReadyDP':4,'heldWholeGoals':5,'unchangedOtherWholeGoals':475,'exactNativeAReused':3,'exactNativeMNoMemoryReused':2,'conditionalArrheniusMemoryCards':18,'currentMemoryVisibilityScopes':7,'currentMemoryTargetGoalViewPairs':2,'inputSnapshots':len(index['inputs']),'liveInputsDrifted':len(drift),'authorApprovalRecords':0,'strictGain':0}))
