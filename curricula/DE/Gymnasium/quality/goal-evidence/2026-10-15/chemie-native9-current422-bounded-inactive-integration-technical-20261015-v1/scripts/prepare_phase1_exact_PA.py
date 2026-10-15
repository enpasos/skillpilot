# SPDX-License-Identifier: Apache-2.0
"""Finite inactive PA selection/residual preparation; no D resolution or central run."""
from pathlib import Path
import json,hashlib,copy,shutil,datetime
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent;B=E/'chemie-carbonyl15-equilibrium16-current422-bounded-inactive-integration-technical-20261015-v1';A=E/'chemie-next-nine-fresh-independent-a-20261015-v1';N=E/'chemie-six-inputs-three-scope-native9-final-rezeptfrei-preparation-technical-20261015-v2'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def entries(p):return[(json.loads(l),l)for l in p.read_text().splitlines(keepends=True)if l.strip()]
assert not(O/'INPUTS.phase1-exact-PA-preparation.selector.json').exists()
for d in ['checks','records','config','candidate']:(O/d).mkdir(exist_ok=True)
asel=A/'OUTPUTS.finite-independent-a.final-selector.json';aseal=A/'FILES.finite-independent-a.final.seal.json';assert bind(asel)['sha256']=='sha256:cdf5fe54012739aaed1dc9cffeaf33468c376d47f3aa2f472d84edafbca53921';assert bind(aseal)['sha256']=='sha256:b684aa4f944fa6ee8c851f35a428c6bcb3ce81be0736f0023b16f05fcdbb99ad'
for row in read(aseal)['files']:assert bind(R/row['path'])==row
new=read(asel);pc=read(R/new['P6']['config']['path']);six=pc['scope']['goalIds'];assert len(six)==6;e0='e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd';one='1a51362e-fd84-5964-89b5-b435772c2149';affected=set(six+[e0,one]);assert len(affected)==8
baselineConfig=B/'config/central.current422.carbonyl15-equilibrium16.inactive.final.config.json';baselineMap=B/'checks/REBUILD.current422.final.physical-map.json';baselineReport=B/'checks/CENTRAL.current422.carbonyl15-equilibrium16.stock-report.actual.json';cfg=read(baselineConfig);subject=cfg['subjects'][0];mp=read(baselineMap);aliases={r['normalHostAlias']:r['physicalRepositorySource']['path']for r in mp['aliases']}
def original(path):return R/aliases.get(str(path),str(path))
canonAlias='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';semanticAlias='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';qaAlias='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
nm=read(N/'checks/REBUILD.native9.final-actual-V2.physical-map.json');canonical=R/nm['finalCanonical']['path'];semantic=R/nm['finalSemantic']['path'];assert bind(canonical)['sha256']=='sha256:fccb633f60e264e48470aadf96c66f0aac9d8b4a8e0abbcc15d4ef671926c647';assert bind(semantic)['sha256']=='sha256:3e8f562fc19f177f987d1168718ffb48be3d115c45be63dae59096d909f9f27d'
by={g['id']:g for g in read(canonical)['goals']};oldby={g['id']:g for g in read(original(canonAlias))['goals']};assert len(by)==len(oldby)==560
changed=[g for g in by if by[g]!=oldby[g]];assert set(changed)<=affected
report=read(baselineReport)['subjects'][0];strict=set(report['strictCompleteGoalIds']);assert len(strict)==358 and not strict&affected and not strict&set(nm['selectedGoalIds']);assert all(oldby[g]==by[g]for g in strict)
protected=B/'checks/PROTECTED697.actual-before.json';prot=read(protected)['files'];assert len(prot)==697
for row in prot:assert bind(R/row['path'])==row
write('checks/PROTECTED697.actual-phase1-before.json',{'role':'Finite active-file identity protection only; not a QA run','sourceSnapshot':bind(protected),'files':prot,'all697ActualBytesExact':True,'baselineOtherSubjects':read(protected).get('baselineOtherSubjects'),'activeWrites':0})
residuals=[];selectedArrays={};allOriginalBindings=[]
for kind,key in [('P','positiveEvidenceConfigPaths'),('A','semanticAtomicityConfigPaths')]:
 selected=[]
 for i,path in enumerate(subject[key]):
  cp=original(path);c=read(cp);rp=original(c['reviewPath']);raw=entries(rp);over=affected&{r['goalId']for r,l in raw};allOriginalBindings.extend([bind(cp),bind(rp)])
  if not over:selected.append(path);continue
  remaining=[(r,l)for r,l in raw if r['goalId']not in affected];assert remaining
  ledger=O/'records'/f'{kind}-old-residual-{i:02d}.whole-lines.exact.jsonl';ledger.write_text(''.join(l for r,l in remaining))
  c['landscapePath']=canonAlias;c['reviewPath']=str(ledger.relative_to(R))
  if kind=='P':c['semanticKindLedgerPath']=semanticAlias;c['scope']={**c['scope'],'goalIds':[r['goalId']for r,l in remaining]}
  else:c['scope']={'label':c['scope']['label']+'; exact residual excluding current8','leafGoalIds':[r['goalId']for r,l in remaining]}
  out=O/'config'/f'{kind}-old-residual-{i:02d}.normal.config.json';write(str(out.relative_to(O)),c);selected.append(str(out.relative_to(R)))
  originalRunFiles=[bind(R/p)for p in c.get('reviewRunManifestPaths',[])]
  residuals.append({'kind':kind,'originalConfig':bind(cp),'originalWholeSelectedLedger':bind(rp),'removedCurrentlyAffectedGoalIds':sorted(over),'retainedRawLineCount':len(remaining),'retainedRawLinesByteExact':True,'outputConfig':bind(out),'outputLedger':bind(ledger),'unchangedOriginalReviewId':c['reviewId'],'originalRunManifestPathsAndBytesUnchanged':originalRunFiles,'originalRunIdsInRetainedRows':sorted({rid for r,l in remaining for rid in r.get('reviewRunIds',[])}),'noFingerprintOrScienceFieldChanged':True})
 selectedArrays[key]=selected
assert len([x for x in residuals if x['kind']=='P'])==2 and sum(len(x['removedCurrentlyAffectedGoalIds'])for x in residuals if x['kind']=='P')==4
assert len([x for x in residuals if x['kind']=='A'])==2 and sum(len(x['removedCurrentlyAffectedGoalIds'])for x in residuals if x['kind']=='A')==8
selections=[]
for kind,key in [('P','positiveEvidenceConfigPaths'),('A','semanticAtomicityConfigPaths')]:
 source=R/new[kind+'6']['config']['path'];c=read(source);sourceRecords=R/c['reviewPath'];raw=entries(sourceRecords);assert {r['goalId']for r,l in raw}==set(six)
 ledger=O/'records'/f'{kind}6.genuine-independent-A.whole-records.exact.jsonl';shutil.copy2(sourceRecords,ledger);assert ledger.read_bytes()==sourceRecords.read_bytes();c['landscapePath']=canonAlias;c['reviewPath']=str(ledger.relative_to(R))
 if kind=='P':c['semanticKindLedgerPath']=semanticAlias
 target=O/'config'/f'{kind}6.genuine-independent-A.normal-address-only.config.json';write(str(target.relative_to(O)),c);selectedArrays[key].append(str(target.relative_to(R)))
 runrefs=[bind(R/p)for p in c.get('reviewRunManifestPaths',[])]
 if kind=='P':
  assert len(runrefs)==1 and read(R/runrefs[0]['path'])['outputDigest']==bind(sourceRecords)['sha256'];assert all(r['reviewRunIds']==[read(R/runrefs[0]['path'])['runId']]for r,l in raw)
 selections.append({'kind':kind,'originalConfig':bind(source),'originalRecords':bind(sourceRecords),'normalAddressOnlyConfig':bind(target),'selectedWholeRecords':bind(ledger),'wholeRecordsFileByteExact':True,'allScienceFieldsAndFingerprintsExact':True,'reviewIdUnchanged':c['reviewId'],'originalRunBindingsUnchanged':runrefs,'noNewVotes':True})
# Exact identity/duplicate accounting only, not a new acceptance count.
claims={}
for kind,key in [('P','positiveEvidenceConfigPaths'),('A','semanticAtomicityConfigPaths')]:
 seen={}
 for path in selectedArrays[key]:
  cp=original(path)if not path.startswith(str(O.relative_to(R)))else R/path;c=read(cp);rp=original(c['reviewPath'])if not c['reviewPath'].startswith(str(O.relative_to(R)))else R/c['reviewPath']
  for row,line in entries(rp):seen.setdefault(row['goalId'],[]).append(path)
 assert all(len(paths)==1 for paths in seen.values()),{g:p for g,p in seen.items()if len(p)>1};assert not set([e0,one])&set(seen);assert set(six)<=set(seen)
 claims[kind]={'affectedSixSelectedOnceEach':{g:seen[g]for g in six},'awaitingC_e0_1aUnselected':True,'duplicateSelectedGoalIds':[]}
# D references only; preserve all86 old indexes and181 supersessions unchanged until genuine B2 + ROOTREADY.
drefs=[]
for path in subject['resolutionIndexPaths']:
 p=original(path);rows=read(p)['resolutions'];over=[row for row in rows if row['goalId']in nm['selectedGoalIds']]
 if over:drefs.append({'index':bind(p),'affectedExistingEntries':over})
write('checks/OVERLAP.exact8-old-PA-containers-and-raw-residuals.json',{'role':'Finite exact ID/byte selection, not science reassessment','affected8GoalIds':sorted(affected),'content6GoalIds':six,'awaitingP2A2GoalIds':[e0,one],'residuals':residuals,'actualGenuineA6P6Selections':selections,'selectedClaimUniqueness':claims,'oldWholeRowsElsewhereUnmodified':True,'removedOldPClaims':4,'removedOldAClaims':8,'other23PAnd23ARawLinesExact':True,'newScienceVotes':0})
write('candidate/PREPARED.PA-exact-selections.awaiting-final-gates.json',{'schemaVersion':1,'role':'Check-only inactive selection template; intentionally not a complete runnable central config','baselineCurrent358Config':bind(baselineConfig),'canonical':bind(canonical),'semantic':bind(semantic),'normalCanonicalAlias':canonAlias,'normalSemanticAlias':semanticAlias,**selectedArrays,'unchangedBaselineDResolutionIndexPaths':subject['resolutionIndexPaths'],'unchangedBaselineResolutionSupersessions':subject['resolutionSupersessions'],'unchangedBaselineResolutionWithdrawals':subject['resolutionWithdrawals'],'finalD9ResolutionIndex':None,'genuineBlindB2Selector':None,'genuineC_P2A2Selector':None,'finalCM422Config':None,'finalCV438Ledger':None,'ROOTREADY':False,'centralAllowed':False,'missingInputs':'Genuine B2 finalD9, separately informed C P2/A2e0+1a and final f71M1/V1 normal M422/V438 selection; root explicit ROOTREADY.','exposedB1EligibleAsSecondGate':False,'exposedB1Role':'History only; no FIRST content read or selected for this preparation'})
write('checks/D9-reference-inventory-only.awaiting-blind-B2.json',{'role':'Original A9 and old-index references only, no resolution/materialization','genuineA9References':new['D9'],'actualNative9Selector':bind(N/'INPUTS.blind-native9-final-rezeptfrei.scientific.selector.json'),'existingOldIndexEntriesForTheseTargets':drefs,'existing86IndexesUnmodified':True,'newResolutionFiles':0,'newDualSummaries':0,'centralRuns':0,'secondGateEligible':'Only genuinely blind B2 final selector after completion; exposedB1 excluded'})
write('checks/PRESERVATION.baseline358-all-unaffected-and-active697.json',{'role':'Reference358 preservation proof, no new strict count','baselineReport':bind(baselineReport),'baselineConfig':bind(baselineConfig),'originalStrict358GoalIds':sorted(strict),'affected8IntersectionWithOld358':[],'all358WholeCanonicalGoalObjectsExact':True,'allCanonicalChangesAreWithinAffected8':changed,'active697BeforeProof':bind(O/'checks/PROTECTED697.actual-phase1-before.json'),'otherSubjectsAreReadOnly':True,'newStrictCountComputed':False})
# Fresh small host map:31 stock modules,51 physical aliases;435 actual final images only references.
newmp={k:copy.deepcopy(mp[k])for k in ['schemaVersion','aliases','stockPhysicalModules']};newmp.update(role='Fresh ignored check-only inactive PA integration host; no image copies or central permission',executionHost='tmp/chemie-m7-resumed-20261015/native9-current422-inactive-integration-preflight-host-v1',canonical=bind(canonical),semantic=bind(semantic),source358Map=bind(baselineMap),sourceFinalNative9Map=bind(N/'checks/REBUILD.native9.final-actual-V2.physical-map.json'))
for row in newmp['aliases']:
 if row['normalHostAlias']==canonAlias:row['physicalRepositorySource']=bind(canonical)
 if row['normalHostAlias']==semanticAlias:row['physicalRepositorySource']=bind(semantic)
 if row['normalHostAlias']==qaAlias:row['role']='Frozen358 baseline alias only. Do not run M/V/full report; replace only from genuine final C selector.'
newmp['selectedCurrentAssetRows']=[{**copy.deepcopy(row),'publicMustBePhysicalWithinHostPublicRoot':False,'publicMaterialization':'immutable source reference; no renderer in this host'}for row in nm['selectedCurrentAssetRows']]
newurls={row['normalPublicDestination']for row in newmp['selectedCurrentAssetRows']};newmp['legacyBaselineAssetReferences']=[{**copy.deepcopy(row),'publicMustBePhysicalWithinHostPublicRoot':False}for row in mp['selectedCurrentAssetRows']if row['normalPublicDestination']not in newurls]
newmp.update(physicalPublicImages=0,rasterCopyBytes=0,normalQAState='Await genuine finalC; frozen358alias is not final approval for new context',memoryState='Await genuine finalC M422; no old FP transport permitted',centralAllowed=False,ROOTREADY=False)
write('checks/REBUILD.check-only-zero-raster-copy.prepared-map.json',newmp)
# Reproduction helper uses references for every raster; no old host or source writes.
script=(B/'scripts/rebuild_final_host.readonly.py').read_text().replace("checks/REBUILD.current422.final.physical-map.json","checks/REBUILD.check-only-zero-raster-copy.prepared-map.json")
script=script.replace("for r in DATA['selectedCurrentAssetRows']:\n p=verified(r['physicalRepositorySource']);install(p,r['normalCanonicalDestination'],False)\n install(p,r['normalPublicDestination'],r['publicMustBePhysicalWithinHostPublicRoot'])", "for r in DATA['selectedCurrentAssetRows']+DATA.get('legacyBaselineAssetReferences',[]):\n p=verified(r['physicalRepositorySource']);install(p,r['normalCanonicalDestination'],False)\n install(p,r['normalPublicDestination'],False)")
# No history discovery directory rewrite needed: all current tests here are targeted P/A only.
script=script[:script.index('# Explicitly reproduce exact315')]+"\nprint(json.dumps({'host':str(HOST.relative_to(REPO)),'stockPhysicalModules':len(DATA['stockPhysicalModules']),'normalPhysicalAliases':len(DATA['aliases']),'rasterCopies':0,'centralAllowed':False,'ROOTREADY':False}))\n"
(O/'scripts/rebuild_check_only_sparse_host.py').write_text(script)
write('checks/ORIGINAL.input-binding-inventory.before.json',{'role':'Originals to recheck unchanged after targeted preparation','files':list({row['path']:row for row in allOriginalBindings+[bind(asel),bind(aseal),bind(baselineConfig),bind(baselineMap),bind(baselineReport)]+[r for s in selections for r in [s['originalConfig'],s['originalRecords']]]}.values()),'noOriginalWrites':True})
write('INPUTS.phase1-exact-PA-preparation.selector.json',{'schemaVersion':1,'role':'Finite check-only inactive preparation; no new scientific judgments/count or central report','canonical':bind(canonical),'semantic':bind(semantic),'baseline358Config':bind(baselineConfig),'baseline358Map':bind(baselineMap),'baseline358Report':bind(baselineReport),'genuineAOutputSelector':bind(asel),'genuineASeal':bind(aseal),'affected8GoalIds':sorted(affected),'residualAndSelectionProof':bind(O/'checks/OVERLAP.exact8-old-PA-containers-and-raw-residuals.json'),'inactiveSelectionTemplate':bind(O/'candidate/PREPARED.PA-exact-selections.awaiting-final-gates.json'),'preparedZeroImageCopyMap':bind(O/'checks/REBUILD.check-only-zero-raster-copy.prepared-map.json'),'pending':['genuine blind B2 final D9','genuine informed C P2/A2e0+1a','genuine finalC M422/V438 including f71M1/V1','explicit root ROOTREADY'],'ROOTREADY':False,'centralAllowed':False,'newScientificVotes':0,'newStrictCountComputed':False,'activeWrites':0,'gitWrites':0})
print(json.dumps({'prepared':str(O.relative_to(R)),'oldPContainers':2,'oldPClaimsRemoved':4,'oldAContainers':2,'oldAClaimsRemoved':8,'retainedExactOtherRawLinesEachKind':23,'genuineNewP6AndA6RecordsExact':True,'active697Exact':True,'allOld358GoalBodiesExact':True,'centralAllowed':False}))
