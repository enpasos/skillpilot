from pathlib import Path
from copy import deepcopy
import json, hashlib, datetime, os

ROOT = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
BASE = Path(__file__).resolve().parent
EVIDENCE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08'
AUTHOR = EVIDENCE / 'chemie-q3-twenty-whole-science-source-author-20261008-v1'

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}

def write(name, value):
    target = BASE / name
    assert not target.exists(), target
    tmp = target.with_name(target.name + '.pending')
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(tmp, target)

seals = [
    (AUTHOR / 'author-candidate.final.seal.json', 'e756e6bedbd17d14ef9337780c19e5b9e9a26f14026180550358a105bba1ef72', 'files', True),
    (EVIDENCE / 'chemie-q3-twenty-whole-science-source-independent-a-20261008-v1/whole20-40-science-source-A-P.independent-a.first.freeze.json', 'a6b473ca150723974c09b273862e7ead600eb0b2acc959042b62705c43e1b083', 'ownFiles', False),
    (EVIDENCE / 'chemie-q3-twenty-whole-science-source-independent-b-20261008-v1/whole20-whole40-science-source.independent-b.first.freeze.json', '765ecaf666288ecc91fea4bb9dbf53326784b88b70716c694e3aaebae1b3f297', 'files', False),
]
verified = []
for seal, expected, key, relative in seals:
    assert sha(seal) == expected
    rows = json.loads(seal.read_text())[key]
    for row in rows:
        file = seal.parent / row['relativePath'] if relative else ROOT / row['path']
        assert file.is_file() and sha(file) == row['sha256'] and file.stat().st_size == row['bytes'], file
    verified.append({'seal': binding(seal), 'actuallyVerifiedFrozenFiles': len(rows)})

source = AUTHOR / 'whole40.material-task-model-scoring-fresh-transfer.de-en.author-candidate.json'
before = json.loads(source.read_text())
after = deepcopy(before)
changes = []

def replace(case_id, path, expected, replacement):
    case = next(c for c in after['cases'] if c['caseId'] == case_id)
    node = case
    for key in path[:-1]:
        node = node[key]
    assert node[path[-1]] == expected, (case_id, path)
    node[path[-1]] = replacement
    changes.append({'caseId': case_id, 'path': path, 'before': expected, 'after': replacement})

c16 = next(c for c in before['cases'] if c['caseId'] == 'q3-16-a')
old16 = c16['freshTransfer']['modelResponse']['de']
assert c16['scoring']['criteria'][4]['criterion']['de'] == old16
new16 = 'Lokaler Angriff kann zunächst steigen, nachwachsende Passivschicht kann ihn begrenzen. Daraus folgt weder Immunität in jeder Lösung noch eine Änderung der Standardpotenziale der unveränderten Redoxpaare.'
replace('q3-16-a', ['freshTransfer', 'modelResponse', 'de'], old16, new16)
replace('q3-16-a', ['scoring', 'criteria', 4, 'criterion', 'de'], old16, new16)

# A battery's stored Wh alone do not establish device-voltage compatibility.
# This synthetic comparison explicitly provides regulated output packages;
# it makes no false claim that an individual zinc-air cell supplies 1.5 V.
c12 = next(c for c in before['cases'] if c['caseId'] == 'q3-12-a')
new12material = {
    'de': 'Fiktives Gerät braucht 1,5 V, 0,20 W für 20 h. Verglichen werden zwei ausdrücklich fiktive, nicht wiederaufladbare Versorgungspakete, deren geregelter Geräteanschluss jeweils nachweislich 1,5 V liefert. Beim Zink-Luft-Paket ist dafür ein geeigneter Spannungswandler vorhanden; die Einzelzellspannung wird nicht als 1,5 V behauptet. Die angegebenen nutzbaren Energien gelten am Geräteanschluss und enthalten bereits die Wandlerverluste. Alkali-Mangan-Paket: 3 Wh, 1 €, robust. Zink-Luft-Paket: 4 Wh, 1,50 €, benötigt Luftzufuhr, verliert nach Aktivierung schneller Kapazität bei Lagerung. Schematisch Alkali: Zn + 2 MnO₂ + H₂O → ZnO + 2 MnOOH; Zink-Luft: 2 Zn + O₂ → 2 ZnO. Beide haben getrennte Elektroden und einen ionischen Elektrolyten.',
    'en': 'A fictional device needs 1.5 V and 0.20 W for 20 h. Compare two explicitly fictional nonrechargeable power packages whose regulated device connectors are each verified to deliver 1.5 V. The zinc-air package has a suitable voltage converter; its individual cell voltage is not claimed to be 1.5 V. The stated usable energies apply at the device connector and already include converter losses. Alkaline-manganese package: 3 Wh, €1, robust. Zinc-air package: 4 Wh, €1.50, needs airflow and loses capacity faster in storage after activation. Schematic alkaline: Zn + 2 MnO₂ + H₂O → ZnO + 2 MnOOH; zinc-air: 2 Zn + O₂ → 2 ZnO. Both have separated electrodes and an ionic electrolyte.'
}
new12response = {
    'de': 'Zn gibt Elektronen ab; MnO₂ bzw. O₂ wird an der Kathode reduziert. Der Außenleiter liefert Strom, der Elektrolyt leitet Ionen. Der Bedarf beträgt 4 Wh. Bei der ausdrücklich verifizierten 1,5-V-Ausgangsspannung und den einschließlich Wandlerverlusten angegebenen nutzbaren Energien kann das fiktive Zink-Luft-Paket diesen Bedarf decken; das Alkali-Paket mit 3 Wh allein nicht. Geeigneter Luftzugang bleibt erforderlich. Ohne die Spannungs- und Anschlussangaben ließe sich aus Wh allein keine Geräteeignung folgern. Für lange Lagerung ist robustes Alkali plausibler, wobei mehr nutzbare Kapazität nötig ist. Preis, Materialverbrauch, Entsorgung und Versorgungssicherheit sind Kriterien; aus den Daten folgt kein allgemeiner Umweltgewinner. Primärzellen werden nicht als aufladbar behandelt.',
    'en': 'Zn donates electrons; MnO₂ or O₂ is reduced at the cathode. The external conductor supplies current and the electrolyte conducts ions. Demand is 4 Wh. Given the explicitly verified 1.5-V output and stated usable energies including converter losses, the fictional zinc-air package can supply this demand; the 3-Wh alkaline package alone cannot. Suitable airflow remains necessary. Without the voltage and connector data, Wh alone would not establish device compatibility. For long storage robust alkaline is more plausible but needs greater usable capacity. Price, material use, disposal and supply reliability are criteria; the data do not establish a universal environmental winner. Primary cells are not treated as rechargeable.'
}
new12criterion = {
    'de': '4 Wh berechnen und die materialgestützte Wahl sowohl an die verifizierte 1,5-V-Ausgangsspannung als auch an nutzbare Energie und Luftzugang binden; Wh allein beweist keine Geräteeignung.',
    'en': 'Calculate 4 Wh and bind the material-based choice to verified 1.5-V output, usable energy and airflow; Wh alone does not establish device compatibility.'
}
new12fresh = {
    'de': 'Der Bedarf beträgt 2 Wh. Bei unverändert verifiziertem 1,5-V-Ausgang erfüllt das Alkali-Paket mit 3 Wh die Energieanforderung und passt besser zur Lagerung. Für Zink-Luft bleiben Luftzufuhr und Aktivierungszustand Bedingungen. Das Urteil hängt vom Nutzungsprofil ab; eine Einzelzellspannung wird daraus nicht abgeleitet.',
    'en': 'Demand is 2 Wh. With the verified 1.5-V output unchanged, the 3-Wh alkaline package meets the energy requirement and better suits storage. Airflow and activation state remain conditions for zinc-air. Judgment depends on the use profile; no individual cell voltage is inferred.'
}
for language in ['de', 'en']:
    replace('q3-12-a', ['material', language], c12['material'][language], new12material[language])
    replace('q3-12-a', ['modelResponse', language], c12['modelResponse'][language], new12response[language])
    replace('q3-12-a', ['scoring', 'criteria', 2, 'criterion', language], c12['scoring']['criteria'][2]['criterion'][language], new12criterion[language])
    replace('q3-12-a', ['freshTransfer', 'modelResponse', language], c12['freshTransfer']['modelResponse'][language], new12fresh[language])
    replace('q3-12-a', ['scoring', 'criteria', 4, 'criterion', language], c12['scoring']['criteria'][4]['criterion'][language], new12fresh[language])

assert len(changes) == 12
unchanged = [a['caseId'] for a, b in zip(before['cases'], after['cases']) if a == b]
assert len(unchanged) == 38
assert all(a['wholeCurrentGoal'] == b['wholeCurrentGoal'] and a['evidence'] == b['evidence'] for a, b in zip(before['cases'], after['cases']))
write('whole40.only-two-genuine-case-remedies.author-v2.json', after)
write('two-case-only-twelve-field-scientific-remediation.delta.author.json', {
    'schemaVersion': 1, 'beforeWhole40': binding(source), 'afterWhole40': binding(BASE / 'whole40.only-two-genuine-case-remedies.author-v2.json'),
    'changes': changes, 'unchangedWholeCases': unchanged, 'whole40CurrentDEENBodiesAndE1G1ClaimsUnchanged': True,
    'q3-16-a': 'Only two incorrect German transfer/scoring statements corrected; English and entire principal work kept.',
    'q3-12-a': 'Actual voltage compatibility and already-net usable energy explicitly supplied, with conditional comparison. Source-role/V holds remain open.',
    'independentFollowupPending': True, 'activeWrites': 0, 'humanApproval': False, 'newStrictClosures': 0
})

materializer = json.loads((AUTHOR / 'native/p20.native-materializer.candidates.json').read_text())
two = deepcopy(materializer)
two['reviewId'] = 'chemie-q3-two-retained-whole-case-targeted-remediation-author-20261008-v2'
two['reviewedAt'] = datetime.datetime.now(datetime.timezone.utc).isoformat()
two['reviewer'] = 'Codex root author; two genuine independent first findings resolved as candidates, final independent followup pending'
two['goals'] = [r for r in two['goals'] if r['goalId'] in ['9f0d6d4c-f918-5a44-a9a2-7732c4e338f3', 'c95f6059-d7c2-5bcd-b61e-95e3577efdb2']]
assert len(two['goals']) == 2
p16 = next(r for r in two['goals'] if r['goalId'] == 'c95f6059-d7c2-5bcd-b61e-95e3577efdb2')
brief = next(r for r in p16['profile']['applicationCaseBriefs'] if r['id'] == 'q3-16-a')
assert brief['expectedPerformanceDe'].count(old16) == 2
brief['expectedPerformanceDe'] = brief['expectedPerformanceDe'].replace(old16, new16)
write('two-whole-P15-KEEP-P16-DE-targeted-remedy.native-materializer.author-candidates.json', two)
write('neutral-two-whole-corrosion-remediation.author.entry.json', {
    'schemaVersion': 1, 'verifiedExistingIndependentFirstSeals': verified,
    'retainedWholeCases': binding(source), 'whole40TargetedRemediation': binding(BASE / 'whole40.only-two-genuine-case-remedies.author-v2.json'),
    'explicitScientificDelta': binding(BASE / 'two-case-only-twelve-field-scientific-remediation.delta.author.json'),
    'twoWholeCurrent15and16NativeMaterializerCandidates': binding(BASE / 'two-whole-P15-KEEP-P16-DE-targeted-remedy.native-materializer.author-candidates.json'),
    'nativeCandidateScopeGoalIds': [r['goalId'] for r in two['goals']],
    'candidate12SourceAndVStillHOLD': True, 'wholeCaseScienceFirst15and16Retained': True,
    'nativeP15OriginalContentExact': two['goals'][0] == next(r for r in materializer['goals'] if r['goalId'] == two['goals'][0]['goalId']),
    'P16ProfileChange': 'Only q3-16-a expectedPerformanceDe changes: the two actual corrected scientific statements. Whole EN and other main/transfer branches unchanged.',
    'finalIndependentReviewPending': True, 'activeWrites': 0, 'humanApproval': False, 'strictClosureGain': 0
})
print(json.dumps({'actuallyVerifiedIndependentAndAuthorFiles': sum(v['actuallyVerifiedFrozenFiles'] for v in verified), 'changedWholeCases': 2, 'changedActualScientificFields': len(changes), 'unchangedWholeCases': len(unchanged), 'nativeFinalScope': 2, 'newClosures': 0}))
