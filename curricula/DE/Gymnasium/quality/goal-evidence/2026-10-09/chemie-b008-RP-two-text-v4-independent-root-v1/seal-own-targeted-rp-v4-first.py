# SPDX-License-Identifier: Apache-2.0
"""Seal the root's actually read bounded v4 science; preserve prior evidence."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = next(p for p in OWN.parents if (p / '.git').exists() and (p / 'AGENTS.md').is_file())
BASE = OWN.parent
AUTHOR = BASE / 'chemie-b008-current-twenty-six-native-preparation-author-v1'
CHECKED = {}


def read(p):
    return json.loads(p.read_text())


def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(v):
    p = ROOT / v['path']
    actual = bind(p)
    assert actual['sha256'] == 'sha256:' + v['sha256'].removeprefix('sha256:')
    assert 'bytes' not in v or v['bytes'] == actual['bytes']
    CHECKED[v['path']] = actual
    return p


def differences(a, b, pointer=''):
    if type(a) is not type(b):
        return [pointer]
    if isinstance(a, dict):
        return [pointer + '/' + k for k in a.keys() ^ b.keys()] + [p for k in a.keys() & b.keys() for p in differences(a[k], b[k], pointer + '/' + k)]
    if isinstance(a, list):
        return [pointer] if len(a) != len(b) else [p for i, (x, y) in enumerate(zip(a, b)) for p in differences(x, y, pointer + '/' + str(i))]
    return [] if a == b else [pointer]


def put(p, value):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


entry_path = AUTHOR / 'source-view-remediation-author-v4/neutral-RP-two-text-only-compulsory-LK-additum-successor-v4.author.entry.json'
entry = read(entry_path)
proof_path = verify(entry['actualDeltaProof'])
proof = read(proof_path)
for key in ('roleInput', 'mappingInput', 'actualWholeRPPrimary', 'fullPage'):
    verify(proof[key])
role_path = verify(entry['successorRoles'])
mapping_path = verify(entry['successorRPMapping'])
old_roles = read(verify(proof['roleInput']))
new_roles = read(role_path)
old_mapping = read(verify(proof['mappingInput']))
new_mapping = read(mapping_path)
assert differences(old_roles, new_roles) == ['/corrections/0/newPartialRole/roleDe']
assert differences(old_mapping, new_mapping) == ['/decisions/82/rationale']
correction = new_roles['corrections'][0]
source = correction['wholeOriginalSourceDutyAndAllPartners']
whole_goals_path = AUTHOR / 'candidate/canonical504-current26-resource-links.inactive.json'
goals = {g['id']: g for g in read(whole_goals_path)['goals']}
partner_ids = source['wholeDecision']['canonicalGoalIds']
embedded_ids = [g['id'] for g in source['wholePartnerGoals']]
assert set(partner_ids) - set(embedded_ids) == {'b6327e98-8ab9-5d7f-b826-4023bc1a56a7'}
assert all(g == goals[g['id']] for g in source['wholePartnerGoals'])
assert correction['newPartnerWholeGoalUnchanged'] == goals['16b24dc5-0e48-5e3b-8307-01289db8d1a9']
for ref in (source['mappingBinding'], source['extractionBinding']):
    verify(ref)
actual_partner_bodies = [goals[gid] for gid in partner_ids] + [goals['16b24dc5-0e48-5e3b-8307-01289db8d1a9']]
actual_page = verify(proof['fullPage']).read_text()
assert 'Leistungsfach' in actual_page and 'Additum' in actual_page and '+3h' in actual_page
actual_reading = OWN / 'RP-v4-two-deltas-whole-source-and-nine-partners.actual-reading.json'
put(actual_reading, {'schemaVersion': 1, 'readAt': datetime.now(timezone.utc).isoformat(),
    'input': bind(entry_path), 'actualBindings': list(CHECKED.values()), 'sourcePhysicalPage': 42,
    'wholePageText': actual_page,
    'actualRasterSeen': bind(BASE / 'chemie-b008-source-view-v3-targeted-independent-a-root-v1/DE-RP-physical-42.actual-original.png'),
    'allHistoricalPartnerIdsPreserved': partner_ids, 'actualWholePartnerBodiesRead': actual_partner_bodies,
    'embeddedClusterOmissionResolvedByActualCanonicalRead': True,
    'actualCanonicalInput': bind(whole_goals_path),
    'sourceExtractionCourseAndLocatorNotSilentlyCorrected': True,
    'actualTextDeltas': {'role': proof['roleDeltas'], 'mapping': proof['mappingDeltas']},
    'sourceAndPartnerBodiesUnchangedFromV3': True,
    'ownV3ScientificReuse': bind(BASE / 'chemie-b008-source-view-v3-targeted-independent-a-root-v1/five-affected-source-model-EN-candidates.independent-A.identifier-corrected-first.verdict.json')})
verdict_path = OWN / 'RP-two-text-v4.independent-root.first.verdict.json'
put(verdict_path, {'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Root targeted independent first scientific judgment of two actual RP v4 text changes',
    'actualReading': bind(actual_reading),
    'reviews': [
        {'jsonPointer': '/corrections/0/newPartialRole/roleDe', 'decision': 'accept_bounded_secondary_fundamentum_role',
         'reasonDe': 'Die tatsächlich gesehene Originalseite 42 unterscheidet 6h gemeinsames Fundamentum und +3h Additum des Leistungsfachs. Primär-, Sekundärelemente und Brennstoffzellen sind je an einem Beispiel gemeinsame Pflicht. Die neue Formulierung hält aktuelle Entwicklungen UND weitere Beispiele für LK ausdrücklich verpflichtend; nur die Auswahl dieser Beispiele ist variabel. Der Beitrag von 16b umfasst ausschließlich den sekundären Typ. Er schließt weder die beiden anderen gemeinsamen Typen noch das zusätzliche LK-Soll ab.'},
        {'jsonPointer': '/decisions/82/rationale', 'decision': 'accept_bounded_partner_preserving_mapping_rationale',
         'reasonDe': 'Die ganze neue Rationale erhält die gleichen Pflichtunterschiede und sämtliche historischen Partner-IDs und Edges. Die vollständigen tatsächlichen Partnertexte wurden gelesen, einschließlich des im embedded Array fehlenden, unveränderten Quellen-/Argumente-Clusters b632 mit sechs Kindern. Das ganze Ziel16b verlangt Recherche, Bau/Funktion, Energetik, Bewertung, Vertrauenswürdigkeit/Urheberschaft und Zitate; die begrenzte Inhaltsklausel belegt diese Zusatzoperatoren nicht vollständig. Der vorhandene generische Extraction-LK-Tag und der alte Seitenlocator bleiben eigene Kurs-/Quellbindungsprobleme und werden durch diesen Textnachfolger nicht freigegeben.'}],
    'independence': {'freshV4PeerJudgmentsReadBeforeOwnFirst': False, 'priorV3DissentKnown': True,
        'scope': 'only two real v4 text deltas; original full source and exact retained whole partners reused/read',
        'noAuthorScienceSelfApproval': True},
    'remainingLKAdditumRequired': True, 'wholeSourceApproval': False, 'wholeCourseApproval': False,
    'nativeApproval': False, 'humanApproval': False, 'humanTrial': False,
    'newM7Closures': 0, 'restoredM7Bindings': 0, 'netStrictGain': 0, 'activeWrites': []})
freeze_path = OWN / 'RP-two-text-v4.independent-root.first.freeze.json'
put(freeze_path, {'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Own first read and verdict sealed before reading fresh v4 peer outcomes',
    'actualReading': bind(actual_reading), 'verdict': bind(verdict_path), 'script': bind(Path(__file__).resolve())})
print(json.dumps({'verdict': bind(verdict_path), 'firstFreeze': bind(freeze_path), 'strictGain': 0}))
