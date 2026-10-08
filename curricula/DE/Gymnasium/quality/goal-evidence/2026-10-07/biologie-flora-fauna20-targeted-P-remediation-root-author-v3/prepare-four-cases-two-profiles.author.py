# SPDX-License-Identifier: Apache-2.0
"""Correct two independently confirmed P findings, preserving sealed originals."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

root = Path.cwd()
own = Path(__file__).resolve().parent
before = own.parent / 'biologie-flora-fauna20-current391-author-v1'
def read(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def write(name, value):
    p = own / name
    with p.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def binding(p): return {'path': str(p.relative_to(root)), 'sha256': sha(p), 'bytes': p.stat().st_size}
seal = before / 'author.current-whole-text-P20-source-AM.first.freeze.json'
for r in read(seal)['frozenFiles']:
    assert sha(root / r['path']) == r['sha256'].removeprefix('sha256:'), r['path']
materials_path = before / 'materials-scope-precision-v2/twenty-whole-goals-forty-common-DEEN-cases.author-v2.json'
original = read(materials_path)
materials = copy.deepcopy(original)
p_original = read(before / 'P20.current-text-preimage.author.candidates.json')
candidates = copy.deepcopy(p_original)
candidates['reviewId'] = 'biologie-flora-fauna20-current391-targeted-p-author-v3'
candidates['reviewedAt'] = datetime.now(timezone.utc).isoformat()
candidates['reviewer'] = 'Codex root author; independently confirmed findings remediated, no independent approval'
g9, g10 = materials['goals'][8:10]
c1, c2 = g9['cases']
c1['material'] = {
 'de': 'Eigene begrenzte Referenzhilfe für drei Pflanzen: Gänseblümchen besitzen im vorgegebenen Modell weiße Zungenblüten um eine gelbe Mitte und niedrige Rosettenblätter; Klee besitzt dreiteilige Blätter und runde Blütenköpfe; die hier gezeigte kletternde Gartenbohne besitzt windende Sprosse, dreiteilige Blätter und Hülsen. Davon getrennte unbekannte Proben: A zeigt weiße Zungenblüten mit gelber Mitte und eine niedrige Blattrosette; B zeigt dreiteilige Blätter und runde Blütenköpfe; C zeigt einen windenden Spross, dreiteilige Blätter und Hülsen. A/B wachsen spontan, C wird für die Ernte angebaut. Die Referenzhilfe enthält keine Zuordnung von Probencodes zu Pflanzennamen.',
 'en': 'Own bounded reference guide for three plants: in the supplied model daisies have white ray florets around a yellow centre and low rosette leaves; clover has three-part leaves and round flower heads; the climbing garden bean shown here has twining shoots, three-part leaves and pods. Separate unknown specimens: A shows white ray florets with a yellow centre and a low leaf rosette; B shows three-part leaves and round flower heads; C shows a twining shoot, three-part leaves and pods. A/B grow spontaneously and C is cultivated for harvest. The reference guide gives no specimen-code-to-name assignments.'}
c1['task'] = {
 'de': 'Bestimme A, B und C innerhalb des vorgegebenen Dreiersatzes mithilfe der Referenzmerkmale. Begründe jede Zuordnung mit passenden Merkmalen und unterscheide Wild- und Nutzpflanzen mit einer Grenze dieser Einteilung.',
 'en': 'Identify A, B and C within the supplied set of three using the reference traits. Justify each assignment with matching features and distinguish wild and crop plants with a limit of that classification.'}
c1['modelAnswer']['de'] = 'A passt zum Gänseblümchen: weiße Zungenblüten, gelbe Mitte und niedrige Rosette stimmen mit der Referenz überein. B passt zum Klee aufgrund dreiteiliger Blätter und runder Blütenköpfe. C passt zur gezeigten Gartenbohne aufgrund windenden Sprosses, dreiteiliger Blätter und Hülsen. Spontan wachsende Beispiele sind hier Wildpflanzen, die angebaute Bohne eine Nutzpflanze. Nutzen ist ein menschlicher Kontext: Klee kann auch als Futter kultiviert werden. Der vereinfachte Schlüssel identifiziert nicht alle ähnlich aussehenden Arten und begründet keine Essbarkeit.'
c1['modelAnswer']['en'] = 'A matches the daisy because white ray florets, a yellow centre and a low rosette match the reference. B matches clover through three-part leaves and round flower heads. C matches the supplied garden bean through its twining shoot, three-part leaves and pods. Spontaneously growing examples are wild plants here; the cultivated bean is a crop. Use is a human context: clover can also be grown for fodder. The simplified key does not identify every lookalike or establish edibility.'
c2['material'] = {
 'de': 'Eigene begrenzte Referenztabelle: Das gezeigte Eichenblatt hat einen ungeteilten gelappten Umriss, das gezeigte Lindenblatt ist herzförmig und das gezeigte Eschenblatt aus vielen schmalen Fiederblättchen zusammengesetzt. Davon getrennte unbekannte Blattproben: X ist eine ungeteilte gelappte Blattfläche, Y eine herzförmige Blattfläche, Z ein zusammengesetztes Blatt mit vielen schmalen Fiederblättchen. Die Tabelle ordnet keine Probencodes zu. Ergänzender Nutzungsfall: Eine Linde wächst wild am Waldrand, eine andere wird im Garten gezielt für einen Nutzungszweck gepflanzt.',
 'en': 'Own bounded reference table: the depicted oak leaf has a single lobed blade, the depicted linden leaf is heart-shaped and the depicted ash leaf is compound with many narrow leaflets. Separate unknown leaf specimens: X is a single lobed blade, Y a heart-shaped blade and Z a compound leaf with many narrow leaflets. The table assigns no specimen codes. Additional use case: one linden grows wild at a woodland edge and another is intentionally planted in a garden for a use.'}
c2['task'] = {
 'de': 'Bestimme X, Y und Z im begrenzten Referenzsatz und begründe jede Zuordnung mit dem Blattmerkmal. Unterscheide anschließend Vorkommen und Nutzung und erläutere Grenzen einer Bestimmung anhand eines einzigen Merkmals.',
 'en': 'Identify X, Y and Z within the bounded reference set and justify each assignment with its leaf feature. Then distinguish occurrence from use and explain the limits of identifying from one feature.'}
# Keep the already correct complete biological model answers of case 2.
for c in g10['cases']:
    for lang in ['de', 'en']:
        c['task'][lang] = c['task'][lang].split(' ohne beide Themen')[0] if lang == 'de' else c['task'][lang].split(' without asserting')[0]
        c['task'][lang] = c['task'][lang].replace(' Der gewählte Vertiefungsschwerpunkt bleibt Vogel.', '').replace(' Bird remains the selected in-depth topic.', '')
        if not c['task'][lang].endswith('.'): c['task'][lang] += '.'
        c['modelAnswer'][lang] = c['modelAnswer'][lang].replace(' HE6.2 sieht Vogel oder Fisch als Vertiefung vor.', '').replace(' HE6.2 specifies bird or fish as the in-depth choice.', '')
        c['modelAnswer'][lang] = c['modelAnswer'][lang].replace(' Beide gemeinsamen Fälle vertiefen Vögel; Fisch ist nur eine zulässige andere Quellenwahl.', '').replace(' Both common cases deepen birds; fish is a permissible alternative source choice.', '')
p9, p10 = candidates['goals'][8:10]
for record, entry in [(p9, g9), (p10, g10)]:
    for expectation, case in zip(record['profile']['expectations'], entry['cases']):
        expectation['observablePerformanceDe'] = case['task']['de']
        expectation['observablePerformanceEn'] = case['task']['en']
p10['profile']['expectations'][1]['essentialUnderstandingDe'] = 'Nicht jeder Vogel fliegt oder besitzt Schwimmhäute; unterschiedliche Bau- und Funktionsmerkmale passen zu unterschiedlichen Lebensraumbedingungen, ohne eine Rangfolge höherer Lebewesen oder individuelle absichtliche Formänderung zu begründen.'
p10['profile']['expectations'][1]['essentialUnderstandingEn'] = 'Not every bird flies or has webbed feet; different structural and functional traits fit different habitat conditions without implying a rank of superior organisms or intentional individual changes in form.'
for record, entry in [(p9, g9), (p10, g10)]:
    for brief, case in zip(record['profile']['applicationCaseBriefs'], entry['cases']):
        assert brief['id'] == case['id']
        for lang, suffix in [('de','De'), ('en','En')]:
            brief['taskDemand'+suffix] = case['material'][lang] + ' ' + case['task'][lang]
            brief['expectedPerformance'+suffix] = case['modelAnswer'][lang]
            brief['understandingFocus'+suffix] = ' '.join(e['essentialUnderstanding'+suffix] for e in record['profile']['expectations'])
    record['reason'] = 'Gezielte Autor-Korrektur zweier unabhängig bestätigter P-Befunde; ganze biologische Fälle, keine menschliche Prüfung oder reale Lernendenleistung. Unabhängige Nachprüfung der geänderten Fälle steht aus.'
assert all(materials['goals'][i] == original['goals'][i] for i in range(20) if i not in [8,9])
assert all(candidates['goals'][i] == p_original['goals'][i] for i in range(20) if i not in [8,9])
assert all(m['wholeGoal'] == o['wholeGoal'] for m,o in zip(materials['goals'], original['goals']))
assert p10['dissent'] == p_original['goals'][9]['dissent'], 'Curricular choice remains explicitly preserved outside assessed performance'
write('twenty-whole-goals-forty-common-DEEN-cases.author-v3.json', materials)
write('P20.targeted-two-profiles.author-v3.candidates.json', candidates)
config = read(before / 'P20.current-text-preimage.author.config.json')
config['reviewId'] = candidates['reviewId']
config['reviewPath'] = str((own / 'P20.targeted-two-profiles.author-v3.review.jsonl').relative_to(root))
write('P20.targeted-two-profiles.author-v3.config.json', config)
write('targeted-four-cases-two-P-findings.author.receipt.json', {
 'role': 'root author targeted remediation; independent recheck pending',
 'originalAuthorSeal': binding(seal), 'originalWholeMaterials': binding(materials_path),
 'confirmedFindingGoalOrdinals': [9,10], 'changedWholeCases': [c['id'] for g in [g9,g10] for c in g['cases']],
 'unchangedWholeCases': 36, 'unchangedOtherWholeProfiles': 18, 'unchangedWholeGoalBodies': 20,
 'conditionalFishCases': 'unchanged, separate and explicitly conditional',
 'sourceChoiceBoundary': 'preserved exactly in reviewer dissent; not tested as biological performance',
 'activeWrites': 0, 'strictGainClaimed': 0, 'humanApproval': False})
print('Prepared four targeted whole-case corrections and two P-profile corrections; remaining18 unchanged. No active integration.')
