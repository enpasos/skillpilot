# Apache-2.0. New inactive author artifacts and completely private regular inputs only.
from pathlib import Path
import copy,datetime,hashlib,importlib.util,json,os,subprocess
R=Path('/home/enpasos/projects/skillpilot');E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
N=E/'chemie-polymer20-source-course-locator-targeted-author-20261013-v15';D=E/'chemie-f947-three-primary-source-and-nucleophile-case-remediation-author-20261013-v13/source/converged-polymer20-source-author';X=R/'tmp/chemie-polymer-source-course-locator-private-20261013-v15'
rd=lambda p:json.loads(p.read_text());rel=lambda p:str(p.relative_to(R));sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size}
def own(p,data):
 assert p.is_relative_to(N);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists(),p
 for par in p.parents:
  if par==R:break
  assert not par.is_symlink(),par
 p.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
def private(p,payload):
 assert p.is_relative_to(X);cur=X
 for part in p.parent.relative_to(X).parts:
  cur=cur/part
  if cur.is_symlink():
   src=cur.resolve(strict=True);cur.unlink();cur.mkdir()
   for child in src.iterdir():(cur/child.name).symlink_to(child,target_is_directory=child.is_dir())
  elif not cur.exists():cur.mkdir()
  assert not cur.is_symlink(),cur
 if p.is_symlink() or p.exists():p.unlink()
 p.write_bytes(payload);assert not p.is_symlink() and p.resolve().is_relative_to(X)
plan=rd(N/'SOURCE_COURSE_LOCATOR_AUTHOR.pending-exact-preflight-verification.json');maps={p['originalLiveBinding']['path']:p for p in plan['mappingSuccessors']}
oldindex=rd(D/'neutral/targeted-source-cell-and-component-delta-index.actual.json');newdelta=[]
semantic=lambda d:{k:d.get(k) for k in ['sourceGoalId','topicCode','sourceSpan','decision','canonicalGoalIds','matchType']}
for row in oldindex['rows']:
 if not row['currentSourceRecordKey']:
  mp=next(p for p in maps.values() if p['priorAuthorOrOriginalBinding']['path']==row['proposedSourceRecordKey'].split('|')[1]);prior=rd(R/mp['priorAuthorOrOriginalBinding']['path']);future=rd(R/mp['candidateBinding']['path']);oldID=row['sourceGoalId']
  prior_s=next(g for g in rd(R/prior['sourceExtractionPath'])['sourceGoals'] if g['id']==oldID);future_s=next(g for g in rd(R/future['sourceExtractionPath'])['sourceGoals'] if g['id']==oldID)
  prior_d=next(d for d in prior['decisions'] if d['sourceGoalId']==oldID);future_d=next(d for d in future['decisions'] if d['sourceGoalId']==oldID)
  assert prior_s==future_s and semantic(prior_d)==semantic(future_d)
  newdelta.append({'originalMappingPath':mp['originalLiveBinding']['path'],'sourceGoalId':oldID,'priorV13TransportOnly':False,'nowTransportOnlyWholeSourceGoalAndSemanticDecisionExact':False,'introducedGenuinePrimarySourceRowExactlyRetainedToN13':True,'actualConsumedSourceGoalFieldChanges':sorted(future_s),'actualMappingSemanticFieldChanges':sorted(semantic(future_d)),'candidateSourceBinding':bind(R/future['sourceExtractionPath'])});continue
 original=row['currentSourceRecordKey'].split('|')[1];mp=maps[original];current=rd(R/original);future=rd(R/mp['candidateBinding']['path']);oldID=row['sourceGoalId']
 cs=next(g for g in rd(R/current['sourceExtractionPath'])['sourceGoals'] if g['id']==oldID);ns=next(g for g in rd(R/future['sourceExtractionPath'])['sourceGoals'] if g['id']==oldID)
 cd=next(d for d in current['decisions'] if d['sourceGoalId']==oldID);nd=next(d for d in future['decisions'] if d['sourceGoalId']==oldID)
 fields=[k for k in sorted(set(cs)|set(ns)) if cs.get(k)!=ns.get(k)];mfields=[k for k in semantic(cd) if semantic(cd)[k]!=semantic(nd)[k]]
 newdelta.append({'originalMappingPath':original,'sourceGoalId':oldID,'priorV13TransportOnly':row['transportOnlyWithExactSourceGoalAndSemanticDecision'],'nowTransportOnlyWholeSourceGoalAndSemanticDecisionExact':not fields and not mfields,'actualConsumedSourceGoalFieldChanges':fields,'actualMappingSemanticFieldChanges':mfields,'currentSourceBinding':bind(R/current['sourceExtractionPath']),'candidateSourceBinding':bind(R/future['sourceExtractionPath'])})
retained_transport=[r for r in newdelta if r['priorV13TransportOnly'] and r['nowTransportOnlyWholeSourceGoalAndSemanticDecisionExact']]
transport_now_fixed=[r for r in newdelta if r['priorV13TransportOnly'] and not r['nowTransportOnlyWholeSourceGoalAndSemanticDecisionExact']]
preservation=[]
for mp in plan['mappingSuccessors']:
 old=rd(R/mp['priorAuthorOrOriginalBinding']['path']);new=rd(R/mp['candidateBinding']['path']);nd={d['sourceGoalId']:d for d in new.get('decisions',[])}
 for d in old.get('decisions',[]):
  n=nd[d['sourceGoalId']];allowed=set(n.get('canonicalGoalIds',[])).issubset(d.get('canonicalGoalIds',[]));assert allowed,(mp,d['sourceGoalId'])
  changed=[k for k in ['decision','canonicalGoalIds','matchType'] if d.get(k)!=n.get(k)]
  assert not changed or d['sourceGoalId']=='sn-chem-seki-sn-ch-klassenstufe-10-lb4-083-02-a49c4542',(mp,d['sourceGoalId'],changed)
  if changed:preservation.append({'originalMappingPath':mp['originalLiveBinding']['path'],'sourceGoalId':d['sourceGoalId'],'oldCanonicalGoalIds':d.get('canonicalGoalIds'),'newCanonicalGoalIds':n.get('canonicalGoalIds'),'removedOnlyCanonicalGoalId':'8721d943-8368-5304-bd3c-7d7944099662','replacementActualSourceGoalId':plan['newExactSeparateSNRecyclingSourceGoalId']})
own(N/'neutral/prior52-substantive-and110-transport-cells.current-targeted-delta.actual.json',{'schemaVersion':1,'priorIndex':bind(D/'neutral/targeted-source-cell-and-component-delta-index.actual.json'),'priorSubstantiveCellCount':52,'priorTransportCellCount':110,'priorTransportCellsStillWholeRowExact':len(retained_transport),'priorTransportCellsNowWithinExplicit31FixScope':len(transport_now_fixed),'allPriorExistingMappedPartnerSetsPreservedExceptExplicitSNManufactureRecyclingSeparation':True,'exactSNPartnerSeparation':preservation,'rows':newdelta,'newScientificVotes':0})
transport=rd(R/'tmp/v15-transport-closure-readonly/plan.json');payloads={};private_receipts=[]
for link in transport['links']:
 original=R/link['currentlyResolvedOriginalMappingPath'];assert sha(original)==link['originalSha256']
 old=R/link['historicalInputPath'];assert old.is_symlink() and os.readlink(old)==link['originalSymlinkLiteral'];assert sha(old)==link['originalSha256']
 existing=link['existingByteExactCandidateBinding']
 if existing: candidate=R/existing['path'];assert sha(candidate)==link['originalSha256']
 else:
  digest=link['originalSha256'].split(':')[1];candidate=N/'historical-byte-exact-transport-candidates'/(digest+'.json')
  if not candidate.exists():candidate.parent.mkdir(exist_ok=True);candidate.write_bytes(original.read_bytes())
  assert sha(candidate)==link['originalSha256'];payloads[rel(candidate)]=bind(candidate)
 private(X/link['historicalInputPath'],candidate.read_bytes());future=X/link['historicalInputPath'];assert future.is_file() and not future.is_symlink() and sha(future)==sha(old)
 private_receipts.append({**link,'candidateRegularFileBinding':bind(candidate),'currentHistoricalMode':'120000','privateProspectiveMode':'100644','beforeResolvedBytesSha256':sha(old),'afterPrivateRegularBytesSha256':sha(future),'privateParentChainRegular':True,'originalHistoricalScientificFilesWritten':False})
transport.update(requiredHistoricalRegularFileTransports=64,additionalExactCandidatePayloadsCreated=list(payloads.values()),links=private_receipts,candidateCopiesAndPrivateSimulationNotPerformed=False,privateAll64ByteExactRegularizationPassed=True,historicalReviewSealSEMCaseJSONRewritten=False,economicsScientificChanges=False,activeOrGitWrites=False)
own(N/'checks/prospective64-historical-byte-exact-transport-before36-alias-retirement.actual.json',transport)
own(N/'neutral/targeted-consumed-source-cell-and-course-locator-fix-inputs.actual.json',{'schemaVersion':1,'kind':'Neutral exact consumed source-cell data; not author or peer verdict prose','currentAndCandidateSourceCellCASOperations':plan['sourceCellCASOperations'],'mappingCellCASOperations':plan['mappingCellCASOperations'],'newActualSeparateSNSourceGoalId':plan['newExactSeparateSNRecyclingSourceGoalId'],'newActualSeparateSNSourceGoal':next(g for p in plan['sourceExtractionSuccessors'] for g in rd(R/p['candidateBinding']['path'])['sourceGoals'] if g['id']==plan['newExactSeparateSNRecyclingSourceGoalId']),'sourceExtractionCarriers':plan['sourceExtractionSuccessors'],'mappingCarriers':plan['mappingSuccessors'],'caseDataEdits':0,'newScientificVotes':0})
# Copy new owned outputs into the private root; every mutable parent and leaf is detached.
for p in N.rglob('*'):
 if p.is_file():private(X/rel(p),p.read_bytes())
spec=importlib.util.spec_from_file_location('stock_validate_schemas',R/'scripts/validate_schemas.py');module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
errors=module.curriculum_symlink_errors(str(X/'curricula'));assert not errors,errors
parse=[]
for p in N.rglob('*'):
 if p.suffix=='.json':rd(p);parse.append(rel(p))
 if p.suffix=='.jsonl':
  for line in p.read_text().splitlines():
   if line.strip():json.loads(line)
  parse.append(rel(p))
live_can=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';live_sem=R/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
assert sha(live_can)=='sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960';assert sha(live_sem)=='sha256:1d9efb3bcddbe97c9f39e44856e65a9c943ca17aa121a0a747509b6e9436de3e'
status=subprocess.check_output(['git','diff','--name-only'],cwd=R,text=True).splitlines();assert all(p=='docs/qa-ci/chemie231-inactive-polymer17-and-source-holds-checkpoint-2026-10-13.md' for p in status),status
own(N/'checks/structured64-private-closure-and-current-science-CAS.actual.json',{'schemaVersion':1,'checkedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'stockCurriculumSymlinkCheck':{'moduleBinding':bind(R/'scripts/validate_schemas.py'),'privateRoot':rel(X),'errors':errors},'ownedStructuredFilesParsed':parse,'all64HistoricalPrivateCarrierBytesExact':True,'allMutablePrivateWriterParentsRegular':True,'currentCanonical':bind(live_can),'currentRawSEM':bind(live_sem),'trackedLiveDiffPaths':status,'newNativeRenders':0,'newScientificVotes':0,'liveScienceWritesInV15':0,'priorV9OneSEMWriteThroughIncidentDisclosedAndRestoredInOldSealedArtifacts':True})
print(json.dumps({'root':rel(N),'sourceCarriers':len(plan['sourceExtractionSuccessors']),'mappingCarriers':len(plan['mappingSuccessors']),'sourceCells':len(plan['sourceCellCASOperations']),'historicalExactRegularizations':64,'newExactPayloads':len(payloads),'prior110NowFixedRows':len(transport_now_fixed),'prior110StillExactRows':len(retained_transport),'stockSymlinkErrors':errors,'currentScienceCASExact':True}))
