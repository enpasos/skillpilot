#!/usr/bin/env python3
"""Read-only independent checks; writes only the two named B review receipts."""
from pathlib import Path
import hashlib
import json
import math
from collections import Counter

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
AUTHOR = BASE / 'chemie-b008-twenty-six-positive-materials-author-v8'
V7 = BASE / 'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7'
FREEZE_SHA = 'a86b11b5de0ea0e858468bc37dccdbdda06f0d4c2461dc10e9cd8eea57ac97e1'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def dump(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

fp = AUTHOR / 'author-materials-v8.final.freeze.json'
assert sha(fp) == FREEZE_SHA
freeze = json.loads(fp.read_text())
bindings = []
for section in ['ownFiles', 'externalInputBindings']:
    for row in freeze[section]:
        p = ROOT / row['path']
        actual = sha(p)
        assert actual == row['sha256'], row['path']
        assert p.stat().st_size == row['bytes'], row['path']
        mode = 'hash_only'
        if section == 'ownFiles' and p.name != 'materialize-author-materials.py':
            mode = 'actual_body_read'
        if p.name == 'four-targeted-prototypes.author-v7.final.freeze.json' or p.name == 'twenty-six-atomic-boundaries.de-en.author-proposal.json' or p.name == 'effective-source-input-controls.json' or p.name == 'actual-K11-primary-line-reference.correction.json':
            mode = 'actual_body_read'
        if 'primary-inputs/' in row['path']:
            mode = 'actual_selected_primary_lines_read'
        if 'all-national-original-nine-source-obligations' in p.name:
            mode = 'metadata_and_direct_binding_count_only; no 1646-row scientific reapproval'
        bindings.append({**row, 'actualSha256': actual, 'exact': True, 'reviewAccess': mode})

cases_doc = json.loads((AUTHOR / 'fifty-two-cases.de-en.author-candidate.json').read_text())
profiles_doc = json.loads((AUTHOR / 'twenty-six-positive-profiles.de-en.author-candidate.json').read_text())
atoms = json.loads((V7 / 'twenty-six-atomic-boundaries.de-en.author-proposal.json').read_text())['atoms']
cases, profiles = cases_doc['cases'], profiles_doc['profiles']
assert len(cases) == 52 and len(profiles) == len(atoms) == 26
assert len({c['caseKey'] for c in cases}) == 52
assert len({p['candidateKey'] for p in profiles}) == 26
case_by_key = {c['caseKey']: c for c in cases}
atom_by_key = {a['candidateKey']: a for a in atoms}
criteria = [r for c in cases for r in c['requiredAssessmentCriteria']]
assert len(criteria) == len({r['criterionKey'] for r in criteria}) == 173
assert sum('moderatorProtocol' in c for c in cases) == 14
assert len({c['originalFamilyGoalId'] for c in cases}) == 9
for c in cases:
    assert c['candidateGoalId'] is None
    assert (c['status'], c['reviewStatus'], c['evidenceLevel'], c['generationLevel']) == ('ai_candidate','needs_human_review','E1','G1')
    for k in ['learnerPerformanceRecorded','humanApproval','humanTrial','nativeEvidenceApproved']:
        assert c[k] is False, (c['caseKey'], k)
    assert c['strictCompletionsAdded'] == 0
    for k in ['suppliedMaterial','learnerTask','expectedAnswer','transfer']:
        assert set(c[k]) == {'de','en'} and all(c[k][l] for l in ['de','en'])
    assert c['sourceOperatorScopeContractDe'] == atom_by_key[c['candidateKey']]['sourceOperatorScopeContractDe']
    if 'moderatorProtocol' in c:
        q = c['moderatorProtocol']
        if 'performedNow' in q:
            assert q['performedNow'] is False
        elif q['kind'] == 'requires_own_prior_physical_execution':
            assert q['actualPriorReceiptSuppliedNow'] is False
        elif q['kind'] == 'actual_research_product_required':
            assert q['externalSourceActuallyReadNowByLearner'] is False
        else:
            raise AssertionError((c['caseKey'], 'unknown execution assertion'))
for p in profiles:
    a = atom_by_key[p['candidateKey']]
    assert p['goalId'] is None
    assert len(p['caseKeys']) == 2
    assert all(case_by_key[k]['candidateKey'] == p['candidateKey'] for k in p['caseKeys'])
    assert p['descriptionBindingCandidate'] == p['essentialUnderstanding'] == {'de':a['descriptionDe'],'en':a['descriptionEn']}
    assert p['sourceScopeContractDe'] == a['sourceOperatorScopeContractDe']
    assert p['all1646OriginalNationalSourceObligationsRetainedWithUnchangedActualStatus'] is True
    assert p['globalSourceClearance'] is False
    assert p['finalNativeGoalPageSourceContextBindingPending'] is True
    assert p['nativePositiveUnderstandingEvidenceV2Approval'] is False
    assert p['humanApproval'] is False and p['humanTrial'] is False and p['strictCompletionsAdded'] == 0
assert Counter(c['candidateKey'] for c in cases) == Counter({p['candidateKey']:2 for p in profiles})
national = json.loads((ROOT / next(r['path'] for r in freeze['externalInputBindings'] if 'all-national-original-nine-source-obligations' in r['path'])).read_text())
assert len(national['directBindings']) == 1646
assert national['scientificMappingApproval'] is False

def regression(xs, ys):
    mx, my = sum(xs)/len(xs), sum(ys)/len(ys)
    m = sum((x-mx)*(y-my) for x,y in zip(xs,ys))/sum((x-mx)**2 for x in xs)
    b = my - m*mx
    residual = [y-(m*x+b) for x,y in zip(xs,ys)]
    return {'slope':m,'intercept':b,'residuals':residual}

cal = regression([0,2,4,6],[.010,.170,.330,.490])
logs = [math.log(c/.1000) for c in [.1000,.06065,.03679,.02231]]
kin = regression([0,10,20,30], logs)
changed_logs = [math.log(c/.1000) for c in [.1000,.06065,.0500,.02231]]
changed_kin = regression([0,10,20,30], changed_logs)
q = lambda x: (1+x)**2/((2-x)*(1-x))
calculations = {
 'role':'independent arithmetic from literal supplied values, not author self-check adoption',
 'notActualExperiment':True,
 'weakAcidTenfoldDilution':{'hydrogenConcentrationRatio':1/math.sqrt(10),'deltaPH':-math.log10(1/math.sqrt(10)),'strongAcidDeltaPH':1.0,'bounds':'weak-acid low-dissociation approximation; fixed acid/temperature; water contribution negligible'},
 'dissolutionMeansSeconds':[(90+94)/2,(65+63)/2,(48+50)/2],
 'dissolutionTransfer50C':{'meanSeconds':(80+45)/2,'halfRangeSeconds':(80-45)/2,'interpretation':'large repeat disagreement; no warranted trend conclusion before conditions checked'},
 'acidTitration':{'cAMolPerL':.0100*8.00/10.00,'cBMolPerL':.0100*16.00/10.00,'BOverA':16.00/8.00,'bounds':'monoprotic 1:1; volumes consistent; common base-concentration error scales absolute values but cancels ratio'},
 'linearCalibration':{**cal,'slopeUnits':'L/mg; absorbance dimensionless','sampleMeanAbsorbance':(.291+.289)/2,'dilutedMgPerL':(.290-.010)/.080,'originalAfterTwofoldDilutionMgPerL':(.290-.010)/.080*2,'scatterHalfRangeDilutedMgPerL':.001/.080,'scatterHalfRangeOriginalMgPerL':2*.001/.080,'bounds':'these scatter-only values exclude standards, blank, pipette, regression and sample uncertainties'},
 'photometricTransfers':{'A0650DiagnosticExtrapolationMgPerL':(.650-.010)/.080,'A0810DiagnosticExtrapolationMgPerL':(.810-.010)/.080,'bothOutsideCalibratedZeroToSixMgPerL':True,'twofoldDilutionOfHypotheticalTenMgPerL':{'dilutedMgPerL':5,'predictedModelAbsorbance':.010+.080*5,'backCalculatedMgPerL':5*2},'bounds':'out-of-range raw absorbance is no validated concentration; actual diluted measurement and actual calibration needed; dilute blank-corrected signal, not total absorbance'},
 'firstOrderKinetics':{'logs':logs,**kin,'kPerMin':-kin['slope'],'halfLifeMin':math.log(2)/(-kin['slope']),'transferChanged20Min':{**changed_kin,'logDeviationFromOriginalModelAt20Min':math.log(.05/.1)-(kin['slope']*20+kin['intercept'])},'bounds':'isothermal supplied model; linearity does not establish unique mechanism; small original residuals from rounded inputs'},
 'conductivityMaterialScaleFailure':{'case14StatedAtOneGramPerL_uSPerCm':199,'primaryHachStandardAtOneGramPerL25C_uSPerCm':1990,'ratio':1990/199,'temperatureCaseBMinusA_uSPerCm':230-180,'controlBMinusA35_uSPerCm':230-228,'qualitativeConfoundConclusionStillCorrect':True,'unitsNeedScientificCorrection':True},
 'validityRateCounterexample':{'8point9Over3':8.9/3,'3point1To6point2Ratio':6.2/3.1},
 'packagingMassRatios':{'glassToMetal':200/40,'glassToPolymer':200/20},
 'filterAbsorbanceReductionPercent':100*(.400-.100)/.400,
 'solubilityModel':{'pH':[3,4,5],'ionizedToNeutral':[10**(p-4) for p in [3,4,5]],'totalMgPerL':[1*(1+10**(p-4)) for p in [3,4,5]],'endOverStart':11/1.1,'relativeIncreasePercent':100*(11-1.1)/1.1,'bounds':'fictional monoprotic acid; intrinsic neutral solubility; same-scaffold mass equivalents; no precipitated additional salt; no clinical inference'},
 'processResourceUse':{'A_freshKgPerAcceptedKg':100/20,'A_kWhPerAcceptedKg':50/20,'B_freshKgPerAcceptedKg':40/18,'B_kWhPerAcceptedKg':63/18,'B_accepted20_transferFreshKgPerKg':40/20,'B_accepted20_transferKWhPerKg':63/20,'bounds':'do not count internally recovered 60 kg as fresh; accepted product denominator; unlike units are not additive'},
 'waterTreatmentComparison':{'GMinusFCostEuros':45-30,'GMinusFEnergyKWh':40-20,'removalDifferencePercentagePoints':95-70,'GChangedEnergySavingVersusF':20-18},
 'reusablePackagingComparison':{'tenCycleMaterialSavingKg':40-20,'twoCycleExtraMaterialKg':100-40,'extraCostEuros':120-100,'bounds':'transport/wash/material units need impact factors before environmental aggregation'},
 'equilibriumModel':{'QAfterAddition':q(0),'Qx010':q(.10),'Qx020':q(.20),'K1SolutionX':.20,'K2TransferSolutionRelativeToPostAdditionStateX':4-math.sqrt(13),'K2TransferSolutionRelativeToK1StateFurtherX':4-math.sqrt(13)-.20,'bounds':'fixed stoichiometry/volume; ideal concentration convention; x must keep concentrations positive; temperature changes K separately from rate'},
 'receptorOccupancy':{'Kd_uMolPerL':2,'freeLigand_uMolPerL':[0,2,6],'theta':[l/(2+l) for l in [0,2,6]],'bounds':'equilibrium free ligand, identical independent 1:1 sites, negligible depletion as simple model; occupancy is not activation or medical efficacy'},
 'stoichiometry':{'hydrogenWaterCardAtoms':{'H':4,'O':2},'ammoniaReactantAtoms':{'N':2,'H':6},'ammoniaProductAtoms':{'N':2,'H':6},'esterHydrolysis':'R-C(=O)-O-Rprime + H2O -> R-C(=O)-OH + Rprime-OH; enzyme catalytic, not stoichiometrically consumed'}
}
dump('independent-calculations.actual.json',calculations)
dump('actual-input-bindings-and-consistency.json',{
 'reviewer':'independent-B; v7 B reviewer, not v8 author','authorFreezePath':str(fp.relative_to(ROOT)),'authorFreezeSha256':FREEZE_SHA,
 'ownFileBindingsExact':13,'externalInputBindingsExact':14,'bindings':bindings,
 'all52CaseBodiesAndBothLanguagesRead':True,'all26ProfileBodiesRead':True,'criterionCount':173,'all173BilingualCriteriaRead':True,'moderatorProtocolCount':14,
 'protocolKinds':dict(Counter(c['moderatorProtocol']['kind'] for c in cases if 'moderatorProtocol' in c)),
 'v7DescriptionBodiesWordExact':26,'v7SourceScopeContractsWordExact':26,'allCaseSourceContractsMatchV7':True,'allCasesNullNativeIdsAndTruthfulE1G1Flags':True,
 'caseIdentifierFieldActuallyPresent':'caseKey; no caseId field exists in author JSON','nationalOriginalDirectBindingCount':1646,'nationalMappingScientificApproval':False,
 'allNationalRowsScientificallyReviewedThisTurn':False,'peerConclusionBodiesRead':False,'authorGeneratorUsedAsPerformanceEvidence':False,
 'historicOwnBv6AndBv7FilesChanged':False,'activeFilesWritten':False,'globalBuildRun':False,'nativeApproval':False,'humanApproval':False,'humanTrial':False,'strictCompletionsAdded':0,
 'recordedProtectedCurrentBaseline':{'Chemie':'112/378','Biologie':'67/383','Mathematik':'807/807','Physik':'478/478'},
 'baselineNature':'preserved frozen input, no new central build or native approval asserted'
})
print(json.dumps({'status':'pass read-only input consistency; material science verdict is separate','ownFiles':13,'externalBindings':14,'cases':52,'profiles':26,'criteria':173,'protocols':14,'calculationReceipt':'independent-calculations.actual.json'},ensure_ascii=False))
