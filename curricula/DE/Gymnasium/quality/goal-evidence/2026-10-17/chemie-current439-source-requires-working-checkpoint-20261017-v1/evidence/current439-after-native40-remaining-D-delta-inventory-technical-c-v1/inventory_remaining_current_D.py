from pathlib import Path
from hashlib import sha256
from collections import Counter,defaultdict
from datetime import datetime,timezone
import json,re
O=Path(__file__).resolve().parent;E=O.parent;G=E/'current439-AV-and-native-registry-integration-root-v1/capsule';F=E/'current650-all-seven-current439-native-central-preparation-technical-a-v1/capsule'
B=E/'current650-selected-description-binding-field-diagnostic-technical-b-v1/FOLLOWUP.current-model-and-index-scoped-withdrawals-v1';A=F.parent
read=lambda p:json.loads(p.read_text())
def pin(p):
 b=p.read_bytes();return {'path':str(p),'sha256':sha256(b).hexdigest(),'bytes':len(b)}
def write(n,obj):
 p=O/n;assert not p.exists();text=json.dumps(obj,ensure_ascii=False,indent=2)+'\n';json.loads(text);p.write_text(text)
selectorPath=B/'SELECTOR.additive-current-model-page-diff-and-withdrawal-successors.sealed.json';assert pin(selectorPath)['sha256']=='692d117a4378f80b41515369551e14f941f3439f08c97a52467ddd2329219861'
selector=read(selectorPath);dpath=Path(selector['wholeCurrent403AndUnresolved36Diagnostic']['path']);d=read(dpath);assert pin(dpath)['sha256']==selector['wholeCurrent403AndUnresolved36Diagnostic']['sha256']
pagesPath=B/'ANALYSIS.actual-page-link-partitions-and-canonical-prerequisite-ID-differences.json';link={r['goalId']:r for r in read(pagesPath)['rows']}
s20=read(E/'current439-jurisdiction-only-native20-preparation-technical-c-v1/SELECTION.actual-open-pure-jurisdiction-first20-and-ownership-plan.json');s14=read(E/'current439-jurisdiction-only-native14-preparation-technical-c-v1/SELECTION.remaining14-actual-current-root17-185-and-owner-plan.json')
exclude40=set(s20['selectedGoalIds']+s14['selectedGoalIds']+s20['excludedNative6']);exclude36={r['goalId'] for r in d['unresolvedOwnerRows']};assert len(exclude40)==40 and len(exclude36)==36 and len(exclude40&exclude36)==4
av=read(G.parent/'RECEIPT.current439-actual-A1-V1-integrated-original-D-preserved.json');centralPath=G/av['centralConfigRelativePath'];central=read(centralPath);config=next(s for s in central['subjects'] if s['subject']=='chemie')
orig=read(F/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current650-all-seven-current439-native-central-preparation-technical-a-v1/central.current439.all-seven-HB7f.prepared.private.config.json')['subjects'][0]
for key in ['resolutionIndexPaths','resolutionSupersessions','resolutionWithdrawals','resolutionSemanticRetirements']:assert config[key]==orig[key]
landPath=G/config['landscapePath'];semPath=G/config['semanticKindLedgerPath'];pPath=G/Path(s20['P439Pin']['path']).relative_to(F);land=read(landPath);sem=read(semPath);goals={g['id']:g for g in land['goals']};kinds={x['goalId']:x['semanticKind'] for x in sem['decisions']};P={r['goalId']:r for r in [json.loads(line) for line in pPath.read_text().splitlines() if line.strip()]}
assert pin(landPath)['sha256']==s20['canonicalPin']['sha256'];assert pin(pPath)['sha256']==s20['P439Pin']['sha256'];assert pin(semPath)['sha256']==s20['SEMPin']['sha256']
modelPath=Path(s20['currentModel']['path']);model=read(modelPath);pos={p['goalId']:i for i,p in enumerate(model['pages'])};assert len(pos)==439
reportPath=A/'central-diagnostic-additive-v1/central.stock.stdout.json';report=read(reportPath);issues=report['subjects'][0]['issues'];assert report['blockingIssueCount']==283
indices={p:read(G/p) for p in config['resolutionIndexPaths']};indexPins=[pin(G/p) for p in config['resolutionIndexPaths']];artifactPaths=defaultdict(list)
for p,idx in indices.items():artifactPaths[idx['artifactSetId']].append(p)
assert all(len(v)==1 for v in artifactPaths.values())
indexIssues={p:[i for i in issues if i.startswith('chemie:'+idx['artifactSetId']+': ')] for p,idx in indices.items()}
ref=lambda gid:{'goalId':gid,'title':goals.get(gid,{}).get('title'),'semanticKind':kinds.get(gid),'currentCanonicalExists':gid in goals}
flags=Counter();masks=defaultdict(list);mechanical=defaultdict(list);rows=[];novel=set();intrinsic=set();contextIssueIds=[];qa=read(G/'curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json');qaBy={x['goalId']:x for x in qa['records']};assetPins=[]
for r in sorted(d['selectedRows'],key=lambda r:pos[r['goalId']]):
 gid=r['goalId']
 if gid in exclude40 or gid in exclude36:continue
 p=link[gid];fields=[x['field'] for x in r['canonicalContextDifferences']];mask=[]
 if r['finalTextDifferences']:mask.append('text')
 if 'requires' in fields:mask.append('requires')
 if 'applicability.jurisdiction' in fields:mask.append('jurisdiction')
 if set(fields)-{'requires','applicability.jurisdiction'}:mask.append('other-context')
 if r['oldPProfilePresent'] and r['PProfileDifferences']:mask.append('existing-P')
 if r['assetChanged']:mask.append('asset')
 flags.update(mask);masks['+'.join(mask) or 'no-atomic-input-delta'].append(gid)
 if mask:intrinsic.add(gid)
 if not r['oldPProfilePresent']:flags['historical-P-null-current-embedding']+=1
 assert P[gid]['profileFingerprint']==r['currentPins']['PProfileStockFingerprint']
 idx=indices[r['ownerIndexPath']];assert pin(G/r['ownerIndexPath'])['sha256']==r['oldPins']['index']['sha256'].removeprefix('sha256:')
 needle='chemie:'+idx['artifactSetId']+': '+gid+': Current V3 context for '+gid+' disagrees with the canonical goal';ownContextIssue=needle in issues
 if ownContextIssue:contextIssueIds.append(gid)
 before=set(p['oldFullDirectReverseIdsFromPage']);now=set(p['currentFullDirectReverseIdsFromPage']);added=now-before;removed=before-now;delta=added|removed
 terminal=bool(delta) and all(kinds.get(x)=='practiceAssessment' for x in delta)
 category=None
 if not mask:
  assert p['directPriorIdUnionEqual']
  category='same-prior-and-reverse-ID-unions' if not delta else ('only-practiceAssessment-reverse-ID-delta' if terminal else 'other-derived-reverse-ID-delta')
  mechanical[category].append(gid)
 asset=None
 if r['assetChanged']:
  q=qaBy[gid];actual=[pin(G/q[k]) for k in ['publicAssetPath','canonicalAssetPath']];assert actual[0]['sha256']==actual[1]['sha256']==q['assetSha256'].removeprefix('sha256:');assetPins.extend(actual)
  asset={'exactOldToCurrentVisualizationFields':[x for x in r['pageFieldDifferences'] if x['field'].startswith('visualization.')],'currentActualAssetPins':actual,'currentQAExistingRecord':{k:q.get(k) for k in ['goalId','assetSha256','aiApproved','aiApprovedAssetSha256','aiReviewer','aiReviewedAt']},'newImageReviewOrGenerationPerformed':False}
 row={'goalId':gid,'titleDe':r['titleDe'],'full439Position':pos[gid],'selectedUniqueOwnerIndexPath':r['ownerIndexPath'],'disjointConcreteInputDeltaMask':mask,'newConcreteCurrentDInputDelta':bool(mask),'actualSelectedOwnerCanonicalContextIssue':ownContextIssue,'exactSelectedOwnerContextIssue':needle if ownContextIssue else None,
  'exactBilingualFinalTextDifferences':r['finalTextDifferences'],'exactCanonicalContextDifferences':r['canonicalContextDifferences'],'existingWholePProfileWasEmbedded':r['oldPProfilePresent'],'exactExistingWholePProfileDifferences':r['PProfileDifferences'] if r['oldPProfilePresent'] else [],'oldPNullIsFirstEmbeddingNotNewPScience':not r['oldPProfilePresent'],'currentExistingPRecordPinFields':{k:P[gid].get(k) for k in ['reviewId','goalFingerprint','reviewInputFingerprint','profileFingerprint','status','reviewAuthority','evidenceLevel','maximumClaimScope']},'assetDelta':asset,
  'exactPageFieldDifferences':r['pageFieldDifferences'],'derivedLinks':{**p,'addedReverseEndpointCurrentReferences':[ref(g) for g in sorted(added)],'removedReverseEndpointCurrentReferences':[ref(g) for g in sorted(removed)],'allReverseChangesAreCurrentPracticeAssessment':terminal},'mechanicalOnlyDisjointCategory':category,'currentActiveWithdrawalsForGoal':[w for w in config['resolutionWithdrawals'] if w['goalId']==gid],
  'readinessBoundary':'Concrete fields are routing evidence. No new stock per-goal readiness measurement or scientific verdict; absence of intrinsic change does not waive existing holds/withdrawals or whole-index chain constraints.'}
 rows.append(row)
assert len(rows)==367 and len(intrinsic)==51 and sum(map(len,mechanical.values()))==316 and len(contextIssueIds)==38
# Declared linear chain topology only; readiness/returned result sets are not fabricated.
byGoal=defaultdict(list)
for e in config['resolutionSupersessions']:byGoal[e['goalId']].append(e)
chains=[]
for gid,edges in byGoal.items():
 nxt={e['supersededIndexPath']:e['replacementIndexPath'] for e in edges};prev={e['replacementIndexPath']:e['supersededIndexPath'] for e in edges};nodes=set(nxt)|set(prev);starts=nodes-set(prev);ordered=[];node=next(iter(starts)) if len(starts)==1 else None
 while node is not None and node not in ordered:ordered.append(node);node=nxt.get(node)
 assert len(ordered)==len(nodes) and node is None and len(nxt)==len(edges) and len(prev)==len(edges)
 bad=[p for p in ordered if indexIssues[p]]
 chains.append({'goalId':gid,'indexPaths':ordered,'recordedIssueIndices':bad,'recordedWholeIndexIssuesNecessarilyPreventAnIntactChain':bool(bad),'actualGlobalChainIssueRecorded':any(i=='chemie: description-resolution supersession lacks an intact old claim and current replacement for '+gid for i in issues),'excludedPrepared40':gid in exclude40,'excludedNewer36':gid in exclude36,'remainingConcrete51':gid in intrinsic})
failed={c['goalId'] for c in chains if c['recordedWholeIndexIssuesNecessarilyPreventAnIntactChain']}
for r in rows:r['declaredChainHasRecordedWholeIndexIssue']=r['goalId'] in failed;r['selectedOwnerIndexRecordedIssueCount']=len(indexIssues[r['selectedUniqueOwnerIndexPath']])
partition=lambda gid:'prepared40' if gid in exclude40 else ('already-newer36' if gid in exclude36 else ('remaining-concrete51' if gid in intrinsic else ('remaining-mechanical316' if gid in {r['goalId'] for r in rows} else 'outside-remaining-scope')))
coupled=[]
for p,idx in indices.items():
 if not indexIssues[p]:continue
 issueGoals=sorted({m.group(1) for i in indexIssues[p] if (m:=re.search(r': ([0-9a-f-]{36}):',i))})
 coupled.append({'indexPath':p,'artifactSetId':idx['artifactSetId'],'wholeIndexRecordedIssues':indexIssues[p],'issueGoalRoutingPartitions':[{'goalId':g,'partition':partition(g)} for g in issueGoals],'declaredChainGoalsUsingThisIndex':[c['goalId'] for c in chains if p in c['indexPaths']],'remainingMechanicalGoalsInAffectedChains':[c['goalId'] for c in chains if p in c['indexPaths'] and c['goalId'] in {r['goalId'] for r in rows if not r['newConcreteCurrentDInputDelta']}]})
proposals=[]
for label,group in [('requires-only',masks['requires']),('existing-P-only',masks['existing-P']),('mixed-specific-fields',[r['goalId'] for r in rows if len(r['disjointConcreteInputDeltaMask'])>1])]:
 ordered=sorted(group,key=pos.get)
 for offset in range(0,len(ordered),20):proposals.append({'routingClass':label,'part':offset//20+1,'goalIds':ordered[offset:offset+20],'count':len(ordered[offset:offset+20]),'actualFull439TopologicalOrder':True,'notPreparedOrReviewed':True})
sourcePins=[pin(selectorPath),pin(dpath),pin(pagesPath),pin(centralPath),pin(landPath),pin(pPath),pin(semPath),pin(modelPath),pin(reportPath),pin(G/'app/scripts/reportDeepUnderstandingRollout.ts')]
summary={'remainingSelectedUniqueOwners':367,'excludedPrepared40':40,'excludedNewer36':36,'exclusionOverlap':4,'concreteNewCurrentInputDeltaGoals':51,'actualSelectedOwnerCurrentCanonicalContextIssues':38,'POnlyConcreteRefreshWithoutRecordedCanonicalContextIssue':13,'flagsOverlap':dict(flags),'disjointConcreteMasks':{k:len(v) for k,v in masks.items() if k!='no-atomic-input-delta'},'mechanicalOnlyGoalCount':316,'disjointMechanicalCategories':{k:len(v) for k,v in mechanical.items()},'historicalPNullAnnotationDoesNotCreateNewScience':142,'textDEENDeltas':0,'allSevenWithdrawalsUnchanged':True,'originalDControls':[105,214,7,3],'actualCentralReportReusedNoNewRun':283,'declaredChains':len(chains),'chainsNecessarilyBlockedByRecordedWholeIndexIssues':len(failed),'actualRecordedGlobalSupersessionFailures':sum(c['actualGlobalChainIssueRecorded'] for c in chains),'newScienceVotes':0,'newReviewsOrDRegistrations':0}
write('INVENTORY.remaining367-concrete-current-D-deltas-and-derived-contexts.json',{'schemaVersion':1,'role':'Exact technical remaining-D field inventory, not new scientific verdicts or global readiness','createdAtUTC':datetime.now(timezone.utc).isoformat(),'sourceRoot':str(G),'sourceCentralConfigPin':pin(centralPath),'summary':summary,'excludedPrepared40GoalIds':sorted(exclude40,key=pos.get),'excludedAlreadyNewer36GoalIds':sorted(exclude36,key=pos.get),'rows':rows,'allSevenWithdrawalsPreserved':config['resolutionWithdrawals'],'sourcePins':sourcePins,'bounds':['Current root C/P/SEM and105D controls are exact to the F/B diagnosis, so current fields/owners are still bound.','The only QA source change is excluded9b; existing4b97 mandatory native-base receipt is reused. No full439 compiler or central run.','51 concrete current input delta goals contain38 exact selected-owner canonical-context issues and13 P-only profile changes; no per-goal ready set is invented.','142 historical P=null bindings are annotations of first current embedding, not new P-review science.','316 mechanical-only goal contexts are explicitly excluded from new science/review queues. Existing holds and historical science remain intact.']})
write('LISTS.disjoint-concrete51-mechanical316-and-next-bounded-charges.json',{'schemaVersion':1,'summary':summary,'disjointConcreteGoalIds':{k:v for k,v in masks.items() if k!='no-atomic-input-delta'},'disjointMechanicalOnlyGoalIds':dict(mechanical),'actualCanonicalContextIssueGoalIds':contextIssueIds,'historicalPNullGoalIds':[r['goalId'] for r in rows if r['oldPNullIsFirstEmbeddingNotNewPScience']],'proposedBoundedCharges':proposals,'newScientificVotes':0,'preparedBatches':0})
write('COUPLING.registered105-whole-index-issues-and-declared-chain-constraints.json',{'schemaVersion':1,'role':'Necessary whole-index coupling constraints from the actual unchanged central diagnostic; no synthetic ready/claimed sets','sourceCentralReportPin':pin(reportPath),'sourceCurrentConfigPin':pin(centralPath),'summary':summary,'issueIndices':coupled,'declaredChains':chains,'rule':'Stock hasIntactResolutionSupersessionChain rejects a chain if any member index returns any issues, even when the chain goal itself has a fresh ready terminal row. Resolving peer stale claims/registry edges is separate from reopening unchanged goal science. No new chain-readiness call is claimed.','readinessNotMeasuredAgain':True})
write('SOURCES.current-root105-registry-C-P-SEM-assets-and-diagnostic-pins.json',{'schemaVersion':1,'pins':sourcePins,'registeredIndexPins':indexPins,'fourChangedCurrentAssetPins':assetPins,'allRegistryIndexBytesRecheckedAgainstBoundBSelectedOwners':True,'sourceRoundValidatorsExecuted':0,'noCapsuleWrites':True})
script=(G/'app/scripts/reportDeepUnderstandingRollout.ts').read_text();a=script.index('export const hasIntactResolutionSupersessionChain = ');b=script.index('\nconst loadDescriptionReadyGoals = ',a);(O/'STOCK.hasIntactResolutionSupersessionChain.source.txt').write_text(script[a:b]+'\n')
(O/'README.remaining-current-D-deltas-and-whole-index-coupling.md').write_text('''# Remaining current D deltas after frozen40

367 structurally unique selected owners remain after excluding the prepared6+20+14 and already-newer36 (four overlap). Current root canonical/P/SEM and registered D105/214supersessions/7withdrawals/3retirements are byte/object bound to the prior403+36 diagnosis. No existing capsule is written.

51 goals have concrete current D-input differences:33 requires,20 existing whole-P profiles,9 raw jurisdiction arrays and4 asset byte changes; these flags overlap. DE/EN goal text changes:0. Disjoint routing:25 requires-only,13 existing-P-only,13 mixed specific fields.38 carry exact current selected-owner canonical-context issues in the reused actual central report; the13 P-only changes are concrete current profile differences, not invented canonical-context errors or a claim that their current stock ready bit was measured.

316 goals have unchanged atomic canonical fields/existing-P profiles/assets:99 retain both prior/reverse ID unions,131 change only practiceAssessment reverse endpoints (Kind-Z context),86 change other derived reverse links. All316 remain outside new review/science queues.142 historical P=null cases are separately annotated as current first embeddings; they do not add a P science vote or change evidence levels.

The coupling artifact lists every registered index with actual recorded issues and every declared linear chain that uses it. Whole-index issues are a necessary chain blocker even if an individual terminal goal is current. The127 recorded supersession failures must not be interpreted as127 new science failures; obsolete peer claims and missing registry edges can couple unrelated goals. No ready/claimed sets, new global verdict, or repeated central/old-round validation are fabricated.

The disjoint list artifact proposes bounded topology-ordered routes: requires-only20+5, existing-P-only13, mixed13. These are routing proposals only; no new batch, review or D registration is performed here. All seven withdrawals and historical evidence remain intact. Exact before/current field payloads, goal IDs, assets and P differences are in the inventory rather than only full-page hashes.
''')
for x in sourcePins+indexPins+assetPins:assert pin(Path(x['path']))==x
files=sorted(p for p in O.iterdir() if p.is_file())
seal={'schemaVersion':1,'role':'Sealed exact remaining-D technical field inventory and coupling evidence','atUTC':datetime.now(timezone.utc).isoformat(),'files':[pin(p) for p in files],'newScientificVotes':0,'capsulesWritten':False}
write('SEAL.remaining-current-D-delta-inventory.sha256.json',seal)
selector={'schemaVersion':1,'role':'Current remaining51 concrete D input deltas;316 mechanical contexts excluded','summary':summary,'seal':pin(O/'SEAL.remaining-current-D-delta-inventory.sha256.json'),'inventory':pin(O/'INVENTORY.remaining367-concrete-current-D-deltas-and-derived-contexts.json'),'listsAndNextBoundedChargeIds':pin(O/'LISTS.disjoint-concrete51-mechanical316-and-next-bounded-charges.json'),'coupling':pin(O/'COUPLING.registered105-whole-index-issues-and-declared-chain-constraints.json'),'newScientificVotes':0}
write('SELECTOR.remaining-current-D-delta-inventory.sealed.json',selector)
for x in seal['files']:assert pin(Path(x['path']))==x
print(json.dumps({'selector':pin(O/'SELECTOR.remaining-current-D-delta-inventory.sealed.json'),'summary':summary,'nextRequires20':proposals[0]['goalIds']},indent=2))
