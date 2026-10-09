"""Materialise this reviewer's written scientific findings, not an automatic verdict."""

# SPDX-License-Identifier: Apache-2.0
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).parent
AUTHOR = ROOT.parent / "chemie-b008-current-nineteen-whole-positive-author-v1"
REPO = Path.cwd()


def bound(path):
    raw = path.read_bytes()
    return {"path": str(path.relative_to(REPO)) if path.is_absolute() else str(path),
            "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def write_new(name, value):
    path = ROOT / name
    assert not path.exists(), "Never overwrite this reviewer's first scientific decision."
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n")
    return path


first_input = ROOT / "nineteen-whole-neutral-input.first.freeze.json"
input_freeze = json.loads(first_input.read_text())
for item in input_freeze["files"]:
    actual = bound(Path(item["path"]))
    assert actual["bytes"] == item["bytes"]
    assert actual["sha256"] == item["sha256"].removeprefix("sha256:")

facets = json.loads((AUTHOR / "nineteen-whole-facet-case-source-context.author-receipt.json").read_text())["entries"]
candidates = json.loads((AUTHOR / "nineteen.normal-positive-candidate-set.author-candidate.json").read_text())["goals"]
transfers = json.loads((AUTHOR / "thirty-eight-whole-case-worked-transfer.supplement.author-candidate.json").read_text())["entries"]

# These are this independent reviewer's conclusions after reading actual DE/EN
# goal, profile, original task/answer/rubric/transfer and new worked-response bodies.
# Source-wide, native-page, A/M and human approvals are deliberately separate.
reasons = [
    "Eigene Frage/Hypothese wird operationalisiert: Temperatur-/Körnungsversuch unterscheidet Auflösezeit von maximaler Löslichkeit; Apfelvergleich benötigt kontrollierte Oberfläche, Temperatur und Sauerstoffzugang. Der neue Fall prüft einen veränderten Störfaktor. Vorgegebene Muster werden nicht zur eigenen Formulierung erklärt.",
    "Theoriegestützte Hypothese ist tatsächlich eine andere Leistung als bloße Alltagsvermutung. Schwache Säure: Verdünnung erhöht den ionisierten Anteil, senkt aber [H+]; die Näherung ergibt +0,5 pH statt +1 beim Vergleichsmodell. Q/K-Richtung und konstantes K bei fester Temperatur sind richtig; Katalyse oder Stoffentzug erzeugen keinen erfundenen vollständigen Umsatz.",
    "Die angeleitete eigene qualitative/quantitative Durchführung, Temperatur-/Bereichsdokumentation, Blank und Spülung sind ausdrücklich gefordert; der Zuckerfall verwechselt Auflösezeit nicht mit Sättigung. Das quantitativ bereitgestellte Leitfähigkeitsmaterial weist jedoch den Standard dem 0–2000-Bereich zu, obwohl dessen zulässiges oberes Ende 2010 ist. Dafür ist ROOT19-001 offen.",
    "Eigenständige einfache Planung plus echte qualitative UND quantitative Daten sind verpflichtend; vorgegebene Hypothese bleibt zulässig. Massen je 100 mL werden korrekt in g/L überführt; Temperatur und Matrix bleiben kontrolliert. Beim Löslichkeitsfall ist ein sichtbarer Rest erst nach ausreichender Einstellung aussagekräftig. Das 1990±20-Prüfstandardintervall verlangt einen passenden tatsächlich dokumentierten Gerätebereich; hier steht zusätzlich der höhere Bereich ohne exklusive Zuordnung zur Verfügung.",
    "Die weitgehend selbstständige Oberstufenuntersuchung fordert eigene qualitative UND quantitative Produkte. Säuremenge/Verdünnung, pH-geeigneter Endpunkt und Geräte-/Standardprüfung sind sachlich begründet. Gemeinsamer 0,009/0,010-Standardfehler ergibt 11,1 % hohe Absolutwerte und nur unter gleichen Bedingungen unverändertes Verhältnis. Brilliant-Blue-Modell ist deutlich als synthetische Kalibrierreferenz begrenzt; A=0,810 wird nicht extrapolierend berichtet.",
    "Eigene digitale Datei, Formeln, Rohdaten, Regression und Residuen sind erforderlich. Offsetkorrektur und Faktor 2 ergeben 7 mg/L; A=0,650 bleibt außerhalb der 0–6-Kalibrierung. Logarithmierung benutzt c/c0 und ist dimensionslos. Der unabhängige neue Fit ergibt -0,046935 min−1 und das Residuum +0,214861; Modellpassung ist keine eindeutige Reaktionsmechanik oder bewiesene Falsifikation.",
    "Selektivität, Blank/Positivkontrolle, Verfahrensbedingungen und Quelle werden an konkreten Daten beurteilt. Y-Ausschluss schließt unbekannte Interferenzen nicht aus; ein beliebiges Gerät wird nicht als X-spezifisch ausgegeben. A35=2298 und B35=2300 unterscheiden sich nur um 2 bei vorgegebener ±3-Wiederholstreuung; das ist keine Gesamtunsicherheit. Saccharose verändert gegebenenfalls Matrix/Ionenbeweglichkeit, ohne zusätzliche dissoziierte Ionen zu liefern.",
    "Reflexion verlangt ein tatsächliches eigenes Roh-/Handlungsprotokoll und einen daran gebundenen Hypothesenbezug. Eigene angeleitete Ausführung bleibt zulässig, ohne eigene Planung vorzutäuschen. Die Folgeplanung greift tatsächlich protokollierte Drift, Endpunktunsicherheit oder Verschleppung auf; keine neue Durchführung wird behauptet. Eine Vorgabe für eigene Ausgangsfrage ist nicht als universelle selbstständige Frageentwicklung zu lesen.",
    "Alle fünf Gültigkeitskriterien werden konkret angewandt. Ein zuverlässiger Faktor-2-Gegenbefund unter passenden Bedingungen widerspricht der universellen Aussage; fehlende Kalibrierung lässt Verlässlichkeit offen. Nichtgleichgewicht und Daten bei anderer Temperatur widerlegen keinen eingeschränkten Gleichgewichtssatz. Neue K(T)-Richtung wird ohne thermodynamische Daten nicht erfunden.",
    "Die Auswahl/Strukturierung vorgegebener Reinigungstexte und Verpackungsdaten ist chemisch korrekt, adressatengerecht und mit Quellen belegt. 200/40=5 und 200/20=10 sowie 200/N g je Nutzung sind richtig; Masse oder Restfläche sind keine vollständige Umwelt-/Sicherheitsbilanz. Für den ausdrücklich erhaltenen C9-NTG-Kontext fehlen aber tatsächliche selbst recherchierte Quellen in Aufgabe, Profil und neuem Transfer: ROOT19-002.",
    "Analoge UND digitale Eigenrecherche, eigener Suchweg, tatsächlich gelesene Zusatzquelle und Zitatkennzeichnung sind explizit erforderlich. Das reale bereitgestellte fiktive Archiv enthält die sechs genannten Materialien mit gleichen Autoren-/Modellgrenzen. S=1,1/2/11 gilt nur ohne weitere Salzphase; eine neue Salzphase benötigt zusätzliche Gleichgewichts-/Aktivitätsdaten. Bilanz pro akzeptiertem Produkt trennt Frischzufuhr von Rückführung; der neue B-Fall ergibt 2 kg/kg und 3,15 kWh/kg, nicht ein klinisches oder gesamtes Umwelturteil.",
    "Quellenkritik prüft Aussage, Relevanz, Methode, Urheberschaft und Intention; gelieferte komplexe Quellen bleiben hier zulässig. 75 % Absorbanzabnahme ist kein uneingeschränkter Stoffentfernungs-/Trinkbarkeitsnachweis. 1,1→11 bedeutet zehnfachen Endwert bzw. +900 %, ohne Wirksamkeitsnachweis. Unabhängige Daten oder Finanzierung ändern nur entsprechend belegte Urteile; angekündigte neue Daten werden nicht zu tatsächlich vorhandenen Prüfergebnissen.",
    "Chemische Anwendung und gesellschaftliche Folgen werden mit Trennung/Flockung, Korrosionsschutz, Barrieren oder Energieumwandlung verbunden. Mensch, Umwelt und Gesellschaft sind mit Bedingungen und Reststoff-/Ressourcenfragen verknüpft. Biologischer Abbau verlangt konkret benannte Bedingungen; Fragmentierung ist keine vollständige Mineralisierung. Unterschiedliche gewünschte Permeabilität wird begründet, ohne Produkttest oder generelle Kunststoffrangfolge zu behaupten.",
    "Alle fünf Kriterien werden abgeleitet und Chancen/Risiken sowie mehrere Handlungsoptionen beurteilt. Sicherheit/Zugang als begründete Mindestbedingungen und transparente Gewichtung verhindern Addition inkommensurabler Größen. Zwei statt zehn Nutzungen ändern den Materialbefund; Kostenübernahme ändert Verteilung und nicht chemische Mengen. Informationsausstellung bleibt von individueller Medikamentenwahl getrennt; Finanzierung ist kein automatischer Falschheitsbeweis.",
    "Historische UND aktuelle Kontexte sowie Produkte, Methoden, Verfahren und Wissen sind als ganze Wirkungskette erhalten. Bereits tatsächlich gelesene BASF-/UNEP-Grundlagen werden nicht zu historischen Messdaten umetikettiert. Ökologische, ökonomische und soziale Modellperspektiven bleiben getrennt; gleicher Wissenszugang ändert keine Ressourcenwerte. Höhere Leckage verlangt Menge und Wirkungsfaktor, nicht eine erfundene Rangfolge. Eigenes Handeln wird realistisch und ohne technische Eingriffe reflektiert.",
    "Schlüssige Erklärung, Datenargumentation, echter konstruktiver Austausch und eigene Standpunktprüfung bleiben beobachtbare Leistungen. Früher C-Wert belegt keine Änderung von K; gleiche Langzeitmenge benötigt passende Bilanzen und Anfangsbedingungen. Katalyse betrifft beide Richtungen. Die neue kontrollierte 1800/2100-Karte kann eine frühere Temperaturerklärung ändern, ersetzt aber keine echte Partnerantwort oder exakte Konzentrationskalibrierung.",
    "Die ganze verpflichtende Modellkontextunion bleibt erhalten: Atom/Periodizität, Gleichgewicht, Bindung/Geometrie, komplexes Amid-/Phenylgerüst, Rezeptor sowie Enzym. CO2/H2O ersetzen das komplexe organische Gerüst nicht. Analoge räumliche Produkte UND eigene digitale Gleichgewichts-/Belegungstabellen sind erforderlich. x=0,20 und 4−sqrt(13)≈0,394449 sind gültig; die andere Wurzel verletzt B≥0. θ=0/0,5/0,75 zeigt Belegung, nicht Aktivierung. Esterhydrolyse benötigt Wasser als Edukt und verbraucht das Enzym nicht stöchiometrisch; eine zusätzliche Gruppe behebt einen falschen Kontaktabstand nicht automatisch.",
    "Tatsächliches Überführen erzeugt ein eigenes Schema oder digitales Produkt. NaCl-Gitter enthält schon Ionen; s/aq, gleicher Na+/Cl−-Anteil und Ladungsbilanz bleiben richtig, H2 wird nicht erfunden. Öffentliche Betriebsdaten brauchen getrennte kg/kg- und kWh/kg-Skalen statt Ökoscore. Die neue Fachzielgruppe ändert Detaillierung/Systemgrenze, ohne Zahlen oder unbekannte Ströme zu erfinden.",
    "Chemischer Sachverhalt UND eigene Lern-/Arbeitsresultate, analoge UND digitale Medien sowie tatsächlicher Vortrag werden gefordert. Gelieferte Modellregeln/Rohdaten sind keine Eigenforschung; eine fertige Folie ist kein gehaltener Vortrag. Zielgruppentransfer erhält Bilanz-/Belegungsgrenzen; Kd wird im einfachen Modell als Konzentration halber Belegung erklärt, ohne medizinische Wirkung abzuleiten. Echte Frageantwort und Produkte/Ablauf müssen später tatsächlich vorliegen, werden hier nicht behauptet.",
]
assert len(reasons) == len(facets) == len(candidates) == 19

findings = [
    {"id": "ROOT19-001", "status": "open", "severity": "material-boundary", "goalId": facets[2]["goalId"],
     "caseKeys": ["lower-guided-hypothesis-investigation-conductivity"],
     "actualEvidence": "DE/EN suppliedMaterial assigns 0–2000 µS/cm to blank/standard; nominal standard 1990±20 µS/cm at 25 °C permits [1970,2010]. The whole admissible standard interval does not fit the assigned range.",
     "requiredRemedy": "Provide an operative bilingual protocol with a genuinely adequate standard-check range, preserving standard value/temperature and actual range/resolution/compensation recording. Do not silently lower the standard bound, claim device accuracy from display resolution, or rehash unchanged text as review.",
     "otherAffectedContextToCheck": "The independently planned ion-series case uses the same standard and a higher range; preserve an explicit usable check rather than imposing an exclusive deficient low range."},
    {"id": "ROOT19-002", "status": "open", "severity": "whole-source-performance-coverage", "goalId": facets[9]["goalId"],
     "caseKeys": ["sek1-source-information-cleaning-advice", "sek1-source-information-packaging-table"],
     "actualEvidence": "Both complete original cases and both new responses only select supplied S1–S4 or T1–T4. The preserved source contract explicitly demands independently researched, audience-aware work for C9-NTG; the actual official BY9-NTG LB1 says given AND independently researched sources.",
     "requiredRemedy": "Add a genuine assessable own-research variant and operative profile condition for the source context that requires it: actual retrieval/selection/read locations, source attribution, interpretation and audience adaptation. Preserve given-source entry routes for C8/C9 non-NTG; do not add universal complex pharmaceutical research or pretend that reading supplied cards already proves independent research."},
]
verdicts = []
for index, (facet, candidate, reason) in enumerate(zip(facets, candidates, reasons)):
    issues = [x["id"] for x in findings if x["goalId"] == facet["goalId"]]
    verdicts.append({"index": index, "candidateKey": facet["candidateKey"], "goalId": facet["goalId"],
        "wholeGoal": facet["wholeGoal"], "wholeHistoricalProfile": facet["wholeHistoricalProfile"],
        "wholeOriginalCases": facet["wholeHistoricalCases"],
        "wholeNewWorkedTransferCaseKeys": [x["caseKey"] for x in transfers if x["goalId"] == facet["goalId"]],
        "currentProfileRequiredExpectations": candidate["profile"]["coverageExpectations"],
        "allCurrentDeEnGoalProfileAndCaseScienceActuallyRead": True,
        "scientificReasonDe": reason,
        "materialVerdict": "HOLD_TARGETED_REMEDY" if issues else "ACCEPT_CANDIDATE_MATERIAL_ONLY",
        "openFindings": issues,
        "unchangedHistoricalProfileNotReapproved": True,
        "nativeApproval": False, "wholeSourceApproval": False, "atomicityGateApproval": False,
        "memoryGateApproval": False, "humanApproval": False, "humanTrial": False})

dossier = ROOT.parent.parent / "2026-10-06/chemie-b008-twenty-six-positive-materials-author-v8/research-dossier"
primary = ROOT.parent.parent / "2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/primary-inputs/by9-ntg.actual-main.txt"
outputs = [ROOT / "independent-bound-finite-calculations.actual.json",
           ROOT / "whole-original-context-description-case-status.exact-check.actual.json"]
report = {
    "schemaVersion": 1, "reviewRole": "Independent B scientific material review of19; a separate agent authored these19",
    "reviewedAt": datetime.now(timezone.utc).isoformat(),
    "inputFirstFreeze": bound(first_input), "initial22FileBindingsReverifiedExact": True,
    "priorA19PeerVerdictRead": False, "priorA19RemedyRead": False,
    "wholeGoalCount": 19, "wholeOriginalCaseCount": 38, "wholeNewWorkedTransferCount": 38,
    "actualReadMethod": "Dereference each complete original goal/case pointer and read both language bodies. Read whole current profile, task, expected answer, rubric, transfer and fresh worked response. Case-brief duplicated task/answer strings were byte-compared, not treated as another scientific performance. Cropped initial output for indices0–3 was completed by exact-field follow-up reads before this seal.",
    "originalContextDescriptionCaseStatusCheck": bound(outputs[1]),
    "independentFiniteCalculationReceipt": bound(outputs[0]),
    "additionalActuallyReadInputs": [bound(dossier / name) for name in (
        "analog-a-acid-model.md", "digital-b-solubility.tsv", "digital-c-advertisement.md",
        "analog-d-process-model.md", "digital-e-process.tsv", "digital-f-policy.md")] + [bound(primary)],
    "scienceVerdicts": verdicts, "findings": findings,
    "acceptedCandidateMaterialCount": sum(not x["openFindings"] for x in verdicts),
    "targetedHoldCount": sum(bool(x["openFindings"]) for x in verdicts),
    "scope": "Scientific material/component decisions only. This does not approve the newly rendered native19 pages, the Source19/compiler/program views, the8 changed protected content contexts, source-wide applicability or normal D/P/A/M/V evidence. Unchanged valid Source12/V26 decisions remain separately bounded and are not restarted here.",
    "status": "needs_human_review", "reviewAuthority": "ai_candidate", "evidenceLevel": "E1",
    "maximumClaimScope": "G1", "reviewRunIds": [], "reportOnlyReviewerDiversity": True,
    "nativeApproved": False, "wholeSource19Approved": False, "machineM7Achieved": False,
    "learnerPerformanceRecorded": False, "humanApproval": False, "humanTrial": False,
    "strictNewScientificClosures": 0, "restoredBindings": 0, "strictGain": 0,
}
result = write_new("nineteen-whole-science-source-scope-P.first.independent-B.verdict.json", report)
freeze = write_new("nineteen-science.first.independent-B.freeze.json", {
    "schemaVersion": 1, "frozenAt": datetime.now(timezone.utc).isoformat(),
    "files": [bound(result)] + [bound(path) for path in outputs],
    "firstIndependentDecisionBeforePeerRead": True, "acceptedCandidateMaterialCount": 17,
    "targetedHoldCount": 2, "openFindings": [x["id"] for x in findings],
    "nativeApproved": False, "wholeSource19Approved": False, "strictGain": 0,
    "humanApproval": False, "humanTrial": False,
})
print(json.dumps({"verdict": bound(result), "firstFreeze": bound(freeze),
                  "acceptedCandidateMaterialCount": 17, "targetedHoldCount": 2,
                  "strictGain": 0}, ensure_ascii=False))
