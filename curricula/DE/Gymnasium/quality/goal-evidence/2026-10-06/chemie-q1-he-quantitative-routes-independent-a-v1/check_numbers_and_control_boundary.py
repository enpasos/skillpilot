# SPDX-License-Identifier: Apache-2.0
"""Independent arithmetic and adversarial boundaries for the two new tasks."""
from decimal import Decimal as D
from pathlib import Path
import json
from datetime import datetime, timezone

OUT = Path(__file__).resolve().parent
volumes = [D('16.00'), D('16.10'), D('15.90')]
corrected = [v - D('1.00') for v in volumes]
acid = [D('0.000500') * (v / 1000) / D('0.01000') * (D('100.0') / D('5.00')) * D('176.12') for v in corrected]
areas = [D('24100'), D('24220'), D('23980')]
paraben_diluted = [(a - 100) / 1200 for a in areas]
paraben = [c * (D('100.0') / D('1.00')) for c in paraben_diluted]
mean_acid = sum(acid) / len(acid)
mean_paraben = sum(paraben) / len(paraben)
assert mean_acid == D('2.64180000')
assert mean_paraben == D('2000')
assert all(0 <= c <= 25 for c in paraben_diluted)
for c, a in zip([0, 5, 15, 25], [100, 6100, 18100, 30100]):
    assert 1200 * c + 100 == a
temperature_crossing = D('10') + (D('0.03') - D('0.02')) / (D('0.04') - D('0.02')) * D('12')
assert temperature_crossing == 16
assert D('0.15') < min(D('0.25'), D('0.30'))
assert D('0.03') > D('0.02') and D('0.03') < D('0.04')
assert D('0.15') < D('0.20') and D('0.03') < D('0.05')
assert all(n <= 1000 for n in [200, 250, 300, 40, 50, 60])
assert all(n > 1000 for n in [90000, 100000, 110000])

# An unstated reference-acceptance rule permits opposite verdicts for the
# same frozen 99% control. These illustrative bands are counterexamples,
# not a proposed genuine laboratory acceptance specification.
wide_pass = D('98') <= D('99') <= D('102')
tight_pass = D('99.5') <= D('99') <= D('100.5')
assert wide_pass and not tight_pass
result = {
    'schemaVersion': 1,
    'checkedAtUTC': datetime.now(timezone.utc).isoformat(),
    'status': 'Arithmetic PASS; quantitative control-acceptance material underspecification confirmed',
    'ascorbic': {'blankCorrectedVolumesML': [str(x) for x in corrected], 'individualOriginalGL': [str(x) for x in acid], 'meanOriginalGL': str(mean_acid), 'dilutionFactor': 20, 'stoichiometry': '1:1 supplied reaction balanced in atoms and net charge'},
    'methylparaben': {'individualDilutedMGL': [str(x) for x in paraben_diluted], 'individualOriginalMGL': [str(x) for x in paraben], 'meanOriginalMGL': str(mean_paraben), 'dilutionFactor': 100, 'calibrationAllFourStandardsConsistent': True, 'allThreeSamplesWithinRange': True, 'interceptSubtractedExactlyOnce': True},
    'parabenUse': {'MMeetsAllThreeFictionalCriteria': True, 'PMeetsMicrobialAndAmountCriteriaButFailsLowTemperatureSolubility': True, 'PLinearModelCrossingTemperatureC': str(temperature_crossing), 'MInterpolatedWholeIntervalSolubilityProofRequiresExplicitLinearAssumption': True, 'old21PointThresholdWithoutPConflictCouldPass': 21 >= 21, 'new24PointThresholdWithoutPConflictCannotPass': 21 < 24, 'lowerPropylDoseIsUntestedNewRecipe': True},
    'essentialOmissionChecks': [
        {'omittedEssential': 'P solubility conflict', 'maximumPointsUnderStatedSubrubric': 21, 'passes24': False},
        {'omittedEssential': 'reject shared unvalidated iodine stoichiometry', 'maximumPointsUnderStatedSubrubric': 22, 'passes24': False},
        {'omittedEssential': 'one entire quantitative analyte, including its method, workflow, calculation and limit', 'maximumPointsUnderStatedSubrubric': 15, 'passes24': False},
        {'omittedEssential': 'ascorbic blank correction OR paraben intercept correction', 'maximumPointsUnderStatedSubrubric': 23, 'passes24': False},
    ],
    'controlAmbiguityCounterexample': {'actualFrozenReferenceRecoveryPercent': 99, 'illustrativeBand98To102Passes': wide_pass, 'illustrativeBand99Point5To100Point5Passes': tight_pass, 'neitherBandIsSpecifiedInFrozenMaterial': True, 'conclusion': '99% alone cannot determine whether the reference control passed; add explicit fictional acceptance bands and make the solution compare all provided controls against them.'},
    'learnerPerformanceAssessed': False, 'actualLaboratoryAcceptanceClaimed': False, 'activeWrites': False, 'humanApproval': False,
}
(OUT / 'independent-numeric-and-adversarial-boundaries.actual.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('PASS independently calculated 2.6418g/L /2000mg/L; M vsP boundaries and strict24 essential-omission counterexamples. REVISE quantitative task: 99% control has opposite possible verdicts under unstated acceptance limits.')
