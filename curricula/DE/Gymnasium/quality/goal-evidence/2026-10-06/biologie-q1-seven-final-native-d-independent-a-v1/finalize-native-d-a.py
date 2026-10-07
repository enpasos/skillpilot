from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import subprocess

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
BASE = AUTHOR.parent

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

freeze_path = OWN / 'independent-d-a.final.freeze.json'
assert not freeze_path.exists()
command = [str(REPO / 'app/node_modules/.bin/tsx'), str(REPO / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts'),
    '--bundle', str(AUTHOR / 'round-a/review-bundle-manifest.json'),
    '--input', str(AUTHOR / 'round-a/description-review-input.json'),
    '--campaign', str(AUTHOR / 'round-a/description-review-campaign.json'),
    '--batches-dir', str(AUTHOR / 'round-a/batches'), '--results-dir', str(OWN / 'results')]
proc = subprocess.run(command, cwd=REPO, capture_output=True, text=True)
(OWN / 'native-validator.actual.stdout.txt').write_text(proc.stdout)
(OWN / 'native-validator.actual.stderr.txt').write_text(proc.stderr)
assert proc.returncode == 0 and 'results valid: 7' in proc.stdout, proc.stderr
write('native-validator.actual.result.json', {'schemaVersion': 1,
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'command': command, 'exitCode': proc.returncode,
    'stdout': bind(OWN / 'native-validator.actual.stdout.txt'), 'stderr': bind(OWN / 'native-validator.actual.stderr.txt'),
    'productionValidatorUnmodified': True, 'round': 'independent-a', 'validatedRecords': 7})
exact = read(OWN / 'exact-round-a-bundle-image-source-context-and-pdf-inputs.actual.json')
inputs = {row['path']: row for row in exact['roundAOnlyAndSharedExactOwnBindings'] + exact['actualImageBindings'] + exact['current19Inputs']}
for row in inputs.values():
    assert sha(REPO / row['path']) == row['sha256'], row['path']
for path in [AUTHOR / 'final-native-review-inputs.author-v1.freeze.json',
    BASE / 'biologie-q1-seven-native-v6-independent-a-v1/seven-science-atomicity-prerequisite-memory.review.json',
    BASE / 'biologie-q1-eleven-source-topic-v7-independent-a-followup-v1/independent-a-followup.current-v2.final.freeze.json',
    BASE / 'biologie-q1-mv-heading-location-v8-independent-a-followup-v1/independent-a-v8-heading-followup.final.freeze.json',
    REPO / 'AGENTS.md', REPO / 'docs/concept/skill-graph/atomic-goal-visualizations.md',
    REPO / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts', REPO / 'app/scripts/validateGoalDescriptionReviewCampaign.ts',
    REPO / 'app/scripts/validateGoalEvidenceFindings.ts', REPO / 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    REPO / 'contracts/goal-description-review/v1/goal-description-review-record.schema.json']:
    inputs[str(path.relative_to(REPO))] = bind(path)
sources = read(OWN / 'actual-final-thirteen-source-sixteen-material-bindings-and-reuse.json')
for row in sources['sourceRows']:
    for key in ['exactReviewedSourceBasis', 'actualCurrentExtraction', 'actualCurrentMapping']:
        inputs[row[key]['path']] = row[key]
for key in ['materialSource', 'finalNativePInput']:
    inputs[sources[key]['path']] = sources[key]
for path in [REPO / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-q1-seven-new-visuals-independent-v-qa-v1/independent-visual-review.final.freeze.json']:
    inputs[str(path.relative_to(REPO))] = bind(path)
(OWN / 'README.md').write_text('''# Biologie Q1: sieben finale native Beschreibungsreviews, unabhängig A

**Sieben `keep`, keine offenen A-Beschreibungsbefunde.** Die nativen
[Ergebnisdatensätze](results/independent-a.batch-001.records.jsonl) bleiben
`candidate` / `ai_candidate`; sie sind keine menschliche Freigabe. Der
unveränderte [native Kampagnenvalidator](native-validator.actual.result.json)
ist mit genau sieben Datensätzen bestanden.

## Tatsächlich geprüft

Nur Runde A und ihre gemeinsamen eingefrorenen fachlichen Eingänge wurden
gelesen; keine Runde B, fremden aktuellen D-Ergebnisse oder Adjudikationen.
Eigene gültige frühere, nicht native Fachtext-/Atomaritäts-/Material-/Memory-
Befunde werden auf ausdrücklichen Auftrag gezielt weiterverwendet. Blindheit
bezieht sich auf andere unabhängige native Kampagnenruns; historische eigene
Arbeit wird transparent benannt und nicht als frische fremde Prüfung ausgegeben.

- Die sieben fertigen PDF-Lernzielseiten **physisch 3–9** wurden tatsächlich
  angesehen. Aktueller Titel, vollständige Beschreibung, Modellbild, Geltung,
  direkte Voraussetzungen und Nachfolger passen jeweils zusammen.
- Das tatsächliche gebundene HTML wurde in Chromium mit allen sieben echten
  isolierten PNGs geladen. Alle Titel, Beschreibungen, Bild-URLs und Alttexte
  sind exakt; sämtliche Bilder laden. Es wird keine Cockpit-/Handy-Abnahme aus
  der A4-Buchdarstellung abgeleitet.
- Sieben primäre Bildlinks sind die einzigen Änderungen gegenüber den bereits
  gültig geprüften sieben kanonischen Zielobjekten. Die aktuelle Bild-/Text-
  Verträglichkeit wurde je Seite angesehen. Der getrennte gültige 360/680-
  Bildreview bleibt an seine unveränderten Pixel gebunden.
- Alle **13** direkt gebundenen Quellenkomponenten entsprechen den tatsächlich
  geprüften v6/v7-Eingängen mit ausschließlich der MV-v8-Elternlokation **17/13**.
  Nur technische isolierte Mappingpfade ändern sich. Die Teilmappings bleiben
  `partial`; ganze historische Quellenpflichten werden nicht geschlossen.
- Alle **16** vollständigen Materialkörper, Pointer und endgültigen UUIDs sind
  exakt und erhalten. Daraus wird weder ein neuer P-v2-Nachweis noch vorhandene
  Lernendenleistung behauptet.

Jeder Record enthält eine eigene zielgenaue DE/EN-Kette für essentielles
Verständnis, unabhängig beobachtbare Leistung und einen sachhaltig veränderten
Transferfall. DNA-/Gen-/Chromosomrelation, Mutationsniveaus, Punkt-/Genom-
Unterscheidung, Expositionsschutz, Zelllinien, kontrollierte Umwelt-/Genetik-
Unterscheidung und Fehlerkontrolle werden begrenzt beurteilt. Kein Bild ersetzt
eine selbst erzeugte Erklärung; keinerlei universelle Krankheits-, Schutz- oder
Merkmalsbehauptung wird ergänzt.

## Offene Gates und Fortschritt

Im gebundenen D-Eingang fehlen sieben V2-Profile; deshalb ist die Empfehlung
jeweils `create`, ohne dass dieser Review selbst Profile erzeugt oder P freigibt.
Der andere unabhängige D-Run, Auflösung, native P/A/M und vollständige geeignete
GUI-Supersets sowie Integration bleiben separate Schritte. ST-GK/LK sind die
bereits begrenzten technischen gemeinsamen Einführungsphasenprojektionen,
nicht als offizielle rohe Quellkurswörter bestätigte Labels. Die breite
3417-/ST-/SH-/BY-Quellenprüfung bleibt gesondert offen.

Die 19 aktiven M7-Eingänge bleiben exakt. Aktiv **Biologie 67/383**, **Chemie
112/378**; Nettozuwachs, neue fachliche Abschlüsse und wiederhergestellte aktive
Bindungen jeweils **0**. Kandidaten-390 ist kein aktiver Nenner. Mathematik-M7
und Physik-M7 bleiben geschützt. Keine aktive Datei, kein Bild, kein Ledger und
keine Registry wurden geändert. Menschliche Release-/Erprobungsgates bleiben
offen; kein Commit, Push, Deployment oder Veröffentlichung durch diesen Review.
''')
files = [{'path': str(path.relative_to(OWN)), 'sha256': sha(path), 'bytes': path.stat().st_size}
         for path in sorted(OWN.rglob('*')) if path.is_file()]
write(freeze_path.name, {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'frozen independent native D-A7 actual final-page review; machine candidates only',
    'files': files, 'ownFileCount': len(files), 'ownBytes': sum(row['bytes'] for row in files),
    'inputBindings': sorted(inputs.values(), key=lambda row: row['path']),
    'campaign': 'biologie-q1-seven-final-native-review-author-v1-a', 'round': 'independent-a',
    'nativeRecords': 7, 'KEEP': 7, 'REVISE': 0, 'SPLIT_REVIEW': 0, 'BLOCK': 0,
    'nativeCampaignValidator': 'PASS7', 'actualPDFFinalPagesViewed': 7, 'actualHTMLPagesAndPNGBytesChecked': 7,
    'exactSourceComponents': 13, 'exactMaterialCases': 16, 'missingCurrentProfilesRecommendation': 'create7',
    'nativePApprovalGranted': False, 'newNativeA_MOrGUIIntegration': False,
    'otherCurrentIndependentDRunRead': False, 'priorOwnNonNativeWorkReusedTransparently': True,
    'original19InputsUnchanged': True, 'activeWrites': False, 'strictNetGain': 0,
    'newScientificCompletions': 0, 'restoredActiveBindings': 0, 'humanApproval': False,
    'humanTrial': False, 'publicationOrDeployment': False, 'integrableNow': False})
print(json.dumps({'freeze': str(freeze_path.relative_to(REPO)), 'sha256': sha(freeze_path),
                  'ownFiles': len(files), 'exactInputs': len(inputs), 'nativeD_A': 'PASS7KEEP',
                  'strictGain': 0, 'activeWrites': False}))
