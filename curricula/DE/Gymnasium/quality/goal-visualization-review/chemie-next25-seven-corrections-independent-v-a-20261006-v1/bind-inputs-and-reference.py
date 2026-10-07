# Apache-2.0. Read-only input guard; only writes this independent V-A dossier.
from pathlib import Path
import json, hashlib, datetime, urllib.request
repo=Path.cwd()
own=repo/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-seven-corrections-independent-v-a-20261006-v1'
author=repo/'curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-next25-seven-proven-defects-correction-author-20261006-v1'
rawpath=author/'seven-selected-actual-pngs-and-current-goals.raw-independent-review-input.json'
raw=json.loads(rawpath.read_text())
freeze=author/'seven-proven-raster-corrections.author-v1.final.freeze.json'
def sha(p): return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(p): return {'path':str(p.relative_to(repo)), 'sha256':sha(p), 'bytes':p.stat().st_size}
assert sha(freeze)=='sha256:22bdccf0580f09524039f67aa95a635c74c8bd22efee5b12d76d3f9e92965284'
checks=[]
for x in json.loads(freeze.read_text())['files']:
    p=repo/x['path']
    checks.append({'expected':x,'actual':bind(p),'exact':bind(p)==x})
assert len(checks)==70 and all(x['exact'] for x in checks)
canonpath=repo/raw['currentCanonical']['path']
goals={g['id']:g for g in json.loads(canonpath.read_text())['goals']}
rows=[]
for row in raw['rows']:
    assert goals[row['goalId']]==row['wholeCurrentGoal']
    refs=[]
    for x in [row['selectedPNG']]+row['originalSourceFrontendBackendExactBefore']:
        actual=bind(repo/x['path'])
        assert actual==x
        refs.append(actual)
    rows.append({'goalId':row['goalId'],'wholeCurrentGoal':goals[row['goalId']], 'wholeCurrentGoalExactToAuthorRaw':True,'selectedPNG':refs[0],'originalSourceFrontendBackend':refs[1:], 'actualOriginalAndSelectedRasterSight':True,'viewMechanism':'tools.view_image; all original and selected actual images; additional original detail:original views for ions/lattice-energy/mesomerie', 'originalNativePixels':[2752,1536],'originalDefaultViewerDisplayPixels':[2048,1143]})
inputs=[rawpath,freeze,canonpath,repo/raw['strictReport']['path'],repo/'AGENTS.md',repo/'docs/concept/skill-graph/atomic-goal-visualizations.md',repo/'app/src/components/GoalCard.tsx']
for p in sorted((repo/'curricula/DE/Gymnasium/canonical').glob('DE_DEU_S_GYM_CANONICAL_*.de.json')):
    if any(n in p.name for n in ['BIOLOGIE','MATHEMATIK','PHYSIK']): inputs.append(p)
for p in sorted((repo/'curricula/DE/Gymnasium/quality/goal-visualization-qa').glob('*.qa.json')): inputs.append(p)
report=json.loads((repo/raw['strictReport']['path']).read_text())
protected=[{'subject':s['subject'],'strictCompleteGoalIds':s['strictCompleteGoalIds'],'count':len(s['strictCompleteGoalIds'])} for s in report['subjects']]
chem_ids=next(s['strictCompleteGoalIds'] for s in protected if s['subject']=='chemie')
receipt={'schemaVersion':1,'documentType':'independent-machine-V-A-inputs-and-actual-read-sight-receipt','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'independence':{'role':'not image author; machine V-A','peerBFilesRead':False,'authorVerdictsAdopted':False,'authorFreezeCheckedBeforeImageReview':True,'authorRawContainsAuthorAssertions':'Those assertions are input history; only own direct raster/browser observations determine this review.'}, 'authorFreeze':bind(freeze),'authorOwnFilesCount':70,'authorOwnFilesExactChecks':checks,'inputBindingsBefore':list(map(bind,inputs)), 'currentStrictSetsReadFromActualReport':protected,'selectedSevenOutsideCurrentStrict127':all(r['goalId'] not in chem_ids for r in rows),'rows':rows,'scopeLimits':{'isolatedBrowserQAOnly':True,'fullAppQA':False,'nativeBookPageQA':False,'curricularSourcePReview':False,'newSourceOrPApproval':False,'newHumanApproval':False,'newScientificStrictClosure':False,'imageGeneration':False,'activeWrites':0,'subagentsStarted':0,'globalBuildsOrCentralRuns':0}}
(own/'independent-v-a.inputs-and-sight.receipt.json').write_text(json.dumps(receipt,ensure_ascii=False,indent=2)+'\n')
source=own/'nist-primary-reference-html'
source.mkdir(exist_ok=True)
refs=[]
for symbol,name,ev,shown in [('Li','lithium',5.391719,520),('Be','beryllium',9.32270,900),('B','boron',8.29802,801),('C','carbon',11.26030,1086),('N','nitrogen',14.5341,1402),('O','oxygen',13.61805,1314),('F','fluorine',17.4228,1681),('Ne','neon',21.56454,2081)]:
    url=f'https://physics.nist.gov/PhysRefData/Handbook/Tables/{name}table1.htm'
    request=urllib.request.Request(url,headers={'User-Agent':'Independent scientific image review'})
    with urllib.request.urlopen(request,timeout=20) as response: data=response.read()
    p=source/f'{symbol}.html'
    p.write_bytes(data)
    refs.append({'element':symbol,'url':url,'actualRetrievedHTML':bind(p),'neutralAtomFirstIonizationEnergyEV':ev,'convertedKJPerMol':ev*96.4853321233, 'conversion':'eV per atom times e*N_A/1000 = 96.4853321233 kJ/mol per eV; calculation is reviewer inference', 'shownRoundedKJPerMol':shown,'matchesRoundedReference':round(ev*96.4853321233)==shown})
assert all(r['matchesRoundedReference'] for r in refs)
(own/'independent-v-a.nist-first-ionization-energy.actual-reference.json').write_text(json.dumps({'schemaVersion':1,'createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'supporting scientific reference for V image plot only; no curriculum-source approval/P', 'rows':refs,'originalNPlotWrongOHeight':True,'selectedNPlotRelativeOrderingCorrect':True},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'inputsBound':len(inputs),'authorFilesExact':len(checks),'wholeCurrentGoalsExact':len(rows),'protected':[(s['subject'],s['count']) for s in protected],'nistActualHTML':len(refs),'allEightRoundedNumbersCorrect':True}))
