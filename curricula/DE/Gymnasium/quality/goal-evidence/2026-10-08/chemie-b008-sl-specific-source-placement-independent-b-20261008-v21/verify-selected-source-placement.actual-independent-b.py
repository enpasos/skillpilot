import copy
import hashlib
import json
from pathlib import Path
from datetime import datetime, timezone

AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-sl-specific-source-continuation-author-root-20261008-v21')
OWN = Path(__file__).parent
def read(p): return json.loads(Path(p).read_text())
def vh(v): return hashlib.sha256(json.dumps(v, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
def bind(p):
    p=Path(p); b=p.read_bytes()
    return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,v): Path(p).write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
failures=[]; checks=[]; inputs={}
def check(name,ok,detail=None):
    row={'check':name,'pass':bool(ok)}
    if detail is not None: row['detail']=detail
    checks.append(row)
    if not ok: failures.append(row)
def receipt(r):
    actual=bind(r['path']);inputs[actual['path']]=actual
    check('receipt:'+r['path'], all(actual[k]==r[k] for k in ['sha256','bytes']),actual)
    return read(r['path']) if str(r['path']).endswith('.json') else None

seal=read(AUTHOR/'author.final.freeze.json')
inputs[str(AUTHOR/'author.final.freeze.json')]=bind(AUTHOR/'author.final.freeze.json')
for r in seal['payloads']: receipt(r)
check('author payload count',len(seal['payloads'])==43)
s=read(AUTHOR/'exact-sl-primary-course-components-and-three-view-proposals.author.json')
r=read(AUTHOR/'actual-unchanged52-material26-profile-reuse-and-original65-duties.json')
n=read(AUTHOR/'actual-native43-source-view-findings-three-SL-models-and-current177-contexts.json')
national=receipt(s['immutableAll1646OriginalDuties'])
check('whole national duties1646',len(national['originalWholeDuties'])==1646)
sl=[x for x in national['originalWholeDuties'] if '/DE-SL/' in x['mappingPath']]
check('SL original65 index and complete hashes preserved',len(sl)==65 and all(all(x[k]==sl[i][k] for k in x) for i,x in enumerate(s['immutableOriginal65SLDuties'])))
sources={}; mappings={}; source_goals={}; passages={}; original_selected_decisions=[]; decision_deltas=[]
for row in s['sourceInputs']:
    sources[row['stage']]=receipt(row['exactCurrentExtraction'])
    for g in sources[row['stage']]['sourceGoals']: source_goals[g['id']]=g
    for pg in sources[row['stage']]['passages']: passages[pg['id']]=pg
for row in s['guardedSourceMappingProposals']:
    old=receipt(row['exactCurrentMapping']);new=receipt(row['candidateMapping']);mappings[row['exactCurrentMapping']['path']]=old
    check(row['stage']+' old mapping prefix exact',new['mappings'][:len(old['mappings'])]==old['mappings'])
    deltas=[(b,a) for b,a in zip(old['decisions'],new['decisions']) if b!=a]
    check(row['stage']+' pending selected decision history retained exactly',len(old['decisions'])==len(new['decisions']) and {b['sourceGoalId'] for b,a in deltas}==set(row['pendingActualSourceIds']) and all(a.get('historicalDecisionBeforeCandidate')==b and a['canonicalGoalIds'][:len(b['canonicalGoalIds'])]==b['canonicalGoalIds'] and a['decision']=='needs_view_placement_review' and not a.get('reviewer') and not a.get('reviewedAt') for b,a in deltas),{'changedPending':len(deltas),'otherDecisionsExact':len(old['decisions'])-len(deltas)})
    decision_deltas.extend({'stage':row['stage'],'wholeOriginalDecision':b,'wholePendingCandidateDecision':a} for b,a in deltas)
    original_selected_decisions.extend(d for d in old['decisions'] if d['sourceGoalId'] in {x['sourceGoalId'] for x in sl})
    check(row['stage']+' added rows exactly listed partial components',new['mappings'][len(old['mappings']):]==row['exactAddedPartialMappings'] and all(x['matchType']=='partial' for x in row['exactAddedPartialMappings']),{'before':len(old['mappings']),'after':len(new['mappings']),'added':len(row['exactAddedPartialMappings'])})
whole_duties=[]
for row in sl:
    sg=source_goals[row['sourceGoalId']];pg=passages[sg['passageId']]
    mr=[m for m in mappings[row['mappingPath']]['mappings'] if m['legacyGoalId']==row['sourceGoalId'] and m['canonicalGoalId']==row['familyGoalId']]
    check('original whole SL duty:'+row['sourceGoalId'],len(mr)==1 and vh(mr[0])==row['wholeOriginalMappingValueSha256'] and vh(sg)==row['wholeOriginalSourceGoalValueSha256'] and vh(pg)==row['wholeOriginalPassageValueSha256'])
    whole_duties.append({'originalDuty':row,'wholeSourceGoal':sg,'wholePassage':pg,'wholeOriginalMapping':mr})
components=s['specificPartialChildComponents']
check('38roles26currentIDs',len(components)==38 and len({x['currentExistingSourceGoalId'] for x in components})==26)
for i,x in enumerate(components):
    check('component whole source/passage exact:'+str(i+1),x['wholeUnchangedCurrentSourceGoal']==source_goals[x['currentExistingSourceGoalId']] and x['wholeCurrentPassage']==passages[x['wholeUnchangedCurrentSourceGoal']['passageId']] and x['matchType']=='partial' and not x['wholeOriginalSourceClosure'])
cases=receipt(r['actual52WholeMaterialBodiesUnchanged'][0]);profiles=receipt(r['actual26WholeOldProfileBodiesUnchanged'][0]);binder=receipt(r['exactOriginalV11Binder'])
case_map={x['caseKey']:x for x in cases['cases']};profile_map={x['candidateKey']:x for x in profiles['profiles']}
check('52case26profile26binder counts',len(case_map)==52 and len(profile_map)==26 and len(binder['profileBinders'])==26)
for row in binder['profileBinders']:
    check('whole profile genuine v11 binding:'+row['candidateKey'],vh(profile_map[row['candidateKey']])==row['wholeProfileValueSha256'])
    for cr in row['correctedCurrentMaterials']: check('whole DEEN case genuine v11 binding:'+cr['caseKey'],vh(case_map[cr['caseKey']])==cr['wholeCaseValueSha256'])
check('case/profile status retained',all(x['status']=='ai_candidate' and x['reviewStatus']=='needs_human_review' and x['evidenceLevel']=='E1' and x['generationLevel']=='G1' for x in list(case_map.values())+list(profile_map.values())))
current=read(AUTHOR/'inputs/active-current480.json.bin');candidate=read(AUTHOR/'candidate/canonical.current504-sl-source-metadata.author-candidate.json')
cur_goals={x['id']:x for x in current['goals']};cand_goals={x['id']:x for x in candidate['goals']}
check('480baseline504candidate',len(cur_goals)==480 and len(cand_goals)==504)
for x in s['explicitSourceMetadataProposals']:
    check('applicability bounded add SL:'+x['goalId'],cand_goals[x['goalId']]['applicability']==x['after'] and x['after']['jurisdiction']==x['before']['jurisdiction']+['DE-SL'])
full=read(AUTHOR/'native/full395.pure-model.json');baseline=read(AUTHOR/'native/fresh-current378.baseline.pure-model.json')
before_pages={x['goalId']:x for x in baseline['pages']};after_pages={x['goalId']:x for x in full['pages']}
def strip(v):
    if isinstance(v,list):return [strip(x) for x in v]
    if isinstance(v,dict):return {k:strip(x) for k,x in v.items() if k not in ['pageNumber','navigationOrder','treeOrder','pageFingerprint']}
    return v
actual_context=[]
for row in n['all177ProtectedActualPageContextComparisons']:
    gid=row['goalId'];b=before_pages[gid];a=after_pages[gid]
    fields=[k for k in dict.fromkeys(list(b)+list(a)) if k not in ['pageNumber','navigationOrder','treeOrder','pageFingerprint'] and strip(b.get(k))!=strip(a.get(k))]
    check('protected whole text image:'+gid, b['goalFingerprint']==a['goalFingerprint'] and all(b.get(k)==a.get(k) for k in ['title','description','visualization']))
    check('protected context actual recorded:'+gid, bool(fields)==(not row['currentPageExcludingPaginationExact']) and fields==[x['field'] for x in row['actualChangedPageFields']])
    if fields:actual_context.append({'goalId':gid,'fields':fields,'status':'HOLD'})
check('177 protected8contextHOLD',len(n['all177ProtectedActualPageContextComparisons'])==177 and len(actual_context)==8)
check('actual378395purepages',len(baseline['pages'])==378 and len(full['pages'])==395 and full['book']['pageCount']==395)
view_results=[]
for v in s['threeSpecificCandidateViews']:
    old=receipt(v['beforeExactView']);new=receipt(v['candidateView']);expected=copy.deepcopy(old)
    replacements={x['wholeOriginalParentNode']['goalId']:x['explicitSourceSpecificChildren'] for x in v['explicitParentReplacements']}
    def transform(nodes):
        result=[]
        for node in nodes:
            if node.get('goalId') in replacements:result.extend(copy.deepcopy(replacements[node['goalId']]))
            else:
                node=copy.deepcopy(node)
                if 'children' in node:node['children']=transform(node['children'])
                result.append(node)
        return result
    expected['rootNodes']=transform(expected['rootNodes'])
    if len(new['rootNodes'])>1:expected['rootNodes'].append(new['rootNodes'][1])
    check('whole view exact explicit replacements:'+v['viewId'],new==expected)
    added=[g for x in v['explicitParentReplacements'] for g in x['explicitSourceSpecificChildren']]
    check('new whole targets default target:'+v['viewId'],all(g.get('projectionRole','target')=='target' for g in added))
    model=read(AUTHOR/('native/'+v['viewId']+'.pure-model.json'));page_ids={x['goalId'] for x in model['pages']}
    check('all new targets actual compiled:'+v['viewId'],all(g['goalId'] in page_ids for g in added))
    pre=[] if len(new['rootNodes'])==1 else new['rootNodes'][1]['children']
    check('explicit prereq-only excluded from target pages:'+v['viewId'],all(g['projectionRole']=='prerequisiteOnly' and g['goalId'] not in page_ids for g in pre))
    view_results.append({'viewId':v['viewId'],'wholeCandidateView':new,'actualTargetPageCount':len(model['pages']),'newTargetCount':len(added),'newPrerequisiteOnlyCount':len(pre)})
check('3view98/157/1689/5/5targets0/1/1prerequisites',[(x['actualTargetPageCount'],x['newTargetCount'],x['newPrerequisiteOnlyCount']) for x in view_results]==[(98,9,0),(157,5,1),(168,5,1)])
views=n['actual43SourceViews'];changed=[x for x in views if x['changedInThisPacket']]
check('actual43CPV43to35only3SLchanges',len(views)==43 and sum(x['actualBeforeCPV009'] for x in views)==43 and sum(x['actualAfterCPV009'] for x in views)==35 and len(changed)==3 and all(x['scope']['jurisdiction']=='DE-SL' and x['actualAfterCPV009']==0 for x in changed))
check('actual after35allCPV009 no new error',sum(len(x['actualAfterFindings']) for x in views)==35 and all(f['code']=='CPV-009' for x in views for f in x['actualAfterFindings']))
partner_ids={g for d in original_selected_decisions for g in d['canonicalGoalIds']}|{x['familyGoalId'] for x in sl}
snapshot={'role':'Independent B whole source/operator/partner evidence, not new science approval','wholeOriginal65SLDuties':whole_duties,'wholeCurrent38RoleSources':components,'whole11CurrentSelectedGoals':[cand_goals[x['goalId']] for x in s['explicitSourceMetadataProposals']],'wholeOriginalPartnerDecisions':original_selected_decisions,'whole26PendingDecisionDeltas':decision_deltas,'wholeOriginalFamilyPartnerGoals':[cur_goals[g] for g in sorted(partner_ids)],'wholeThreeViews':view_results,'retainedScientificBodiesAreExternalExactBoundFiles':True}
write(OWN/'whole-source-partner-goals-three-views.actual-independent-b.inputs.json',snapshot)
write(OWN/'selected-source-placement.actual-independent-b.mechanical-results.json',{'createdAtUtc':datetime.now(timezone.utc).isoformat(),'checks':checks,'failureCount':len(failures),'failures':failures,'actualEightContextHolds':actual_context,'authorPayloads':43,'components':38,'currentSourceIDs':26,'wholeOriginalSLDuties':65,'wholeOriginalNationalDuties':1646,'wholeDEENCases':52,'wholeProfiles':26,'wholeOriginalFamilyPartnerGoalCount':len(snapshot['wholeOriginalFamilyPartnerGoals']),'actualViews':43,'CPV009Before':43,'CPV009After':35,'current177TextImageExact':True,'strictGain':0,'activeWrites':0,'humanApproval':False})
write(OWN/'selected-external-original-inputs.actual-independent-b.freeze.json',{'createdAtUtc':datetime.now(timezone.utc).isoformat(),'inputs':list(inputs.values()),'peerCurrentSLSourcePlacementAReadBeforeFirstSeal':False})
print(json.dumps({'checks':len(checks),'failures':failures,'externalAndAuthorInputCount':len(inputs),'wholeFamilyPartners':len(snapshot['wholeOriginalFamilyPartnerGoals']),'views':[(x['actualTargetPageCount'],x['newTargetCount'],x['newPrerequisiteOnlyCount']) for x in view_results]},ensure_ascii=False))
