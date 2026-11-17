from importlib.machinery import SourceFileLoader
from pathlib import Path
from fractions import Fraction

common = SourceFileLoader('independent_review_common', str(Path(__file__).with_name('review-common.py'))).load_module()
# Independent checks of the physical relations, not a new numerical learner requirement.
checks=[]
for c in [1,3,7]:
    for initial_mass in [2,10,100]:
        initial_energy=Fraction(initial_mass*c*c)
        transfer=initial_energy/Fraction(4)
        absorbed_mass=Fraction(initial_mass)+transfer/Fraction(c*c)
        emitted_mass=Fraction(initial_mass)-transfer/Fraction(c*c)
        assert absorbed_mass*c*c==initial_energy+transfer
        assert emitted_mass*c*c+transfer==initial_energy
        assert transfer-transfer==0
        for gamma in [Fraction(1),Fraction(5,4),Fraction(2),Fraction(10)]:
            final_rest=emitted_mass*c*c
            moving_total=gamma*final_rest
            assert final_rest/Fraction(c*c)==emitted_mass
            assert moving_total>=final_rest
            assert (moving_total/Fraction(c*c)>emitted_mass)==(gamma>1)
        checks.append({'cInArbitraryReviewUnits':c,'initialMass':initial_mass,'transfer':str(transfer),
                       'absorbedMass':str(absorbed_mass),'emittedMass':str(emitted_mass),'fourFrameCasesVerified':True})
common.emit_review('rest-energy-two-system-comparisons',
    '7b2b21fd2f8569d6efd43ba0f5386b380a456eaa876039de00e294dbc5398454',
    'bfea7a23-1ce1-4a42-badd-1fc9bf30124a', {
        'taskIsQualitativeNoNumericalOrLorentzCalculationRequired':True,
        'A':{'restEnergyChange':'+Q','invariantMassChange':'+Q/c^2','sourcePlusBoxEnergyChange':'-Q+Q=0'},
        'B':{'restEnergyChange':'-W','invariantMassChange':'-W/c^2','remainingBodyPlusRadiationEnergyChange':'-W+W=0'},
        'frameComparison':'At the same physical state, invariant mass and rest energy agree. Total energy increases for an observer moving relative to the massive body. Do not insert total moving energy for E0.',
        'independentRationalChecks':checks,
        'radiationNuance':'Individual light pulses have zero invariant mass; a two-pulse system can have nonzero invariant mass. The solution carefully rejects assigning W/c^2 to individual pulses, and does not demand a mass for the combined radiation.'}, {
        'completeIndependentPerformances':'Both A and B separately require meaning of rest energy/invariant mass, a correctly bounded energy balance, and physical-state versus frame comparison. Neither case relies on an answer from the other.',
        'DE_EN':'All system boundaries, equal opposite pulses, assumptions, qualitative questions, optional equations, invariant/total-energy distinctions and rubric statements agree.',
        'physicalValidity':'Equal opposite pulse momenta permit before/after laboratory rest. Internal energy changes composite-system invariant mass without atom transfer. Including sources or escaped radiation preserves total energy. A closed box is correctly distinguished from an energetically isolated system.',
        'genuineCoverage':'Explicitly assesses E0=m0c^2 as a relation of rest energy to invariant mass using two qualitative examples, matching the entire canonical target. No Lorentz transformation, nuclear reaction calculation or extra goal is required.',
        'courseBoundary':'Task is LK-only exactly like the target; the earlier GK tag was removed before this approval.',
        'rubric':'Six independent core criteria cover meaning, conservation and invariance in each case; a conceptual error or absent core gets0, so no omitted case/core can pass.'})
