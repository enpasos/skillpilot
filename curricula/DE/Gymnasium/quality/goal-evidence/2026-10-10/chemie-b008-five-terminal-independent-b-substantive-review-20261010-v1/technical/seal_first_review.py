"""Seal root's substantive first review of five complete assessment drafts."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10"
OWN = Path(__file__).resolve().parents[1]
AUTHOR = BASE / "chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1"


def bind(path):
    path = Path(path)
    if not path.is_absolute():
        path = ROOT / path
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def write_once(path, value):
    with path.open("x") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


entry = json.loads((AUTHOR / "author-successor.final.entry.json").read_text())
landscape_path = AUTHOR / "candidate/whole517.inactive.terminal-assessment-author.json"
landscape = json.loads(landscape_path.read_text())
goals = {goal["id"]: goal for goal in landscape["goals"]}
source_path = AUTHOR / "inputs/nine-frozen-source-scope-extracts.exact.json"
sources = json.loads(source_path.read_text())
notes = {
    "2f53dea4-1ea9-59ad-bd2d-0492107627ee": {
        "actualReviewDe": "Eigene untersuchbare Frage, begründete Methodenwahl, tatsächliche sichere Untersuchung und individuelles Rohprotokoll sind verlangt. Leitfähigkeit ist ein begrenzter Indikator beweglicher Ionen und kein Teilchenbild oder Stoffidentifikator. Konstante Temperatur/Volumen, Vergleichsprobe, Wiederholungen und Spülen kontrollieren konkrete Störungen. Der Erwartungshorizont gibt ein zulässiges Beispiel, keine verpflichtende fremde Messreihe. Eigene tatsächliche adressatengerechte Präsentation mit analogen UND digitalen Medien und zwei inhaltlichen Rückfragen erfüllt 38e3; Reflexion eigener Ergebnisse und eigener Methoden einschließlich Verbesserung erfüllt 99d4. 6+8+10+12+4=40 BE; 24 erst bei vollständiger Leistung. Keine tatsächliche Lernendenleistung behauptet.",
        "scienceDecision": "KEEP_CANDIDATE",
        "sourceScopeDe": "Lokale eigene Sek-I-Aufgabe; keine neue landesweite Platzierung aus C12/13-Teilquellen. Globale source-reviewed Pflichten werden fachlich getragen, ihre Kursgrenzen nicht neu freigegeben.",
        "openGates": ["current native/context reproduction", "operational essential-performance evidence verification", "independent machine assessment readiness"],
    },
    "ab315f52-a9e3-5c1c-a404-7fb1a96a3eaf": {
        "actualReviewDe": "Die Person formuliert Frage/Hypothese vor der Arbeit selbst, leitet erwartbaren und möglichen Gegenbefund ab und wählt qualitative UND quantitative Methoden. Tatsächliche weitgehend selbstständige sichere Durchführung, eigene Rohbeobachtungen/-messungen und reproduzierbare mathematische/digitale Auswertung sind unverzichtbar. pH ist keine allgemeine Gesamtsäurekonzentration, Endpunkt nicht pauschal pH7. Stoffmengenerhaltung und einbasige Neutralisation sind sauber begrenzt; konstruierte Verbrauchsmittel 10,000/5,003/2,507 mL führen bei 10,00 mL und 0,1000 mol/L zu 0,1000/0,05003/0,02507 mol/L. Vorverdünnung ist ausdrücklich getrennt. Chemischer und mathematischer Bezug plus Hypothesenurteil und Reflexion tragen alle vier vollständigen Pflichten 503d/f79f/9e3f/99d4. 10+12+12+16+10=60 BE,36 nur nach Pflichtleistungen. Keine Durchführung aus Beispieldaten.",
        "scienceDecision": "KEEP_CANDIDATE",
        "sourceScopeDe": "Lokale Q3-Analyseaufgabe, kein neues bundesweites Phasenangebot. C12/13-Teiloperatoren und C11-partnerseitige unspecified-HOLDs bleiben getrennt. Die sourcealternative modellbasiert ist nicht fälschlich aus dem Primäroperator entfernt.",
        "openGates": ["current native/context reproduction", "operational essential-performance evidence verification", "independent machine assessment readiness"],
    },
    "7bfe515c-e59f-521c-9781-b75e33caf0ec": {
        "actualReviewDe": "Vollständige Modellpflicht wird nicht auf Wasser reduziert: vier Werkstätten tragen Atombau/Periodizität, dynamisches Gleichgewicht, Bindung/Geometrie und komplexe Rezeptor- UND Enzymwechselwirkungen. Na/Mg/Cl-Trend ist im vorgegebenen Vergleich korrekt; Schalen sind keine festen Bahnen. Exotherme Ammoniaksynthese, Druckeinfluss und Katalysator ohne Gleichgewichtslagenänderung sind richtig; gleichbleibende makroskopische Menge ist nicht Teilchenstillstand. CO₂/H₂O/NH₃/CH₄-Geometrien und resultierende Dipole sind korrekt. θ=2/(2+2)=0,5 und 2/(20+2)≈0,091; reversible kompetitive Hemmung wird mit scheinbarem K_M bei gleichem v_max begrenzt. Eigene analoge UND digitale Produkte, prüfbare Regeln/Vorhersagen, Grenzen/Weiterentwicklung und tatsächliche eigene Präsentation tragen 86d3 und38e3. 12+14+14+20+20=80 BE,48 nur bei vollständigem Portfolio. Kein Modell ist tatsächliche Arzneiwirksamkeit.",
        "scienceDecision": "KEEP_CANDIDATE",
        "sourceScopeDe": "Phasenübergreifender Prozesszweig ist didaktisch zulässig; keine erfundene nationale Themenphase. C11-Komplexmolekülpartner bleibt ohne Kursauflösung; reine C12/13-Teilquellen erhalten keine vollständige C11-Freigabe.",
        "openGates": ["current native/context reproduction", "operational essential-performance evidence verification", "independent machine assessment readiness"],
    },
    "b406eff8-3cd9-551b-a913-c6dda7223645": {
        "actualReviewDe": "Alle fünf Gültigkeitskriterien werden am tatsächlichen Material konkret bewertet: frühe5min-Werte zeigen Geschwindigkeit, keine Gleichgewichtslage; reproduzierte gleiche60/90min-Endwerte bei kontrollierten Bedingungen sind belastbarer Gegenbefund, defekter Sensor/fehlendes Temperaturlog kein solcher. Umfrage ist kein chemischer Beweis. Historische UND heutige Wirkungen, Herstellung UND Nutzung, ökologische/ökonomische/soziale Interessen und hypothetisches eigenes Handeln sind tatsächlich verlangt. Szenarioindizes sind gleicher Bezugsgröße/Systemgrenze zugeordnet und kein reales LCA-Ranking. Beide externen Primärseiten wurden unabhängig live gelesen: BASF bestätigt1908/1913/Oppau als Unternehmensperspektive; IEA2021 stützt Herstellung/Nutzung/Effizienzpfade und wird nicht als aktuelle2026-Zahl ausgegeben. 20+10+15+5=50 BE,30 nur wenn Pflichtdimensionen vorhanden. e5a5-C11 ist ausdrücklich nicht durch Q4 ersetzt.",
        "scienceDecision": "KEEP_CANDIDATE",
        "sourceScopeDe": "DE-BY, bounded C12/13-Pflichten a008/9f89. Q4 lokal authored; keine neue C11-, nationale oder Humanfreigabe.",
        "openGates": ["current native/context reproduction", "operational essential-performance evidence verification", "independent machine assessment readiness"],
    },
    "eed5eda3-2daf-5d48-b935-23dadd622d9b": {
        "actualReviewDe": "Die ganze fachliche Aufgabe trägt alle sechs kanonischen Einflussdimensionen und empirische Gültigkeit vs Zustimmung. Historisch belegte Unternehmensparaphrase ist von erfundenem modernen Forschungsszenario und unbelegten Motiven getrennt; tatsächlich gegebene Auswahlwerte legen kein Messergebnis fest. Die nächste Forschungsfrage und Vorkehrung gegen Wunschentscheidungen sind konkrete Leistungen. 8+18+10+4=40 BE,24 erst mit allen Pflichtdimensionen. Historisch/empirisch sind zulässige aktuelle didaktische Operationalisierung, kein zusätzliches wortgetreues C11-Zitat. Fachlich KEEP_CANDIDATE, aber Kursplatzierung bleibt HOLD; weder schöne Aufgabe noch Terminalgraph-PASS lösen diesen Nachweis.",
        "scienceDecision": "KEEP_CANDIDATE_COURSE_HOLD",
        "sourceScopeDe": "Nur C11.1.11; offizieller Partner courseLevel unspecified, explicitScopeKeys=[], P unselected. J11 und technische Tags sind kein GK/LK-Nachweis. Kein C12/Q4-Proxy. Platzierung benötigt gesonderte echte amtliche Prüfung.",
        "openGates": ["official C11 course/applicability placement", "current native/context reproduction", "independent machine assessment readiness"],
    },
}

kind_reasons = {
    "442c31c5-c561-5c7a-90bb-2335d779175c": ("programStructure", "Fachweite Einstiegswurzel und strukturelle Navigation; neue contains-Kante schafft keine eigene assessable Kompetenz."),
    "8ee41a31-2b8e-5dd5-9496-86aab61cdf27": ("practiceAssessment", "Q3-Übungs-/Prüfungsbündel; neues echtes Untersuchungs-Exam ergänzt den Prüfzweig, keine curricularAtomic-Umetikettierung."),
    "b5f0201a-bc5b-5159-a36c-0925f198c32f": ("practiceAssessment", "Q4-Übungs-/Prüfungsbündel mit neuer materialgestützter Bewertung; kein normales Inhaltsatom."),
    "5964272f-e835-5a24-b2b1-c162be6b75cb": ("practiceAssessment", "Phasenübergreifender Autonomieanker mit Examenskindern; kein Sammel-Mastery-Ziel für ungeprüfte source HOLDs."),
    "5b1bb5d9-07b1-5ba9-b320-cc97be917c60": ("curricularAtomic", "Assessable zusammenhängende Quellenerschließung; geänderte Sek-I-Voraussetzung verändert Route, nicht Kompetenzart."),
    "6c7ce93c-7675-51da-bc0c-7d0257f7ff7d": ("curricularAtomic", "Assessable hypothesengeleitete Modellnutzung/-kritik; neuer didaktischer Vorgänger ersetzt keinen Inhalt und macht das Ziel nicht zur Orientierung."),
    "75e2eff1-f871-5461-9e3f-26d0b333ce2f": ("curricularAtomic", "Eigene untersuchbare Frage/Hypothese mit erwartbarem Gegenbefund, zusammenhängend prüfbar; neue gemeinsame Motivation ist nur Voraussetzung."),
    "9fc800d1-92d1-5ef6-81c1-33960ae034dd": ("curricularAtomic", "Strukturierte eigene Dokumentation mit Einheiten/Herkunft/Bedingungen und Beobachtung-vs-Deutung; Routenänderung schafft weder Prüfungs- noch Memorykategorie."),
    "b86d12c6-8b84-53c6-b1f9-26ba7728b411": ("practiceAssessment", "Eigenständiges lokales Sek-I-Untersuchungsprüfungsbündel; enthält ausschließlich ein Exam und ist kein neues Inhaltsatom."),
}
for gid in entry["newAssessmentIds"]:
    kind_reasons[gid] = ("practiceAssessment", "Vollständig gelesene ganze Modulprüfung mit tatsächlichen Aufgaben, Lösungen und Bewertungsraster; examData und nodeKind exam. Kein curricularAtomic-Ziel; C11-HOLD bleibt unabhängig.")

bindings = []
for reference in entry["entry"]:
    actual = bind(reference["path"])
    assert actual["sha256"].removeprefix("sha256:") == reference["sha256"] and actual["bytes"] == reference["bytes"]
    bindings.append(actual)
bindings += [bind(AUTHOR / "author-successor.final.entry.json"), bind(AUTHOR / "author-successor.final.freeze.json")]
records = []
for gid, note in notes.items():
    goal = goals[gid]
    assert sum(step["points"] for step in goal["examData"]["scoring"]["steps"]) == goal["examData"]["scoring"]["maxPoints"]
    records.append({"goalId": gid, "wholeGoalDigest": "sha256:" + hashlib.sha256(json.dumps(goal, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()).hexdigest(), "fullGoalDEENAndWholeTaskSolutionRubricActuallyRead": True, "coveredGoalIds": goal["examData"]["coveredGoalIds"], **note})

output = OWN / "FIRST.five-whole-assessments-and-fourteen-kinds.actual-independent-b.json"
write_once(output, {
    "schemaVersion": 1,
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "role": "Independent substantive B review of genuine terminal AUTHOR candidate; not current native D/P activation",
    "reviewer": "Codex /root; neither author of new exams/cluster nor author of four prerequisite changes",
    "peerCurrentScientificVerdictsReadBeforeThisFirst": False,
    "knownAuthorMetadataDe": "Autorenstatus, vollständige Kandidaten und normaler Routencheck bekannt. Die fachliche Prüfung liest ganze Aufgaben/Lösungen/Quellenoperatoren und leitet keine fachliche Freigabe aus deren Hashes oder Autorenzusammenfassung ab.",
    "wholeTasksSolutionsRubricsRead": 5,
    "wholeNineCurrentProcessDutiesDEENRead": True,
    "wholeFourteenKindsDEENAndGraphFieldsRead": True,
    "sourceScopeReviewDe": "Alle21 zugehörigen ganzen Operatoren der neun Pflichten gelesen; C11-unspecified-Partner ohne explizite Kursschlüssel bleiben HOLD. Bestehende Quellenentscheidungen sind keine neue nationale Vollfreigabe. Grenzen experimentell/modelbasiert und fehlende GA12-Silbe bleiben erhalten.",
    "bindings": bindings,
    "records": records,
    "fourteenKindRecommendations": [{"goalId": gid, "semanticKind": kind, "reasonDe": reason, "status": "independent_recommendation_not_operative_classification"} for gid, (kind, reason) in kind_reasons.items()],
    "externalPrimaryFactsActuallyRead": [
        {"url": "https://www.basf.com/global/en/who-we-are/history/chronology/1902-1924/1913", "accessDate": "2026-10-10", "ownBoundedFinding": "Company chronology supports team led by Bosch working since1908 and plant operation in1913 atOppau; it does not establish all historical motives."},
        {"url": "https://www.iea.org/reports/ammonia-technology-roadmap/executive-summary", "accessDate": "2026-10-10", "reportYear": 2021, "ownBoundedFinding": "Report discusses fertiliser role, production and application emissions, different production pathways, cost tradeoffs and efficient use. It supports the bounded task paraphrase; its dated statistics are not current2026 claims."},
    ],
    "normalCurrentNativeReview": "PENDING",
    "examReadinessPromotion": False,
    "C11CourseHold": "HOLD_UNSPECIFIED_C11",
    "C11PSelected": False,
    "currentStrictDenominator": None,
    "fullM6OrM7Pass": False,
    "actualLearnerExecution": False,
    "humanApproval": False,
    "humanTrial": False,
    "activeWrites": False,
    "historicalWrites": False,
    "strictGain": 0,
})
write_once(OWN / "FIRST.five-assessments-independent-b.freeze.json", {"schemaVersion": 1, "role": "Immutable substantive first-review seal; current native/operational/source holds remain separate", "ownBindings": [bind(output), bind(__file__)], "externalInputBindings": bindings, "hashVerificationIsScientificReview": False, "activeWrites": False, "humanApproval": False, "strictGain": 0})
print(json.dumps({"first": bind(output), "freeze": bind(OWN / "FIRST.five-assessments-independent-b.freeze.json"), "wholeExams": 5, "kindRecommendations": len(kind_reasons), "activeGain": 0}))
