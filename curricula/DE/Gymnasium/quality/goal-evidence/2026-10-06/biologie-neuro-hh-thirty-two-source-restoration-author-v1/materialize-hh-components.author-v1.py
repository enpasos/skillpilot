#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Inert source-author package. Source evidence and technical guards are not approval."""
import hashlib
import json
import re
import subprocess
import uuid
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
SOURCE = ROOT / 'curricula/DE/Gymnasium/input/HH/lower-secondary/source-extraction/DE_HH_BIOLOGIE_SEKI_BILDUNGSPLAN_2011.source-extraction.json'
WORKLIST = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-outside-fifty-two-source-restoration-worklist-v1/outside52.actual-source-debt-and-view-worklist.json'
OLD_HOLD_MAPPING = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q2-neurobiology-twenty-one-source-p-author-remediation-v2/source-candidates/mapping-05.author-v2.candidate.json'
CANON = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
KINDS = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
CHEM_GUARD = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-b008-twenty-six-native-source-preparation-author-v11/current378-protected112-and-nine-family-structure-input-guard.actual.json'
TH_FREEZE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-outside-fifty-two-source-restoration-author-v2/th-largest-partial-author-v2.final.freeze.json'


def load(path):
    return json.loads(path.read_text())


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def binding(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'bytes': path.stat().st_size}


def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


now = datetime.now(timezone.utc).isoformat()
source = load(SOURCE)
doc = source['sourceDocument']
pdf = ROOT / doc['path']
assert digest(pdf) == 'sha256:8ed7ac127a75126ed30af2261564acd2236d0c7916b307b67b7e762d989dffa3'
live_pdf = Path('/tmp/skillpilot-hh-author-primary/live-hh.pdf')
assert live_pdf.is_file() and digest(live_pdf) == digest(pdf)
canon = load(CANON)
goals = {g['id']: g for g in canon['goals']}
assert len(goals) == 472
kinds = load(KINDS)
assert sum(d['semanticKind'] == 'curricularAtomic' for d in kinds['decisions']) == 390
work = load(WORKLIST)
hh_pairs = [r for r in work['goalViewPairs'] if r['viewJurisdiction'] == 'DE-HH']
assert len(hh_pairs) == 32
hh_ids = [r['goalId'] for r in hh_pairs]
summary_id = hh_pairs[0]['heldSourceDebtAnchors'][0]['sourceGoalId']
original_summary = next(g for g in source['sourceGoals'] if g['id'] == summary_id)
whole_hold = next(d for d in load(OLD_HOLD_MAPPING)['decisions'] if d['sourceGoalId'] == summary_id)
assert whole_hold['decision'] == 'needs_canonical_goal' and whole_hold['wholeSourceCoverage'] is False

# These original PDF pages contain rotated tables. BBox preserves actual cells
# and column membership without interleaving grade8 and grade10 text. The PDF's
# invalid C0 header backspace is removed solely for XML parser compatibility.
NS = {'h': 'http://www.w3.org/1999/xhtml'}
bboxes = {}
pdf_text_bindings = []
for n in [18, 19, 20, 22, 23, 24, 25, 26, 27, 28]:
    raw = subprocess.check_output(['pdftotext', '-f', str(n), '-l', str(n), '-bbox-layout', str(pdf), '-'])
    text = raw.decode()
    bboxes[n] = ET.fromstring(re.sub('[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text))
    pdf_text_bindings.append({'physicalPage': n, 'printedPage': n,
                             'freshBBoxExtractionSha256': 'sha256:' + hashlib.sha256(raw).hexdigest()})


def paragraphs(page, checkpoint=None):
    result = []
    for block in bboxes[page].findall('.//h:block', NS):
        if checkpoint == 8 and float(block.attrib['yMin']) < 400:
            continue
        if checkpoint == 10 and float(block.attrib['yMax']) > 402:
            continue
        current = []
        for line in block.findall('h:line', NS):
            text = ' '.join(w.text or '' for w in line.findall('h:word', NS))
            if text.startswith('•'):
                if current:
                    result.append(current)
                current = []
            current.append({'text': text, 'pdfLineBBox': {k: float(v) for k, v in line.attrib.items()}})
        if current:
            result.append(current)
    return result


def cell(key, page, prefix, checkpoint=None):
    matches = [lines for lines in paragraphs(page, checkpoint)
               if lines[0]['text'].startswith(prefix)]
    assert len(matches) == 1, (key, page, prefix, len(matches))
    lines = matches[0]
    raw = '\n'.join(line['text'] for line in lines)
    return {'key': key, 'sourceDocumentKey': doc['key'], 'physicalPage': page, 'printedPage': page,
            'rawSourceText': raw, 'sourceText': ' '.join(raw.split()),
            'originalPdfLineTranscriptsAndBBoxes': lines,
            'originalCheckpointEndGrade': checkpoint,
            'originalFixedTeachingGradeBand': None,
            'originalCourseLevel': None,
            'transcriptionMethod': 'actual PDF bbox word order inside a single actual cell/column; no adjacent grade-column text',
            'locatorIsAuthoredNotOfficialNumbering': True}


span_specs = [
    ('sense8', 22, '• beschreiben den Zusammenhang zwischen Aufbau und Funktion', 8),
    ('nerves8', 22, '• beschreiben die Zusammenarbeit von Sinnesorganen', 8),
    ('brain8', 22, '• beschreiben Bau und Funktion von Nervenzellen', 8),
    ('conduction8', 22, '• beschreiben Erregungsleitung und Reflexe', 8),
    ('digestion8', 22, '• beschreiben den Bau und die Funktion ausgewählter Bestandteile des Verdauungs-', 8),
    ('blood8', 22, '• beschreiben die Zusammensetzung des Blutes', 8),
    ('clot8', 22, '• beschreiben den Prozess der Blutgerinnung', 8),
    ('cycle8', 22, '• beschreiben den Blutkreislauf als geschlossenes System', 8),
    ('vessels8', 22, '• stellen den Blutkreislauf dar', 8),
    ('disease8', 22, '• beschreiben verschiedene Krankheitsformen exemplarisch', 8),
    ('reproduction10', 22, '• erklären die Funktion der Geschlechtsorgane', 10),
    ('sexhormone10', 22, '• beschreiben die Wirkung der Geschlechtshormone', 10),
    ('immune10', 22, '• erklären die Prinzipien der Immunreaktion', 10),
    ('hiv10', 22, '• beschreiben Übertragungswege und Verlauf einer HIV-Infektion', 10),
    ('bloodtasks8', 23, '• benennen Blutbestandteile in (mikroskopischen) Bildern', 8),
    ('digestionmodel8', 23, '• wenden Modelle zur Verdeutlichung der relevanten Verdauungsvorgänge', 8),
    ('sensehealth8', 24, '• reflektieren das eigene Verhalten in Bezug auf Gesunderhaltung', 8),
    ('drugs8', 24, '• beschreiben den Einfluss der verschiedenen Drogen', 8),
    ('healthrules8', 25, '• erläutern Regeln für die Gesunderhaltung', 8),
    ('infectionprotection8', 25, '• bewerten Maßnahmen, um sich vor Infektionen', 8),
    ('ownhealth10', 25, '• setzen eigene Verhaltensweisen in Beziehung zur Gesunderhaltung', 10),
    ('vaxdecision10', 25, '• beurteilen Nutzen und Risiken von Impfungen', 10),
    ('pregnancycontent', 27, '• Schwangerschaft', None),
    ('contraceptioncontent', 27, '• Empfängnis und Empfängnisverhütung', None),
    ('aidscontent', 27, '• Infektionskrankheiten, AIDS', None),
    ('assessmentgeneral', 19, '• nehmen Stellung und beurteilen eigenständig', None),
]
spans = {spec[0]: cell(*spec) for spec in span_specs}

# The checked cumulative-grade heading and the explicit no-fixed-timing rule
# are contextual evidence, not an invented year range for content-only rows.
page20_text = subprocess.check_output(['pdftotext', '-f', '20', '-l', '20', '-layout', str(pdf), '-']).decode()
page28_text = subprocess.check_output(['pdftotext', '-f', '28', '-l', '28', '-layout', str(pdf), '-']).decode()
assert 'am Ende der Jahrgangsstufe 8 und am Ende der Jahrgangsstufe 10' in page20_text
assert 'Es gibt keine zeitlichen Vorgaben für die Behandlung der Themen.' in page28_text
qualifiers = {
    'gradeCheckpoint': {'physicalPage': 20, 'printedPage': 20,
        'originalMeaning': 'Separate cumulative minimum checkpoints at end grade8 and end grade10/transition to Studienstufe; not a fixed first teaching year.'},
    'noFixedYearForContentList': {'physicalPage': 28, 'printedPage': 28,
        'rawSourceText': 'Es gibt keine zeitlichen Vorgaben für die Behandlung der Themen.',
        'originalMeaning': 'Binding content list is SekI-wide, without fixed teaching grade band or ordering.'},
}

# Indexes are positions in the exactly preserved historical32 HH worklist only.
# All statements below are AUTHOR candidates, never independent decisions.
candidate_specs = [
    (3, ['sense8'], 'Den Bau eines ausgewählten Sinnesorgans beschreiben',
     'Bauaspekt der expliziten Struktur-Funktions-Routine; Auge oder Ohr ist eine erklärte Auswahl aus den Sinnesorganen.',
     ['Auge/Ohr sind im Original nicht als zwingende Organwahl ausgeschrieben.']),
    (5, ['immune10'], 'Prinzipien der Immunreaktion erläutern',
     'Direkter Immunreaktionsaspekt; die Systematik unspezifisch/spezifisch, Parasiten und Allergien wird nicht durch die bloße Originalzeile als vollständig erledigt.',
     ['Allergien und vollständige unspezifisch/spezifisch-Systematik bleiben ungebundene Restanforderungen.']),
    (6, ['sexhormone10'], 'Körperwirkungen von Geschlechtshormonen beschreiben',
     'Begrenzt auf die ausdrücklich benannten Körperwirkungen; körperliche Reifung ist ein deklarierter möglicher Anwendungsfall.',
     ['Menstruationszyklus und vollständiger hormoneller Reifungsmechanismus sind nicht wörtlich belegt.']),
    (8, ['nerves8', 'brain8', 'conduction8'], 'Erregungsleitung und Zusammenwirken von Sinnesorganen und Nervensystem beschreiben',
     'Die drei tatsächlichen Originalroutinen tragen Weiterleitung und eine einfache Verarbeitung über die Funktionen von Gehirn/Rückenmark; keine vollständige neurophysiologische Mechanismenpflicht.',
     ['Einfache Verarbeitung ist erklärte Operationalisierung; detaillierte Verarbeitungsmechanismen bleiben offen.']),
    (9, ['sexhormone10'], 'Körperwirkungen von Geschlechtshormonen an einem Reifungsbeispiel beschreiben',
     'Nur der körperliche Hormonwirkungsaspekt; Pubertät ist ein erklärtes gewähltes Anwendungsbeispiel, kein wörtliches Hamburger Pubertätsbullet.',
     ['Psychische Entwicklung sowie mediale Sexualitäts-/Schönheitsvorstellungen bleiben unbelegt.']),
    (10, ['bloodtasks8', 'clot8'], 'Aufgaben von Blutbestandteilen und Blutgerinnung erläutern',
     'Die Blutbestandteile-Aufgabenroutine und der ausdrücklich beschriebene Gerinnungsprozess sind direkte Teilbindungen.',
     ['Vollständige Plasma-/Transport-/Immunitätsfunktionen werden nicht als ausgeschriebene Originalliste behauptet.']),
    (11, ['contraceptioncontent', 'assessmentgeneral'], 'Empfängnisverhütung sachlich beurteilen',
     'Deklarierte Kombination des ausdrücklichen SekI-Inhalts Empfängnisverhütung mit der allgemeinen eigenständigen Beurteilungsroutine; keine feste Jahreszuordnung.',
     ['Konkrete Methodenliste und verantwortliche Elternschaft sind zusätzliche nicht wörtlich benannte Anforderungen.']),
    (12, ['blood8', 'bloodtasks8'], 'Blutbestandteile benennen und ihre Zusammensetzung beschreiben',
     'Zusammensetzung und Benennen in mikroskopischen Bildern sind echte end8-Originalroutinen; konkrete Eigenschaften sind ein erklärter didaktischer Bauaspekt.',
     ['Keine zusätzliche wörtliche Eigenschaftsliste wird erfunden.']),
    (13, ['cycle8', 'vessels8'], 'Menschlichen Blutkreislauf und Gefäßtypen beschreiben',
     'Die konkrete Kreislauf-/Gefäßroutine trägt einen partiellen Modellbezug zum Transport; Austausch zwischen Umgebung und Körperzellen ist nicht allein damit vollständig belegt.',
     ['Vollständige Stoffaufnahme/-abgabe und Umwelt-Zell-Transportbindung bleiben Restanforderungen.']),
    (14, ['digestion8', 'digestionmodel8'], 'Funktionen ausgewählter Verdauungsbestandteile am Menschen erläutern',
     'Der Mensch ist das tatsächlich behandelte Säugetierbeispiel; ausgewählte Verdauungsbestandteile und Verdauungsmodelle tragen nur diesen Verdauungsaspekt.',
     ['Nahrungsaufnahme und der vollständige Verdauungsweg jedes Säugetiers bleiben ungebunden.']),
    (15, ['hiv10', 'infectionprotection8'], 'HIV-Übertragungswege beschreiben und Infektionsschutz beurteilen',
     'Konkrete HIV-Übertragung plus tatsächliche Infektionsschutzbewertung; die Verbindung ist ein deklarierter Präventionsfall, konservativ end10.',
     ['Weitere sexuell übertragbare Erkrankungen und eine vollständige Präventionsliste bleiben offen.']),
    (19, ['pregnancycontent'], 'Schwangerschaft als verbindlichen Entwicklungsinhalt beschreiben',
     'Schwangerschaft ist ausdrücklich verbindlicher SekI-Inhalt; eine grundlegende Beschreibung ist eine erklärte fachliche Operationalisierung des Inhalts, keine behauptete detaillierte Originalliste.',
     ['Geburt und konkrete Risikofaktoren sind damit nicht vollständig belegt.']),
    (21, ['sexhormone10'], 'Körperwirkungen von Geschlechtshormonen am Reifungsbeispiel beschreiben',
     'Der ausdrücklich beschriebene Hormon-Körper-Bezug wird auf körperliche Reifung als erklärten Fall angewendet; keine behauptete wörtliche Pubertätsmerkmalsliste.',
     ['Vollständige Pubertäts- und Geschlechtsmerkmalliste bleibt nicht wörtlich gebunden.']),
    (22, ['sensehealth8', 'drugs8', 'healthrules8'], 'Sinnesgesundheit und Drogeneinfluss auf das Nervensystem beschreiben',
     'Sinnesgesunderhaltung, Schutz vor Reizüberflutung und Drogeneinfluss auf das Nervensystem sind echte Originalroutinen; konkrete Drogenwirkungen auf jedes Sinnesorgan werden nicht ergänzt.',
     ['Keine erfundene direkte Wirkungsbehauptung jeder Droge auf jedes Sinnesorgan.']),
    (23, ['sense8'], 'Funktionsaspekte eines ausgewählten Sinnesorgans erläutern',
     'Netzhautabbildung oder Schallempfang ist ein erklärtes geeignetes Beispiel der ausdrücklichen Sinnesorgan-Struktur-Funktions-Routine, keine wörtliche Hamburger Mechanismenliste.',
     ['Organwahl und Detailmechanismus sind Autorenoperationalisierung, nicht Originalwortlaut.']),
    (24, ['reproduction10', 'contraceptioncontent', 'pregnancycontent'], 'Geschlechtsorganfunktion, Empfängnis und Schwangerschaft grundlegend erläutern',
     'Konkrete Organfunktionsroutine plus die ausdrücklich verbindlichen Inhalte Empfängnis/Schwangerschaft; Befruchtung und pränatale Entwicklung sind erklärte fachliche Konkretisierungen.',
     ['Keine vollständige embryologische Mechanismenliste wird aus bloßen Inhaltswörtern als Pflicht abgeleitet.']),
    (26, ['hiv10', 'aidscontent', 'infectionprotection8'], 'HIV-Verlauf, AIDS und Infektionsprävention einordnen',
     'HIV-Übertragung/-Verlauf, AIDS als verbindlicher Inhalt und Infektionsschutz sind separat direkt gebunden; Verknüpfung konservativ end10.',
     ['Detaillierte klinische Stadien und Behandlung sind kein ausgeschriebener Originalanspruch.']),
    (27, ['digestion8', 'digestionmodel8'], 'Grundlegende Verdauungsbestandteile und Verdauungsvorgänge erläutern',
     'Nur die konkrete Verdauungsbindung des bestehenden Zieles; eine Pflicht für ausgewogene Ernährung wird nicht aus diesem Verdauungsaspekt abgeleitet.',
     ['Ausgewogene Ernährung und spezifische Ernährungskriterien bleiben offen.']),
    (28, ['immune10', 'vaxdecision10'], 'Impfprinzipien und Nutzen-Risiko-Abwägung begründen',
     'Immunprinzip-/Impfbezug und die echte Impfentscheidung sind explizite end10-Routinen.',
     ['Vollständiger Vergleich aktiver/passiver Immunisierung wird nicht als wörtlicher Originalbullet behauptet.']),
    (29, ['cycle8', 'vessels8', 'healthrules8'], 'Menschlichen Blutkreislauf beschreiben und begrenzte Gesundheitsbezüge herstellen',
     'Konkrete Kreislaufroutinen mit allgemeiner Gesundheitsroutine, ausdrücklich partiell; keine vollständige Atemmechanikbindung.',
     ['Atmungsmechanik und spezifische Lungenvorsorge bleiben Restanforderungen.']),
    (30, ['immune10', 'aidscontent'], 'Immunreaktion bei Infektionskrankheiten beschreiben',
     'Die explizite Immunprinziproutine wird mit dem expliziten Infektionsinhalt als erklärter Infektionsfall kombiniert.',
     ['Transplantation und vollständige Transplantationsimmunologie bleiben offen.']),
]
hold_reasons = {
    1: 'Drogeneinfluss auf das Nervensystem ersetzt keine Lebenskompetenz-/Alltagsbewältigungs-/Persönlichkeitsentwicklungsroutine zur Suchtprävention.',
    2: 'Schwangerschaft als Inhaltswort und Pränataldiagnostik-Rollenspiel belegen keine konkrete Bewertung vor-/währendgeburtlichen Verhaltens nach Gesundheitsfolgen für das Kind.',
    4: 'Diabetes als Krankheitsbeispiel und allgemeine Hormone belegen keine Blutzucker-Regelmechanik samt Lebensgewohnheit-/Veranlagungszusammenhang.',
    7: 'System-Konzept nennt Stoffwechsel/Energieumwandlung, aber keine konkret gebundene offene menschliche Stoffaufnahme mit Energieträgern/Baustoffen; keine bloße Basiskonzeptvererbung.',
    16: 'Allgemeine Gesunderhaltung und Herz-Kreislauf-Erkrankungen als Beispiele belegen keine vollständige aktive Lungen-/Kreislaufvorsorge oder konkrete medizinische Behandlungsmöglichkeiten.',
    17: 'Drogeneinfluss ist nicht gleich modellgestützte Entstehung von Suchtverhalten und dessen Folgen für Betroffene.',
    18: 'Allgemeine Gesundheitsbewertung ersetzt keinen konkret gebundenen Missbrauchsschutz-/Verantwortungskontext.',
    20: 'Atmung als verbindlicher Inhalt und allgemeines Struktur-Funktions-Konzept ersetzen keine ausdrücklich oder konkret gebundene Diffusions-Gasaustauschroutine.',
    25: 'Drogeneinfluss ersetzt keine Beurteilung der Genuss-Sucht-Grenze und kein eigenes Suchtrisikobewusstsein.',
    31: 'Sinnesfunktionen und allgemeiner Organismenvergleich ersetzen keinen belegten artvergleichenden Wahrnehmungs-/Modellfall.',
    32: 'Hormon-/Nervensystemvergleich und allgemeine Steuerung/Regelung ersetzen keinen konkreten hormonellen Rückkopplungs-Modellfall.',
}
assert sorted([s[0] for s in candidate_specs] + list(hold_reasons)) == list(range(1, 33))
source_goals, passages, mapped, decisions, author_scope_records = [], [], [], [], []
for index, span_keys, title, rationale, residual in candidate_specs:
    target = hh_ids[index - 1]
    parents = [spans[key] for key in span_keys]
    source_id = str(uuid.uuid5(uuid.UUID(source['sourceLandscapeId']), f'HH2011-outside52-bounded-component:{target}'))
    first = parents[0]
    checkpoint_values = [p['originalCheckpointEndGrade'] for p in parents if p['originalCheckpointEndGrade']]
    checkpoint = max(checkpoint_values) if checkpoint_values else None
    passage_id = f'hh-outside52:{target}'
    source_goal = {
        'id': source_id, 'passageId': passage_id, 'topicCode': 'HH2011.author-human-biology-component',
        'title': title, 'description': f'Autorenkomponente: {title}.',
        'sourceText': first['sourceText'], 'rawSourceText': first['rawSourceText'],
        'parentBulletText': first['sourceText'], 'rawParentBulletText': first['rawSourceText'],
        'sourceDocumentKey': doc['key'], 'physicalPage': first['physicalPage'], 'printedPage': first['printedPage'],
        'sourceRef': 'Hamburg Bildungsplan Gymnasium SekI Biologie2011; tatsächliche separat gebundene Abschnitte3.1/3.2; deklarierte partielle Autorenkomponente',
        'sourceSpan': f'authored-component:HH2011:{target}',
        'rawSourceSpan': 'Actual physical/printed page and actual column/checkpoint in officialParentBindings; no invented official bullet numbering.',
        'stage': 'SekI', 'courseLevel': 'unspecified', 'granularity': 'officialCompetencyAspect',
        'isOfficialBullet': False, 'officialNumberingClaim': False, 'authorOperationalisation': True,
        'wholeOriginalBulletCoverage': False, 'wholeOriginalSummaryCoverage': False,
        'originalSourceSummaryGoalId': summary_id,
        'officialParentBindings': parents, 'originalCheckpointEndGrade': checkpoint,
        'originalFixedTeachingGradeBand': None,
        'originalGradeContextQualifiers': qualifiers,
        'sourceContextBoundary': {'nativeProjectedStage': 'SekI', 'checkpointEndGrade': checkpoint,
            'noOriginalGKOrLKClaim': True, 'noHigherStageBackfill': True,
            'fixedTeachingYearNotInferred': True, 'grades8And10ColumnsNotMerged': True},
        'canonicalDetailsNotLiteralOriginalWording': residual,
        'tags': ['jurisdiction:DE-HH', 'stage:SekI', 'component-only'],
    }
    source_goals.append(source_goal)
    passages.append({'id': passage_id, 'stage': 'SekI', 'sourceDocumentKey': doc['key'],
        **{k: source_goal[k] for k in ['sourceText', 'rawSourceText', 'physicalPage', 'printedPage']}})
    mapped.append({'legacyGoalId': source_id, 'canonicalGoalId': target, 'matchType': 'partial', 'reviewDecisionId': source_id})
    decisions.append({'sourceGoalId': source_id, 'decision': 'mapped', 'canonicalGoalIds': [target],
        'matchType': 'partial', 'rationale': 'AUTHOR CANDIDATE ONLY: ' + rationale,
        'reviewer': 'codex-HH-outside52-source-author-v1-not-independent-reviewer', 'reviewedAt': now,
        'wholeOriginalSourceCoverage': False, 'independentReviewStatus': 'pending_two_independent_source_scope_reviews'})
    author_scope_records.append({'historicalHHWorklistIndex': index, 'goalId': target,
        'currentWholeCanonicalGoal': goals[target], 'lostViewKey': 'DE-HH/SekI/',
        'authorDecision': 'PARTIAL_DIRECT_COMPONENT_CANDIDATE_NOT_INDEPENDENTLY_REVIEWED',
        'candidateSourceGoalId': source_id, 'primarySpanKeys': span_keys, 'authorRationale': rationale,
        'residualUnboundRequirementsHeld': residual, 'wholeCurrentCanonicalClaimApproved': False,
        'nativeVisibilityRestored': False, 'scientificIndependentApproval': False})

hold_records = []
for index, reason in sorted(hold_reasons.items()):
    target = hh_ids[index - 1]
    hold_records.append({'historicalHHWorklistIndex': index, 'goalId': target,
        'currentWholeCanonicalGoal': goals[target], 'lostViewKey': 'DE-HH/SekI/',
        'authorDecision': 'HOLD_NO_SPECIFIC_MATCHED_ROUTINE_BOUND_IN_THIS_PRIMARY_PACKAGE',
        'reason': reason, 'nativeVisibilityRestored': False, 'scientificIndependentApproval': False})

write('HH.actual-primary-selected-spans.author-v1.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'role': 'primary-reading AUTHOR evidence, not independent approval',
    'primaryDocument': binding(pdf), 'officialLiveDownloadByteIdentical': True, 'officialUrl': doc['url'],
    'selectedActualOriginalSpans': list(spans.values()), 'actualColumnGradeContext': qualifiers,
    'actualBBoxPrimaryPageBindings': pdf_text_bindings,
    'actualPdfPageImagesPersonallyViewed': [18, 19, 20, 22, 23, 24, 25, 26, 27, 28],
    'imageReadMethod': 'pdftoppm actual original bytes; read-only temporary raster, no committed page/image copies',
    'actualTemporaryPrimaryRasterHashes': [
        {'physicalPage': page, 'printedPage': page,
         'sha256': digest(Path(f'/tmp/skillpilot-hh-author-primary/HH-physical-{page}.png')),
         'scaleToPixels': 1600 if page in [18, 19, 27, 28] else 2000,
         'temporaryReproducibleReadingCacheOnly': True}
        for page in [18, 19, 20, 22, 23, 24, 25, 26, 27, 28]],
    'originalPdfParserNote': 'pdftotext bbox XML removes invalid C0 backspace in page headers only for XML parsing; selected original body word bytes/order not normalized into an invented official sentence.',
    'wholeOriginalSourceClearance': False, 'humanApproval': False, 'humanTrial': False})

write('HH.bounded-source-components.author-v1.candidate.json', {
    'schemaVersion': 1, 'sourceLandscapeId': source['sourceLandscapeId'],
    'extractionId': 'hh-biology2011-outside52-bounded-components-author-v1',
    'title': 'Hamburg SekI: bounded outside-Neuro source components, author candidate',
    'jurisdiction': 'DE-HH', 'subject': 'Biologie', 'schoolType': 'Gymnasium', 'stage': 'SekI',
    'sourceDocument': doc, 'sourceDocuments': [doc], 'passages': passages, 'sourceGoals': source_goals,
    'retainedOriginalSourceObligations': {'originalSummaryRecord': original_summary,
        'originalWholeHoldDecision': whole_hold, 'wholeOriginalSummaryCoverage': False,
        'residualHeldHHGoalIds': [r['goalId'] for r in hold_records],
        'residualUnboundRequirementsInsideAllPartialCandidatesRemainHeld': True,
        'originalWholeDecisionsNotReopened': True},
    'qualityReview': {'status': 'author_candidate_awaiting_two_independent_reviews',
        'wholeNationalClearance': False, 'humanApproval': False, 'humanTrial': False},
    'method': 'Actual primary table cells and content lists read. Preserve grade-column geometry and end8/end10 checkpoint distinctions; no fixed teaching year inferred for free SekI content placement. Every candidate is direct and partial, not inherited from original broad summary.'})

write('HH.bounded-component-mappings.author-v1.candidate.json', {
    'schemaVersion': 1, 'sourceLandscapeId': source['sourceLandscapeId'], 'targetLandscapeId': canon['landscapeId'],
    'jurisdiction': 'DE-HH', 'subject': 'Biologie',
    'sourceExtractionPath': str((OWN / 'HH.bounded-source-components.author-v1.candidate.json').relative_to(ROOT)),
    'reviewStatus': 'author_candidate_awaiting_two_independent_reviews', 'mappings': mapped, 'decisions': decisions,
    'wholeOriginalSourceCoverage': False, 'originalWholeSourceHoldRetained': True, 'humanApproval': False, 'humanTrial': False})

write('HH.all-thirty-two-current-goal-primary-scope.decisions.author-v1.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'role': 'source AUTHOR, not independent reviewer',
    'componentCandidates': author_scope_records, 'openCurrentGoalScopeHolds': hold_records,
    'counts': {'HHCurrentHistoricalPairs': 32, 'boundedComponentCandidates': len(source_goals),
        'individualHHGoalPairHolds': len(hold_records), 'otherHistoricalPairsNotTouched': 155,
        'allHistoricalPairs': 187, 'newStrictCompletions': 0, 'restoredActiveBindings': 0},
    'TH19SeparateReviewedSourcePackageUnchanged': True, 'activeWrites': False,
    'strictNetGain': 0, 'humanApproval': False, 'humanTrial': False})

chem_guard = load(CHEM_GUARD)
chem_path = ROOT / chem_guard['baselineActiveCanon']['path']
assert digest(chem_path).removeprefix('sha256:') == chem_guard['baselineActiveCanon']['sha256'].removeprefix('sha256:')
chem_goals = {g['id']: g for g in load(chem_path)['goals']}
assert len(chem_guard['protectedStrictGoalIds']) == 112
th_freeze = load(TH_FREEZE)
assert digest(TH_FREEZE) == 'sha256:2572275ce5bc759e0e8b7691533f4b3caf2d63f55591a444cb065508b975c848'
for entry in th_freeze['files']:
    assert digest(ROOT / entry['path']) == entry['sha256']
protected_paths = [ROOT / f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{subject}.de.json'
                   for subject in ['MATHEMATIK', 'PHYSIK', 'CHEMIE']]
inputs = [SOURCE, WORKLIST, OLD_HOLD_MAPPING, CANON, KINDS, pdf, CHEM_GUARD, TH_FREEZE,
          ROOT / 'AGENTS.md', ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json',
          ROOT / 'app/scripts/goalBookSourceAtlasInputs.ts', ROOT / 'app/scripts/goalBookModel.ts',
          ROOT / 'app/src/utils/authoring/canonicalAuthoring.ts',
          ROOT / 'app/src/utils/authoring/compositionViewAuthoring.ts', *protected_paths]
write('actual-author-input-and-protected-subject-preservation.json', {
    'schemaVersion': 1, 'createdAtUTC': now, 'inputBindings': [binding(p) for p in inputs],
    'currentBiologyCanonicalNodeCount': 472, 'currentBiologyCurricularAtomicCount': 390,
    'currentBiologyWholePayloadSha256': digest(CANON),
    'chemistry112HistoricalReviewedWholeCanonHashExact': True,
    'chemistryProtected112WholeObjectSha256s': [
        {'goalId': target, 'wholeObjectSha256': 'sha256:' + hashlib.sha256(
            json.dumps(chem_goals[target], sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()}
        for target in chem_guard['protectedStrictGoalIds']],
    'TH19AllFrozenAuthorFilesExactHashReuseOnly': True,
    'historicalWorklist383NotUsedAsCurrent390Denominator': True,
    'noMathPhysicsChemistryOrTHReviewReopened': True,
    'nativeCompilerAndCountryViewChecks': 'PENDING_SEPARATE_ACTUAL_TARGETED_RUN',
    'activeWrites': False, 'newStrictCompletions': 0, 'restoredActiveBindings': 0,
    'humanApproval': False, 'humanTrial': False})
print(json.dumps({'HHHistoricalPairs': 32, 'boundedComponents': len(source_goals),
                  'heldWholeGoalPairs': len(hold_records), 'strictGain': 0,
                  'nativeAtlas': 'PENDING_ACTUAL_RUN'}))
