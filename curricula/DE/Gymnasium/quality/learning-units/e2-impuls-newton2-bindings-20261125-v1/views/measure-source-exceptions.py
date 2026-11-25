#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Separate official source scope, inherited target roster and actual acquisition."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
HERE=Path(__file__).resolve().parent
ROOT=next(p for p in HERE.parents if (p/'scripts/generate_laender_physics_stage_views.py').exists())
sys.path.insert(0,str(ROOT/'scripts'))
from normalize_mathematics_stage_views import Normalizer
from generate_mathematics_foreign_acquisition_policy import authored_places

BASE='1001aa2c7f'
IMP='53afbda1-5776-502b-8867-471975d7b766'
N2='a94cfe1c-6f87-47ff-b4f3-31a58d4c6c20'
CONS='839ecc8f-3a60-418b-bc92-64bfeef33824'
PROOF='f524f05c-4456-4fc3-a1f7-f40741fc1f16'

def chain(source,target,goals):
    queue=[[source]];seen={source}
    for path in queue:
        if path[-1]==target:return path
        for ref in goals[path[-1]].get('requires',[]):
            atom=ref.split(':')[-1]
            if atom not in seen:seen.add(atom);queue.append(path+[atom])
    raise ValueError('No actual prerequisite witness')

def reference(path,pages):
    raw=(ROOT/path).read_bytes()
    return dict(path=path,sha256=hashlib.sha256(raw).hexdigest(),pdfPages=pages)

def main():
    n=Normalizer(ROOT);views=[]
    for path in sorted((ROOT/'curricula/DE/Gymnasium/composition-views/physik').glob('*.view.json')):
        v=json.loads(path.read_bytes());places=authored_places(v,n)
        views.append((path,v,places))
    specs=[
      ('BY',IMP,'new target; source year differs from actual acquisition',[], '839 source corrected to Ph10.2 by an explicit overlay; the new IMP source target is Ph10.2. Actual year8 persists because the old Kraftstoß consumer still requires conservation. No official BY8 momentum mandate is claimed.', 'e790de73-f8e5-4027-bc05-9f12a0e8c9cb', 'Retain the honest source/acquisition distinction in H. Separately review the existing full Kraftstoß atom and its BY8 role before moving it or its prerequisites.'),
      ('MV',IMP,'new target; source year differs from actual acquisition',[reference('curricula/DE/Gymnasium/input/MV/Physik_Gymnasium_11_12_2022.pdf',[21,22])], 'Primary momentum balance source is Q11/12. The actual E10 acquisition is pulled by the retained gyro-stabilisation chain and conservation. The source evidence does not certify an official E10 target requirement.', '07f298b2-2f5e-5b16-8150-bc603fa78ecd', 'Review the inherited E10 gyro-stabilisation/rotation route and its source timing before changing the learner acquisition place; do not force IMP after a real current consumer.'),
      ('ST',IMP,'new elevated-level target; source year differs from actual acquisition',[reference('curricula/DE/Gymnasium/input/ST/FLP_Physik_Gym_01082022_swd.pdf',[54,79])], 'The complete two-body task is supported only at elevated level in Q11/12 p79; the weaker basic-level state-quantity clause p54 is not used as full coverage. The two target views are LK. Actual E10 acquisition follows the retained gyro-stabilisation chain.', '07f298b2-2f5e-5b16-8150-bc603fa78ecd', 'Retain LK-only source target admission and report the early acquisition separately. Review the inherited gyro route before any source-calendar claim for E10.'),
      ('SL',IMP,'new target heading repaired',[reference('curricula/DE/Gymnasium/input/SL/LP_Ph_EP_GOS_2023.pdf',[12])], 'The source is E mechanics, not nuclear physics. IMP now has its own same-E mechanics-preparation sibling. In the two SekII views the old broad WHY orientation shares the honest entry heading; no old subject competency moves.', 'd168ae5d-f36f-4ad4-b070-d5931f8d70d1', 'The new heading correction is part of H. Audit the older nuclear placement of elastic collisions/conservation separately; its existence does not turn nuclear physics into the source clause.'),
      ('SN',IMP,'new target heading repaired',[reference('curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf',[57])], 'The source is LK11 mechanics. IMP now has its own LK11 mechanics-preparation sibling before actual collision and rate consumers, not a relativity source attribution.', 'd168ae5d-f36f-4ad4-b070-d5931f8d70d1', 'The new heading correction is part of H. Audit the retained relativistic wrapper of elastic collisions separately; no full special-relativity outcome is inferred from IMP.'),
      ('BW',N2,'inherited timing exception; target roster unchanged',[reference('curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_PH_V2.pdf',[27,57])], 'The cited starred dynamics section supports Klasse10. It does not certify the displayed 7/8 acquisition as official coverage. H narrows the goal text and introduces no new N2 target.',None,'Next source-placement package: audit earlier consumers and the retained source assignment; preserve the scientifically necessary constant-mass law rather than inventing a 7/8 official clause.'),
      ('SL',N2,'inherited topic exception; target roster unchanged',[reference('curricula/DE/Gymnasium/input/SL/LP_Ph_EP_GOS_2023.pdf',[10])], 'Mechanics supports the narrowed constant-mass law. The retained nuclear wrapper is not its source.',None,'Repair the inherited mechanics/source wrapper in a separate bounded package with every consumer retained and no source rewriting.'),
      ('SN',N2,'inherited topic exception; target roster unchanged',[reference('curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf',[37,58])], 'The mechanics/Newton clauses support the law; an electromagnetic-induction wrapper is not that official source.',None,'Audit and repair the retained mechanics placement without deleting a necessary force prerequisite.'),
      ('RP',N2,'inherited topic exception; target roster unchanged',[reference('curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf',[24,51])], 'The source is introductory mechanics; the retained complementarity wrapper is not the source clause.',None,'Review the inherited topic wrapper and genuine early consumers separately; H makes no new complementarity claim.'),
      ('SL',CONS,'inherited topic exception; target roster unchanged',[reference('curricula/DE/Gymnasium/input/SL/LP_Ph_EP_GOS_2023.pdf',[12])], 'The recoil/conservation clause is mechanics. The old nuclear wrapper remains inherited; it does not establish an official nuclear assignment.',None,'Review conservation and collision placements together under their actual mechanics source; retain current target and prerequisite identities pending that decision.'),
    ]
    policy=json.loads((ROOT/'scripts/generate_laender_physics_stage_views.sources.json').read_bytes())['reviewedMomentumBindings']
    specs[0][3].append(dict(url=policy['sourceAssignmentCorrections']['BY']['sourceURL'],sha256=policy['sourceAssignmentCorrections']['BY']['sourceSha256'],pdfPages=[2],sourceTopicCode='Ph10.2'))
    records=[]
    for state,goal,status,sources,fact,consumer,recommendation in specs:
        actual=[]
        for path,v,places in views:
            if v['scope'].get('jurisdiction')!='DE-'+state or goal not in places:continue
            actual.append(dict(file=str(path.relative_to(ROOT)),viewId=v['viewId'],scope=v['scope'],sha256=hashlib.sha256(path.read_bytes()).hexdigest(),actualAcquisition=places[goal],consumerAcquisition=places.get(consumer) if consumer else None))
        records.append(dict(state=state,goalId=goal,title=n.goals[goal]['title'],status=status,officialSources=sources,sourceAndScopeFinding=fact,
            actualRequiresPath=chain(consumer,goal,n.goals) if consumer else None,actualTargetPlaces=actual,recommendedNextAction=recommendation,
            acceptanceBoundary='Current structural/source distinction only; original independent needs_change/unresolved judgments are retained, not converted to acceptance.'))
    proof_places=[dict(file=str(p.relative_to(ROOT)),viewId=v['viewId'],scope=v['scope'],sha256=hashlib.sha256(p.read_bytes()).hexdigest(),actualAcquisition=places[PROOF]) for p,v,places in views if PROOF in places]
    records.append(dict(goalId=PROOF,title=n.goals[PROOF]['title'],status='inherited target-scope ambiguity; scientifically defensible synthesis, no universal official mandate established',actualTargetPlaces=proof_places,
        officialSources=[reference('curricula/DE/Gymnasium/input/SL/LP_Ph_EP_GOS_2023.pdf',[10,12]),reference('curricula/DE/Gymnasium/input/SN/lehrplan-gymnasium-physik-sachsen-2025.pdf',[57,58])],
        sourceAndScopeFinding='SL explicitly derives the central straight two-body result from the interaction law; SN supplies the LK conservation/differential/system premises. Those do not establish the complete general differential-and-integral proof as a mandatory official outcome in all 32 existing LK product targets. H changes prerequisite preparation and two learning places, not that inherited target roster.',
        recommendedNextAction='Review the retained proof offering per source as an own advanced synthesis versus a named official obligation. Keep assessment/scientific claims separate and preserve learner results.'))
    result=dict(schemaVersion=1,baseline=BASE,currentSourcePlanSha256=hashlib.sha256((ROOT/'scripts/generate_laender_physics_stage_views.sources.json').read_bytes()).hexdigest(),sourceReviewBoundary='Response to independent round-B source findings. These records neither invent official clauses nor replace the independent final source verdict.',newTargetCounts=dict(IMP=48,RATE_M=5,RATE_I=2),inheritedN2TargetScopeChange=0,inheritedConservationTargetScopeChange=0,inheritedDerivationTargetScopeChange=0,records=records)
    (HERE/'source-demand-place-exceptions.actual.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('Source/demand/place exceptions: '+str(len(records))+' explicit records; no review verdict overwritten.')
if __name__=='__main__':main()
