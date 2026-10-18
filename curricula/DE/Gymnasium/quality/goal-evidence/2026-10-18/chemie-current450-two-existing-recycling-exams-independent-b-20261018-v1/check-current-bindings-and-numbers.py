# SPDX-License-Identifier: Apache-2.0
"""Finite exact-body/P-context evidence for two existing paper assessments."""
import hashlib, json, pathlib
O = pathlib.Path(__file__).resolve().parent.relative_to(pathlib.Path.cwd())
def read(p): return json.loads(pathlib.Path(p).read_text())
def pin(p):
    p = pathlib.Path(p)
    b = p.read_bytes()
    return dict(path=p.as_posix(), sha256=hashlib.sha256(b).hexdigest(), bytes=len(b))
def digest(x):
    return hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
s = read(O/'INPUT.exact-five-goals-two-active-P-records-four-bound-cases.json')
assert pin(s['canonical']['path']) == s['canonical']
assert pin(s['selectedCaseSourceFile']['path']) == s['selectedCaseSourceFile']
G = {g['id']:g for g in s['goals']}
cases = {c['caseId']:c for c in s['selectedWholeFourCases']}
source = read(s['selectedCaseSourceFile']['path'])
assert all(c in source['cases'] for c in s['selectedWholeFourCases'])
bindings = []
for eid in ['c5394fb8-9411-5533-b2af-831c4c67b4be','4238e88b-7d6c-5eef-b94f-d6d87659649e']:
    g = G[eid]
    d = g['examData']
    binding = g['extendedData']['assessmentCaseBinding']
    case = cases[binding['defaultCaseId']]
    assert g['requires'] == d['coveredGoalIds'] == [case['goalId']]
    for task, lang in [('taskContent','De'),('taskContentEn','En')]:
        assert d[task] == case['data'+lang]+'\n\n'+case['task'+lang]
    assert d['solutionContent'] == case['modelAnswerDe']
    assert d['solutionContentEn'] == case['modelAnswerEn']
    assert d['scoring']['maxPoints'] == d['scoring']['passingPoints'] == sum(r['points'] for r in d['scoring']['steps']) == 6
    assert len(d['scoring']['steps']) == 3
    assert [r['id'] for r in d['scoring']['steps']] == binding['allEssentialExpectationIds'] == ['e1','e2','e3']
    for row, cr in zip(d['scoring']['steps'],case['rubric']):
        assert row['points'] == cr['maximumPoints'] == 2
        assert row['description'] == ' '.join(cr[k+'De'] for k in ['fullCredit','partialCredit','zeroCredit'])
    bindings.append(dict(examGoalId=eid,wholeCurrentGoalSHA256=digest(g),wholeExamDataSHA256=digest(d),sourceArtifact=s['selectedCaseSourceFile'],defaultCaseId=case['caseId'],sourceCaseJSONPointer='/cases/'+str(next(i for i,z in enumerate(source['cases']) if z['caseId']==case['caseId'])),wholeDefaultCaseSHA256=digest(case),taskDESourceConcatenationExact=True,taskENSourceConcatenationExact=True,solutionsDEENExact=True,allThreeScoringStepsAndAllLevelsExact=True,caseSpecificScoreBar=[6,6],alternativeCases=binding['boundAlternativeCaseIds']))
for profile in s['activeWholePRecords']:
    assert pin(profile['activeConfig']['path']) == profile['activeConfig']
    assert pin(profile['nativeFile']['path']) == profile['nativeFile']
    config = read(profile['activeConfig']['path'])
    assert profile['goalId'] in config['scope']['goalIds']
    native = json.loads(pathlib.Path(config['reviewPath']).read_text().splitlines()[profile['lineOneBased']-1])
    assert native == profile['wholeNativeRecord']
    for brief in native['profile']['applicationCaseBriefs']:
        case = cases[brief['id']]
        for lang in ['De','En']:
            assert brief['taskDemand'+lang] == case['task'+lang]
            assert brief['expectedPerformance'+lang] == case['modelAnswer'+lang]
            assert brief['understandingFocus'+lang] == ' / '.join(r['criterion'+lang] for r in case['rubric'])
cluster = G['5964272f-e835-5a24-b2b1-c162be6b75cb']
appends = [b['examGoalId'] for b in bindings]
assert not set(appends) & set(cluster['contains'])
assert all(not G[e]['contains'] for e in appends)
candidate = cluster['contains'] + appends
assert len(set(candidate)) == len(candidate) == 7
calculations = dict(
    scoresEach=dict(stepWeights=[2,2,2],sum=6,passingPoints=6,maxWithOneCriterionAtOnePoint=5,maxWithOneOmittedCriterion=4),
    batteryMetalBasis100=dict(PRecovered=60,PMetalResidual=40,QRecovered=90,QMetalResidual=10,QStarRecovered=100,QStarMetalResidual=0,positiveEnergyNotNumericallySpecified=True,electrolyteAndNonmetalWasteNotZeroed=True),
    rareMetalEqualYield=dict(oreFractions=[.005,.0005],BtoAOreMassRatio=.005/.0005,formula='A=1/(0.005*r)kg; B=1/(0.0005*r)kg for common unknown0<r<=1. No absolute ore mass required by the task.',illustrationOnlyAtYield1=[1/.005,1/.0005],illustrationOnlyAtYieldHalf=[1/(.005*.5),1/(.0005*.5)],noTenfoldEnergyOrOverallImpactInference=True),
    alternativeCaseContexts=dict(batteryAminusBRecoveryPercentagePoints=[30,30],energyAminusB=10,rareMetalPartialIndices=[10,40],partialIndexRatioNotWholeBoundaryComparison=4))
result = dict(role='FINITE_ACTUAL_EXAM_CONTEXT_COMPARISON_AND_OWN_ARITHMETIC_NOT_P_REVIEW',bindings=bindings,actualActivePProfiles=2,allFourPBriefsExactlyBoundToWholeCases=True,priorPScienceNotRepeatedOrRelabelled=True,canonicalPracticeContainsBefore=cluster['contains'],proposedAppendOnlyContainsAfter=candidate,containsCycleFromTheseAppendsImpossibleBecauseBothChildrenHaveEmptyContains=True,noRequiresOrBodyOrScopeChange=True,ownIndependentCalculations=calculations,normalWrites=0,compilerBuildOrCentralRuns=0)
out = O/'CHECK.actual-two-default-bodies-P-bindings-scores-and-reasoning.json'
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(check=pin(out),defaultBindings=len(bindings),PBriefsExact=4,proposedContainsCount=7,normalWrites=0),indent=2))
