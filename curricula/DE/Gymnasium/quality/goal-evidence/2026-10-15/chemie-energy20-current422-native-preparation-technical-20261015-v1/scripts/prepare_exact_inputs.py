# SPDX-License-Identifier: Apache-2.0
"""Apply only the five previously sealed whole-object CAS on the separate560 base."""
import copy,hashlib,json,shutil
from pathlib import Path
ROOT=Path.cwd();OWN=Path(__file__).resolve().parents[1];REL=OWN.relative_to(ROOT).as_posix()
assert not (OWN/'FILES.finite-native-preparation.seal.json').exists()
E='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15/'
AUTHOR=E+'chemie-energy-detergents20-current422-whole-material-author-20261015-v1'
MEM=E+'chemie-bw-lk-memory-support-selection-author-20261015-v1'
REV=E+'chemie-bw-lk-six-card-corrections-targeted-independent-20261015-v1'
BASE=E+'chemie-lab2-current422-paired-and-inactive-integration-technical-20261015-v1'
def read(p):return json.loads((ROOT/p).read_text())
def bind(p):
 b=(ROOT/p).read_bytes();return {'path':p,'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(r):assert bind(r['path'])==r,r['path']
def write(p,d):(OWN/p).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def exact_copy(r,d):verify(r);shutil.copyfile(ROOT/r['path'],OWN/d);return bind(REL+'/'+d)
a=read(AUTHOR+'/INPUTS.final-Energy20-whole-material.author-selector.json')
mn=read(MEM+'/NEUTRAL.finite-memory-support-selection-author.json');rn=read(REV+'/NEUTRAL.finite-targeted-six-independent.json')
for r in [mn['canonicalCandidate'],mn['semanticCandidate'],mn['wholeBWViewCandidate'],rn['currentSixDeckAliases'],rn['whole422M'],rn['whole75Cards'],a['wholeCAS'],a['QAHistoryPlusExactIndependentV1']]:verify(r)
before=read(mn['canonicalCandidate']['path']);after=copy.deepcopy(before);cas=read(a['wholeCAS']['path']);G={g['id']:g for g in after['goals']};B={g['id']:g for g in before['goals']}
ids=[r['goalId'] for r in (json.loads(l) for l in (ROOT/a['rawProfiles20E0G0']['path']).read_text().splitlines())]
assert len(before['goals'])==560 and len(set(ids))==20
for row in cas['wholeRows']:
 assert row['goalId'] in ids and G[row['goalId']]==row['wholeBefore'],row['goalId']
 G[row['goalId']].clear();G[row['goalId']].update(copy.deepcopy(row['wholeAfter']))
changes=[g['id'] for g in after['goals'] if g!=B[g['id']]]
assert set(changes)=={r['goalId'] for r in cas['wholeRows']} and len(changes)==5
assert all(g.get('requires')==B[g['id']].get('requires') and g.get('contains')==B[g['id']].get('contains') for g in after['goals'])
assert {k:v for k,v in before.items() if k!='goals'}=={k:v for k,v in after.items() if k!='goals'}
write('candidate/canonical560.current422.five-sealed-author-CAS.exact.json',after)
sem=read(mn['semanticCandidate']['path']);assert sem['counts']['curricularAtomic']==422 and sem['counts']['total']==560
# Source fingerprints updated below using the unchanged production helper. No decisions changed.
write('candidate/semantic560.before-exact-normal-alias.json',sem)
qa=exact_copy(a['QAHistoryPlusExactIndependentV1'],'candidate/QA438.exact-author-row-transport.json')
profiles=exact_copy(a['rawProfiles20E0G0'],'candidate/twenty-original-E0G0-profiles.exact.jsonl')
cases=exact_copy(a['wholeCases42'],'materials/forty-two-whole-DE-EN-cases.exact.json')
blank=exact_copy(a['blankOwnRecords'],'materials/blank-own-records.exact.json')
write('candidate/twenty-whole-current560-goals.exact.json',{'goalIds':ids,'goals':[G[i] for i in ids]})
write('CAS.five-original-whole-goals-on-560.exact.json',{'originalCAS':a['wholeCAS'],'before560':mn['canonicalCandidate'],'after560':bind(REL+'/candidate/canonical560.current422.five-sealed-author-CAS.exact.json'),'wholeRows':cas['wholeRows'],'unchangedWholeObjects':555,'all560RequiresAndContainsExact':True,'nonGoalTopLevelExact':True,'newVotes':0,'unselectedChildSplitsAdopted':False})
mp=BASE+'/checks/REBUILD.final-current422.alias50-selected433.physical-map.json';mapping=read(mp)
mapping['sourcePhysicalMap']=bind(mp);mapping['role']='Native20 technical preparation only; exact560/422 basis, original E0/G0 profiles, no review votes/Central'
mapping['executionHost']='tmp/chemie-m7-resumed-20261015/energy20-current422-native560-host-v1'
mapping['buildReceiptPath']='checks/REBUILD.actual-native560-host.json'
normalCan='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
normalSem='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
normalQa='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
overrides={normalCan:REL+'/candidate/canonical560.current422.five-sealed-author-CAS.exact.json',normalSem:REL+'/candidate/semantic560.same-decisions-four-source-bindings.json',normalQa:qa['path'],'curricula/DE/Gymnasium/composition-views/chemie/de-bw-lk.view.json':mn['wholeBWViewCandidate']['path']}
decks=read(rn['currentSixDeckAliases']['path'])['aliases']
for d in decks:overrides[d['normalHostDestination']]=d['candidateSource']['path']
natural=next(d['candidateSource']['path'] for d in decks if d['deckId']=='de_gymnasium_chemistry_natural_q2')
overrides['curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_natural_q2.de.json']=natural
known={r['normalHostAlias'] for r in mapping['aliases']}
for path in overrides:
 if path not in known:mapping['aliases'].append({'normalHostAlias':path,'physicalRepositorySource':{},'rule':'Additional small normal data alias required by exact560 memory deck source; no active write.'})
# semantic binding is generated sequentially before finalizing this map.
for r in mapping['aliases']:
 if r['normalHostAlias'] in overrides:r['physicalRepositorySource']={'path':overrides[r['normalHostAlias']],'pendingProductionSemanticBinding':r['normalHostAlias']==normalSem}
cf='0cf2ffe1-a988-5ffb-ab37-0ac7d58b23dd';image=read(AUTHOR+'/sources/0773-and-0cf2.finite-image-semantics-boundary.json')['0cf2']['image'];verify(image)
primary=next(x['url'] for x in G[cf]['resourceLinks'] if x.get('role')=='primary')
assets=mapping['selectedCurrentAssetRows']
assets=[r for r in assets if r['goalId']!=cf]
assets.append({'goalId':cf,'physicalRepositorySource':image,'normalCanonicalDestination':'curricula/DE/Gymnasium/visualizations/chemie/'+cf+'/'+cf+'.png','normalPublicDestination':'app/public'+primary,'publicMustBePhysicalWithinHostPublicRoot':True,'publicMaterialization':'Physical exact independent-V1-bound PNG; no new vote'})
for r in assets:
 r['publicMustBePhysicalWithinHostPublicRoot']=r['goalId'] in ids
 r['publicMaterialization']='physical exact bytes for native20' if r['goalId'] in ids else 'immutable original source leaf symlink'
mapping['selectedCurrentAssetRows']=assets
physical=[r for r in assets if r['publicMustBePhysicalWithinHostPublicRoot']]
assert len(physical)==19 and len({r['goalId'] for r in physical})==19
mapping['physicalPublicSelectedCount']=19;mapping['physicalPublicSelectedBytes']=sum(r['physicalRepositorySource']['bytes'] for r in physical)
mapping['unselectedPublicLeaves']='Immutable source leaf aliases; no whole public/backend copies'
mapping['normalStockCommands']=['materializeGoalDescriptionRolloutBatch.ts prepare','materializeGoalDescriptionRolloutBatch.ts check']
write('checks/REBUILD.native560.map.pending-semantic.json',mapping)
config={'schemaVersion':1,'bookId':'chemie-energy20-current422-full560-context-20261015-v1','title':'Chemie – vollständiger 560er Kontext für zwanzig Energie- und Waschmittelziele','landscapePath':normalCan,'compositionViewPath':'curricula/DE/Gymnasium/quality/goal-description-review/chemie/review-views/chemie-m7-full-canonical.view.json','semanticKindLedgerPath':normalSem,'goalVisualizationQaPath':normalQa,'publicationMode':'review','atlasBaseUrl':'https://skillpilot.com/lernzielbuch','evidenceReviewPaths':[profiles['path']],'outputPath':REL+'/candidate/full422.in-memory-only.not-materialized.json'}
write('config/whole422.normal-stock-base.config.json',config)
batch={'$schema':'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-rollout-batch-config.schema.json','schemaVersion':1,'batchId':'chemie-energy20-current422-native560-20261015-v1','subject':'chemie','subjectLabel':'Chemie','bookId':'chemie-energy20-current422-native560-20261015-v1','title':'Chemie – Energie und Waschmittel: zwanzig ganze Lernziele','baseGoalBookConfigPath':REL+'/config/whole422.normal-stock-base.config.json','goalIds':ids,'outputDirectory':REL+'/native-twenty','feedbackBaseUrl':'https://skillpilot.com/lernziel-feedback','promptPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/goal-description-understanding-evidence-review-v2.md','criteriaPath':'curricula/DE/Gymnasium/quality/goal-evidence/prompts/chemistry-goal-description-understanding-evidence-review-criteria-v1.md','printDerivativeProfile':'bounded-atlas'}
write('config/native20.normal-prepare-only.config.json',batch)
sourceBindings=[a['wholeSourceCellsAndPartners'],*a['primaryWholePDFContexts'],a['primaryBYWholeUnits'],a['whole69PrerequisitesAndFiveNeighbors'],a['sourceBoundaryDecisions'],a['webPrimaryVerification']]
for r in sourceBindings:verify(r)
inputs={'schemaVersion':1,'role':'Technical exact-input transport only; author material not independently approved','scopeGoalIds':ids,'sealedAuthorSelector':bind(AUTHOR+'/INPUTS.final-Energy20-whole-material.author-selector.json'),'sealedAuthorNeutral':bind(AUTHOR+'/NEUTRAL.final-Energy20-whole-material-author.json'),'sealedAuthorSeal':bind(AUTHOR+'/FILES.finite-author.seal.json'),'before560':mn['canonicalCandidate'],'beforeSemantic560':mn['semanticCandidate'],'memory560AuthorSelector':bind(MEM+'/NEUTRAL.finite-memory-support-selection-author.json'),'correctedSixDeckAliases':rn['currentSixDeckAliases'],'actualWholeM422ReviewerSelector':bind(REV+'/NEUTRAL.finite-targeted-six-independent.json'),'actualWholeM422OriginalRows':rn['whole422M'],'actualWhole75OriginalCardRows':rn['whole75Cards'],'wholeBWView':mn['wholeBWViewCandidate'],'QA438':qa,'wholeCases42':cases,'rawProfiles20E0G0':profiles,'blankOwnRecords':blank,'completePrimarySourcesAndPartnerUnions':sourceBindings,'originalHolds':a['holds'],'originalM4Radius':a['M20CandidateRadius'],'actualIndependent0cf2V1':a['actualIndependent0cf2V1'],'baseline321':bind(BASE+'/checks/CENTRAL.current422.lab2-carbonyl3.stock-report.actual.json'),'normalPublicAssets':physical,'oldNative13InputUsed':False,'newScientificVotes':0,'centralExecuted':False,'activeIntegration':False}
write('INPUTS.exact-original-materials-and-560-basis.json',inputs)
print(json.dumps({'goals':560,'ordinary':422,'wholeCAS':5,'otherWholeObjectsExact':555,'caseCount':len(read(cases['path'])['cases']),'rawProfiles':20,'physicalImages':19,'imageBytes':mapping['physicalPublicSelectedBytes'],'newVotes':0}))
