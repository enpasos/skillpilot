#!/usr/bin/env python3
"""Bounded independent source/scope A review. Technical code: Apache-2.0."""
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
import jsonschema

ROOT = Path('/home/enpasos/projects/skillpilot')
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current402-no-jurisdiction34-whole-goal-source-and-target-scope-author-20261014-v1'
OWN = Path(__file__).parent
START = '2026-10-13T23:22:36Z'
def read(p):
    return json.loads(p.read_text(), parse_constant=lambda s: (_ for _ in ()).throw(ValueError(s)))
def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'bytes': p.stat().st_size}
def write(name, value):
    p = OWN / name
    p.parent.mkdir(exist_ok=True, parents=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2, allow_nan=False) + '\n')
    return p
selector_path = AUTHOR / 'NEUTRAL.exact34-whole-goal-source-and-scope-author-inputs.json'
author_seal_path = AUTHOR / 'SEAL.finite-exact34-whole-goal-source-and-target-scope-author.actual.json'
assert digest(selector_path) == 'sha256:366cba9d2f9739f2f2980a1a2a833df57f5817cc0048f4f93276b6c1a40ae783'
assert digest(author_seal_path) == 'sha256:47fe0e1a080863a2866dd6bc72d086d4d13d6b7da098cc80d470ed9387d5a853'
selector = read(selector_path)
input_path = AUTHOR / 'INPUT.exact34-whole-goals-and-original-compiler-evidence.actual.json'
source_rows = read(input_path)['rows']
author_rows = read(AUTHOR / 'AUTHOR.34-whole-goal-source-and-target-dispositions.actual.json')['decisions']
assert [(r['goalId'], r['jurisdiction']) for r in source_rows] == [tuple(p) for p in selector['exactTupleSelector']]
assert len(source_rows) == 34 and len({r['goalId'] for r in source_rows}) == 18
before_path = AUTHOR / 'inputs/canonical.whole.before.json'
after_path = AUTHOR / 'proposals/canonical.whole.after.NI-sigma-applicability-only.json'
before = read(before_path)
after = read(after_path)
before_by = {g['id']: g for g in before['goals']}
after_by = {g['id']: g for g in after['goals']}
sigma = '3dbd84de-51cb-5ff7-801b-077a54520fed'
assert list(before_by) == list(after_by)
changed = [i for i in before_by if before_by[i] != after_by[i]]
assert changed == [sigma]
sigma_after = json.loads(json.dumps(after_by[sigma]))
assert sigma_after['applicability']['jurisdiction'] == before_by[sigma]['applicability']['jurisdiction'] + ['DE-NI']
sigma_after['applicability'] = before_by[sigma]['applicability']
assert sigma_after == before_by[sigma]
for r in source_rows:
    assert r['wholeGoal'] == before_by[r['goalId']]
schema_path = ROOT / 'docs/landscape-runtime.schema.json'
for landscape in [before, after]:
    jsonschema.Draft202012Validator(read(schema_path), format_checker=jsonschema.FormatChecker()).validate(landscape)

exact_inputs = [binding(selector_path), binding(author_seal_path), binding(input_path), binding(schema_path)]
def verify_bindings(x):
    if isinstance(x, dict):
        if all(k in x for k in ['path', 'sha256', 'bytes']):
            p = ROOT / x['path']
            assert binding(p) == {k: x[k] for k in ['path', 'sha256', 'bytes']}, x['path']
            exact_inputs.append(binding(p))
        for v in x.values():
            verify_bindings(v)
    elif isinstance(x, list):
        for v in x:
            verify_bindings(v)
verify_bindings(selector)

primary_receipts = []
for receipt in selector['wholePrimaryCaptures']:
    p = ROOT / receipt['fullContextText']
    assert digest(p) == receipt['sha256'] and p.stat().st_size == receipt['bytes']
    pdf = ROOT / receipt['boundPDF']
    assert digest(pdf) == receipt['PDFSHA256']
    command = list(receipt['actualCommand'])
    result = subprocess.run(command, cwd=ROOT, capture_output=True)
    assert result.returncode == 0 and result.stdout == p.read_bytes(), receipt['fullContextText']
    primary_receipts.append({'jurisdiction': receipt['jurisdiction'], 'physicalRange': receipt['physicalRange'], 'fullContextText': binding(p), 'boundPDF': binding(pdf), 'freshUnmodifiedPdftotextCommand': command, 'freshRawBytesExactlyMatch': True})

view_cas_path = AUTHOR / 'CAS.18-current-whole-composition-views.author-proposals.actual.json'
view_checks = []
def omit_explicit_entries(x, removed):
    if isinstance(x, list):
        return [omit_explicit_entries(v, removed) for v in x if not (isinstance(v, dict) and v.get('kind') == 'goalEntry' and v.get('goalId') in removed)]
    if isinstance(x, dict):
        return {k: omit_explicit_entries(v, removed) for k, v in x.items()}
    return x
for row in read(view_cas_path)['rows']:
    b = ROOT / row['beforeFrozenWholeFile']['path']
    a = ROOT / row['afterInactiveWholeFile']['path']
    removed = {r['goalId'] for r in row['removedExplicitTargetEntries']}
    assert omit_explicit_entries(read(b), removed) == read(a)
    assert row['requiresChanges'] == 0 and row['prerequisiteOnlyConversions'] == 0
    view_checks.append({'before': binding(b), 'after': binding(a), 'onlyTheseExplicitGoalEntriesOmitted': sorted(removed), 'restOfWholeViewExact': True, 'prerequisiteOnlyRoleIntroduced': False})

mapping_cas_path = AUTHOR / 'CAS.NI-LK-sigma-source-partial-partner.two-carriers.author-proposals.actual.json'
mapping_cas = read(mapping_cas_path)
source_cell = mapping_cas['actualCompletePrimarySourceCell']
ni_source = read(AUTHOR / 'inputs/NI.source-extraction.whole.before.json')
assert next(c for c in ni_source['sourceGoals'] if c['id'] == source_cell['id']) == source_cell
assert source_cell == read(AUTHOR / 'INPUT.NI-sigma-complete-source-cell.actual.json')
assert source_cell['courseLevel'] == 'LK'
mapping_checks = []
for row in mapping_cas['rows']:
    bpath = ROOT / row['beforeFrozenWholeFile']['path']
    apath = ROOT / row['afterInactiveWholeFile']['path']
    b, a = read(bpath), read(apath)
    original = next(c for c in b['decisions'] if c['sourceGoalId'] == source_cell['id'])
    proposed = next(c for c in a['decisions'] if c['sourceGoalId'] == source_cell['id'])
    assert original == row['completeOriginalDecision'] and proposed == row['completeProposedDecision']
    assert proposed['canonicalGoalIds'] == original['canonicalGoalIds'] + [sigma]
    assert {k: v for k, v in original.items() if k not in ['canonicalGoalIds', 'rationale', 'reviewedAt', 'reviewer']} == {k: v for k, v in proposed.items() if k not in ['canonicalGoalIds', 'rationale', 'reviewedAt', 'reviewer']}
    assert a['mappings'] == b['mappings'] + [row['addedPartialEdge']]
    assert row['addedPartialEdge']['matchType'] == 'partial'
    assert [c for c in a['decisions'] if c['sourceGoalId'] != source_cell['id']] == [c for c in b['decisions'] if c['sourceGoalId'] != source_cell['id']]
    assert {k: v for k, v in a.items() if k not in ['decisions', 'mappings']} == {k: v for k, v in b.items() if k not in ['decisions', 'mappings']}
    mapping_checks.append({'before': binding(bpath), 'after': binding(apath), 'exactSourceCell': source_cell['id'], 'originalCanonicalPartnersAllRetained': original['canonicalGoalIds'], 'singleAddedPartialEdge': row['addedPartialEdge'], 'allOtherSourceDecisionsAndMappingPayloadExact': True})
write('checks/whole-CAS-primary-reextraction-and-runtime-schema.actual.json', {'schemaVersion': 1, 'wholeCanonicalRuntimeSchemaBeforeAfterPass': True, 'schema': binding(schema_path), 'currentWholeCanonical': binding(before_path), 'inactiveCanonicalProposal': binding(after_path), 'onlyCanonicalDelta': '3dbd84de applicability append DE-NI; all whole bodies, tags, resources, requires and contains exact', 'all34WholeInputsExactlyCurrent': True, 'viewChecks': view_checks, 'mappingChecks': mapping_checks, 'wholeSourceCellUnchanged': source_cell, 'primaryReceipts': primary_receipts, 'pass': True})

reasons = [
    'BW Leistungsfach 3.4.8(4) verlangt anwendungsorientierte Forschung an einer weiteren ausgewählten Stoffgruppe; Pharmazeutika sind ein Beispiel unter mehreren. Das ist weder eine belegte Arzneimittelwahl noch der volle Auftrag zu OTC-Zusammensetzung, Konsum, Anwendung und ASS/Ibuprofen/Paracetamol-Strukturklassifikation. Das Basisfach enthält diesen Wahlkontext nicht. Das ganze Ziel kann als bewusst gewähltes Zusatzbeispiel wieder begründet werden.',
    'BW 3.4.8(4) nennt Waschmittel als mögliche weitere Stoffgruppe im Leistungsfach. Die Quelle verpflichtet nicht zu allen Funktionen von Enthärtern, Bleichsystemen, Enzymen und Hilfsstoffen und trägt keine pauschale Basisfach-Zuweisung. Ein gewählter Waschmittelkontext muss den vollständigen konkreten Funktionsauftrag erst operationalisieren.',
    'BW nennt Silikone unter möglichen weiteren Forschungsstoffgruppen; allgemeine Nano-Eigenschaften sind eigene Pflichten. Daraus entsteht kein universeller vollständiger Auftrag zu Silikonherstellung, Molekülbau, Kunststoffvergleich und Nano-Bedeutung. Das ganze aktuelle402-Ziel bleibt global erhalten; eine spätere gewählte Verbindung braucht ihren eigenen vollständigen Beleg.',
    'NI S.32 fordert den Reaktionstyp Polymerisation und eA dessen radikalischen Mechanismus. Das verlangt keine Polyurethanbildung samt Besonderheiten der Reaktionsführung. Der ganze PU-Auftrag ist damit als zusätzlicher Default nicht belegt; eine konkrete zusätzliche PU-Unterrichtswahl bleibt möglich.',
    'NI S.30 verlangt eA Erstsubstitution am Benzol. S.48 nennt induktive Effekte bei Reaktionen verschiedener Alkanole, ohne daraus die komplette aromatische Zweitsubstitution mit I- und M-Effekten an Toluol, Phenol, Anilin und Nitrobenzol zu machen. Der vollständige Zweitsubstitutionsauftrag wird aus dem Default entfernt, während Erstsubstitution und sigma-Komplex erhalten bleiben.',
    'NI Kompost-Kontexte S.49/54 betreffen einen Biokunststoff aus Stärke, Glucose, Abbaubarkeit und Verwendungsmöglichkeiten. Sie verpflichten nicht zur PLA-Synthese, PLA-Eigenschaften und PLA-Einsatzfeldern. Die Autor-Alternativprosa zur allgemeinen Polykondensationspflicht ist keine NI-Primäraussage; Proteinbildung ist separat. PLA wird nur gemeinsam mit seinen ebenfalls unbelegten Folgezieleinträgen ausgelassen.',
    'NI Makromolekülpflichten verlangen Typen, Struktur/Eigenschaft, Polymerisation, Recycling und Anwendungen. Eine zusätzliche allgemeine Copolymerstruktur-/Vorteilsdiskussion gegenüber Homopolymeren wird nicht verlangt. Die PLA→Copolymer→Spezialwerkstoff-Kette darf gemeinsam aus dem Default verschwinden; kein verbliebenes Ziel darf dabei seinen Vorgänger verlieren.',
    'NI S.50 nennt Vom Kautschuk zum High-Tech-Reifen als alternative Unterrichtseinheit. Das beweist weder diese Wahl noch zusätzlich modifizierte Cellulose mit deren Eigenschaften. Der ganze Zwei-Partner-Auftrag wird als Default ausgelassen; bei späterer Wahl bleibt die vollständige Cellulose-/Synthese-/Vulkanisationspflicht prüfpflichtig.',
    'NI eA S.32 verlangt Dimension, Eigenschaften und Nutzen/Risiken ausgewählter Nanomaterialien. S.49 nennt Silber in Funktionskleidung als Beispiel; antimikrobielle Polyolefin-Verpackung ist ein anderer spezieller Kontext. Eine gewählte Verpackungsoperationalisierung kann relevant sein, ist aber keine zusätzliche obligatorische Landeskompetenz und keine belegte gA-Nanowahl. Allgemeine Nano-Partner werden erhalten.',
    'NI S.54 prüft Stärke-Abbaubarkeit im Kompost und vergleicht mit Biogasanlagen; S.32 hat Naturstoffstruktur und eA Polypeptidbildung. Diese Angaben sind kein vollständiger allgemeiner Auftrag zur Erklärung von Biopolymer-Abbaumechanismen und deren Bedingungen. Der konkrete Stärke-/Protein-Kontext und Recycling bleiben in ihren unveränderten Partnern bestehen.',
    'NI eA S.30 verlangt den Reaktionsmechanismus der Benzol-Erstsubstitution; die Darstellung über elektrophilen Ringangriff, nichtaromatischen areniumartigen sigma-Komplex und Protonenabgabe/Rearomatisierung ist eine notwendige sachgerechte Mechanismuskomponente. Der ganze kurze sigma-Mechanismus-Body wird an diesem geforderten Exemplar getragen. Der neue 1:n-Partner bleibt partial zur vollständigen Sourcezelle, ausschließlich LK/eA; weitere bisherige Partner werden dadurch nicht unabhängig freigegeben.',
    'Der NI-Auftrag zur Benzol-Erstsubstitution verpflichtet nicht zum Planen und Steuern sowohl einer Friedel-Crafts-Alkylierung als auch einer Acylierung. Allgemeine eA Syntheseplanung macht beide speziellen Routen nicht zum Default. Der neue sigma-Partner bleibt erhalten, während das zusätzliche FC-Ziel ausgelassen wird.',
    'NI S.26/47 verlangt Sauerstoff-/Säurekorrosion, Erklärung der Opferanode, Korrosionsexperimente und wirtschaftliche Folgen. Diese Pflichten bleiben bei den vorhandenen 0908/94a6- und Bewertungs-/Praxispartnern; ihre Bodies wurden gelesen und Target-Erhaltung gemessen. Das weitere ganze Metall-/Legierungs-Strategienurteil mit PLA als Voraussetzung ist aus dieser Quelle nicht eigens erforderlich.',
    'NI Benzolmesomerie und Erstsubstitution sowie aliphatische I-Effekte tragen nicht automatisch die vollständige vergleichende Acidität/Basicität mit I- und M-Effekten an ausgewählten Teilchen. Die allgemeinen Säure-Base-Pflichten bleiben erhalten; die zusätzliche aromatische Urteilskompetenz hat keinen belegten obligatorischen Default.',
    'NI S.30 hat Mechanismus-/Modellkompetenz; daraus folgt kein zusätzlicher vollständiger Auftrag zur Kriterienbewertung der Bedeutung aromatischer Stoffe in Alltag, Industrie und Gesundheit. Die vorhandenen allgemeinen Sicherheits-/Bewertungspflichten werden weder gelöscht noch als Beweis dieses eigenen Aromatenurteils verwendet.',
    'NI Nano- und Kunststoffpflichten enthalten keine spezielle Silikonherstellung, keinen vollständigen Silikon-/Kunststoffvergleich und keine nachgewiesene Kombination mit Nano-Anwendungen. Der breite alte Silikon-Body bleibt global unangetastet und wird im NI-Default ausgelassen.',
    'NI S.32 erklärt Funktionalität ausgewählter Kunststoffe und Nano-Oberflächen. Elektrische Polymerleitfähigkeit durch ausgedehnte konjugierte Systeme ist ein zusätzlicher spezieller Erklärungsauftrag. Er ist nicht allein durch Makromolekül- oder Aromatencluster verpflichtend; sein ebenfalls unbelegter Anwendungenachfolger wird gemeinsam ausgelassen.',
    'NI allgemein beurteilter Kunststoffeinsatz verlangt nicht die komplette leitfähige-Polymer-Anwendung samt Vor-/Nachteilen gegenüber metallischen Leitern. Das Paar 73cbd4d8→14f1fe97 wird zusammen aus dem Default ausgelassen; kein verbleibender Zielverbraucher wird auf einen entfernten Leitfähigkeitsvorgänger angewiesen.',
    'NI Struktur/Eigenschaft und Kunststoffanwendungsrecherche verpflichten nicht zu den vier konkreten Verfahren Spritzgießen, Tiefziehen, Kalandrieren und Extrudieren samt Materialbezügen. Der vollständige Verfahrens-Body bleibt global erhalten; ein bewusst ausgewählter Verarbeitungsunterricht benötigt einen passenden Beleg.',
    'SH S.62/69/70 verlangt Herstellung und Eigenschaften mindestens eines Kunststoffs sowie erhöht Estersynthese-/Radikalmechanismus. Das ist keine Pflicht zur PU-Bildung mit besonderer Reaktionsführung. Eine tatsächlich gewählte PU-Herstellung wäre ein möglicher zusätzlicher enger Unterrichtsbeleg, ist hier aber nicht nachgewiesen.',
    'HB S.36 enthält verpflichtende Wirkstoff-/Naturstoffsynthese und Medikamentenbewertung sowie dünn umrahmte Medikamenten-/ASS-Experimente. Diese sind nicht der vollständige OTC-Konsum-/Anwendungs-/Strukturklassifikationsauftrag mit allen drei genannten Wirkstoffen. Die konkreten verpflichtenden Betreiber und optionale Kontexte bleiben erhalten; LK-Default des zusätzlichen ganzen Ziels wird ausgelassen.',
    'HB S.34 enthält Nachhaltigkeitsbewertung von Biokunststoffen und optionale Abbauversuche. Das ist weder im GK noch LK ein vollständiger zusätzlicher Auftrag zu allgemeinen Abbaumechanismen und Bedingungen. Die originalen Recycling-/Biokunststoffpflichten werden damit nicht abgeschafft; eine wirkliche ausgewählte Abbauoperationalisierung bleibt offen.',
    'HB S.34/15 unterscheidet Pflichtkästen und optionale Vertiefung. Die Silikonvertiefung umfasst Herstellung/Struktur, Eigenschaften/Anwendungen und Öle/Harze/Kautschuke; das alte ganze Ziel fordert stattdessen Kunststoffvergleich und Nano-Bedeutung. Seine defaultmäßige LK-Zuweisung wird ausgelassen. Die echte optionale Familienpflicht bleibt separat vollständig zu konservieren und bei Wahl zu operationalisieren.',
    'HB S.34 allgemeine Kunststoffentstehung/-struktur und LK Nano-Veränderungen verpflichten nicht zur elektrischen Leitfähigkeit über konjugierte Polymer-Elektronensysteme. Die spezielle Leitfähigkeitskompetenz wird gemeinsam mit ihrem Nachfolger als unbelegter LK-Default ausgelassen, ohne allgemeine Kunststoff-/Nano-Pflichten zu reduzieren.',
    'HB S.34 verlangt Kunststoffvergleich nach Kriterien, nicht gerade den vollständigen leitfähige-Kunststoffe-versus-Metalle-Auftrag. Der unbelegte Vorgänger 73cbd und dieser Nachfolger werden zusammen ausgelassen; andere Chemie-Vergleichspflichten und globale Kanten bleiben erhalten.',
    'HB S.34 hat Kunststoffentstehung, Struktur, Kriterienvergleich und Recycling, aber keine Verpflichtung zu allen vier genannten Formgebungsverfahren. Die frühere HB19-Nachbarzellenproblematik ist separat offen und wird durch diesen Default-Scope-CAS weder als Autorität benutzt noch historisch umgeschrieben.',
    'MV physisch20–22 behandelt Naturstoffe und Kunststoffe; im Kunststoffteil stehen Polymerisation, Polykondensation, PE-Radikalmechanismus, Recycling und ausgewählte Kunststoffbeispiele. Polyurethanbildung und besondere Reaktionsführung sind kein zusätzlicher kompletter verpflichtender LK-Auftrag.',
    'RP S.65 grau hinterlegte Vertiefungs-/Verzahnung nennt Polyadditionmechanismus und Polyaddukte wie PU; sie ist optional nach dem Bausteinprinzip, kein Pflicht-LK-Default. Die vollständige originale Option bleibt erhalten und wird durch den separaten neuen engen Mechanismusträger mit echten Wahlbedingungen behandelt. Das alte spezifische PU-Reaktionsführungsziel wird als unbelegter Default ausgelassen.',
    'RP S.66/67 verlangt im LK gewählte Nanostrukturen und mindestens zwei Anwendungen, im GK sind die Bausteine W. Nano-Silber ist im Einführungstext ein mögliches Beispiel; die ganze antimikrobielle Polyolefin-Verpackung ist nicht verpflichtend und eine GK-Wahl nicht belegt. Die breiten Nano-Duties bleiben vollständig bestehen; ein bewusst gewähltes Verpackungsbeispiel braucht seinen eigenen Scope.',
    'SL LK S.77 verlangt Polymerisation und deren Mechanismus an PE/PP/PVC/PS sowie Recherche und kritische Diskussion moderner Kunststoffe. Das legt keine spezielle PU-Bildung mit Besonderheiten der Reaktionsführung fest. Eine moderne Werkstoffrecherche allein erzeugt diesen ganzen zusätzlichen Pflichtbody nicht.',
    'SN LK physisch57–59 verlangt Kunststoffstruktur/Eigenschaft, Polymerisation, Polykondensation und radikalischen Mechanismus. Der volle Polyurethan-/Reaktionsführungsauftrag steht nicht in dieser verbindlichen Liste; der alte weitere PU-Default wird ausgelassen.',
    'SN LK hat exemplarische Nanostrukturen/Nanoteilchen und Oberflächeneigenschaften; das ist keine festgelegte antimikrobielle Silber-/Polyolefin-Verpackung und keine automatische GK-Kompetenz. Das bestimmte Silver-Verpackungsziel darf in einem bewusst gewählten und vollständig operationalisierten Kontext vorkommen, bleibt aber außerhalb des ungeprüften Default.',
    'ST eAN S.54 nennt PE/PP/PVC, Polymerisation/AR-Mechanismus und exemplarische Herstellung/Verwendung; gAN S.44 hat ebenfalls Polymerisation. Daraus folgt keine Pflicht zur Polyurethanbildung und besonderen Reaktionsführung. Der ganze PU-Auftrag bleibt global erhalten und wird aus dem LK-Default ausgelassen.',
    'ST S.31 betrifft Jahrgang9 und nennt Kohlenstoff, Nanotubes und Nanomaterial in modernen Werkstoffen. Es fordert weder Silber noch antimikrobielle Polyolefin-Verpackung; ein SekI-Nanotube-Eintrag ist keine vollständige SekII- oder GK/LK-Autorität für diesen besonderen Body. Ein explizit gewähltes Verpackungsbeispiel bleibt möglich.'
]
assert len(reasons) == 34
stock = read(OWN / 'checks/stock-current18-target-and-full-prerequisite-acquisition.actual.json')
assert stock['pass']
completed = datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
records = []
for ordinal, (r, a, reason) in enumerate(zip(source_rows, author_rows, reasons, strict=True), 1):
    assert (r['goalId'], r['jurisdiction']) == (a['goalId'], a['jurisdiction'])
    primary = a['primaryWholeContext']
    scoped = [v for v in stock['scoped'] if v['jurisdiction'] == r['jurisdiction']]
    affected = [v['courseProfile'] for v in scoped if r['goalId'] in v['beforeTargets']]
    retained = r['goalId'] == sigma
    records.append({'schemaVersion': 1, 'recordId': 'current402-source-scope34-independent-a-' + str(ordinal).zfill(2), 'ordinal': ordinal, 'goalId': r['goalId'], 'jurisdiction': r['jurisdiction'], 'wholeCurrentGoal': r['wholeGoal'], 'wholeCurrentGoalInputBinding': binding(input_path), 'wholeCurrentGoalInputRow': ordinal - 1, 'actualCurrentTargetCourses': affected, 'sourceContentVerdict': 'ACCEPT_NI_LK_BENZENE_FIRST_SUBSTITUTION_SIGMA_COMPONENT' if retained else 'NO_PROOF_OF_THIS_WHOLE_GOAL_AS_UNIVERSAL_COMPULSORY_DEFAULT', 'scopeProposalVerdict': 'ACCEPT_BOUNDED_NI_LK_PARTIAL_SOURCE_AND_APPLICABILITY_CAS' if retained else 'ACCEPT_EXACT_DEFAULT_TARGET_OMISSION', 'scientificRationaleDe': reason, 'actualCompletePrimaryContextBinding': primary, 'actualPrimaryCourseInterpretation': 'NI eA/LK only; source first benzene substitution and mechanism modelling, not GK' if retained else 'Scope-specific course/selection/operator boundary described in rationale; full source contexts read', 'wholeCanonicalBodyAndGlobalRequiresPreserved': True, 'remainingTargetLosesRemovedDirectInheritedOrTransitivePrerequisite': False, 'prerequisiteOnlyConversion': False, 'alternativeSelectedContextStatus': 'HOLD until actual teaching/learner selection and full current-body/partner operationalization; optional context is not a default entitlement' if not retained else 'Existing original partners retained without renewed approval; source component is partial, source-cell full closure not granted', 'recordAuthority': 'independent_ai_scientific_candidate', 'operativeSourceOrViewWrite': False, 'D_P_A_M_V_HumanOrStrictClaim': False, 'completedAt': completed})
records_path = OWN / 'RECORDS.exact34-whole-goal-source-target-scope.independent-a.actual.jsonl'
records_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':'), allow_nan=False) + '\n' for r in records))

write('SCIENTIFIC.exact34-current402-source-and-target-scope.independent-a.actual.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'reviewKind': 'fresh independent bounded Source/Scope-A whole-goal review', 'startedAt': START, 'completedAt': completed, 'neutralSelector': binding(selector_path), 'authorSeal': binding(author_seal_path), 'wholeInput': binding(input_path), 'exactTupleCount': 34, 'distinctWholeGoalCount': 18, 'perTupleRecords': binding(records_path), 'scientificOutcome': {'defaultTargetOmissionsAccepted': 33, 'narrowNI_LK_SigmaSourceComponentAccepted': 1, 'operativeChangesAuthorizedByThisArtifact': 0},
    'sourceAndScopeDistinction': 'The 33 decisions accept removal of unjustified universal default targets. They do not assert that these subjects can never be taught or that all selected examples are unsupported. Actual selected alternatives require full-duty and scope proof. The sigma body is supported as a necessary mechanism component at the required benzene-first-substitution exemplar; the source-cell edge remains partial.',
    'inspection': {'all34WholeCompetencesRead': True, 'wholeDEENCurrentCanonicalBodiesRead': True, 'completeCurrentCompilerEvidenceAvailableAndBound': True, 'all18BoundPrimaryFullContextTextCapturesRead': True, 'freshPrimaryTextReextractedAndByteMatched': True, 'actualPrimaryNativePagesViewed': [{'jurisdiction': 'NI', 'physicalPages': [30, 32]}, {'jurisdiction': 'HB', 'physicalPages': [34, 36]}, {'jurisdiction': 'BW', 'physicalPages': [42]}, {'jurisdiction': 'RP', 'physicalPages': [65, 66]}, {'jurisdiction': 'SH', 'physicalPages': [69, 70]}], 'viewPurpose': 'Verify eA boldness, LK-only columns, obligatory/optional boundaries, BW selected further group and RP grey optional mechanism box; no D or V review claimed.', 'wholeOriginalNI_SOURCECellAndAllFourExistingCanonicalPartnerBodiesRead': True, 'authorRationalesReadAsProposalsOnly': True, 'newIndependentPeerVerdictsReadBeforeOwnSeal': False},
    'prerequisiteAndDutyPreservation': {'stockViewCount': 18, 'removedDefaultGoalEntriesAcrossCourseViews': 46, 'newDirectInheritedOrTransitiveAcquisitionGapsFromTheseOmissions': 0, 'requiredClusterContentsIncludedInDependencyAudit': True, 'NI_LK_SigmaAndWholePrerequisiteB98RemainTargets': True, 'NI_GK_SigmaNotAdded': True, 'all523WholeCanonicalNodesPreserved': True, 'onlyCanonicalMutationProposal': 'sigma applicability appends NI, retaining descriptions/tags/requires/resources', 'allNineWholeSourceExtractionsRetained': True, 'NI_SOURCECellTextOperatorsOriginalFourPartnersAndEveryOtherMappingDecisionPreserved': True, 'noPrerequisiteOnlyConversions': True, 'NI_CorrosionAndGeneralNanoPartnersRetained': '0908/94a6 in both course views; dfbccd62 in LK, and size/surface-volume 5e2 in both views unchanged. This preservation does not newly approve their entire historical source mappings.', 'baseline24RequiresClosureAnd12OriginalSourceObligations': 'Separate open science/source lanes. These 34 decisions neither certify all baseline prerequisites acquireable nor close all original duties.'},
    'preciseResiduals': [
        {'id': 'SOURCE34-A-NI-POLYKONDENSATION-PROSE-OVERREACH', 'boundAuthorFile': binding(AUTHOR / 'AUTHOR.34-whole-goal-source-and-target-dispositions.actual.json'), 'tuple': ['0278a515-8990-5a1c-8a1b-a03382a144a3', 'DE-NI'], 'authorField': 'boundedAlternativeOrHold', 'issue': 'The alternative calls NI synthetic polykondensation a Pflicht. Actual S.32 names polymerisation and eA application to polypeptide formation; S.49/54 starch biodegradation is a different context. No universal synthetic polyester/polyamide duty follows.', 'effect': 'Does not invalidate PLA default omission; reject this wording as any new Source proof. Existing source duty/surrogate issues remain separate.'},
        {'id': 'SOURCE34-A-OPTIONAL-SOURCE-DUTIES-REMAIN-BOUND', 'tuples': [['e56040b5-1da8-5080-b358-086d04922339', 'DE-HB'], ['f947cd04-952a-5a9d-9445-3ffc70e02c3c', 'DE-RP']], 'issue': 'HB silicone oils/resins/rubbers and RP optional polyaddition mechanism retain their full original source-cell demands. Omitting the older mismatching defaults does not discharge these options once selected.', 'effect': 'Separate narrow successor source/choice integration stays CONDITIONAL/HOLD until real choice and scope binding; no new source12 completion in this review.'},
        {'id': 'SOURCE34-A-NI-SIGMA-NEW-SOURCE-COMPONENT-LIMIT', 'sourceCell': source_cell['id'], 'issue': 'Sigma is a derived necessary component of benzene first-substitution mechanism, not an explicit separate sigma keyword in the NI source. It does not prove directing effects on four substituted systems, both Friedel-Crafts plans, or the entire historical 1:n source union.', 'effect': 'Accept only the exact added partial component and NI LK applicability proposal; native quality hash rebinding and operative source integration remain separate.'}
    ],
    'independenceAndProvenance': {'provider': 'OpenAI', 'knownModelFamily': 'GPT-6', 'exactRuntimeModelRevision': None, 'samplingParameters': None, 'authorAndTechnicalCountsUsedAsScientificOracle': False, 'freshPeerVerdictsRead': False, 'priorOwnSourceAndNativeWorkExists': True, 'contextNaiveClaim': False, 'outboundPreSealContentExposure': 'A preliminary message containing NI source observations was sent to the parent before the parent requested completion/seal-only messages for its parallel check. No peer science was received here. Parent disclosed it will label its own check as exposed; this A review remains independently judged.'},
    'authorityBoundary': {'activeCurriculumWrites': False, 'engineRegistryGitWrites': False, 'D_P_A_M_V_Authority': False, 'humanApproval': False, 'strictGain': 0, 'wholeCurriculumSourceGateClosed': False, 'allOptionalSelectionResolved': False}
})

dedup = {b['path']: b for b in exact_inputs}
write('INPUTS.exact-original34-whole-bound-provenance.independent-a.actual.json', {'schemaVersion': 1, 'startedAt': START, 'neutralSelector': binding(selector_path), 'authorSeal': binding(author_seal_path), 'actualExactInputsAllVerified': list(dedup.values()), 'allWholeCasesAreCurrent402NotFuture407': True, 'separateEarlier24AndSource12NotConsumedAsApprovalOracle': True, 'publicTemporaryLinks': False})

spec = importlib.util.spec_from_file_location('stock_validate_schemas', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
guard = module.curriculum_symlink_errors(str(ROOT))
write('checks/curriculum-symlink-errors.unmodified-stock.actual.json', {'schemaVersion': 1, 'stockFunction': 'scripts/validate_schemas.py:curriculum_symlink_errors', 'stockModule': binding(ROOT / 'scripts/validate_schemas.py'), 'checkedAt': datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'), 'errors': guard, 'errorCount': len(guard), 'pass': not guard})
assert not guard
parsed = []
for p in sorted(OWN.rglob('*')):
    assert not p.is_symlink()
    if p.suffix == '.json':
        read(p); parsed.append({'path': str(p.relative_to(OWN)), 'kind': 'json'})
    elif p.suffix == '.jsonl':
        values = [json.loads(s, parse_constant=lambda s: (_ for _ in ()).throw(ValueError(s))) for s in p.read_text().splitlines()]
        parsed.append({'path': str(p.relative_to(OWN)), 'kind': 'jsonl', 'records': len(values)})
write('checks/finite-own-root-full-json-jsonl-parse.actual.json', {'schemaVersion': 1, 'parsed': parsed, 'allJSONJSONLFullyParsed': True, 'ownSymlinks': 0, 'ignoredTemporaryLinks': 0, 'pass': True})
print(json.dumps({'records': len(records), 'defaultTargetOmissionsAccepted': 33, 'NI_LK_SigmaComponentAccepted': 1, 'runtimeSchemaAndWholeCASPass': True, 'primaryReextracts': len(primary_receipts), 'stockScopeAcquisitionPass': stock['pass'], 'globalGuardErrors': len(guard), 'completedAt': completed}))
