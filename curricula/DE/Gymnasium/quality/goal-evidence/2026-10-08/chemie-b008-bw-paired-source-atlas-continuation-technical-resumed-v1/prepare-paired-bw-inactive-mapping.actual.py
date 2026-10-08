# SPDX-License-Identifier: Apache-2.0
"""Technical integration of independently frozen decisions, no new science verdict."""
import copy, hashlib, json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
A = BASE / 'chemie-b008-bw-source-placement-independent-a-resumed-v1'
B = BASE / 'chemie-b008-bw-source-placement-independent-b-resumed-v1'
AUTHOR = BASE / 'chemie-b008-source-view-placements-author-resumed-v1'
def read(p): return json.loads(p.read_text())
def bind(p):
    b=p.read_bytes()
    return {'path':str(p.relative_to(ROOT)), 'sha256':hashlib.sha256(b).hexdigest(), 'bytes':len(b)}
def pinned(p, sha):
    b=bind(p); assert b['sha256']==sha, b
    return b
def write(name, obj):
    p=OWN/name; p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2)+'\n')
    return bind(p)

ap=A/'own-bw-nine-normal-mapping-decision-fields.independent-proposal.json'
bp=B/'own-bw-nine-normal-mapping-decision-fields.independent-proposal.json'
af=A/'own-bw-source-placement.first-independent-verdict.json'
bf=B/'own-bw-source-placement.first-independent-verdict.json'
pins=[pinned(ap,'6447c7adb366664e1247c1761bed1d422e96a1f9b85298302944ebd84aca30f6'),
      pinned(bp,'903f7cae08b4ecaa9df20bf5c546ab1b08ef9d93a904db9530059bbca526412e'),
      pinned(af,'27c75f3295c12c7a8b347cd144342e20328cde9a4e6f4532c067c4d4ea4ba79d'),
      pinned(bf,'9ffcaa2e0c159113c6dbb0d2eda65ffebe28f28ff9b6114e5372e4230cd47a1e'),
      pinned(B/'neutral-independent-bw-review-b.completed.entry.json','dc9a9e4554d5982f684425024c34d0b37261feb0c7fcbd30c4330c85cb0369da')]
ad={r['ordinaryDecisionFields']['sourceGoalId']:r for r in read(ap)['decisionRecords']}
bd={r['sourceGoalId']:r for r in read(bp)['decisions']}
assert len(ad)==len(bd)==9 and set(ad)==set(bd)
input_path=AUTHOR/'candidate-source-mappings/BW-SekI.source-mapping.author-candidate.json'
original_path=ROOT/'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json'
author=read(input_path); original=read(original_path); candidate=copy.deepcopy(author)
comparisons=[]
for d in candidate['decisions']:
    sid=d['sourceGoalId']
    if sid not in ad: continue
    av=ad[sid]['ordinaryDecisionFields']; bv=bd[sid]
    for key in ['sourceGoalId','topicCode','sourceSpan','decision','canonicalGoalIds']:
        assert av[key]==bv[key], (sid,key)
    assert d['canonicalGoalIds']==av['canonicalGoalIds']
    retained=d['historicalDecisionBeforeCandidate']
    d.update({k:av[k] for k in ['sourceGoalId','topicCode','sourceSpan','decision','canonicalGoalIds']})
    d['reviewer']=av['reviewer']+' + '+bv['reviewer']
    d['reviewedAt']=av['reviewedAt']
    d['rationale']='Technische Zusammenführung der separat eingefrorenen, übereinstimmenden Maschinenurteile A und B; nur begrenzte Teilzuordnung und ausdrücklich geprüfte BW-Platzierung. Alle Originalpartner und ganzen Inhaltspflichten bleiben erhalten. Originalwortlaut A: '+av['rationale']+' Originalwortlaut B: '+bv['rationale']
    d['independentlyFrozenPairedReview']={
      'reviewA':{'proposal':bind(ap),'firstVerdict':bind(af),'ordinaryDecisionFields':av},
      'reviewB':{'proposal':bind(bp),'firstVerdict':bind(bf),'ordinaryDecisionFields':bv},
      'agreementFields':['decision','canonicalGoalIds','fourTargetAndOnePrerequisiteOnlyBoundaries'],
      'wholeSourceDutyClosure':False,'wholeSourceApproval':False,'humanApproval':False}
    assert d['historicalDecisionBeforeCandidate']==retained
    comparisons.append({'sourceGoalId':sid,'canonicalGoalIds':d['canonicalGoalIds'],
      'originalCanonicalPartnerIds':retained['canonicalGoalIds'],
      'newBoundedPartnerIds':[i for i in d['canonicalGoalIds'] if i not in retained['canonicalGoalIds']],
      'reviewA':av['reviewer'],'reviewB':bv['reviewer'],'wholeSourceApproval':False})
assert candidate['mappings']==author['mappings'] and len(candidate['mappings'])==136
assert len(original['mappings'])==124
assert candidate['mappings'][:124]==original['mappings']
assert len(candidate['decisions'])==65
assert [d for d in candidate['decisions'] if d['sourceGoalId'] not in ad]==[d for d in author['decisions'] if d['sourceGoalId'] not in ad]
mapping=write('candidate-source-mappings/BW-SekI.source-mapping.paired-independent-ab.inactive-candidate.json',candidate)
witness=ROOT/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b008-current169-routing-placement-author-v12/exact-original1646-current-source-witness-and-primary-review-routes.author-input.json'
w=read(witness); assert len(w['originalWholeDuties'])==1646
canonical=AUTHOR/'candidate/canonical.current504-bw-source-view.author-candidate.json'
material=BASE/'chemie-b008-twenty-six-images-author-20261008-v1/all26-whole-goals-and-unchanged26P52cases.readonly-inputs.snapshot.json'
receipt={'schemaVersion':1,'role':'Separate technical integration of nine real frozen independent A and B mapping fields; not a new scientific approval',
 'createdAtUTC':datetime.now(timezone.utc).isoformat(),'independentEvidence':pins,
 'sourceAuthorMapping':bind(input_path),'originalMapping':bind(original_path),'pairedInactiveMapping':mapping,
 'actualNineComparisons':comparisons,'all65SourceIDsPreserved':True,'all124OriginalPartnerMappingsExactPreserved':True,
 'all12ExistingPartialCandidateMappingsExactPreserved':True,'other56NormalDecisionsExactPreserved':True,
 'whole1646OriginalDutyWitness':bind(witness),'whole1646OriginalDutiesExactUnmodified':True,
 'whole504Canonical':bind(canonical),'whole26Profiles52Cases':bind(material),
 'whole26ScienceProfiles52CasesUnmodified':True,'wholeSourceApproval':False,'newScientificVerdicts':0,
 'strictGain':0,'activeWrites':0,'humanApproval':False,'humanTrial':False}
write('paired-nine-normal-fields.integration.actual.json',receipt)
print(json.dumps({'mapping':mapping,'pairedSourceIDs':len(comparisons),'originalDuties':1646,'originalPartnerMappings':124,'wholeSourceApproval':False}))
