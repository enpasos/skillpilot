import pathlib,json,hashlib,datetime,subprocess,copy
P=pathlib.Path;q=P('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10');o=q/'wirtschaft-origin-cd7-merge-preservation-independent-c-READONLY-v1'
load=lambda p:json.loads(P(p).read_text());sha=lambda b:hashlib.sha256(b).hexdigest();bind=lambda p:{'path':str(p),'sha256':sha(P(p).read_bytes()),'bytes':P(p).stat().st_size};git=lambda *a:subprocess.check_output(['git',*a]);checks={}
def ck(k,v):
 checks[k]=bool(v)
 if not v:raise AssertionError(k)
bp=o/'preserved-remote-cd7-and-qualified-Economics-d2dbac-before.EXACT.json';base=load(bp);sp=o/'actual-remote-cd7-science-registry-ledger-and235-Economics-whole-preservation.READONLY.json';science=load(sp);ip=o/'actual-native-inventory-patch-6292-2425-61-746-two-branch-independent-KEEP.READONLY.json';inv=load(ip)
ck('boundedScience1359ChecksRemainQualified',len(science['checks'])==1359 and all(science['checks'].values()) and bind(sp)['sha256']=='1097de294b3a404c6cadc5c95ccb729b0341d1b3e23c3c552967b04be24c7ea5')
ck('originalNativeInventory15ExactPreservationChecks',len(inv['checks'])==15 and all(inv['checks'].values()) and bind(ip)['sha256']=='db44d7d9148307e90ebf968b7540fdab3107ed8dc2425906fa74459ac3700736')
reportp='docs/qa-ci/status/curriculum-quality-status.json';report=load(reportp);by={c['landscapeId']:c for c in report['curricula']};ecid='605bdaf6-32d5-56fd-8d92-5a80c2fd2901';cid='c436b994-8f44-5134-b9f8-0c9f5d6a5ba0';ec=by[ecid];chem=by[cid]
ck('freshMergedNativeCentralReportAfterBefore',report['generatedAt']>base['preMergeCurrentReport']['generatedAt'])
ck('currentEconomicsWholeReportExactlyQualifiedBeforeM6',ec==base['currentEconomicReportWholeObject'] and ec['maturity']=='M6')
ck('currentChemistryWholeReportExactlyAuthoritativeRemote',chem==base['remoteChemistryReportWholeObject'] and chem['maturity']=='M6')
oldreport=json.loads(git('show',base['qualifiedLocalCheckpointCommit']+':'+reportp));oldby={c['landscapeId']:c for c in oldreport['curricula']}
overviewFollowers=[]
remoteReport=json.loads(git('show',base['remoteCommit']+':'+reportp));baseReport=json.loads(git('show',base['mergeBase']+':'+reportp));getOverview=lambda r:next(c for c in r['curricula'] if c['subject']=='Gymnasium (Deutschland)')
for id,c in by.items():
 if id in [ecid,cid]:continue
 if c['subject']!='Gymnasium (Deutschland)':
  ck('allEighteenOtherWholeReportObjectsExactBefore:'+c['subject'],c==oldby[id]);continue
 restored=copy.deepcopy(c);oldrows={r['jurisdiction']:r for r in oldby[id]['jurisdictionCoverage']['jurisdictions']};baserows={r['jurisdiction']:r for r in getOverview(baseReport)['jurisdictionCoverage']['jurisdictions']};remoterows={r['jurisdiction']:r for r in getOverview(remoteReport)['jurisdictionCoverage']['jurisdictions']}
 for row in restored['jurisdictionCoverage']['jurisdictions']:
  country=row['jurisdiction'];key='diagnosticPartialOnlyWarnings';before=oldrows[country][key];measured=row[key];expected=before+remoterows[country][key]-baserows[country][key]
  ck('overviewDiagnosticCounterExactTwoBranchDeltas:'+country,measured==expected)
  if measured!=before:overviewFollowers.append({'jurisdiction':country,'field':key,'base':baserows[country][key],'qualifiedOwnBefore':before,'remote':remoterows[country][key],'actualMerged':measured})
  row[key]=before
 ck('overviewOnly15BoundedDiagnosticFieldsAllOtherWholeFieldsExact',len(overviewFollowers)==15 and restored==oldby[id])
ck('qualityRuleCatalogAndVersionWholeExact',report['ruleCatalog']==oldreport['ruleCatalog'] and report['rulesVersion']==oldreport['rulesVersion'])
rs={r['id']:r for r in ec['rules']}
for rid in ['CQR-000','CQR-001','CQR-002','CQR-003','CQR-004','CQR-005','CQR-301','CQR-302','CQR-401','CQR-501']:ck('currentEconomicRulePASS:'+rid,rs[rid]['status']=='pass')
for k in ['sourceAtomicGoals','sourceMappedToViewAtomicGoals','sourceOriginalGoals','sourceFullyCoveredOriginalGoals']:ck('currentExactNativeSource2135:'+k,rs['CQR-003']['metrics'][k]==2135)
for k in ['unsupportedAssignedAtomicGoals','unmappedSourceAtomicGoals','sourcePartiallyCoveredOriginalGoals','sourceUncoveredOriginalGoals','warningedJurisdictions','errorJurisdictions']:ck('currentNativeSourceZero:'+k,rs['CQR-003']['metrics'][k]==0)
for s in ec['scopes']:
 for r in s['rules']:
  if r['id'] in ['CQR-101','CQR-102','CQR-103','CQR-104','CQR-201','CQR-202','CQR-203']:ck('currentScopePASS:'+s['scopeId']+':'+r['id'],r['status']=='pass')
ck('current346AtomicityMemoryAndM7DenominatorExact',rs['CQR-301']['metrics']['leafGoals']==rs['CQR-302']['metrics']['reviewedGoals']==rs['CQR-303']['metrics']['expectedGoals']==346)
ck('EconomicM7StillHonestlyOpenZeroStrict',rs['CQR-303']['status']=='fail' and rs['CQR-303']['metrics']['strictComplete']==0)
for b in base['foreignCurrentFloors']:
 c=by[b['landscapeId']];r={r['id']:r['status'] for r in c['rules']};ck('allTwentyProtectedMaturityFloors:'+b['subject'],int(c['maturity'][1:])>=int(b['maturity'][1:]))
 ck('allPreviousPassedForeignRulesPreserved:'+b['subject'],all(r[id]=='pass' for id in b['passedRules']))
for name,n in [('Mathematik',807),('Physik',478)]:
 c=next(c for c in by.values() if c['subject']==name);r=next(r for r in c['rules'] if r['id']=='CQR-303');ck('protectedStrictCurrentM7:'+name,c['maturity']=='M7' and r['status']=='pass' and r['metrics']['expectedGoals']==r['metrics']['strictComplete']==n)
cr=next(r for r in chem['rules'] if r['id']=='CQR-303');ck('remoteChemistryCurrent398Strict206Retained',cr['metrics']['expectedGoals']==398 and cr['metrics']['strictComplete']==206)
phasep=q/'wirtschaft-final702-stable-M6-CI-root-v1/remote-cd7-merged-M6-qualified-final.actual-command-receipts.json';phase=load(phasep)
ck('actualRootStableThirteenNativeCommandsCompletedPASS',phase['phaseComplete'] and len(phase['results'])==13 and all(r['exitCode']==0 for r in phase['results']))
for row in phase['results']:ck('rootActualNativeCommandRawBindingExact:'+row['name'],bind(row['rawOutputPath'])['sha256']==row['rawOutputSha256'])
# Reconfirm actual input end bindings without a native global generator or build.
for b in base['localEconomicScientificAndQAInputBindings']:ck('final235EconomicWholeInputExact:'+b['path'],bind(b['path'])=={k:b[k] for k in ['path','sha256','bytes']})
for b in base['remoteChemistryDirectRegistryInputs']:ck('final111RemoteChemistryRegistryInputExact:'+b['path'],bind(b['path'])=={k:b[k] for k in ['path','sha256','bytes']})
for b in base['remoteChangedBindings195']:
 if b['strictRemoteChemistryScienceOrAsset'] and not b['sharedMetadataPossible']:ck('final183RemoteChemistryWholeFileExact:'+b['path'],bind(b['path'])=={k:b[k] for k in ['path','sha256','bytes']})
reg=load('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json');subs={s['subject']:s for s in reg['subjects']};ck('finalRegistryCurrentEconomicsAndRemoteChemistryWholeExact',subs['wirtschaftswissenschaften']==base['localEconomicRegistryWholeEntry'] and subs['chemie']==base['remoteChemistryRegistryWholeEntry'])
for s in base['otherRegistryEntriesCurrent']:ck('finalOtherRegistryWholeExact:'+s['subject'],subs[s['subject']]==s)
ck('finalNativeInventoryExactlyQualifiedOriginalPatch',bind('docs/legal/ai-transparency-inventory.json')['sha256']==inv['currentWholeInventory']['sha256'])
ck('generatedEconomicsOfferingAndReadinessBytesExactToPremergeM6',bind('app/src/generated/gymnasiumDurationOfferings.ts')['sha256']=='b0e91aa0220e717b99b3459a953553860b44ae0eaec42843ffe9e643c81e8d43' and bind('docs/qa-ci/status/gymnasium-duration-model-readiness.md')['sha256']=='fe0b12e2dbe6835688aad181e29bb0bf7869977f12c33a89d8cf467180b75f27')
receipt={'status':'KEEP_independent_merged_cd7_remote_chemistry_and_qualified_Economics_M6_source2135_preservation','at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'reviewer':'/root/economics_common_source_course_independent_c','checks':checks,'currentCentralReport':bind(reportp),'currentCentralGeneratedAt':report['generatedAt'],'remoteCommit':base['remoteCommit'],'qualifiedEconomicBeforeCommit':base['qualifiedLocalCheckpointCommit'],'scientificAndSemanticMergeGuard':bind(sp),'nativeInventoryTechnicalIndependentGuard':bind(ip),'actualStableRootThirteenNativeCommandEvidence':bind(phasep),'currentEconomicMaturity':'M6','currentEconomicOrdinary':346,'currentEconomicWholeReportExactBefore':True,'currentChemistryWholeReportExactRemote':True,'allEighteenOtherWholeReportObjectsExactBefore':True,'genericGymnasiumOverviewOnly15DerivedDiagnosticCounterFollowers':overviewFollowers,'allOtherOverviewWholeFieldsIncludingMaturityAndRuleStatusesExactBefore':True,'actualSourceGoals':2135,'fullyCoveredSourceGoals':2135,'unsupportedAssignedGoals':0,'sourceUnmapped':0,'MathPhysicsCurrentIDStrictM7':{'Mathematik':'807/807','Physik':'478/478'},'remoteChemistryCurrentIDsStrict':'206/398','currentOwnStrictM7':'0/346','allTwentyForeignMaturityFloorsPreserved':True,'currentM7StillSeparate':rs['CQR-303'],'BE125RawMAPPING3UnchangedPendingAndNativeCurrentMappingGatePASSSeparate':True,'mergeReceiptNoForeignScientificRereview':True,'newSourceImageHumanOrM7ReviewClaim':False,'activeWrites':0,'ownGlobalGeneratorOrBuildInvoked':False,'GitHubCIClaim':False,'currentGeneratedDurationAndReadinessVerifiedFromActualRootNativeOutputs':'15 duration countries /16 content countries,30 Economics sources /2135 goals; exactly the pre-merge qualified generated bytes.','scope':'Read-only merge preservation against exact remote cd7 and qualified local d2dbac. Original remote/new goal IDs and evidence preserved; no historical total used as content-approval evidence.'}
p=o/'actual-independent-current-cd7-merged-M6-Source2135-foreign-and-native-metadata-KEEP.SEALED.receipt.json';p.write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'receipt':bind(p),'currentCentralReport':bind(reportp),'finalChecks':len(checks),'priorScientificChecks':len(science['checks']),'inventoryChecks':len(inv['checks']),'currentM6':True,'allTwentyFloors':True}))
