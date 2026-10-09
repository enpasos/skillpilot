# SPDX-License-Identifier: Apache-2.0
"""Prepare unfinished, inactive, bilingual corrosion material continuation."""
from pathlib import Path
import json

R = Path.cwd()
D = Path(__file__).resolve().parent
P = D.relative_to(R).as_posix()


def put(name, value):
    out = D / name
    out.parent.mkdir(parents=True, exist_ok=True)
    assert not out.exists(), out
    out.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


protocol = {
    'id': 'corrosion-contact-ironII-hydroxide-practical-protocol-started-v1',
    'status': 'author_checkpoint_incomplete_not_independently_reviewed',
    'actualLearnerPerformance': False,
    'actualLaboratoryTrial': False,
    'protocolTitleDe': 'Eisen-Kupfer-Kontakt untersuchen und getrennte Eisen(II)- und pH-Nachweise durchführen',
    'protocolTitleEn': 'Investigate iron–copper contact and perform separate iron(II) and pH tests',
    'materialAndEquipmentDe': [
        'Für einen Ansatz zwei 50-mL-Bechergläser mit je 20,0 mL derselben luftgesättigten 1,0-%-NaCl-Lösung; Raumtemperatur, keine zugesetzte Säure oder Base.',
        'Gereinigtes Eisen- und Kupferblech mit jeweils gleicher dokumentierter eingetauchter Fläche; isoliertes Verbindungskabel mit Klemmen; NaCl-getränkter Filterpapierstreifen als Ionenbrücke.',
        'Ein gleich aufgebauter offener Vergleich ohne metallische Kabelverbindung; für beide Bedingungen je eine unabhängig neu angesetzte Wiederholung.',
        'Kalibrierbares pH-Messgerät mit geeigneter kleiner Elektrode, pH-7/pH-10-Kalibrierlösungen, getrennte saubere Pipetten und beschriftete Tüpfelmulden.',
        'Lehrkraftbereitgestelltes 0,001-mol/L-Kaliumhexacyanidoferrat(III)-Reagenz und frisch bereitgestellte wässrige 0,001-mol/L-Eisen(II)-sulfat-Kontrolle; Reagenzleerprobe mit derselben NaCl-Lösung.'
    ],
    'materialAndEquipmentEn': [
        'For one setup, two 50-mL beakers, each with 20.0 mL of the same air-saturated 1.0% NaCl solution at room temperature; no added acid or base.',
        'Clean iron and copper strips with equal recorded immersed areas; insulated connecting lead and clips; a NaCl-wetted filter-paper strip as the ionic bridge.',
        'An otherwise identical open comparison without a metallic lead connection; one independently prepared repeat for each condition.',
        'A calibratable pH meter with a suitable small electrode, pH-7/pH-10 calibration solutions, separate clean pipettes and labelled spotting wells.',
        'Teacher-supplied 0.001 mol/L potassium hexacyanidoferrate(III) reagent and freshly supplied aqueous 0.001 mol/L iron(II) sulfate control; a reagent blank using the same NaCl solution.'
    ],
    'safetyAndLimitsDe': [
        'Nur im ausgestatteten Chemieunterricht mit örtlich geprüfter Gefährdungsbeurteilung, geeigneter Aufsicht und Schutzbrille durchführen. Dieses Autorenmaterial ist keine praktische Erprobung oder Freigabe.',
        'Hexacyanidoferratproben niemals ansäuern, erhitzen oder mit sauren Abfällen mischen. Reagenzien werden verdünnt bereitgestellt; die Lernenden stellen keine konzentrierten Vorräte her.',
        'Nur Bleche verwenden, keine Metallpulver und keine scharfkantigen unbehandelten Stücke. Kabel bleibt eine passive Metallverbindung: kein externes Netzgerät.',
        'Reagenzproben werden außerhalb der Korrosionszelle getestet und nicht zurückgegossen. Metall-/Hexacyanidoferratabfälle getrennt gemäß schulischer Entsorgungsregel sammeln; kein Abfluss.',
        'Ohne geeignete Ausrüstung, geprüfte Kontrollen oder örtliche Durchführungsmöglichkeit bleibt der praktische Nachweis offen. Eine Textauswertung ersetzt keine beobachtete Durchführung.'
    ],
    'safetyAndLimitsEn': [
        'Perform only in an equipped school chemistry laboratory under a locally checked risk assessment, appropriate supervision and eye protection. This author material is not a practical trial or approval.',
        'Never acidify or heat hexacyanidoferrate samples or mix them with acidic waste. Reagents are supplied dilute; learners do not prepare concentrated stocks.',
        'Use metal strips, not powders or untreated sharp pieces. The lead is only a passive metallic connection: no external power supply.',
        'Test reagent aliquots outside the corrosion cell and do not return them. Collect metal/hexacyanidoferrate waste separately under the school disposal procedure; do not pour down the drain.',
        'Without suitable equipment, valid controls or a locally available practical setting, execution evidence remains open. Written evaluation does not replace observed execution.'
    ],
    'procedureDe': [
        'Formuliere aus dem Alltagsphänomen beschädigter Metallkontakte eine prüfbare Frage und eine begründete Hypothese zum Einfluss der elektrischen Verbindung. Trenne Vorhersage und noch unbekannte Beobachtung.',
        'Lege die Kabelverbindung als einzige veränderte Bedingung fest. Dokumentiere Metallflächen, Temperatur, Ausgangs-pH, Lösungschargen, Brücke, Abstände und zwei Wiederholungen; halte sie in beiden Bedingungen gleich.',
        'Kalibriere das pH-Messgerät mit getrennten Standards. Prüfe zuerst Leerprobe und positive Eisen(II)-Kontrolle: 1,0 mL Probe mit einem Tropfen Hexacyanidoferratreagenz in einer eigenen Mulde. Dokumentiere die beobachteten Farben. Fehlt die erwartete Kontrollreaktion, ist der zugehörige Fe²⁺-Test ungültig.',
        'Stelle beide Metall-Lösung-Systeme mit Ionenbrücke auf. Verbinde nur im Prüfaufbau die Metalle mit dem Kabel; starte die Zeitnahme. Fotografiere oder zeichne die Anordnung und sichere die eindeutigen Proben-IDs.',
        'Miss den pH unmittelbar vor dem Start sowie nach 10 und 20 Minuten nahe dem Kupferblech. Verwende definierte gleiche Abstände und Zeiten; spüle die Elektrode zwischen Proben. Verrühre die Lösungen nicht vor der lokalen Messung.',
        'Entnimm nach 20 Minuten aus jedem Eisenbereich eine eigene 1,0-mL-Teilprobe. Führe den gleichen getrennten Fe²⁺-Test aus. Verwende neue Pipetten oder dokumentierte saubere Pipetten; halte Fe- und Cu-Proben getrennt.',
        'Wiederhole mit frischen Ansätzen und gleichen Flächen. Protokolliere tatsächliche Rohbeobachtungen, pH, Zeit, auffällige Abweichungen und Kontrollstatus; trage keine erwartete Farbe als gemessene Beobachtung ein.',
        'Vergleiche verbundene und offene Aufbauten. Deute einen gültigen blauen Eisen(II)-Nachweis und eine gegenüber Ausgangslösung/Leervergleich erhöhte lokale Alkalität mit Eisenoxidation und Sauerstoffreduktion. Formuliere die Teilgleichungen.',
        'Gib die Grenzen an: pH zeigt das Säure-Base-Verhältnis, aber keine vollständige unbekannte Stoffzusammensetzung; ein qualitativer blauer Test bestimmt keine Fe²⁺-Stoffmenge. Ein negativer Test beweist ohne passende Empfindlichkeit nicht die Abwesenheit jeder Korrosion.',
        'Reinige den Arbeitsplatz und entsorge die Proben getrennt. Die Lehrkraft bzw. beobachtende Person dokumentiert die tatsächliche Durchführung separat von einer hypothetischen Auswertung.'
    ],
    'procedureEn': [
        'From the everyday phenomenon of damaged metal contacts formulate a testable question and a justified hypothesis about electrical connection. Distinguish a prediction from observations not yet known.',
        'Make the metallic connection the only varied condition. Record metal areas, temperature, starting pH, solution batches, bridge, spacing and two repeats; keep them matched between conditions.',
        'Calibrate the pH meter with separate standards. First check a blank and a positive iron(II) control: mix 1.0 mL of sample with one drop of hexacyanidoferrate reagent in its own well. Record the observed colours. If the positive control fails, the associated Fe²⁺ test is invalid.',
        'Set up both metal–solution systems with ionic bridges. Connect the metals with the lead only in the test setup and start timing. Photograph or draw the arrangement and maintain unambiguous sample IDs.',
        'Measure pH just before starting and after 10 and 20 minutes near the copper strip. Use the same defined distances and times and rinse the electrode between samples. Do not stir before local measurements.',
        'After 20 minutes take a separate 1.0-mL aliquot from each iron region. Perform the same separate Fe²⁺ test. Use fresh or demonstrably clean pipettes and keep iron and copper portions separate.',
        'Repeat with fresh setups and matched areas. Record genuine raw observations, pH, times, unusual deviations and control status; never enter an expected colour as a measured observation.',
        'Compare connected and open arrangements. Interpret a valid blue iron(II) result and locally increased alkalinity relative to the starting solution/blank using iron oxidation and oxygen reduction. Write the half-equations.',
        'State the limits: pH indicates acid–base balance, not complete unknown composition; a qualitative blue result determines no amount of Fe²⁺. A negative test does not establish absence of all corrosion without appropriate sensitivity.',
        'Clean the workstation and collect waste separately. The teacher or observer records genuine execution separately from a hypothetical evaluation.'
    ],
    'expectedInterpretationDe': 'Im zugrunde gelegten neutralen, sauerstoffhaltigen System: Fe → Fe²⁺ + 2 e⁻ am anodischen Eisen; O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻ am kathodischen Bereich. Elektronen gelangen über die Metallverbindung zum Kupfer, die Ionenbrücke erhält den Ladungsausgleich. Ein geeigneter Fe²⁺-Nachweis unterstützt Eisenauflösung; die lokale pH-Zunahme ist mit OH⁻-Bildung vereinbar. Einzelne Farbsignale sind keine Mengenanalyse. Offenes Eisen kann weiterhin ohne externe Kupferverbindung korrodieren; der offene Vergleich ist kein erwarteter absoluter Nullumsatz. Beobachtete Null-/Abweichungsbefunde werden nicht überschrieben.',
    'expectedInterpretationEn': 'In the specified neutral, oxygen-containing system: Fe → Fe²⁺ + 2 e⁻ at anodic iron; O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻ at the cathodic region. Electrons reach copper through the metallic connection and the ionic bridge maintains charge balance. A suitable Fe²⁺ result supports iron dissolution; increased local pH is consistent with OH⁻ formation. Individual colour signals are not quantitative analysis. Open iron can still corrode without an external copper connection; the open comparison is not an expected absolute zero conversion. Genuine null or contrary results must not be overwritten.',
    'freshTransferDe': 'Ein frischer Ansatz verwendet dieselben Metalle, aber zwischen ihnen fehlt die Ionenbrücke. Begründe, warum dies nicht die ursprünglich isolierte Kabelvariable prüft. Entwirf einen passenden neuen Vergleich, ohne aus ausbleibender Farbe universelle Korrosionsfreiheit abzuleiten.',
    'freshTransferEn': 'A fresh setup uses the same metals but lacks the ionic bridge. Explain why this no longer tests the originally isolated metallic-connection variable. Design a matched new comparison without inferring universal freedom from corrosion from an absent colour.',
    'remainingActualMaterialDuties': [
        'Second genuinely changed practical corrosion/protection case is not prepared in this checkpoint.',
        'NI protection experiment needs an actual complete passive/active comparison, not this theoretical contact explanation.',
        'SN temperature/concentration/catalyst investigation requires its own actual complete kinetic material; not supplied here.',
        'Source-specific whole-owner/companion assignment and normal whole P bindings require independent follow-up.',
        'No laboratory execution, validated detection sensitivity, native D review or human approval is established.'
    ]
}

named = [
    {
        'id': 'corrosion-named-tin-versus-zinc-context-checkpoint-a',
        'goalId': '0908b3a2-9937-57de-8bfb-35a6de54aa1f',
        'sourceDutyOrdinals': [15],
        'taskDemandDe': 'Zwei beschichtete Stahlstücke liegen in demselben neutralen, sauerstoffhaltigen Wasser bei Raumtemperatur. A besitzt eine Zinn-, B eine Zinkschicht. Zunächst sind beide Schichten intakt; danach legt ein schmaler Kratzer dieselbe kleine Eisenfläche frei. Die übrigen Metallschichten sind weiterhin elektrisch mit dem Eisen verbunden. Für dieses vereinfachte Vergleichsmodell sind störende Passivierung und weitere Reaktionen ausgeschlossen; die elektrochemische Reihenfolge lautet Zn unedler als Fe unedler als Sn. Erkläre jeweils den intakten und den beschädigten Zustand, Elektronen- und Ionenweg und die Teilgleichungen. Erkläre, warum Zinn nicht als Opferanode für Eisen wirkt und Zinkschutz endlich bleibt. Diese Aufgabe verlangt Erklärung, keine tatsächliche Laborarbeit.',
        'taskDemandEn': 'Two coated steel pieces are in the same neutral oxygen-containing water at room temperature. A has a tin coating and B a zinc coating. Both coatings are initially intact; a narrow scratch then exposes the same small area of iron. The remaining coatings retain electrical contact with iron. This simplified comparison excludes interfering passivation and additional reactions; the electrochemical order is Zn less noble than Fe less noble than Sn. Explain intact and damaged states, electron and ion paths and the half-equations. Explain why tin is not a sacrificial anode for iron and why zinc protection is finite. This task requires explanation, not laboratory execution.',
        'expectedPerformanceDe': 'Beide intakten Schichten können zunächst den Zutritt von Wasser/Sauerstoff zum Stahl begrenzen. Im gegebenen Defektmodell wird Fe im Fe/Sn-Paar anodisch oxidiert: Fe → Fe²⁺ + 2 e⁻. Elektronen gelangen zum edleren Zinn; dort ist Sauerstoffreduktion O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻ möglich. Zinn ist keine Opferanode für Eisen; die Kopplung kann die lokale Eisenauflösung verstärken. Im Fe/Zn-Paar liefert die Zinkoxidation Zn → Zn²⁺ + 2 e⁻ Elektronen und hält Eisen kathodisch; die Sauerstoffreduktion erfolgt an kathodischen Oberflächen. Der Elektrolyt trägt Ionen, nicht die metallischen Elektronen. Der Schutz reicht nur bei geeigneter elektrischer/ionischer Verbindung, hinreichend vorhandenem Zink und passenden Umgebungsbedingungen. Keine universelle Rate oder unbegrenzte Lebensdauer wird aus der vorgegebenen Reihenfolge bestimmt.',
        'expectedPerformanceEn': 'Both intact coatings can initially limit water/oxygen reaching steel. In the stated defect model Fe is anodically oxidised in the Fe/Sn pair: Fe → Fe²⁺ + 2 e⁻. Electrons reach the more noble tin, where oxygen reduction O₂ + 2 H₂O + 4 e⁻ → 4 OH⁻ can occur. Tin is not a sacrificial anode for iron; coupling can intensify local iron dissolution. In the Fe/Zn pair, zinc oxidation Zn → Zn²⁺ + 2 e⁻ supplies electrons and holds iron cathodic; oxygen reduction occurs at cathodic surfaces. The electrolyte carries ions, not metallic electrons. Protection requires suitable electrical/ionic connection, sufficient remaining zinc and suitable environmental conditions. The supplied order establishes neither a universal rate nor unlimited lifetime.',
        'understandingFocusDe': 'Die benannten Materialien Zinn und Zink besitzen im angegebenen Kontaktmodell unterschiedliche Opferanodenrollen; intakte Barrierewirkung ist davon getrennt.',
        'understandingFocusEn': 'The named tin and zinc coatings have different sacrificial-anode roles in the stated contact model; intact barrier protection is distinct.',
        'freshTransferDe': 'Im neuen Zinkfall trennt eine isolierende Unterlage sämtliche elektrische Verbindung zwischen verbleibendem Zink und freigelegtem Eisen. Begründe, warum die frühere Opferwirkung am Defekt daraus nicht folgt; unterscheide dies von noch vorhandener Barrierewirkung an unbeschädigten Stellen.',
        'freshTransferEn': 'In a fresh zinc case an insulating layer removes all electrical connection between remaining zinc and exposed iron. Explain why the previous sacrificial action at the defect no longer follows, distinguishing it from remaining barrier protection at intact locations.',
        'freshExpectedPerformanceDe': 'Ohne Elektronenweg vom Zink zum freigelegten Eisen ist dessen kathodische Opferanodenprotektion in diesem Modell nicht gesichert. Eine intakte Beschichtung kann anderswo weiterhin als Barriere wirken; daraus folgt keine allgemeine Korrosionsfreiheit.',
        'freshExpectedPerformanceEn': 'Without an electron path from zinc to exposed iron, cathodic sacrificial protection of that iron is not secured in this model. Intact coating elsewhere can still act as a barrier; this does not imply general absence of corrosion.'
    },
    {
        'id': 'corrosion-named-anodizing-electroplating-everyday-context-checkpoint-b',
        'goalId': '94a62b39-d4a2-5882-99d1-6886ead07726',
        'sourceDutyOrdinals': [29, 30, 34, 35],
        'taskDemandDe': 'Vier ausdrücklich beschriebene Alltagsprodukte: (A) Aluminium-Fensterprofil mit elektrochemisch verdickter, anschließend abgedichteter Oxidschicht; (B) Stahl-Geländer mit aufgebrachtem Zinküberzug; (C) Stahlschraube mit elektrolytisch abgeschiedener Zinkschicht; (D) stählerner Wassertank mit angeschlossener, austauschbarer Zink-Opferanode. Ordne Eloxieren, Verzinken, Galvanotechnik und kathodischen Opferanodenschutz zu und erkläre die Wirkung. Für A ist das Aluminium beim Herstellungsprozess die Anode; für C ist das Werkstück beim Abscheiden die Kathode. Erkläre den Unterschied, die passive Barriere und zusätzlich mögliche aktive Zinkwirkung bei kleinen Defekten. Fiktive Einkaufsdaten für zwei gleich geeignete Geländer im gleichen Einsatz: Lack L kostet zunächst90 Einheiten plus je30 bei zwei geplanten Wartungen; Zink Z kostet130 plus10 Kontrolle. Beide benötigen unbekannte zusätzliche Herstellung-/Recyclingenergie; Z gibt bei Korrosion Zinkverbindungen an die Umgebung ab, L benötigt Beschichtungsstoff und Wartung. Bewerte bedingt nach den angegebenen Kosten und diesen Umweltinformationen, ohne eine vollständige Ökobilanz oder unbegrenzten Schutz zu behaupten. Kein Herstellungsversuch wird verlangt.',
        'taskDemandEn': 'Four explicitly described everyday products: (A) an aluminium window profile with an electrochemically thickened and subsequently sealed oxide layer; (B) steel railings with an applied zinc coating; (C) a steel screw with an electrolytically deposited zinc layer; (D) a steel water tank with a connected replaceable zinc sacrificial anode. Assign anodising, zinc coating, electroplating and cathodic sacrificial protection and explain how each works. In producing A aluminium is the anode; during deposition for C the workpiece is the cathode. Explain this distinction, the passive barrier and possible additional active zinc action at small defects. Fictional purchasing data for two equally suitable railings in the same setting: paint L costs90 units initially plus30 for each of two scheduled maintenance operations; zinc Z costs130 plus10 inspection. Additional manufacturing/recycling energy is unknown for both; corroding Z releases zinc compounds to the environment, while L requires coating material and maintenance. Make a conditional evaluation using these costs and environmental information, without claiming a complete life-cycle analysis or unlimited protection. No production experiment is required.',
        'expectedPerformanceDe': 'A: Eloxieren erzeugt durch anodische Oxidation eine dickere Aluminiumoxidschicht; geeignete Abdichtung der Poren unterstützt die Barriere. Es ist keine kathodische Metallabscheidung. B: Verzinken liefert zunächst eine Barriere und kann bei geeigneten kleinen Defekten zusätzlich durch Zinkverbrauch aktiv schützen. C: Galvanotechnik ist elektrolytische Abscheidung am kathodischen Werkstück; im vereinfachten Zinkbad Zn²⁺ + 2 e⁻ → Zn. Das Produkt ist zugleich verzinkt. D: angeschlossenes Zink wird oxidiert und schützt das Eisen kathodisch; Verbrauch und Austausch sind nötig. Die benannten Beispiele gehören zu den jeweils gegebenen Produkten, nicht zu einer unbelegten allgemeinen Herstellungsbehauptung. L:90 +2·30 =150, Z:130 +10 =140 angegebene Kosteneinheiten. Unter diesen Planannahmen ist Z um10 günstiger. Unbekannte Herstellung-/Recyclingenergie, tatsächliche Lebensdauer und örtliche Belastungen verhindern eine universelle ökologische Rangfolge. Barriereschaden, Zinkverlust, Wartung und Abfall sind abzuwägen; keine Kostenrechnung allein ist eine Ökobilanz.',
        'expectedPerformanceEn': 'A: anodising uses anodic oxidation to thicken aluminium oxide; suitable pore sealing supports the barrier. It is not cathodic metal deposition. B: zinc coating initially provides a barrier and can additionally protect suitable small defects actively by zinc consumption. C: electroplating deposits metal on the cathodic workpiece; in the simplified zinc bath Zn²⁺ + 2 e⁻ → Zn. The product is also zinc-coated. D: connected zinc is oxidised and protects iron cathodically; consumption requires replacement. Named examples refer to the expressly described products, not unsupported general manufacturing claims. L:90 +2·30 =150; Z:130 +10 =140 supplied cost units. Under these planning assumptions Z is10 cheaper. Unknown manufacturing/recycling energy, actual lifetime and local impacts prevent a universal environmental ranking. Barrier damage, zinc loss, maintenance and waste must be weighed; a cost calculation alone is not life-cycle assessment.',
        'understandingFocusDe': 'Herstellungsprozess, passive Schutzbarriere, aktive Opferwirkung und Alltagsanwendung werden unterschieden; Verzinken kann beide Schutzmechanismen verbinden.',
        'understandingFocusEn': 'Production process, passive barrier, active sacrificial action and everyday application remain distinct; zinc coating can combine both protective mechanisms.',
        'freshTransferDe': 'Im frischen Einsatz wird für Z wegen veränderter Nutzung eine zusätzliche Erneuerung für40 Kosteneinheiten notwendig, während die übrigen angegebenen Planwerte gleich bleiben. Aktualisiere das Kostenurteil und erkläre, warum weder die ursprüngliche Rangfolge noch eine ökologische Überlegenheit unverändert übernommen werden darf.',
        'freshTransferEn': 'In a fresh setting changed use requires one additional renewal of Z costing40 units; the other stated planning values remain unchanged. Update the cost evaluation and explain why neither the original ranking nor environmental superiority can simply be retained.',
        'freshExpectedPerformanceDe': 'Z kostet jetzt180 gegenüber150 für L; nach diesen gegebenen Gesamtkosten ist L günstiger. Die neue Wartungsbedingung verändert den Vergleich, aber liefert weiterhin keine vollständigen Umwelt- oder Lebensdauerdaten.',
        'freshExpectedPerformanceEn': 'Z now costs180 compared with150 for L, so L is cheaper under the supplied total costs. The changed maintenance condition changes the comparison but still supplies no complete environmental or lifetime data.'
    }
]

put('science/whole-one-bilingual-started-practical-protocol.author-checkpoint.json', protocol)
put('science/whole-two-new-bilingual-named-contexts.author-checkpoint.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0',
    'status': 'author_checkpoint_not_independently_reviewed',
    'caseCount': 2, 'cases': named, 'actualLearnerPerformance': False,
    'humanApproval': False, 'wholeOriginalFourTheoryCasesPreservedSeparately': True,
    'profileAdoptionAndWholeSourceClosure': 'pending independent review and normal binding; not completed here'
})

put('candidate/actual-owner-boundaries-and-limited-next-proposals.checkpoint.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0',
    'unchangedCurrentOwnerGoalIds': [
        '91238ba1-5c63-50c7-a4fd-9bbe492c6b61',
        '536030f8-70dc-519d-8039-92290c68d95d',
        'a44af1fa-5988-5b7d-b206-691c6bbf7dd4'
    ],
    'actualCurrentScopesMeasuredFromNormalSource6SuccessorModel': {
        '91238': {'NI_SekII_GK_LK': True, 'SN_SekII': False, 'TH_SekII': False},
        '536030': {'SN_SekII_LK': True, 'TH_SekII_LK': True},
        'a44af': {'NI_SekII': False, 'TH_SekII': False}
    },
    'sourceDutyOwners': [
        {'old57Ordinal': 19, 'existingOwner': '91238ba1-5c63-50c7-a4fd-9bbe492c6b61',
         'boundedContribution': 'Actual corrosion and iron-ion investigation; one started full bilingual protocol, second practical case and whole owner/material assurance pending.'},
        {'old57Ordinal': 20, 'existingOwner': '91238ba1-5c63-50c7-a4fd-9bbe492c6b61',
         'boundedContribution': 'Existing NI owner retained; an actual independent protection comparison protocol is still required.'},
        {'old57Ordinal': 41, 'existingPotentialOwner': '536030f8-70dc-519d-8039-92290c68d95d',
         'boundedContribution': 'Existing SN-LK practical kinetic competence can carry temperature/concentration/catalyst work; actual complete material and targeted source contribution are pending.'},
        {'old57Ordinal': 43, 'proposedSmallestCompanionDe': 'Lokalelemente und Korrosionsvorgänge in einem vorgegebenen kontrollierten Metallkontaktversuch praktisch untersuchen und dokumentieren.',
         'proposedSmallestCompanionEn': 'Practically investigate and record local cells and corrosion in a supplied controlled metal-contact experiment.',
         'stableGoalId': None, 'fullGoalProfileAtomicityAndSourceViewCandidatePrepared': False,
         'reason': 'Do not add whole broad91238 to SN merely from a partial conduct clause. First inspect a valid existing full regional method-owner union; otherwise author the smallest actual practical companion.'},
        {'old57Ordinal': 56, 'courseLevel': 'LK',
         'proposedSmallestCompanionDe': 'Korrosion an Eisen im vorgegebenen Schülerexperiment untersuchen und die gebildeten Fe²⁺- und OH⁻-Ionen mit geeigneten getrennten Nachweisen bestimmen.',
         'proposedSmallestCompanionEn': 'Investigate iron corrosion in a supplied student experiment and detect the formed Fe²⁺ and OH⁻ ions with suitable separate tests.',
         'stableGoalId': None, 'fullGoalProfileAtomicityAndSourceViewCandidatePrepared': False,
         'reason': 'TH whole additional elevated-level operator is retained. Neither theoretical corrosion explanation nor the existing gas-detection owner conducts the stated ion experiment. Broad91238/a44af default targets are not established from this lone contribution.'}
    ],
    'scopeInterpretation': 'These are bounded neutral proposals, not new source mappings or operative learner targets. Partial contribution is not whole default-target permission.',
    'canonicalChanges': 0, 'sourceMappingChanges': 0, 'learnerViewChanges': 0,
    'old57DutiesRetained': 57, 'oldSelectedTheoryEdgesRetained': 106,
    'oldWholePartnerRowsRetained': 269, 'oldWholePartnerGoalsRetained': 38,
    'oldTheoryP2AndFourCasesChanged': False,
    'SOURCE003': 'HOLD: candidate material begun; complete practical protection/kinetic pair, whole valid owner or scoped companion, independent reviews and current normal bindings pending',
    'SOURCE004': 'HOLD: two new complete DE/EN named-context material candidates; independent scientific review and whole profile/source bindings pending',
    'noHistoricalDutyOrPartnerRemoval': True,
    'humanApproval': False, 'strictGain': 0, 'activeWrites': 0
})

put('primary/actual-primary-and-niche-fact-reading.checkpoint.json', {
    'schemaVersion': 1,
    'curriculumPrimariesActuallyRead': [
        {'document': 'NI', 'physicalPages': [26, 47], 'operators': ['perform corrosion/iron-ion experiments', 'perform protection experiments']},
        {'document': 'SN', 'physicalPages': [50, 56], 'operators': ['experimentally vary temperature/concentration/catalyst', 'experimentally investigate local cells and corrosion']},
        {'document': 'TH', 'physicalPages': [52, 53, 54], 'operator': 'Student investigation of iron corrosion with Fe²⁺/OH⁻ detection in the additional elevated column'},
        {'document': 'MV', 'physicalPages': [32], 'printedPage': 28, 'operator': 'Chemically describe tin-coated versus zinc-coated steel'},
        {'document': 'SL-GK', 'physicalPages': [46], 'operators': ['explain anodising/zinc coating/electroplating/sacrificial protection', 'name everyday examples']},
        {'document': 'SL-LK', 'physicalPages': [66], 'operators': ['explain anodising/zinc coating/electroplating/sacrificial protection', 'name everyday examples']}
    ],
    'primaryNicheFactChecks': [
        {'url': 'https://unterrichtsmaterialien-chemie.uni-goettingen.de/exp_neu.php?id=875',
         'factsUsed': 'Iron/copper corrosion couples iron dissolution and cathodic oxygen reduction; hexacyanidoferrate(III) permits a blue Fe²⁺ test. Our two-beaker comparison, separate aliquots, pH measurement, repeats and limits are independently authored, not copied apparatus or recipe.',
         'thirdPartyTextOrImageRedistributed': False},
        {'url': 'https://edu.rsc.org/experiments/anodising-aluminium/1918.article',
         'factsUsed': 'Anodising thickens aluminium oxide to improve protection; no demonstration or actual execution is inferred.',
         'thirdPartyTextOrImageRedistributed': False},
        {'url': 'https://members.anodizing.org/general/custom.asp?page=what-is-anodizing',
         'factsUsed': 'Anodised oxide can be porous; suitable sealing supports barrier protection.',
         'thirdPartyTextOrImageRedistributed': False},
        {'url': 'https://galvanizing.org.uk/sacrificial-protection/',
         'factsUsed': 'Zinc can provide both barrier and sacrificial protection at suitable damage.',
         'thirdPartyTextOrImageRedistributed': False}
    ],
    'fullPrimaryPDFBytesPreserved': True,
    'ownMaterialLicense': 'CC-BY-4.0',
    'thirdPartyPrimaryDocumentsRelicensed': False,
    'independentScienceOrPracticalApproval': False
})

print(json.dumps({'wholeBilingualNamedCases': len(named),
                  'startedWholeBilingualPracticalProtocols': 1,
                  'newProfiles': 0, 'newCanonicalGoals': 0,
                  'sourceFindingsClosed': 0, 'strictGain': 0}))
