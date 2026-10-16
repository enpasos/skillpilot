# SPDX-License-Identifier: Apache-2.0
"""Finalize the finite author handoff; no changes outside this directory."""
import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
E14 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14'
BASE = E14 / 'chemie-four-source-duties-explicit-compulsory-domain-carriers-author-20261014-v3'
A = OWN.parent / 'chemie-three-source-duty-carriers-prospective422-fresh-independent-a-20261015-v1'
SEL = E14 / 'chemie-source-three-goals-union-context-corrected-review-selector-root-20261014-v2'
IMGSEL = E14 / 'chemie-source-three-goals-materials-and-images-review-selector-root-20261014-v1'
SEAL = OWN / 'FILES.finite-own-artifacts.seal.json'


def load(p):
    return json.loads(p.read_text())


def sha(b):
    return 'sha256:' + hashlib.sha256(b).hexdigest()


def ref(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p.read_bytes()), 'bytes': p.stat().st_size}


def write(name, body):
    assert not SEAL.exists(), 'Finalized append-only packet must not be modified'
    (OWN / name).write_text(json.dumps(body, ensure_ascii=False, indent=2) + '\n')


def main():
    assert not SEAL.exists()
    files = []

    def inputs(paths, mode):
        for p in paths:
            files.append({**ref(p), 'actualReadMode': mode})

    inputs([ROOT / 'AGENTS.md'], 'relevant graph semantics and authoring/evidence sections7.1,7.2,7.4; no independent review claimed')
    inputs([ROOT / 'docs/qa-ci/chemie-independent-reviews-checkpoint-2026-10-15.md'], 'whole checkpoint read; active/inactive reported counts and pending work distinguished')
    inputs([ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
            ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'], 'machine parse and Chemistry routing inspected; no mutation')
    inputs([A / 'RESUME.md', A / 'SCIENCE.typed-three-goal-review.json', A / 'INPUTS.actual-read-inventory.before-peer.json'],
           'author read disclosed A findings, whole3 science/image conclusions and exact bound inputs; NOT an independent FIRST')
    inputs([A / 'FILES.finite-own-artifacts.seal.json', BASE / 'FILES.finite-author-v3.seal.json'],
           'finite inventory structure and exact hashes inspected; not a claim of scientific rereview of every sealed file')
    inputs([BASE / 'materials/eleven-complete-cases.v3.bound.author.json'],
           'whole11 mechanically parsed; I1/I2/I3 and W1/W2 complete DE/EN material/tasks/solutions/rubrics read for this remediation; other6 retained exact without new whole scientific review')
    inputs([BASE / 'candidate/author-profiles.three.raw.json'],
           'whole3 parsed; full40 and93 science/coverage read; dye row exact KEEP reference, no new approval')
    inputs([BASE / 'AUTHOR.prerequisites-given-background-and-acquisition-holds.json',
            BASE / 'AUTHOR.minimality-counterexamples-and-v2-dissent.preserved.json',
            BASE / 'AUTHOR.official-source-operators-mandatory-carriers-and-scope.matrix.json',
            BASE / 'inputs/history/v2-B-FIRST.science.exact.json'],
           'author read whole disclosed historical reasoning/dissent and acquisition HOLDs; historical B FIRST exposure explicitly disclosed')
    inputs([BASE / 'inputs/canonical551.current419.exact.json'],
           'older author baseline whole parsed and relevant selected bodies read; not current b07 baseline and not newly approved')
    current = E14 / 'chemie-acid7-two-description-one-image-current419-native-successor-technical-20261014-v3/candidate/canonical551.current419.three-author-deltas.exact.json'
    inputs([current], 'current b07 whole551 parsed; 21 selected whole objects read and copied exactly in inputs/current-b07.selected-whole-goals.exact.json, including lab/safety and four whole7a05 predecessors; other unchanged bodies not scientifically rereviewed')
    inputs([IMGSEL / 'candidate/three-whole-prospective-goals.with-three-image-candidates.json'], 'all3 complete goal objects read; only93 requires[1] changes')
    inputs([IMGSEL / 'candidate/canonical554.prospective422.three-source-goals-plus-current-acid-deltas.inactive.json'],
           'whole554 parsed and compared in memory; no whole-canonical copy or new whole-course science approval')
    inputs([SEL / 'NEUTRAL.current-three-source-goals-eleven-cases-images-and-complete-context-union.json',
            SEL / 'trace_context_impact.py'], 'whole corrected selector/algorithm read; original scripts not executed or modified')
    report = E14 / 'chemie-NAT9-current419-isolated-integration-technical-20261014-v1/receipts/ACTUAL.current419-NAT9-D2-D5-final.central.stock-report.json'
    inputs([report], 'whole JSON parsed; historical305 strict IDs used for bounded context audit, not presented as latest312 count')
    inputs([BASE / 'CHECK.bounded-author-shape-exactness-DAG-and-stock-target-projection.actual.json',
            BASE / 'check-bounded-author-v3.mts'], 'whole bounded stock check and target/acquisition reports read; historical scripts never executed in sealed originals')
    views = [(BASE / (('candidate/views/' if n in ['de-hb-lk', 'de-bw-lk'] else 'inputs/views/') + n + ('.view.author.json' if n in ['de-hb-lk', 'de-bw-lk'] else '.view.exact.json')))
             for n in ['de-hb-lk', 'de-hb-gk', 'de-bw-lk', 'de-bw-gk', 'de-st-lk', 'de-st-gk']]
    inputs(views, 'whole parsed by existing stock target projection; HB/BW LK authored structure inspected; exact views reused, no role edits')
    inputs([ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json',
            ROOT / 'contracts/curriculum-package/v1/composition-view.schema.json',
            ROOT / 'docs/landscape-runtime.schema.json', BASE / 'inputs/positive-profile-criteria.exact.md'],
           'mechanically loaded schema/criteria for bounded shape check; no criteria changes')
    inputs([ROOT / 'app/src/utils/authoring/compositionViewAuthoring.ts', ROOT / 'app/scripts/compositionViewSourceCoverage.ts'],
           'relevant projection functions read; existing stock helper executed unchanged')
    inputs([ROOT / 'app/scripts/positiveGoalEvidenceProfileModel.ts'], 'existing helper dynamically loaded and mechanically executed unchanged; no assertion of full source-code rereview')
    inputs([ROOT / 'curricula/DE/Gymnasium/input/HB/GyO_Chemie_2022.pdf',
            ROOT / 'curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf'],
           'whole source bytes hash checked; actual HB36/37 and BW42 complete pages directly read and re-extracted; unrelated PDF pages not newly reviewed; full extracts not committed')
    task = Path('/home/enpasos/.codex/attachments/c176f25a-3aea-4378-88ad-e0312e383d41/goal-objective.md')
    write('INPUTS.actual-read-inventory.json', {
        'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
        'role': 'author actual read inventory, not independent reviewer inventory',
        'externalTaskObjective': {'basename': task.name, 'sha256': sha(task.read_bytes()), 'bytes': task.stat().st_size,
                                  'wholeGoalRead': True, 'contentsCopiedIntoPacket': False},
        'independentFirstClaimed': False, 'priorReviewExposure': ['current sealed A findings', 'historical V2 B FIRST', 'historical author dissent'],
        'privateLearnerOrChatSessionDataRead': False, 'files': files})

    image_paths = [
        E14 / 'chemie-hb-isolation40-one-gray-count-correction-author-20261014-v2/candidate/source/visualizations/chemie/40f2db27-0ebe-5f03-941d-708aebcc64b7/40f2db27-0ebe-5f03-941d-708aebcc64b7.png',
        E14 / 'chemie-HB-research-BW-dye-two-missing-PNGs-inactive-author-20261014-v1/hb/candidate/source/visualizations/chemie/93a7ce4d-1c90-568c-9368-cac423011ef9/93a7ce4d-1c90-568c-9368-cac423011ef9.png',
        E14 / 'chemie-HB-research-BW-dye-two-missing-PNGs-inactive-author-20261014-v1/bw/candidate/source/visualizations/chemie/d815960a-21ab-5a42-8b23-ecd20d03db19/d815960a-21ab-5a42-8b23-ecd20d03db19.png']
    a_records = load(A / 'SCIENCE.typed-three-goal-review.json')['records']
    rows = []
    for path, r in zip(image_paths, a_records):
        image = ref(path)
        assert image['sha256'] == r['visualization']['assetSha256']
        rows.append({'goalId': r['goalId'], 'exactAsset': image, 'authorDisposition': 'KEEP exact bytes',
                     'priorIndependentAVisualization': r['visualization'],
                     'ownNewVisualReviewPerformed': False, 'ownVerification': 'actual asset bytes hashed; exact match to disclosed A native/360/680 review',
                     'formalCurrentVRecordCreated': False})
    write('IMAGES.exact-KEEP.references.json', {'schemaVersion': 1, 'role': 'author reuse of exact three disclosed candidate assets',
          'independentA': ref(A / 'SCIENCE.typed-three-goal-review.json'), 'newImagesGenerated': 0,
          'imagesCopiedOrModified': False, 'rows': rows, 'humanApprovalClaimed': False})

    context = load(OWN / 'CHECK.context-union.actual.json')
    (OWN / 'RESUME.md').write_text('''<!-- SPDX-License-Identifier: Apache-2.0 -->
# Chemie: begrenzter Autoren-Nachtrag für drei prospektive Quellenpflicht-Träger

**Inaktiver Autorenentwurf; 0 neue und 0 wiederhergestellte strenge Abschlüsse.**
Ausgangspunkt laut gebundenem Checkpoint: aktiv231/402 M6, inaktiv312/419.
Die drei vorhandenen prospektiven IDs bleiben dieselben; ihre mögliche spätere
Integration ergibt422 Inhaltsziele, aber hier keine Integration oder Gate-Freigabe.
Mathematik807, Physik478 und Biologie397 werden nicht verändert.

## Genaue Änderungen

- **40f2db27:** Der ganze bildgebundene Zielkörper bleibt exakt. I1/I2/I3 und das
  rohe P-Profil begrenzen alle betroffenen DE/EN Stoffanteile auf die bilanzierten
  gelösten Stoffe N+Z, P+Q bzw. U+V. Lösungsmittelmassen fehlen; die Reinheit der
  gesamten Flüssigphase ist unbestimmt. I1:90% N an N+Z,90% N-Rückgewinnung;
  I3:rund90.9% U an U+V,rund83.3% U-Rückgewinnung. I2 bleibt ausschließlich
  Identitäts-/Herkunftstransfer und liefert keinen zweiten Trennmechanismus.
- **93a7ce4d:** Nur `requires[1]` wechselt vom ganzen7a05 zum ganzen8d4.
  Das ganze42a84 bleibt Voraussetzung. Die vollständige Begründung vergleicht
  bestehende Zielkörper und Gegenbeispiele, einschließlich der vier breiten
  Mechanismuspfade. W1/W2 bleiben exakte vollständige Fälle. Das rohe P-Profil
  bleibt wissenschaftlich gleich; Fallpfade und Ziel-/Fallbindungen sind neu.
- **d815960a:** Ganzer Zielkörper, Fälle BW-B1/B2 und rohes P bleiben exakt KEEP.
  Alle drei Bilder bleiben bytegleich; keine Neuerzeugung oder eigene neue
  Sichtungs-/V-Freigabe. A hatte die exakten Assets in nativer Größe und360/680
  gesehen. Die aktuelle Autorrolle übernimmt keinen unabhängigen Review.

## Dateien und begrenzte Prüfungen

`candidate/three-whole-goals.bounded-author.json` enthält die drei ganzen
Nachfolgerobjekte. `candidate/whole-object-delta.author.json` zeigt Vorher/Nachher
gegen den alten prospektiven422-Stand und die Herkunft vom aktuellen b07-419.
`materials/eleven-complete-cases.remediated.author.json` enthält11 vollständige
Fälle/44 Rubriken; genau I1/I2/I3 ändern sich, die anderen8 bleiben exakt.
`candidate/two-profiles.raw.author.json` enthält nur die zwei neu gebundenen
Autorenprofile40/93; d815 wird am exakten alten Rohdatensatz referenziert.

Python prüft Bruchrechnungen, Stoffbilanzen, Profil-Schema, Referenzen und
vollständige Objekt-Deltas. Der unveränderte Stock-Helfer prüft den554-Ziele-
Kandidaten ausschließlich im Speicher: Runtime-/View-/Profil-Schema, beide DAGs,
P-Semantik und sechs Kurssichten. HB-LK185/BW-LK166 sowie HB-GK155/BW-GK144/
ST-LK142/ST-GK120 bleiben unverändert. Dies ist keine fachliche Kursfreigabe.
Die genauen Befehle stehen im Receipt; beide Prüfungen sind erfolgreich.
Kein Gradle, Build, neuer nativer PDF-Lauf, CI-Lauf oder Git-Schreibzugriff.

## Offene Arbeit und nächste Bindung

Die aktuellen Quellen-, Kurs- und Erwerbs-HOLDs bleiben **OPEN**. Rohes
`requires`-Traversieren verkürzt93 von42 auf6 Ziele; HB enthält weiterhin nicht
alle benötigten atomaren Stoff-/Zustandsziele. Der sichtbare266a-Cluster ist kein
atomarer Zielnachweis seiner praktischen Laborarbeitsweisen-/Sicherheitskinder.
Auch diese tatsächlichen Leistungsanforderungen bleiben offen; kein rein
theoretischer Fall, keine Standortkennung und kein vorhandener Eintrag beweist
deren Erwerb. BW behält seine bisherigen Erwerbslücken. HB-Pflichten gelten hier
nur im LK, BW nur für die gewählte Farbstoffroute im Leistungsfach; andere
amtliche Stoffgruppen bleiben Alternativen. Kein ganzer Kurs gilt als geschlossen.

Konkrete HB-Erwerbs-HOLDs im unveränderten Stock-Zielraum:

- `fcc73fb5-7413-557f-aea3-b9692a66ee75`: Stoffe/Eigenschaften, für40 und93.
- `326d45bf-9f77-57d5-a054-93e76b034dd5`: Aggregatzustände/Übergänge, für93.
- `416dfd33-8b43-5c49-903c-9847b95e4208`: tatsächliche Laborarbeitsweisen,
  als Kind von266a weiterhin für40/93 ungesichert.
- `13d4f336-ab16-54a7-9479-c920b458f385`: situationsbezogene Laborsicherheit,
  als Kind von266a weiterhin für40/93 ungesichert.

Der Alt/Neu-Union-Kontextaudit enthält beide Bezugsstände: Von b07 zu diesem
Kandidaten ändern sich sechs Kontexte der historisch gebundenen305 Abschlüsse
(42a84,5a302,5a709,8d4,c307,e5d6); ihre eigenen Körper bleiben alle exakt.
Vom vorherigen422-Kandidaten ändern sich die Kontexte42a84,7a05,8d4; zusätzlich
93 selbst und der unmittelbare Elternkontextd11fc im vollständigen Audit.
Alle bestehenden551 Kontexte sind zusätzlich unabhängig vom305-Filter erfasst.
Das305-Receipt ist eine historische Teilmenge und wird nicht als aktuelle312
ausgegeben. Vor Integration muss Root aktuelle tatsächliche D-Bindungen prüfen.

Die sechs betroffenen bisherigen atomaren Kontexte sind vollständig benannt:

- `42a84bca-d27e-581f-a43a-eee424f0504d`
- `5a30273a-98d5-5163-bb16-c250b7ed4e7f`
- `5a709938-e0f5-42b7-94f0-cfded08963a2`
- `8d4ef102-e6a6-4d2e-bb6b-e707d3f2e566`
- `c3077d95-f3fe-5579-8493-cb92992809c4`
- `e5d6de7e-28c5-5dd8-a700-ecc1a3a7b8cd`

Der vollständige551-Audit umfasst zusätzlich die Strukturkontexte442c31c5
undd11fc507. Damit hängt die Aufzählung der sechs atomaren Kontexte nicht vom
historischen305-Filter ab; ein aktueller312-Abschlussstand wird hier nicht neu
berechnet oder umetikettiert. Beim Vergleich zum alten422-Stand ist zudem die
entfernte Rückkante bei7a05 gezielt zu berücksichtigen.

Nächster Schritt: neue unabhängige, exakt gebundene Prüfung der Korrektur und
der ganzen93-Voraussetzung/Erwerbsgrenzen; bestehende Quellen-/Kurs-HOLDs lösen.
Erst mit tatsächlichen aktuellen nativen D-Seiten/Kontexten und geeigneten
unabhängigen D/P/A/M/V-Belegen kann separat integriert werden. E0/G0 der
Aufgabenentwürfe bleibt bestehen; keine Lernerausführung, keine Human Approval
oder Human Trial. Historischer B-Dissens wird offengelegt und bleibt erhalten.

`INPUTS.actual-read-inventory.json` unterscheidet tatsächliches Fachlesen,
mechanische Prüfung und unveränderte Übernahme. `FILES.finite-own-artifacts.seal.json`
versiegelt zuletzt die endliche eigene Dateimenge; Originalpakete bleiben unverändert.
''')

    # All own JSON must parse; every owned reference must stay inside the repository.
    parsed = []
    for p in sorted(OWN.rglob('*.json')):
        load(p)
        parsed.append(str(p.relative_to(OWN)))
    stock = load(OWN / 'CHECK.stock-projection-DAG-schema-and-profile-semantics.actual.json')
    calc = load(OWN / 'CHECK.calculations-profile-schema-and-case-delta.actual.json')
    assert stock['errors'] == [] and calc['errors'] == []
    assert len(context['currentB07ToRemediated422']) == 6
    assert len(context['priorProspective422ToRemediated422']) == 3
    assert all(not row['ownBodyChanged'] for row in context['currentB07ToRemediated422'])
    tracked_diff = subprocess.check_output(['git', 'diff', '--name-only'], cwd=ROOT).decode().splitlines()
    assert not tracked_diff, 'Tracked source must stay unchanged during bounded author task'
    own_files = [p for p in OWN.rglob('*') if p.is_file()]
    assert not any(p.is_symlink() for p in OWN.rglob('*'))
    write('FINAL.bounded-author.receipt.json', {
        'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
        'role': 'bounded author preparation, no independent scientific vote or integration',
        'observedRepositoryHEAD': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(),
        'actualCommands': [
            {'argv': ['python3', str((OWN / 'build_author_remediation.py').relative_to(ROOT))], 'exitCode': 0, 'stdoutFile': 'CHECK.python-command.actual.txt'},
            {'argv': ['app/node_modules/.bin/tsx', str((OWN / 'check_bounded_remediation.mts').relative_to(ROOT))], 'exitCode': 0, 'stdoutFile': 'CHECK.stock-command.actual.txt'}],
        'affectedOnlyChecksPassed': True, 'jsonFilesParsedBeforeFinalReceiptAndSeal': parsed,
        'rawProfileSchemaAndStockSemanticsPassed': 2, 'fullCases': 11, 'rubrics': 44,
        'changedCaseIds': ['HB-I1', 'HB-I2', 'HB-I3'], 'remainingEightCaseObjectsExact': True,
        'wholeBodyChangeFromPrior422': 'only93.requires[1]:7a05→8d4',
        'existingCurrent419OwnBodiesPreservedExceptPreviouslyAuthoredBoundaryParent': True,
        'all305HistoricalStrictOwnBodiesExact': True, 'currentB07ContextChangesIn305': 6,
        'prior422ContextChangesIn305': 3, 'trackedGitDiffAtFinalization': tracked_diff,
        'scope': 'only new append-only source3 author packet; active config/ledger/canonical/mappings/published artifacts unchanged',
        'newOrRestoredStrictClosures': 0, 'independentApprovalsCreated': 0,
        'nativeDOrFullBuildExecuted': False, 'imageGenerationExecuted': False,
        'sourceCourseAndPracticalAcquisitionHOLDs': 'OPEN', 'humanApprovalOrTrialClaimed': False})
    if '--seal' in sys.argv:
        rows = [ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != SEAL]
        SEAL.write_text(json.dumps({'schemaVersion': 1, 'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
            'role': 'finite immutable bounded author remediation inventory; self excluded',
            'files': rows, 'filesCount': len(rows), 'totalBytes': sum(r['bytes'] for r in rows),
            'authorOnly': True, 'evidenceLevel': 'E0', 'maximumClaimScope': 'G0',
            'newOrRestoredStrictClosures': 0, 'independentApprovalsCreated': 0,
            'sourceCourseAndAcquisitionHOLDsRemainOpen': True,
            'activeIntegrationOrHumanApprovalClaimed': False}, ensure_ascii=False, indent=2) + '\n')
        for r in rows:
            p = ROOT / r['path']
            assert sha(p.read_bytes()) == r['sha256'] and p.stat().st_size == r['bytes']
        print(json.dumps({'sealed': True, 'ownFiles': len(rows), 'ownBytes': sum(r['bytes'] for r in rows),
                          'sealSHA256': sha(SEAL.read_bytes()), 'strictClosures': 0}))
    else:
        print(json.dumps({'readyForSeal': True, 'newOrRestoredStrictClosures': 0}))


if __name__ == '__main__':
    main()
