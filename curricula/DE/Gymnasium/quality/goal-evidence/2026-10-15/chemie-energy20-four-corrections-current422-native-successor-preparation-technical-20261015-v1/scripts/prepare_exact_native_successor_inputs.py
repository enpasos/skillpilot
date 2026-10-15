# SPDX-License-Identifier: Apache-2.0
"""Exact technical transport from sealed four-correction author input; no science."""
import copy,hashlib,json,os,shutil
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-native-successor.seal.json').exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
OLD=E+'chemie-energy20-current422-native-preparation-technical-20261015-v1'
AUTHOR=E+'chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):assert bind(r['path'])==r,r['path']
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def exact_copy(r,d):verify(r);shutil.copyfile(ROOT/r['path'],OWN/d);return bind(REL+'/'+d)
free=os.statvfs(ROOT).f_bavail*os.statvfs(ROOT).f_frsize;assert free>100*1024*1024,'Report disk scarcity to root before continuing'
neutral=read(AUTHOR+'/NEUTRAL.final-four-defects-author-successor.json');sel=read(neutral['selector']['path']);oldsel=read(OLD+'/INPUTS.final-native20.physical-exact-selector.json')
for r in read(AUTHOR+'/FILES.finite-author-successor.seal.json')['files']:verify(r)
whole=exact_copy(neutral['wholeCanonical560'],'candidate/canonical560.current422.four-corrections.exact-author.json')
sem=exact_copy(neutral['semanticCompanion560'],'candidate/semantic560.current422.exact-author.json')
cases=exact_copy(neutral['complete42Cases'],'materials/forty-two-whole-DE-EN-cases.exact-author.json')
profiles=exact_copy(neutral['whole20RawE0G0Profiles'],'candidate/twenty-original-E0G0.corrected-author.exact.jsonl')
ids=sel['originalScope20'];assert ids==oldsel['scopeGoalIds'] and len(ids)==20
write('candidate/twenty-whole-current560-goals.exact.json',{'goalIds':ids,'goals':[g for gid in ids for g in read(whole['path'])['goals'] if g['id']==gid]})
mapPath=OLD+'/checks/REBUILD.current422-native560.physical-map.json';mapping=read(mapPath)
assert len(mapping['selectedCurrentAssetRows'])==434
mapping['sourcePhysicalMap']=bind(mapPath);mapping['role']='Technical native20 four-correction successor, exact prior434 image map; no central/new reviews'
mapping['executionHost']='tmp/chemie-m7-resumed-20261015/energy20-four-corrections-current422-native560-host-v1'
mapping['buildReceiptPath']='checks/REBUILD.actual-native-successor-host.json'
overrides={'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':whole,'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json':sem}
aliasCAS=[]
for r in mapping['aliases']:
 if r['normalHostAlias'] in overrides:
  before=copy.deepcopy(r);r['physicalRepositorySource']=overrides[r['normalHostAlias']];aliasCAS.append({'normalAlias':r['normalHostAlias'],'wholeBefore':before,'wholeAfter':copy.deepcopy(r)})
assert len(aliasCAS)==2
extra=['app/scripts/materializeGoalDescriptionRolloutResolutions.ts','app/scripts/materializeGoalDescriptionRolloutSynthesisManifest.ts','app/scripts/reportGoalVisualizationRolloutStatus.ts']
known={r['path'] for r in mapping['stockPhysicalModules']}
for p in extra:
 if p not in known:mapping['stockPhysicalModules'].append(bind(p))
mapping['stockPhysicalModules'].sort(key=lambda r:r['path'])
assert len(mapping['stockPhysicalModules'])==31
assert all(p in {r['path'] for r in mapping['stockPhysicalModules']} for p in ['app/scripts/generateGoalVisualizationQaLedgers.ts','app/scripts/goalVisualizationQaModel.ts'])
for r in mapping['stockPhysicalModules']:verify(r)
assert mapping['selectedCurrentAssetRows']==read(mapPath)['selectedCurrentAssetRows']
mapping['normalStockCommands']=['materializeGoalDescriptionRolloutBatch.ts prepare','materializeGoalDescriptionRolloutBatch.ts check']
write('checks/REBUILD.current422-native560-four-corrections.physical-map.json',mapping)
write('CAS.normal-alias-and-profile-material-input-transport.json',{'role':'Address-only technical copies, all scientific bytes exact from sealed author input','sourceMap':bind(mapPath),'normalAliasChanges':aliasCAS,'profileBefore':neutral['whole20RawE0G0Profiles'],'profilePhysicalCopy':profiles,'casesBefore':neutral['complete42Cases'],'casesPhysicalCopy':cases,'profileCaseReferencesRemainExactSealedAuthorPaths':True,'global434AssetRowsExact':True,'QA438AliasUnchanged':True,'newScientificVotes':0})
base=read(OLD+'/config/whole422.normal-stock-base.config.json');base['bookId']='chemie-energy20-four-corrections-current422-full560-context-20261015-v1';base['title']='Chemie – vollständiger 560er Kontext des korrigierten Energie20-Materials';base['evidenceReviewPaths']=[profiles['path']];base['outputPath']=REL+'/candidate/full422.in-memory-only.not-materialized.json'
write('config/whole422.normal-stock-base.config.json',base)
batch=read(OLD+'/config/native20.normal-prepare-only.config.json');batch.update({'batchId':'chemie-energy20-four-corrections-current422-native560-20261015-v1','bookId':'chemie-energy20-four-corrections-current422-native560-20261015-v1','title':'Chemie – Energie und Waschmittel: zwanzig Lernziele mit vier gezielten Korrekturen','baseGoalBookConfigPath':REL+'/config/whole422.normal-stock-base.config.json','outputDirectory':REL+'/native-twenty'})
write('config/native20.normal-prepare-only.config.json',batch)
qa=next(r['physicalRepositorySource'] for r in mapping['aliases'] if r['normalHostAlias']==base['goalVisualizationQaPath']);assert qa==sel['QA438ExactReuse']
priorCAS=read(sel['twoWholeGoalCAS']['path']);qaWhole=read(qa['path']);vRows=[]
for g in priorCAS['wholeRows']:
 row=next(r for r in qaWhole['records'] if r['goalId']==g['goalId'])
 vRows.append({'goalId':g['goalId'],'wholePriorQARecord':row,'wholeBeforeGoal':g['wholeBefore'],'wholeCurrentGoal':g['wholeAfter'],'QARecordUnchanged':True,'resourceLinksUnchanged':g['wholeBefore']['resourceLinks']==g['wholeAfter']['resourceLinks'],'oldImageHashAndHumanFieldsRemainHistorical':True,'freshTargetContextV2Review':'OPEN','newAIApprovalClaim':False})
write('V2.two-description-image-context-freshness.OPEN.json',{'role':'Explicit scientific freshness boundary; showing an unchanged image in native review is not a new V decision','QA438ExactSource':qa,'records':vRows,'newVisualVotes':0,'noHumanFlagsTransferredToNewBytes':True,'imageBytesChanged':0,'allOtherImageBindingsRetained':True,'0773SourceAndImageOpen':True})
sources=sel['completeWholeSourceAndPartnerInputs']
for r in sources:verify(r)
write('INPUTS.exact-sealed-four-corrections-native20.json',{'schemaVersion':1,'role':'Technical native successor input closure only; byte verification is not a fresh primary-source science reading','scopeGoalIds':ids,'sealedAuthorNeutral':bind(AUTHOR+'/NEUTRAL.final-four-defects-author-successor.json'),'sealedAuthorSelector':neutral['selector'],'sealedAuthorSeal':bind(AUTHOR+'/FILES.finite-author-successor.seal.json'),'sourceWholeCanonical560':neutral['wholeCanonical560'],'sourceSemantic560':neutral['semanticCompanion560'],'wholeCanonical560':whole,'semantic560':sem,'QA438':qa,'wholeCases42':cases,'rawProfiles20E0G0':profiles,'completeSourceAndPartnerClosure':sources,'blankOwnRecords':sel['originalBlankOwnRecords'],'originalHoldsPlusM6':sel['oldHoldsPlusSixMStales'],'originalWholeAuthorMaterialSelector':sel['originalWholeAuthorMaterialSelector'],'original20NativeNeutral':bind(OLD+'/NEUTRAL.final-native20-560-current422-preparation.json'),'original20NativeSeal':bind(OLD+'/FILES.finite-native-preparation.seal.json'),'original20PhysicalMap':bind(mapPath),'twoGoalCAS':sel['twoWholeGoalCAS'],'twoCaseCAS':sel['twoWholeCaseCAS'],'allProfilesOriginalAuthorMetadataExact':True,'independentPrimaryScienceReadsClaimed':False,'freeBytesAtStart':free,'newVotes':0})
src=ROOT/OLD/'scripts/rebuild_new_native_sparse_host.py';text=src.read_text().replace('FILES.finite-native-preparation.seal.json','FILES.finite-native-successor.seal.json').replace('checks/REBUILD.current422-native560.physical-map.json','checks/REBUILD.current422-native560-four-corrections.physical-map.json');(OWN/'scripts/rebuild_new_native_sparse_host.py').write_text(text)
src=ROOT/OLD/'scripts/run_native_stock.py';text=src.read_text().replace('FILES.finite-native-preparation.seal.json','FILES.finite-native-successor.seal.json').replace('checks/REBUILD.current422-native560.physical-map.json','checks/REBUILD.current422-native560-four-corrections.physical-map.json');(OWN/'scripts/run_native_stock.py').write_text(text)
print(json.dumps({'scope':20,'wholeGoals':560,'ordinary':422,'images':434,'physicalImages':19,'modules':31,'dynamicQAChildrenBound':True,'oldQA438Exact':True,'freshV2ContextHolds':2,'freeBytesAtStart':free,'newVotes':0}))
