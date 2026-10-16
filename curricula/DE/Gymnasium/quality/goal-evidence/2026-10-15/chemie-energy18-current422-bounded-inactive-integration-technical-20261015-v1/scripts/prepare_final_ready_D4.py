# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,copy,datetime
repo=Path.cwd();R=Path(__file__).resolve().parents[1];E=R.parent;D4=E/'chemie-energy-four-final-contexts-paired-native-technical-20261015-v1';V4=E/'chemie-energy-four-final-image-contexts-targeted-independent-V-20261015-v1';D15=E/'chemie-energy-native20-paired-fifteen-with-informed-dissent-technical-20261015-v1'
load=lambda p:json.loads(p.read_text());sha=lambda p:'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest();rel=lambda p:str(p.relative_to(repo));bind=lambda p:{'path':rel(p),'sha256':sha(p),'bytes':p.stat().st_size};write=lambda p,x:p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
# Preserve the exact already sealed preparation checkpoint.
prep=R/'FILES.finite-preparation-readonly-v2.seal.json';assert sha(prep)=='sha256:c8fc88d21028798a7236823d33a8132049931c0b0d5921b397a4d306795fdfc4'
for row in load(prep)['files']:
 p=repo/row['path'];assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes'],p
s4=D4/'NEUTRAL.finite-four-contexts-paired-native-technical.json';seal4=D4/'FILES.finite-four-contexts-paired-native-technical.seal.json';sv=V4/'SELECTOR.finite-current-four-independent-V4.json';seav=V4/'FILES.finite-independent-V4.seal.json'
assert sha(s4)=='sha256:cfe0b51855ab192b7931220ca388521d02bc5d44fb6c4555a9e61d90e13a6d8a';assert sha(seal4)=='sha256:eab726f5010ec9b5aee171f76323d478a92cd79659f9646cb1e9dcfb9689f9bd';assert sha(sv)=='sha256:16b72b7cef1950d096077c7ad71a7658a9c9e91115cd59be5d2d8139a6b1d9c2';assert sha(seav)=='sha256:a8b8c69664efbb4ebac1bb138ef4df947bf874dd5c3a95816c9fce8bcbec15a1'
for seal in [seal4,seav]:
 for row in load(seal)['files']:
  p=repo/row['path'];assert sha(p)==row['sha256'] and p.stat().st_size==row['bytes'],p
Dsel=load(s4);Vsel=load(sv)
for cmd in Dsel['actualNormalSixCommands']:assert sha(repo/cmd['path'])==cmd['sha256'] and load(repo/cmd['path'])['exitCode']==0
assert Dsel['results']['DResolutions']==4 and Dsel['results']['deferrals']==0 and Dsel['results']['portableIndependentNormalCheckExit0'] is True
index=repo/Dsel['normalD4ResolutionIndex']['path'];data=load(index);expected=set(Vsel['scopeGoalIds']);assert len(data['resolutions'])==4 and {r['goalId'] for r in data['resolutions']}==expected and all(r['decision']=='keep_current' and r['strictDescriptionComplete'] for r in data['resolutions'])
for row in data['resolutions']:assert sha(index.parent/row['resolutionPath'])==row['resolutionDigest']
oldIndex=D15/'native-twenty/resolution-index.json';old=load(oldIndex);ebfa=next(i for i in expected if i.startswith('ebfa'));assert ebfa in {r['goalId'] for r in old['resolutions']};assert not (expected-{ebfa}) & {r['goalId'] for r in old['resolutions']}
prepared=R/'config/central.current422.energy18.PREPARED.pending-D4.config.json';cfg=load(prepared);before=copy.deepcopy(cfg);sub=cfg['subjects'][0];sub['resolutionIndexPaths'].append(rel(index));edge={'goalId':ebfa,'supersededIndexPath':rel(oldIndex),'replacementIndexPath':rel(index)};sub['resolutionSupersessions'].append(edge);cfg['reportId']='chemie-energy18-current422-bounded-inactive-final-20261015-v1';final=R/'config/central.current422.energy18.inactive.final.config.json';assert not final.exists();write(final,cfg)
write(R/'checks/CAS.final-D4-index-and-only-ebfa-supersession.json',{'role':'Technical current resolution selection only; original D15/D4 records and whole reasons remain exact','preparedConfig':bind(prepared),'finalConfig':bind(final),'addedIndex':bind(index),'onlyAddedSupersession':edge,'otherThreeWereD15Deferred':True,'oldSupersessionsPrefixExact':sub['resolutionSupersessions'][:-1]==before['subjects'][0]['resolutionSupersessions'],'oldIndexPathPrefixExact':sub['resolutionIndexPaths'][:-1]==before['subjects'][0]['resolutionIndexPaths'],'activeSupersessionWritten':False,'newScientificVotes':0})
# Exact entire V overlay, not regenerated scientific fields.
q=load(R/'candidate/QA438.prepared-exact-original-other431-plus-real-V6.json');qm={r['goalId']:r for r in q['records']};vr=load(repo/Vsel['currentNormalQa4']['path'])['records'];assert len(vr)==4
for row in vr:assert qm[row['goalId']]==row and row['aiApproved']=='yes' and row['humanApproved']=='no'
for change in load(R/'checks/CAS.QA-preparation-real-sources-and-pending4.json')['changes']:
 if change.get('source'):assert qm[change['goalId']]==next(r for r in load(repo/change['source']['path'])['records'] if r['goalId']==change['goalId'])
assert qm['0773a104-aaeb-5e96-a615-2a2bec3eb096']['visualizationState']=='missing'
# Thresholds and all unrelated selection arrays remain byte-value exact to the proven baseline.
base=load(repo/load(R/'INPUTS.preparation-inactive-energy18.actual-selector.json')['inputs']['baselineConfig']['path']);bs=base['subjects'][0]
changedKeys={k for k in sub if sub[k]!=bs.get(k)};assert changedKeys=={'semanticAtomicityConfigPaths','positiveEvidenceConfigPaths','memoryReviewConfigPath','resolutionIndexPaths','resolutionSupersessions'}
assert sub['semanticAtomicityConfigPaths'][:-3]==bs['semanticAtomicityConfigPaths'];assert sub['positiveEvidenceConfigPaths'][:-3]==bs['positiveEvidenceConfigPaths'];assert sub['resolutionIndexPaths'][:-2]==bs['resolutionIndexPaths'];assert sub['resolutionSupersessions'][:-1]==bs['resolutionSupersessions'];assert sub['resolutionWithdrawals']==bs['resolutionWithdrawals']
protected=load(R/'checks/PROTECTED697.actual-before.json');assert len(protected['files'])==697
for row in protected['files']:assert sha(repo/row['path'])==row['sha256']
mp=load(R/'checks/REBUILD.energy18-prepared.physical-exact-map.v2.json');host=repo/mp['executionHost']
for row in mp['stockPhysicalModules']:assert sha(host/row['path'])==row['sha256']
for row in mp['aliases']:assert sha(host/row['normalHostAlias'])==row['physicalRepositorySource']['sha256']
ready={'schemaVersion':1,'verifiedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'Actual final input closure after explicit root-ready authorization; permits exactly one bundled full stock central report','parentAuthorization':{'sender':'/root','scope':'FinalD4jetztvorhanden+RootREADY; additiv final integrieren+1 gebündelten Central autorisiert; Prepseal57Dateien bleibt exakt.','conditions':'Actual D4 final seals/resolutions verified and whole genuine V4 metadata overlay exact, preserve321 IDs,697 active inputs,6 required gates/thresholds; no M7 grant'},'D4Selector':bind(s4),'D4Seal':bind(seal4),'D4Index':bind(index),'V4Selector':bind(sv),'V4Seal':bind(seav),'finalCentralConfig':bind(final),'preparationSeal57Preserved':bind(prep),'D4Resolutions':4,'D4Deferrals':0,'D4SixCommandsAndIndependentPortableCheckPass':True,'actualGenuineVMetadataRowsExact':6,'onlyEbfaD15Supersession':edge,'baseline321WholeBodiesExact':True,'requiredStockModulesAndThresholdsUnchanged':True,'protected697Exact':True,'fullCentralRunCountBefore':0,'allowedFullCentralRuns':1,'newScientificVotes':0,'activeIntegration':False,'M7Grant':False}
write(R/'checks/READY.actual-final-D4-V4-and-one-central-authorization.json',ready)
mp['role']='Final exact sparse inactive-report host; read-only image assets, no native renderer/build';mp['fullCentralAllowed']=True;mp['pendingD4V4']=False;mp['finalCentralConfig']=bind(final);mp['actualReadyInputs']=bind(R/'checks/READY.actual-final-D4-V4-and-one-central-authorization.json');mp['sourcePreparedReadOnlyMap']=bind(R/'checks/REBUILD.energy18-prepared.physical-exact-map.v2.json');write(R/'checks/REBUILD.energy18-final.physical-exact-map.v3.json',mp)
print(json.dumps(ready,ensure_ascii=False,indent=2))
