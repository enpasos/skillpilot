# SPDX-License-Identifier: Apache-2.0
"""Read sealed inputs; create informed diagnostic artifacts beside this script."""
from pathlib import Path
from collections import Counter, defaultdict
from functools import lru_cache
import csv
import hashlib
import json

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
E12 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
STAGE = E12/'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6'
B = E12/'chemie-q2-current407-remediation24-fresh-independent-b-20261012-v3'
HE = E12/'chemie-q2-MM-HE-context-normative-edge-removal-author-20261012-v4'
A9 = 'a9c22adc-b543-5b0c-a2d8-3189facdff08'
CLUSTER = '266a2b2a-9ee2-52f6-ae09-59343da9a60b'
inputs = {}

def read(path):
    path = Path(path)
    raw = (ROOT/path).read_bytes()
    inputs[str(path)] = {'path': str(path), 'bytes': len(raw), 'sha256': 'sha256:'+hashlib.sha256(raw).hexdigest()}
    return json.loads(raw)

def write(name, data):
    (OUT/name).write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')

def check_seal(path):
    seal = read(path)
    rows = []
    for x in seal['ownFiles']:
        raw = (ROOT/x['path']).read_bytes()
        actual = 'sha256:'+hashlib.sha256(raw).hexdigest()
        assert actual == x['sha256'], x['path']
        if 'bytes' in x:
            assert len(raw) == x['bytes'], x['path']
        rows.append({'path': x['path'], 'sha256': actual, 'bytes':len(raw)})
    return {'seal': inputs[str(path)], 'ownedFilesChecked':len(rows), 'errors':0}

start_seals = [check_seal(B/'FINAL.independent-b.freeze.json'),check_seal(STAGE/'FINAL.technical-preparation.freeze.json')]
entry = read(STAGE/'FINAL.current24.neutral-review-input.json')
land = read(entry['canonical']['path'])
gm = {g['id']:g for g in land['goals']}
kinds = {d['goalId']:d['semanticKind'] for d in read(entry['semanticKinds']['path'])['decisions']}
holds = read(B/'bounded-source-ownership-and-readiness.json')['sourceReadinessHolds']
assert len(holds) == 147
assert kinds[A9] == 'orientation' and kinds[CLUSTER] == 'curricularArea'
readiness = read(entry['compiledScope40Readiness']['path'])
receipt = read(entry['sourceAtlasReceipt']['path'])
scopes = {s['key']:s for s in receipt['scopes']}
raw_inventory = read(entry['rawAllSourceBindings']['path'])
raw = raw_inventory['rawBindings']
assert len(raw)==1242 and raw_inventory['displayDeduplicated'] is False
role_audit = read(OUT.relative_to(ROOT)/'normal-composition-roles.actual.json')
candidate_views = [v for v in role_audit['views'] if v['landscapeRole']=='frozen-current407-candidate' and '/composition-views/' in v['path']]
active_views = [v for v in role_audit['views'] if v['landscapeRole']=='active-normal']
source_views = {v['viewId']:v for v in role_audit['views'] if '/atlas/generated-normal-original/' in v['path']}
assert len(source_views)==48
parents = defaultdict(list)
for g in gm.values():
    for ch in g.get('contains',[]):
        parents[ch].append(g['id'])

@lru_cache(None)
def effective(id):
    req = list(gm[id].get('requires',[]))
    for parent in parents[id]:
        req.extend(q for q in effective(parent) if q != id)
    return list(dict.fromkeys(req))

def role(view,id):
    return next((x['role'] for x in view['selectedAssignments'] if x['goalId']==id),'not-inspected')

def authored_stage_view(views,scope_key):
    ju,stage,profile = scope_key.split('/')
    requested = {'schoolForm':'Gymnasium','jurisdiction':ju,'stage':stage}
    if profile:
        requested['courseProfile']=profile
    matches = [v for v in views if v['scope'].get('stage')==stage and all(requested.get(k)==val for k,val in v['scope'].items())]
    matches.sort(key=lambda v:(-len(v['scope']),v['viewId']))
    return matches[0] if matches else None

# All actual mapping rows are examined before any display deduplication.
# Mappings are provenance rows; operative atlas expansion uses decisions.
relevant_ids = {x['goalId'] for x in holds}|{q for x in holds for q in x['missingPrerequisitesFromTargetView']}|set(gm[CLUSTER]['contains'])
all_mapping_count = 0
literal_route_rows = []
for binding in raw_inventory['mappingInputs']:
    mapping = read(binding['mapping']['path'])
    extraction = read(binding['sourceExtraction']['path'])
    literals = {g['id']:g for g in extraction['sourceGoals']}
    decisions = defaultdict(list)
    for ordinal,d in enumerate(mapping['decisions']):
        decisions[d['sourceGoalId']].append((ordinal,d))
    for ordinal,m in enumerate(mapping['mappings']):
        all_mapping_count += 1
        owner=m['canonicalGoalId'].split(':')[-1]
        if owner not in relevant_ids:
            continue
        literal=literals[m['legacyGoalId']]
        literal_route_rows.append({'rawBindingKey':binding['mapping']['path']+f'#mappings[{ordinal}]',
            'mappingPath':binding['mapping']['path'],'mappingOrdinal':ordinal,'wholeMappingRow':m,
            'directOwner':owner,'sourceExtractionPath':binding['sourceExtraction']['path'],
            'sourceJurisdiction':extraction['jurisdiction'],'wholeLiteralSourceGoal':literal,
            'wholeOriginalDecisionRows':[{'ordinal':i,'decision':d} for i,d in decisions[m['legacyGoalId']]],
            'historicalOrAuthorDecisionMetadataIsNewApproval':False})

affected_route_index = []
for index,r in enumerate(raw):
    affected_route_index.append({'index':index,'rawBindingKey':r['rawBindingKey'],
        'directCanonicalOwner':r['directCanonicalOwner'],'sourceJurisdiction':r['sourceJurisdiction'],
        'sourceStage':r['sourceStage'],'literalSourceGoalId':r['wholeLiteralSourceGoal']['id'],
        'literalSourceText':r['wholeLiteralSourceGoal'].get('sourceText'),
        'affectedTargetDescendants':r['affectedTargetDescendants'],
        'normalWitnesses':r['actualNormalCompiledScopeWitnesses'],
        'broadInheritedBindingIsDirectCoverage':False})

enriched = []
for ordinal,h in enumerate(holds):
    goal=h['goalId'];scope=scopes[h['scopeKey']];target=set(scope['goalIds'])
    assert h['directRequires']==gm[goal].get('requires',[])
    assert set(h['effectiveRequires'])==set(effective(goal))
    assert h['inheritedRequires']==[q for q in effective(goal) if q not in h['directRequires']]
    assert set(h['missingPrerequisitesFromTargetView'])=={q for q in effective(goal) if q not in target}
    matched=authored_stage_view(candidate_views,h['scopeKey'])
    active_matched=authored_stage_view(active_views,h['scopeKey'])
    profile=h['scopeKey'].split('/')[2]
    cross=[v for v in candidate_views if v['scope'].get('jurisdiction')==h['scopeKey'].split('/')[0] and v['scope'].get('stage')=='CrossStage' and (not profile or v['scope'].get('courseProfile')==profile)]
    missing=[]
    for q in h['missingPrerequisitesFromTargetView']:
        prior=[]
        ju=h['scopeKey'].split('/')[0]
        for key,s in scopes.items():
            if s['jurisdiction']==ju and q in s['goalIds']:
                ww=[w for w in s['witnesses'] if w['goalId']==q]
                prior.append({'scopeKey':key,'witnessCount':len(ww),'directWitnessCount':sum(w['coverage']=='direct' for w in ww),'witnesses':ww})
        children = gm[q].get('contains',[])
        missing.append({'goalId':q,'title':gm[q]['title'],'semanticKind':kinds[q],
            'edgeKind':'direct' if q in h['directRequires'] else 'inherited',
            'sourceViewRole':'omitted','sameJurisdictionOtherSourceMembership':prior,
            'clusterChildrenInSameSourceTarget':[c for c in children if c in target],
            'clusterChildrenAbsentFromSameSourceTarget':[c for c in children if c not in target],
            'authoredExactStageRole':role(matched,q) if matched else 'no-compatible-view',
            'activeAuthoredExactStageRole':role(active_matched,q) if active_matched else 'no-compatible-view',
            'authoredCrossStageRoles':[{'path':v['path'],'role':role(v,q)} for v in cross],
            'availabilityOrMasteryEstablished':False})
    cat='orientation-only-source-list-omission' if set(h['missingPrerequisitesFromTargetView'])=={A9} else 'curricular-area-plus-inherited-orientation-omission' if CLUSTER in h['missingPrerequisitesFromTargetView'] else 'curricular-atomic-prerequisite-source-support-open'
    raw_indices=[i for i,r in enumerate(raw) if goal in r['affectedTargetDescendants'] and any(w['scopeKey']==h['scopeKey'] and w['wholeNormalWitness']['goalId']==goal for w in r['actualNormalCompiledScopeWitnesses'])]
    witness= [w for w in scope['witnesses'] if w['goalId']==goal]
    assert raw_indices and witness
    enriched.append({'holdOrdinal':ordinal,'scopeKey':h['scopeKey'],'goalId':goal,'title':gm[goal]['title'],
        'originalVerdict':h['verdict'],'originalReason':h['reason'],'diagnosticCategory':cat,
        'directRequires':h['directRequires'],'effectiveRequires':h['effectiveRequires'],
        'inheritedRequires':h['inheritedRequires'],'missing':missing,
        'rawCurrentRouteIndices':raw_indices,'sourceWitnessCount':len(witness),
        'directSourceWitnessCount':sum(w['coverage']=='direct' for w in witness),
        'inheritedSourceWitnessCount':sum(w['coverage']=='inherited' for w in witness),
        'authoredExactStageView':matched['path'] if matched else None,
        'authoredExactStageGoalRole':role(matched,goal) if matched else 'no-compatible-view',
        'activeAuthoredExactStageView':active_matched['path'] if active_matched else None,
        'activeAuthoredExactStageGoalRole':role(active_matched,goal) if active_matched else 'no-compatible-view',
        'authoredMembershipIsRuntimeAcceptance':False,'newSourceReadinessApproval':False})

groups=[]
for (goal,missing_ids),n in Counter((h['goalId'],tuple(h['missingPrerequisitesFromTargetView'])) for h in holds).most_common():
    members=[h for h in enriched if h['goalId']==goal and tuple(x['goalId'] for x in h['missing'])==missing_ids]
    groups.append({'count':n,'goalId':goal,'title':gm[goal]['title'],
        'missingIds':list(missing_ids),'missingTitles':[gm[q]['title'] for q in missing_ids],
        'scopeKeys':[h['scopeKey'] for h in members],'holdOrdinals':[h['holdOrdinal'] for h in members]})

summary={'artifactRole':'informed author diagnostic; no independent D/P/A/M/V or source votes',
    'readOnlyInputChecks':{'all147HoldsReproducedExactly':True,'candidateCanonicalGoals':len(gm),
        'candidateCurricularAtoms':sum(k=='curricularAtomic' for k in kinds.values()),
        'actualSourceRawRowsBeforeDedup':len(raw),'all32InputMappingRowsExamined':all_mapping_count,
        'mappingInputs':len(raw_inventory['mappingInputs']),'normalCompositionViewsCompiled':len(role_audit['views']),
        'normalCompositionErrors':sum(len(v['errors']) for v in role_audit['views']),
        'explicitPrerequisiteOnlyViews':sum(v['prerequisiteOnlyCount']>0 for v in role_audit['views'])},
    'holds':len(holds),'heldGoalIds':len({h['goalId'] for h in holds}),'heldSourceScopes':len({h['scopeKey'] for h in holds}),
    'diagnosticCategories':dict(Counter(h['diagnosticCategory'] for h in enriched)),
    'missingOccurrences':sum(len(h['missing']) for h in enriched),
    'missingBySemanticKind':dict(Counter(q['semanticKind'] for h in enriched for q in h['missing'])),
    'holdsBySourceScope':dict(Counter(h['scopeKey'] for h in holds)),
    'holdsByGoal':dict(Counter(h['goalId'] for h in holds)),
    'atomicMissingAuthoredMembership':dict(Counter(q['authoredExactStageRole'] for h in enriched for q in h['missing'] if q['semanticKind']=='curricularAtomic')),
    'atomicMissingCurrentActiveAuthoredMembership':dict(Counter(q['activeAuthoredExactStageRole'] for h in enriched for q in h['missing'] if q['semanticKind']=='curricularAtomic')),
    'atomicMissingWithSameJurisdictionOtherSourceMembership':sum(bool(q['sameJurisdictionOtherSourceMembership']) for h in enriched for q in h['missing'] if q['semanticKind']=='curricularAtomic'),
    'scientificVotes':0,'sourceSpecificReadinessVotes':0,'grantsM7Closure':False,'activeFilesChanged':False}

write('147-holds.whole-definition-and-source-diagnostic.json',{'summary':summary,'groups':groups,'holds':enriched,
    'wholeCanonicalDefinitions':[gm[id] for id in sorted(relevant_ids)],
    'authoritativeKinds':[{'goalId':id,'semanticKind':kinds[id]} for id in sorted(relevant_ids)]})
write('1242-current-raw-source-routes.no-display-dedup.index.json',{'originalInventory':inputs[entry['rawAllSourceBindings']['path']],
    'rawBindingCount':len(raw),'displayDeduplicated':False,'rows':affected_route_index})
write('all32-mapping-inputs.relevant-whole-direct-source-routes.json',{'mappingInputCount':32,'allMappingRowsExamined':all_mapping_count,
    'relevantDirectRawRowCount':len(literal_route_rows),'displayDeduplicated':False,'rows':literal_route_rows})
with (OUT/'147-holds.scope-goal-and-remedy-routing.csv').open('w',newline='') as f:
    w=csv.writer(f);w.writerow(['ordinal','scope','goalId','title','category','missingId','missingTitle','kind','edge','authoredStageRole','activeAuthoredStageRole','sameJurisdictionOtherSourceScopes'])
    for h in enriched:
        for q in h['missing']:
            w.writerow([h['holdOrdinal'],h['scopeKey'],h['goalId'],h['title'],h['diagnosticCategory'],q['goalId'],q['title'],q['semanticKind'],q['edgeKind'],q['authoredExactStageRole'],q['activeAuthoredExactStageRole'],';'.join(x['scopeKey'] for x in q['sameJurisdictionOtherSourceMembership'])])

# Proposed HE successor is inspected separately and never substituted into frozen147.
he_delta=read(HE/'checks/exact-single-edge-removal-and-clause-partner-conservation.json')
before=read(he_delta['beforeMapping']['path']);after=read(he_delta['afterMapping']['path'])
i=he_delta['removedMappingOrdinal']
assert before['mappings'][:i]+before['mappings'][i+1:]==after['mappings']
assert before['mappings'][i]==he_delta['removedRow']
source_id=he_delta['removedRow']['legacyGoalId']
before_dec={x['sourceGoalId']:x for x in before['decisions']};after_dec={x['sourceGoalId']:x for x in after['decisions']}
assert set(before_dec)==set(after_dec)
assert all(before_dec[k]==after_dec[k] for k in before_dec if k!=source_id)
assert after_dec[source_id]['canonicalGoalIds']==[q for q in before_dec[source_id]['canonicalGoalIds'] if q!=he_delta['removedRow']['canonicalGoalId']]
write('proposed-HE-MM-context-single-edge.actual-readonly.json',{'before':he_delta['beforeMapping'],'after':he_delta['afterMapping'],
    'mappingRowsBefore':len(before['mappings']),'mappingRowsAfter':len(after['mappings']),
    'exactSingleRemovedRow':before['mappings'][i],'allOtherMappingAndDecisionRowsExact':True,
    'retainedClauseTargetIds':after_dec[source_id]['canonicalGoalIds'],
    'frozen147SubstitutedOrReclassified':False,'changesCanonicalRequires':False,
    'requiresFreshSourceAtlasAndBoundedIndependentSourceReview':True,'newScientificVotes':0})
end_seals=[check_seal(B/'FINAL.independent-b.freeze.json'),check_seal(STAGE/'FINAL.technical-preparation.freeze.json')]
assert start_seals==end_seals
for path,binding in inputs.items():
    raw=(ROOT/path).read_bytes()
    assert 'sha256:'+hashlib.sha256(raw).hexdigest()==binding['sha256'],path
write('read-only-input-bindings-and-seal-conservation.actual.json',{'start':start_seals,'end':end_seals,'allInputsUnchanged':True,
    'inputs':list(inputs.values()),'activeOrGitWrites':False,'newScientificVotes':0})
write('diagnostic-summary.actual.json',summary)
print(json.dumps(summary,ensure_ascii=False))
