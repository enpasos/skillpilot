# SPDX-License-Identifier: Apache-2.0
"""Prepare finite exact scientific selections; no central run or new judgment."""
import copy
import datetime
import hashlib
import json
from pathlib import Path

REPO=Path.cwd();OWN=Path(__file__).resolve().parents[1].relative_to(REPO);E=OWN.parent
BASE=E/'chemie-energy18-current422-bounded-inactive-integration-technical-20261015-v1'
NATIVE=E/'chemie-equilibrium16-final-PNG-current422-native-preparation-technical-20261015-v2'
CARB=E/'chemie-carbonyl15-current422-informed-pa-b-20261015-v1'
REVIEWA=E/'chemie-equilibrium16-final-native-fresh-independent-a-20261015-v1'
REVIEWB=E/'chemie-equilibrium16-final-native-fresh-independent-b-20261015-v1'
MROOT=E/'chemie-kinetic-mechanism-one-final-wording-memory-informed-root-20261015-v1'
assert not (OWN/'INPUTS.affected-preparation.selector.json').exists()
for folder in ('checks','config','records','candidate'):(OWN/folder).mkdir(exist_ok=True)
def read(p):return json.loads(Path(p).read_text())
def put(p,x):
    assert not p.exists(),p
    p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
def bind(p):
    p=Path(p);b=p.read_bytes()
    return {'path':str(p),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def entries(p):return [(json.loads(l),l) for l in Path(p).read_text().splitlines(keepends=True) if l.strip()]
baseMap=BASE/'checks/REBUILD.energy18-final.physical-exact-map.v3.json'
nativeMap=NATIVE/'checks/REBUILD.native16.current338-exact-physical-map.json'
mp=read(baseMap);nm=read(nativeMap)
oldAliases={r['normalHostAlias']:r['physicalRepositorySource']['path'] for r in mp['aliases']}
def original(p):return Path(oldAliases.get(str(p),str(p)))
canonicalAlias='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
semanticAlias='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
qaAlias='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
for a in mp['aliases']:
    replacement=next((v for v in nm['aliases'] if v['normalHostAlias']==a['normalHostAlias']),None)
    if a['normalHostAlias'] in (canonicalAlias,semanticAlias,qaAlias):
        assert replacement is not None
        a['physicalRepositorySource']=replacement['physicalRepositorySource']
        a['rule']='Exact final reviewed 52e199/597c71/QA438 context, physical normal data alias only'
assert next(r for r in mp['aliases'] if r['normalHostAlias']==canonicalAlias)['physicalRepositorySource']['sha256']=='sha256:52e199c13f1f0e13ffc148d9babd975e04dbee9b2ac3706fbe3e4b0ab06087d3'
newAssets={r['goalId']:r for r in nm['selectedCurrentAssetRows']}
for i in ('13838147-c26d-54ca-b9be-5f2f0b8e9de5','f0f2c5f8-06f1-5774-a176-d96505727acf'):
    r=copy.deepcopy(newAssets[i]);r['publicMustBePhysicalWithinHostPublicRoot']=True
    mp['selectedCurrentAssetRows']=[x for x in mp['selectedCurrentAssetRows'] if x['goalId']!=i]+[r]
assert len(mp['selectedCurrentAssetRows'])==435
cfg=read(BASE/'config/central.current422.energy18.inactive.final.config.json')
cfg['reportId']='chemie-carbonyl15-equilibrium16-current422-bounded-inactive-20261015-v1'
subject=cfg['subjects'][0]
carbIds=set(read(CARB/'P15.config.json')['scope']['goalIds'])
eqIds=set(read(REVIEWB/'P.config.json')['scope']['goalIds']);allIds=carbIds|eqIds
assert len(carbIds)==15 and len(eqIds)==16 and len(allIds)==31
baseline=read(BASE/'checks/CENTRAL.current422.energy18.stock-report.actual.json')['subjects'][0]
assert len(baseline['strictCompleteGoalIds'])==338 and not allIds.intersection(baseline['strictCompleteGoalIds'])
selections=[];residuals=[]
# Atomicity has five older claims in three mixed old ledgers. Retain each other raw line.
oldAtomicity=[]
for idx,p in enumerate(subject['semanticAtomicityConfigPaths']):
    c=read(original(p));raw=entries(original(c['reviewPath']));over={r['goalId'] for r,_ in raw}&allIds
    if not over:oldAtomicity.append(p);continue
    remaining=[(r,l) for r,l in raw if r['goalId'] not in allIds]
    ledger=OWN/'records'/f'A-old-residual-{idx:02d}.whole-exact.jsonl'
    ledger.write_text(''.join(l for _,l in remaining))
    c['scope']={'label':c['scope']['label']+'; exact old residual excluding independently reviewed31', 'leafGoalIds':[r['goalId'] for r,_ in remaining]}
    c['reviewPath']=str(ledger);target=OWN/'config'/f'A-old-residual-{idx:02d}.normal.config.json';put(target,c)
    oldAtomicity.append(str(target))
    residuals.append({'sourceConfig':bind(original(p)),'sourceWholeLedger':bind(original(read(original(p))['reviewPath'])),
        'residualConfig':bind(target),'residualWholeLedger':bind(ledger),'withdrawnOlderClaimGoalIds':sorted(over),
        'remainingRawLinesExact':len(remaining),'newScientificVotes':0})
assert len(residuals)==3 and sum(len(r['withdrawnOlderClaimGoalIds']) for r in residuals)==5
subject['semanticAtomicityConfigPaths']=oldAtomicity
# No earlier P or D claims may silently override the genuine new dissent.
for p in subject['positiveEvidenceConfigPaths']:
    c=read(original(p));assert not allIds.intersection(c['scope']['goalIds'])
for p in subject['resolutionIndexPaths']:
    assert not allIds.intersection(r['goalId'] for r in read(original(p))['resolutions'])
def scientificConfig(label,kind,source,selectedIds=None):
    c=read(source);raw=entries(c['reviewPath'])
    chosen=[(r,l) for r,l in raw if selectedIds is None or r['goalId'] in selectedIds]
    if selectedIds is not None:assert {r['goalId'] for r,_ in chosen}==selectedIds
    ledger=OWN/'records'/f'{label}.{kind}.whole-science-exact.jsonl';ledger.write_text(''.join(l for _,l in chosen))
    c['landscapePath']=canonicalAlias
    if kind=='P':c['semanticKindLedgerPath']=semanticAlias;c['scope']['goalIds']=[r['goalId'] for r,_ in chosen]
    else:c['scope']={'label':c['scope']['label'],'leafGoalIds':[r['goalId'] for r,_ in chosen]}
    c['reviewPath']=str(ledger);target=OWN/'config'/f'{label}.{kind}.science-exact.normal.config.json';put(target,c)
    subject['positiveEvidenceConfigPaths' if kind=='P' else 'semanticAtomicityConfigPaths'].append(str(target))
    selections.append({'label':label,'kind':kind,'originalConfig':bind(source),'originalLedger':bind(read(source)['reviewPath']),
        'selectedConfig':bind(target),'selectedLedger':bind(ledger),'selectedGoalIds':[r['goalId'] for r,_ in chosen],
        'wholeRawRowsExact':True,'newScientificVotes':0})
scientificConfig('carbonyl15','P',CARB/'P15.config.json')
scientificConfig('carbonyl15','A',CARB/'A15.config.json')
pa=entries(REVIEWA/'P.records.jsonl');pb=entries(REVIEWB/'P.review.jsonl')
assert {r['goalId'] for r,_ in pa}=={r['goalId'] for r,_ in pb}==eqIds
# E0/G0 design gaps remain unselected. The production P checker alone does not imply G1.
holds={r['goalId'] for r,_ in pa+pb if r['evidenceLevel']!='E1'}
assert holds=={'b7521ac7-4ad1-5e63-96ca-4c6c9b2b1e0b','1a51362e-fd84-5964-89b5-b435772c2149','0c9fe376-0fbd-5dc1-b8d4-d56d658a00e3','13838147-c26d-54ca-b9be-5f2f0b8e9de5'}
positive=eqIds-holds;assert len(positive)==12
normalA=read(REVIEWB/'P.config.json')
normalA['reviewId']=pa[0][0]['reviewId'];normalA['reviewPath']=str(REVIEWA/'P.records.jsonl')
normalA['reviewRunManifestPaths']=[str(REVIEWA/'P.run.json')]
normalA['scope']['label']='Normal address transport of exact original independent A16 scientific rows and original A run; no new review'
normalASource=OWN/'config/source-original-A16.normal-address-only.config.json';put(normalASource,normalA)
scientificConfig('equilibrium12','P',normalASource,positive)
# The source A run continues to bind the exact original full16 output, not a fabricated subset run.
assert read(OWN/'config/equilibrium12.P.science-exact.normal.config.json')['reviewId']==pa[0][0]['reviewId']
scientificConfig('equilibrium16','A',REVIEWB/'A.config.json')
subject['memoryReviewConfigPath']=str(MROOT/'config/M422.whole-ten-scopes.final138-wording.config.json')
put(OWN/'checks/SELECTION.actual-conservative-P-and-A.json',{
    'role':'Informed finite selection of existing genuine scientific rows, no new reviews',
    'selections':selections,'oldAtomicityResiduals':residuals,
    'PExplicitlyNotSelectedGoalIds':sorted(holds),'PUnresolvedReasonsFromOriginalA':bind(REVIEWA/'P-FIRST.independent-science.md'),
    'PUnresolvedReasonsFromOriginalB':bind(REVIEWB/'FIRST.p16.independent-b.json'),
    'rule':'Select P only when both independent scientific judgments found E1; retain the union of actual E0/G0 dissent. Whole selected A raw rows remain exact. Original A/B complete ledgers remain unchanged.',
    'expectedSelectedNewP':27,'expectedSelectedNewA':31,'previous338Untouched':True,'newScientificVotes':0})
put(OWN/'config/central.current422.prepared-awaiting-D16.inactive.config.json',cfg)
mp.update({'executionHost':'tmp/chemie-m7-resumed-20261015/carbonyl15-equilibrium16-current422-integration-host-v1',
    'role':'Prepared check-only exact inactive338 successor; no native rendering, central awaits final D16 pair',
    'sourceCurrent338Map':bind(baseMap),'sourceFinalNative16Map':bind(nativeMap),
    'maxCacheBytes':16000000,'physicalPublicSelectedCount':2,'physicalPublicSelectedBytes':sum(r['physicalRepositorySource']['bytes'] for r in mp['selectedCurrentAssetRows'] if r['publicMustBePhysicalWithinHostPublicRoot']),
    'fullCentralAllowed':False,'nativeRendererAssigned':False,'normalStockCommands':0,
    'finalCentralConfig':None,'actualReadyInputs':[]})
put(OWN/'checks/REBUILD.current422.prepared.physical-map.json',mp)
helper=(BASE/'scripts/rebuild_final_sparse_host.readonly-v3.py').read_text().replace('checks/REBUILD.energy18-final.physical-exact-map.v3.json','checks/REBUILD.current422.prepared.physical-map.json')
(OWN/'scripts/rebuild_prepared_host.readonly.py').write_text(helper)
put(OWN/'INPUTS.affected-preparation.selector.json',{'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role':'Affected scientific selections prepared for current52 context; central expressly not run',
    'baseline338Report':bind(BASE/'checks/CENTRAL.current422.energy18.stock-report.actual.json'),
    'canonicalAndAssetSourceMap':bind(nativeMap),'preparedConfig':bind(OWN/'config/central.current422.prepared-awaiting-D16.inactive.config.json'),
    'physicalMap':bind(OWN/'checks/REBUILD.current422.prepared.physical-map.json'),
    'scientificSelections':bind(OWN/'checks/SELECTION.actual-conservative-P-and-A.json'),
    'scope31GoalIds':sorted(allIds),'newScientificVotes':0,'strictCountClaimed':False,'centralExecuted':False,
    'activeIntegration':False,'HumanApproval':False,'M7Grant':False})
print(json.dumps({'prepared':str(OWN),'newPSelected':27,'newASelected':31,'PDesignHolds':sorted(holds),'centralRuns':0}))
