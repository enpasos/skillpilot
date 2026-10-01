"""Independent blind Q1 genetics Round B from the fixed B input only."""

from datetime import datetime, timezone
from hashlib import sha256
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
INPUT = json.loads((HERE / "description-review-input.json").read_text())
CAMPAIGN = json.loads((HERE / "description-review-campaign.json").read_text())
BUNDLE = json.loads((HERE / "review-bundle-manifest.json").read_text())
RUN_ID = "biologie-q1-genetics-twelve-20260930-blind-b-run-001"


def ev(essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en):
    return dict(zip((
        "essentialUnderstandingDe", "essentialUnderstandingEn",
        "observablePerformanceDe", "observablePerformanceEn",
        "transferExpectationDe", "transferExpectationEn",
    ), (essential_de, essential_en, observable_de, observable_en, transfer_de, transfer_en)))


DECISIONS = {
    "0daa79f6": {
        "decision": "split_review",
        "rationale": "Nukleotid-/Doppelhelix-Aufbau und semikonservative DNA-Replikation sind zwei getrennt erwerbbare Leistungen: Eine Person kann die antiparallele Struktur mit Basenpaarung modellieren, ohne die zwei Tochter-DNA-Moleküle aus der Kopie eines alten Strangs zu erklären. Die Q1.1-Seite bündelt beides; ein bloßer Wortaustausch verdeckt die Atomaritätsgrenze. Für dieses Ziel ist im B-Eingang kein aktuelles Bild gebunden, und die rohe Geltung beweist keine externe Quellenabdeckung.",
        "understandingEvidence": ev(
            "Nukleotide aus Zucker, Phosphat und Base bilden zwei komplementäre DNA-Stränge; bei semikonservativer Replikation enthält jede Tochter-DNA einen alten und einen neu gebildeten Strang. Strukturverständnis und Kopiervorgang sind eigenständige Nachweise.",
            "Nucleotides with sugar, phosphate and base form two complementary DNA strands; after semiconservative replication each daughter DNA has one old and one newly made strand. Structure and copying require distinct evidence.",
            "Die lernende Person baut aus gegebenen Bausteinen ein kurzes antiparalleles DNA-Modell mit passender Basenpaarung und erklärt getrennt anhand markierter Ausgangsstränge die beiden Tochter-Moleküle.",
            "The learner constructs a short antiparallel DNA model with correct base pairing from supplied units and separately traces labelled parent strands into two daughter molecules.",
            "Bei einer neuen Ausgangssequenz und einem markierten alten Strang leitet sie den komplementären neuen Strang und die alte/neue Strangverteilung ab statt das bekannte Helixbild zu kopieren.",
            "With a fresh parent sequence and labelled old strand, the learner derives the complementary new strand and old/new distribution rather than copying the shown helix.",
        ),
    },
    "475eebb4": {
        "decision": "split_review",
        "rationale": "Transkription (DNA zu RNA) und Translation (mRNA zu Polypeptid) haben unterschiedliche Moleküle, Regeln und überprüfbare Leistungen. Wer eine mRNA korrekt erstellt, muss noch keine Codons mit tRNA/Ribosom in eine Aminosäurefolge übertragen können. Die gemeinsame Proteinbiosynthese-Kette erklärt den Zusammenhang, ersetzt aber nicht zwei atomare Nachweise. Die Q1.1-Seite und der B-Eingang liefern hier kein Bild.",
        "understandingEvidence": ev(
            "Bei der Transkription entsteht aus einem DNA-Abschnitt RNA; bei der Translation wird die mRNA-Codonfolge am Ribosom mithilfe von tRNA in eine Polypeptidfolge umgesetzt. Die Prozesse teilen einen Informationsfluss, haben aber verschiedene Operationen.",
            "Transcription produces RNA from a DNA segment; translation uses mRNA codons and tRNA at a ribosome to assemble a polypeptide. The processes share information flow but perform different operations.",
            "Die lernende Person erzeugt aus einem vorgegebenen DNA-Strang eine dazu passende mRNA und ermittelt in einer zweiten Aufgabe aus einem neuen mRNA-Abschnitt eine Aminosäurefolge mit bereitgestelltem Codeschlüssel.",
            "The learner generates matching mRNA from a supplied DNA strand and, in a separate task, derives an amino-acid sequence from a new mRNA segment using a supplied code key.",
            "Bei einer geänderten Basenfolge prüft sie getrennt, wie sich mRNA und der gelesene Codonabschnitt ändern können; die eine Leistung wird nicht aus der anderen unterstellt.",
            "For a changed base sequence, the learner checks separately how mRNA and the read codon segment may change; one skill is not inferred from the other.",
        ),
    },
    "ffef97e3": {
        "decision": "revise",
        "rationale": "Die vier Mutationstypen lassen sich in einer Genanalyse gemeinsam erkennen, aber ‚Folgen abschätzen‘ klingt ohne Genkontext nach einem sicheren Phänotyp aus dem Mutationsnamen. Der lokale Zusatz ‚mögliche Folgen im gegebenen Genkontext‘ begrenzt die Schlussfolgerung und bewahrt die atomare Analyse einer Sequenzänderung. Ein aktuelles Bild ist im B-Eingang nicht gebunden.",
        "proposedDescriptionDe": "Die lernende Person kann Substitution, Deletion, Insertion und Duplikation in einem gegebenen Genkontext unterscheiden und mögliche Folgen der Änderung begründet abschätzen.",
        "proposedDescriptionEn": "The learner can distinguish substitution, deletion, insertion and duplication in a given gene context and give a reasoned estimate of possible consequences of the change.",
        "understandingEvidence": ev(
            "Die vier Mutationsarten beschreiben verschiedene Änderungen einer DNA-Sequenz; ihre Wirkung hängt von Position, Leserahmen und Genkontext ab und ist aus dem Typ allein nicht sicher abzulesen.",
            "The four mutation types describe different DNA-sequence changes; their effects depend on position, reading frame and gene context, and the type alone does not determine the outcome.",
            "Die lernende Person vergleicht Ausgangs- und veränderte Sequenz, klassifiziert den Eingriff und begründet anhand bereitgestellter Geninformation eine mögliche molekulare Folge mit Unsicherheitsgrenze.",
            "The learner compares original and changed sequences, classifies the edit and uses supplied gene information to justify a possible molecular consequence with an uncertainty limit.",
            "Bei einer neuen Insertion von drei statt einer Base prüft sie den Leserahmen neu und unterlässt die pauschale Behauptung, jede Insertion erzeuge denselben Proteineffekt.",
            "For a fresh insertion of three rather than one base, the learner reassesses the reading frame instead of claiming every insertion has the same protein effect.",
        ),
    },
    "946ce2e7": {
        "decision": "split_review",
        "rationale": "Die Rolle eines Transkriptionsfaktors an regulatorischer DNA und epigenetische DNA-Methylierung sind unterschiedliche, eigenständig prüfbare Steuermechanismen. Eine Person kann die Bindung/Aktivierung eines Faktors erklären, ohne eine stabile Methylierungsmarke samt möglicher Genaktivitätsänderung zu deuten. Beide gehören zu Q1.2, aber ein einziges Ziel mit ‚und‘ bündelt zwei Leistungen; außerdem wäre ein pauschales An/Aus-Schema für Methylierung fachlich zu grob. Kein aktuelles Bild im B-Eingang.",
        "understandingEvidence": ev(
            "Transkriptionsfaktoren wirken über sequenzspezifische DNA-Bindung auf Transkriptionsbeginn oder -rate; DNA-Methylierung ist eine chemische Markierung, deren Wirkung auf Genaktivität vom Ort und Kontext abhängt. Beide Mechanismen sind zu unterscheiden.",
            "Transcription factors influence transcription initiation or rate by binding particular DNA sequences; DNA methylation is a chemical mark whose effect on gene activity depends on location and context. The mechanisms must be distinguished.",
            "Die lernende Person deutet ein gegebenes Faktor-Bindungsschema und separat eine markierte/unmarkierte DNA-Region mit passenden Expressionsdaten, ohne aus einer einzelnen Markierung einen universellen Effekt zu behaupten.",
            "The learner interprets a supplied factor-binding diagram and separately a methylated/unmethylated DNA region with expression data, without claiming one universal effect of a mark.",
            "Bei einer neuen veränderten Bindungsstelle und einer separat veränderten Methylierung begründet sie je eine mögliche Folge und markiert, welche Daten zur Kausalzuordnung noch fehlen.",
            "For a new altered binding site and a separate methylation change, the learner explains a possible effect for each and identifies missing evidence for a causal claim.",
        ),
    },
    "8f6933b1": {
        "decision": "keep",
        "rationale": "Das LK-Ziel ist eine zusammenhängende Histonmarkierungs-Kompetenz. Methylierung und Acetylierung sind unterscheidbare Beispiele innerhalb desselben Mechanismus der epigenetischen Chromatinregulation; die aktuelle Formulierung behauptet keine pauschale Richtung für jede Methylierung. Das tatsächlich gebundene Comic-PNG zeigt Markierungen an Histonschwänzen und offenes/kompaktes Chromatin nur schematisch; es bleibt V-Kandidat, und Bild-Wiedererkennung genügt nicht.",
        "understandingEvidence": ev(
            "Chemische Markierungen an Histonen können Chromatinzugänglichkeit und Genaktivität verändern; Acetylierung und Methylierung sind nicht gleichbedeutend und die Wirkung einer Methylierung hängt von der markierten Stelle ab.",
            "Chemical marks on histones can alter chromatin accessibility and gene activity; acetylation and methylation are not equivalent, and a methylation effect depends on the marked site.",
            "Die lernende Person deutet einen neuen Datensatz zu einer genau benannten Histonmarkierung, Chromatinzugang und Transkriptionsmessung und grenzt die daraus zulässige Aussage ein.",
            "The learner interprets a fresh data set linking a specified histone mark, chromatin access and transcription measurement, and limits the supported conclusion.",
            "Bei einem anderen markierten Histonrest prüft sie die neue Expressionsmessung statt die Richtung der Wirkung aus dem Wort ‚Methylierung‘ allein vorherzusagen.",
            "For a different marked histone residue, the learner checks new expression data rather than inferring an effect solely from the word 'methylation'.",
        ),
    },
    "ceb54223": {
        "decision": "revise",
        "rationale": "‚Prinzip und Anwendung‘ trennt Mechanismus und potenziell unbegrenzte Anwendungen; die Q1.2-Beschreibung soll eine einzige begrenzte Verständnisleistung an einem konkreten Fall benennen. Die lokale Fassung bindet komplementäre kleine RNA und eine Ziel-mRNA, ohne Therapieerfolg oder jede RNAi-Variante zu behaupten. Das aktuelle Ago2/RISC-PNG zeigt nur einen möglichen schematischen Weg und ist formal V-Kandidat.",
        "proposedDescriptionDe": "Die lernende Person kann an einem vorgegebenen Beispiel erklären, wie eine passende kleine RNA die Expression einer Ziel-mRNA durch RNA-Interferenz vermindern kann.",
        "proposedDescriptionEn": "The learner can use a supplied example to explain how a matching small RNA can reduce expression of a target mRNA through RNA interference.",
        "understandingEvidence": ev(
            "Eine kleine RNA führt einen passenden Silencing-Komplex zu einer komplementären Ziel-mRNA; deren Spaltung oder gehemmte Nutzung kann die Bildung des Genprodukts senken. Das Modell ist sequenzabhängig und keine automatische Therapie.",
            "A small RNA guides a silencing complex to a complementary target mRNA; cleavage or blocked use can reduce the gene product. The model depends on sequence match and does not imply an automatic therapy.",
            "Die lernende Person ordnet in einem neuen kurzen RNAi-Schema kleine RNA, Ziel-mRNA und verminderte Proteinbildung zu und begründet die Zielauswahl anhand einer gegebenen Sequenzpassung.",
            "The learner identifies small RNA, target mRNA and reduced protein production in a new short RNAi diagram and explains targeting from a supplied sequence match.",
            "Bei einer veränderten Zielsequenz prüft sie, ob die vorgegebene kleine RNA noch passend bindet, statt dieselbe Hemmung ungeprüft zu übernehmen.",
            "For a changed target sequence, the learner checks whether the supplied small RNA still pairs appropriately rather than assuming unchanged silencing.",
        ),
    },
    "5b2571d9": {
        "decision": "split_review",
        "rationale": "Das Bakterien-Schema und die Vermehrung durch Zellteilung sind getrennt beobachtbare Kompetenzen: Zellhülle, DNA und mögliche Plasmide lassen sich korrekt einordnen, ohne den Ablauf einer Zweiteilung zu erklären, und umgekehrt. Die gentechnische Nutzung verknüpft beides als Kontext, macht aber aus zwei Lernleistungen keine atomare. Die Q1.2-Seite hat im B-Eingang kein aktuelles Bild; keine V-Aussage.",
        "understandingEvidence": ev(
            "Bakterien sind prokaryotische Zellen ohne Zellkern mit DNA im Zellraum und je nach Bakterium Plasmiden; ihre Vermehrung erfolgt gewöhnlich durch Zellteilung nach DNA-Kopie. Zellbau und Teilungsablauf sind unterscheidbare Nachweise.",
            "Bacteria are prokaryotic cells without a nucleus, with DNA in the cell interior and plasmids in some bacteria; they normally reproduce by division after DNA copying. Cell structure and division are distinct evidence targets.",
            "Die lernende Person beschriftet ein neues Bakterienschema und erklärt getrennt aus einer vorgelegten Zeitreihe, wie aus einer Zelle zwei Zellen werden, ohne ein Plasmid für jede Zelle vorauszusetzen.",
            "The learner labels a new bacterial diagram and separately explains from a supplied time sequence how one cell becomes two, without assuming every bacterium has a plasmid.",
            "Bei einem neuen Bakterium ohne Plasmid entscheidet sie, welche Merkmale für den Zellbau bleiben und ob die im Schema gezeigte Zweiteilung trotzdem möglich ist.",
            "For a new bacterium without a plasmid, the learner identifies remaining cell-structure features and whether the shown binary division is still possible.",
        ),
    },
    "8eb86a82": {
        "decision": "split_review",
        "rationale": "Die Beschreibung verlangt sowohl die praktische Trennung von DNA-Fragmenten im Gel als auch die Interpretation eines Bandenmusters. Eine Person kann ein Gel nach Anleitung sicher ansetzen und laufen lassen, ohne aus Laufstrecken Fragmentgrößen zu deuten; ebenso können Bilddaten ohne Durchführung ausgewertet werden. Der Titel ‚auswerten‘ deckt nur die zweite Leistung ab. Eine lokale Satzkorrektur würde die praktische Kompetenz still entfernen. Es ist im B-Eingang kein aktuelles Bild gebunden.",
        "understandingEvidence": ev(
            "Gel-Elektrophorese trennt geladene DNA-Fragmente im Gel überwiegend nach Länge; die Durchführung unter sicheren Bedingungen und das Deuten von Banden relativ zu einer Größenleiter sind unterschiedliche Leistungen.",
            "Gel electrophoresis separates charged DNA fragments in a gel mainly by length; safe practical operation and interpretation of bands against a size ladder are different skills.",
            "Die lernende Person beschreibt für einen bereitgestellten sicheren Aufbau die Proben- und Leiterpositionen und wertet separat ein neues Gelbild mit Leiter, Kontrolle und Probenbanden aus.",
            "The learner identifies sample and ladder positions for a supplied safe setup and separately interprets a new gel image with ladder, control and sample bands.",
            "Bei einem neuen Gel mit vertauschten Probenspuren und einer unscharfen Bande prüft sie die Spurzuordnung und begrenzt die Größenschätzung statt die erste Lösung zu kopieren.",
            "For a fresh gel with switched sample lanes and one blurred band, the learner rechecks lane identity and limits size inference rather than copying the first answer.",
        ),
    },
    "440854be": {
        "decision": "revise",
        "rationale": "‚Risiken einschätzen‘ kann individuelle Krankheitswahrscheinlichkeit oder Beratung verlangen, obwohl dieses Stammbauziel auf Erbganganalyse zielt und der Gentest-/Beratungsbereich im folgenden Ziel liegt. Die lokale Fassung benennt monohybride, autosomale/gonosomale und dominante/rezessive Einordnung aus belegten Familienmustern und erlaubt Mehrdeutigkeit bei kleinen Stammbäumen. Das aktive Pedigree-PNG zeigt drei Kinder und ist nur V-Kandidat; es entscheidet keine genetische Diagnose.",
        "proposedDescriptionDe": "Die lernende Person kann in einem Familienstammbaum einen monohybriden autosomalen oder gonosomalen, dominanten oder rezessiven Erbgang anhand der sichtbaren Verteilung begründet einordnen und Unsicherheit bei unzureichenden Daten benennen.",
        "proposedDescriptionEn": "The learner can use the visible pattern in a family pedigree to justify classification of a monohybrid autosomal or sex-linked, dominant or recessive inheritance pattern and state uncertainty when data are insufficient.",
        "understandingEvidence": ev(
            "Ein Stammbaum zeigt beobachtete Merkmale über Generationen; Verteilung nach Geschlecht und Generation kann Erbgänge stützen oder ausschließen, aber ein kleiner Stammbaum kann mehrere Modelle offenlassen.",
            "A pedigree records observed traits across generations; patterns by sex and generation can support or exclude modes of inheritance, but a small pedigree may leave several models possible.",
            "Die lernende Person markiert bei einem neuen Familienmuster Eltern-Kind-Beziehungen, prüft dominant/rezessiv und autosomal/gonosomal anhand konkreter Personen und begründet verbleibende Unsicherheit.",
            "The learner identifies parent-child links in a fresh family pattern, tests dominant/recessive and autosomal/sex-linked explanations against specific people, and justifies remaining uncertainty.",
            "Bei einem neuen Pedigree mit zwei gesunden Eltern und einem betroffenen Kind revidiert sie ein vorschnelles dominantes Modell, ohne aus dem Bild allein ein individuelles Krankheitsrisiko zu behaupten.",
            "With a fresh pedigree showing two unaffected parents and an affected child, the learner revises a premature dominant model without deriving an individual's disease risk from the image alone.",
        ),
    },
    "73b66ead": {
        "decision": "revise",
        "rationale": "‚Verschiedene Gentests‘ fordert ohne gebundene Testarten eine unklare Breite, während Titel und Q1.3-Kontext eine fallbezogene Beurteilung verlangen. Die lokale Präzisierung auf einen vorgegebenen Gentest hält Anlass, Aussagekraft und Grenze als ein Urteil zusammen; ein positiver Marker wird nicht zur sicheren Krankheitsprognose. Im B-Eingang ist kein aktuelles Zielbild vorhanden.",
        "proposedDescriptionDe": "Die lernende Person kann an einem vorgegebenen Gentest dessen Anlass, Aussagekraft und Grenzen für eine begründete Beratungssituation beurteilen.",
        "proposedDescriptionEn": "The learner can assess the purpose, evidential value and limits of a supplied genetic test for a reasoned counselling situation.",
        "understandingEvidence": ev(
            "Ein Gentest beantwortet nur die auf seine Variante und Testgüte bezogene Frage; Befund, Erkrankungswahrscheinlichkeit und persönliche Entscheidung sind verschieden und brauchen Kontext.",
            "A genetic test answers only a question tied to its target variant and test performance; a finding, disease probability and personal decision are different and require context.",
            "Die lernende Person erklärt für einen vorgegebenen Testfall, wofür geprüft wird, was ein positives oder negatives Ergebnis stützt und welche Aussagen ohne weitere Daten unzulässig sind.",
            "For a supplied test case, the learner explains what is tested, what positive or negative results support and which claims cannot be made without more information.",
            "Bei einer neuen Variante mit unvollständiger Penetranz begrenzt sie die Prognose trotz positivem Nachweis und trennt fachliche Information von der Entscheidung der betroffenen Person.",
            "With a fresh variant of incomplete penetrance, the learner limits prognosis despite a positive finding and separates technical information from the person's decision.",
        ),
    },
    "3891b735": {
        "decision": "revise",
        "rationale": "Der Q1.3-Kontext nennt Gentherapie nur im Prinzip. Die aktuelle Mehrzahl ‚Strategien‘ lädt zu einer offenen Verfahrensliste ein, die über den Kern hinausgeht. Eine lokale Fassung begrenzt die Leistung auf die Grundidee an einem gegebenen Beispiel und trennt Ziel, Eingriff und begrenzte mögliche Wirkung; eine sichere Heilung wird nicht versprochen. Kein aktuelles Bild im B-Eingang.",
        "proposedDescriptionDe": "Die lernende Person kann das Prinzip einer Gentherapie an einem vorgegebenen Beispiel mit Zielzelle, beabsichtigter genetischer Änderung und Wirkungsgrenze erklären.",
        "proposedDescriptionEn": "The learner can explain the principle of gene therapy in a supplied example, identifying the target cell, intended genetic change and limit of the expected effect.",
        "understandingEvidence": ev(
            "Gentherapie versucht, eine krankheitsrelevante genetische Funktion in geeigneten Körperzellen zu verändern oder zu ergänzen; Erreichen der Zielzellen und tatsächliche Wirkung sind nicht garantiert.",
            "Gene therapy aims to alter or supplement a disease-related genetic function in suitable body cells; delivery to target cells and the actual effect are not guaranteed.",
            "Die lernende Person ordnet in einem vorgegebenen Schema Zielzellen, eingebrachte oder veränderte Information und beabsichtigte Funktion zu und benennt eine plausible Verfahrensgrenze.",
            "The learner identifies target cells, added or changed information and intended function in a supplied diagram and names a plausible limit of the approach.",
            "Bei einem neuen Fall, in dem nur ein Teil der Zielzellen erreicht wird, erklärt sie, weshalb ein Prinzipnachweis keinen vollständigen oder dauerhaften Therapieerfolg belegt.",
            "In a new case where only some target cells are reached, the learner explains why demonstrating the principle does not establish complete or lasting treatment success.",
        ),
    },
    "f53d0a0b": {
        "decision": "keep",
        "rationale": "Das LK-Ziel bündelt einen einheitlichen Methodenbegriff mit einem begrenzten Einsatzbeispiel: Zielerkennung durch passende guide-RNA, Cas-Schnitt nahe einer geeigneten Zielstelle und nachfolgende zelleigene Reparatur. Die Beschreibung verspricht kein präzises Endergebnis und keinen Therapieerfolg. Das aktuelle PNG illustriert Schnitt an beiden DNA-Strängen nahe PAM, bleibt aber V-Kandidat und zeigt keine Reparatur; die unabhängige Leistung muss diese Grenze benennen.",
        "understandingEvidence": ev(
            "Eine passende guide-RNA führt ein Cas-Nuklease-System zu einer DNA-Zielregion mit erforderlicher Erkennungsvoraussetzung; Cas kann einen Schnitt setzen, dessen endgültige Sequenzfolge von der späteren Reparatur abhängt.",
            "A matching guide RNA directs a Cas nuclease to a DNA target with the required recognition context; Cas can cut DNA, while the final sequence outcome depends on later repair.",
            "Die lernende Person liest ein neues vereinfachtes Ziel/PAM/guide-Schema, markiert die mögliche Schnittstelle und erklärt, welche Aussage über die beabsichtigte Anwendung ohne Reparaturdaten offenbleibt.",
            "The learner reads a fresh simplified target/PAM/guide diagram, marks the possible cut and explains which claim about an intended use remains open without repair data.",
            "Bei einer geänderten Zielsequenz oder fehlendem PAM prüft sie die Zielerkennung neu und verwechselt einen vorgesehenen Schnitt nicht mit einer nachgewiesenen präzisen Korrektur.",
            "With an altered target sequence or absent PAM, the learner rechecks targeting and does not equate an intended cut with proven precise correction.",
        ),
    },
}


def main():
    batch = CAMPAIGN["batches"][0]
    assert INPUT["bundleFingerprint"] == CAMPAIGN["bundleFingerprint"] == BUNDLE["bundleFingerprint"]
    assert [goal["goalId"] for goal in INPUT["goals"]] == batch["goalIds"]
    assert {goal["goalId"][:8] for goal in INPUT["goals"]} == set(DECISIONS)
    records = []
    for index, goal in enumerate(INPUT["goals"], 1):
        record = {
            "$schema": "https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json",
            "schemaVersion": 1,
            "recordId": f"biologie-q1-b-{index:02d}-{goal['goalId'][:8]}",
            "runId": RUN_ID,
            "campaignId": CAMPAIGN["campaignId"],
            "roundId": CAMPAIGN["roundId"],
            "bundleFingerprint": CAMPAIGN["bundleFingerprint"],
            "bookDigest": CAMPAIGN["bookDigest"],
            "goalId": goal["goalId"],
            "goalFingerprint": goal["goalFingerprint"],
            "pageFingerprint": goal["pageFingerprint"],
            "currentTitleDe": goal["currentTitleDe"],
            "currentTitleEn": goal["currentTitleEn"],
            "currentDescriptionDe": goal["currentDescriptionDe"],
            "currentDescriptionEn": goal["currentDescriptionEn"],
            **DECISIONS[goal["goalId"][:8]],
            "evidenceProfileContract": "positive-understanding-evidence-v2",
            "evidenceProfileRecommendation": "create",
            "recordStatus": "candidate",
            "reviewAuthority": "ai_candidate",
        }
        records.append(record)
    results = HERE / "results"
    results.mkdir(exist_ok=True)
    output = ("\n".join(json.dumps(record, ensure_ascii=False, separators=(",", ":")) for record in records) + "\n").encode()
    (results / f"{batch['batchId']}.records.jsonl").write_bytes(output)
    now = datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")
    input_artifact = next(a for a in BUNDLE["artifacts"] if a["role"] == "review_input_json")
    run = {
        "$schema": "https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json",
        "schemaVersion": 1,
        "runId": RUN_ID,
        "campaignId": CAMPAIGN["campaignId"],
        "roundId": CAMPAIGN["roundId"],
        "batchId": batch["batchId"],
        "batchInputFingerprint": batch["batchInputFingerprint"],
        "bundleFingerprint": CAMPAIGN["bundleFingerprint"],
        "bookDigest": CAMPAIGN["bookDigest"],
        "provider": "OpenAI",
        "model": "gpt-6-astra",
        "role": "subject_reviewer",
        "promptFamilyId": "goal-description-understanding-evidence-review-v2",
        "promptFingerprint": CAMPAIGN["promptFingerprint"],
        "criteriaFingerprint": CAMPAIGN["criteriaFingerprint"],
        "generationParametersFingerprint": "sha256:44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a",
        "independenceGroupId": CAMPAIGN["independenceGroupId"],
        "blindToOtherRuns": True,
        "goalIds": batch["goalIds"],
        "inputArtifacts": [
            {"role": "review_input_json", "digest": input_artifact["digest"]},
            {"role": "review_prompt", "digest": CAMPAIGN["promptFingerprint"]},
            {"role": "review_criteria", "digest": CAMPAIGN["criteriaFingerprint"]},
            {"role": "description_review_batch_input_jsonl", "digest": batch["batchInputFingerprint"]},
        ],
        "startedAt": now,
        "completedAt": now,
        "status": "completed",
        "outputDigest": "sha256:" + sha256(output).hexdigest(),
        "toolchainVersion": "skillpilot-goal-description-review-v2",
    }
    (results / f"{batch['batchId']}.run.json").write_text(json.dumps(run, ensure_ascii=False, indent=2) + "\n")
    print(f"Materialized {len(records)} blind Q1 Round B records")


if __name__ == "__main__":
    main()
