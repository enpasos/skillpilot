# SPDX-License-Identifier: Apache-2.0
"""Prepare only an inactive, explicit eighteen-goal author packet; preserve all prior evidence."""
from pathlib import Path
import copy
import hashlib
import json
import struct

D = Path(__file__).resolve().parent
R = D.parents[6]
I = R / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-he9-nineteen-image-author-root-20261008-v1'
S = D.parent / 'biologie-he9-nineteen-current391-science-author-root-v1'
T = D.parent / 'biologie-he9-nineteen-targeted-alternatives-and-materials-author-root-v2'
F = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-flora-fauna20-final-raster-native-author-root-20261007-v1'
read = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, data):
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as out:
        out.write(data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, indent=2) + '\n')

omitted = '3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8'
goals = [g for g in read(S / 'current19-whole-DEEN-goals.actual.json')['goals'] if g['id'] != omitted]
assert len(goals) == 18
current_path = R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
assert sha(current_path) == 'ac2c3a825e48c4392364e9f3bd6abc9c0bbbf7040880f746c7fa49bd16426493'
current = read(current_path)
by = {g['id']: g for g in current['goals']}
assert all(by[g['id']] == g for g in goals)
ids = [g['id'] for g in goals]
write(D / 'current18-whole-DEEN-goals.actual.json', {'artifactKind': 'current-eighteen-whole-goals-inactive-author-input', 'landscapeId': current['landscapeId'], 'goals': goals, 'omittedGoalId': omitted, 'omissionReason': 'Unresolved genuine semantic split review; not a closure candidate', 'activeWrites': 0})

alt = {
1: 'Vereinfachter Augenschnitt mit Hornhaut, Irisöffnung, Linse, Netzhaut und Sehnerv.',
2: 'Ein Lichtstrahl tritt durch die Pupille und Linse und erreicht das umgekehrte Netzhautbild; ein Ausschnitt zeigt die Umwandlung von Licht in Nervensignale.',
3: 'Ein Sinneseindruck wird im Gehirn verarbeitet und führt zu einer bewussten Bewegung.',
4: 'Ein ausdrücklich vereinfachtes Modell vergleicht menschliche Farbwahrnehmung und die Wahrnehmung ultravioletter Blütenmuster bei einer Biene.',
5: 'Schutzbrille und angepasste Lautstärke verdeutlichen Sinnesorganschutz; ein Warnmotiv steht für beeinträchtigte Verarbeitung durch Drogen.',
6: 'Rote Blutkörperchen ohne Zellkern, ein weißes Blutkörperchen mit Zellkern und kleine Blutplättchen sind im Plasma schematisch unterschieden.',
7: 'Sauerstofftransport, Blutstillung und Abwehr sind als unterschiedliche Blutaufgaben schematisch dargestellt.',
8: 'Anti-B bindet im vereinfachten Modell über seine beiden Armenden an B-Merkmale zweier roter Blutkörperchen; A-Merkmale bleiben ungebunden.',
9: 'Vereinfachte Abwehrmotive unterscheiden aufgenommene Krankheitserreger von der Reaktion gegen fremdes gesundes Transplantatgewebe.',
10: 'Ein vereinfachtes HIV-Modell zeigt eine betroffene Abwehrzelle und die Begrenzung neuer Viruspartikel durch Therapie, ohne Heilung zu behaupten.',
11: 'Ein vereinfachter Eierstock zeigt Follikel, den durch LH ausgelösten Eisprung und den folgenden Gelbkörper.',
13: 'Zwei bekleidete Erwachsene respektieren eine deutlich ausgesprochene persönliche Grenze.',
14: 'TSH stimuliert im vereinfachten Modell die Schilddrüse; T4 wirkt hemmend auf die weitere TSH-Freisetzung zurück.',
15: 'Ein vereinfachtes Modell mit zwei homologen Chromosomenpaaren vergleicht zwei diploide mitotische Tochterzellen mit vier haploiden meiotischen Gameten.',
16: 'Eine ausdrücklich hypothetische Pflanzenkreuzung Aa mal Aa zeigt die möglichen Allelkombinationen AA, Aa, Aa und aa.',
17: 'Ein hypothetischer Stammbaum zeigt ein rezessives Merkmal bei einem Kind zweier heterozygoter, nicht betroffener Eltern.',
18: 'Ein als Ausschnitt bezeichnetes Karyogramm vergleicht zwei und drei Exemplare des Chromosoms21.',
19: 'Drei getrennte Motive unterscheiden Gentest, somatische Gentherapie und die Vermehrung gleicher DNA-Kopien in Bakterien.'}
versions = {2: 2, 8: 3, 11: 2, 15: 2}
prompts = sum([read(I / name)['images'] for name in ['first-five-exact-production-prompts.author.json', 'next-five-blood-exact-production-prompts.author.json', 'last-eight-noncontraception-exact-production-prompts.author.json']], [])
assert len(prompts) == 18 and {p['goalId'] for p in prompts} == set(ids)
images = []
for p in prompts:
    gid, ordinal = p['goalId'], p['ordinal']
    version = versions.get(ordinal, 1)
    path = I / 'candidates' / gid / f'candidate-v{version}.png'
    raw = path.read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', raw[16:24])
    prompt = I / 'prompts' / f'{gid}.v{version}.actual.prompt.md'
    provenance = path.parent / f'generation-v{version}.actual.provenance.json'
    assert prompt.is_file() and provenance.is_file()
    images.append({'ordinal': ordinal, 'goalId': gid, 'path': str(path.relative_to(R)), 'sha256': sha(path), 'version': version, 'width': width, 'height': height, 'provider': 'ChatGPT/Codex builtin image_gen', 'servingModel': 'not exposed by tool', 'promptPath': str(prompt.relative_to(R)), 'toolProvenancePath': str(provenance.relative_to(R)), 'altDe': alt[ordinal], 'fullImageAuthorInspectionBasis': 'Root actually viewed the generated full PNG; previous concrete defects and rejected variants are preserved. Final independent raster, width and native page decisions remain pending.', 'independentApproval': 'pending', 'humanApproval': False})
write(I / 'selected-eighteen-author-images.exact.json', {'artifactKind': 'eighteen-explicit-actual-PNG-author-selection', 'images': images, 'omittedGoalId': omitted, 'authorOnly': True, 'independentApproval': 'pending', 'humanApproval': False, 'strictGainClaimed': 0})
write(I / 'three-targeted-final-full-PNG-author-observations.actual.json', {'artifactKind': 'actual-generated-targeted-author-inspection', 'rows': [{'ordinal': 8, 'version': 3, 'actualDecision': 'KEEP_AUTHOR_CANDIDATE', 'basis': 'Only the correctly oriented two-arm anti-B bridge remains attached to two B-markers. False optional stem-bound antibodies and orphan fragment are gone; A-side remains unbound.'}, {'ordinal': 11, 'version': 2, 'actualDecision': 'KEEP_AUTHOR_CANDIDATE', 'basis': 'The falsely contiguous endometrial strip is removed. Correct ovarian follicle, LH-triggered ovulation and corpus luteum remain.'}, {'ordinal': 15, 'version': 2, 'actualDecision': 'KEEP_AUTHOR_CANDIDATE', 'basis': 'Caption now says four haploid gametes. Exact four parental chromosomes, four rods per mitotic daughter and two per gamete retained; no false all-four-unique assertion.'}], 'attentionForIndependentReview': [{'ordinal': 9, 'question': 'Judge the actual unlabelled immune-cell abstraction; do not infer a specific T-cell mechanism without presentation.'}, {'ordinal': 10, 'question': 'Judge whether the actual schematic implies a false RNA-only HIV multiplication mechanism; no approval from generation or author intention.'}], 'humanApproval': False, 'independentApproval': 'pending', 'strictGainClaimed': 0})

candidate = copy.deepcopy(read(T / 'P19.targeted-or-and-materials-closed-contract.author.candidates.json'))
candidate['goals'] = [g for g in candidate['goals'] if g['goalId'] != omitted]
assert [g['goalId'] for g in candidate['goals']] == ids
write(D / 'eighteen-current-closed-contract.author.candidates.json', candidate)
materials = copy.deepcopy(read(T / 'nineteen-whole-goals-forty-two-complete-DEEN-cases.author.json'))
materials['goals'] = [g for g in materials['goals'] if g['goalId'] != omitted]
assert len(materials['goals']) == 18 and sum(len(g['cases']) for g in materials['goals']) == 40
write(D / 'eighteen-whole-goals-forty-complete-DEEN-cases.exact.json', materials)
md = ['# Eighteen unchanged current whole goals: forty complete bilingual cases', '', 'Own synthetic materials; current reviewer input only. No real learner performance or human approval.', '']
for entry in materials['goals']:
    md += [f"## {entry['ordinal']}: {entry['goalId']}", '', entry['sourceScope'], '']
    for case in entry['cases']:
        md += [f"### {case['id']}", '']
        for lang in ['de', 'en']:
            md += [f'#### {lang.upper()}', '', case['material'][lang], '', case['task'][lang], '', case['modelAnswer'][lang], '']
write(D / 'eighteen-whole-goals-forty-complete-DEEN-cases.exact.md', '\n'.join(md) + '\n')

# Adapt only our new author utilities. No validator, contract or old review is changed.
prep = (F / 'prepare-final-twenty-raster-candidate.guarded.py').read_text()
for old, new in [('20', '18'), ('twenty', 'eighteen')]:
    prep = prep.replace(old, new)
write(D / 'prepare-final-eighteen-raster-candidate.guarded.py', prep)
native = (F / 'materialize-final-twenty-native-author.mts').read_text()
for old, new in [('biologie-flora-fauna20', 'biologie-he9-eighteen'), ('20261007', '20261008'), ('current20', 'current18'), ('native20', 'native18'), ('P20', 'P18'), ('twenty', 'eighteen'), ('371', '373'), ('length,20', 'length,18'), ('batchSize:20', 'batchSize:18'), ('===20', '===18'), ('records:20', 'records:18'), ('Subset:20', 'Subset:18'), ('Campaign:20', 'Campaign:18'), ('records:20', 'records:18'), ('zwanzig', 'achtzehn'), ('twenty actual', 'eighteen actual'), ('records:20', 'records:18')]:
    native = native.replace(old, new)
native = native.replace('materials.goals.length,20', 'materials.goals.length,18').replace('ids.length,20', 'ids.length,18')
native = native.replace("length,20)", "length,18)")
native = native.replace("../biologie-flora-fauna20-current391-author-v1/actual-whole-HE-G9-primary-reading.author.receipt.json", "../biologie-he9-nineteen-current391-science-author-root-v1/actual-whole-HE-G9-9-1-to-9-4-primary-reading.author.receipt.json")
native = native.replace("current-eighteen-retained-AM.exact-binding.author.receipt.json", "retained-eighteen-AM.actual-boundary.json")
write(D / 'materialize-final-eighteen-native-author.mts', native)
config = copy.deepcopy(read(F / 'native20.neutral.batch.config.json'))
config.update(batchId='biologie-he9-eighteen-current391-author-v1-20261008', bookId='biologie-he9-eighteen-current391-author-v1', title='Biologie – achtzehn unveränderte ganze Ziele zu Sinnesorganen, Blut, Hormonen und Genetik', outputDirectory=str((D / 'native-raster-candidate').relative_to(R)), goalIds=ids)
write(D / 'native18.neutral.batch.config.json', config)
write(D / 'retained-eighteen-AM.actual-boundary.json', {'role': 'Retain genuine existing A/M evidence for eighteen unchanged goals; exclude genuinely contested ordinal12', 'wholeGoalBodiesUnchanged': True, 'excludedGoalId': omitted, 'existingActualTechnicalSealPath': str((S / 'retained-AM-technical-independent-a/completed-retained-A19-M25-cards17-views8.independent-a.exact.freeze.json').relative_to(R)), 'existingSealSha256': sha(S / 'retained-AM-technical-independent-a/completed-retained-A19-M25-cards17-views8.independent-a.exact.freeze.json'), 'cardsAndVisibilityReviewStillValidForUnchangedEighteen': True, 'newScientificDecisions': 0, 'humanApproval': False, 'strictGainClaimed': 0})
print(json.dumps({'selectedPNGs': 18, 'wholeGoals': 18, 'completeBilingualCases': 40, 'omittedSplitGoal': omitted, 'independentReviewPending': True, 'activeWrites': 0, 'strictGainClaimed': 0}))
