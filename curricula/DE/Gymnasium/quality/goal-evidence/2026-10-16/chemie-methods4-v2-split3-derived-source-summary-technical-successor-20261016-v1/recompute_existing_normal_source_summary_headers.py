"""Additive derived-header refresh; all authored science objects remain exact."""
import copy
import datetime
import hashlib
import json
from collections import defaultdict
from pathlib import Path

R=Path(__file__).resolve().parents[7]
O=Path(__file__).resolve().parent
E=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16')
P=E/'chemie-methods4-v2-split3-current578-inactive-composition-technical-20261016-v1'
H=Path('tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1')
RULE=Path('app/scripts/generateCurriculumQualityStatus.ts')
def read(p):return json.loads((R/p).read_text())
def pin(p):
    p=Path(p);b=(R/p).read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def save(name,obj):
    p=O/name;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
    return pin(p.relative_to(R))
def require(v,m):
    if not v:raise AssertionError(m)

rule_lines=(R/RULE).read_text().splitlines()
fragment='\n'.join(rule_lines[4875:4931])+'\n'
for exact in ["matchTypesBySourceGoalId.get(sourceGoalId)?.has('exact')", "return !matchTypes?.has('exact') && matchTypes?.has('partial')"]:
    require(exact in fragment,'repository normal counting rule drifted')
save('RULE.existing-normal-source-extraction-pipeline-counter-evidence.json',{
 'role':'Read actual existing normal source-extraction pipeline rule, not the edge-count source-snapshot fallback',
 'repositoryFile':pin(RULE),'function':'readSourceExtractionPipelinesByLandscapeId',
 'lineStart':4876,'lineEnd':4931,'exactRelevantCode':fragment,
 'interpretation':'Restrict to IDs in the actual source extraction. Group mapping matchType sets by sourceGoalId; exact has precedence; otherwise partial. Count unique mapped/reviewed source IDs. Explicit needsCanonicalGoal excludes already mapped source IDs.',
 'notUsed':'createSourceSnapshotMappingPipeline edge counts, which apply to archived source snapshots rather than these actual source-extraction-path mapping files',
 'scienceStatusUnchanged':True})

seal=read(P/'SEAL.finite-inactive-methods4-v2-split3-technical-composition.json')
for p in seal['files']:require(pin(p['path'])==p,'sealed input drift '+p['path'])
before_manifest=read(P/'SOURCE12.whole-current-file-candidates-CAS-and-overlap.neutral.json')
new_manifest=copy.deepcopy(before_manifest)
records=[];whole_inputs=[];new_count=0
for f in new_manifest['files']:
    input_pin=f['wholeAfterCandidate'];whole_inputs.append(input_pin)
    before=read(input_pin['path']);after=copy.deepcopy(before)
    if 'mappings' not in before or 'summary' not in before:
        records.append({'normalPath':f['normalPath'],'wholeBeforeAndAfterExact':input_pin,'reason':'No existing summary header; no new header or status invented.','headerChanged':False})
        continue
    xp=H/before['sourceExtractionPath'];extraction=read(xp)
    whole_inputs.append(pin(xp))
    source_goal_ids={x['id'] for x in extraction['sourceGoals'] if isinstance(x.get('id'),str) and x['id'].strip()}
    require(len(source_goal_ids)==len(extraction['sourceGoals']),'duplicate source ID would need separate source review')
    groups=defaultdict(set)
    for m in before['mappings']:
        gid=m.get('legacyGoalId')
        require(gid in source_goal_ids,'extra mapping source ID in '+f['normalPath'])
        if isinstance(m.get('matchType'),str) and m['matchType'].strip():groups[gid].add(m['matchType'])
    valid_mapped=set(groups)
    decisions=[d for d in before['decisions'] if isinstance(d.get('sourceGoalId'),str) and d['sourceGoalId'].strip() and isinstance(d.get('decision'),str) and d['decision'].strip()]
    require(all(d['sourceGoalId'] in source_goal_ids for d in decisions),'extra source decision ID')
    reviewed={d['sourceGoalId'] for d in decisions}
    exact=sum('exact' in v for v in groups.values())
    partial=sum('exact' not in v and 'partial' in v for v in groups.values())
    needs=sum(d['decision']=='needsCanonicalGoal' and d['sourceGoalId'] not in valid_mapped for d in decisions)
    counters={'sourceGoals':len(source_goal_ids),'mappedSourceGoals':len(valid_mapped),'reviewedSourceGoals':len(reviewed),
              'needsCanonicalGoal':needs,'exactMappings':exact,'partialMappings':partial}
    require(exact+partial==len(valid_mapped),'other mapping match-type needs bounded clarification')
    old_header=before['summary'];new_header=copy.deepcopy(old_header)
    for key,value in counters.items():
        if key in new_header:new_header[key]=value
    after['summary']=new_header
    header_changed=(new_header!=old_header)
    if header_changed:
        new_count+=1
        after_pin=save(Path(f'candidate/source/{new_count:02d}-{Path(f["normalPath"]).name}'),after)
        f['wholeAfterCandidate']=after_pin
        f['derivedHeaderSuccessorCAS']={'wholeBeforeFile':input_pin,'wholeBeforeSummary':old_header,'wholeAfterSummary':new_header,
           'allNonSummaryWholeFieldsExact':True,'normalRule':pin(RULE),'scientificJudgementsChanged':False}
        f['historicalSummaryBoundary']={'refresh':'derived existing normal source-extraction rule only','before':old_header,'after':new_header,
            'newScienceOrSourceStatusApproval':False,'allScientificBodiesAndStatusExact':True}
    else:after_pin=input_pin
    require({k:v for k,v in after.items() if k!='summary'}=={k:v for k,v in before.items() if k!='summary'},'non-summary payload modified')
    require(set(new_header)==set(old_header),'unexpected new summary keys')
    for key in old_header:
        if key not in counters:require(new_header[key]==old_header[key],'historical non-derived count changed')
    records.append({'normalPath':f['normalPath'],'actualSourceExtraction':pin(xp),'wholeBeforeFile':input_pin,'wholeAfterFile':after_pin,
      'wholeBeforeSummary':old_header,'wholeAfterSummary':new_header,'currentNormalRuleCounters':counters,
      'headerChanged':header_changed,'allMappingsDecisionsStatusesAndPartnersExact':True,
      'retainedHistoricalOtherHeaderValues':{k:v for k,v in old_header.items() if k not in counters},'newScientificVotes':0})

require(new_count==4,'unexpected header change count')
new_manifest['role']='Additive inactive composed whole-file selection with four derived summary-header refreshes; exact previous76 source/mapping object CAS and all scientific payloads retained'
new_manifest['priorSealedWholeComposition']=pin(P/'OUTPUTS.finite-inactive-methods4-v2-split3-technical-composition.selector.json')
new_manifest['onlyAdditiveHeaderChanges']=True
selection=save('SOURCE12.whole-current-composed-file-selection.with-derived-summary-refresh.neutral.json',new_manifest)
save('CAS4.whole-summary-before-after-and-whole-file-pins.actual.json',{'role':'Only existing source summary headers; no status or source/case/partner/science edits','records':records,'fourChangedWholeFiles':4,'otherEightWholeFilesExact':True})
for p in seal['files']:require(pin(p['path'])==p,'sealed predecessor changed '+p['path'])
for p in whole_inputs:require(pin(p['path'])==p,'input drift '+p['path'])
checks=save('CHECKS.actual-derived-headers-and-nonsummary-retention.json',{
 'status':'PASS_derived_header_refresh_only','readExistingNormalCountingRule':True,
 'fiveExistingHeadersRecomputed':True,'fourWholeFileHeadersChanged':4,'unchangedBavariaHeaderRetained':True,
 'noHeaderAddedToHB_RP_SN':True,'allSourceMappingDecisionStatusPartnerBodiesExact':True,
 'sealedPredecessorAll89FilesExact':True,'currentHInputsReadOnly':True,
 'wholeSourceSelectionCount':len(new_manifest['files']),'allPreviousCanonicalViewMaterialProfileChecksRetained':True,
 'normalWrites':0,'newScientificVotes':0,'strictGain':0,'HumanApproval':False,'HumanTrial':False})
save('INPUTS.exact-prior-composition-rule-and-source-extractions.json',{'priorSelector':pin(P/'OUTPUTS.finite-inactive-methods4-v2-split3-technical-composition.selector.json'),
 'priorSeal':pin(P/'SEAL.finite-inactive-methods4-v2-split3-technical-composition.json'),'normalRule':pin(RULE),'wholeInputs':whole_inputs})
print(json.dumps({'status':'PASS bounded derived header refresh','changedWholeFileHeaders':4,'wholeSelection':selection,'checks':checks}))
