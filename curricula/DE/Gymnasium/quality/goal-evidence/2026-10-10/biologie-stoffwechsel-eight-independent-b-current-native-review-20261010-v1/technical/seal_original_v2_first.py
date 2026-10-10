"""Record root's actual original-v2 reading; never infer science from hashes."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
BASE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10"
OWN = Path(__file__).resolve().parents[1]
NATIVE = BASE / "biologie-stoffwechsel-eight-current-raster-native-technical-preparation-20261010-v2"


def bind(path):
    path = Path(path)
    if not path.is_absolute():
        path = ROOT / path
    raw = path.read_bytes()
    return {"path": str(path.relative_to(ROOT)), "sha256": "sha256:" + hashlib.sha256(raw).hexdigest(), "bytes": len(raw)}


def write_once(path, value):
    with path.open("x") as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + "\n")


entry = json.loads((NATIVE / "neutral-current-native-eight.entry.json").read_text())
science = json.loads((ROOT / entry["coreInputs"]["wholeScience8Cases16"]["path"]).read_text())
notes = {
    "1c3470ae-83f8-52e9-98ae-b0a712755b66": (
        "Zwiebel-Speichergewebe und Elodea unterscheiden sich tatsächlich: keine Chloroplastenbehauptung für die Zwiebel. Zellwand und nicht separat aufgelöste Membran bleiben getrennt. Die Maßstabsrechnungen 500/5=100 und 180/3=60 µm stimmen. Beobachtung, Organellendeutung und Präparationsgrenze werden in beiden Fällen und Transfers getrennt.",
        "Die lernende Person kann Gewebe über tatsächliche Zellmerkmale und einen kalibrierten Maßstab vergleichen, ohne Unsichtbarkeit mit Abwesenheit gleichzusetzen.",
        "The learner compares tissue using observed cellular features and a calibrated scale without equating invisibility with absence.",
        "Zwei Präparate und zwei neue Maßstabs-/Beobachtungssituationen verlangen begründete Deutung; Rubriken bewerten Zuordnung und Grenzen.",
        "The two preparations and new scale/observation situations require reasoned interpretation; rubrics assess classification and limits.",
        "Original/360/680: klare Zellwände und Kerne, grüne Blattchloroplasten, passend aufgebautes Mikroskop. Ganze HTML/PDF-Seiten zeigen den vollständigen aktuellen DE/EN-Text und externe Mikroskopie-Voraussetzung. KEEP."
    ),
    "2c60c8ad-04d3-5395-8a27-400646eb1612": (
        "Die 3,6-kg-Stoffbilanz ist von der Energiebilanz getrennt. 9000=8500+500 kJ und 8000-7800-200=0 stimmen; 8000-10000=-2000 kJ bedeutet Reserveabbau. Sauerstoff und Wasser sind keine Nahrungsenergie. Aufbau, Bewegung und Ruhe werden mit unterschiedlichen Flüssen geprüft, ohne Ernährungsempfehlungen.",
        "Offene Systeme tauschen Stoffe und Energie aus; Masseerhaltung und zeitliche Reserveänderung erklären verschiedene Bilanzen.",
        "Open systems exchange matter and energy; mass conservation and changes in reserves explain different balances.",
        "Die Lernenden trennen Ein-/Ausgänge, berechnen Bilanzen und begründen einen neuen Bewegungs-/Wachstumsfall.",
        "Learners distinguish inputs and outputs, calculate balances and justify a new movement or growth situation.",
        "Original/360/680: Essen/Wasser/O₂ hinein, CO₂/Wasser/Abfall/Wärme hinaus sind eindeutig. Ganze HTML/PDF-Seiten enthalten vollständige Beschreibungen, Ernährungs-Voraussetzung und Nachfolger; keine abgeschnittenen Inhalte. KEEP."
    ),
    "e467ee54-7773-595f-ac1c-a60a5b7be2cf": (
        "Planung isoliert Temperatur beziehungsweise pH mit gleichen Volumina, Substrat-/Enzymmengen, Zeiten, Wiederholungen und Leerproben. Raten 0,05/0,15/0,01 ml/s und 1,3/3,1/1,9 ml je 30 s sind richtig. Wiedererwärmung, Verdünnung und Farbstoff-Leerprobe unterscheiden reversible Wirkung von Störung. Kein behaupteter tatsächlicher Versuch; Lehreraufsicht, 1% H₂O₂ und freie Gasableitung sind begrenzt.",
        "Kontrollierte Variablen und geeignete Messung erlauben eine begrenzte Aussage über äußere Einflüsse auf Enzymaktivität.",
        "Controlled variables and suitable measurements support a bounded claim about external influences on enzyme activity.",
        "Die Lernenden entwickeln Vergleich und Kontrollen, deuten Wiederholungen und planen einen unabhängigen pH-/Temperaturtransfer.",
        "Learners design comparisons and controls, interpret repeats and plan an independent pH or temperature transfer.",
        "Original/360/680 und ganze HTML/PDF: gleiche Röhrchen und Temperaturgruppen lesbar. Das Heft ist jedoch zur Kamera statt zur links dahinter handelnden Planerin ausgerichtet. Konkreter V-Befund B-V-01, REVISE; D/P-Inhalte bleiben tragfähig."
    ),
    "cdd2247b-0ac6-5457-a5b9-26c6d0139906": (
        "Die Hemmung greift am ersten Enzym über eine getrennte Bindungsstelle an, nicht als Mengenänderung oder zielgerichtete Entscheidung. 100→25 ist 75% Verminderung; Wiederherstellung 98 und resistente Variante 100/99/101 stützen den begrenzten Regelkreis. X 80→20→80 und Y 80→32 trennen Aktivität von Menge; nachgeschaltete Blockade wird nicht mit dem Erstschritt gleichgesetzt.",
        "Endproduktbindung an einer getrennten Stelle kann die Aktivität des ersten Enzyms rückwirkend und reversibel verändern.",
        "End-product binding at a separate site can reversibly change the activity of the first enzyme through feedback.",
        "Die Lernenden erklären Rückkopplung aus Vergleichsdaten und beurteilen Resistenz-/Blockadevarianten ohne teleologische Erklärung.",
        "Learners explain feedback from comparison data and evaluate resistant or blocked variants without teleological reasoning.",
        "Original/360/680: grüner Vorwärtspfad, rote Rückkopplung zur getrennten Seitenstelle und Pausensymbol sind klar. Symbole behaupten keine Stoichiometrie. Ganze native Seiten mit Enzym-Voraussetzung vollständig. KEEP."
    ),
    "8e2244e1-8616-5f24-859f-8e10df1c887b": (
        "NAD⁺-Regeneration und die Netto-2-ATP aus Glykolyse sind korrekt von Gärungsendreaktionen getrennt. Homolaktat erzeugt hier kein CO₂; alternative Gärungen werden nicht ausgeschlossen. Fall c2 ist quantitativ kohärent (Lactat/Glucose ungefähr 2:1) und trennt pH von Stoffnachweis. Fall c1 ist dagegen in seiner vorliegenden 20-ml-Lösungsbasis mit 7,6/8,0/8,4 mmol/L Ethanol und 36/38/40 ml CO₂ nicht hinreichend vereinbar: 0,16 mmol Ethanol ergeben modellhaft ungefähr 4 ml Gas, nicht 38 ml. Keine bloße Einheiten-/Hashkorrektur genügt. B-P-01 hält P offen.",
        "Alkoholische und homolaktische Gärung regenerieren NAD⁺; Stoffnachweise, Kontrollen und Stoffmengen begrenzen die Aussage.",
        "Alcoholic and homolactic fermentation regenerate NAD⁺; analyte tests, controls and quantities bound the conclusion.",
        "Beide ganzen Versuchspläne verlangen kontrollierte Nachweise und frischen Transfer; der alkoholische Datensatz muss vor positiver P-Ausweisung korrigiert werden.",
        "Both complete plans require controlled evidence and fresh transfer; the alcoholic data must be corrected before a positive P verdict.",
        "Original/360/680 und ganze native Seiten: CO₂ nur beim Hefe-Zweig, pH beim Lebensmittel-Zweig; keine homolaktische Gasbehauptung, kein Probieren. LK/Q3 und Gewicht 1,1 bleiben korrekt erhalten. V KEEP; P HOLD."
    ),
    "db9f83a4-90b0-5601-a734-46b40a1cf0e4": (
        "Elementbilanzen der aeroben und homolaktischen Wege stimmen. 30/32 ATP sind ausdrücklich Modelle, keine universelle Ausbeute. 60 ATP erfordern 2 beziehungsweise 30 Glucose; 64 erfordern 2 beziehungsweise 32. Mischung 4 aerob+6 homolaktisch ergibt 132 ATP, 24 O₂, 24 CO₂, 12 Lactat. O₂-Präsenz allein erzwingt keine Atmung; Entkopplung reduziert ATP trotz O₂-Verbrauch.",
        "Stoff- und Energieausbeuten verschiedener Glucosewege hängen vom festgelegten Modell und zellulären Bedingungen ab.",
        "Matter and energy yields of glucose pathways depend on the stated model and cellular conditions.",
        "Die Lernenden bilanzieren gemischte Wege und übertragen auf geänderte ATP-Ausbeute beziehungsweise Entkopplung.",
        "Learners balance mixed pathways and transfer reasoning to changed ATP yields or uncoupling.",
        "Original/360/680: mitochondriale Atmung und cytosolische Lactatbildung sinnvoll kontrastiert. Die Energiesymbole sind ausdrücklich keine ATP-Zahlen (aktueller Alttext). Ganze HTML/PDF-Texte und interne Gärungs-Voraussetzung vollständig. KEEP."
    ),
    "e25ad42f-8314-5ee7-9440-765ee18773f9": (
        "Pro-Gramm- und Pro-Mol-Vergleich bleiben getrennt: 37/17≈2,18; 106/256≈0,414 gegen 30/180≈0,167 mol ATP/g. C₁₆H₃₂O₂+23 O₂→16 CO₂+16 H₂O ist ausgeglichen. 106=7×2,5+7×1,5+8×10−2 berücksichtigt Aktivierung. Neuer Modelltransfer 83=14+7+64−2 ist kohärent. Nasses Glykogen 1700/400=4,25 kJ/g wird begrenzt mit Fett verglichen, nicht als exakte universelle TAG-Zahl behauptet.",
        "Hohe Reduktion und geringe Wasserbindung erklären Fett als Speicher; gleiche Bezugsgrößen und Modellgrenzen sind nötig.",
        "Greater reduction and lower water association explain fat storage; comparisons require equal reference quantities and model limits.",
        "Die Lernenden vergleichen Energiedichten, prüfen eine Oxidationsbilanz und rechnen mit geänderten ATP- und Wasserannahmen.",
        "Learners compare energy densities, check an oxidation balance and calculate changed ATP and water assumptions.",
        "Original/360/680: gleiche 1-g-Portionen, 17/37 kJ gut lesbar. Balken sind laut Alttext qualitativ. Ganze native Seiten inklusive Glucose-Voraussetzung/Terminalnachfolger vollständig. KEEP."
    ),
    "39ba4385-0144-5e20-ba11-e3714756583b": (
        "Wachstum 100→400→1600 versus 100→110→120 ergibt 16- beziehungsweise 1,2-fach. Kühlung hemmt, sterilisiert nicht. Modellmarker 100→Brett35→Lebensmittel12 und nach Reinigung1 bei Leerprobe0 zeigen Übertragung; Hand9 ist ein unabhängiger Weg. Verderb, Geruch und Pathogennachweis sind getrennt. Keine unbekannten Kulturen oder Kostproben; kein klinischer oder tatsächlicher Versuchsnachweis.",
        "Kühlung, Trennung und Reinigung mindern unterschiedliche Wachstums-/Übertragungsrisiken, ohne Sterilität zu garantieren.",
        "Cooling, separation and cleaning reduce different growth or transfer risks without guaranteeing sterility.",
        "Die Lernenden erklären Kontrollen und wählen für einen neuen Übertragungsweg eine begründete Hygienemaßnahme.",
        "Learners explain controls and select a justified hygiene measure for a new transfer route.",
        "Original/360/680: Hauptmotiv und Überschriften Kühlen/Trennen/Reinigen erkennbar; keine notwendige Kleinschrift oder Sterilitätsbehauptung. Ganze native Seiten zeigen beide Sprachen und Biotechnologie-/Konservierungsbeziehungen. KEEP."
    ),
}

bindings = [bind(NATIVE / "neutral-current-native-eight.entry.json")]
bindings += list(entry["coreInputs"].values())
for views in entry["actualCurrentRastersAndNativeCaptures"].values():
    bindings += list(views.values())
for binding in bindings:
    assert bind(binding["path"]) == binding, binding

records = []
for record in science["records"]:
    gid = record["goalId"]
    science_note, understanding_de, understanding_en, performance_de, performance_en, visual_note = notes[gid]
    records.append({
        "goalId": gid,
        "caseIds": [case["id"] for case in record["cases"]],
        "wholeDEENGoalProfileAndBothCaseBodiesActuallyRead": True,
        "Ddecision": "KEEP",
        "Pdecision": "HOLD" if gid.startswith("8e2244e1") else "KEEP",
        "Vdecision": "REVISE" if gid.startswith("e467ee54") else "KEEP",
        "nativeRenderDecision": "KEEP",
        "actualScienceFindingsDe": science_note,
        "essentialUnderstandingDe": understanding_de,
        "essentialUnderstandingEn": understanding_en,
        "observablePerformanceAndTransferDe": performance_de,
        "observablePerformanceAndTransferEn": performance_en,
        "actualRasterAndNativeFindingsDe": visual_note,
        "actualViews": entry["actualCurrentRastersAndNativeCaptures"][gid],
        "openFindings": (["B-V-01"] if gid.startswith("e467ee54") else []) + (["B-P-01"] if gid.startswith("8e2244e1") else []),
    })

output = OWN / "FIRST.original-v2.actual-independent-b.json"
write_once(output, {
    "schemaVersion": 1,
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "role": "Independent substantive B first review of original current-native v2; subsequent remediation not yet reviewed",
    "reviewer": "Codex /root; neither author of eight profiles/sixteen cases nor original rasters nor technical native preparation",
    "independenceDisclosureDe": "Eigene ganze Rohwissenschafts-/Bild-/Seitenprüfung erfolgte vor Kenntnis der A-Zusammenfassung. Vor dieser schriftlichen Versiegelung sind A's gleichlautende zwei Befunde und der laufende Korrekturauftrag bekannt. Keine fortbestehende Blindheit behauptet. Kein korrigierter Fall oder korrigiertes Bild ist hier fachlich freigegeben.",
    "wholeCurrentDEENGoalsRead": 8,
    "wholeProfilesRead": 8,
    "wholeDEENMaterialsTasksSolutionsRubricsFreshTransferSolutionsLimitsRead": 16,
    "actualOriginalRasterViews": 8,
    "actualProportional360Views": 8,
    "actualProportional680Views": 8,
    "actualWholeHTMLPageViews": 8,
    "actualWholePDFPageViews": 8,
    "wholeCurrentNativeCanonicalAndPageContextsRead": 8,
    "wholeSourceWitnessBodiesRead": 50,
    "legacyNullPassagesRetained": 25,
    "sourceScopeDecisionDe": "Bestehende ganze Quellenobjekte, Betreiber, Kursstufe und Locatoren gelesen; 25 fehlende historische Passagen bleiben NULL. Keine neue Primärquellen-, Kurs-, Rechte- oder Humanfreigabe aus diesem Review.",
    "exactCurrentBindingsVerified": bindings,
    "records": records,
    "findings": [
        {"id": "B-V-01", "goalId": "e467ee54-7773-595f-ac1c-a60a5b7be2cf", "status": "open", "gate": "V", "requiredCorrectionDe": "Heft richtig zur handelnden Planerin ausrichten oder aus Bild entfernen; tatsächliches neues PNG sowie 360/680/native Ansichten prüfen."},
        {"id": "B-P-01", "goalId": "8e2244e1-8616-5f24-859f-8e10df1c887b", "status": "open", "gate": "P", "requiredCorrectionDe": "Stoffmengen, Flüssigkeitsvolumen und Gasbedingungen des vollständigen c1-Datensatzes einschließlich Kontrollen/Transfers/Lösungen konsistent ausweisen und tatsächlich nachrechnen."},
    ],
    "sixUnaffectedGoalsSubstantivelyPassed": 6,
    "normalCampaignRecords": "Pending current correction/native v3; no completed D/P/V intersection is inferred from this standalone first record",
    "evidenceLevel": "E1",
    "maximumClaimScope": "G1",
    "status": "ai_candidate",
    "reviewAuthority": "needs_human_review",
    "humanApproval": False,
    "humanTrial": False,
    "learnerWork": False,
    "activeWrites": False,
    "historicalWrites": False,
    "newStrictCompletions": 0,
    "restoredActiveBindings": 0,
    "strictNetGain": 0,
})
write_once(OWN / "FIRST.original-v2.seal.json", {
    "schemaVersion": 1,
    "role": "Append-only independent B original-v2 FIRST seal; corrections need separate subsequent records",
    "createdAt": datetime.now(timezone.utc).isoformat(),
    "bindings": [bind(output), bind(__file__)],
    "inputBindings": bindings,
    "hashVerificationIsScientificReview": False,
    "humanApproval": False,
    "activeWrites": False,
    "strictNetGain": 0,
})
print(json.dumps({"first": bind(output), "seal": bind(OWN / "FIRST.original-v2.seal.json"), "reviewedGoals": len(records), "openFindings": 2, "activeGain": 0}))
