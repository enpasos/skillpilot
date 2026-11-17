from importlib.machinery import SourceFileLoader
from pathlib import Path
from fractions import Fraction as F

common = SourceFileLoader('independent_review_common', str(Path(__file__).with_name('review-common.py'))).load_module()
nm=F(1,10**9); um=F(1,10**6); mm=F(1,1000); cm=F(1,100)
cases={
 'A':{'a':(600*nm,'visible'),'b':(F(1,10)*nm,'X-ray'),'c':(F(3),'radio'),
      'd':(10*um,'infrared'),'e':(F(1,1000)*nm,'gamma'),'f':(300*nm,'ultraviolet'),'g':(3*cm,'microwave')},
 'B':{'h':(200*nm,'ultraviolet'),'i':(F(30),'radio'),'j':(F(1,2000)*nm,'gamma'),
      'k':(450*nm,'visible'),'l':(3*mm,'microwave'),'m':(F(1,20)*nm,'X-ray'),'n':(100*um,'infrared')},
}
results=[]
for label,cards in cases.items():
    order=sorted(cards,key=lambda key:cards[key][0],reverse=True)
    frequencies=[F(299792458)/cards[key][0] for key in order]
    assert all(a<b for a,b in zip(frequencies,frequencies[1:]))
    assert len(order)==7 and len({cards[k][1] for k in order})==7
    results.append({'case':label,'increasingFrequencyOrder':order,
        'increasingWavelengthOrder':list(reversed(order)),
        'cards':[{'card':key,'wavelength_m':str(cards[key][0]),'region':cards[key][1],
                  'independentFrequency_Hz':str(F(299792458)/cards[key][0])}for key in order]})
assert results[0]['increasingFrequencyOrder']==list('cgdafbe')
assert results[1]['increasingFrequencyOrder']==list('ilnkhmj')
overlap_wavelength=F(1,50)*nm
assert F(299792458)/overlap_wavelength==14989622900000000000
common.emit_review('em-spectrum-two-application-maps',
    '10fecdf9681f2ae5529e8f84ab9c898ce2edc59bf8aa3cd9610e3c9b4f81adc0',
    '4a7cbe83-b694-57d3-85ce-1eeca418daaf', {'cases':results,
        'numericFrequenciesAreReviewerChecksNotLearnerRequirements':True,
        'applicationAssignments':{'A':{'radar':'g/microwave/reflected echo','thermalCamera':'d/infrared/emission pattern',
                                      'materialInspection':'b/X-ray/material-dependent attenuation'},
                                  'B':{'radioSystem':'i/radio/modulated received signal','fluorescenceAnalysis':'h/ultraviolet/specifically given absorption and visible response',
                                      'indicator':'k/visible/directly visible signal'}},
        'equalWavelengthOriginPair':{'wavelength_m':str(overlap_wavelength),'frequency_Hz':'14989622900000000000',
                                    'electronProcess':'X-ray under supplied convention','nuclearTransition':'gamma under supplied convention'},
        'boundary':'701nm is near a conventional visible/infrared boundary, not an existence limit; visibility has no universal sharp700nm cutoff.'}, {
        'completeIndependentPerformances':'Each case independently orders all seven standard regions in both coordinate directions, applies three technical contexts with property-based explanations, and addresses the limited meaning of region boundaries.',
        'DE_EN':'All14 card wavelengths, electron/nuclear origins, units, ordering directions, six applications, two boundary questions and solution/rubric requirements agree.',
        'physicalValidity':'Radio includes microwaves; their separated presentation is explicitly conventional. X/gamma overlap and origin-based naming are correctly scoped. Infrared emission does not imply uncalibrated exact temperatures; fluorescence is a supplied property of the chosen material, not all materials.',
        'genuineCoverage':'The whole target is assessed twice: frequency/wavelength ordering, typical regions, technical application classification and wave/interaction-property justification. No frequency arithmetic, radiation experiment, medical claim, spectroscopy theory or extra goal is required.',
        'rubric':'All three applications and every card are central parts within their respective case cores. Optional details about travel time/calibration are explicitly not extra obligations; scientifically equivalent property explanations are accepted.',
        'courseBoundary':'Task and target both permit GK/LK with exact course binding.'})
