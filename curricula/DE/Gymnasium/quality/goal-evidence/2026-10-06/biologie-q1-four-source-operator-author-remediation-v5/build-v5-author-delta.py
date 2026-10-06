# SPDX-License-Identifier: Apache-2.0
"""Inert author v5 only; no active or historical writes and no self-approval."""
import copy
import datetime
import hashlib
import json
import pathlib
import subprocess
import urllib.request

OUT = pathlib.Path(__file__).resolve().parent
ROOT = OUT.parents[6]
V4 = OUT.with_name("biologie-q1-four-current383-source-scope-author-remediation-v4")
AREVIEW = OUT.with_name("biologie-q1-four-source-operator-v4-independent-a-v1")
BREVIEW = OUT.with_name("biologie-q1-four-source-operator-v4-independent-b-v1")
TMP = ROOT / "tmp/biologie-q1-source-operator-author-remediation-20261006-v5"
TMP.mkdir(parents=True, exist_ok=True)
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
sha = lambda b: hashlib.sha256(b).hexdigest()
read = lambda p: json.loads(p.read_text())
def write(name, data):
    (OUT / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")

freezes = []
for directory, name, expected in [
    (V4, "author-source-scope-remediation-v4.final.freeze.json", "89816e95a26d30ff82e900565ec164acb3427cb341129f86aaa154adce82419f"),
    (AREVIEW, "independent-a.final.freeze.json", "b120e46882983f9b3a4e343c351659f75933a5923c7fd037dc686b9ea79526fc"),
    (BREVIEW, "independent-b-v4.final.freeze.json", "5a7a71ff529cadf6c39555dc9dd3c62d617e2169a1c19febc0d2af115a90ed9d"),
]:
    fp = directory / name
    assert sha(fp.read_bytes()) == expected
    fs = read(fp)
    for f in fs["files"]:
        raw = (directory / f["path"]).read_bytes()
        assert sha(raw) == f["sha256"] and len(raw) == f["bytes"]
    freezes.append({"path": str(fp.relative_to(ROOT)), "sha256": expected, "ownBoundFilesVerified": len(fs["files"])})

original_main = read(V4 / "four-main-components-eight-positive-cases.author-candidate.json")
original_mut = read(V4 / "mutation-source-components-author/bounded-components-and-fourteen-positive-cases.author-candidate.json")
main = copy.deepcopy(original_main["components"])
mut = copy.deepcopy(original_mut["components"])
components = main + mut
by_key = {c["candidateKey"]: c for c in components}
mechanism = by_key["he_pro_euk_mrna_ribosome_trna_mechanism"]["tasks"][0]
mechanism.update({
    "material": "Fiktive typische Modelle: Bakterium P ohne Zellkern; kernhaltige eukaryotische Zelle E. Dasselbe längere intronfreie Enzymgen wird in schematischer Kurzschrift gezeigt: codierende DNA 5′-ATG GAA … TTT TGA-3′. Die Auslassung steht für viele weitere vollständige Codons mit unverändertem Leseraster; sie ist kein Nukleotid und wird nicht mitübersetzt. Die früher verwendete Kurzfolge ATG GAA TTT TGA bezeichnet nur die dargestellten Codons, kein vollständiges Drei-Aminosäuren-Enzymgen. P: Transkription und Translation liegen im selben Zellraum; ein Ribosom kann schon entstehende mRNA ablesen. E: Transkription im Kern, RNA-Reifung, Export reifer mRNA und Translation an cytoplasmatischen Ribosomen. mRNA ist ein einzelsträngiger RNA-Informationsträger mit Codons. Materialcode AUG=Met, GAA=Glu, UUU=Phe, UGA=Stopp. tRNA für GAA trägt Glu und Anticodon 3′-CUU-5′, gleichbedeutend 5′-UUC-3′. Die gegebene Funktion des vollständigen längeren Enzyms ist eine lebensnotwendige Stoffwechselreaktion; die Kurzschrift beweist diese Funktion nicht selbst.",
    "task": "Verfolge den Informationsfluss für P und E und übersetze die dargestellten Codons; führe die Auslassung in mRNA und Peptidmodell weiter. Erkläre Rollen und Strukturbezug von mRNA, Ribosom und tRNA und begründe das Anticodon. Vergleiche Raum und Zeit. Begründe aus der gesondert gegebenen Funktion, weshalb neue vollständige Enzymbildung benötigt wird. Was lässt sich weder über die ausgelassene Sequenz noch über alle Pro-/Euk-Sonderfälle aus dem Modell bestimmen?",
    "solution": "Die mRNA-Kurzschrift lautet 5′-AUG GAA … UUU UGA-3′; das Peptidmodell Met–Glu–…–Phe, dann Stopp. Die dargestellten Codons ergeben Met/Glu/Phe; Stopp ist keine Aminosäure. Die ausgelassenen vollständigen Codons und Aminosäuren bleiben unbekannt, ohne Rasterwechsel. Die RNA trägt Codons; das Ribosom liest sie und verknüpft durch tRNA bereitgestellte Aminosäuren. Antiparallele Paarung 5′GAA3′/3′CUU5′ verbindet das GAA-Codon mit tRNA-gebundenem Glu. P kann die Prozesse koppeln; E trennt Kern/Reifung/Export von cytoplasmatischer Translation. Neue vollständige Enzymbildung unterstützt Ersatz und Erhaltung der vorgegebenen Stoffwechselfunktion. Es wird kein vollständig identifiziertes Drei-Reste-Enzym hergeleitet; Organellenausnahmen, alle Proteinaufgaben und die vollständige ausgelassene Sequenz sind nicht gezeigt.",
    "materialEn": "Fictional typical models: bacterium P without a nucleus; nucleated eukaryotic cell E. The same longer intron-free enzyme gene is shown in schematic shorthand: coding DNA 5′-ATG GAA … TTT TGA-3′. The omission represents many additional complete codons in the unchanged reading frame; it is not a nucleotide and is not translated itself. The earlier short string ATG GAA TTT TGA denotes only the displayed codons, not a complete three-residue enzyme gene. P transcribes and translates in the same compartment, and a ribosome can read emerging mRNA. E transcribes in the nucleus, processes RNA, exports mature mRNA and translates at cytoplasmic ribosomes. mRNA is single-stranded RNA carrying codons. Code: AUG=Met, GAA=Glu, UUU=Phe, UGA=stop. GAA tRNA carries Glu and anticodon 3′-CUU-5′, equivalent to 5′-UUC-3′. A vital metabolic reaction is the separately supplied function of the complete longer enzyme; the shorthand does not itself establish this function.",
    "taskEn": "Trace information flow in P/E and translate the displayed codons, retaining the omission in the mRNA and peptide models. Explain mRNA, ribosome and tRNA roles and structure/function, and justify the anticodon. Compare space and timing. Use the separately supplied function to justify the need for new complete enzyme production. What can this model establish neither about the omitted sequence nor about all prokaryotic/eukaryotic exceptions?",
    "solutionEn": "mRNA shorthand is 5′-AUG GAA … UUU UGA-3′; the peptide model is Met–Glu–…–Phe, followed by stop. Displayed codons give Met/Glu/Phe; stop is not an amino acid. The omitted complete codons and amino acids remain unknown, without a frame shift. RNA carries codons; the ribosome reads them and joins amino acids supplied by tRNA. Antiparallel pairing 5′GAA3′/3′CUU5′ connects GAA to tRNA-bound Glu. P can couple the processes; E separates nuclear processing/export from cytoplasmic translation. New complete enzyme synthesis supports replacement and maintenance of the supplied metabolic function. No fully identified three-residue enzyme is derived; organelle exceptions, all protein roles and the complete omitted sequence are not shown.",
    "positiveEssentialPassingConditions": [
        "Explain connected transcription/translation and the roles of all three molecules",
        "Use antiparallel GAA/3′CUU5′ pairing correctly",
        "Carry the explicit abbreviation through RNA/product and distinguish it from the complete functional enzyme",
        "Compare typical compartments/timing and justify complete-enzyme renewal using the separately supplied function",
    ],
    "authorV5Delta": "A/B discrepancy resolved as an author proposal by explicit longer-gene shorthand and separate whole-enzyme function; independent targeted followup pending",
})

protein = by_key["protein_function_from_mutation_data"]["tasks"][0]
protein.update({
    "materialDe": "Fiktives längeres intronfreies Enzymgen, codierender DNA-Strang 5′→3′, Start und Leseraster vorgegeben. Schematische Kurzschrift: Referenz ATG GAA TTC … TAA; V ATG GAC TTC … TAA; W ATG GAG TTC … TAA. Die Auslassung steht in allen drei vollständigen Genen für denselben langen unveränderten Abschnitt aus vollständigen Codons; auch sonst sind die Gene und Prüfbedingungen gleich. Sie wird nicht als Base/Codon übersetzt. Die bisherigen Kurzfolgen ATG GAA TTC TAA usw. bezeichnen ausschließlich dargestellte Codons, keine vollständigen Drei-Reste-Funktionsproteine. Materialcode: AUG=Met, GAA/GAG=Glu, GAC=Asp, UUC=Phe, UAA=Stopp. Geprüft werden die vollständigen längeren, gereinigten Proteine in gleicher Menge unter gleichen Bedingungen, nicht isolierte Drei-Reste-Peptide: Aktivität Referenz 100±4, V 12±2, W 98±4 Einheiten.",
    "promptDe": "Leite mRNA und Produkt-Kurzschriften mit Auslassung ab. Erkläre die Änderung im gezeigten Abschnitt und verbinde sie mit den Messungen an vollständigen Proteinen. Welche Funktion ist für V im Test beeinträchtigt? Was bleibt über die ausgelassene Sequenz und eine allgemeine Wirkung von W offen?",
    "solutionDe": "Referenz AUG GAA UUC … UAA → Met–Glu–Phe–…; V AUG GAC UUC … UAA → Met–Asp–Phe–…; W AUG GAG UUC … UAA → Met–Glu–Phe–…; jeweils Stopp nach dem ausgelassenen Abschnitt. V verändert im gezeigten Teil Glu zu Asp; der übrige vollständige Proteinabschnitt ist laut Material gleich. Gleiche gereinigte Menge und Bedingungen zeigen stark verminderte Aktivität des vollständigen V-Proteins im Test. W ist an der gezeigten Stelle synonym und hier nicht klar abweichend. Daraus folgt weder die vollständige ausgelassene Aminosäurefolge noch universelle Funktionsneutralität jeder synonymen Mutation. Die drei dargestellten Reste werden nicht selbst als das gemessene vollständige Enzym ausgegeben; keine klinische Diagnose.",
    "materialEn": "Fictional longer intron-free enzyme gene, coding DNA 5′→3′ with fixed start/frame. Schematic shorthand: reference ATG GAA TTC … TAA; V ATG GAC TTC … TAA; W ATG GAG TTC … TAA. In all complete genes, the omission represents the same long unchanged region of complete codons; the genes and test conditions are otherwise identical. The omission is not translated as a base/codon. Earlier short strings ATG GAA TTC TAA and variants denote only displayed codons, not complete three-residue functional proteins. Code: AUG=Met, GAA/GAG=Glu, GAC=Asp, UUC=Phe, UAA=stop. The complete longer purified proteins, not isolated three-residue peptides, are tested at equal amounts and under equal conditions: activity reference 100±4, V 12±2, W 98±4 units.",
    "promptEn": "Derive mRNA and product shorthand, retaining the omission. Explain the displayed segment change and connect it to measurements of complete proteins. Which tested function is impaired in V? What remains unknown about the omitted sequence and a universal effect of W?",
    "solutionEn": "Reference AUG GAA UUC … UAA → Met–Glu–Phe–…; V AUG GAC UUC … UAA → Met–Asp–Phe–…; W AUG GAG UUC … UAA → Met–Glu–Phe–…; each has stop after the omitted region. V changes Glu to Asp in the displayed part; the rest of the complete protein is identical by stipulation. Equal purified amounts and conditions show strongly reduced tested activity of the complete V protein. W is synonymous at the displayed position and shows no clear difference here. Neither the full omitted amino-acid sequence nor universal neutrality of every synonymous mutation follows. The three displayed residues are not presented as the assayed complete enzyme; no clinical diagnosis.",
    "positiveEssentialConditions": [
        "Correct codon/product correspondence with the explicit omitted complete-codon region",
        "Separate displayed fragment/shorthand from measurements of the complete longer proteins",
        "Use controlled complete-protein measurements rather than inferring function from sequence alone",
        "Account for equal amounts, measurement spread and limits of synonymous/function claims",
    ],
    "authorV5Delta": "A/B discrepancy resolved as an author proposal by explicit complete-gene abbreviation and complete-protein assay boundary; independent targeted followup pending",
})

mutagen = by_key["mutagen_causes_and_protection"]
mutagen["description"] = "Die lernende Person kann anhand vorgegebener Materialdaten erklären, wie mutagene Einflüsse bleibende Veränderungen der Erbinformation begünstigen können, genetische Risiken in einer konkreten Alltags- oder Umweltsituation nach benannten Kriterien bewerten und Möglichkeiten zur Verringerung der Exposition begründet auswählen."
mutagen["descriptionEn"] = "The learner can use supplied material data to explain how mutagenic influences can favour persistent changes to genetic information, evaluate genetic risks in a concrete everyday or environmental situation using stated criteria and justify choices that reduce exposure."
mutagen["authorV5Delta"] = "Only this null-ID description is extended to the actually requested MV/ST decision operator; original R/M controlled cases retained exactly, two concrete decision cases added. No new ID/native route or whole-source clearance."
mutagen["tasks"].extend([
    {
        "caseKey": "everyday-uv-risk-decision-c",
        "status": "new_synthetic_author_decision_material_not_learner_work",
        "materialDe": "Materialkarte für einen fiktiven Schulsporttag. Sachinformation: UV-Strahlung der Sonne kann DNA schädigen; fehlerhafte oder ausbleibende Korrektur kann bleibende genetische Änderungen begünstigen. Expositionsverringerung ist deshalb begründbar, aber weder jede Bestrahlung eine feste Mutation noch jede Mutation eine Krankheit. Das BfS beschreibt Kleidung, Schatten und Zeiten geringerer UV-Belastung als Schutzansätze. Für denselben 30-minütigen Spielteil werden drei bereits organisatorisch mögliche Varianten vorgegeben: A ungeschützte Fläche mittags, relative UV-Exposition 100 Einheiten, keine Zusatzorganisation; B beschattete Fläche mit hautbedeckender Kleidung zur selben Zeit, 25 Einheiten, Fläche muss reserviert werden; C Spielteil am Vormittag auf der beschatteten Fläche mit derselben Kleidung, 10 Einheiten, Zeitplan muss umgestellt werden. Alle Varianten erlauben dieselbe Teilnahme, die Umstellung ist laut Schulleitung möglich. Die Werte sind fiktive Modell-Expositionen für die festgelegten Bedingungen, keine Mutations- oder Krankheitswahrscheinlichkeiten. Kriterien der Schule: erst vermeidbare Exposition senken, dabei Teilnahme erhalten, dann Organisationsaufwand abwägen. Ein Werbezettel behauptet: weniger Wärme bedeutet automatisch weniger UV; dazu liegen keine passenden Messungen vor.",
        "materialEn": "Material card for a fictional school sports day. Factual information: solar UV can damage DNA; erroneous or absent correction can favour persistent genetic changes. Reducing exposure is therefore justified, but not every irradiation is a fixed mutation and not every mutation a disease. BfS describes clothing, shade and times with lower UV exposure as protective approaches. Three organisationally feasible alternatives for the same 30-minute game are supplied: A unprotected area at midday, relative UV exposure 100 units, no extra organisation; B shaded area and skin-covering clothing at the same time, 25 units, requiring a reservation; C morning game in the shaded area with the same clothing, 10 units, requiring a schedule change. Participation is the same, and school management permits the change. Values are fictional model exposures under stated conditions, not mutation or disease probabilities. School criteria: first reduce avoidable exposure while preserving participation, then weigh organisational effort. An advertisement claims less warmth automatically means less UV, without matching measurements.",
        "promptDe": "Bewerte A/B/C anhand der angegebenen genetischen Gefahr, Expositionsdaten und Prioritäten. Trenne deinen Datenvergleich von deinem begründeten Urteil über die Handlung. Empfiehl eine Variante und reflektiere den Zielkonflikt Schutz/Organisation; welche zweite Variante wäre bei einem tatsächlich unveränderbaren Zeitplan begründbar? Beurteile den Werbesatz und formuliere ausdrücklich, welche Aussage über eine einzelne Person oder einen bestimmten prozentualen Krankheitsrückgang aus den Daten nicht folgt.",
        "promptEn": "Evaluate A/B/C using the stated genetic hazard, exposure data and priorities. Separate your data comparison from your reasoned action judgement. Recommend an option and reflect on protection versus organisation; which alternative is justified if the schedule really cannot change? Assess the advertisement and explicitly state what does not follow about an individual or a specified percentage disease reduction.",
        "solutionDe": "Sachvergleich: C hat die geringste vorgegebene Exposition10, B25, A100; alle erhalten Teilnahme. UV-bedingte DNA-Schäden liefern den genetischen Gefahrenbezug. Nach der ausdrücklich vorrangigen Expositionsverringerung und möglicher Umstellung ist C begründet trotz Zusatzorganisation. Wenn der Zeitplan wirklich fest wäre, wäre B gegenüber A begründbar. Das Urteil legt die Gewichtung offen, statt nur eine Zahl zu nennen. Wärme ist ohne UV-Messung kein ausreichender UV-Indikator. Die Modellwerte geben keine individuelle Mutation, Erkrankung, Nullrisiko oder einen zahlenmäßig entsprechenden Krankheitsrückgang an; Schutz muss zu Strahlungsart und Situation passen.",
        "solutionEn": "Data comparison: C has the lowest stated exposure10, B25, A100; all preserve participation. UV-induced DNA damage supplies the genetic-hazard link. With exposure reduction given priority and schedule change permitted, C is justified despite extra organisation. If the schedule were genuinely fixed, B is justified over A. The judgement states its weighting rather than merely selecting a number. Warmth without UV measurement is not an adequate UV indicator. Model values establish no individual mutation, disease, zero risk or numerically corresponding disease reduction; protection must match the radiation and situation.",
        "positiveEssentialConditions": [
            "Connect actual everyday solar UV exposure to the supplied DNA-damage/fixation hazard without deterministic disease inference",
            "Compare all three material-backed options using explicit stated criteria and priorities",
            "State and justify the action judgement, organisation tradeoff and conditional alternative",
            "Reject heat as sufficient UV evidence and separate exposure ratios from individual mutation/disease probabilities",
        ],
        "sourceOperatorTargets": ["MV10 everyday mutagen-hazard reflection", "ST10/E-phase evaluating environmental genetic risks, stage binding still held"],
        "factualSourceKeys": ["BfS-UV-protection", "BfS-UV-DNA"],
        "dataOrigin": "Fictional supplied decision context and exposure numbers; factual UV/protection premise supported by actual primary agency materials",
        "claimLimit": "School-model judgement under stated criteria only; no performed experiment, personal health forecast, learner performance, independent approval or whole-source clearance",
    },
    {
        "caseKey": "environment-air-pah-risk-decision-d",
        "status": "new_synthetic_author_decision_material_not_learner_work",
        "materialDe": "Materialkarte zu einem fiktiven Wohnviertel mit Holzofenrauch und dem täglichen Warten auf den Schulbus. Sachinformation des Umweltbundesamts: Bei unvollständiger Holzverbrennung können PAK wie Benzo(a)pyren entstehen; es wird in der Luft partikelgebunden erfasst. Genotoxische PAK-Metaboliten können an DNA binden; solche Schäden können bei falscher oder ausbleibender Korrektur bleibende Änderungen begünstigen. Eine Gruppe der PAK ist damit ein chemischer Gefahrenfaktor; eine momentane Konzentration ist keine individuelle Krankheitsvorhersage. Vorgegebene Modellkarte für die kommenden fünf vergleichbaren Schultage, stets zehn Minuten Wartezeit: A nahe der Rauchquelle, 12±1 relative Expositionseinheiten/Tag, kein zusätzlicher Weg; B zugänglicher und verkehrssicherer Warteplatz abseits der Quelle, 2±0,5 Einheiten/Tag, sechs Minuten zusätzlicher Weg, derselbe Bus wird erreicht; C derselbe Platz wie A hinter einem Sichtschutz, 11±1 Einheiten/Tag, gleicher Weg. Der Sichtschutz ist kein Filter; die Karte belegt keine Abscheidung der betrachteten Partikel. Für andere Wetterlagen fehlen Messungen. Vorgegebene Entscheidungskriterien: vermeidbare Belastung vorrangig verringern, sichere und verlässliche Erreichbarkeit erhalten, Zeitaufwand berücksichtigen. Die Zahlen sind ausschließlich fiktive vergleichende Expositionen, keine realen Luftmessungen oder klinischen Grenzwerte.",
        "materialEn": "Material card for a fictional neighbourhood with wood-stove smoke and everyday waiting for a school bus. Umweltbundesamt factual information: incomplete wood combustion can produce PAHs such as benzo(a)pyrene, measured as particle-bound in air. Genotoxic PAH metabolites can bind DNA; incorrect or absent correction of such damage can favour persistent changes. This makes a group of PAHs a chemical hazard; a momentary concentration is not an individual disease forecast. Supplied model for five comparable school days, each with ten minutes waiting: A near the smoke source, 12±1 relative exposure units/day, no extra walk; B accessible, traffic-safe waiting location away from the source, 2±0.5 units/day, six extra minutes walking, reaching the same bus; C the A location behind a visual screen, 11±1 units/day, same walk. The screen is not a filter; the card supplies no capture evidence for the particles concerned. Other weather conditions are unmeasured. Criteria: prioritise reduction of avoidable exposure, preserve safe and reliable access, consider time cost. Numbers are fictional comparative exposures, not real air measurements or clinical limits.",
        "promptDe": "Bewerte die genetische Umweltgefahr in dieser konkreten Alltagssituation und A/B/C anhand aller Kriterien. Begründe eine Empfehlung einschließlich des Zeitnachteil-Abwägens. Nutze die fünf Tage als Vergleich der angegebenen Expositionssummen, ohne daraus eine Krankheitswahrscheinlichkeit zu berechnen. Welche zusätzliche Überprüfung wäre vor einer Übertragung auf andere Wetterlagen erforderlich? Warum sind kein Rauch sichtbar und keine sofortigen Beschwerden keine ausreichenden Ungefährlichkeitsbelege?",
        "promptEn": "Evaluate the genetic environmental hazard in this everyday situation and A/B/C against all criteria. Justify a recommendation, weighing the time disadvantage. Compare the supplied five-day exposure sums without calculating a disease probability. What further check is required for other weather conditions? Why do no visible smoke and no immediate symptoms not establish safety?",
        "solutionDe": "PAK-Metabolit→DNA-Schaden→mögliche bleibende Änderung stellt den genetischen Gefahrenbezug her, keine Gewissheit einer Mutation oder Krankheit. Fünf vorgegebene Tageszentralwerte ergeben A60, B10, C55 relative Einheiten; die Streuungsangaben sind keine persönlichen Risikowerte und werden ohne zusätzliche Fehlerannahme nicht zu einer neuen statistischen Genauigkeit zusammengefasst. B ist nach vorrangiger Belastungssenkung und gegebener sicherer Bus-Erreichbarkeit trotz sechs Minuten Zusatzweg begründet. C liefert mit überlappender Streuung und fehlender Filterwirkung keinen klaren Schutzbeleg gegenüber A. Die Empfehlung benennt Zeitaufwand und Priorität ausdrücklich. Für andere Wind-/Wetterlagen wären neue passende Expositionsmessungen und eine erneute Prüfung von Zugänglichkeit/Buszeiten erforderlich; allgemeine Schadstoffquellenverringerung wäre eine weitere strukturelle Option, deren Wirksamkeit diese Karte nicht misst. Sichtbarkeit und akute Beschwerden messen weder PAK-Exposition noch genetische Schäden zuverlässig. Kein individueller Krankheitswert, klinischer Grenzwert oder garantierte Expositionsfreiheit folgt aus dem Modell.",
        "solutionEn": "PAH metabolite→DNA damage→possible persistent alteration supplies the genetic-hazard link, without certain mutation or disease. Five supplied daily central values give A60, B10, C55 relative units; spreads are not personal-risk values and are not combined into a new statistical precision without added error assumptions. With exposure reduction prioritised and safe bus access supplied, B is justified despite six extra minutes walking. Overlapping spreads and absence of filtering evidence give no clear protection claim for C versus A. The recommendation states time cost and priority. Other wind/weather conditions require matching exposure measurements and rechecking accessibility/bus timings; source reduction is another structural option whose effectiveness this card does not measure. Visibility and immediate symptoms measure neither PAH exposure nor genetic damage reliably. The model yields no individual disease value, clinical limit or guaranteed zero exposure.",
        "positiveEssentialConditions": [
            "Link the named chemical environmental mutagenic hazard to supplied DNA damage and bounded fixation mechanism",
            "Evaluate all options with exposure, safe access, time cost and the explicit priority; justify rather than merely name a choice",
            "Correctly compare five-day central exposure sums60/10/55 without individual disease probabilities or unsupported error aggregation",
            "Use screening-versus-filtering evidence, measurement spread and missing weather evidence to state limits and a matching followup",
            "Reflect on the concrete daily situation without treating lack of visibility or symptoms as a genetic-safety proof",
        ],
        "sourceOperatorTargets": ["MV10 everyday mutagen-hazard reflection", "ST10/E-phase evaluating environmental genetic risks, stage binding still held"],
        "factualSourceKeys": ["UBA-benzoapyrene", "IARC-air-DNA"],
        "dataOrigin": "Fictional neighbourhood decision card and numerical exposures; actual agency/WHO-IARC factual hazard input separately bound",
        "claimLimit": "Material-based environmental judgement, no performed air experiment, personal forecast, legal limit, mastery, independent approval or whole-original closure",
    },
])

for c in components:
    c["status"] = "author_v5_candidate_pending_independent_targeted_followup_and_actual_native_binding"
    c["independentApproval"] = False
    c["wholeSourceClosure"] = False
    c["newAssignedGoalId"] = None
payload = {"schemaVersion":1,"createdAtUTC":NOW,"role":"author v5 remediation candidate; prior independent B author must not review its own output","supersedesAuthorInputSHA256":"89816e95a26d30ff82e900565ec164acb3427cb341129f86aaa154adce82419f","components":components,"boundedComponentCount":11,"completeBilingualCases":24,"newDecisionCases":2,"nullIDComponents":7,"newCanonicalIDsAssigned":0,"originalFourOperativeDEENDescriptionsChanged":False,"originalEightPCaseBodiesChanged":False,"nativeDRecords":0,"nativePApproval":False,"nativeAApproval":False,"nativeMApproval":False,"nativeVApproval":False,"wholeSourceClosure":False,"activeWrites":0,"independentApproval":False,"humanApproval":False,"humanTrial":False,"licensing":"Own goal/material/solution content CC-BY-4.0; source facts keep original rights; no relicense of retained primary sources"}
write("eleven-components-twentyfour-cases.author-candidate.json",payload)

def digest_obj(x):
    return sha(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(",",":")).encode())
original_components = original_main["components"] + original_mut["components"]
delta = []
for old,new in zip(original_components,components):
    old_tasks = {t.get("caseId",t.get("caseKey")):t for t in old["tasks"]}
    new_tasks = {t.get("caseId",t.get("caseKey")):t for t in new["tasks"]}
    changed = []
    for key,oldt in old_tasks.items():
        newt = new_tasks[key]
        if oldt != newt:
            changed.append({"caseId":key,"beforeSHA256CanonicalJSON":digest_obj(oldt),"afterSHA256CanonicalJSON":digest_obj(newt),"fieldsChanged":[k for k in set(oldt)|set(newt) if oldt.get(k)!=newt.get(k)]})
    delta.append({"candidateKey":old["candidateKey"],"canonicalGoalIdUnchanged":old["canonicalGoalId"]==new["canonicalGoalId"],"descriptionDEENChanged":old["description"]!=new["description"] or old["descriptionEn"]!=new["descriptionEn"],"originalCasesChanged":changed,"originalCasesExact":[k for k in old_tasks if old_tasks[k]==new_tasks[k]],"newCases":[k for k in new_tasks if k not in old_tasks],"otherTextAndScopeFieldsPreserved":all(old.get(k)==new.get(k) for k in old if k not in {"tasks","description","descriptionEn","status","independentApproval","wholeSourceClosure","newAssignedGoalId"})})
assert sum(len(r["originalCasesChanged"]) for r in delta)==2
assert sum(len(r["newCases"]) for r in delta)==2
assert sum(r["descriptionDEENChanged"] for r in delta)==1
assert all(r["canonicalGoalIdUnchanged"] and r["otherTextAndScopeFieldsPreserved"] for r in delta)
assert len([c for c in components if c["canonicalGoalId"] is None])==7
assert by_key["mutagen_causes_and_protection"]["tasks"][:2]==next(c for c in original_components if c["candidateKey"]=="mutagen_causes_and_protection")["tasks"]
canonical = json.loads(read(V4/"canonical-preserved.inert-envelope.json")["preservedCanonicalUTF8"])
prior_profiles = read(V4/"positive-four.native-candidate-records.json")["records"]
write("precise-v4-v5-delta-and-preservation.actual.json", {"createdAtUTC":NOW,"reviewedInputFreezes":freezes,"componentDeltas":delta,"unchangedCanonicalReference":str((V4/"canonical-preserved.inert-envelope.json").relative_to(ROOT)),"unchangedCanonicalSHA256":sha((V4/"canonical-preserved.inert-envelope.json").read_bytes()),"canonicalWholeGoalsRetained":len(canonical["goals"]),"canonicalObjectsWrittenByV5":0,"fourOperativeDescriptionsRetained":True,"priorProfileReference":str((V4/"positive-four.native-candidate-records.json").relative_to(ROOT)),"priorProfileSHA256":sha((V4/"positive-four.native-candidate-records.json").read_bytes()),"priorProfilesRetained":len(prior_profiles),"priorPCaseBodiesRetained":sum(len(r["profile"]["applicationCaseBriefs"]) for r in prior_profiles),"originalNewCasesRetainedExact":20,"originalNewCasesRevisedForExplicitModelConvention":2,"newDecisionCases":2,"allSevenNullIDPrototypesRetained":True,"newIDsAssigned":0,"oldSourcesAndMappingsMutated":False,"activeWrites":0,"currentM7NetIncrease":0,"humanApproval":False})

primary_specs = [
    ("MV", ROOT/"curricula/DE/Gymnasium/input/MV/Biologie_Gymnasium_Gesamtschule_7_10.pdf",30,30),
    ("ST", ROOT/"curricula/DE/Gymnasium/input/ST/FLP_Biologie_Gym_01082022_swd.pdf",42,43),
    ("HE", ROOT/"curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf",38,38),
]
primary=[]
for key,p,first,last in primary_specs:
    raw=subprocess.check_output(["pdftotext","-layout","-f",str(first),"-l",str(last),str(p),"-"])
    tp=TMP/f"primary-{key}-physical{first}-{last}.txt";tp.write_bytes(raw)
    primary.append({"sourceKey":key,"actualOriginalPath":str(p.relative_to(ROOT)),"sha256":sha(p.read_bytes()),"physicalPages":[first,last],"independentlyExtractedActualTextPath":str(tp.relative_to(ROOT)),"extractionSHA256":sha(raw)})
urls={
    "BfS-UV-protection":"https://multimedia.gsb.bund.de/BFS/BFS/Animation/uv/",
    "BfS-UV-DNA":"https://doris.bfs.de/jspui/bitstream/urn%3Anbn%3Ade%3A0221-2020062522246/4/BfS_2020_3619S72403.pdf",
    "UBA-benzoapyrene":"https://www.umweltbundesamt.de/themen/luft/luftschadstoffe-im-ueberblick/benzoapyren-im-feinstaub",
    "IARC-air-DNA":"https://www.iarc.who.int/wp-content/uploads/2018/07/161-Chapter12.pdf",
}
for key,url in urls.items():
    req=urllib.request.Request(url,headers={"User-Agent":"SkillPilot-curriculum-author-source-check/1.0"})
    with urllib.request.urlopen(req,timeout=40) as r:
        raw=r.read();status=r.status;final=r.url
    ext="pdf" if raw.startswith(b"%PDF") else "html"
    tp=TMP/f"{key}.actual.{ext}";tp.write_bytes(raw)
    item={"sourceKey":key,"actualURL":url,"finalURL":final,"httpStatus":status,"retrievedAtUTC":datetime.datetime.now(datetime.timezone.utc).isoformat(),"actualRawPath":str(tp.relative_to(ROOT)),"sha256":sha(raw),"bytes":len(raw),"sourceUse":"Qualitative factual basis only; new numbers and decision context are fictional, not copied empirical measurements"}
    if ext=="pdf":
        text=subprocess.check_output(["pdftotext","-layout",str(tp),"-"])
        textp=tp.with_suffix(".txt");textp.write_bytes(text)
        item.update({"actualExtractedTextPath":str(textp.relative_to(ROOT)),"extractedTextSHA256":sha(text)})
    primary.append(item)
write("actual-primary-curricular-and-factual-inputs.author.json", {"createdAtUTC":NOW,"sources":primary,"originalOperatorClauses":{"MV":"Gefahrenpotenzial von Mutagenen im alltäglichen Leben reflektieren","ST":"Umwelteinflüsse unter dem Aspekt der genetischen Risiken bewerten"},"STStageActualClause":"Schuljahrgang 10 (Einführungsphase)","STStageNativeCorrectionProven":False,"nativeWholeSourceStageDefaultsChanged":False,"activeWrites":0,"wholeOriginalClearance":False,"independentFollowupPending":True})
print(json.dumps({"components":11,"cases":24,"exactOriginalCases":20,"revisedOriginalCases":2,"newDecisionCases":2,"nullIDs":7,"primaryRefs":len(primary),"selfApproval":False}))
