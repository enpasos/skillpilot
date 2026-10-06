#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Freeze round-A judgments and focused actual inputs; never mutate active inputs.

The substantive judgments in this file were authored after reading the preserved
proposal and primary material. Hash comparisons document reuse boundaries only;
they do not supply substantive curriculum approval.
"""
from __future__ import annotations

import hashlib
import json
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
V3 = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3"
CANON = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json"
LEDGER = "curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json"
REGISTRY = "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
ATLAS = "app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json"
BOOK = "app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json"
PRESENTATION = "fb41c82c-12c3-5f9a-9e8d-40f10c9fade9"
GLOBAL_ROUTE = "14577339-9e0c-5b44-8e47-91e1a4947367"
PROTECTED = [
    "a0e8f0f2-24e2-5945-a511-597d32e73796",
    "8b98d8ba-65c6-58d7-92f0-45f4b2456573",
    "3c9bfa10-9a13-50cc-96c8-6213e28d6c54",
]


def read(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def sha(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def binding(path: Path) -> dict:
    return {"path": str(path.relative_to(ROOT)), "sha256": sha(path), "bytes": path.stat().st_size}


def emit(name: str, payload: dict) -> None:
    # This dossier is additive and immutable. A rerun must choose a new version.
    with (OUT / name).open("x", encoding="utf-8") as handle:
        json.dump(payload, handle, ensure_ascii=False, indent=2)
        handle.write("\n")


SOURCES = {
    "BY8": {"file": "by8.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/8/chemie", "scope": "C8.1 process competencies; guided qualitative investigation, documentation, source use, criteria, models"},
    "BY9CH": {"file": "by9-ch.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch", "scope": "C9 CH .1 process competencies; simple questions, guided investigation, given sources/arguments, career choice"},
    "BY9NTG": {"file": "by9-ntg.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/chemie/ch-ntg", "scope": "C9 NTG .1; known cases independently, unfamiliar cases with guidance, quantitative work, own research/arguments"},
    "BY10CH": {"file": "by10-ch.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch", "scope": "C10 CH .1; self-planned/performed investigations, data validity, decision strategies"},
    "BY10NTG": {"file": "by10-ntg.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/10/chemie/ch-ntg", "scope": "C10 NTG .1; investigations, data, models, sources, knowledge/decision reflection"},
    "BY11": {"file": "by11.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/11/chemie", "scope": "C11.1.1-.4 including actual analytical investigation, theory-led hypotheses, pharmaceuticals, complex organic/biochemical models and knowledge influences"},
    "BY12GA": {"file": "by12-ga.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/grundlegend", "scope": "C12.1.1-.4 S17, E1-E12, K1-K13, B2-B14; C12.3.3 analytical evidential validity, sources and controls"},
    "BY12EA": {"file": "by12-ea.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/chemie/erhoeht", "scope": "C12 eA process clauses and C12.3.3; course-specific content stays bounded"},
    "BY13GA": {"file": "by13-ga.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/chemie/grundlegend", "scope": "C13.1.1-.4 process clauses; hypotheses, investigations, data, inquiry, source critique, dialogue and evaluation"},
    "BY13EA": {"file": "by13-ea.actual-main.txt", "url": "https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/chemie/erhoeht", "scope": "C13 eA .1 process clauses; same process labels do not remove eA content requirements"},
    "BW": {"file": "bw-v2.actual-main.txt", "url": "https://www.bildungsplaene-bw.de/,Lde/BP2016BW_ALLG_GYM_CH.V2_IK_8-9-10_01_01", "scope": "3.2.1.1(12) substance-specific uses; actual PDF physical page 7 process competencies"},
    "NI-I": {"path": "curricula/DE/Gymnasium/input/NI/lower-secondary/kc_naturwissenschaften_gymnasium_sek_i_2015.pdf", "scope": "Primary table images physical pages 51 and 61: 5/6 guided experiments, 9/10 reaction/communication/evaluation/careers; actual mapped clauses are separately pinned"},
    "NI-II": {"path": "curricula/DE/Gymnasium/input/NI/upper-secondary/KC-CH_SII_Druck.pdf", "url": "https://cuvo.nibis.de/index.php?p=download&upload=362", "scope": "Primary table images physical pages 18 and 21; all 23 current direct scientific-discourse clauses, including three eA-only clauses"},
}

# KEEP refers to the stated boundary/text, never to all five gates or publication.
FINDINGS = [
    {
        "goalId": "91238ba1-5c63-50c7-a4fd-9bbe492c6b61", "family": "Hypotheses and investigation",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "REVISE",
        "sourceRefs": ["BY8:C8.1", "BY9CH:C9.1", "BY9NTG:C9.1", "BY10CH:C10.1", "BY10NTG:C10.1", "BY11:C11.1.2", "BY12GA:E1-E6", "BY12EA:E1-E6", "BY13GA:E1-E6", "BY13EA:E1-E6", "NI-I:physical-page-051", "NI-II:physical-page-021"],
        "reasonDe": "Eine prüfbare, chemisch begründete Hypothese ist ein anderes Leistungsprodukt als eine sicher geplante und tatsächlich ausgeführte Untersuchung. Die drei v3 Kerne erhalten diesen Unterschied, aber bedingte Theorie-/Selbstständigkeitsformulierungen und die zusätzliche allgemeine Modellleistung lassen Quellenansprüche noch ausweichbar.",
        "counterexampleDe": "Eine begründete Vorhersage aus einem Alltagseffekt belegt weder den theoriegeleiteten Oberstufenfall noch selbstständige Analysenmethodenwahl, sichere Ausführung oder Protokoll. Umgekehrt ersetzt das Lesen fertiger Titrationsdaten keine Untersuchung.",
        "keepDe": "Drei Kernprodukte Hypothesenformulierung, Sek-I-Untersuchung und selbstständige anspruchsvolle Untersuchung; tatsächliche Ausführung bleibt von bloßer Planung unterschieden.",
        "boundedRemedyDe": "Merge-Entscheidungen A-M1/A-M2 umsetzen. In upper-hypothesis-investigation das unbedingte zusätzliche 'sowie' einer allgemeinen Modellkompetenz entfernen: das Leistungsprodukt ist die hypothesengeleitete Untersuchung mit begründeter Methodenwahl; modellbasierte Quellenzweige ausdrücklich auf passende Hypothesenprüfung begrenzen und allgemeine Modellbeurteilung den vorhandenen Modellgeschwistern zuordnen. BY11 verlangt weiterhin tatsächliche analytische Ausführung; BY12/13 E4/E5 erlaubt je Quellenzweig ein geeignetes modellbasiertes Vorgehen, aber kein automatisches Ersetzen aller Experimente. Qualitative und quantitative Oberstufenpflichten erhalten; kein einzelner einfacher Versuch als Gesamtnachweis.",
        "mappingBoundaryDe": "NI protolysis calculation ni-chemistry-sekii-kc2022-q-protolyse-1-kompetenz-005-e69bf651 ist eine Berechnungsleistung, keine vollständige Hypothesen-/Durchführungsroutine; als partielle inhaltliche Verpflichtung erhalten oder zum tatsächlichen Rechenziel umleiten, niemals generisch exact machen.",
        "blockers": ["A-M1 source-specific theory requirement", "A-M2 independence requirement", "upper experimental/model alternative and method scope", "final current native reviews and evidence"],
    },
    {
        "goalId": "49b13b33-34b7-5e4e-861c-b21082cb9922", "family": "Chemical data",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "REVISE",
        "sourceRefs": ["BY8:C8.1 documentation", "BY9NTG:C9.1 data", "BY10CH:C10.1 data", "BY10NTG:C10.1 data", "BY11:C11.1.2", "BY12GA:S17,E8,E11,B3,C12.3.3", "BY12EA:S17,E8,E11,B3,C12.3.3", "BY13GA:S17,E8,E11,B3", "BY13EA:S17,E8,E11,B3", "NI-I:cr-7-8-2-kompetenz-003-c3f40133"],
        "reasonDe": "Nachvollziehbare Datendokumentation, methodische quantitative Auswertung und begründetes Urteil über die Tragweite können unabhängig gelingen oder misslingen. Dokumentation und Gültigkeitsurteil sind in v3 sinnvoll getrennt; der zusammengeführte Auswertungskern lässt anspruchsvolle quantitative Methoden aber noch als bloße Fallvariante erscheinen.",
        "counterexampleDe": "Ein sauberer Trendvergleich kann korrekt sein, obwohl die lernende Person weder eine quantitative Beziehung auswerten noch die Eignung ihrer mathematischen Methode begründen kann. Eine technisch korrekte Rechnung kann zugleich aus unzuverlässigen Daten eine unzulässige Schlussfolgerung ziehen.",
        "keepDe": "data-documentation als überprüfbares Datenprodukt und data-validity als eigenständiges Evidenzurteil. Digitale Erfassung und Tabellenkalkulation kommen bereits in Sek I vor; sie sind kein ausschließliches Oberstufenmerkmal.",
        "boundedRemedyDe": "A-M3 umsetzen: interpretative Sek-I-Grundleistung und anspruchsvolle quantitative/mathematische Auswertungsroutine getrennt beurteilen. Im Gültigkeitszweig für C12.3.3 eine echte, quellengebundene analytische Aufgabe mit Positiv-/Negativblindprobe, Unterschied Hinweis/Nachweis und geeigneten Vergleichsquellen vorsehen; dies nicht pauschal in jede Datenaufgabe hineinziehen. Fehlerursache, Datenreichweite und tragfähige Schlussfolgerung gemeinsam am selben Datensatz begründen.",
        "mappingBoundaryDe": "NI cr-7-8-2-kompetenz-003-c3f40133 verlangt Messabweichungen beschreiben/deuten; diese lokale Pflicht deckt weder die ganze Datenfamilie noch Untersuchungsplanung. Fachübergreifende Oberstufenbezüge von E11 bleiben eine explizite Auswertungspflicht, wo die Quelle sie verlangt.",
        "blockers": ["A-M3 merged interpretation boundary", "C12.3.3 analytical evidence scope", "final current native reviews and evidence"],
    },
    {
        "goalId": "f660c91a-fa14-5010-94cf-068d785c7fd2", "family": "Inquiry reflection and validity",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "REVISE",
        "sourceRefs": ["BY10CH:C10.1", "BY10NTG:C10.1", "BY11:C11.1.2", "BY12GA:E10,E12", "BY12EA:E10,E12", "BY13GA:E10,E12", "BY13EA:E10,E12", "BW:physical-page-007"],
        "reasonDe": "Das Deuten eines gegebenen chemischen Erkenntnisweges, die Reflexion eigener Untersuchungsentscheidungen und das formal begründete Urteil zur Gültigkeit wissenschaftlicher Erkenntnisse sind verschieden überprüfbare Produkte. v3 trennt die formale Gültigkeit sinnvoll, verbindet Fremdweg und eigene Reflexion jedoch noch.",
        "counterexampleDe": "Eine Person kann erklären, wie ein historischer Versuch zu Wissen beiträgt, ohne ihre eigenen methodischen Entscheidungen oder Verbesserungen anhand eigener Daten zu reflektieren. Ein misslungener Versuchsaufbau ist außerdem nicht automatisch ein falsifizierender Gegenbefund.",
        "keepDe": "upper-scientific-validity bleibt ein zusammenhängendes Gültigkeitsargument mit Reproduzierbarkeit, Falsifizierbarkeit, Intersubjektivität, logischer Konsistenz und Vorläufigkeit, keine fünf isolierten Begriffskarten.",
        "boundedRemedyDe": "A-M4 umsetzen: einen gegebenen Erkenntnisweg und seine Reichweite beurteilen getrennt von der ausdrücklich eigenen Untersuchung mit eigenen Ergebnissen, Vorgehensentscheidungen, Fehler-/Grenzenanalyse und begründeter Verbesserung. E10 darf durch einen rein fremden Fall nicht bestehen. Im E12-Fall robuste Gegenbefunde von fehlgeschlagener Durchführung und unzuverlässiger Messung unterscheiden.",
        "mappingBoundaryDe": "Content-specific reflection clauses stay partial unless their complete chemical content and demanded action are covered; general process labels alone do not approve all jurisdictions or courses.",
        "blockers": ["A-M4 own/other inquiry distinction", "final independent image judgment for corrected f660 candidate", "final current native reviews and evidence"],
    },
    {
        "goalId": "b6327e98-8ab9-5d7f-b826-4023bc1a56a7", "family": "Sources, argument and presentation",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "KEEP", "integrationDecision": "REVISE",
        "sourceRefs": ["BY8:C8.1 communication", "BY9CH:C9.1 communication/evaluation", "BY9NTG:C9.1", "BY10CH:C10.1", "BY10NTG:C10.1", "BY11:C11.1.3", "BY12GA:K1-K12,B2,B4", "BY12EA:K1-K12,B2,B4", "BY13GA:K1-K12,B2,B4", "BY13EA:K1-K12,B2,B4", "BW:physical-page-007"],
        "reasonDe": "Informationsauswahl/Interpretation, Quellenkritik und kriteriale Pro-/Kontra-Abwägung liefern getrennt prüfbare Produkte. Die vier v3 Kerne erhalten die Sek-I-/Oberstufenreichweite; eine zusätzliche eigene Darstellung/Präsentation wird zu Recht nicht als fünfte duplizierte Routine angelegt, muss aber tatsächlich über den vorhandenen Begleiter erreichbar werden.",
        "counterexampleDe": "Eine Quelle korrekt zusammenzufassen beweist keine Prüfung ihrer Intention/Validität. Ein Quellenvergleich beweist keine sach-, adressaten- und mediengerechte eigene Präsentation. Eine neue Beschreibung eines im Buch nicht publizierten Begleiters schafft keine aktuelle Präsentationsabdeckung.",
        "keepDe": "Vier Kandidatenkerne; komplexe chemische/pharmazeutische Recherche, Quellenbelege/Zitate, Trust-/Validitätsurteil und anhand von Belegen gewichtete Argumente bleiben explizit. Reine 'vorgegeben'-Einstiegsleistung darf Quellenzweige mit selbstständiger Recherche/eigenen Argumenten nicht allein abschließen.",
        "boundedRemedyDe": "fb41c82c-12c3-5f9a-9e8d-40f10c9fade9 gezielt auf erforderliche chemische/pharmazeutische Themen, Lern-/Arbeits-/Untersuchungsergebnisse, analoge/digitale Darstellungswahl, Urheberschaft/Zitatkennzeichnung und Eignungsreflexion prüfen. Danach echte Quellenzuordnung, passende Sek-I-/Sek-II-Sichten und veröffentlichte Buchseite herstellen oder die betroffenen Präsentationsbindungen ausdrücklich offen/partial halten. Keine doppelte Präsentationskompetenz erzeugen. Geänderte requires-Zielwahl an den drei geschützten quellenkritischen Begleitern nur in tatsächlich geändertem Kontext überprüfen; deren unveränderten Fachinhalt nicht neu historisch reviewen.",
        "mappingBoundaryDe": "Der aktuelle nationale Atlas enthält fb41c82c nicht. Ein generisches Informationskind darf K11/K12-Präsentation daher noch nicht als vollständig erfüllt behaupten. Alle bisherigen 1646 direkten Quellenverpflichtungen bleiben erhalten; keine globale partial→exact-Aufwertung.",
        "blockers": ["presentation companion source/view/book reachability", "targeted protected reverse-prerequisite rebinding if changed", "final current native reviews and evidence"],
    },
    {
        "goalId": "542822de-cb96-56cf-a487-0fc3b5820f57", "family": "Chemistry applications and careers",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "REVISE", "proposedBoundaryDecision": "KEEP",
        "sourceRefs": ["BY9CH:C9.1 evaluation/career choice", "BY9NTG:C9.1 evaluation/career choice", "BY10CH:C10.1", "BY10NTG:C10.1", "NI-I:physical-page-061", "BW:3.2.1.1(12)", "BY12GA:B10,B12,B13"],
        "reasonDe": "Gesellschaftliche Bedeutung chemischer Anwendungen und begründete Einbeziehung chemischer Berufsfelder in eine Wahl sind unabhängig überprüfbar. Das zweite v3 Kind schwächt die spezifische Wahlleistung durch 'Berufsorientierung oder Berufswahl' jedoch zur bloßen Orientierung ab.",
        "counterexampleDe": "Eine Person kann ein Chemieberufsfeld beschreiben, ohne dessen Aufgaben/Anforderungen mit einem Interessenprofil zu vergleichen oder die Information in eine Wahl einzubeziehen. Sie kann Gesellschaftsfolgen diskutieren, ohne die sechs konkreten BW-Stoffe aus ihren Eigenschaften für Anwendungen zu erklären.",
        "keepDe": "Zwei Kinder und ein erhaltener AND-Familienaggregator. Allgemeine Orientierungszwecke einer Lehrplanpassage machen die beiden Erfolgsprodukte nicht austauschbar.",
        "boundedRemedyDe": "Karrierekind verbindlich auf einen begründeten Wahlbezug zuspitzen: 'Die lernende Person kann chemische Berufsfelder anhand ihrer Aufgaben, Anwendungsbereiche und Anforderungen vergleichen und diese Informationen unter Bezug auf ein gegebenes Interessen- und Anforderungsprofil in eine begründete Berufswahl einbeziehen.' EN: 'The learner can compare chemistry-related careers by their tasks, fields of application, and requirements, and use that information with a given interests-and-requirements profile to justify a career choice.' Ein fiktives Profil genügt für maschinelle Curriculums-QS; keine privaten Lernendendaten oder tatsächliche Berufsberatung behaupten.",
        "mappingBoundaryDe": "BW3.2.1.1(12) umfasst Anwendungen von Methan, Ethen, Benzin, Ethanol, Propanon und Ethansäure anhand ihrer Eigenschaften. Diese inhaltlichen Pflichten an passende Stoffziele binden oder partial offen lassen; weder generische Anwendung noch Berufsorientierung ist ein exact-Ersatz. Oberstufenfolgen/B12-B13 gehören zum b3c9-Effektkind.",
        "blockers": ["career-choice wording", "content-specific application obligation routing", "independent actual-image review of corrected 5428 candidate", "final current native reviews and evidence"],
    },
    {
        "goalId": "1df17884-96ae-57d7-9da9-dbebd082596f", "family": "Criteria-based decisions",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "REVISE", "proposedBoundaryDecision": "KEEP",
        "sourceRefs": ["BY9CH:C9.1 evaluation", "BY10CH:C10.1 evaluation", "BY10NTG:C10.1 evaluation", "BY11:C11.1.4", "BY12GA:B5-B9,B11,B14", "BY12EA:B5-B9,B11,B14", "BY13GA:B5-B9,B11,B14", "BY13EA:B5-B9,B11,B14", "NI-I:cr-9-10-3-kompetenz-017-07635182", "NI-I:cr-9-10-3-kompetenz-018-a7155602"],
        "reasonDe": "Kriterien, Handlungsoptionen, Chancen/Risiken, begründete Strategie und Reflexion bilden eine gemeinsame tragfähige Entscheidungsleistung. Die v3 Beschreibung lässt durch die ausschließliche Alltags-/Gesellschaftsformulierung berufliche Kontexte aus, die der Oberstufenquellenanspruch einschließt.",
        "counterexampleDe": "Eine ausgewogene private Kaufentscheidung belegt nicht die Entscheidung in einem beruflichen chemischen Anwendungskontext. Mehrperspektivisches Bewerten einer Reaktion und bloßes Erkennen von Berufen beweisen jeweils noch keine vollständige Strategie-/Entscheidungsreflexion.",
        "keepDe": "Ein integrierter atomarer Entscheidungskern; keine Trennung allein nach den Verben. Nicht jede Fallaufgabe braucht schematisch alle fünf Kriterienfamilien, aber alle quellengebundenen relevanten Perspektiven müssen begründet ausgewählt werden.",
        "boundedRemedyDe": "Einleitung der DE-Fassung auf 'bei einer chemisch relevanten Alltags-, Gesellschafts- oder beruflichen Entscheidung' und EN auf 'in a chemically relevant everyday, societal, or professional decision' erweitern. Passende Kriterien fachlich ableiten, Optionen und Chancen/Risiken vergleichen, Strategie wählen sowie Entscheidung/Kriterien/Strategie und Grenzen der chemischen Sicht reflektieren. Angeleitete C10-Ethikleistung darf selbstständige Oberstufenpflicht nicht allein schließen. Ziel-ID erst nach den vollständigen aktuellen D/P/A/M/V-Prüfungen als atomar beibehalten.",
        "mappingBoundaryDe": "NI-Reaktionsbewertung und Berufs-Erkennung sind partielle Einzelverpflichtungen; die Karriere-Klausel darf zum Karriereziel umgeleitet werden, wird aber nicht automatisch dessen vollständiger Wahlbezug. Kein Verlust und kein globaler exact-Schalter.",
        "blockers": ["professional decision context", "source-specific independence and partial mapping preservation", "final current native reviews and evidence"],
    },
    {
        "goalId": "b3c9c4b8-5575-5200-86cf-26c14ebcc3d8", "family": "Knowledge influences and chemistry effects",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "KEEP", "integrationDecision": "REVISE",
        "sourceRefs": ["BY11:C11.1.4 knowledge influences", "BY12GA:B10,B12,B13", "BY12EA:B10,B12,B13", "BY13GA:B10,B12,B13", "BY13EA:B10,B12,B13", "BW:physical-page-007 evaluation"],
        "reasonDe": "Einflüsse auf Wissensentwicklung und historische/aktuelle Wirkungen chemischer Produkte, Methoden, Verfahren und Erkenntnisse können unabhängig beurteilt werden. Die v3 Zweiteilung erhält beide und vermeidet, gesellschaftliche Zustimmung mit empirischer Gültigkeit gleichzusetzen.",
        "counterexampleDe": "Eine Erklärung, wie technische Möglichkeiten Forschung beeinflussen, ist kein Urteil über die ökologischen, ökonomischen und sozialen Folgen eines chemischen Verfahrens. Eine heutige Produktfolgenliste belegt noch keine historische Wissensentwicklung.",
        "keepDe": "Zwei Oberstufenprodukte: begründetes Wissenseinflussurteil und historisch/aktuell fundiertes Nachhaltigkeits-/Folgenurteil einschließlich Auswirkungen eigenen Handelns. Die Dimensionen gehören jeweils zum begründeten gemeinsamen Fallurteil.",
        "boundedRemedyDe": "Beide vorgeschlagenen Kinder in tatsächliche quellengedeckte Sek-II-Parents und Sichten legen; den aktuell irreführenden Sek-I-Buchpfad nicht durch bloßen Titel-/Hashwechsel erhalten. BY11-Wissenseinflüsse nicht automatisch bundesweit exakt behaupten. Für Effekte historische und aktuelle Aspekte sowie Produkte/Methoden/Verfahren/Erkenntnisse erhalten, wo die Quelle sie verlangt; eigene Handlungsfolgen in einem fiktiven Fall beurteilen ohne Lernendenbeobachtung zu erfinden.",
        "mappingBoundaryDe": "Aktuelle b3c9-Buchseite liegt unter 'Chemische Erkenntnisgewinnung und Kommunikation (Sek I)'. Neues Sek-II-Placement und Änderungen am aktuellen globalen Reverse-Prerequisite-Ziel separat prüfen; die alte v3 Gesamtsnapshot-Bindung ist dafür veraltet.",
        "blockers": ["actual SekII placement/view/page", "fresh global route context", "final current native reviews and evidence"],
    },
    {
        "goalId": "1f354a60-be44-512b-8f8b-f67c8c456035", "family": "Scientific discourse",
        "currentOriginalDecision": "KEEP", "v3ProposalDecision": "KEEP", "integrationDecision": "REVISE",
        "sourceRefs": ["BY11:C11.1.3", "BY12GA:K10,K13", "BY12EA:K10,K13", "BY13GA:K10,K13", "BY13EA:K10,K13", "NI-II:23 current direct clauses", "NI-II:physical-page-018", "NI-II:physical-page-021"],
        "reasonDe": "Fachliche Erklärung, begründetes Argument, konstruktive Gegenrede und Standpunktreflexion gehören zu einer prüfbaren wissenschaftlichen Dialoghandlung. Das aktuelle DE/EN-Paar entspricht dem vorgeschlagenen Kern und kann ohne Stilüberarbeitung erhalten werden.",
        "counterexampleDe": "Eine fachlich korrekte monologische Reaktionsbegründung liefert noch keinen konstruktiven Austausch und keine Standpunktreflexion. Ein korrekter Standpunkt muss nach validen Gegenargumenten nicht zwangsweise geändert werden.",
        "keepDe": "Ganzes aktuelles DE/EN-Zieltextpaar unverändert. 'reflektieren oder korrigieren' erhalten; Korrektur nur bei fachlichem Anlass.",
        "boundedRemedyDe": "Tatsächliche Sek-II-Platzierung/Sichten/Buchseite herstellen und daran eine fachliche Dialogaufgabe mit Reaktion auf ein Argument und begründeter Standpunktprüfung binden. Alle 23 NI-Sek-II-Klauseln mit ihrem chemischen Inhalt erhalten; drei ausdrücklich eA/LK-only Verpflichtungen dürfen nicht als GK-Pflicht oder vollständiger generischer Dialog umdeklariert werden. Neuprüfung auf geänderte Kontext-/Seiten-/Quellenbindungen begrenzen; keinen historischen Neustart des unveränderten Texts verlangen.",
        "mappingBoundaryDe": "Drei eA-only Quellen-IDs: ni-chemistry-sekii-kc2022-q-protolyse-3-kompetenz-005-ff1e21c7; ni-chemistry-sekii-kc2022-q-organik-1-kompetenz-021-6add63ec; ni-chemistry-sekii-kc2022-q-organik-3-kompetenz-016-1c840939. Reaktionserklärung/Modellreflexion/Table-value argument alone stay partial, not all-K13 dialog exact. Current book placement is still SekI.",
        "blockers": ["actual SekII placement/view/page", "course/content-specific NI obligations", "fresh global route context", "final current native reviews and evidence"],
    },
    {
        "goalId": "277a3c20-6082-5a95-be08-c1e386efe79b", "family": "Chemical model use and criticism",
        "currentOriginalDecision": "REVISE", "v3ProposalDecision": "KEEP",
        "sourceRefs": ["BY8:C8.1 modelling", "BY9CH:C9.1", "BY9NTG:C9.1", "BY10CH:C10.1", "BY10NTG:C10.1", "BY11:C11.1.2 complex organic/biochemical/pharmaceutical models", "BY12GA:E7,E9", "BY12EA:E7,E9", "BY13GA:E7,E9", "BY13EA:E7,E9", "NI-I:physical-page-061", "BW:physical-page-007"],
        "reasonDe": "Modellwahl/Nutzung, Abgleich mit Beobachtung oder Hypothese sowie begründete Grenze/Weiterentwicklung bilden je Kontext einen Modellbeurteilungsprozess. Ein einfaches Sek-I-Teilchenmodell belegt aber die ausdrücklich komplexe organische/biochemisch-pharmazeutische Molekülroutine nicht.",
        "counterexampleDe": "Ein Modell der Aggregatzustände kann passend eingesetzt werden, obwohl räumliche Bindungsverhältnisse, Enzym/Substrat- oder Wirkstoff/Rezeptor-Wechselwirkungen nicht analysiert werden können. Eine allgemeine Grenzenliste ist kein modellbasiertes Urteil zu einem komplexen Molekül.",
        "keepDe": "Zwei vorgeschlagene quellengebundene Modellkerne. Keine atomare Aufspaltung allein in Modellwahl, Vergleich und Grenze; diese Aspekte begründen dasselbe Modellurteil.",
        "boundedRemedyDe": "Die Oberstufenaufgabe muss tatsächlich organische Geometrien/Bindungsverhältnisse und je gebundenem Fall enzymatische oder pharmazeutische Wechselwirkungen bearbeiten. Vorwissen auf die tatsächlich verwendeten fachlichen Atome beziehen, nicht pauschal einen ganzen Sek-II-Root als Prerequisite setzen. Allgemeine Untersuchungsmodelle aus 91238 bei geeigneter Methodenwahl hier wiederverwenden statt zusätzliche unbedingte Doppelroutine erzeugen. Inhaltsspezifische Hybridisierungs-, Enzym- und Gleichgewichtsverpflichtungen behalten eigene Ziele/partial-Bindungen.",
        "mappingBoundaryDe": "Generische E7/E9-Prozesslabels machen nicht jede komplexe Molekül-/Wechselwirkungspflicht exact; alle bestehenden inhaltlichen Obligationen und GK/eA-Grenzen bleiben bestehen.",
        "blockers": ["concrete complex-molecule prerequisites and cases", "no generic-to-specific exact promotion", "final current native reviews and evidence"],
    },
]

MERGES = [
    {
        "reviewId": "A-M1", "candidateKey": "question-hypothesis", "boundaryDecision": "KEEP", "wordingAndEvidenceDecision": "REVISE",
        "sourceRefs": ["BY8:C8.1", "BY9CH:C9.1", "BY10CH:C10.1", "BY11:C11.1.2", "BY12GA:E1-E3", "BY13GA:E1-E3"],
        "reasonDe": "Frage, chemisch begründete Hypothese und daraus abgeleitete erwartbare Beobachtung sind ein kausal zusammenhängendes Formulierungsprodukt. Theoriekomplexität ist hier fachlicher Fallanspruch, keine unabhängige zweite Durchführungskompetenz.",
        "counterexampleDe": "Eine bloß plausible Alltagsvermutung ohne passenden chemischen Konzeptbezug und Vorhersage darf die ausdrücklich theoriegeleitete Oberstufenspur nicht bestehen lassen.",
        "boundedRemedyDe": "Bedingtes 'bei weiterführenden Fragestellungen' in der finalen Kernbeschreibung durch verbindlichen angemessenen chemischen Begründungs-/Vorhersagebezug ersetzen. Jede Quellen-/Stufenspur muss den verlangten Theorieanspruch gesondert in aktueller Aufgabenabdeckung tragen; ein einfacher Einstiegsfall liefert keinen universellen Gesamterfolg.",
        "suggestedDescriptionDe": "Die lernende Person kann aus Beobachtungen eine chemisch untersuchbare Frage ableiten, mit passenden chemischen Konzepten eine prüfbare Hypothese begründen und daraus einen erwartbaren Befund ableiten.",
        "suggestedDescriptionEn": "The learner can derive an investigable chemical question from observations, justify a testable hypothesis using suitable chemical concepts, and derive an expected finding from it.",
    },
    {
        "reviewId": "A-M2", "candidateKey": "sek1-hypothesis-investigation", "boundaryDecision": "KEEP", "wordingAndEvidenceDecision": "REVISE",
        "sourceRefs": ["BY8:C8.1", "BY9CH:C9.1", "BY9NTG:C9.1", "BY10CH:C10.1", "BY10NTG:C10.1", "NI-I:physical-page-051"],
        "reasonDe": "Planung, sichere tatsächliche Durchführung und überprüfbares Protokoll ergeben eine vollständige hypothesengeleitete Untersuchung. Der Anleitungsgrad ist Progression dieser Routine, kein allein ausreichender Grund für ein weiteres Inhaltsatom.",
        "counterexampleDe": "Sicheres Nachmachen eines vollständig angeleiteten Experiments belegt nicht die Quellenpflicht einer selbst geplanten C10-Untersuchung. Die vage Bedingung 'bei entsprechendem Vorwissen' kann gerade diesen Anspruch auf später verschieben.",
        "boundedRemedyDe": "Anleitungsgrad quellen-/jahrgangsgebunden verbindlich machen: C8/C9-CH angeleitete Einstiegsfälle, C9-NTG bekannte Sachverhalte selbstständig und unbekannte nach Anleitung, C10 selbst geplante Durchführung. Planung und Ausführung müssen im gleichen Fall nachweisbar sein. Qualitativ/quantitativ, Variablenkontrolle, Arbeitstechnik/Sicherheit und Protokoll nur als aktuelle vollständige Quellenpflichten bestätigen; keine fiktiven Lernendenbeobachtungen.",
        "requiresSourceSpecificEvidence": True,
    },
    {
        "reviewId": "A-M3", "candidateKey": "data-interpretation", "boundaryDecision": "REVISE", "wordingAndEvidenceDecision": "REVISE",
        "sourceRefs": ["BY8:C8.1", "BY9NTG:C9.1", "BY11:C11.1.2", "BY12GA:S17,E8,E11", "BY12EA:S17,E8,E11", "BY13GA:S17,E8,E11"],
        "reasonDe": "Muster/Hypothesenbezug aus einem einfachen Datenfall erkennen und eine anspruchsvolle quantitative Auswertungsmethode angemessen auswählen, anwenden und begründen können unabhängig gelingen. Die explizite Oberstufenroutine ist mit 'bei anspruchsvollen Fragestellungen' noch bedingt gebündelt.",
        "counterexampleDe": "Ein richtiger qualitativer Trend und Hypothesenbezug kann ohne quantitative Methodenkompetenz gezeigt werden; eine fehlerhafte quantitative Auswertung ist trotz richtig erkannter Richtung nicht beherrscht.",
        "boundedRemedyDe": "Zwei prüfbare Erfolgsprodukte statt einer bedingten Schlussklausel: (1) aus chemischen Daten in geeigneter Darstellung Muster/Beziehungen erkennen, fachlich deuten und auf die Hypothese beziehen; (2) für eine anspruchsvolle quantitative Fragestellung ein geeignetes mathematisches Verfahren und benötigte digitale Werkzeuge wählen/begründen, anwenden und die quantitative Schlussfolgerung samt verlangten fachübergreifenden Bezügen auf die Hypothese beziehen. Dokumentation und Gültigkeitsurteil bleiben eigene Geschwister. Digitale Werkzeuge sind nicht ausschließlich SekII.",
        "proposedProductKeys": ["sek1-data-interpretation", "upper-quantitative-data-analysis"],
        "candidateIdsAssigned": False,
    },
    {
        "reviewId": "A-M4", "candidateKey": "inquiry-process-reflection", "boundaryDecision": "REVISE", "wordingAndEvidenceDecision": "REVISE",
        "sourceRefs": ["BY10CH:C10.1", "BY11:C11.1.2", "BY12GA:E10,E12", "BY12EA:E10,E12", "BY13GA:E10,E12", "BY13EA:E10,E12"],
        "reasonDe": "Einen gegebenen/fremden Erkenntnisweg erklären und seine Reichweite beurteilen kann ohne Reflexion eigener Untersuchungsentscheidungen gelingen. E10 verlangt eigene Ergebnisse und den eigenen Prozess; dies ist eine zusätzliche konkrete Performanz gegenüber Fremdfallwissen.",
        "counterexampleDe": "Eine gute Erklärung einer historischen Erkenntnisentwicklung enthält keine Beobachtung der eigenen Methodenauswahl, ihrer Folgen oder einer begründeten eigenen Verbesserung.",
        "boundedRemedyDe": "Zwei Kerne: (1) einen gegebenen chemischen Erkenntnisweg hinsichtlich Frage, Methoden, Befund, Deutung, beantwortbarer Fragen und Grenzen beurteilen; (2) anhand einer eigenen Untersuchung eigene Ergebnisse/Vorgehensentscheidungen, Unsicherheiten und Grenzen reflektieren und eine konkrete fachlich begründete Verbesserung ableiten. upper-scientific-validity bleibt als drittes, formales E12-Gültigkeitsargument separat. 'Eigen' ist Nachweisinhalt, keine erfundene aktuelle Lernendenbeobachtung.",
        "proposedProductKeys": ["inquiry-route-reach", "upper-own-inquiry-process-reflection"],
        "candidateIdsAssigned": False,
    },
]


def main() -> None:
    now = datetime.now(timezone.utc).isoformat()
    proposal = read(V3 / "twenty-atomic-boundaries.de-en.author-proposal.json")
    old = read(V3 / "active-nine-and-exact-graph-inputs.snapshot.json")
    obligations = read(V3 / "all-national-original-nine-source-obligations.actual.json")
    freeze = read(V3 / "author-proposal-checkpoint.final.freeze.json")
    current = read(ROOT / CANON)
    ledger = read(ROOT / LEDGER)
    goals = {g["id"]: g for g in current["goals"]}
    ids = old["originalGoalIds"]
    assert set(ids) == {row["goalId"] for row in FINDINGS}
    assert len(ids) == 9 and len(proposal["atoms"]) == 20
    assert all(a["candidateId"] is None for a in proposal["atoms"])
    curricular = sorted(d["goalId"] for d in ledger["decisions"] if d["semanticKind"] == "curricularAtomic")
    assert len(curricular) == ledger["counts"]["curricularAtomic"] == 376
    assert len(goals) == 474 and set(curricular).issubset(goals)
    assert sha(ROOT / CANON) == "0fd3c538b5b554606ea8b073fa8c4cd3e27c376599cc416f0e8d2452b70be3be"

    # Check exact preserved source material before recording any reuse claim.
    frozen = []
    for row in freeze["files"]:
        path = V3 / row["path"]
        actual = sha(path)
        assert actual == row["sha256"] and path.stat().st_size == row["bytes"], row["path"]
        frozen.append({"path": str(path.relative_to(ROOT)), "sha256": actual, "bytes": path.stat().st_size})
    assert len(frozen) == freeze["fileCount"] == 100
    active_paths = [ROOT / p for p in [CANON, LEDGER, REGISTRY, ATLAS, BOOK]]
    source_checks = []
    mapping_by_path = {}
    extraction_by_path = {}
    for row in obligations["files"]:
        mpath, epath = ROOT / row["mappingPath"], ROOT / row["sourceExtractionPath"]
        assert sha(mpath) == row["mappingSha256"], row["mappingPath"]
        assert sha(epath) == row["sourceExtractionSha256"], row["sourceExtractionPath"]
        active_paths.extend([mpath, epath])
        mapping_by_path[row["mappingPath"]] = read(mpath)["mappings"]
        extraction_by_path[row["sourceExtractionPath"]] = read(epath)
        source_checks.append({"mapping": binding(mpath), "sourceExtraction": binding(epath), "scientificMappingApproval": False})
    assert len(source_checks) == 29
    # Whole objects, not just refreshed digests; this remains a binding test.
    checked_bindings = 0
    for row in obligations["directBindings"]:
        assert row["wholeMapping"] in mapping_by_path[row["mappingPath"]]
        matching_file = next(f for f in obligations["files"] if f["mappingPath"] == row["mappingPath"])
        extraction = extraction_by_path[matching_file["sourceExtractionPath"]]
        assert row["wholeSourceGoal"] in extraction["sourceGoals"]
        assert row["wholePassage"] in extraction["passages"]
        checked_bindings += 1
    assert checked_bindings == 1646

    families = []
    reverse_deltas = []
    for family in old["families"]:
        gid = family["goalId"]
        assert family["wholeCurrentGoal"] == goals[gid], gid
        assert all(goals[p["id"]] == p for p in family["parents"]), gid
        reverse = [g for g in current["goals"] if gid in g.get("requires", [])]
        families.append({
            "goalId": gid, "wholeCurrentGoal": goals[gid],
            "wholeCurrentParents": [g for g in current["goals"] if gid in g.get("contains", [])],
            "wholeCurrentPrerequisites": [goals[i] for i in goals[gid].get("requires", [])],
            "wholeCurrentReverseRequires": reverse,
        })
        saved = {g["id"]: g for g in family["reverseRequires"]}
        for g in reverse:
            if g["id"] in saved and g != saved[g["id"]]:
                assert g["id"] == GLOBAL_ROUTE
                other_saved = {k: v for k, v in saved[g["id"]].items() if k != "requires"}
                other_now = {k: v for k, v in g.items() if k != "requires"}
                assert other_saved == other_now
                reverse_deltas.append({"originalFamilyGoalId": gid, "dependentGoalId": g["id"], "changedField": "requires", "savedRequiresCount": len(saved[g["id"]]["requires"]), "currentRequiresCount": len(g["requires"]), "removedFromSaved": sorted(set(saved[g["id"]]["requires"]) - set(g["requires"])), "addedToSaved": sorted(set(g["requires"]) - set(saved[g["id"]]["requires"])), "action": "use fresh current whole context; do not rebind to the old 378-goal snapshot"})
    assert len(reverse_deltas) == 2
    old_protected = {g["id"]: g for g in old["protectedWholeGoals"]}
    assert all(goals[p] == old_protected[p] for p in PROTECTED)
    pages = {p["goalId"]: p for p in read(ROOT / BOOK)["pages"]}
    assert PRESENTATION not in pages
    assert all(pages[p]["breadcrumbs"] == ["Chemie", "Chemische Erkenntnisgewinnung und Kommunikation (Sek I)"] for p in ["b3c9c4b8-5575-5200-86cf-26c14ebcc3d8", "1f354a60-be44-512b-8f8b-f67c8c456035"])

    ni_discourse = [r for r in obligations["directBindings"] if r["wholeMapping"]["canonicalGoalId"] == "1f354a60-be44-512b-8f8b-f67c8c456035" and r["wholeSourceGoal"]["id"].startswith("ni-chemistry-sekii")]
    assert len(ni_discourse) == 23
    ea_expected = {
        "ni-chemistry-sekii-kc2022-q-protolyse-3-kompetenz-005-ff1e21c7",
        "ni-chemistry-sekii-kc2022-q-organik-1-kompetenz-021-6add63ec",
        "ni-chemistry-sekii-kc2022-q-organik-3-kompetenz-016-1c840939",
    }
    assert {r["wholeSourceGoal"]["id"] for r in ni_discourse if r["wholeSourceGoal"]["courseLevel"] == "LK"} == ea_expected

    primary_files = []
    for source, meta in SOURCES.items():
        if "file" in meta:
            path = V3 / "primary-inputs" / meta["file"]
            primary_files.append({"sourceKey": source, **binding(path), **meta, "reviewAction": "read actual retained primary text"})
    page_names = ["ni-i-physical-page-051.png", "ni-i-physical-page-061.png", "ni-ii-physical-page-018.png", "ni-ii-physical-page-021.png", "bw-physical-page-007.png"]
    for name in page_names:
        path = V3 / "primary-inputs" / "actual-primary-pdf-pages" / name
        primary_files.append({**binding(path), "reviewAction": "inspected actual PDF page image, including table columns"})
    guarded_paths = sorted(set(active_paths + [V3 / r["path"] for r in freeze["files"]] + [V3 / "author-proposal-checkpoint.final.freeze.json"]))
    before = [binding(path) for path in guarded_paths]
    no_completion = {"newScientificClosures": 0, "restoredBindings": 0, "strictCompletionsAdded": 0, "activeFilesChanged": False, "historicalReviewArtifactsChanged": False, "humanApproval": False, "humanTrial": False}
    emit("input-bindings.snapshot.json", {
        "schemaVersion": 1, "artifactKind": "bounded_independent_source_structure_review_inputs", "status": "ai_candidate_review_findings", "capturedAt": now,
        "reviewer": "/root/duration_report_fix", "reviewRound": "A", "independentOfV3Author": True, "fullyBlindToHistoricalFindings": False,
        "priorInformationRead": ["historical v1 description findings during preceding read-only audit", "older independent three-family source review during preceding read-only audit"],
        "otherCurrentReviewerOutputsRead": False, "positiveProfilesReadForThisRound": False,
        "currentBindings": [binding(ROOT / p) for p in [CANON, LEDGER, REGISTRY, ATLAS, BOOK]],
        "wholeCurrentGoalCount": len(goals), "currentCurricularAtomicCount": len(curricular), "currentCurricularAtomicGoalIds": curricular,
        "v3ProposalBinding": binding(V3 / "twenty-atomic-boundaries.de-en.author-proposal.json"),
        "v3FreezeBinding": binding(V3 / "author-proposal-checkpoint.final.freeze.json"),
        "v3WholeCanonicalBindingIsCurrent": False, "v3WholeCanonicalSha256": old["canonicalSha256"],
        "wholeCurrentFamiliesAndContexts": families,
        "wholeCurrentPresentationCompanion": goals[PRESENTATION], "presentationCompanionIsPublishedInCurrentNationalBook": False,
        "wholeCurrentProtectedReverseCompanions": {p: goals[p] for p in PROTECTED},
        "wholeCurrentGlobalRoute": goals[GLOBAL_ROUTE],
        "actualSourceMaterialRead": primary_files,
        "supplementalLiveOfficialCorroboration": {"urls": [SOURCES[p]["url"] for p in ["BY12GA", "BY11", "BY9CH", "BW"]], "method": "official pages read through web browsing; no new retained HTTP payload or live hash chain claimed"},
        "scopeLimit": "Substantive adjudication of nine source/operator structures and four mergers on BY/BW/NI primary material; 29 unchanged national input pairs and 1646 current direct obligations are exact reuse boundaries, not an exhaustive new scientific mapping approval.", **no_completion,
    })
    emit("source-structure-findings.json", {
        "schemaVersion": 1, "artifactKind": "independent_source_operator_and_structure_review", "status": "ai_candidate_review_findings_with_required_author_revisions", "reviewedAt": now,
        "reviewer": "/root/duration_report_fix", "reviewRound": "A", "independentOfV3Author": True, "fullyBlindToHistoricalFindings": False,
        "inputSnapshotPath": str((OUT / "input-bindings.snapshot.json").relative_to(ROOT)), "currentCurricularAtomicCount": 376,
        "decisionMeaning": "KEEP preserves only the named text/boundary on the scoped primary evidence. It is not native D resolution, mapping approval, adoption, P/A/M/V completion, M7 closure or human approval.",
        "familyCount": 9, "stageMergeCount": 4, "families": FINDINGS, "stageMergeDecisions": MERGES,
        "allCandidateIdsRemainUnassigned": True,
        "candidateWholeBundleStatus": "not_ready_for_adoption; bounded source/description revisions then independent round B and synthesis",
        "nextActions": [
            "Author revises only A-M1/A-M2 wording and source-specific evidence contracts; split A-M3/A-M4 into the stated independent products without assigning active IDs yet.",
            "Remove unconditional extra generic model routine from upper investigation; keep actual experimental and permitted model source paths truthful.",
            "Repair career-choice/professional-context omissions and prepare real presentation/SekII view-page routing; do not claim coverage from prose alone.",
            "Synthesize independent A/B decisions, create an additive revised candidate on fresh current 376 inputs, and only then prepare native final review/evidence configs.",
            "After target IDs/text/source/page/context are final, complete two independent description reviews, true positive-understanding-evidence-v2, semantic atomicity, Memory decisions/cards/visibility where required, and actual current image review.",
        ],
        "unchangedEvidenceReuseRules": [
            "Preserve historical artifacts byte-exact; source equality is a reuse boundary, never a new substantive review.",
            "Unchanged valid goals need no historical review restart. Target only changed IDs, semantics, prerequisites, views/pages, source clauses and actual image bindings.",
            "Retain seven split original IDs as AND-family aggregators if a split is adopted; 1df/1f identity retention remains a final current native decision.",
            "Do not lower protected mathematics/physics machine M7 or chemistry/biology quality floors; current registry unchanged.",
            "Keep all existing partial/unresolved source obligations and course bounds unless an actual targeted semantic review supports a new mapping.",
        ], **no_completion,
    })
    after = [binding(path) for path in guarded_paths]
    assert before == after, "An active or preserved input changed while this review was recorded"
    emit("current-binding-verification.actual.json", {
        "schemaVersion": 1, "artifactKind": "actual_focused_binding_verification_for_independent_review", "status": "passed_focused_binding_checks_only", "checkedAt": now,
        "currentCanonical": binding(ROOT / CANON), "currentWholeGoals": 474, "currentCurricularAtomicGoals": 376,
        "v3FreezeFileCount": len(frozen), "v3FreezeAllFilesExact": True,
        "sourceInputPairCount": len(source_checks), "sourceInputPairsAllExact": True, "sourceInputChecks": source_checks,
        "directWholeMappingSourceGoalPassageBindingsChecked": checked_bindings, "allDirectWholeBindingsExact": True,
        "originalNineWholeGoalsExact": True, "originalNineWholeParentsExact": True,
        "protectedThreeReverseCompanionsWholeGoalsExact": True,
        "currentReverseCountsByFamily": {f["goalId"]: len(f["wholeCurrentReverseRequires"]) for f in families},
        "changedReverseContextAgainstV3": reverse_deltas,
        "niDiscourseSourceClauseCount": len(ni_discourse), "niDiscourseEAOnlyClauseIds": sorted(ea_expected),
        "presentationCompanionPublished": False, "publishedB3C9And1F354CurrentBreadcrumbs": {p: pages[p]["breadcrumbs"] for p in ["b3c9c4b8-5575-5200-86cf-26c14ebcc3d8", "1f354a60-be44-512b-8f8b-f67c8c456035"]},
        "guardedInputFileCount": len(before), "guardedInputBeforeAndAfterExact": True, "guardedInputs": before,
        "scientificMappingApproval": False, "nativeDescriptionReviewRun": False, "fullBuildRun": False, **no_completion,
    })
    own_paths = sorted(p for p in OUT.iterdir() if p.is_file())
    emit("independent-source-structure-a.final.freeze.json", {
        "schemaVersion": 1, "artifactKind": "independent_source_structure_round_a_freeze", "status": "ai_candidate_review_findings_frozen", "frozenAt": now,
        "reviewer": "/root/duration_report_fix", "independentOfV3Author": True, "fullyBlindToHistoricalFindings": False,
        "files": [binding(path) for path in own_paths], "fileCount": len(own_paths),
        "familyDecisions": dict(Counter(row["v3ProposalDecision"] for row in FINDINGS)),
        "stageMergeBoundaryDecisions": dict(Counter(row["boundaryDecision"] for row in MERGES)),
        "authorRevisionsRequired": True, "readyForNativePreparation": False, **no_completion,
    })
    print(json.dumps({"newReviewDirectory": str(OUT.relative_to(ROOT)), "familyCount": 9, "stageMergeCount": 4, "currentCurricularAtomicGoals": 376, "v3FilesExact": 100, "sourceInputPairsExact": 29, "directBindingsExact": 1646, "guardedInputsUnchanged": True, "freezeSha256": sha(OUT / "independent-source-structure-a.final.freeze.json"), **no_completion}, ensure_ascii=False))


if __name__ == "__main__":
    main()
