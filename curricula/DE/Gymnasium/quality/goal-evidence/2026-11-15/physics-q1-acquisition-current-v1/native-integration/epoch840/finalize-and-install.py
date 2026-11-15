"""Owner-authorized install after native69-view and actual national-map checks. No QA/Git/source writes."""
from pathlib import Path
import json,hashlib,datetime,shutil,os
B=Path(__file__).parent;P=B.parent;D=P/'native-topmap'
rd=lambda p:json.loads(Path(p).read_text());sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();write=lambda p,d:Path(p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
views=rd(B/'native-view-integration.actual.json');app=rd(B/'final-native-applicability.actual.json');contracts=rd(B/'final-contract-checks.actual.json')
assert len(views['views'])==69 and len(views['openRouteGaps'])==6
assert views['graphIntegrity']['status']=='pass'
assert app['summary']['errors']==0 and len(app['otherExistingGoalCacheDifferences'])==16
cp=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json');candidate=B/'canonical.candidate.json'
assert sha(candidate)=='42de6d969580d0307ed396b4e8c3ec56ca1d8a08c9ee8db71317c8ce08c4a8ff'
assert sha(cp)=='1ab730054209aa710b34e852bf3eab4f84e16f348b003fcaba6e2b2988c6b2b1'
for r in views['views']:
 assert sha(r['sourcePath'])==r['sourceSha256']
 assert sha(r['candidatePath'])==r['candidateSha256']
 assert not r['ordinaryLearningAddedOnlyForTasks'] and not r['ordinarySeedRemovals']
 assert not [x for x in r['nativeCompileFindings'] if x['severity']=='error']
top=rd(D/'candidate840.causal-native-report.json');nested=rd(D/'candidate840.nested.causal-native-report.json');before=rd(D/'baseline809.nested.causal-native-report.json')
assert len(top['rows'])==3 and len(nested['rows'])==3
for r in top['rows']:assert not r['topBoardDirectBackflows'] and not r['transitiveBackflows'] and not r['outsideStage'] and not r['findings']
def rels(r):return {(x['scopeId'],e['source'],e['target']) for x in r['nestedUnitEvidence']['allScopes'] for e in x['backwardRelations']}
maprows=[]
for i,r in enumerate(nested['rows']):
 old=before['rows'][i];assert not(rels(r)-rels(old))
 maprows.append({'courseProfile':r['scope']['courseProfile'],'actualTopDirectBackflows':len(top['rows'][i]['topBoardDirectBackflows']),'actualTopTransitiveBackflows':len(top['rows'][i]['transitiveBackflows']),'actualTopOutsideStage':len(top['rows'][i]['outsideStage']),'allNestedCompatibilityBackwardBefore':len(rels(old)),'allNestedCompatibilityBackwardAfter':len(rels(r)),'newNestedBackwardRelations':0,'activeTemporalStagePlans':0,'boundary':'Deep compatibility sections include subject topics, not reviewed year/phase plan units; existing order findings remain explicit.'})
materials=rd(B/'material-installation.actual.json')['materials']
for m in materials.values():assert sha(m['candidatePath'])==m['sha256']
retained=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-11-15/physics-q1-acquisition-current-v1')
required=[('three-material-root-review/review.actual.json','826db3fd8b09a5b0de45be1e1591f5173bb218145920d1334b2e73c9f5e471d1'),('national-digital-method-placement/72eff-root-placement-review.actual.json','ff3417ac252cac95acfbbb4e63322d180931bf42ecf42a52ccec1e6f1ad3eee2')]
for path,digest in required:assert sha(retained/path)==digest
summary={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'INTEGRATION_AUTHOR_NATIVE_CHECKS_COMPLETE_INDEPENDENT_D18_AND_MAIN_CI_PENDING','canonical':{'path':str(candidate),'sha256':sha(candidate),'goals':840},'nativeViews':{'count':69,'compileErrors':0,'ordinarySeedsExactlyPreserved':sum(r['ordinarySeedsPreserved'] for r in views['views']),'reviewedNationalDefaultSeedViews':3,'taskOnlyOrdinaryLearningAdds':0,'taskPlacements':sum(len(r['placements']) for r in views['views']),'openPriorSourcePlacementGaps':views['openRouteGaps']},'nationalSourceScopeDeltas':[{'viewId':r['viewId'],'ordinaryS809':r['ordinarySeedCountBefore'],'ordinarySFinal':r['ordinarySeedCountAfter'],'ordinaryL809':r['ordinaryLearningBefore'],'ordinaryLAfterR10AndHistoricalRemoval':r['ordinaryLearningAfterR10BeforeNationalDefault'],'ordinaryLFinal':r['ordinaryLearningAfterNewTasks'],'ordinaryDefaultAddsToS':r['ordinarySeedAdds'],'ordinaryDefaultAddsToL':r['ordinaryLearningAddedByNationalDefault']} for r in views['views'] if r.get('nationalDefaultPlacement')],'actualNationalMapRows':maprows,'nativeApplicability':app['summary'],'newTaskContentContractsExact':31,'historicalContractsExact':12,'coverageInsideActualRequiresClosure':31,'historicalIncomingRequires':0,'newOrdinaryGoals':0,'learnerResultWrites':False,'qualityLedgerWrites':False,'sourceInputWrites':False,'frozenV9Writes':False,'gitWrites':False,'productionOrPublicationWrites':False}
write(B/'owner-review-pack.actual.json',summary)
targets=[(candidate,cp)]+[(Path(r['candidatePath']),Path(r['sourcePath'])) for r in views['views']]+[(Path(m['candidatePath']),Path(m['targetPath'])) for m in materials.values()]
for p in sorted((B/'public').glob('**/README.md')):targets.append((p,Path('app/public')/p.relative_to(B/'public')))
v9=Path('curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json');v9before=sha(v9)
beforepins=[]
for source,target in targets:
 beforepins.append({'sourcePath':str(source),'targetPath':str(target),'beforeSha256':sha(target) if target.exists() else None,'afterSha256':sha(source)})
 if target.exists() and str(target).startswith('app/public/assets/assessment-materials/'):
  assert sha(target)==sha(source),'Unexpected existing scientific material: '+str(target)
for source,target in targets:
 target.parent.mkdir(parents=True,exist_ok=True);temporary=target.with_name(target.name+'.physics840-tmp');shutil.copyfile(source,temporary);os.replace(temporary,target)
for row in beforepins:assert sha(row['targetPath'])==row['afterSha256']
assert sha(v9)==v9before
write(B/'installation-receipt.actual.json',{'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'INSTALLED_OWNER_AUTHORIZED_CURRENT_CANDIDATE_NATIVE_QA_AND_MAIN_CI_PENDING','canonicalGoals':840,'canonicalSha256':sha(cp),'installedViews':69,'exactScientificAssets':6,'attributionReadmes':2,'files':beforepins,'independentContentAccepted':31,'independentD18ReviewPending':True,'sourceInputsTouched':False,'frozenV9Sha256Unchanged':v9before,'historicalContractsPreserved':12,'learnerResultsTouched':False,'qualityLedgersTouched':False,'gitTouched':False,'productionOrPublicationTouched':False,'ownerReviewPackSha256':sha(B/'owner-review-pack.actual.json')})
print(json.dumps({'status':'INSTALLED','goals':840,'canonicalSha256':sha(cp),'views':69,'assets':6,'attributionReadmes':2,'receiptPath':str(B/'installation-receipt.actual.json'),'receiptSha256':sha(B/'installation-receipt.actual.json'),'ownerReviewPackSha256':sha(B/'owner-review-pack.actual.json')}))
