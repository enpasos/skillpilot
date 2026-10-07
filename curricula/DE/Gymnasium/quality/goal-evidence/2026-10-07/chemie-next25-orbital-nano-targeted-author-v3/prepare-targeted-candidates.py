#!/usr/bin/env python3
"""Apache-2.0. Prepare inert, bounded candidates; never change active inputs."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-next-coherent-current-gap-native-author-v2'

def read(path):
    return json.loads(path.read_text())

def write(name, value):
    path = OWN / name
    assert not path.exists(), f'Refusing to overwrite existing evidence: {path}'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return str(path.relative_to(ROOT))

original = read(AUTHOR / 'canonical.final-png-current.author-candidate.json')
candidate = copy.deepcopy(original)
goals = {goal['id']: goal for goal in candidate['goals']}
orbital = goals['0acc8cd2-be6d-567e-a023-1d9e90475510']
assert orbital['description'] == 'Die lernende Person kann Orbitale als mögliche Lösungen der Wellenfunktion von Elektronen beschreiben und das Betragsquadrat der Wellenfunktion als Wahrscheinlichkeitsdichte für Aufenthaltsbereiche deuten.'
assert orbital['descriptionEn'] == 'The learner can describe orbitals as possible solutions of the electron wave function and interpret the squared magnitude of the wave function as a probability density for regions of electron presence.'
orbital['description'] = 'Die lernende Person kann Orbitale als Ein-Elektronen-Wellenfunktionen beschreiben und das Betragsquadrat der Wellenfunktion als Wahrscheinlichkeitsdichte für Aufenthaltsbereiche deuten.'
orbital['descriptionEn'] = 'The learner can describe orbitals as one-electron wave functions and interpret the squared magnitude of the wave function as a probability density for regions of electron presence.'

nano = goals['5e2eb826-6e60-5273-91d6-c23f6dfa33b1']
provenance = nano['extendedData']['provenance']
source_id = 'bw-chem-seki-3-2-1-1-b07-a01-b0c6f1f5'
before_ref = 'Bildungsplan 2016 Gymnasium Chemie Baden-Wuerttemberg, 3.2.1.1 (7), S. 13.'
after_ref = before_ref.replace('S. 13.', 'S. 14.')
assert provenance['sourceGoalId'] == source_id
assert provenance['sourceRef'] == before_ref
provenance['sourceRef'] = after_ref
extraction_path = ROOT / 'curricula/DE/Gymnasium/input/BW/lower-secondary/source-extraction/DE_BW_CHEMIE_SEKI_BP2016_V2.source-extraction.json'
extraction = read(extraction_path)
source_goals = extraction['sourceGoals']
matches = [goal for goal in source_goals if goal['id'] == source_id]
assert len(matches) == 1 and matches[0]['sourceRef'] == before_ref
matches[0]['sourceRef'] = after_ref

changed = [goal['id'] for goal, old in zip(candidate['goals'], original['goals']) if goal != old]
assert changed == ['5e2eb826-6e60-5273-91d6-c23f6dfa33b1', '0acc8cd2-be6d-567e-a023-1d9e90475510'] or set(changed) == {nano['id'], orbital['id']}
canonical_path = write('canonical.nine-goal-final-resources-and-two-targeted-corrections.candidate.json', candidate)
extraction_candidate_path = write('BW-SekI.nano-printed-page14-only.source-extraction.candidate.json', extraction)
kind = read(AUTHOR / 'semantic-kinds.current-authority.prospective-bindings.candidate.json')
kind['sourceLandscapePath'] = canonical_path
write('semantic-kinds.native-bindings.pending-candidate.json', kind)
config = read(AUTHOR / 'full-prospective378.book.config.json')
config['landscapePath'] = canonical_path
config['semanticKindLedgerPath'] = str((OWN / 'semantic-kinds.native-bindings.pending-candidate.json').relative_to(ROOT))
config['outputPath'] = str((OWN / 'full378.targeted-candidate.book-model.json').relative_to(ROOT))
book_config_path = write('full378.targeted-candidate.book.config.json', config)
batch = read(AUTHOR / 'native-d-twenty.batch.config.json')
batch.update(batchId='chemie-next25-orbital-targeted-20261007-author-v3', bookId='chemie-next25-orbital-targeted-20261007-author-v3', title='Chemie – gezielte Orbital-Korrektur', baseGoalBookConfigPath=book_config_path, goalIds=[orbital['id']], outputDirectory=str((OWN / 'native-d-one-orbital').relative_to(ROOT)))
write('native-d-one-orbital.batch.config.json', batch)
write('actual-two-targeted-goal-deltas.author.json', {
    'documentType': 'inert author corrections, independent current reviews pending',
    'basis': {'path': str((AUTHOR / 'current-twenty-five-final-native-author-v2.final.freeze.json').relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256((AUTHOR / 'current-twenty-five-final-native-author-v2.final.freeze.json').read_bytes()).hexdigest()},
    'goals': [{'goalId': gid, 'before': next(goal for goal in original['goals'] if goal['id'] == gid), 'after': goals[gid]} for gid in changed],
    'sourceExtractionBefore': str(extraction_path.relative_to(ROOT)),
    'sourceExtractionCandidate': extraction_candidate_path,
    'sourceScalarDelta': {'sourceGoalId': source_id, 'field': 'sourceRef', 'before': before_ref, 'after': after_ref, 'actualPDFPhysicalPage': 16, 'actualPDFPrintedPage': 14},
    'orbitalPrimaryDefinition': {'url': 'https://goldbook.iupac.org/terms/view/O04317', 'version': '5.0.0', 'meaning': 'An orbital is a wave function depending on the spatial coordinates of one electron; it is not a solution of a wave function.', 'rootVerification': 'official indexed term text verified; direct browser fetch returned403; not claimed as a new successful raw download'},
    'unchangedWholeGoalsComparedWithAuthorV2': 477,
    'allIdsAndEdgesExact': True, 'activeWrites': False,
    'D_P_A_MFollowupPending': True, 'newStrictClosures': 0, 'strictNetGain': 0,
    'humanApproval': False, 'humanTrial': False,
})
print('Prepared two bounded inert goal corrections; 477 whole goals unchanged to final author v2. No active writes.')
