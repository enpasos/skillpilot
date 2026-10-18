# SPDX-License-Identifier: Apache-2.0
"""Only the14 routed Chemistry goals/86 actual pairs and their finite source deltas."""
import hashlib,importlib.util,json
from pathlib import Path
R=Path.cwd().resolve();O=Path(__file__).resolve().parent.parent.relative_to(R)
read=lambda p:json.loads(Path(p).read_text())
def pin(p):
 p=Path(p);p=p.relative_to(R) if p.is_absolute() else p;b=p.read_bytes();return {'path':p.as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def digest(o):return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def verify(p):assert pin(p['path'])==p,p
C=read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');G={g['id']:g for g in C['goals']};cfgpath='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';s=next(x for x in read(cfgpath)['subjects'] if x['subject']=='chemie')
routing=read(O/'INPUT.routing-only.preserved.json');pending={(r['goalId'],r['jurisdiction']) for r in routing['pendingOwnedElsewhere']};actual={(r['goalId'],j) for r in routing['scope'] for j in r['jurisdictions']}-pending
assert len(actual)==86 and sum(len(r['jurisdictions']) for r in routing['scope'])==87
W=read(O/'INPUT.fourteen-whole-current-C-and-P.exact.json');assert len(W)==14
for w in W:
 assert G[w['goalId']]==w['wholeGoal'];p=w['activeConfig']['path'];assert p in s['positiveEvidenceConfigPaths'];c=read(p);assert w['goalId'] in c['scope']['goalIds'];assert c['reviewPath']==w['nativeReview']['path'];native=json.loads(Path(c['reviewPath']).read_text().splitlines()[w['nativeLine']-1]);assert native==w['wholeNativeRecord'];verify(w['activeConfig']);verify(w['nativeReview'])
E=read(O/'INPUT.one-existing-source-backed-endpoint-whole-C-P.exact.json');assert G[E['wholeGoal']['id']]==E['wholeGoal'];assert E['configPath'] in s['positiveEvidenceConfigPaths'];assert json.loads(Path(E['reviewPath']).read_text().splitlines()[E['line']-1])['profile']==E['wholeProfile']
rows=read(O/'MATRIX.eighty-six-current-goal-country-source-author.json');assert {(r['goalId'],r['jurisdiction']) for r in rows}==actual and len(rows)==86
assert sum(r['authorDisposition']=='PROPOSE_DIRECT_PARTIAL' for r in rows)==81
assert sum(r['authorDisposition']=='PROPOSE_LITERAL_REQUIRES_ACQUISITION' for r in rows)==2
holds=[r for r in rows if r['authorDisposition']=='HOLD'];assert len(holds)==3 and all(r['jurisdiction']=='DE-SL' for r in holds)
P=read(O/'INPUT.selected-whole-source-cells-and-primary-operators.json');assert len(P)==85;cells={x['wholeSourceGoal']['id']:x for x in P};assert len(cells)==85
for c in P:
 verify(c['primary']);assert c['wholeSourceCredit'] is False
 for a in c['currentOperativeAliases']:
  verify(a['extraction']);o=read(a['extraction']['path'])
  for k in a['wholeSourceObjectPointer'].split('/')[1:]:o=o[int(k)] if isinstance(o,list) else o[k]
  assert o==c['wholeSourceGoal'] and digest(o)==a['wholeSourceObjectSHA256']
 for p in c['currentFamilyExtractions']+c['currentMappingAliases']:verify(p)
 if c['origin']=='SHARED_SOURCE60_TRANSPORT_REFERENCE_ONLY':assert c['appendAgain'] is False and c['currentOperativeAliases']
sourceadds=list((O/'candidate/extraction-additions').glob('*.json'));assert len(sourceadds)==14;newids=[]
for f in sourceadds:
 d=read(f);verify(d['baseExtraction']);b=read(d['baseExtraction']['path']);old={g['id'] for g in b['sourceGoals']};ids=[g['id'] for g in d['sourceGoalsToAppend']];assert not old.intersection(ids);assert d['originalSourceGoalCount']==len(old);assert d['newCompleteSelectedClauseCount']==len(ids);assert d['proposedUnionSourceGoalCount']==len(old)+len(ids);assert d['existingSource60CellsAppendCount']==0
 assert d['pipelineStatus']['newWholeSourceApprovals']==0
 for g in d['sourceGoalsToAppend']:assert cells[g['id']]['wholeSourceGoal']==g and cells[g['id']]['origin']=='NEW_INACTIVE_COMPLETE_OPERATOR'
 newids+=ids
assert len(newids)==43 and len(set(newids))==43
M=read(O/'CANDIDATE.one-hundred-four-direct-partial-contributions.inactive.json')['mappings'];assert len(M)==104 and len({(m['legacyGoalId'],m['canonicalGoalId']) for m in M})==104
for m in M:
 assert m['matchType']=='partial' and m['legacyGoalId'] in cells;w=next(x for x in W if x['goalId']==m['canonicalGoalId']);assert digest(w['wholeGoal'])==m['currentGoalSha256'];assert digest(w['wholeNativeRecord']['profile'])==m['currentProfileBodySha256']
aliasfiles=list((O/'candidate/mapping-cell-appends').glob('*.json'));assert len(aliasfiles)==31;occ=0
for f in aliasfiles:
 d=read(f);verify(d['beforeWholeFilePinForAuditNotGlobalCAS']);live=read(d['mappingPath']);assert live['sourceExtractionPath']==d['sourceExtractionPathAtAuthoring'];assert d['wholeFileReplacement'] is False;occ+=len(d['cellAppends'])
 for q in d['cellAppends']:
  assert not any(m.get('legacyGoalId')==q['pairAbsentExpectedBefore']['legacyGoalId'] and m.get('canonicalGoalId')==q['pairAbsentExpectedBefore']['canonicalGoalId'] for m in live.get('mappings',[]))
  for before in q['existingAuthoritativeSourceDecisionsCAS']:
   ix=int(before['jsonPointer'].split('/')[-1]);assert live['decisions'][ix]==before['wholeDecision'] and digest(before['wholeDecision'])==before['sha256']
assert occ==143
A=read(O/'CANDIDATE.two-literal-requires-acquisition-entries.inactive.json')['entries'];assert len(A)==2;reg=read('curricula/DE/Gymnasium/provenance/canonical-goal-surrogate-evidence-registry.json')
for a in A:
 e=a['proposedStockEntry'];assert e['goalId'] in G[e['requiredByGoalId']]['requires'];assert e['requiredByGoalId']=='e7c3d20e-4b13-560b-b8ee-c5abca8cc624';assert e['jurisdiction'] in ['DE-BB','DE-BE'];assert not any(x['goalId']==e['goalId'] and x['jurisdiction']==e['jurisdiction'] for x in reg['entries'])
 for q in a['sourceAnchors']:
  verify(q['mappingFile']);d=read(q['mappingFile']['path']);ix=int(q['jsonPointer'].split('/')[-1]);assert d['mappings'][ix]==q['wholeCurrentMapping'] and digest(q['wholeCurrentMapping'])==q['rowSHA256']
V=read(O/'CHECK.pure-current-fourteen-goals-eighty-six-pairs.json');assert V['status']=='PASS' and V['counts']['checkedPairs']==86 and V['counts']['views']==36 and V['counts']['targetAppearances']==187;assert len(V['concreteExistingAcquisitionEndpointChecks'])==4
for pair in V['pairs']:
 for v in pair['checks']:verify(v['actualCurrentView'])
T=read(O/'CHECK.TH-two-distinct-225-contracts.no-rebase.json');verify(T['old225']);verify(T['operative233']);assert T['compared225Objects']==225 and T['sameWholeObjects']==214 and T['differentWholeObjects']==11 and not T['oldIsExactWholeSubsetOfNew']
assert not any('/input/TH/upper-secondary/' in read(f)['baseExtraction']['path'] for f in sourceadds)
for f in O.rglob('*.json'):read(f)
spec=importlib.util.spec_from_file_location('stock_validate_schemas',R/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);allErrors=mod.curriculum_symlink_errors(R);ownErrors=[e for e in allErrors if str(O) in e];assert not ownErrors,ownErrors
print(json.dumps({'status':'PASS','scope':'14 whole current C/P,86 pairs,85 whole source cells,104 direct partial contributions and2 literal acquisition relations only','wholeCurrentCAndPNativelyExact':14,'wholeAdditionalEndpointExact':1,'pureCurrentPairsViewsTargets':[86,36,187],'literalEndpointTargetViewChecks':4,'threeExplicitSLHolds':[{k:h[k] for k in ['goalId','jurisdiction','holdReason']} for h in holds],'sourceAppends':{'files':14,'uniqueNewWholeOperatorCells':43,'occurrences':43,'sharedSource60CellsDuplicated':0},'mappingCellAppends':{'normalAliasFiles':31,'individualAppendOccurrences':143},'THContracts':'all225 compared,214 identical/11 different; no rebase or old225 append','allWrittenJSONParsed':True,'stockSymlinkHelper':'scripts/validate_schemas.py::curriculum_symlink_errors','stockSymlinkHelperActuallyCalled':True,'globalSymlinkErrorCount':len(allErrors),'ownSymlinkErrors':ownErrors,'normalWrites':0,'newIndependentScientificVotes':0,'newDPAMVVotes':0,'APCompilerBuildRuns':0},ensure_ascii=False,indent=2))
