#!/usr/bin/env python3
# Apache-2.0. Technical owner selection, not a new scientific P review.
import copy,hashlib,json
from collections import Counter,defaultdict
from pathlib import Path
R=Path(__file__).resolve().parents[7];O=Path(__file__).resolve().parent;B=O.parent
if list(O.glob('SEAL.*')):raise RuntimeError('Sealed evidence; create an additive successor instead of overwriting.')
def read(p):return json.loads(p.read_text())
def rel(p):return str(p.relative_to(R))
def pin(p):return {'path':rel(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def rows(p):return [(i+1,json.loads(line),line)for i,line in enumerate(p.read_bytes().splitlines(keepends=True))if line.strip()]
def write(p,x):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');assert read(p)==x
J=B/'chemie-current454-joint-integration-candidate-technical-20261018-v2';latestPath=J/'LATEST.selected-candidate-state.pending.json';latest=read(latestPath);nativePath=R/latest['changedPositiveNativeInputsPath'];native=rows(nativePath);assert len(native)==31
ids={r['goalId']for _,r,_ in native};assert len(ids)==31
assert all(r['status']=='needs_human_review'and r['reviewAuthority']=='ai_candidate'and r['reviewRunIds']==[]for _,r,_ in native)
registryPath=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';registry=read(registryPath);si=next(i for i,s in enumerate(registry['subjects'])if s['subject']=='chemie');subject=registry['subjects'][si]
normalCanonical=subject['landscapePath'];normalSemantic=subject['semanticKindLedgerPath'];candidate=read(R/latest['landscapePath']);ledger=read(R/latest['semanticKindLedgerPath']);ordinary={r['goalId']for r in ledger['decisions']if r['semanticKind']=='curricularAtomic'and r['decisionStatus']=='authoritative'};assert len(ordinary)==454
parents={'dc146a38-994d-58ec-b6a0-5210118b93ae':'a3788e40-b540-5bed-be37-b33053528422','b732c780-beb8-55f3-8503-edd6b8677a3a':'223e33a4-5545-5332-ac4e-7d7a6cbc587c','8e6b5d11-8c1b-5220-af20-549a870dbd8c':'31cce65a-480a-5111-ab3c-da2feb3d4065','69f2ecbb-ac0a-5d3a-8084-2142706e1161':'8721d943-8368-5304-bd3c-7d7944099662'}
old={};sources=[];pins={latestPath,nativePath,registryPath,R/latest['landscapePath'],R/latest['semanticKindLedgerPath'],R/latest['wholePositiveProfileBodiesPath'],R/normalCanonical,R/normalSemantic,R/'app/scripts/positiveGoalEvidenceReview.ts',R/'app/scripts/positiveGoalEvidenceProfileModel.ts',R/'app/scripts/goalEvidenceProfileModel.ts',R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json'}
for i,path in enumerate(subject['positiveEvidenceConfigPaths'],1):
 cp=R/path;c=read(cp);rp=R/c['reviewPath'];rr=rows(rp);assert {r['goalId']for _,r,_ in rr}==set(c['scope']['goalIds']),path
 pins|={cp,rp,R/c['reviewCriteriaPath']}
 manifestById={read(R/p)['runId']:p for p in c.get('reviewRunManifestPaths',[])};assert len(manifestById)==len(c.get('reviewRunManifestPaths',[]))
 for ln,r,line in rr:
  gid=r['goalId'];assert gid not in old,gid;old[gid]={'configPath':path,'wholeConfig':c,'recordPath':c['reviewPath'],'lineOneBased':ln,'record':r,'wholeLine':line}
  assert all(run in manifestById for run in r['reviewRunIds'])
 sources.append((i,cp,c,rp,rr,manifestById))
assert len(old)==450 and len(ids&old.keys())==27 and ids-old.keys()==set(parents)
criteriaByGoal=[];groups=defaultdict(list)
for ln,r,line in native:
 gid=r['goalId'];origin=old.get(gid)or old[parents[gid]];criteria=origin['wholeConfig']['reviewCriteriaPath'];fp='sha256:'+hashlib.sha256((R/criteria).read_bytes()).hexdigest();assert fp==r['reviewCriteriaFingerprint'],gid
 groups[criteria].append((ln,r,line));criteriaByGoal.append({'goalId':gid,'sourceOldGoalId':gid if gid in old else parents[gid],'sourceOldConfigPath':origin['configPath'],'exactOriginalCriteriaPath':criteria,'criteriaFingerprint':fp,'nativeInputLineOneBased':ln,'newSplitParentInheritance':gid in parents})
assert Counter(r['reviewCriteriaFingerprint']for _,r,_ in native)==Counter({'sha256:4ed61d2a8c7eb84dd13315427d46989b4750f58620481e19023b145935025835':29,'sha256:14b9fe5db2b527baad6e5e488b2e2909f2eeaaeb8d9106a7c072ec6c2d4f12be':2})
assert len(groups)==4
future=[];dispositions=[];owner=[];retained=0;retainedManifests=[]
for i,cp,c,rp,rr,manifestById in sources:
 remaining=[row for row in rr if row[1]['goalId']not in ids];removed=[r['goalId']for _,r,_ in rr if r['goalId']in ids]
 if not remaining:
  dispositions.append({'originalConfig':pin(cp),'disposition':'not_selected_empty_remaining_scope','retiredGoalIds':removed});continue
 if not removed:
  future.append(rel(cp));dispositions.append({'originalConfig':pin(cp),'disposition':'whole_config_and_record_file_unchanged','selectedConfigPath':rel(cp),'recordFile':pin(rp)});selectedPath=rel(cp)
 else:
  recordPath=O/'records'/f'P{i:03}.remaining-original-owner.EXACT.jsonl';recordPath.parent.mkdir(exist_ok=True);recordPath.write_bytes(b''.join(line for _,_,line in remaining));assert rows(recordPath)==[(j+1,r,line)for j,(_,r,line)in enumerate(remaining)]
  after=copy.deepcopy(c);after['landscapePath']=normalCanonical;after['semanticKindLedgerPath']=normalSemantic;after['reviewPath']=rel(recordPath);after['scope']={'label':c['scope']['label']+'; exact original remaining owners after31 scoped successors','goalIds':[r['goalId']for _,r,_ in remaining]}
  runIds={run for _,r,_ in remaining for run in r['reviewRunIds']};after['reviewRunManifestPaths']=[p for p in c.get('reviewRunManifestPaths',[])if read(R/p)['runId']in runIds];assert {read(R/p)['runId']for p in after['reviewRunManifestPaths']}==runIds
  configPath=O/'config/active'/f'P{i:03}.original-owner.residual.config.json';write(configPath,after);selectedPath=rel(configPath);future.append(selectedPath)
  dispositions.append({'originalConfig':pin(cp),'disposition':'residual_exact_original_record_lines','selectedConfigPath':selectedPath,'recordFile':pin(recordPath),'retiredGoalIds':removed,'retainedOriginalReviewId':c['reviewId'],'selectedReferencedRunManifestPaths':after['reviewRunManifestPaths']})
 for ln,r,line in remaining:
  retained+=1;owner.append({'goalId':r['goalId'],'selectedConfigPath':selectedPath,'originalConfigPath':rel(cp),'originalRecordFile':pin(rp),'originalLineOneBased':ln,'originalRecordLineSHA256':hashlib.sha256(line).hexdigest(),'reviewId':r['reviewId'],'status':r['status'],'reviewAuthority':r['reviewAuthority'],'reviewer':r['reviewer'],'reviewedAt':r['reviewedAt'],'wholeOriginalLineByteExact':True})
 for p in (read(R/selectedPath)).get('reviewRunManifestPaths',[]):pins.add(R/p);retainedManifests.append(p)
assert retained==423
newGroups=[]
for i,(criteria,rr)in enumerate(sorted(groups.items()),1):
 recordPath=O/'records'/f'P31-group{i:02}.native-input-lines.EXACT.jsonl';recordPath.parent.mkdir(exist_ok=True);recordPath.write_bytes(b''.join(line for _,_,line in rr));assert [r for _,r,_ in rows(recordPath)]==[r for _,r,_ in rr]
 sample=rr[0][1];assert len({r['reviewId']for _,r,_ in rr})==1
 c={'$schema':'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-review-config.schema.json','schemaVersion':2,'reviewId':sample['reviewId'],'goalFingerprintRuleVersion':sample['goalFingerprintRuleVersion'],'profileRuleVersion':sample['profileRuleVersion'],'landscapeId':sample['landscapeId'],'landscapePath':normalCanonical,'semanticKindLedgerPath':normalSemantic,'reviewCriteriaPath':criteria,'reviewPath':rel(recordPath),'reviewRunManifestPaths':[],'reviewedResourceTypes':['goal-visualization'],'requireApproved':False,'scope':{'label':f'Exactly{len(rr)} previously parsed native candidate P successors with original criteria path preserved; technical selection only','goalIds':[r['goalId']for _,r,_ in rr]}}
 cp=O/'config/active'/f'P31-group{i:02}.preserved-criteria-path.config.json';write(cp,c);future.append(rel(cp));probe=copy.deepcopy(c);probe['landscapePath']=latest['landscapePath'];probe['semanticKindLedgerPath']=latest['semanticKindLedgerPath'];pp=O/'config/candidate'/cp.name;write(pp,probe)
 newGroups.append({'groupIndex':i,'criteriaFingerprint':sample['reviewCriteriaFingerprint'],'exactOriginalCriteriaPath':criteria,'goalCount':len(rr),'goalIds':c['scope']['goalIds'],'activeConfigPath':rel(cp),'candidateConfigPath':rel(pp),'recordFile':pin(recordPath),'nativeWholeOriginalLinesByteExact':True})
 for ln,r,line in rr:owner.append({'goalId':r['goalId'],'selectedConfigPath':rel(cp),'nativeInput':pin(nativePath),'originalLineOneBased':ln,'nativeRecordLineSHA256':hashlib.sha256(line).hexdigest(),'reviewId':r['reviewId'],'status':r['status'],'reviewAuthority':r['reviewAuthority'],'reviewer':r['reviewer'],'reviewedAt':r['reviewedAt'],'wholeOriginalLineByteExact':True})
assert len(owner)==454 and {r['goalId']for r in owner}==ordinary
bookPath=R/'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.json';book=read(bookPath);companionPath=bookPath.with_name(bookPath.stem+'.inputs.json');companion=read(companionPath);pins|={bookPath,companionPath,R/'app/src/utils/goalBookPublicationRegistry.ts'}
matchingFields=[]
def scan(obj,pointer=''):
 if isinstance(obj,dict):
  for k,v in obj.items():
   if v==subject['positiveEvidenceConfigPaths']:matchingFields.append(pointer+'/'+k)
   scan(v,pointer+'/'+k)
 elif isinstance(obj,list):
  for i,v in enumerate(obj):scan(v,pointer+'/'+str(i))
scan(book);assert matchingFields==[]
write(O/'ACTIVATION.positive-evidence-registry-field-CAS.pending.json',{'role':'Inactive exact field CAS proposal; root composes with other authorized activation fields','registryInput':pin(registryPath),'operations':[{'file':rel(registryPath),'jsonPointer':f'/subjects/{si}/positiveEvidenceConfigPaths','before':subject['positiveEvidenceConfigPaths'],'after':future}],'candidateCanonical':pin(R/latest['landscapePath']),'candidateSemanticKindLedger':pin(R/latest['semanticKindLedgerPath']),'goalBookInspection':{'activeConfig':pin(bookPath),'companionConfig':pin(companionPath),'matchingPositiveEvidenceConfigFields':matchingFields,'existingEvidenceReviewPaths':book['evidenceReviewPaths'],'decision':'No equivalent active goal-book evidence-config field found; existing empty evidenceReviewPaths is a different record-path field and remains unchanged.'},'normalEditsPerformed':False})
write(O/'SELECTION.exact454-P-owners-and423-byte-exact-retentions.json',{'role':'Technical owner selection; no content rereview','oldSelectedOwnerCount':450,'newNativeSuccessors':31,'oldReplacedOwnerCount':27,'newGoalIds':list(parents),'oldRetainedOwnerCount':423,'selectedFutureConfigPaths':future,'originalConfigDispositions':dispositions,'exactOneOwnerPerGoal':owner,'selectedReferencedRunManifestPaths':sorted(set(retainedManifests)),'newStatusAuthorityUnchanged':'All31needs_human_review/ai_candidate with original reviewer, reviewedAt and empty run IDs; no invented vote or approval'})
write(O/'CRITERIA.two-fingerprints-four-exact-original-paths.json',{'role':'Preserve exact old criteria paths; new split atoms inherit actual parent criteria paths','fingerprintCounts':dict(Counter(r['reviewCriteriaFingerprint']for _,r,_ in native)),'exactPathGroups':newGroups,'perGoalBindings':criteriaByGoal,'normalizationOrCriteriaRewrite':False})
lineagePath=J/'TECHNICAL.joint-P-body-selection-and-coverage.pending.json';lineage=read(lineagePath);pins.add(lineagePath)
provenance={'role':'References to already completed components and source selections; no new scientific review, blind vote or human claim','jointWholeProfileSelectionManifest':pin(lineagePath),'selectedProfileBodySourceLineage':{gid:lineage['selectionLineage'].get(gid,[])for gid in ids},'completedOwnComponentSealReferences':[],'scopeLimitation':'References retain their original limited scientific claims. They are not transformed into31full independent P approvals or reviewRunIds.'}
for name in ['chemie-current450-context28-targeted-remediation-independent-a-20261018-v1','chemie-current450-two-scope-HOLDs-independent-b-20261018-v1','chemie-current450-greenhouse-atomicity-independent-a-20261018-v1','chemie-current450-recycling-atomicity-independent-a-20261018-v1','chemie-current450-SN-aluminium-existing-carriers-independent-a-20261018-v1','chemie-current450-SN-cementation-existing-carrier-independent-a-20261018-v2','chemie-current454-targeted-AM-components-independent-a-20261018-v1']:
 for p in sorted((B/name).glob('SEAL.*')):pins.add(p);provenance['completedOwnComponentSealReferences'].append(pin(p))
write(O/'PROVENANCE.existing-component-references-no-new-scientific-review.json',provenance)
# Pin every actual resource byte used by the selected454 P inputs. No visual inspection.
cby={g['id']:g for g in candidate['goals']}
for row in owner:
 c=read(R/row['selectedConfigPath'])
 if 'goal-visualization'in c['reviewedResourceTypes']:
  for link in cby[row['goalId']].get('resourceLinks',[]):
   if link.get('type')=='goal-visualization':pins.add(R/'app/public'/link['url'].lstrip('/'))
write(O/'INPUTS.actual-entry-pins.json',{'role':'Actual selected old configs/whole records/criteria/manifests, parsed successor lines, candidate and resource bytes; component seals referenced without new peer content review','pins':[pin(p)for p in sorted(pins)]})
write(O/'LICENSE-and-attribution.json',{'technicalSerialization':'Apache-2.0','retainedOwnGoalAndTaskKnowledge':'CC-BY-4.0','otherInputRightsAndProvenance':'Retained without relicensing'})
print(json.dumps({'output':rel(O),'old423ExactOwners':retained,'newNative31':len(native),'futureConfigs':len(future),'configDispositions':dict(Counter(x['disposition']for x in dispositions)),'newExactCriteriaPathGroups':len(newGroups),'selectedRunManifests':len(set(retainedManifests)),'inputPins':len(pins)},ensure_ascii=False))
