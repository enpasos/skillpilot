#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Materialize scoped NI author proposals; all writes stay inside this dossier."""
from pathlib import Path
from datetime import datetime, timezone
import copy, hashlib, json, uuid, shutil

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT).as_posix()
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05'
AUTHOR = BASE / 'biologie-ni-ten-source-hold-remediation-candidate-v1'
PEER = BASE / 'biologie-ni-ten-source-hold-remediation-independent-a-v1'
NI5 = BASE / 'biologie-ni-five-current-adoption-candidate-v3'
CANON = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KIND = 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
ATLAS = 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
NOW = datetime.now(timezone.utc).isoformat()
NS = uuid.UUID('08a43a1b-d97e-522c-9dfa-c950a493364e')
ORIENT = '2d451684-6e53-565e-a987-f362da919d2c'
NI5IDS = ['359e6313-cd86-54d1-bee5-8e680101dc32', '0263fb84-33b1-52a3-a47e-dad56be7c9bc', '36d3bf01-e68b-55be-8e20-5652ada36a51', '0b55e592-3335-52e4-8b4f-79c53f32400b', '9e459608-bdea-55a1-b9c5-214bbd741be6']

def read(p):
    p = Path(p)
    return json.loads((p if p.is_absolute() else ROOT/p).read_text())

def write(name, obj):
    p = OWN/name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')
    return REL+'/'+name

def sha(p):
    return 'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()

templates = read(AUTHOR/'nine-missing-performance.DEEN.goal-templates.candidate.json')['goalTemplates'] + read(AUTHOR/'four-prior-templates.referenced.candidate.json')['goalTemplatesCopiedWithoutSemanticChange']
mem = read(AUTHOR/'two-memory-goals.DEEN.templates.candidate.json')['goalTemplates']
keys = {x['candidateKey']: str(uuid.uuid5(NS, 'canonical-ni-kc2015-source-remediation:'+x['candidateKey'])) for x in templates+mem}
cluster = str(uuid.uuid5(NS, 'canonical-ni-kc2015-source-remediation:supplement'))
canonical = read(CANON)
baseline = copy.deepcopy(canonical)
by = {g['id']:g for g in canonical['goals']}
oldni5 = {g['id']:g for g in read(NI5/'canonical.biologie.candidate.json')['goals']}
for gid in NI5IDS:
    assert gid not in by, 'NI5 predecessor already adopted: rebase this author materialization explicitly'
    g = copy.deepcopy(oldni5[gid]); canonical['goals'].append(g); by[gid]=g
for t in templates+mem:
    g = {k:copy.deepcopy(t[k]) for k in ['title','titleEn','description','descriptionEn','contains','type','tags','weight','applicability']}
    g.update(id=keys[t['candidateKey']], requires=t.get('requires',[])+[keys[k] for k in t.get('requiresCandidateKeys',[])])
    g['dimensionTags']={'framework':'canonical-gymnasium-biology','demandLevel':'AB1' if t['candidateKey'] in ['selected_native_tree_species_knowledge','five_vertebrate_groups_traits','native_tree_species_memory','vertebrate_groups_memory'] else 'AB2','processCompetencies':[],'guidingIdeas':['BIO_ENTWICKLUNG'],'phase':'GLOBAL','area':'Organismische Ordnung und Verwandtschaft','topicCode':'CANONICAL.BIOLOGY.'+t['candidateKey'].upper()}
    if 'nodeKind' in t:
        g['nodeKind'] = t['nodeKind']
    g['extendedData']={'provenance': {'sourceLandscapeId':'0b27a054-e81e-5423-aa71-d3d8d9d8f0db','sourceGoalIds':t.get('sourceGoalIds',[])}, 'authorCandidate':{'package':REL,'candidateKey':t['candidateKey'],'gradeBand':t['gradeBand'],'independentCurrentNativeReview':'pending','humanApproval':False}}
    if t in mem:
        stem='native_tree_species' if t['candidateKey']=='native_tree_species_memory' else 'vertebrate_groups'
        g['extendedData']['vocabularySource']=REL+f'/decks/memory-deck.de_gymnasium_biology_{stem}.de.corrected.inactive.candidate.json'
        g['extendedData']['vocabularySourceEn']=REL+f'/decks/memory-deck.de_gymnasium_biology_{stem}.en.corrected.inactive.candidate.json'
    canonical['goals'].append(g);by[g['id']]=g
rootgoal = canonical['goals'][0]
rootgoal['contains'].append(cluster)
supplement = {'id':cluster,'title':'Lebewesen ordnen, Verwandtschaft und Variabilität erklären','titleEn':'Classify organisms and explain kinship and variation','description':'Kompetenzen zu organismischer Ordnung, Verwandtschaft und nichtmolekularer Variabilität.','descriptionEn':'Competencies in organismal classification, kinship and non-molecular variation.','contains':NI5IDS+list(keys.values()),'requires':[ORIENT],'type':'cluster','weight':20,'tags':['GK','LK','canonical','SekI'],'applicability':{'jurisdiction':['DE-NI']},'extendedData':{'applicabilityMappingInheritance':'boundary','authorCandidate':{'package':REL,'humanApproval':False,'currentReview':'pending'}}}
canonical['goals'].append(supplement)
correction = read(PEER/'existing-440.full-clause-context.corrected.inactive.candidate.json')
pedigree = '440854be-7f06-5678-91cb-ba8dcab56959'
assert by[pedigree]['requires'] == correction['requiresBefore']
by[pedigree]['requires'] = correction['requiresAfterProposed']
canonpath=write('canonical.biologie.current.inactive.snapshot.json',canonical)
write('baseline.canonical.actual.snapshot.json',baseline)
write('stable-prospective-ids.author.json',{'namespace':str(NS),'uuid5NamePrefix':'canonical-ni-kc2015-source-remediation:','assignments':keys,'supplementId':cluster,'unchangedNI5ProspectiveIds':NI5IDS,'operativeAssignment':False,'currentClosureIncrease':0,'humanApproval':False})
write('thirteen-semantic-templates.exact-author-inputs.json',{'goals':templates,'memoryGoals':mem,'preservedDEENDescriptions':True,'newGoalIds':[keys[t['candidateKey']] for t in templates],'nativeIndependentD':'pending'})
write('440-source-context.corrected.inactive.json',correction)

# Keep all whole source clauses; only the explicitly affected source cells and targets change.
source=read(NI5/'ni.current-source.candidate.json')
mapping=read(NI5/'ni.current-mapping.candidate.json')
routes=read(AUTHOR/'sixteen-full-clause-routes.candidate.json')['routes']
sourceby={g['id']:g for g in source['sourceGoals']}
deltas=[]
for route in routes:
    sid=route['sourceGoalId']; binding=route['sourceBinding']; s=sourceby[sid]; before=copy.deepcopy(s)
    targets=route['canonicalGoalIdsAfterProposed']+[keys[k] for k in route['candidateKeysAfterProposed']]
    page=binding['physicalPage']; grade=binding['gradeBand']; literal=binding['literalPrimaryClause']
    s.update(sourceText=literal,rawSourceText=literal,title=literal,description='Die lernende Person kann '+literal,sourceRef=f'Niedersachsen KC Naturwissenschaften Gymnasium 2015, Biologie, {s["topicCode"]}, Ende Jg. {grade}, S. {page}.')
    s['sourceSpan']['label']=s['headingTitle']+': '+literal
    s['tags']=[v for v in s.get('tags',[]) if not v.startswith('grades:')]+['grades:'+grade]
    s.setdefault('metadata',{}).update(grades=grade,sourcePage=page,sourcePhysicalPage=page,canonicalTargets=targets,matchType='partial',nativeIndependentSourceReview='pending',operatorPreserved=True)
    beforemaps=[copy.deepcopy(m) for m in mapping['mappings'] if m['legacyGoalId']==sid]
    mapping['mappings']=[m for m in mapping['mappings'] if m['legacyGoalId']!=sid]+[{'legacyGoalId':sid,'canonicalGoalId':g,'matchType':'partial','reviewDecisionId':sid} for g in targets]
    decision=next(d for d in mapping['decisions'] if d['sourceGoalId']==sid); beforedecision=copy.deepcopy(decision)
    decision.update(canonicalGoalIds=targets,matchType='partial',status='mapped',decision='mapped',reviewer='Codex inactive NI source author; independent current native reviews pending',reviewedAt=NOW,rationale='Complete actual primary clause and exact grade/operator preserved. Candidate route only; no current source closure or human approval.')
    deltas.append({'sourceGoalId':sid,'before':before,'after':copy.deepcopy(s),'mappingBefore':beforemaps,'mappingAfter':[m for m in mapping['mappings'] if m['legacyGoalId']==sid],'decisionBefore':beforedecision,'decisionAfter':copy.deepcopy(decision),'sourceBinding':binding})
source['qualityReview'].update(status='inactive_current_author_candidate_pending_independent_native_review',reviewedAt=NOW)
sourcepath=write('NI.source.current.inactive.snapshot.json',source)
mapping.update(sourceExtractionPath=sourcepath,reviewId='biologie-ni-current-native-author-candidate-v2')
mappingpath=write('NI.mapping.current.inactive.snapshot.json',mapping)
write('sixteen-source-and-target.exact-author-deltas.json',{'deltas':deltas,'allWholeClausesPreserved':True,'sourceCoverageApproved':False,'global9fBodyAndOtherStateBindingsPreserved':True,'humanApproval':False})
atlas=read(ATLAS)
atlas.update(landscapePath=canonpath,semanticKindLedgerPath=REL+'/semantic-kinds.native-shape.inactive.snapshot.json',outputDirectory='app/scripts/config/goal-books/source-views/biologie-ni-current-native-author-v2',manifestPath='app/scripts/config/goal-books/biologie-ni-current-native-author-v2.sources.json',navigationViewPath='app/scripts/config/goal-books/navigation/biologie-ni-current-native-author-v2.view.json',navigationViewId='de-gym-biology-ni-current-native-author-v2',expectedCurricularAtomicGoalCount=atlas['expectedCurricularAtomicGoalCount']+18)
atlas['mappingPaths']=[mappingpath if '/DE-NI/' in p else p for p in atlas['mappingPaths']]
write('atlas.inputs.json',atlas)
book=read('app/scripts/config/goal-books/de-gym-biology-national-atlas.json')
book.update(landscapePath=canonpath,semanticKindLedgerPath=atlas['semanticKindLedgerPath'],compositionViewManifestPath=atlas['manifestPath'],publicationMode='review',evidenceReviewPaths=[],outputPath=REL+'/prospective-full.book-model.json')
write('book.config.json',book)
batch=read('curricula/DE/Gymnasium/quality/goal-description-review/biologie/rollout-v1/2026-10-05/m7-ephase-open-remainder-seven-current-20261005-v1.config.json')
source_context_existing=['0380f992-723a-513d-8c3f-8ca7f8e0394f','0dbe758c-73c8-530b-bbbd-fb55540f942f','28850d2e-062d-5341-ac66-bd787a8fc84f',pedigree,'ec88fc1d-ee0f-5a01-9464-dc358241050e']
batch.update(batchId='biologie-ni-current-native-author-20261005-v2',bookId='de-gym-biologie-ni-current-native-author-20261005-v2',title='Biologie NI: aktuelle Quellenkompetenzen – inaktiver Autorenkandidat',baseGoalBookConfigPath=REL+'/book.config.json',goalIds=NI5IDS+[keys[t['candidateKey']] for t in templates],outputDirectory=REL+'/native-eighteen-finalbook')
remaining=list(batch['goalIds']); ordered=[]
while remaining:
    ready=[g for g in remaining if not any(p in remaining for p in by[g]['requires'])]
    assert ready, 'Candidate batch prerequisite cycle'
    ordered.extend(ready);remaining=[g for g in remaining if g not in ready]
batch['goalIds']=ordered
write('batch.config.json',batch)
bindings_batch=copy.deepcopy(batch)
bindings_batch.update(batchId='biologie-ni-existing-five-source-bindings-author-20261005-v2',bookId='de-gym-biologie-ni-existing-five-source-bindings-author-20261005-v2',title='Biologie NI: fünf bestehende Quellenbindungen – inaktiver Autorenkandidat',goalIds=source_context_existing,outputDirectory=REL+'/native-existing-five-finalbook')
remaining=list(bindings_batch['goalIds']);ordered=[]
while remaining:
    ready=[g for g in remaining if not any(p in remaining for p in by[g]['requires'])]
    assert ready,'Existing binding batch prerequisite cycle'
    ordered.extend(ready);remaining=[g for g in remaining if g not in ready]
bindings_batch['goalIds']=ordered
write('existing-five-bindings.batch.config.json',bindings_batch)
for stem in ['native_tree_species','vertebrate_groups']:
    for lang in ['de','en']:
        f=f'memory-deck.de_gymnasium_biology_{stem}.{lang}.corrected.inactive.candidate.json'
        deck=read(PEER/f);deck.pop('status',None);write('decks/'+f,deck)
inputs=[ROOT/CANON,ROOT/KIND,ROOT/ATLAS,AUTHOR/'author-checkpoint.freeze.manifest.json',PEER/'review.freeze.manifest.json',NI5/'source-description-adoption.freeze.receipt.json']
write('author-input-bindings.actual.json',{'createdAt':NOW,'inputs':[{'path':str(p.relative_to(ROOT)),'sha256':sha(p),'bytes':p.stat().st_size} for p in inputs],'activeWrites':False,'global9fAdoption':'HOLD_not_part_of_this_native_candidate','existing440BodyPreserved':True,'currentNativeIndependentReviews':'pending'})
native=ROOT/'tmp/biologie-ni-ten-current-native-author-candidate-v2-native-root';native.mkdir(parents=True,exist_ok=True)
for name in ['curricula','contracts','docs']:
    target=native/name
    if not target.exists():target.symlink_to(ROOT/name,target_is_directory=True)
app=native/'app';app.mkdir(exist_ok=True)
for name in ['src','node_modules','public']:
    target=app/name
    if not target.exists():target.symlink_to(ROOT/'app'/name,target_is_directory=True)
target=app/'package.json'
if not target.exists():target.symlink_to(ROOT/'app/package.json')
copied=[]
for src in (ROOT/'app/scripts').rglob('*'):
    relative=src.relative_to(ROOT/'app/scripts')
    if src.is_file() and not src.is_symlink() and not any(x in relative.parts for x in ['config','fixtures']) and src.suffix in ['.ts','.mts','.mjs','.js']:
        dest=app/'scripts'/relative;dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dest);copied.append({'path':str(relative),'sha256':sha(src),'bytes':src.stat().st_size})
write('native-input-root.readonly-alias-and-code.receipt.json',{'physicalNativeRoot':str(native),'physicalCodeFileCount':len(copied),'physicalCodeBytes':sum(x['bytes'] for x in copied),'codeFiles':copied,'sourceAndAssetAliases':'read-only by operation; no mutation through these aliases is permitted','permittedOutputPaths':[str(native/'app/scripts/config/goal-books'),str(OWN)],'activeRootOutputsPermitted':False,'wholeCurriculaOrAssetsCopied':False})
write('prospective-paths.json',{'nativeInputRoot':str(native),'canonicalPath':canonpath,'semanticPath':atlas['semanticKindLedgerPath'],'newOrdinaryGoalIds':[keys[t['candidateKey']] for t in templates],'newMemoryGoalIds':[keys[t['candidateKey']] for t in mem],'predecessorNI5GoalIds':NI5IDS,'supplementId':cluster,'goalIds':batch['goalIds'],'sourceMappingPath':mappingpath,'sourceExtractionPath':sourcepath,'atlasConfigPath':REL+'/atlas.inputs.json','baselineAtomic':atlas['expectedCurricularAtomicGoalCount']-18,'prospectiveAtomic':atlas['expectedCurricularAtomicGoalCount'],'noOperativeAdoption':True,'memoryOriginMappings':{keys['selected_native_tree_species_knowledge']:keys['native_tree_species_memory'],keys['five_vertebrate_groups_traits']:keys['vertebrate_groups_memory']}})
print(json.dumps({'status':'inactive_author_inputs_prepared','newOrdinary':13,'predecessorOrdinary':5,'newMemory':2,'wholeSourceClauseRoutes':16,'changedExistingRequires':1,'changedExistingDescriptions':0,'currentStrictNetIncrease':0,'humanApproval':False}))
