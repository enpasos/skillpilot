from importlib.machinery import SourceFileLoader
from pathlib import Path
from fractions import Fraction as F

common = SourceFileLoader('independent_review_common', str(Path(__file__).with_name('review-common.py'))).load_module()
results=[]
for label,n1,n2,u1,i2 in [('A',600,150,F(24),F(4,5)),('B',200,500,F(12),F(3,25))]:
    voltage_ratio=F(n2,n1)
    u2=u1*voltage_ratio
    p2=u2*i2
    i1=p2/u1
    p1=u1*i1
    current_ratio=i2/i1
    assert p1==p2
    assert voltage_ratio*current_ratio==1
    results.append({'case':label,'N1':n1,'N2':n2,'U1_V':str(u1),'U2_V':str(u2),
        'I1_A':str(i1),'I2_A':str(i2),'U2_over_U1':str(voltage_ratio),'I2_over_I1':str(current_ratio),
        'P1_W':str(p1),'P2_W':str(p2),'conservationAndInverseRatios':True})
assert results[0]['U2_V']=='6' and results[0]['I1_A']=='1/5' and results[0]['P1_W']=='24/5'
assert results[1]['U2_V']=='30' and results[1]['I1_A']=='3/10' and results[1]['P1_W']=='18/5'
common.emit_review('ideal-transformer-two-load-cases',
    '4332a5813f567370d4a1a6ff8fb3487ea6bbd8904b620a8d398cc9d8a6af961a',
    'af1094c1-511a-5aae-9e0a-3e9196a82d9a', {'cases':results,
        'constantFlux':'dPhi/dt=0 gives no sustained induced secondary voltage.',
        'bothRatiosGreaterThanOne':'(U2/U1)*(I2/I1)=P2/P1=1 rules this out for the specified lossless loaded model.'}, {
        'completeIndependentPerformances':'Each case independently requires a labelled source/core/windings/load sketch, causal flux/induction explanation, voltage and current ratios, and a justified energy balance. B additionally checks constant flux.',
        'DE_EN':'Both languages agree on all values, turns, RMS quantities, steady sinusoidal operation, resistive loads, ignored losses/magnetising current, questions, reference calculations and rubric.',
        'physicalValidity':'Purely resistive loads and negligible magnetising current explicitly establish power factor1 for this ideal model, so P=U_rms*I_rms legitimately denotes real power. No undefined phase assumption or real DC experiment is introduced.',
        'genuineCoverage':'Both cases cover transformer structure/function through induction, voltage and current transformations, and inverse ratios justified by conservation, exactly matching the complete target. Formula and modelling assumptions are supplied; no motor construction or unrelated goal is required.',
        'rubric':'All seven core performances are separately noncompensable, including each complete case and the constant-flux reasoning. Equivalent correct schematic arrangements and ratio derivations remain accepted.',
        'courseBoundary':'Task and covered transformer target both permit GK and LK, with no course expansion.'})
