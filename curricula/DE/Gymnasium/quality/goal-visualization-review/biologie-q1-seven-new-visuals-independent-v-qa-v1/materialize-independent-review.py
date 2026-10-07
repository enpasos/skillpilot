"""Bind an already performed independent visual review; never edit input assets."""
from datetime import datetime, timezone
from hashlib import sha256
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[6]
OUT = Path(__file__).resolve().parent
if (OUT / 'independent-visual-review.final.freeze.json').exists():
    raise SystemExit('Frozen review exists; preserve it and create a separate continuation package.')
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-new-visuals-author-v1'
GOALS = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-component-native-source-preparation-author-v6/seven-resolved-goals-and-prerequisite-contract.author-candidate.json'
NOW = datetime.now(timezone.utc).isoformat()
REVIEWER = 'Codex independent biology Q1 actual visual reviewer /root/biology_q1_seven_visuals_independent_v; not the image author'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def digest(path):
    return sha256(path.read_bytes()).hexdigest()


def binding(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'bytes': path.stat().st_size}


def text_digest(value):
    return sha256(value.encode('utf-8')).hexdigest()


def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


FINDINGS = {
    'ac9e824f-003c-50ac-8751-2b8456004c63': {
        'science': 'Ein einzelnes schematisches Chromosom öffnet sich zur Doppelhelix; der goldene, eingeklammerte DNA-Abschnitt bezeichnet ein Gen. Gen ist Teil der DNA und keine zusätzliche freischwebende Struktur. Das Modell behauptet keine maßstäbliche Genlänge oder vollständige Chromosomenverpackung.',
        'phone': 'Chromosom, DNA und Gen sind bei 360 px deutlich lesbar; die drei Pfeile, die Entfaltung und der goldene Abschnitt bleiben getrennt erkennbar.',
        'desktop': 'Bei 680 px sind Doppelhelix, abstrahierte Verpackung und Genklammer gut erkennbar. Keine unleserliche Fachinformation im Bild.',
        'limits': 'Die unbeschrifteten Verpackungsschleifen und Größenverhältnisse sind schematisch. Das Bild ist Orientierung, kein maßstäbliches Molekülmodell.',
    },
    'bfb5dfb6-8e35-5452-b581-96e061d8b826': {
        'science': 'Links vier Paarpositionen vor/nach; nur die dritte ändert sich G-C zu A-T. Alle anderen Paarungen sind komplementär und bleiben erhalten. Rechts zwei lila und zwei blaue Modellchromosomen vor, drei lila und zwei blaue nach: Zahländerung eines Typs, keine Strukturänderung. Die Modellbeschriftung behauptet keine menschliche Normalzahl.',
        'phone': 'Bei 360 px sind beide Hauptüberschriften, Pfeile, die markierte Basenpaarposition und vier gegenüber fünf Chromosomen klar. Die benötigten G/C/A/T-Buchstaben an der markierten Stelle bleiben lesbar. Kleine Typ-Untertitel sind entbehrlich; Typ und Anzahl werden auch grafisch gezeigt.',
        'desktop': 'Bei 680 px können alle vier Basenpaarpositionen und 2×/3×-Typzahlen kontrolliert werden. Markierungen zeigen genau die betroffene Paarposition bzw. den zusätzlichen lila Typ.',
        'limits': 'Basenfarben bilden keine durchgehend kodierte A/C/G/T-Legende; die Buchstaben bestimmen die Paarung. Ein Beispiel zeigt keine vollständige Taxonomie aller Punktmutationen.',
    },
    '5eb7c923-469d-5934-b1e8-292e1bb40d95': {
        'science': 'Drei getrennte Modelle zeigen DNA-Änderung ohne dargestellten Chromosomenzahlwechsel, interstitiellen Abschnittsverlust bei einem Chromosom und 2+2 zu 3+2 Modellchromosomen. Beim Strukturmodell bleibt das Chromosom sichtbar kürzer; es wird kein bloßer Farbwechsel als Deletion ausgegeben. Die DNA-Symbole tragen keine Basenbuchstaben und behaupten deshalb keine unzulässige konkrete Paarung.',
        'phone': 'Gen, Chromosom und Genom sind bei 360 px lesbar. Goldene DNA-Markierung, verkürztes Chromosom und zusätzliches lila Chromosom bleiben erkennbar. Der kleine Werbesatz rechts unten wird für keine fachliche Aussage benötigt.',
        'desktop': 'Bei 680 px sind alle Vorher-/Nachher-Modelle und die entfernte gelbe Zwischenregion deutlich getrennt. Das Zusatzschild verdeckt kein Modellobjekt.',
        'limits': 'Der Abschnittsverlust ist ein strukturelles Beispiel; das Bild erklärt weder alle Chromosomenmutationen noch eine konkrete Zentromerposition. Ursachen und vollständige Konsequenzen werden im Lernprozess anhand der Zielmaterialien geprüft, nicht durch dieses Orientierungsbild ersetzt.',
    },
    '3a0d6c82-f9f0-5ad1-bb0b-b948e4450d04': {
        'science': 'UV-Exposition wird mit Schatten, Hut und bedeckender Kleidung kontrastiert. DNA-Vergrößerung hat durchgehende Rückgrate; das orange, verbundene Lesionssymbol liegt an zwei benachbarten Stellen derselben Strangseite und zeigt keinen Doppelstrangbruch. Es ist kein atomgenaues CPD-Strukturdiagramm. Reststrahlen und Risiko verringern vermeiden eine Zusage völligen Schutzes.',
        'phone': 'UV, Schutz und Risiko verringern sind bei 360 px gut lesbar. Exponierte und geschützte Person, Kleidung/Hut und DNA-Markierung bleiben erkennbar. Die molekulare Unterstruktur ist ein Orientierungssymbol; ihre präzise Chemie wird nicht als am Handy lesepflichtige Information behandelt.',
        'desktop': 'Bei 680 px sind die beiden zusammenhängenden orangefarbenen Lesionsmarkierungen, die intakten blauen Rückgrate und gestrichelte Restexposition sichtbar. Das Bild behauptet nicht, dass jede Läsion eine bleibende Mutation wird.',
        'limits': 'Die Flasche ist ohne Produktversprechen dargestellt und dient nicht als Nachweis eines bestimmten Lichtschutzfaktors. Die Sonne und DNA-Läsion sind Schemata; Exposition, Reparatur und bleibende Mutation werden nicht gleichgesetzt.',
    },
    '9d830422-acc7-5fa8-aee9-4dae4cedbf49': {
        'science': 'Eine frühe gemeinsame Embryonalzelle verzweigt in Körperzell- und Keimbahnlinie. Die spätere somatische Markierung bleibt bei den sichtbaren Nachfolgezellen ihres eigenen Asts; andere Linien erhalten keinen Stern. Beide Keimzellmodelle sind derselbe generische Typ, kein Eizelle-plus-Spermium-Modell eines Elternteils. Der gestrichelte Pfeil mit möglich zeigt bedingte Weitergabe an Nachkommen, keine sichere Vererbung oder Häufigkeit.',
        'phone': 'Bei 360 px sind Körperzellen, Keimbahn, möglich und Nachkommen lesbar. Die Sternverteilung, Linienverzweigung und gestrichelte Weitergabe bleiben klar. Frühe Embryonalzelle, Keimzellen und nur diese Zelllinie sind kleinere ergänzende Beschriftungen; die gemeinsame frühe Vorläuferzelle und die Begrenzung auf einen Ast werden zusätzlich durch die Struktur getragen.',
        'desktop': 'Bei 680 px sind auch Embryonalzelle und die Zelllinienklammer gut lesbar. Es gibt keine Bildverbindung von der somatischen Markierung zu Nachkommen und keinen unbedingten Vererbungspfeil.',
        'limits': 'Sterne markieren Mutation, keine Krankheit und keinen bestimmten Phänotyp. Die gezeichnete Anzahl und Tiefe der Äste ist keine Häufigkeit oder reale Zahl der Teilungsschritte. Der Zeitpunkt wird durch Verzweigungspositionen getragen, nicht durch einen Zeitmaßstab.',
    },
    'd0c3e6a7-581b-57bd-8027-e940c6b77af8': {
        'science': 'Links zwei gleich dargestellte DNA-Modelle mit Gleichheitszeichen und unterschiedlichen Lichtbedingungen; rechts ein ausdrücklich markierter DNA-Unterschied mit Ungleichheitszeichen unter gleichem Licht. Der Pflanzenunterschied ist ein Kontrollmodell, kein Identitätsbeweis aus dem Erscheinungsbild. Das Fragezeichen und Merkmal allein reicht nicht halten die Grenze eines isolierten Phänotypbefunds sichtbar.',
        'phone': 'Bei 360 px sind Modifikation, Mutation und Merkmal allein reicht nicht gut lesbar. DNA =/≠, Sonne/Wolke und Fragezeichen bleiben klar. Die schmalen Genotyp-/Umwelt-Untertitel sind klein; der Kernvergleich wird zusätzlich durch Symbole und wiederholte Umweltszene getragen.',
        'desktop': 'Bei 680 px sind gleiche bzw. unterschiedliche Umwelt, identische bzw. markierte DNA und die Grenzen eines alleinigen Pflanzenbefunds deutlich. Links ändern sich DNA-Symbole nicht.',
        'limits': 'Keine artgenaue Pflanzenmorphologie oder universelle Licht-Wachstumsregel wird behauptet. Unterschiedlicher Genotyp allein ist ohne Vergleichs- und Entstehungsdaten kein Nachweis eines neuen Mutationsereignisses; der markierte DNA-Unterschied dient dem vorgegebenen Orientierungsmodell, nicht einer vollständigen Diagnose.',
    },
    'aab2a358-b2ee-57a5-a957-8fb9845506b1': {
        'science': 'Alle drei Ausschnitte haben dieselben sechs Paarpositionen. Mitte A-C-Fehlpaarung an Position 3; links A-T nach Reparatur, rechts mögliche G-C-Paarung nach erneuter Kopie des C-tragenden Strangs. Die fünf übrigen Paarpositionen stimmen exakt überein. Der linke Pfeil zeigt vom Fehler zur Reparatur; der rechte gestrichelte Pfeil und Kann bleiben zeigen einen möglichen unreparierten Kopierweg. Kein unbeabsichtigter Abschnittsverlust und kein garantierter Reparaturerfolg.',
        'phone': 'Bei 360 px sind Kontrolle und Reparatur, Kopierfehler, Repariert und Kann bleiben lesbar. A-C/A-T/G-C an der markierten Position, Pfeilrichtungen und sechs gleich lange Leiterabschnitte bleiben erkennbar. Weitere Kopie ist kleiner; gestrichelter Weg und Kann bleiben tragen die notwendige Unterscheidung zusätzlich.',
        'desktop': 'Bei 680 px können alle sechs Paarungen in jedem Ausschnitt geprüft werden; Lupe verdeckt die notwendige Fehlpaarungskennung nicht. Reparatur- und möglicher Fortsetzungsweg sind getrennt.',
        'limits': 'Das Bild zeigt nur die mögliche mutierte Kopie, nicht sämtliche Tochter-DNA-Moleküle. Es behauptet keine Erfolgsquote. Basenbuchstaben, nicht eine einheitliche Farbskala, tragen die Paarungsinformation.',
    },
}

selection_path = AUTHOR / 'seven-selected-images-and-alt-text.author-candidate.json'
render_path = AUTHOR / 'actual-360-and-680-browser-rendering.json'
freeze_path = AUTHOR / 'seven-new-raster-author.final.freeze.json'
canonical_path = AUTHOR / 'canonical-390-with-seven-images.author-candidate.inert-envelope.json'
selection = read(selection_path)['decisions']
renders = read(render_path)['rows']
author_freeze = read(freeze_path)
goals = {g['id']: g for g in read(GOALS)['goals']}
canonical = json.loads(read(canonical_path)['candidateCanonicalUTF8'])
canonical_goals = {g['id']: g for g in canonical['goals']}
assert set(FINDINGS) == set(goals) == {r['goalId'] for r in selection}
author_errors = []
for f in author_freeze['files']:
    p = AUTHOR / f['path']
    if digest(p) != f['sha256'] or p.stat().st_size != f['bytes']:
        author_errors.append(str(p.relative_to(ROOT)))
assert not author_errors, author_errors

input_paths = {selection_path, render_path, freeze_path, canonical_path, GOALS,
               ROOT / 'AGENTS.md', ROOT / 'LICENSING.md',
               ROOT / 'docs/concept/skill-graph/atomic-goal-visualizations.md',
               ROOT / 'docs/qa-ci/chemie-biologie-m7-goaltext-2026-09-30.md',
               AUTHOR / 'tools/render-actual-display.mjs'}
provenance_paths = [AUTHOR / n for n in [
    'actual-eight-generation-output-provenance.json',
    'actual-somatic-and-uv-revision-v2-provenance.json',
    'actual-somatic-revision-v3-provenance.json']]
input_paths.update(provenance_paths)
provenance_rows = read(provenance_paths[0])['actualOutputs'] + read(provenance_paths[1])['actualOutputs'] + [read(provenance_paths[2])]
style_refs = [ROOT / f'app/public/assets/goal-visualizations/biologie/{i}/{i}.png' for i in [
    '9e459608-bdea-55a1-b9c5-214bbd741be6', '26aa47b7-e5cc-5131-8980-0ec3271758b6']]
input_paths.update(style_refs)

rows, native_rows, technical_rows = [], [], []
for item in selection:
    goal_id = item['goalId']
    goal = goals[goal_id]
    image_path = ROOT / item['selectedImagePath']
    prompt_path = ROOT / item['actualPromptPath']
    assert digest(image_path) == item['assetSha256']
    assert digest(prompt_path) == item['actualPromptSha256']
    input_paths.update([image_path, prompt_path])
    for key in ['id', 'title', 'description', 'titleEn', 'descriptionEn']:
        assert canonical_goals[goal_id][key] == goal[key]
    links = canonical_goals[goal_id]['resourceLinks']
    assert len(links) == 1 and links[0]['skillpilotId'] == goal_id
    assert links[0]['altText'] == item['altText']
    assert links[0]['provider'] == 'ChatGPT/Codex image_gen built-in'
    p_rows = [p for p in provenance_rows if p.get('workspacePath') == item['selectedImagePath']]
    assert len(p_rows) == 1 and p_rows[0]['sha256'] == item['assetSha256']
    original = Path(p_rows[0]['actualToolOutputPath'])
    original_verified = original.exists() and digest(original) == item['assetSha256']
    displays = []
    for width in [360, 680]:
        found = [r for r in renders if r['goalId'] == goal_id and r['attempt'] == image_path.name and r['displayWidth'] == width]
        assert len(found) == 1
        r = found[0]
        assert r['inputSha256'] == item['assetSha256']
        screenshot = ROOT / r['screenshot']
        assert digest(screenshot) == r['screenshotSha256']
        assert r['dimensions']['actualWidth'] == width
        assert r['dimensions']['objectFit'] == 'contain' and r['dimensions']['maxHeight'] == '448px'
        assert abs(r['dimensions']['actualWidth'] / r['dimensions']['actualHeight'] - r['dimensions']['naturalWidth'] / r['dimensions']['naturalHeight']) < .001
        input_paths.add(screenshot)
        displays.append({**r, 'actuallyViewedIndependentlyWithViewImage': True, 'inspectionUsedOriginalScreenshotSize': True})
    for helper in item['nativeHelperOutputs']:
        hp = ROOT / helper['path']
        assert digest(hp) == helper['sha256']
        if hp.suffix == '.png':
            assert digest(hp) == item['assetSha256']
        input_paths.add(hp)
    facts = FINDINGS[goal_id]
    row = {
        'goalId': goal_id, 'decision': 'KEEP', 'reviewStatus': 'independent_machine_visual_review_complete_for_exact_candidate_asset',
        'asset': binding(image_path), 'prompt': binding(prompt_path),
        'selectedAttempt': item['selectedAttempt'],
        'provider': 'ChatGPT/Codex image_gen built-in', 'modelVersion': 'not exposed; not inferred',
        'provenanceReceiptPath': str(next(p for p in provenance_paths if p_rows[0] in (read(p).get('actualOutputs', [read(p)]))).relative_to(ROOT)),
        'originalToolOutputAvailableAndByteExact': original_verified,
        'goalBinding': {key: {'text': goal[key], 'utf8Sha256': text_digest(goal[key])} for key in ['title', 'description', 'titleEn', 'descriptionEn']},
        'altText': item['altText'], 'altTextMatchesActuallyViewedImage': True,
        'actualCandidateResourceLink': links[0],
        'nativeImageActuallyViewedIndependentlyWithViewImage': True,
        'actualDisplayBindings': displays,
        'actualScienceFinding': facts['science'], 'phoneFinding': facts['phone'], 'desktopFinding': facts['desktop'],
        'representationLimits': facts['limits'],
        'styleFinding': 'Freundliche, abstrahierte Comic-Rasterdarstellung mit klaren Konturen und großen Kernobjekten; mit den tatsächlich angesehenen vorhandenen Biologie-Referenzen vereinbar. Keine photorealistische oder sterile technische Neugestaltung.',
        'perspectiveFinding': 'Keine Heftdarstellung oder Ableseskala in Benutzung. Die grafischen Pfeile und Beschriftungen sind korrekt zum didaktischen Modell ausgerichtet; im UV-Bild stehen keine Mess- oder Hefttexte entgegen der Sicht der handelnden Person.',
        'formatFinding': {'format': 'PNG', 'naturalPixels': [displays[0]['dimensions']['naturalWidth'], displays[0]['dimensions']['naturalHeight']], 'decision': 'KEEP near-native 16:9; no format exception needed', 'phoneDisplay': '360 × about203 px, contain, no crop', 'desktopDisplay': '680 × about383 px, below448 px height cap'},
        'mandatoryImageCorrection': False, 'openVisualFindingCount': 0,
        'candidateAssetMachineVisualApproval': True,
        'activeNativeVGateIntegration': False, 'currentCurricularAtomicGoalIntegrated': False,
        'newStrictClosure': False, 'restoredActiveBinding': False,
        'humanApproval': False, 'humanTrial': False,
    }
    rows.append(row)
    planned_record = {
        'goalId': goal_id, 'title': goal['title'], 'description': goal['description'], 'subject': 'biologie',
        'landscapeId': canonical['landscapeId'],
        'landscapePath': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
        'visualizationState': 'available', 'missingReason': '',
        'imageUrl': links[0]['url'],
        'publicAssetPath': 'app/public' + links[0]['url'],
        'canonicalAssetPath': f'curricula/DE/Gymnasium/visualizations/biologie/{goal_id}/{goal_id}.png',
        'assetSha256': 'sha256:' + item['assetSha256'],
        'humanApproved': 'no', 'humanIssueIdentified': 'no', 'humanIssueDescription': '',
        'humanReviewedAt': None, 'humanReviewer': '',
        'aiApproved': 'yes', 'aiApprovedAssetSha256': 'sha256:' + item['assetSha256'],
        'aiReviewedAt': NOW, 'aiReviewer': REVIEWER,
        'aiNotes': 'Independent actual native PNG and360/680 browser-raster inspection. ' + facts['science'] + ' ' + facts['phone'] + ' ' + facts['limits'] + ' Candidate only; no HumanApproval/Trial.',
    }
    native_rows.append({'goalId': goal_id, 'operativeRecord': False, 'actualReviewedCandidateAssetPath': str(image_path.relative_to(ROOT)),
                        'actualReviewedCandidateCanonicalPath': str(canonical_path.relative_to(ROOT)),
                        'integrationRequiresExactCurrentGoalTextsResourceLinkAndSourceFrontendBackendAssetMatches': True,
                        'plannedNativeRecord': planned_record})
    technical_rows.append({'goalId': goal_id, 'selectedAssetSha256Exact': True, 'promptSha256Exact': True,
                           'deAndEnGoalTextMatchesIsolatedCanonical': True, 'resourceLinkAndAltTextMatch': True,
                           'twoExactBrowserInputAndScreenshotBindings': True, 'threeNativeCopiesByteExact': True,
                           'originalToolOutputAvailableAndByteExact': original_verified})

write('seven-independent-visual-verdicts.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'independent actual machine visual and subject-matter review of seven new candidates',
    'reviewer': REVIEWER, 'generationPerformedByThisReviewer': False,
    'authorVerdictsAreNotReviewEvidence': True, 'ownJudgementFromActualViewedImages': True,
    'authorFreeze': binding(freeze_path), 'goalTextSource': binding(GOALS),
    'scope': 'Seven exact selected candidate PNGs against seven unchanged v6 DE/EN goal texts; independent of source-topic-code remediation. Not a source, description, memory or active gate completion review.',
    'summary': {'KEEP': 7, 'REVISE': 0, 'BLOCK': 0, 'nativePNGInspections': 7, 'actualPhoneInspections': 7, 'actualDesktopInspections': 7,
                'activeWrites': False, 'strictNetGain': 0, 'newScientificClosures': 0, 'restoredActiveBindings': 0, 'humanApproval': False, 'humanTrial': False},
    'styleReferenceBindings': [binding(p) for p in style_refs],
    'records': rows,
})
write('seven-native-v-input-records.candidate.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW, 'role': 'inert proposed native V-record inputs after independent actual visual approval; not the operative subject QA ledger',
    'recordAvailabilityDescribesFutureNativeIntegration': True,
    'activeWrites': False, 'activeNativeVGateIntegration': False,
    'requiredIntegrationCheck': 'Before copying any planned record, prove the approved exact PNG in canonical/source/frontend/backend slots and identical current DE/EN title/description, goal ID, primary resource link and reviewed alt text. Resolve D/P/A/M/source/profile gates separately. Do not promote seven candidates by editing hashes only.',
    'records': native_rows,
})
write('actual-input-bindings-and-hash-verification.json', {
    'schemaVersion': 1, 'createdAtUTC': NOW,
    'authorOwnFrozenFilesChecked': len(author_freeze['files']), 'authorOwnFrozenFileMismatches': author_errors,
    'authorFreezeUnmodified': True,
    'inputs': [binding(p) for p in sorted(input_paths)],
    'selectedCandidateChecks': technical_rows,
    'actualImageViewingIsSeparateFromTheseMechanicalChecks': True,
    'sevenGoalTextsAreCandidateTextsNotActiveCurricularAtomicIntegration': True,
    'otherIndependentV7SourceCodeEditsNotIncludedInThisReview': True,
    'humanApproval': False, 'humanTrial': False,
})
print(json.dumps({'reviewFilesWritten': 3, 'KEEP': len(rows), 'independentActualImageInspections': 21,
                  'inputBindings': len(input_paths), 'authorOwn95Exact': len(author_freeze['files']) == 95,
                  'activeWrites': False}, ensure_ascii=False))
