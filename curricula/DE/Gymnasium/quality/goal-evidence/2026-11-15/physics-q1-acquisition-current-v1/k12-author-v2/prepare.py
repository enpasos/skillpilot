"""Explicit content proposal; writes no active curriculum or review record."""
import copy, datetime, hashlib, json
from pathlib import Path

D = Path('tmp/physics-k12-biophysics-current-20261115-v2')
P = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json')
catalog = {}
pins = []
for path in sorted(Path('curricula/DE/Gymnasium/canonical').glob('*.json')):
    pins.append({'path':str(path),'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
    for goal in json.loads(path.read_text())['goals']:
        assert goal['id'] not in catalog
        catalog[goal['id']] = goal

proposals = [
('84ddb244-e560-592f-9d43-e84c801fe5b4', ['078ce4d2-3193-4cd0-ae59-4fb8ab16e9e5','0a154cbd-1218-4553-835c-a754e9901bba'],
 'Ray construction and quantitative lens modelling use qualitative lens images and rearrangement of fractional formulas. A whole electromagnetism examination is not a preparation skill for the eye.'),
('39ef1e8a-9203-5192-8c76-8e0c3322646f', ['cdab9fd1-5054-4a7e-8c9a-4474062ddd23','5e7d5ff2-b92c-4989-85bc-8d87ad7edadd'],
 'Physiological explanation builds on distinguishing additive/subtractive mixing; supplied response graphs require elementary diagram reading. Lens safety and electrical examinations are unrelated barriers.'),
('41872413-497e-5b88-ac65-365ed7d9851f', ['709e688c-eb07-5f83-a506-82c9bfe0d89f'],
 'The eye application uses the existing diffraction/Rayleigh competence. That prerequisite retains the wave-optics foundation; no electric-circuit or assessment prerequisite is justified.'),
('f06c581a-7157-584e-a692-99bcd613cff9', ['10aad90e-a1db-42b6-8d1e-1d856e14b47d'],
 'The existing tone/noise competence supplies frequency, amplitude and diagram prerequisites. Connecting a time trace to its spectrum and explaining timbre through spectral components are the new competence; instrument construction and a complete Q1 electrical exam are not prerequisites.'),
('8ac61062-f63e-5935-96ae-84014906c368', ['da0837c7-95a7-5a6a-81db-f33cb7f42d85','3c1d6ce7-099e-4267-9ff2-3d1526209a89'],
 'Quantitative sound-level reasoning needs the existing level/duration risk model and elementary logarithm evaluation. This does not imply an official early placement where a Land only requires qualitative noise awareness.'),
('e19fccd7-6a35-5c9e-86e1-dcca76481e9c', ['2622bef1-bdbc-504e-b468-b600b2ca3ed8','4ca83b3f-3605-5c0d-abc4-9f24b9e29bbe'],
 'A dipole ECG model combines potential differences/equipotentials and superposition. Circuit, accelerator and transformer assessments are not prerequisites for that model.'),
('d1306bda-35ff-53e9-9458-3cbc128874d8', ['741774ef-15fc-4bcf-a370-e2c5cf4257d0','9854589c-5feb-4942-b90f-311ddf36eb78','bb5c5eab-2fc1-5336-b8cf-14d147695487'],
 'The therapy application uses electric particle acceleration, qualitative magnetic trajectory reasoning and physical radiation-risk quantities. The cyclotron operating principle is elaborated in this goal; comparing synchrotron synchronisation, nuclear-energy policy and unrelated Q1 tasks are not prerequisites.'),
('db47ac91-7bb0-5ba3-b39d-e2d6fc98396e', ['5dd180f1-f1c8-5f76-9c9a-ea3fc3d921bf','1730c01d-8c85-57df-b031-c11e2a0511b1'],
 'The passive membrane model combines diffusion and electric potential differences. Selective permeability, a supported implementation of this particular model, and the limit to passive behaviour are taught by this goal. The existing motion-with-friction spreadsheet goal would unnecessarily require Newtonian mechanics.'),
('2825b528-00ee-52d0-870e-686890cb1195', ['d3c153b9-e09b-5668-8386-73105546a7c1','106417ed-80db-5490-a1ee-bb4160d3f2b4','eb1ea150-ec6c-5000-bce3-f46c820dccf8','1730c01d-8c85-57df-b031-c11e2a0511b1'],
 'Evaluating a supplied nerve-conduction method needs experimental/data reasoning, potential differences with the homogeneous-field E = |U|/d model, appropriate magnetic field models and the finite-change induction law. The application judges the given geometry and model limits; a Coulomb-force formula or a mixed examination cannot replace these preparation skills.'),
('c2e0fc31-27a2-5727-9025-a824db9150d2', ['8f833b36-4126-52db-b210-79fb0023c7d9','0b4f2020-8486-5372-9cb9-6e59f698ac2d'],
 'The passive axon circuit needs resistance-network effects and capacitor charge/discharge behaviour. Biological correspondence, segment connection and the boundary to active conduction remain the new goal.'),
]
candidate = copy.deepcopy(json.loads(P.read_text()))
by = {g['id']:g for g in candidate['goals']}
for goal_id, required, _ in proposals:
    assert all(r in catalog and catalog[r]['type']=='atomic' and not catalog[r].get('examData') for r in required)
    by[goal_id]['requires'] = required
new_catalog = {**catalog, **by}

def closure(goal_id, stack=()):
    if goal_id in stack:
        raise ValueError(('cycle', stack, goal_id))
    result = set()
    for ref in new_catalog[goal_id].get('requires',[]):
        key = ref.rsplit(':',1)[-1]
        assert key in new_catalog, (goal_id, ref)
        result.add(key)
        result |= closure(key, stack+(goal_id,))
    return result

rows = []
for goal_id, proposed, reason in proposals:
    reduced = [r for r in proposed if not any(r in closure(other) for other in proposed if other != r)]
    by[goal_id]['requires'] = reduced
    new_catalog[goal_id] = by[goal_id]
    reachable = closure(goal_id)
    rows.append({'goalId':goal_id,'title':by[goal_id]['title'],'beforeRequires':catalog[goal_id]['requires'],
                 'proposedRequires':proposed,'afterRequires':reduced,'ownPedagogicalRationale':reason,
                 'closureSize':len(reachable),'remainingReachableAssessmentIds':sorted(r for r in reachable if new_catalog[r].get('examData'))})

assert all('d441ee2f-9230-5751-832b-5b0b5cf14605' not in closure(g) for g,_,_ in proposals)
changed = [g['id'] for g in candidate['goals'] if g != catalog[g['id']]]
assert set(changed)=={g for g,_,_ in proposals}
for g in candidate['goals']:
    assert {k:v for k,v in g.items() if k!='requires'} == {k:v for k,v in catalog[g['id']].items() if k!='requires'}

report = {'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'status':'AUTHOR_PROPOSAL_REQUIRES_INDEPENDENT_CONTENT_AND_CURRENT_QA_REVIEW',
          'canonicalInputPins':pins,'rows':rows,'changeBoundary':'Only requires on ten ordinary goals. No text, ID, source mapping, assessment content, placement, learner result or frozen evidence change.',
          'sourceInterpretation':'The official Bavarian alternative organizes eye, hearing, field applications and neuronal conduction by their own physical models. This is evidence for subject selection, not an official prerequisite graph. Every proposed edge is an explicitly authored SkillPilot inference.',
          'primarySourcesRead':[
            'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/physik/grundlegend-bio',
            'https://openstax.org/books/university-physics-volume-3/pages/2-5-the-eye',
            'https://openstax.org/books/university-physics-volume-1/pages/17-3-sound-intensity'],
          'activeWrites':0,'learnerResultWrites':0}
(D/'candidate.canonical.json').write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n')
(D/'proposal.actual.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'changedGoals':len(changed),'remainingAssessmentClosure':{r['goalId']:r['remainingReachableAssessmentIds'] for r in rows}},indent=2))
