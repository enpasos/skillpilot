# Apache-2.0. Author-informed prospective preparation; never writes active paths.
from pathlib import Path
import copy, datetime, hashlib, json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
STAGE = BASE / 'biologie-q1-ni-consolidated-integration-candidate-v1/staged/ni-three-targeted-root-preparation-v1'
ROUTE = BASE / 'biologie-ni-current-source-integration-route-v1'
SPLIT = BASE / 'biologie-ni-fw6-008-two-atomic-companions-candidate-v2'
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
rel = lambda p: str(p.relative_to(ROOT))
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
SID = '0b27a054-e81e-5423-aa71-d3d8d9d8f0db'
CID = '08a43a1b-d97e-522c-9dfa-c950a493364e'
F = 'ni-biology-seki-kc2015-fw6-008-d14910ea'
NEW3 = ['359e6313-cd86-54d1-bee5-8e680101dc32','0263fb84-33b1-52a3-a47e-dad56be7c9bc','36d3bf01-e68b-55be-8e20-5652ada36a51']
NEW2 = ['0b55e592-3335-52e4-8b4f-79c53f32400b','9e459608-bdea-55a1-b9c5-214bbd741be6']
NEW = NEW3 + NEW2
PARENTS = ['b530a382-2786-5794-8821-3e01a62d88fd','b4176012-f93a-5dd2-84b3-edd6a9932367']
CP = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KP = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
SP = 'curricula/DE/Gymnasium/input/NI/lower-secondary/source-extraction/DE_NI_BIOLOGIE_SEKI_KC2015.source-extraction.json'
MP = 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.m7-e3-recombination-20261001-v2.review.json'
MAPBASE = 'curricula/DE/Gymnasium/mapping/DE-NI/lower-secondary/ni_biology_lower_secondary_source_extraction_to_canonical_biology.review.json'
REG = 'curricula/DE/Gymnasium/provenance/source-landscape-registry.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
NAV = 'app/scripts/config/goal-books/navigation/de-gym-biology-national-atlas.view.json'
VIEW = 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas/de-gym-biologie-bundesweit-source-de-ni-seki.view.json'
FUTURESOURCE = SP.replace('.source-extraction.json','.current-five-20261005-v1.source-extraction.json')
FUTUREMAP = MP.replace('.m7-e3-recombination-20261001-v2','.m7-five-current-20261005-v1')
HISTORY = 'curricula/DE/Gymnasium/quality/source-mapping-history/biologie-ni-five-current-20261005-v1'

def write(n,d):
    p=OUT/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');return rel(p)
def note(n,d):
    return write(n,{'status':'candidate','reviewAuthority':'ai_candidate','authorshipMode':'materialization after known author and independent peer reviews; not independent new review','canonicalLandscapeId':CID,'sourceLandscapeId':SID,'createdAt':NOW,'humanApproval':False,'activeWrites':0,**d})
def goalids(v):
    if isinstance(v,dict):return ([v['goalId']] if v.get('kind')=='goalEntry' else [])+sum((goalids(x) for x in v.values()),[])
    if isinstance(v,list):return sum((goalids(x) for x in v),[])
    return []
def structure(v,i):
    if isinstance(v,dict):
        if v.get('id')=='canonical-goal-'+i:return v
        for x in v.values():
            r=structure(x,i)
            if r:return r
    if isinstance(v,list):
        for x in v:
            r=structure(x,i)
            if r:return r

inputs=[CP,KP,SP,MP,MAPBASE,REG,ATLAS,NAV,VIEW]
before={p:read(ROOT/p) for p in inputs}
for p,d in before.items():write('before/'+Path(p).name,d)
canonical=read(STAGE/'canonical.biologie.candidate.json')
cg={g['id']:g for g in canonical['goals']};old={g['id']:g for g in before[CP]['goals']}
assert set(cg)-set(old)==set(NEW3)
assert [i for i in old if old[i]!=cg[i]]==PARENTS
templates=read(SPLIT/'two-companions.goal-templates.candidate.json')
for ident,t in zip(NEW2,templates['goals']):
    g={'id':ident,**copy.deepcopy(t['goalTemplateWithoutId'])}
    assert 'resourceLinks' not in g
    canonical['goals'].append(g);cg[ident]=g
cg[PARENTS[1]]['contains'].extend(NEW2)
assert len(canonical['goals'])==446
write('canonical.biologie.candidate.json',canonical)
source=read(ROUTE/'versioned-replacements/ni.current-source.review-pending.json')
mapping=read(ROUTE/'versioned-replacements/ni.current-mapping.review-pending.json')
delta=read(SPLIT/'source-cell-and-three-cache.delta.candidates.json')
sg={g['id']:g for g in source['sourceGoals']}
cache=[]
for d in delta['advisoryCacheDeltas']:
    i=d['sourceGoalId'];cache.append(copy.deepcopy(d));sg[i]['metadata']['canonicalTargets']=copy.deepcopy(d['afterCleanupOnly'])
after=copy.deepcopy(delta['selectedPrimaryCell']['afterWithoutUnadoptedTargetIds']);after['metadata']['canonicalTargets'].extend(NEW2)
source['sourceGoals']=[after if g['id']==F else g for g in source['sourceGoals']]
source['qualityReview'].update({'status':'current_five_candidate_root_adoption_required','reviewedBy':'author-informed targeted Source/D/A/M candidate preparation; no human approval','reviewedAt':NOW,'notes':['115 complete predecessor source records unchanged; five NI3 primary cells plus FW6-008 precisely versioned; two other advisory caches aligned to already-operative v2 targets. FW6-003 retired as unsupported synthetic source atom.','Both new FW6-008 mappings are partial and jointly cover the chosen chromosomal principles. Current supplied-model and Book bindings remain separate root-owned gates.']})
for step in source['pipelineStatus']['steps']:
    if step['id'] in ['MAPPING-2','MAPPING-3']:
        step['status']='blocked'
        for check in step['checks']:
            check['passed']=False;check['details']='Inactive NI5 candidate. See actual scoped validation and source checks; root adoption and current given-model/Book binding are pending. 123 mapped groups alone does not certify normative coverage.'
mapping.update({'reviewId':'DE-NI-BIOLOGIE-SEKI-KC2015-MAPPING-3-FIVE-CURRENT-20261005-V1','sourceExtractionPath':FUTURESOURCE,'status':'inactive_current_five_candidate_root_adoption_required'})
md=read(SPLIT/'mapping-fw6-008.delta.candidate.json')
decision=copy.deepcopy(md['afterDecisionWithoutUnadoptedTargetIds']);decision['canonicalGoalIds'].extend(NEW2)
decision.update({'reviewedAt':NOW,'reviewer':'OpenAI Codex author-informed candidate materializer; deployed model unexposed','notes':'A frozen743773a49377f95502763c223588cf6fcc29db5da796789b635dd224e536c1e6 / B frozen5418d5761c7236bfea2cda6e15bcd9f9a0b274a50b757d7b46070d01c0ff5a13 support both separate current ID-null templates. Root prospectively assigns IDs. Both component links remain partial; no actual current BookD2/V approval here.'})
mapping['decisions']=[decision if d['sourceGoalId']==F else d for d in mapping['decisions']]
mapping['mappings'].extend({'legacyGoalId':F,'canonicalGoalId':i,'matchType':'partial','reviewDecisionId':F} for i in NEW2)
assert len(source['sourceGoals'])==len(mapping['decisions'])==123 and len(mapping['mappings'])==336
write('ni.current-source.candidate.json',source);write('ni.current-mapping.candidate.json',mapping)
localmapping=copy.deepcopy(mapping);localmapping['sourceExtractionPath']=rel(OUT/'ni.current-source.candidate.json');write('ni.current-mapping.snapshot-test.json',localmapping)
oldsg={g['id']:g for g in before[SP]['sourceGoals']};newsg={g['id']:g for g in source['sourceGoals']}
oldd={d['sourceGoalId']:d for d in before[MP]['decisions']};newd={d['sourceGoalId']:d for d in mapping['decisions']}
unchanged_s=[i for i in newsg if newsg[i]==oldsg[i]];unchanged_d=[i for i in newd if newd[i]==oldd[i]]
assert len(unchanged_s)==115 and len(unchanged_d)==117
registry=copy.deepcopy(before[REG]);entry=next(e for e in registry['entries'] if e['landscapeId']==SID);entrybefore=copy.deepcopy(entry)
entry.update({'sourcePath':FUTURESOURCE,'archiveSourcePath':HISTORY+'/before-source/'+Path(SP).name+'.snapshot','archivePath':HISTORY+'/before-source/'})
write('source-landscape-registry.candidate.json',registry)
atlas=copy.deepcopy(before[ATLAS]);atlas['mappingPaths']=[FUTUREMAP if p==MP else p for p in atlas['mappingPaths']];atlas['expectedCurricularAtomicGoalCount']=368
write('source-atlas.inputs.prospective.json',atlas)
testatlas=copy.deepcopy(atlas);testatlas['mappingPaths']=[rel(OUT/'ni.current-mapping.snapshot-test.json') if p==FUTUREMAP else p for p in atlas['mappingPaths']];testatlas['landscapePath']=rel(OUT/'canonical.biologie.candidate.json');testatlas['semanticKindLedgerPath']=rel(OUT/'biologie.semantic-kinds.snapshot-test.json');write('source-atlas.inputs.snapshot-test.json',testatlas)
nav=copy.deepcopy(before[NAV]);structure(nav,PARENTS[0])['children'].append({'kind':'goalEntry','goalId':NEW3[0]});structure(nav,PARENTS[1])['children'].extend({'kind':'goalEntry','goalId':i} for i in NEW3[1:]+NEW2)
view=copy.deepcopy(before[VIEW]);view['rootNodes'][0]['children'].extend({'kind':'goalEntry','goalId':i} for i in NEW)
assert set(goalids(nav))-set(goalids(before[NAV]))==set(NEW) and len(goalids(nav))==368
assert set(goalids(view))-set(goalids(before[VIEW]))==set(NEW)
write('navigation.candidate.view.json',nav);write('ni-source.candidate.view.json',view)
oldk=before[KP];atoms=[d['goalId'] for d in oldk['decisions'] if d['semanticKind']=='curricularAtomic']
assert len(atoms)==363 and all(old[i]==cg[i] for i in atoms)
write('biologie.semantic-kinds.base.json',oldk)
am=read(BASE/'biologie-q1-ni-consolidated-integration-candidate-v1/new-goal-semantic-memory.decisions.candidates.json')
am3=[d for d in am['newGoalCandidates'] if d['goalId'] in NEW3]
peer=read(BASE/'biologie-ni-fw6-008-two-atomic-independent-a-v2/two-source-description-atomicity-memory.reviews.candidate.json')
am5=[{'goalId':d['goalId'],'atomicityReason':d['rationale'],'memoryReason':d['memoryReasonCandidate'],'source':'NI3 author candidate rationale'} for d in am3]+[{'goalId':i,'atomicityReason':d['atomicityRationale'],'memoryReason':d['memoryRationale'],'source':'known frozen independent A v2; B supports same scoped findings'} for i,d in zip(NEW2,peer['records'])]
note('five-targeted-kind-am.rationales.candidate.json',{'newGoalIds':NEW,'changedParentIds':PARENTS,'records':am5,'nativeShapeQualification':'Native testing snapshots must use authoritative-shaped Kind decisions; they are prospective schema simulation only, never an active or human approval.'})
for kind in ['semantic-atomicity','memory-card-review']:
    folder='curricula/DE/Gymnasium/quality/'+kind+'/biologie-q1-tests-therapy-current-20261004-v1/'
    config=read(ROOT/(folder+'canonical-biology-full.config.json'));path=ROOT/config['reviewPath'];data=path.read_bytes();(OUT/(kind+'.base.review.jsonl')).write_bytes(data)
    config.update({'landscapePath':rel(OUT/'canonical.biologie.candidate.json'),'reviewPath':rel(OUT/(kind+'.candidate.review.jsonl'))})
    if kind=='memory-card-review':
        cards=ROOT/config['cardReviewPath'];(OUT/'memory.cards.unchanged.review.jsonl').write_bytes(cards.read_bytes());config.update({'cardReviewPath':rel(OUT/'memory.cards.unchanged.review.jsonl'),'reportPath':rel(OUT/'memory.candidate.report.md')})
    write(kind+'.candidate.config.json',config)
    if kind=='memory-card-review':
        probe=copy.deepcopy(config);probe['visibilityScopes'].append({'label':'NI Sek I supplied models candidate','viewPath':rel(OUT/'ni-source.candidate.view.json')});write('memory-card-review.ni-visibility-probe.config.json',probe)
report=BASE/'chemie-stoffmenge-two-corrected-images-current-integration-v1/central-nine-complete.report.json';bio=next(s for s in read(report)['subjects'] if s['subject']=='biologie')
write('strict37.ids.metadata-only.json',{'reportPath':rel(report),'reportDigest':sha(report),'strictCompleteGoalIds':bio['strictCompleteGoalIds'],'profileContentsRead':False})
archive=[]
for p in [SP,MAPBASE,MP]:
    destination=HISTORY+('/before-source/' if p==SP else '/before-reviews/')+Path(p).name+'.snapshot'
    assert '/mapping/' not in destination and not destination.startswith('curricula/DE/Gymnasium/input/')
    archive.append({'currentPath':p,'currentDigest':sha(ROOT/p),'historicalPath':destination})
note('before-after-deltas.candidate.json',{'counts':{'beforeAtoms':363,'afterAtoms':368,'beforeRecords':441,'afterRecords':446,'sourceGroups':123,'mappingEdges':336},'newGoalIds':NEW,'parentChanges':[{'goalId':i,'before':old[i],'after':cg[i]} for i in PARENTS],'changedExistingCanonicalIds':PARENTS,'all363AtomicBodiesUnchanged':True,'unchangedSourceRecordIds':unchanged_s,'unchangedSourceRecordCount':len(unchanged_s),'changedSourceRecordIds':[i for i in newsg if i not in unchanged_s],'retiredSourceRecordIds':list(set(oldsg)-set(newsg)),'unchangedHistoricalDecisionIds':unchanged_d,'unchangedHistoricalDecisionCount':len(unchanged_d),'changedHistoricalDecisionIds':[i for i in newd if i not in unchanged_d],'all334NI3RowsPreserved':mapping['mappings'][:334]==read(ROUTE/'versioned-replacements/ni.current-mapping.review-pending.json')['mappings'],'advisoryCacheDeltas':cache,'sourceRegistryEntry':{'entryKey':'entries[].landscapeId','before':entrybefore,'after':entry},'atlasChangedFields':['mappingPaths: only NI pointer','expectedCurricularAtomicGoalCount:363->368'],'viewPolicy':'Existing NI-source and navigation direct entries preserved, exactly five IDs appended. Native source derivation differences are separately reported; no silent extra deletion.','archivePlan':archive,'futureSourcePath':FUTURESOURCE,'futureMappingPath':FUTUREMAP})
note('input-bindings.receipt.json',{'bindings':[{'path':p,'digest':sha(ROOT/p)} for p in inputs]+[{'path':rel(p),'digest':sha(p)} for p in [STAGE/'canonical.biologie.candidate.json',ROUTE/'versioned-replacements/ni.current-source.review-pending.json',ROUTE/'versioned-replacements/ni.current-mapping.review-pending.json',SPLIT/'two-companions.goal-templates.candidate.json',BASE/'biologie-ni-fw6-008-two-atomic-independent-a-v2/two-atomic-source-description-atomicity-memory.freeze.receipt.json',BASE/'biologie-ni-fw6-008-two-atomic-independent-b-v2/decision.freeze.json']],'PContentsRead':False,'resourcePlaceholderUsedAsVApproval':False})
print('Materialized inactive NI5: 446 records; 368 atoms;123 groups;336 edges;115 source records and117 historical decisions unchanged.')
