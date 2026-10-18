# SPDX-License-Identifier: Apache-2.0
import json,sys,time
from pathlib import Path
P=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-T1-terminal-exams-informed-independent-a-20261018-v1')
start=time.perf_counter()
results={
 'MO_N2':{'bonding':8,'antibonding':2,'bondOrder':(8-2)/2,'cationBondOrder':(7-2)/2},
 'MO_O2':{'bonding':8,'antibonding':4,'bondOrder':(8-4)/2,'cationBondOrder':(8-3)/2,'unpairedElectrons':2},
 'Fe':{'neutralElectrons':18+6+2,'FeIIElectrons':18+6,'FeIIIElectrons':18+5},
 'Cu':{'neutralElectrons':18+10+1,'CuIElectrons':18+10,'CuIIElectrons':18+9,'disproportionationChargeBefore':2,'after':2},
 'GrignardCase1':{'remainingReagentMmol':35-1,'maxAlcoholMmol':min(30,35-1)},
 'GrignardCase2':{'remainingReagentMmol':25-6,'maxAlcoholMmol':min(20,25-6),'maxCarbonylConversionPercent':100*min(20,25-6)/20},
 'FriedelCraftsSkeletons':{'propanoylThenReductionSideChainC':1+2,'butanoylThenReductionSideChainC':1+3},
 'DiolSubstitution':{'OHRequired':2,'bromidesReleased':2,'chargeBefore':-2,'chargeAfter':-2},
 'CatalystDiscussion':{'equilibriumKcBoth':.60/.40,'earlyConcentrationDifference':.40-.15},
 'ConductivityDiscussion':{'sameTemperatureInitialDifference':2100-2098,'freshSameTemperatureDifference':2100-1800,'sumRepeatHalfwidths':3+3,'fullUncertaintyOrExactConcentrationInferred':False},
 'ExothermicProfile':{'reactionEnergy':-40-0,'barriersForward':[70-0,35-0],'barriersReverse':[70-(-40),35-(-40)]},
 'EndothermicProfile':{'reactionEnergy':25-0,'barriersForward':[80-0,50-0],'barriersReverse':[80-25,50-25]},
 'CarbonPhotosynthesisAtomCountsBoth':{'C':6,'H':12,'O':18},
 'LimeCycleSummedNetMaterialEquation':'0 = 0 after exact cancellation; not a measured energy or emissions balance'
}
assert results['MO_N2']['bondOrder']==3 and results['MO_N2']['cationBondOrder']==2.5
assert results['MO_O2']['bondOrder']==2 and results['MO_O2']['cationBondOrder']==2.5
assert results['GrignardCase1']['maxAlcoholMmol']==30 and results['GrignardCase2']['maxAlcoholMmol']==19 and results['GrignardCase2']['maxCarbonylConversionPercent']==95
assert results['ConductivityDiscussion']['sameTemperatureInitialDifference']<6<results['ConductivityDiscussion']['freshSameTemperatureDifference']
sys.path.insert(0,'scripts')
from validate_schemas import curriculum_symlink_errors
symlinks=curriculum_symlink_errors('.')
assert not symlinks,symlinks
files=list(P.rglob('*.json'))
for f in files:json.loads(f.read_text())
out={'role':'INDEPENDENT_SELECTED_MODEL_ARITHMETIC_NOT_LEARNER_EXECUTION','results':results,'stockCurriculumSymlinkErrors':symlinks,'ownJSONFilesParsed':len(files),'durationSeconds':time.perf_counter()-start,'normalWrites':0,'nativeDPAMVVotes':0,'fullSchemaMainOrBuildInvoked':False}
(P/'checks/CHECK.independent-model-arithmetic-and-portability.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out,ensure_ascii=False,indent=2))
