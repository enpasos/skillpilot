"""Two text-only successor fields; no active mapping or review mutation."""
import copy
import hashlib
import json
from pathlib import Path
import subprocess

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[7]
V3 = OWN.parent / 'source-view-remediation-author-v3'

def binding(p):
    p = Path(p)
    b = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, obj):
    p = OWN / name
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
    return p

def diffs(a, b, path=''):
    if isinstance(a, dict) and isinstance(b, dict) and a.keys() == b.keys():
        return sum([diffs(a[k], b[k], path+'/'+k) for k in a], [])
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        return sum([diffs(x,y,path+'/'+str(i)) for i,(x,y) in enumerate(zip(a,b))], [])
    return [] if a == b else [{'jsonPointer': path, 'before': a, 'after': b}]

old_roles = V3 / 'three-secondary-partial-source-companions-four-view-occurrences.author-candidates.json'
old_mapping = V3 / 'mapping/DE-RP-existing-partners-plus-one-secondary.partial-author-candidate.json'
roles_before = json.loads(old_roles.read_text()); roles = copy.deepcopy(roles_before)
mapping_before = json.loads(old_mapping.read_text()); mapping = copy.deepcopy(mapping_before)
before = roles['corrections'][0]['newPartialRole']['roleDe']
after = ('Begrenzter Fundamentum-Beitrag des sekundären elektrochemischen Strom-/Spannungsquellentyps an einem konkreten Beispiel: Aufbau, elektrochemische Funktion beim Entladen und Möglichkeit der Wiederaufladung erläutern. '
         'Für Grund- und Leistungsfach sind Primärelemente, Sekundärelemente und Brennstoffzellen mit jeweils einem Beispiel gemeinsame Pflicht; sämtliche alten Partner bleiben erhalten. '
         'Für das Leistungsfach sind zusätzlich aktuelle Entwicklungen der chemischen Energiespeicherung und weitere Beispiele elektrochemischer Strom- und Spannungsquellen verpflichtend. Nur die konkrete Auswahl dieser weiteren Beispiele ist variabel; der Additum-Beitrag wird durch diese begrenzte Teilrolle nicht abgeschlossen.')
roles['corrections'][0]['newPartialRole']['roleDe'] = after
mapping['decisions'][82]['rationale'] = mapping['decisions'][82]['rationale'].replace(before, after)
assert mapping_before['decisions'][82]['rationale'] != mapping['decisions'][82]['rationale']
rd = diffs(roles_before, roles); md = diffs(mapping_before, mapping)
assert [r['jsonPointer'] for r in rd] == ['/corrections/0/newPartialRole/roleDe']
assert [r['jsonPointer'] for r in md] == ['/decisions/82/rationale']
assert mapping['mappings'] == mapping_before['mappings']
rp = write(old_roles.name, roles)
mp = write('mapping/'+old_mapping.name, mapping)
pdf = ROOT / 'curricula/DE/Gymnasium/input/RP/Chemie_Sekundarstufe_II_MSS_2022.pdf'
page = OWN / 'RP-original-physical-042.actual-full-page.txt'
proc = subprocess.run(['pdftotext', '-f', '42', '-l', '42', '-layout', str(pdf), str(page)], check=True)
text = page.read_text()
for phrase in ['(Fundamentum)', '(Additum)', 'aktuelle Entwicklung', 'weitere Beispiele', '(jeweils ein Beispiel)']:
    assert phrase in text, phrase
proof = write('exact-two-text-deltas-with-whole-source-and-partners.actual.json', {
    'schemaVersion':1, 'role':'Author successor and technical preservation proof, not a scientific approval',
    'roleInput':binding(old_roles), 'mappingInput':binding(old_mapping),
    'roleDeltas':rd, 'mappingDeltas':md,
    'allOriginalDecisionAndEdgeBodiesExceptNamedRationaleExact':True,
    'otherFourV3ContributionsExactReuse':True,
    'actualWholeRPPrimary':binding(pdf), 'physicalPage':42, 'fullPage':binding(page),
    'remainingLKAdditumRequired':True, 'wholeCourseApproval':False,
    'nativeApproval':False, 'sourceApproval':False, 'humanApproval':False,
    'strictGain':0, 'activeWrites':[],
})
v3_entry = V3 / 'neutral-three-secondary-one-EN-one-MV-whole-remediation-v3.author-review.entry.json'
v3_seal = V3 / 'three-secondary-one-EN-one-MV-author-remediation-v3.first.freeze.json'
entry = write('neutral-RP-two-text-only-compulsory-LK-additum-successor-v4.author.entry.json', {
    'schemaVersion':1, 'role':'Targeted author candidate for the RP Fundamentum/Additum scope explanation only',
    'unchangedOriginalV3Entry':binding(v3_entry), 'unchangedOriginalV3FirstSeal':binding(v3_seal),
    'successorRoles':binding(rp), 'successorRPMapping':binding(mp), 'actualDeltaProof':binding(proof),
    'actualWholeRPPrimary':binding(pdf), 'actualOriginalPhysicalPage42':binding(page),
    'scientificReviewPending':True, 'wholeCourseApproval':False, 'nativeApproval':False,
    'sourceApproval':False, 'humanApproval':False, 'humanTrial':False, 'strictGain':0, 'activeWrites':[],
})
write('RP-two-text-only-LK-additum-author-v4.first.freeze.json', {
    'schemaVersion':1, 'role':'Immutable first author successor seal, not a review',
    'inputs':[binding(old_roles), binding(old_mapping), binding(v3_entry), binding(v3_seal),binding(pdf)],
    'outputs':[binding(rp),binding(mp),binding(page),binding(proof),binding(entry),binding(Path(__file__))],
    'scientificApproval':False, 'activeWrites':[], 'strictGain':0,
})
print(json.dumps({'entry':binding(entry), 'changedFieldCount':len(rd)+len(md), 'activeWrites':[], 'strictGain':0}))
