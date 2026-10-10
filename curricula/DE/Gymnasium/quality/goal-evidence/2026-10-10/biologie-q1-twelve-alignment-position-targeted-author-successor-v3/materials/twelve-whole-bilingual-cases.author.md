# Zwölf vollständige Biologie-Materialkandidaten

Autor-Nachfolger; keine unabhängige Freigabe, keine Lernendenleistung und kein M7-Abschluss. Alle synthetischen Daten sind Unterrichtsmodelle.

## 3312b2bb-bc90-5c0f-a859-4b4f9b8ff117

### simulation-negative-feedback — Ein Genprodukt bremst seine Produktion

**materialDe**

Alle Angaben sind ein synthetisches diskretes Modell, keine Zellmessung. P ist die Menge eines regulatorischen Proteins in relativen Einheiten. P0=0. In jedem Schritt gilt P(t+1)=0,5·P(t)+S(t)/(1+P(t)); der erste Term steht für verbleibendes Protein, der zweite für Synthese, die durch P gebremst wird. Der Reiz S beträgt in den Übergängen t=0→1, 1→2 und 2→3 jeweils 4; danach 0. Rechne auf drei Dezimalstellen und beschreibe die biologische Beziehung. Eine Tabellenkalkulation oder Rechnung mit dem gegebenen Ausdruck ist erlaubt.

**materialEn**

All statements form a synthetic discrete model, not cell measurements. P is a regulatory protein amount in relative units. P0=0. Each step follows P(t+1)=0.5·P(t)+S(t)/(1+P(t)); the first term represents remaining protein, the second synthesis inhibited by P. Input S equals 4 during transitions t=0→1, 1→2 and 2→3, then 0. Calculate to three decimal places and describe the biological relationship. A spreadsheet or calculation with the supplied expression is allowed.

**taskDe**

Bestimme P1 bis P5. Erkläre, warum gleiches S nicht gleiche Neusynthese bedeutet, und trenne Rückkopplung von Proteinabbau. Zeichne oder beschreibe die Pfeile S→Produktion→P und P⊣Produktion. Was geschieht nach Reizende?

**taskEn**

Determine P1 to P5. Explain why identical S does not imply identical new synthesis, and distinguish feedback from protein degradation. Draw or describe S→production→P and P⊣production. What happens after the input ends?

**workedSolutionDe**

P1=4. P2=2+4/5=2,800. P3=1,4+4/3,8=2,453. P4=1,226; P5=0,613. Mit wachsendem P wird der Syntheseterm kleiner: negative Rückkopplung wirkt auf die Produktion, der Faktor 0,5 auf die vorhandene Menge. Nach Abschalten entsteht im Modell nichts neu; die Menge halbiert sich weiter. Die Abnahme 4→2,8 beweist keine universelle Oszillation biologischer Rückkopplungen, sondern folgt diesen Zahlen und Zeitschritten.

**workedSolutionEn**

P1=4. P2=2+4/5=2.800. P3=1.4+4/3.8=2.453. P4=1.226; P5=0.613. Increasing P reduces the synthesis term: negative feedback acts on production, while the factor 0.5 acts on the existing amount. After switch-off the model produces nothing new and the amount keeps halving. The decrease from 4 to 2.8 does not prove universal oscillation of biological feedback; it follows these numbers and time steps.

**freshTransferDe**

Eine neue Intervention entfernt nur die Bindungsstelle des hemmenden Proteins. Nun gilt P(t+1)=0,5·P(t)+S(t), bei gleichem Puls und P0=0. Bestimme P1 bis P5 und begründe, an welchem Pfeil die Intervention wirkt. Warum kann die Restmenge nach Reizende trotzdem fallen?

**freshTransferEn**

A new intervention removes only the binding site of the inhibitory protein. Now P(t+1)=0.5·P(t)+S(t), with the same pulse and P0=0. Determine P1 to P5 and justify which arrow is affected. Why can the residual amount still fall after switch-off?

**freshTransferSolutionDe**

Es entstehen 4;6;7;3,5;1,75. Die Rückwirkung P⊣Produktion entfällt, der Abbau bleibt. Der Unterschied 7 gegenüber 2,453 am Pulsende ist eine prüfbare Modellvorhersage; er belegt keine tatsächliche Expression einer unbekannten Mutation.

**freshTransferSolutionEn**

The values are 4;6;7;3.5;1.75. Feedback P⊣production disappears while degradation remains. The difference of 7 versus 2.453 at pulse end is a testable model prediction; it does not establish actual expression for an unknown mutation.

**limitsDe**

Der Zeitschritt, konstante Abbau und funktionale Hemmung sind vorgegeben. Parameter, Sättigung und weitere Zellwege müssten gemessen werden; Rechnung ist ein Hilfsmittel für die Beschreibung, keine neue allgemeine Mathematikpflicht.

**limitsEn**

Time step, constant degradation and functional inhibition are supplied. Parameters, saturation and other pathways would need measurements; calculation supports the description and introduces no new general mathematics requirement.

**Rubrik**

{"id": "feedback", "expectationIds": ["feedback"], "criterionDe": "Die lernende Person beschreibt die Rückkopplung und erklärt jeden Übergang des bereitgestellten Modells.", "criterionEn": "The learner describes the feedback and explains each transition in the supplied model."}

{"id": "signal", "expectationIds": ["signal"], "criterionDe": "Die lernende Person ordnet Signal, Regulator und Genprodukt und deutet den zeitlichen Verlauf statt eine bloße Gleichzeitigkeit als Ursache auszugeben.", "criterionEn": "The learner identifies input, regulator and gene product and interprets timing without treating coincidence as causation."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person überträgt die Beziehungen auf die neue Störung, begründet eine überprüfbare Vorhersage und nennt eine Modellgrenze.", "criterionEn": "The learner transfers the relationships to a new perturbation, justifies a testable prediction and names a model limitation."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "feedback",
      "essentialUnderstandingDe": "Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.",
      "essentialUnderstandingEn": "A gene product can affect its further production; direction and delay shape the time course.",
      "observablePerformanceDe": "Die lernende Person beschreibt die Rückkopplung und erklärt jeden Übergang des bereitgestellten Modells.",
      "observablePerformanceEn": "The learner describes the feedback and explains each transition in the supplied model."
    },
    {
      "id": "signal",
      "essentialUnderstandingDe": "Ein Signalweg verbindet Eingangsreiz, Regulatoren und Genaktivität mit unterscheidbaren Zwischenschritten.",
      "essentialUnderstandingEn": "A signal pathway connects an input, regulators and gene activity through distinct intermediate steps.",
      "observablePerformanceDe": "Die lernende Person ordnet Signal, Regulator und Genprodukt und deutet den zeitlichen Verlauf statt eine bloße Gleichzeitigkeit als Ursache auszugeben.",
      "observablePerformanceEn": "The learner identifies input, regulator and gene product and interprets timing without treating coincidence as causation."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Eine geänderte Rückkopplung oder ein unterbrochener Signalweg verändert begründbare Modellvorhersagen, ohne die echte Zelle vollständig festzulegen.",
      "essentialUnderstandingEn": "Changed feedback or an interrupted pathway changes justified model predictions without fully determining a real cell.",
      "observablePerformanceDe": "Die lernende Person überträgt die Beziehungen auf die neue Störung, begründet eine überprüfbare Vorhersage und nennt eine Modellgrenze.",
      "observablePerformanceEn": "The learner transfers the relationships to a new perturbation, justifies a testable prediction and names a model limitation."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "feedback",
      "signal",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "time",
      "textDe": "Verzögerung und Reizdauer",
      "textEn": "Delay and stimulus duration"
    },
    {
      "id": "perturbation",
      "textDe": "Entfernte Rückkopplung gegenüber blockiertem Zwischenschritt",
      "textEn": "Removed feedback versus blocked intermediate step"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "simulation-negative-feedback",
      "taskDemandDe": "Bestimme P1 bis P5. Erkläre, warum gleiches S nicht gleiche Neusynthese bedeutet, und trenne Rückkopplung von Proteinabbau. Zeichne oder beschreibe die Pfeile S→Produktion→P und P⊣Produktion. Was geschieht nach Reizende?",
      "taskDemandEn": "Determine P1 to P5. Explain why identical S does not imply identical new synthesis, and distinguish feedback from protein degradation. Draw or describe S→production→P and P⊣production. What happens after the input ends?",
      "expectedPerformanceDe": "P1=4. P2=2+4/5=2,800. P3=1,4+4/3,8=2,453. P4=1,226; P5=0,613. Mit wachsendem P wird der Syntheseterm kleiner: negative Rückkopplung wirkt auf die Produktion, der Faktor 0,5 auf die vorhandene Menge. Nach Abschalten entsteht im Modell nichts neu; die Menge halbiert sich weiter. Die Abnahme 4→2,8 beweist keine universelle Oszillation biologischer Rückkopplungen, sondern folgt diesen Zahlen und Zeitschritten.",
      "expectedPerformanceEn": "P1=4. P2=2+4/5=2.800. P3=1.4+4/3.8=2.453. P4=1.226; P5=0.613. Increasing P reduces the synthesis term: negative feedback acts on production, while the factor 0.5 acts on the existing amount. After switch-off the model produces nothing new and the amount keeps halving. The decrease from 4 to 2.8 does not prove universal oscillation of biological feedback; it follows these numbers and time steps.",
      "understandingFocusDe": "Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.",
      "understandingFocusEn": "A gene product can affect its further production; direction and delay shape the time course."
    },
    {
      "id": "simulation-delayed-pathway",
      "taskDemandDe": "Erstelle die Tripel (A,R,P) für t=0 bis 5. Beschreibe, weshalb Protein noch nach Reizende aktiv sein kann. Unterscheide Signalübertragung und Transkription; würde bloßes gleichzeitiges Auftreten eine Kette beweisen?",
      "taskDemandEn": "Create triples (A,R,P) for t=0 through 5. Explain why protein can remain active after the input ends. Distinguish signal transmission from transcription; would simultaneous appearance alone prove a pathway?",
      "expectedPerformanceDe": "Tripel: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Die Information wandert mit Verzögerung weiter, obwohl S schon aus ist. S und A repräsentieren den vorgelagerten Signalteil; R ist Transkription, P das nachgelagerte Produkt. Die behaupteten Pfeile sind Modellannahmen; Zeitfolge unterstützt eine Hypothese, ein gezieltes Ausschalten von A wäre aussagekräftiger als Korrelation.",
      "expectedPerformanceEn": "Triples: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Information continues through delayed steps even after S is off. S and A represent upstream signaling; R represents transcription and P the downstream product. The arrows are model assumptions; timing supports a hypothesis, while targeted removal of A is more informative than correlation.",
      "understandingFocusDe": "Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.",
      "understandingFocusEn": "A gene product can affect its further production; direction and delay shape the time course."
    }
  ]
}

### simulation-delayed-pathway — Ein kurzer Reiz durchläuft eine Signalkette

**materialDe**

Synthetisches Boolesches Modell: 1=aktiv, 0=inaktiv. S aktiviert einen Regulator A; A aktiviert Transkription R; R führt im nächsten Schritt zu Protein P. Gleichzeitige Aktualisierung: A(t+1)=S(t), R(t+1)=A(t), P(t+1)=R(t). Anfang A0=R0=P0=0. Der äußere Reiz lautet S0=1, S1=1, danach S2 bis S5=0. Es gibt im Ausgangsmodell keine Rückkopplung. Die Schritte bedeuten gleiche modellhafte Verzögerungen, keine festgelegten Minuten.

**materialEn**

Synthetic Boolean model: 1=active, 0=inactive. S activates regulator A; A activates transcription R; R produces protein P in the next step. Synchronous update: A(t+1)=S(t), R(t+1)=A(t), P(t+1)=R(t). Initially A0=R0=P0=0. External input is S0=1, S1=1, then S2 through S5=0. The initial model has no feedback. Steps represent equal modeled delays, not prescribed minutes.

**taskDe**

Erstelle die Tripel (A,R,P) für t=0 bis 5. Beschreibe, weshalb Protein noch nach Reizende aktiv sein kann. Unterscheide Signalübertragung und Transkription; würde bloßes gleichzeitiges Auftreten eine Kette beweisen?

**taskEn**

Create triples (A,R,P) for t=0 through 5. Explain why protein can remain active after the input ends. Distinguish signal transmission from transcription; would simultaneous appearance alone prove a pathway?

**workedSolutionDe**

Tripel: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Die Information wandert mit Verzögerung weiter, obwohl S schon aus ist. S und A repräsentieren den vorgelagerten Signalteil; R ist Transkription, P das nachgelagerte Produkt. Die behaupteten Pfeile sind Modellannahmen; Zeitfolge unterstützt eine Hypothese, ein gezieltes Ausschalten von A wäre aussagekräftiger als Korrelation.

**workedSolutionEn**

Triples: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Information continues through delayed steps even after S is off. S and A represent upstream signaling; R represents transcription and P the downstream product. The arrows are model assumptions; timing supports a hypothesis, while targeted removal of A is more informative than correlation.

**freshTransferDe**

In einem neuen Zellmodell hemmt P den Regulator: A(t+1)=S(t) AND NOT P(t), R(t+1)=A(t), P(t+1)=R(t). Ein Dauerreiz hält S0 bis S5=1. Beginne bei (0,0,0), bestimme t1 bis t6 und identifiziere die neue Schleife. Vergleiche mit Dauerreiz ohne diese Hemmung.

**freshTransferEn**

In a new cell model P inhibits the regulator: A(t+1)=S(t) AND NOT P(t), R(t+1)=A(t), P(t+1)=R(t). A sustained input keeps S0 through S5=1. Start at (0,0,0), determine t1 through t6 and identify the new loop. Compare with sustained input without this inhibition.

**freshTransferSolutionDe**

Mit Hemmung: (1,0,0),(1,1,0),(1,1,1),(0,1,1),(0,0,1),(0,0,0). Ohne Hemmung bleibt ab t3 alles1. P⊣A schließt S/A→R→P zu einer negativen Rückkopplung mit Verzögerung. Dass t6 alles0 ist, beendet nicht den äußeren Reiz; der nächste Schritt könnte A wieder aktivieren. Die dynamische Vorhersage stammt aus den Update-Regeln.

**freshTransferSolutionEn**

With inhibition: (1,0,0),(1,1,0),(1,1,1),(0,1,1),(0,0,1),(0,0,0). Without inhibition all entries stay1 from t3 onward. P⊣A closes A→R→P into delayed negative feedback. All zeros at t6 do not mean the external stimulus ended; the next step could activate A again. This dynamic prediction comes from the update rules.

**limitsDe**

An/Aus, synchrone Schritte und gleiche Verzögerungen sind Vereinfachungen. Das Beispiel beschreibt einen komplexeren Weg mit Rückwirkung, ohne Homeobox-, Entwicklungsprogramm- oder vollständige Kursabdeckung zu behaupten.

**limitsEn**

On/off states, synchronous steps and equal delays are simplifications. The example describes a pathway with feedback without claiming homeobox, developmental-program or complete course coverage.

**Rubrik**

{"id": "feedback", "expectationIds": ["feedback"], "criterionDe": "Die lernende Person beschreibt die Rückkopplung und erklärt jeden Übergang des bereitgestellten Modells.", "criterionEn": "The learner describes the feedback and explains each transition in the supplied model."}

{"id": "signal", "expectationIds": ["signal"], "criterionDe": "Die lernende Person ordnet Signal, Regulator und Genprodukt und deutet den zeitlichen Verlauf statt eine bloße Gleichzeitigkeit als Ursache auszugeben.", "criterionEn": "The learner identifies input, regulator and gene product and interprets timing without treating coincidence as causation."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person überträgt die Beziehungen auf die neue Störung, begründet eine überprüfbare Vorhersage und nennt eine Modellgrenze.", "criterionEn": "The learner transfers the relationships to a new perturbation, justifies a testable prediction and names a model limitation."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "feedback",
      "essentialUnderstandingDe": "Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.",
      "essentialUnderstandingEn": "A gene product can affect its further production; direction and delay shape the time course.",
      "observablePerformanceDe": "Die lernende Person beschreibt die Rückkopplung und erklärt jeden Übergang des bereitgestellten Modells.",
      "observablePerformanceEn": "The learner describes the feedback and explains each transition in the supplied model."
    },
    {
      "id": "signal",
      "essentialUnderstandingDe": "Ein Signalweg verbindet Eingangsreiz, Regulatoren und Genaktivität mit unterscheidbaren Zwischenschritten.",
      "essentialUnderstandingEn": "A signal pathway connects an input, regulators and gene activity through distinct intermediate steps.",
      "observablePerformanceDe": "Die lernende Person ordnet Signal, Regulator und Genprodukt und deutet den zeitlichen Verlauf statt eine bloße Gleichzeitigkeit als Ursache auszugeben.",
      "observablePerformanceEn": "The learner identifies input, regulator and gene product and interprets timing without treating coincidence as causation."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Eine geänderte Rückkopplung oder ein unterbrochener Signalweg verändert begründbare Modellvorhersagen, ohne die echte Zelle vollständig festzulegen.",
      "essentialUnderstandingEn": "Changed feedback or an interrupted pathway changes justified model predictions without fully determining a real cell.",
      "observablePerformanceDe": "Die lernende Person überträgt die Beziehungen auf die neue Störung, begründet eine überprüfbare Vorhersage und nennt eine Modellgrenze.",
      "observablePerformanceEn": "The learner transfers the relationships to a new perturbation, justifies a testable prediction and names a model limitation."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "feedback",
      "signal",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "time",
      "textDe": "Verzögerung und Reizdauer",
      "textEn": "Delay and stimulus duration"
    },
    {
      "id": "perturbation",
      "textDe": "Entfernte Rückkopplung gegenüber blockiertem Zwischenschritt",
      "textEn": "Removed feedback versus blocked intermediate step"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "simulation-negative-feedback",
      "taskDemandDe": "Bestimme P1 bis P5. Erkläre, warum gleiches S nicht gleiche Neusynthese bedeutet, und trenne Rückkopplung von Proteinabbau. Zeichne oder beschreibe die Pfeile S→Produktion→P und P⊣Produktion. Was geschieht nach Reizende?",
      "taskDemandEn": "Determine P1 to P5. Explain why identical S does not imply identical new synthesis, and distinguish feedback from protein degradation. Draw or describe S→production→P and P⊣production. What happens after the input ends?",
      "expectedPerformanceDe": "P1=4. P2=2+4/5=2,800. P3=1,4+4/3,8=2,453. P4=1,226; P5=0,613. Mit wachsendem P wird der Syntheseterm kleiner: negative Rückkopplung wirkt auf die Produktion, der Faktor 0,5 auf die vorhandene Menge. Nach Abschalten entsteht im Modell nichts neu; die Menge halbiert sich weiter. Die Abnahme 4→2,8 beweist keine universelle Oszillation biologischer Rückkopplungen, sondern folgt diesen Zahlen und Zeitschritten.",
      "expectedPerformanceEn": "P1=4. P2=2+4/5=2.800. P3=1.4+4/3.8=2.453. P4=1.226; P5=0.613. Increasing P reduces the synthesis term: negative feedback acts on production, while the factor 0.5 acts on the existing amount. After switch-off the model produces nothing new and the amount keeps halving. The decrease from 4 to 2.8 does not prove universal oscillation of biological feedback; it follows these numbers and time steps.",
      "understandingFocusDe": "Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.",
      "understandingFocusEn": "A gene product can affect its further production; direction and delay shape the time course."
    },
    {
      "id": "simulation-delayed-pathway",
      "taskDemandDe": "Erstelle die Tripel (A,R,P) für t=0 bis 5. Beschreibe, weshalb Protein noch nach Reizende aktiv sein kann. Unterscheide Signalübertragung und Transkription; würde bloßes gleichzeitiges Auftreten eine Kette beweisen?",
      "taskDemandEn": "Create triples (A,R,P) for t=0 through 5. Explain why protein can remain active after the input ends. Distinguish signal transmission from transcription; would simultaneous appearance alone prove a pathway?",
      "expectedPerformanceDe": "Tripel: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Die Information wandert mit Verzögerung weiter, obwohl S schon aus ist. S und A repräsentieren den vorgelagerten Signalteil; R ist Transkription, P das nachgelagerte Produkt. Die behaupteten Pfeile sind Modellannahmen; Zeitfolge unterstützt eine Hypothese, ein gezieltes Ausschalten von A wäre aussagekräftiger als Korrelation.",
      "expectedPerformanceEn": "Triples: t0=(0,0,0), t1=(1,0,0), t2=(1,1,0), t3=(0,1,1), t4=(0,0,1), t5=(0,0,0). Information continues through delayed steps even after S is off. S and A represent upstream signaling; R represents transcription and P the downstream product. The arrows are model assumptions; timing supports a hypothesis, while targeted removal of A is more informative than correlation.",
      "understandingFocusDe": "Ein Genprodukt kann seine weitere Produktion beeinflussen; Wirkungsrichtung und Verzögerung bestimmen den Verlauf.",
      "understandingFocusEn": "A gene product can affect its further production; direction and delay shape the time course."
    }
  ]
}

## 3b55b551-cd7f-53fb-9bf0-fd8149ac1222

### chromatin-access-and-activator — Ein offener Promotor genügt nicht

**materialDe**

Synthetisches Zellkulturmodell mit identischer DNA-Sequenz. Eine ATP-abhängige Remodelling-Maschine kann das Nukleosom am Promotor verschieben; eine Acetyltransferase fügt Histon-Acetylgruppen hinzu. Gegebene Messwerte: unbehandelt Zugänglichkeit10%, mRNA2; Remodeller an, Aktivator aus: Zugänglichkeit70%, mRNA3; Remodeller an, Aktivator an: Zugänglichkeit75%, mRNA40; nur Acetyltransferase an, Aktivator an: Zugänglichkeit50%, mRNA25. Werte sind illustrative Mittelwerte ohne Streuungsangaben. Zugänglichkeit ist ein vereinfachtes DNA-Zugangssignal, mRNA relative Menge.

**materialEn**

Synthetic cell-culture model with identical DNA sequence. An ATP-dependent remodeling machine can move a promoter nucleosome; an acetyltransferase adds histone acetyl groups. Supplied measurements: untreated accessibility10%, mRNA2; remodeler on, activator off: accessibility70%, mRNA3; remodeler on, activator on: accessibility75%, mRNA40; acetyltransferase only on, activator on: accessibility50%, mRNA25. Values are illustrative means without variability estimates. Accessibility is a simplified DNA-access signal; mRNA is relative abundance.

**taskDe**

Ordne die Eingriffe als Remodelling oder Modifikation ein. Erkläre den Unterschied zwischen 70%/3 und 75%/40. Bewerte die Aussage: Jede Chromatinöffnung schaltet das Gen vollständig an. Benenne eine Kontrollbedingung für einen kausalen Vergleich der beiden Maschinen.

**taskEn**

Classify the interventions as remodeling or modification. Explain the difference between 70%/3 and 75%/40. Evaluate the claim: every chromatin opening fully switches the gene on. Name a control needed for a causal comparison of the two machines.

**workedSolutionDe**

Verschieben verändert die Nukleosomenposition; Acetylierung ist eine chemische Modifikation der Histone. Hoher Zugang bei fehlendem Aktivator ergibt hier wenig mRNA; Zugang ist eine Voraussetzung, keine hinreichende Bedingung. Aktivator an erhöht die mRNA trotz nur kleiner Zugangsänderung stark. Die Unterschiede zwischen den Maschinen sind mit diesen unvollständigen Kontrollen nicht allein kausal zuzuordnen: nötig sind identischer Aktivatorstatus, ATP-/inaktive-Maschine-Kontrollen und Replikate. DNA-Sequenzänderung ist nicht erforderlich.

**workedSolutionEn**

Movement changes nucleosome position; acetylation chemically modifies histones. High accessibility without activator yields little mRNA here; accessibility is a prerequisite rather than a sufficient condition. Turning the activator on greatly raises mRNA despite little additional accessibility. The incomplete controls do not assign all differences causally to the machines: matched activator status, ATP/inactive-machine controls and replicates are needed. No DNA sequence change is required.

**freshTransferDe**

Am nächsten Tag wird bei gleichem Aktivator die ATPase des Remodellers blockiert. Zugänglichkeit fällt von75% auf20%, mRNA von40 auf8, Histon-Acetylierung bleibt konstant. Eine Schülerin sagt: Konstante Acetylierung beweist unverändert offene Chromatinstruktur. Prüfe dies und schlage eine passende Rettungsbedingung vor.

**freshTransferEn**

The next day the remodeler ATPase is blocked with the same activator. Accessibility falls from75% to20%, mRNA from40 to8, while histone acetylation stays constant. A student says: constant acetylation proves chromatin remains open. Evaluate this and propose a suitable rescue condition.

**freshTransferSolutionDe**

Die konstante chemische Markierung misst nicht die Nukleosomenposition. Der ATP-abhängige Mechanismus kann unabhängig davon Zugang reduzieren; mRNA folgt im Beispiel nach unten. Eine aktive, inhibitorresistente ATPase mit sonst gleichen Bedingungen könnte die Hypothese testen. Der Datensatz allein schließt Nebenwirkungen des Blockers nicht aus.

**freshTransferSolutionEn**

An unchanged chemical mark does not measure nucleosome position. The ATP-dependent mechanism can independently reduce access; mRNA decreases in this example. An active inhibitor-resistant ATPase under otherwise matched conditions could test the hypothesis. The dataset alone does not exclude off-target effects of the blocker.

**limitsDe**

Illustrative Werte; ohne Streuung kein Signifikanztest. Acetylierung und ATP-Remodelling sind unterscheidbare, zusammenwirkende Mechanismen, keine universellen Ein/Aus-Schalter.

**limitsEn**

Illustrative values; without variability no significance test is possible. Acetylation and ATP-dependent remodeling are distinct interacting mechanisms rather than universal on/off switches.

**Rubrik**

{"id": "access", "expectationIds": ["access"], "criterionDe": "Die lernende Person unterscheidet physisches Nukleosomenverschieben von chemischer Histon-Modifikation und verbindet beide mit Transkriptionszugang.", "criterionEn": "The learner distinguishes physical nucleosome movement from chemical histone modification and links both to transcriptional access."}

{"id": "evidence", "expectationIds": ["evidence"], "criterionDe": "Die lernende Person vergleicht Kontrollen, benennt notwendige Aktivatoren und begrenzt kausale Schlüsse aus den Messdaten.", "criterionEn": "The learner compares controls, identifies required activators and limits causal conclusions from the measurements."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe ohne pauschale Aktivierungsregel und formuliert eine begründete Folgemessung.", "criterionEn": "The learner interprets a new mark or time series without a universal activation rule and proposes a justified follow-up measurement."}

**Ganzes positives Profil**

{
  "archetype": "concept",
  "expectations": [
    {
      "id": "access",
      "essentialUnderstandingDe": "Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.",
      "essentialUnderstandingEn": "Nucleosome position and histone modifications can affect gene accessibility.",
      "observablePerformanceDe": "Die lernende Person unterscheidet physisches Nukleosomenverschieben von chemischer Histon-Modifikation und verbindet beide mit Transkriptionszugang.",
      "observablePerformanceEn": "The learner distinguishes physical nucleosome movement from chemical histone modification and links both to transcriptional access."
    },
    {
      "id": "evidence",
      "essentialUnderstandingDe": "Zugänglichkeit und Transkriptmenge sind unterschiedliche Messgrößen; beide können weitere Voraussetzungen haben.",
      "essentialUnderstandingEn": "Accessibility and transcript amount are different measurements and can depend on further conditions.",
      "observablePerformanceDe": "Die lernende Person vergleicht Kontrollen, benennt notwendige Aktivatoren und begrenzt kausale Schlüsse aus den Messdaten.",
      "observablePerformanceEn": "The learner compares controls, identifies required activators and limits causal conclusions from the measurements."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Die Wirkung einer Histonmarkierung hängt von Ort und Kontext ab; eine Änderung der Zugänglichkeit garantiert keine Genaktivität.",
      "essentialUnderstandingEn": "A histone mark depends on location and context; changed accessibility does not guarantee gene activity.",
      "observablePerformanceDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe ohne pauschale Aktivierungsregel und formuliert eine begründete Folgemessung.",
      "observablePerformanceEn": "The learner interprets a new mark or time series without a universal activation rule and proposes a justified follow-up measurement."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "access",
      "evidence",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "intervention",
      "textDe": "ATP-abhängige Positionierung, Acetylierung und Aktivator",
      "textEn": "ATP-dependent positioning, acetylation and activator"
    },
    {
      "id": "mark-context",
      "textDe": "Unterschiedliche Histonstellen und Zeitpunkte",
      "textEn": "Different histone sites and time points"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "chromatin-access-and-activator",
      "taskDemandDe": "Ordne die Eingriffe als Remodelling oder Modifikation ein. Erkläre den Unterschied zwischen 70%/3 und 75%/40. Bewerte die Aussage: Jede Chromatinöffnung schaltet das Gen vollständig an. Benenne eine Kontrollbedingung für einen kausalen Vergleich der beiden Maschinen.",
      "taskDemandEn": "Classify the interventions as remodeling or modification. Explain the difference between 70%/3 and 75%/40. Evaluate the claim: every chromatin opening fully switches the gene on. Name a control needed for a causal comparison of the two machines.",
      "expectedPerformanceDe": "Verschieben verändert die Nukleosomenposition; Acetylierung ist eine chemische Modifikation der Histone. Hoher Zugang bei fehlendem Aktivator ergibt hier wenig mRNA; Zugang ist eine Voraussetzung, keine hinreichende Bedingung. Aktivator an erhöht die mRNA trotz nur kleiner Zugangsänderung stark. Die Unterschiede zwischen den Maschinen sind mit diesen unvollständigen Kontrollen nicht allein kausal zuzuordnen: nötig sind identischer Aktivatorstatus, ATP-/inaktive-Maschine-Kontrollen und Replikate. DNA-Sequenzänderung ist nicht erforderlich.",
      "expectedPerformanceEn": "Movement changes nucleosome position; acetylation chemically modifies histones. High accessibility without activator yields little mRNA here; accessibility is a prerequisite rather than a sufficient condition. Turning the activator on greatly raises mRNA despite little additional accessibility. The incomplete controls do not assign all differences causally to the machines: matched activator status, ATP/inactive-machine controls and replicates are needed. No DNA sequence change is required.",
      "understandingFocusDe": "Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.",
      "understandingFocusEn": "Nucleosome position and histone modifications can affect gene accessibility."
    },
    {
      "id": "chromatin-mark-context",
      "taskDemandDe": "Erkläre, warum alle Methylierungen machen Gene aus hier falsch ist. Unterscheide markiertes Molekül, Zugänglichkeit und Transkription. Welche zusätzliche Untersuchung würde zeigen, ob die Marke eine Folge oder ein Beitrag zur Aktivitätsänderung ist?",
      "taskDemandEn": "Explain why all methylation switches genes off is wrong here. Distinguish the marked molecule, accessibility and transcription. What additional investigation would help distinguish whether a mark follows or contributes to the activity change?",
      "expectedPerformanceDe": "Beide Zustände haben Histon-Methylierung, aber an unterschiedlichen Stellen und in anderem Kontext; A ist stärker transkribiert. DNA bleibt gleich. Zugänglichkeit beschreibt eine Strukturbedingung, mRNA das Ergebnis mehrerer Regulationsschritte. Gezielte Veränderung der zuständigen Enzyme mit Kontrollen und einer Zeitreihe für Marke, Position/Zugang und mRNA könnte den Beitrag prüfen; die zweifache Beobachtung allein beweist keine Ursache.",
      "expectedPerformanceEn": "Both states contain histone methylation, but at different sites and in different contexts; A is transcribed more strongly. DNA remains unchanged. Accessibility describes a structural condition; mRNA reflects several regulatory steps. Targeted manipulation of the relevant enzymes with controls and time courses for mark, position/access and mRNA could test contribution; two observations alone do not prove causation.",
      "understandingFocusDe": "Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.",
      "understandingFocusEn": "Nucleosome position and histone modifications can affect gene accessibility."
    }
  ]
}

### chromatin-mark-context — Zwei Methylmarken mit unterschiedlichen Kontexten

**materialDe**

Synthetischer Vergleich zweier Zellzustände, DNA-Sequenz gleich. Als Kontextinformation wird gegeben: H3K4me3 ist hier eine Markierung an aktivem Promotor, H3K27me3 eine Markierung in repressivem Chromatin. ZustandA: H3K4me3 hoch, H3K27me3 niedrig, Promotor zugänglich, mRNA60. ZustandB: H3K4me3 niedrig, H3K27me3 hoch, Promotor wenig zugänglich, mRNA5. Beide Marken betreffen Methylierung unterschiedlicher Histonstellen, keine DNA-Methylierung. Die Zuordnungen sind fallbezogene Hinweise, kein auswendig zu lernender Histoncode.

**materialEn**

Synthetic comparison of two cell states with identical DNA sequence. Supplied context: H3K4me3 marks an active promoter here; H3K27me3 marks repressive chromatin. StateA: high H3K4me3, low H3K27me3, accessible promoter, mRNA60. StateB: low H3K4me3, high H3K27me3, poorly accessible promoter, mRNA5. Both marks methylate different histone sites, not DNA. These are case-specific clues rather than a histone code to memorize.

**taskDe**

Erkläre, warum alle Methylierungen machen Gene aus hier falsch ist. Unterscheide markiertes Molekül, Zugänglichkeit und Transkription. Welche zusätzliche Untersuchung würde zeigen, ob die Marke eine Folge oder ein Beitrag zur Aktivitätsänderung ist?

**taskEn**

Explain why all methylation switches genes off is wrong here. Distinguish the marked molecule, accessibility and transcription. What additional investigation would help distinguish whether a mark follows or contributes to the activity change?

**workedSolutionDe**

Beide Zustände haben Histon-Methylierung, aber an unterschiedlichen Stellen und in anderem Kontext; A ist stärker transkribiert. DNA bleibt gleich. Zugänglichkeit beschreibt eine Strukturbedingung, mRNA das Ergebnis mehrerer Regulationsschritte. Gezielte Veränderung der zuständigen Enzyme mit Kontrollen und einer Zeitreihe für Marke, Position/Zugang und mRNA könnte den Beitrag prüfen; die zweifache Beobachtung allein beweist keine Ursache.

**workedSolutionEn**

Both states contain histone methylation, but at different sites and in different contexts; A is transcribed more strongly. DNA remains unchanged. Accessibility describes a structural condition; mRNA reflects several regulatory steps. Targeted manipulation of the relevant enzymes with controls and time courses for mark, position/access and mRNA could test contribution; two observations alone do not prove causation.

**freshTransferDe**

Ein Signal erzeugt in B nach1h hohen H3K4me3-Wert, aber noch Zugang niedrig und mRNA5. Nach3h verschiebt ein Remodeller das Promotornukleosom; Zugang hoch, mRNA50. Deute die neue Zeitreihe und entscheide, ob die erste Marke allein hinreichend war.

**freshTransferEn**

In B a signal creates high H3K4me3 after1h, but access remains low and mRNA5. After3h a remodeler moves the promoter nucleosome; access is high and mRNA50. Interpret the new time course and decide whether the first mark alone was sufficient.

**freshTransferSolutionDe**

Die erste Markierung war bei1h in diesem Fall nicht hinreichend für viel mRNA. Die spätere Strukturänderung passt zu einem weiteren notwendigen Zugangsschritt, eventuell zusammen mit Aktivatoren. Ohne kontrolliertes Blockieren des Remodellers ist die Zeitreihe kein vollständiger Kausalbeweis. Die beiden Messgrößen dürfen nicht gleichgesetzt werden.

**freshTransferSolutionEn**

At1h the first mark was not sufficient for abundant mRNA in this case. The later structural change fits an additional access requirement, possibly together with activators. Without controlled blockade of the remodeler the time course is not complete causal proof. The two measurements must not be equated.

**limitsDe**

Markennamen werden erklärt und sind kein Wissensquiz. Keine Vorhersage menschlicher Vererbung oder Zulassung eines vollständigen Entwicklungsprogramms.

**limitsEn**

Mark names are supplied, not a recall quiz. No prediction of human inheritance or approval of a complete developmental program is made.

**Rubrik**

{"id": "access", "expectationIds": ["access"], "criterionDe": "Die lernende Person unterscheidet physisches Nukleosomenverschieben von chemischer Histon-Modifikation und verbindet beide mit Transkriptionszugang.", "criterionEn": "The learner distinguishes physical nucleosome movement from chemical histone modification and links both to transcriptional access."}

{"id": "evidence", "expectationIds": ["evidence"], "criterionDe": "Die lernende Person vergleicht Kontrollen, benennt notwendige Aktivatoren und begrenzt kausale Schlüsse aus den Messdaten.", "criterionEn": "The learner compares controls, identifies required activators and limits causal conclusions from the measurements."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe ohne pauschale Aktivierungsregel und formuliert eine begründete Folgemessung.", "criterionEn": "The learner interprets a new mark or time series without a universal activation rule and proposes a justified follow-up measurement."}

**Ganzes positives Profil**

{
  "archetype": "concept",
  "expectations": [
    {
      "id": "access",
      "essentialUnderstandingDe": "Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.",
      "essentialUnderstandingEn": "Nucleosome position and histone modifications can affect gene accessibility.",
      "observablePerformanceDe": "Die lernende Person unterscheidet physisches Nukleosomenverschieben von chemischer Histon-Modifikation und verbindet beide mit Transkriptionszugang.",
      "observablePerformanceEn": "The learner distinguishes physical nucleosome movement from chemical histone modification and links both to transcriptional access."
    },
    {
      "id": "evidence",
      "essentialUnderstandingDe": "Zugänglichkeit und Transkriptmenge sind unterschiedliche Messgrößen; beide können weitere Voraussetzungen haben.",
      "essentialUnderstandingEn": "Accessibility and transcript amount are different measurements and can depend on further conditions.",
      "observablePerformanceDe": "Die lernende Person vergleicht Kontrollen, benennt notwendige Aktivatoren und begrenzt kausale Schlüsse aus den Messdaten.",
      "observablePerformanceEn": "The learner compares controls, identifies required activators and limits causal conclusions from the measurements."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Die Wirkung einer Histonmarkierung hängt von Ort und Kontext ab; eine Änderung der Zugänglichkeit garantiert keine Genaktivität.",
      "essentialUnderstandingEn": "A histone mark depends on location and context; changed accessibility does not guarantee gene activity.",
      "observablePerformanceDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe ohne pauschale Aktivierungsregel und formuliert eine begründete Folgemessung.",
      "observablePerformanceEn": "The learner interprets a new mark or time series without a universal activation rule and proposes a justified follow-up measurement."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "access",
      "evidence",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "intervention",
      "textDe": "ATP-abhängige Positionierung, Acetylierung und Aktivator",
      "textEn": "ATP-dependent positioning, acetylation and activator"
    },
    {
      "id": "mark-context",
      "textDe": "Unterschiedliche Histonstellen und Zeitpunkte",
      "textEn": "Different histone sites and time points"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "chromatin-access-and-activator",
      "taskDemandDe": "Ordne die Eingriffe als Remodelling oder Modifikation ein. Erkläre den Unterschied zwischen 70%/3 und 75%/40. Bewerte die Aussage: Jede Chromatinöffnung schaltet das Gen vollständig an. Benenne eine Kontrollbedingung für einen kausalen Vergleich der beiden Maschinen.",
      "taskDemandEn": "Classify the interventions as remodeling or modification. Explain the difference between 70%/3 and 75%/40. Evaluate the claim: every chromatin opening fully switches the gene on. Name a control needed for a causal comparison of the two machines.",
      "expectedPerformanceDe": "Verschieben verändert die Nukleosomenposition; Acetylierung ist eine chemische Modifikation der Histone. Hoher Zugang bei fehlendem Aktivator ergibt hier wenig mRNA; Zugang ist eine Voraussetzung, keine hinreichende Bedingung. Aktivator an erhöht die mRNA trotz nur kleiner Zugangsänderung stark. Die Unterschiede zwischen den Maschinen sind mit diesen unvollständigen Kontrollen nicht allein kausal zuzuordnen: nötig sind identischer Aktivatorstatus, ATP-/inaktive-Maschine-Kontrollen und Replikate. DNA-Sequenzänderung ist nicht erforderlich.",
      "expectedPerformanceEn": "Movement changes nucleosome position; acetylation chemically modifies histones. High accessibility without activator yields little mRNA here; accessibility is a prerequisite rather than a sufficient condition. Turning the activator on greatly raises mRNA despite little additional accessibility. The incomplete controls do not assign all differences causally to the machines: matched activator status, ATP/inactive-machine controls and replicates are needed. No DNA sequence change is required.",
      "understandingFocusDe": "Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.",
      "understandingFocusEn": "Nucleosome position and histone modifications can affect gene accessibility."
    },
    {
      "id": "chromatin-mark-context",
      "taskDemandDe": "Erkläre, warum alle Methylierungen machen Gene aus hier falsch ist. Unterscheide markiertes Molekül, Zugänglichkeit und Transkription. Welche zusätzliche Untersuchung würde zeigen, ob die Marke eine Folge oder ein Beitrag zur Aktivitätsänderung ist?",
      "taskDemandEn": "Explain why all methylation switches genes off is wrong here. Distinguish the marked molecule, accessibility and transcription. What additional investigation would help distinguish whether a mark follows or contributes to the activity change?",
      "expectedPerformanceDe": "Beide Zustände haben Histon-Methylierung, aber an unterschiedlichen Stellen und in anderem Kontext; A ist stärker transkribiert. DNA bleibt gleich. Zugänglichkeit beschreibt eine Strukturbedingung, mRNA das Ergebnis mehrerer Regulationsschritte. Gezielte Veränderung der zuständigen Enzyme mit Kontrollen und einer Zeitreihe für Marke, Position/Zugang und mRNA könnte den Beitrag prüfen; die zweifache Beobachtung allein beweist keine Ursache.",
      "expectedPerformanceEn": "Both states contain histone methylation, but at different sites and in different contexts; A is transcribed more strongly. DNA remains unchanged. Accessibility describes a structural condition; mRNA reflects several regulatory steps. Targeted manipulation of the relevant enzymes with controls and time courses for mark, position/access and mRNA could test contribution; two observations alone do not prove causation.",
      "understandingFocusDe": "Nukleosomenposition und Histon-Modifikationen können die Zugänglichkeit eines Gens beeinflussen.",
      "understandingFocusEn": "Nucleosome position and histone modifications can affect gene accessibility."
    }
  ]
}

## 52ecc72a-a65b-53a0-851e-86defe769fa7

### models-access-versus-repressor — Gleiche mRNA, verschiedene Stellstellen

**materialDe**

Zwei synthetische Modelle sagen ohne Reiz mRNA2, mit Reiz mRNA40 voraus. ModellR: Ein Repressor blockiert einen bakteriellen Operator; der Reiz bindet den Repressor und löst ihn vom Operator, RNA-Polymerase kann transkribieren. ModellC: In einer eukaryotischen Zelle ist ein Promotor wenig zugänglich; der Reiz rekrutiert eine Chromatin-öffnende Maschine, ein bereits vorhandener Aktivator ermöglicht Transkription. Gegebene Testbedingung: Chromatinmaschine spezifisch inaktiv, Reiz vorhanden. Messung in der untersuchten eukaryotischen Kultur: Zugang bleibt niedrig, mRNA3.

**materialEn**

Two synthetic models predict mRNA2 without input and mRNA40 with input. ModelR: a repressor blocks a bacterial operator; input binds the repressor and releases it, permitting RNA polymerase transcription. ModelC: in a eukaryotic cell a promoter is poorly accessible; input recruits a chromatin-opening machine and an existing activator permits transcription. Supplied test condition: chromatin machine specifically inactive, input present. Measurement in the investigated eukaryotic culture: access stays low, mRNA3.

**taskDe**

Erläutere beide Modelle mit einem Pfeilschema. Weshalb unterscheiden 2 und40 die Modelle allein nicht? Welche neue Beobachtung passt zu C, und weshalb darf R nicht ohne Weiteres als vollständiges Zellmodell übertragen werden?

**taskEn**

Explain both models with an arrow scheme. Why do values2 and40 alone not distinguish them? Which new observation fits C, and why cannot R simply be transferred as a complete cell model?

**workedSolutionDe**

R: Reiz⊣Repressorbindung⊣Transkription; doppelte Hemmung wirkt aktivierend. C: Reiz→Chromatinzugang, mit Aktivator→Transkription. Gleiche Endwerte sagen nicht, wo die Regulation sitzt. Spezifisch inaktive Chromatinöffnung und weiterhin wenig mRNA stützen die notwendige Zugangsrolle von C. R enthält keinen Nukleosomenzugang und stammt aus einem anderen Modellkontext; es erklärt den Eingriff nicht ohne Erweiterung. Nebenwirkungen und weitere Stellstellen müssen trotz angenommener Spezifität durch Kontrollen geprüft werden.

**workedSolutionEn**

R: input⊣repressor binding⊣transcription; double inhibition activates. C: input→chromatin access, together with activator→transcription. Equal outputs do not locate the control point. Specifically inactive chromatin opening with little mRNA supports the access requirement in C. R includes no nucleosome-access step and belongs to a different model context; it cannot explain this intervention without extension. Controls should test other effects and control points even when specificity is assumed.

**freshTransferDe**

Neue Zeitdaten: Nach Entfernung des Reizes bleibt Zugang für zwei Zellteilungen hoch und mRNA30; der Aktivator wird anschließend ausgeschaltet, Zugang bleibt hoch, mRNA fällt auf2. Ergänze ModellC um die kleinste begründbare Beziehung. Darf die erste Beobachtung eine DNA-Sequenzänderung beweisen?

**freshTransferEn**

New timing data: after input removal, access stays high for two cell divisions and mRNA30; the activator is then turned off, access stays high and mRNA falls to2. Add the smallest justified relationship to C. Does the first observation prove a DNA sequence change?

**freshTransferSolutionDe**

Eine persistierende Zugangsbedingung plus notwendiger Aktivator erklärt beide Beobachtungen: offen allein reicht nicht. Zellulär erhaltene epigenetische Zustände wären eine Hypothese; weder Mutation noch Vererbung zwischen Organismengenerationen ist bewiesen. Markierungen, Zellzusammensetzung und Aktivatorstatus könnten kontrolliert werden.

**freshTransferSolutionEn**

A persistent access condition together with a required activator explains both observations: openness alone is insufficient. Maintained cellular epigenetic states are a hypothesis; neither mutation nor inheritance across organism generations is proven. Marks, cell composition and activator status could be controlled.

**limitsDe**

Modelle sind ausdrücklich geliefert. Operon und eukaryotische Zugangsregulation werden mechanistisch unterschieden; dies ersetzt keine Hox- oder ganze Q1.5-Pflicht.

**limitsEn**

Models are explicitly supplied. Operon control and eukaryotic access regulation are distinguished mechanistically; this replaces no Hox or complete Q1.5 obligation.

**Rubrik**

{"id": "models", "expectationIds": ["models"], "criterionDe": "Die lernende Person erklärt mindestens zwei bereitgestellte Modelle anhand von Regulator, Ziel und Wirkungsrichtung.", "criterionEn": "The learner explains at least two supplied models in terms of regulator, target and effect direction."}

{"id": "discrimination", "expectationIds": ["discrimination"], "criterionDe": "Die lernende Person vergleicht Modellvorhersagen bei geänderten Bedingungen und nennt eine Beobachtung, die die Modelle unterscheidet.", "criterionEn": "The learner compares model predictions under changed conditions and names an observation that distinguishes them."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person passt ihre begründete Erklärung an einen neuen Fall an und nennt verbleibende Alternativen.", "criterionEn": "The learner adapts a justified explanation to a new case and names remaining alternatives."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "models",
      "essentialUnderstandingDe": "Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.",
      "essentialUnderstandingEn": "Models describe different control points in gene regulation and must be explained with their assumptions.",
      "observablePerformanceDe": "Die lernende Person erklärt mindestens zwei bereitgestellte Modelle anhand von Regulator, Ziel und Wirkungsrichtung.",
      "observablePerformanceEn": "The learner explains at least two supplied models in terms of regulator, target and effect direction."
    },
    {
      "id": "discrimination",
      "essentialUnderstandingDe": "Ein gleicher Endwert kann durch unterschiedliche Mechanismen entstehen; eine unterscheidende Störung ist aussagekräftiger.",
      "essentialUnderstandingEn": "Identical output can arise from different mechanisms; a discriminating perturbation is more informative.",
      "observablePerformanceDe": "Die lernende Person vergleicht Modellvorhersagen bei geänderten Bedingungen und nennt eine Beobachtung, die die Modelle unterscheidet.",
      "observablePerformanceEn": "The learner compares model predictions under changed conditions and names an observation that distinguishes them."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Ein Modell ist eine begrenzte Erklärung; neue Zeit- oder Eingriffsdaten können es einschränken.",
      "essentialUnderstandingEn": "A model is a bounded explanation; new timing or intervention data can constrain it.",
      "observablePerformanceDe": "Die lernende Person passt ihre begründete Erklärung an einen neuen Fall an und nennt verbleibende Alternativen.",
      "observablePerformanceEn": "The learner adapts a justified explanation to a new case and names remaining alternatives."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "models",
      "discrimination",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "control",
      "textDe": "Repressorbindung gegenüber Chromatinzugang",
      "textEn": "Repressor binding versus chromatin access"
    },
    {
      "id": "logic",
      "textDe": "Induktion gegenüber Endproduktrepression",
      "textEn": "Induction versus end-product repression"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "models-access-versus-repressor",
      "taskDemandDe": "Erläutere beide Modelle mit einem Pfeilschema. Weshalb unterscheiden 2 und40 die Modelle allein nicht? Welche neue Beobachtung passt zu C, und weshalb darf R nicht ohne Weiteres als vollständiges Zellmodell übertragen werden?",
      "taskDemandEn": "Explain both models with an arrow scheme. Why do values2 and40 alone not distinguish them? Which new observation fits C, and why cannot R simply be transferred as a complete cell model?",
      "expectedPerformanceDe": "R: Reiz⊣Repressorbindung⊣Transkription; doppelte Hemmung wirkt aktivierend. C: Reiz→Chromatinzugang, mit Aktivator→Transkription. Gleiche Endwerte sagen nicht, wo die Regulation sitzt. Spezifisch inaktive Chromatinöffnung und weiterhin wenig mRNA stützen die notwendige Zugangsrolle von C. R enthält keinen Nukleosomenzugang und stammt aus einem anderen Modellkontext; es erklärt den Eingriff nicht ohne Erweiterung. Nebenwirkungen und weitere Stellstellen müssen trotz angenommener Spezifität durch Kontrollen geprüft werden.",
      "expectedPerformanceEn": "R: input⊣repressor binding⊣transcription; double inhibition activates. C: input→chromatin access, together with activator→transcription. Equal outputs do not locate the control point. Specifically inactive chromatin opening with little mRNA supports the access requirement in C. R includes no nucleosome-access step and belongs to a different model context; it cannot explain this intervention without extension. Controls should test other effects and control points even when specificity is assumed.",
      "understandingFocusDe": "Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.",
      "understandingFocusEn": "Models describe different control points in gene regulation and must be explained with their assumptions."
    },
    {
      "id": "models-induction-versus-repression",
      "taskDemandDe": "Gib für X niedrig/hoch beziehungsweise Y niedrig/hoch Repressorbindung und Genaktivität an. Erkläre, warum beide Modelle mit einem Repressor arbeiten, aber ein Stoffanstieg gegensätzliche Wirkungen hat. Wie passt dies zu Abbau und Synthese?",
      "taskDemandEn": "State repressor binding and gene activity for low/high X and low/high Y. Explain why both models use a repressor but an increase in a substance has opposite effects. How does this fit degradation and synthesis?",
      "expectedPerformanceDe": "I: X niedrig→R bindet→niedrig; X hoch→R inaktiv→hoch. E: Y niedrig→T inaktiv→hoch; Y hoch→T aktiv/bindet→niedrig. Entscheidend ist, ob der Stoff den Repressor inaktiviert oder aktiviert. Abbau wird bei vorhandenem Substrat ermöglicht; Synthese wird bei genügend Endprodukt begrenzt. Die Regeln sind Regulationsmodelle, keine Aussage, dass alle Gene in Bakterien so gesteuert werden.",
      "expectedPerformanceEn": "I: low X→R bound→low; high X→R inactive→high. E: low Y→T inactive→high; high Y→T active/bound→low. The key distinction is whether the substance inactivates or activates the repressor. Degradation is enabled when substrate is available; synthesis is limited when enough end product is present. These are control models, not a claim that all bacterial genes behave this way.",
      "understandingFocusDe": "Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.",
      "understandingFocusEn": "Models describe different control points in gene regulation and must be explained with their assumptions."
    }
  ]
}

### models-induction-versus-repression — Ein Nährstoff startet, ein Endprodukt stoppt

**materialDe**

Synthetische bakterielle Modelle bei sonst identischen Bedingungen. I ist induzierbar: Ohne SubstratX bindet RepressorR den Operator; X inaktiviert R, Transkription von Abbauenzymen ist hoch. E ist repressibel: Ohne EndproduktY ist RepressorT inaktiv; Y bindet als Korepressor an T, T bindet den Operator und Transkription von Syntheseenzymen ist niedrig. Alle Bezeichnungen und Bindungsregeln sind gegeben. Es werden ausschließlich diese Regeln genutzt; Glukosekontrolle oder echte Operonnamen sind nicht erforderlich.

**materialEn**

Synthetic bacterial models with otherwise identical conditions. I is inducible: without substrateX, repressorR binds the operator; X inactivates R, and transcription of degradation enzymes is high. E is repressible: without end productY, repressorT is inactive; Y acts as a corepressor by binding T, T binds the operator and transcription of synthesis enzymes is low. Names and binding rules are supplied. Only these rules are used; glucose control or real operon names are not required.

**taskDe**

Gib für X niedrig/hoch beziehungsweise Y niedrig/hoch Repressorbindung und Genaktivität an. Erkläre, warum beide Modelle mit einem Repressor arbeiten, aber ein Stoffanstieg gegensätzliche Wirkungen hat. Wie passt dies zu Abbau und Synthese?

**taskEn**

State repressor binding and gene activity for low/high X and low/high Y. Explain why both models use a repressor but an increase in a substance has opposite effects. How does this fit degradation and synthesis?

**workedSolutionDe**

I: X niedrig→R bindet→niedrig; X hoch→R inaktiv→hoch. E: Y niedrig→T inaktiv→hoch; Y hoch→T aktiv/bindet→niedrig. Entscheidend ist, ob der Stoff den Repressor inaktiviert oder aktiviert. Abbau wird bei vorhandenem Substrat ermöglicht; Synthese wird bei genügend Endprodukt begrenzt. Die Regeln sind Regulationsmodelle, keine Aussage, dass alle Gene in Bakterien so gesteuert werden.

**workedSolutionEn**

I: low X→R bound→low; high X→R inactive→high. E: low Y→T inactive→high; high Y→T active/bound→low. The key distinction is whether the substance inactivates or activates the repressor. Degradation is enabled when substrate is available; synthesis is limited when enough end product is present. These are control models, not a claim that all bacterial genes behave this way.

**freshTransferDe**

In einer neuen Mutante von E kann T nicht mehr an Y binden, aber weiterhin an DNA, sobald es aktiviert wäre. Beobachtet wird trotz Y hoch viel mRNA. Sage den Verlauf bei weiterem Y-Anstieg voraus und nenne einen Test, der diese Erklärung von einem defekten Operator unterscheidet.

**freshTransferEn**

In a new E mutant, T cannot bind Y but could still bind DNA if activated. Abundant mRNA is observed even with high Y. Predict the effect of a further increase in Y and name a test that distinguishes this explanation from a defective operator.

**freshTransferSolutionDe**

Mehr Y aktiviert das nichtbindende T nicht, daher bleibt mRNA im Modell hoch. Ein intakter, aktivierbarer T-Regulator sollte am unveränderten Operator die Repression wiederherstellen; bei defektem Operator wäre dies nicht der Fall. Vergleich der Bindung mit Kontrollproteinen prüft die Stellstelle. Hohe mRNA allein unterscheidet die beiden Mutationsmodelle nicht.

**freshTransferSolutionEn**

More Y cannot activate T that fails to bind it, so mRNA remains high in the model. An intact activatable T regulator should restore repression at an unchanged operator; a defective operator would prevent this. Binding comparisons with control proteins test the control point. High mRNA alone does not distinguish the mutation models.

**limitsDe**

Keine zusätzliche Stoffwechsel- oder Mutationstypenprüfung; die gelieferten Bindungsregeln dienen dem Vergleich der Gensteuerung.

**limitsEn**

No additional metabolism or mutation-type assessment is required; supplied binding rules support comparison of gene regulation.

**Rubrik**

{"id": "models", "expectationIds": ["models"], "criterionDe": "Die lernende Person erklärt mindestens zwei bereitgestellte Modelle anhand von Regulator, Ziel und Wirkungsrichtung.", "criterionEn": "The learner explains at least two supplied models in terms of regulator, target and effect direction."}

{"id": "discrimination", "expectationIds": ["discrimination"], "criterionDe": "Die lernende Person vergleicht Modellvorhersagen bei geänderten Bedingungen und nennt eine Beobachtung, die die Modelle unterscheidet.", "criterionEn": "The learner compares model predictions under changed conditions and names an observation that distinguishes them."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person passt ihre begründete Erklärung an einen neuen Fall an und nennt verbleibende Alternativen.", "criterionEn": "The learner adapts a justified explanation to a new case and names remaining alternatives."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "models",
      "essentialUnderstandingDe": "Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.",
      "essentialUnderstandingEn": "Models describe different control points in gene regulation and must be explained with their assumptions.",
      "observablePerformanceDe": "Die lernende Person erklärt mindestens zwei bereitgestellte Modelle anhand von Regulator, Ziel und Wirkungsrichtung.",
      "observablePerformanceEn": "The learner explains at least two supplied models in terms of regulator, target and effect direction."
    },
    {
      "id": "discrimination",
      "essentialUnderstandingDe": "Ein gleicher Endwert kann durch unterschiedliche Mechanismen entstehen; eine unterscheidende Störung ist aussagekräftiger.",
      "essentialUnderstandingEn": "Identical output can arise from different mechanisms; a discriminating perturbation is more informative.",
      "observablePerformanceDe": "Die lernende Person vergleicht Modellvorhersagen bei geänderten Bedingungen und nennt eine Beobachtung, die die Modelle unterscheidet.",
      "observablePerformanceEn": "The learner compares model predictions under changed conditions and names an observation that distinguishes them."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Ein Modell ist eine begrenzte Erklärung; neue Zeit- oder Eingriffsdaten können es einschränken.",
      "essentialUnderstandingEn": "A model is a bounded explanation; new timing or intervention data can constrain it.",
      "observablePerformanceDe": "Die lernende Person passt ihre begründete Erklärung an einen neuen Fall an und nennt verbleibende Alternativen.",
      "observablePerformanceEn": "The learner adapts a justified explanation to a new case and names remaining alternatives."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "models",
      "discrimination",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "control",
      "textDe": "Repressorbindung gegenüber Chromatinzugang",
      "textEn": "Repressor binding versus chromatin access"
    },
    {
      "id": "logic",
      "textDe": "Induktion gegenüber Endproduktrepression",
      "textEn": "Induction versus end-product repression"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "models-access-versus-repressor",
      "taskDemandDe": "Erläutere beide Modelle mit einem Pfeilschema. Weshalb unterscheiden 2 und40 die Modelle allein nicht? Welche neue Beobachtung passt zu C, und weshalb darf R nicht ohne Weiteres als vollständiges Zellmodell übertragen werden?",
      "taskDemandEn": "Explain both models with an arrow scheme. Why do values2 and40 alone not distinguish them? Which new observation fits C, and why cannot R simply be transferred as a complete cell model?",
      "expectedPerformanceDe": "R: Reiz⊣Repressorbindung⊣Transkription; doppelte Hemmung wirkt aktivierend. C: Reiz→Chromatinzugang, mit Aktivator→Transkription. Gleiche Endwerte sagen nicht, wo die Regulation sitzt. Spezifisch inaktive Chromatinöffnung und weiterhin wenig mRNA stützen die notwendige Zugangsrolle von C. R enthält keinen Nukleosomenzugang und stammt aus einem anderen Modellkontext; es erklärt den Eingriff nicht ohne Erweiterung. Nebenwirkungen und weitere Stellstellen müssen trotz angenommener Spezifität durch Kontrollen geprüft werden.",
      "expectedPerformanceEn": "R: input⊣repressor binding⊣transcription; double inhibition activates. C: input→chromatin access, together with activator→transcription. Equal outputs do not locate the control point. Specifically inactive chromatin opening with little mRNA supports the access requirement in C. R includes no nucleosome-access step and belongs to a different model context; it cannot explain this intervention without extension. Controls should test other effects and control points even when specificity is assumed.",
      "understandingFocusDe": "Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.",
      "understandingFocusEn": "Models describe different control points in gene regulation and must be explained with their assumptions."
    },
    {
      "id": "models-induction-versus-repression",
      "taskDemandDe": "Gib für X niedrig/hoch beziehungsweise Y niedrig/hoch Repressorbindung und Genaktivität an. Erkläre, warum beide Modelle mit einem Repressor arbeiten, aber ein Stoffanstieg gegensätzliche Wirkungen hat. Wie passt dies zu Abbau und Synthese?",
      "taskDemandEn": "State repressor binding and gene activity for low/high X and low/high Y. Explain why both models use a repressor but an increase in a substance has opposite effects. How does this fit degradation and synthesis?",
      "expectedPerformanceDe": "I: X niedrig→R bindet→niedrig; X hoch→R inaktiv→hoch. E: Y niedrig→T inaktiv→hoch; Y hoch→T aktiv/bindet→niedrig. Entscheidend ist, ob der Stoff den Repressor inaktiviert oder aktiviert. Abbau wird bei vorhandenem Substrat ermöglicht; Synthese wird bei genügend Endprodukt begrenzt. Die Regeln sind Regulationsmodelle, keine Aussage, dass alle Gene in Bakterien so gesteuert werden.",
      "expectedPerformanceEn": "I: low X→R bound→low; high X→R inactive→high. E: low Y→T inactive→high; high Y→T active/bound→low. The key distinction is whether the substance inactivates or activates the repressor. Degradation is enabled when substrate is available; synthesis is limited when enough end product is present. These are control models, not a claim that all bacterial genes behave this way.",
      "understandingFocusDe": "Modelle bilden unterschiedliche Stellstellen der Gensteuerung ab und müssen mit ihren Voraussetzungen erläutert werden.",
      "understandingFocusEn": "Models describe different control points in gene regulation and must be explained with their assumptions."
    }
  ]
}

## 666fb1d1-09a8-55a3-acd5-efe311cac8b0

### network-negative-loop — Drei Regulatoren schließen eine Schleife

**materialDe**

Gegebenes synthetisches Netzwerk: S aktiviert A; A aktiviert B; B aktiviert C; C hemmt A. Eine einzige Hemmung schließt die Schleife A→B→C⊣A. Zusätzliche Annahme: B und C reagieren verzögert und werden nach Wegfall ihres Aktivators abgebaut. Illustrative Zeitreihe bei Dauerreiz S=an: Zeit0 A/B/C=0/0/0; Zeit1=8/1/0; Zeit2=6/7/1; Zeit3=2/5/7; Zeit4=4/2/4. Das sind relative Messwerte; keine exakten kinetischen Regeln werden aus ihnen vorausgesetzt.

**materialEn**

Supplied synthetic network: S activates A; A activates B; B activates C; C inhibits A. One inhibitory edge closes A→B→C⊣A. Additional assumption: B and C respond with delay and decay after losing their activator. Illustrative time course under sustained S: time0 A/B/C=0/0/0; time1=8/1/0; time2=6/7/1; time3=2/5/7; time4=4/2/4. Values are relative measurements; no exact kinetic rules are inferred from them.

**taskDe**

Markiere die Schleife und bestimme ihr Vorzeichen. Erkläre, wie A trotz dauerhaftem S zunächst fallen und später wieder steigen kann. Welche Folge erwartet das Netzwerk, wenn nur C→A entfernt wird? Begründe ohne die Zahlenreihe als universelle Oszillation auszugeben.

**taskEn**

Mark the loop and determine its sign. Explain how A can fall and later rise despite sustained S. What does the network predict if only C→A is removed? Justify without presenting this time course as universal oscillation.

**workedSolutionDe**

Die Schleife enthält zwei Aktivierungen und eine Hemmung, also negative Rückkopplung. Anfangs steigt A; verzögert steigen B/C, C hemmt A, dann gehen B/C zurück und A kann sich unter S erholen. Ohne C⊣A entfällt diese Bremse; bei sonst gleichen Bedingungen sollte A weniger stark fallen, B/C können länger hoch bleiben. Genaues Ausmaß und dauerhaftes Schwingen sind ohne Parameter nicht bestimmbar. Zeit4 ist eine partielle Erholung, kein Beweis eines stabilen Zyklus.

**workedSolutionEn**

The loop has two activating and one inhibiting edges, hence negative feedback. Initially A rises; B/C rise with delay, C inhibits A, then B/C decrease and A can recover under S. Removing C⊣A removes this brake; all else equal, A should fall less, and B/C may remain high longer. Exact magnitude and sustained oscillation cannot be determined without parameters. Time4 shows partial recovery, not proof of a stable cycle.

**freshTransferDe**

Eine neue Versuchsreihe hemmt C nur zwischen Zeit2 und3; S bleibt an. A steigt dann statt zu fallen, während B zeitverzögert zunimmt. Nenne den gestützten Pfad und einen Gegentest: Was wäre bei gleichzeitigem Abschalten von S anders?

**freshTransferEn**

A new experiment inhibits C only between time2 and3 while S stays on. A then rises rather than falls, with delayed increase in B. Name the supported path and a countertest: what would differ if S were also switched off?

**freshTransferSolutionDe**

Die Beobachtung passt zur hemmenden C⊣A-Kante und nachgeschalteter A→B-Aktivierung. Ohne S entfällt zusätzlich der antreibende Eingang, sodass Entfernung von C allein keinen gleichen A-Anstieg garantieren kann. S-an/aus und C-intakt/gehemmt als getrennte Kontrollen helfen den indirekten Effekt abzugrenzen.

**freshTransferSolutionEn**

The observation fits the inhibitory C⊣A edge and downstream A→B activation. Without S the driving input also disappears, so removal of C alone cannot guarantee the same A increase. Separate S on/off and C intact/inhibited controls distinguish the indirect effect.

**limitsDe**

Das Vorzeichen ist strukturell; Stabilität und Frequenz benötigen kinetische Parameter. Die Zahlen sind erfunden und dienen einer Analyse, nicht der Bestätigung einer echten Zellreaktion.

**limitsEn**

The sign is structural; stability and frequency require kinetic parameters. Numbers are invented for analysis, not confirmation of a real cell response.

**Rubrik**

{"id": "network", "expectationIds": ["network"], "criterionDe": "Die lernende Person analysiert Pfade und geschlossene Schleifen und begründet deren Netto-Vorzeichen.", "criterionEn": "The learner analyzes paths and closed loops and justifies their net sign."}

{"id": "perturbation", "expectationIds": ["perturbation"], "criterionDe": "Die lernende Person sagt anhand gegebener Regeln Folgen einer gezielten Störung voraus und vergleicht sie mit einer Zeitreihe.", "criterionEn": "The learner predicts a targeted perturbation from supplied rules and compares it with a time course."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person analysiert eine neue Kante oder Störung, unterscheidet Modell und Beobachtung und nennt einen passenden Kontrolltest.", "criterionEn": "The learner analyzes a new edge or perturbation, distinguishes model from observation and names a suitable control test."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "network",
      "essentialUnderstandingDe": "Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.",
      "essentialUnderstandingEn": "A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator.",
      "observablePerformanceDe": "Die lernende Person analysiert Pfade und geschlossene Schleifen und begründet deren Netto-Vorzeichen.",
      "observablePerformanceEn": "The learner analyzes paths and closed loops and justifies their net sign."
    },
    {
      "id": "perturbation",
      "essentialUnderstandingDe": "Eine Netzstörung kann direkte und verzögerte indirekte Effekte haben; ein Endwert verrät nicht alle Pfade.",
      "essentialUnderstandingEn": "Network perturbations can have direct and delayed indirect effects; one output does not reveal every pathway.",
      "observablePerformanceDe": "Die lernende Person sagt anhand gegebener Regeln Folgen einer gezielten Störung voraus und vergleicht sie mit einer Zeitreihe.",
      "observablePerformanceEn": "The learner predicts a targeted perturbation from supplied rules and compares it with a time course."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Schleifenstruktur begrenzt plausible Dynamik, bestimmt sie aber ohne Parameter und Verzögerungen nicht vollständig.",
      "essentialUnderstandingEn": "Loop structure constrains plausible dynamics but does not fully determine them without parameters and delays.",
      "observablePerformanceDe": "Die lernende Person analysiert eine neue Kante oder Störung, unterscheidet Modell und Beobachtung und nennt einen passenden Kontrolltest.",
      "observablePerformanceEn": "The learner analyzes a new edge or perturbation, distinguishes model from observation and names a suitable control test."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "network",
      "perturbation",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "motif",
      "textDe": "Negative Rückkopplung gegenüber inkohärentem Feedforward",
      "textEn": "Negative feedback versus incoherent feedforward"
    },
    {
      "id": "path",
      "textDe": "Direkter und indirekter Pfad",
      "textEn": "Direct and indirect path"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "network-negative-loop",
      "taskDemandDe": "Markiere die Schleife und bestimme ihr Vorzeichen. Erkläre, wie A trotz dauerhaftem S zunächst fallen und später wieder steigen kann. Welche Folge erwartet das Netzwerk, wenn nur C→A entfernt wird? Begründe ohne die Zahlenreihe als universelle Oszillation auszugeben.",
      "taskDemandEn": "Mark the loop and determine its sign. Explain how A can fall and later rise despite sustained S. What does the network predict if only C→A is removed? Justify without presenting this time course as universal oscillation.",
      "expectedPerformanceDe": "Die Schleife enthält zwei Aktivierungen und eine Hemmung, also negative Rückkopplung. Anfangs steigt A; verzögert steigen B/C, C hemmt A, dann gehen B/C zurück und A kann sich unter S erholen. Ohne C⊣A entfällt diese Bremse; bei sonst gleichen Bedingungen sollte A weniger stark fallen, B/C können länger hoch bleiben. Genaues Ausmaß und dauerhaftes Schwingen sind ohne Parameter nicht bestimmbar. Zeit4 ist eine partielle Erholung, kein Beweis eines stabilen Zyklus.",
      "expectedPerformanceEn": "The loop has two activating and one inhibiting edges, hence negative feedback. Initially A rises; B/C rise with delay, C inhibits A, then B/C decrease and A can recover under S. Removing C⊣A removes this brake; all else equal, A should fall less, and B/C may remain high longer. Exact magnitude and sustained oscillation cannot be determined without parameters. Time4 shows partial recovery, not proof of a stable cycle.",
      "understandingFocusDe": "Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.",
      "understandingFocusEn": "A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator."
    },
    {
      "id": "network-feedforward-versus-feedback",
      "taskDemandDe": "Vergleiche den direkten und indirekten A→G-Pfad. Ist das erste Netzwerk eine Rückkopplung? Erkläre den Puls und unterscheide ihn vom möglichen Verlauf in F. Entwerfe eine gezielte Störung zur Prüfung des verzögerten Pfads.",
      "taskDemandEn": "Compare the direct and indirect A→G paths. Is the first network feedback? Explain the pulse and distinguish it from the possible behavior of F. Design a targeted perturbation to test the delayed path.",
      "expectedPerformanceDe": "Der direkte Pfad aktiviert, der indirekte A→R⊣G hemmt. Dies ist ein Feedforward mit entgegengesetzten Wirkungen, keine geschlossene Rückkopplung, weil nichts zu A zurückführt. Der direkte Pfad startet schnell, R begrenzt später die Transkription. F hat dagegen eine Schleife A→G/P⊣A. Gezielte Blockade von R bei gleichem A sollte die spätere G-Abnahme vermindern; ein Pulseffekt allein beweist die Motifstruktur nicht.",
      "expectedPerformanceEn": "The direct path activates; indirect A→R⊣G inhibits. This is feedforward with opposing effects rather than closed feedback, since nothing returns to A. The direct path acts quickly; R later limits transcription. F instead contains A→G/P⊣A. Specific blockade of R with the same A should reduce the later G decline; a pulse alone does not prove the network structure.",
      "understandingFocusDe": "Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.",
      "understandingFocusEn": "A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator."
    }
  ]
}

### network-feedforward-versus-feedback — Ein Transkriptionspuls ohne geschlossene Schleife

**materialDe**

Synthetisches Netzwerk: A aktiviert unmittelbar ZielgenG und aktiviert zugleich verzögert RepressorR; R hemmt G. Es existiert keine Kante von G oder R zurück zu A. Bei Dauer-A beobachtet man G-mRNA zunächst2, nach1h40, nach3h6; R steigt langsam. Zum Vergleich wird NetzwerkF gegeben: A aktiviert G; dessen Protein P hemmt A. Namen, Pfeile und Verzögerungen sind Fallinformationen, keine zu memorierenden Netzwerkmotive.

**materialEn**

Synthetic network: A immediately activates target geneG and also activates repressorR with delay; R inhibits G. There is no edge from G or R back to A. With sustained A, G mRNA is initially2, after1h40 and after3h6; R rises slowly. Comparison networkF: A activates G; its protein P inhibits A. Names, arrows and delays are supplied case information rather than motifs to memorize.

**taskDe**

Vergleiche den direkten und indirekten A→G-Pfad. Ist das erste Netzwerk eine Rückkopplung? Erkläre den Puls und unterscheide ihn vom möglichen Verlauf in F. Entwerfe eine gezielte Störung zur Prüfung des verzögerten Pfads.

**taskEn**

Compare the direct and indirect A→G paths. Is the first network feedback? Explain the pulse and distinguish it from the possible behavior of F. Design a targeted perturbation to test the delayed path.

**workedSolutionDe**

Der direkte Pfad aktiviert, der indirekte A→R⊣G hemmt. Dies ist ein Feedforward mit entgegengesetzten Wirkungen, keine geschlossene Rückkopplung, weil nichts zu A zurückführt. Der direkte Pfad startet schnell, R begrenzt später die Transkription. F hat dagegen eine Schleife A→G/P⊣A. Gezielte Blockade von R bei gleichem A sollte die spätere G-Abnahme vermindern; ein Pulseffekt allein beweist die Motifstruktur nicht.

**workedSolutionEn**

The direct path activates; indirect A→R⊣G inhibits. This is feedforward with opposing effects rather than closed feedback, since nothing returns to A. The direct path acts quickly; R later limits transcription. F instead contains A→G/P⊣A. Specific blockade of R with the same A should reduce the later G decline; a pulse alone does not prove the network structure.

**freshTransferDe**

Neue Daten zeigen, dass R zusätzlich A hemmt. Zeichne die ergänzte Schleife, entscheide ihr Vorzeichen und prüfe folgende Aussage: Weil nun negative Rückkopplung vorliegt, muss die Zelle dauerhaft schwingen.

**freshTransferEn**

New data show that R also inhibits A. Draw the added loop, determine its sign and evaluate the statement: because negative feedback is now present, the cell must oscillate indefinitely.

**freshTransferSolutionDe**

A→R⊣A ist eine negative Schleife; der alte indirekte A→R⊣G-Pfad bleibt bestehen. Dauerhaftes Schwingen folgt nicht aus dem Vorzeichen allein; Stärke, Verzögerungen und Abbau bestimmen, ob Beruhigung, Überschwingen oder andere Dynamik entsteht. Eine Zeitreihe sowie getrennte Blockaden R⊣A und R⊣G würden die beiden Wirkungen prüfen.

**freshTransferSolutionEn**

A→R⊣A is a negative loop; the original indirect A→R⊣G path remains. Indefinite oscillation does not follow from sign alone; strengths, delays and degradation determine settling, overshoot or other behavior. Time courses and separate blockade of R⊣A and R⊣G would test the two effects.

**limitsDe**

Keine allgemeine Homöobox-/Entwicklungsnetzwerkfreigabe. Die Analyse bleibt bei den vollständig gelieferten Pfaden und differenziert Beobachtung von Strukturhypothese.

**limitsEn**

No general approval of homeobox or developmental networks is made. Analysis stays within the fully supplied paths and distinguishes observations from structural hypotheses.

**Rubrik**

{"id": "network", "expectationIds": ["network"], "criterionDe": "Die lernende Person analysiert Pfade und geschlossene Schleifen und begründet deren Netto-Vorzeichen.", "criterionEn": "The learner analyzes paths and closed loops and justifies their net sign."}

{"id": "perturbation", "expectationIds": ["perturbation"], "criterionDe": "Die lernende Person sagt anhand gegebener Regeln Folgen einer gezielten Störung voraus und vergleicht sie mit einer Zeitreihe.", "criterionEn": "The learner predicts a targeted perturbation from supplied rules and compares it with a time course."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person analysiert eine neue Kante oder Störung, unterscheidet Modell und Beobachtung und nennt einen passenden Kontrolltest.", "criterionEn": "The learner analyzes a new edge or perturbation, distinguishes model from observation and names a suitable control test."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "network",
      "essentialUnderstandingDe": "Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.",
      "essentialUnderstandingEn": "A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator.",
      "observablePerformanceDe": "Die lernende Person analysiert Pfade und geschlossene Schleifen und begründet deren Netto-Vorzeichen.",
      "observablePerformanceEn": "The learner analyzes paths and closed loops and justifies their net sign."
    },
    {
      "id": "perturbation",
      "essentialUnderstandingDe": "Eine Netzstörung kann direkte und verzögerte indirekte Effekte haben; ein Endwert verrät nicht alle Pfade.",
      "essentialUnderstandingEn": "Network perturbations can have direct and delayed indirect effects; one output does not reveal every pathway.",
      "observablePerformanceDe": "Die lernende Person sagt anhand gegebener Regeln Folgen einer gezielten Störung voraus und vergleicht sie mit einer Zeitreihe.",
      "observablePerformanceEn": "The learner predicts a targeted perturbation from supplied rules and compares it with a time course."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Schleifenstruktur begrenzt plausible Dynamik, bestimmt sie aber ohne Parameter und Verzögerungen nicht vollständig.",
      "essentialUnderstandingEn": "Loop structure constrains plausible dynamics but does not fully determine them without parameters and delays.",
      "observablePerformanceDe": "Die lernende Person analysiert eine neue Kante oder Störung, unterscheidet Modell und Beobachtung und nennt einen passenden Kontrolltest.",
      "observablePerformanceEn": "The learner analyzes a new edge or perturbation, distinguishes model from observation and names a suitable control test."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "network",
      "perturbation",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "motif",
      "textDe": "Negative Rückkopplung gegenüber inkohärentem Feedforward",
      "textEn": "Negative feedback versus incoherent feedforward"
    },
    {
      "id": "path",
      "textDe": "Direkter und indirekter Pfad",
      "textEn": "Direct and indirect path"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "network-negative-loop",
      "taskDemandDe": "Markiere die Schleife und bestimme ihr Vorzeichen. Erkläre, wie A trotz dauerhaftem S zunächst fallen und später wieder steigen kann. Welche Folge erwartet das Netzwerk, wenn nur C→A entfernt wird? Begründe ohne die Zahlenreihe als universelle Oszillation auszugeben.",
      "taskDemandEn": "Mark the loop and determine its sign. Explain how A can fall and later rise despite sustained S. What does the network predict if only C→A is removed? Justify without presenting this time course as universal oscillation.",
      "expectedPerformanceDe": "Die Schleife enthält zwei Aktivierungen und eine Hemmung, also negative Rückkopplung. Anfangs steigt A; verzögert steigen B/C, C hemmt A, dann gehen B/C zurück und A kann sich unter S erholen. Ohne C⊣A entfällt diese Bremse; bei sonst gleichen Bedingungen sollte A weniger stark fallen, B/C können länger hoch bleiben. Genaues Ausmaß und dauerhaftes Schwingen sind ohne Parameter nicht bestimmbar. Zeit4 ist eine partielle Erholung, kein Beweis eines stabilen Zyklus.",
      "expectedPerformanceEn": "The loop has two activating and one inhibiting edges, hence negative feedback. Initially A rises; B/C rise with delay, C inhibits A, then B/C decrease and A can recover under S. Removing C⊣A removes this brake; all else equal, A should fall less, and B/C may remain high longer. Exact magnitude and sustained oscillation cannot be determined without parameters. Time4 shows partial recovery, not proof of a stable cycle.",
      "understandingFocusDe": "Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.",
      "understandingFocusEn": "A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator."
    },
    {
      "id": "network-feedforward-versus-feedback",
      "taskDemandDe": "Vergleiche den direkten und indirekten A→G-Pfad. Ist das erste Netzwerk eine Rückkopplung? Erkläre den Puls und unterscheide ihn vom möglichen Verlauf in F. Entwerfe eine gezielte Störung zur Prüfung des verzögerten Pfads.",
      "taskDemandEn": "Compare the direct and indirect A→G paths. Is the first network feedback? Explain the pulse and distinguish it from the possible behavior of F. Design a targeted perturbation to test the delayed path.",
      "expectedPerformanceDe": "Der direkte Pfad aktiviert, der indirekte A→R⊣G hemmt. Dies ist ein Feedforward mit entgegengesetzten Wirkungen, keine geschlossene Rückkopplung, weil nichts zu A zurückführt. Der direkte Pfad startet schnell, R begrenzt später die Transkription. F hat dagegen eine Schleife A→G/P⊣A. Gezielte Blockade von R bei gleichem A sollte die spätere G-Abnahme vermindern; ein Pulseffekt allein beweist die Motifstruktur nicht.",
      "expectedPerformanceEn": "The direct path activates; indirect A→R⊣G inhibits. This is feedforward with opposing effects rather than closed feedback, since nothing returns to A. The direct path acts quickly; R later limits transcription. F instead contains A→G/P⊣A. Specific blockade of R with the same A should reduce the later G decline; a pulse alone does not prove the network structure.",
      "understandingFocusDe": "Ein regulatorisches Netzwerk enthält gerichtete Aktivierungen und Hemmungen; eine Rückkopplung führt zum Ausgangsregulator zurück.",
      "understandingFocusEn": "A regulatory network contains directed activation and inhibition; a feedback loop returns to its starting regulator."
    }
  ]
}

## 7975e43b-1187-5ae3-a1ab-282fc3c0548c

### regulation-operon-and-promoter — Zwei Wege zur gleichen Genaktivität

**materialDe**

Gegebene vereinfachte Modelle. Bakterium: Ein Repressor am Operator behindert die Transkription dreier Gene für Substratabbau. InduktorI bindet den Repressor und verhindert Operatorbindung. OhneI mRNA niedrig, mitI hoch; weitere Nährstoffregulation ist hier ausgeblendet. Eukaryotische Kultur: DNA-Sequenz unverändert; ein methylierter Promotor bindet in diesem Fall repressiv wirkende Proteine und ist wenig zugänglich. Demethylierung erhöht Zugang; ein vorhandener Aktivator ermöglicht höhere mRNA. Messpaare vor/nach: Methylierung80%/20%, Zugang15%/65%, mRNA4/32. Alle Werte sind synthetisch.

**materialEn**

Supplied simplified models. Bacterium: a repressor at the operator obstructs transcription of three substrate-degradation genes. InducerI binds the repressor and prevents operator binding. WithoutI mRNA is low; withI it is high; other nutrient regulation is omitted. Eukaryotic culture: DNA sequence is unchanged; in this case a methylated promoter recruits repressive proteins and is poorly accessible. Demethylation increases access; an existing activator permits more mRNA. Before/after measurements: methylation80%/20%, access15%/65%, mRNA4/32. All values are synthetic.

**taskDe**

Erkläre getrennt die beiden Mechanismen vom Eingriff bis zur Transkription. Weshalb ist die eukaryotische Änderung keine nachgewiesene Mutation? Sage beiI-Entfernung die Operonreaktion voraus; ist eine ebenso schnelle Rückkehr des eukaryotischen Zustands zwingend?

**taskEn**

Explain each mechanism from intervention to transcription. Why is the eukaryotic change not an established mutation? Predict the operon response whenI is removed; must the eukaryotic state return equally quickly?

**workedSolutionDe**

I hebt die Repressorbindung auf und ermöglicht koordinierte Transkription der Gene. Demethylierung verändert in diesem Modell die regulatorische Umgebung und den Zugang, nicht die Basenfolge; die vorhandene Aktivatorwirkung bleibt nötig. NachI-Entfernung kann der intakte Repressor wieder binden und Neutranskription senken, wobei bestehende mRNA/Proteine erst abgebaut werden. Epigenetische Zustände können andere Erhaltungszeiten haben; die zwei Messpunkte geben ihre Rückkehrgeschwindigkeit nicht vor.

**workedSolutionEn**

I releases repressor binding and enables coordinated transcription of the genes. In this model demethylation changes the regulatory environment and access rather than the base sequence; the existing activator is still required. RemovingI allows an intact repressor to bind again and reduce new transcription, while existing mRNA/proteins take time to decay. Epigenetic states can have different persistence; two measurements do not specify recovery speed.

**freshTransferDe**

Neue Störung: Beim Bakterium ist der Operator so verändert, dass der Repressor nicht bindet. In der Kultur fehlt nun der Aktivator trotz niedriger Promotormethylierung. Vergleiche für beide Systeme die vorhergesagte mRNA bei Reiz an/aus und begründe, weshalb offener Zugang und fehlender Repressor nicht identische Stellstellen sind.

**freshTransferEn**

New perturbation: the bacterial operator is altered so the repressor cannot bind. In the culture the activator is now absent despite low promoter methylation. Compare predicted mRNA with input on/off for each system and explain why open access and an absent repressor are not the same control point.

**freshTransferSolutionDe**

Beim Operon ist Repression im Modell nicht mehr möglich, daher bleibt Transkription auch ohneI relativ hoch, sofern die übrige Transkriptionsmaschinerie funktioniert. Der eukaryotische Zugang bleibt günstig, aber ohne Aktivator kann mRNA niedrig sein. Mutationsbedingte Operatoränderung und epigenetische Zugangskontrolle sind zu trennen; eine hohe mRNA ist kein eindeutiger Mechanismusnachweis.

**freshTransferSolutionEn**

Repression is no longer possible in the operon model, so transcription remains relatively high even withoutI, provided the remaining machinery works. Eukaryotic access remains favorable, but mRNA can be low without the activator. Mutation of the operator and epigenetic access control must be separated; high mRNA alone does not identify a mechanism.

**limitsDe**

Das Operon ist ein vorgegebenes Modell negativer Genregulation durch einen Repressor und kein vollständiges lac-Operon. Promotormethylierung wirkt hier repressiv; keine pauschale Aussage über alle Methylierungen oder transgenerationale Vererbung.

**limitsEn**

The operon is a supplied model of negative gene regulation by a repressor rather than a complete lac operon. Promoter methylation is repressive here; no universal claim about all methylation or transgenerational inheritance is made.

**Rubrik**

{"id": "operon", "expectationIds": ["operon"], "criterionDe": "Die lernende Person erklärt Operator, Repressor und Induktor anhand der gegebenen Bindungsregeln und begründet eine veränderte Transkription.", "criterionEn": "The learner explains operator, repressor and inducer using supplied binding rules and justifies changed transcription."}

{"id": "epigenetic", "expectationIds": ["epigenetic"], "criterionDe": "Die lernende Person erläutert DNA-Methylierung oder Histon-Modifikation als Genregulation und trennt Markierung, Genaktivität und Sequenz.", "criterionEn": "The learner explains DNA methylation or histone modification as gene regulation and separates marking, gene activity and sequence."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person überträgt beide Beispiele auf einen neuen Eingriff und begrenzt die Aussage auf das gegebene Modell.", "criterionEn": "The learner transfers both examples to a new intervention and limits the conclusion to the supplied model."}

**Ganzes positives Profil**

{
  "archetype": "concept",
  "expectations": [
    {
      "id": "operon",
      "essentialUnderstandingDe": "Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.",
      "essentialUnderstandingEn": "An operon can coordinate transcription of related genes through regulator binding.",
      "observablePerformanceDe": "Die lernende Person erklärt Operator, Repressor und Induktor anhand der gegebenen Bindungsregeln und begründet eine veränderte Transkription.",
      "observablePerformanceEn": "The learner explains operator, repressor and inducer using supplied binding rules and justifies changed transcription."
    },
    {
      "id": "epigenetic",
      "essentialUnderstandingDe": "Epigenetische Mechanismen verändern regulatorische Bedingungen ohne notwendige Änderung der DNA-Basenfolge.",
      "essentialUnderstandingEn": "Epigenetic mechanisms alter regulatory conditions without necessarily changing DNA sequence.",
      "observablePerformanceDe": "Die lernende Person erläutert DNA-Methylierung oder Histon-Modifikation als Genregulation und trennt Markierung, Genaktivität und Sequenz.",
      "observablePerformanceEn": "The learner explains DNA methylation or histone modification as gene regulation and separates marking, gene activity and sequence."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Gleiche DNA kann unterschiedlich reguliert werden; Störungen an unterschiedlichen Stellstellen haben unterschiedliche Vorhersagen.",
      "essentialUnderstandingEn": "Identical DNA can be regulated differently; perturbations at different control points have different predictions.",
      "observablePerformanceDe": "Die lernende Person überträgt beide Beispiele auf einen neuen Eingriff und begrenzt die Aussage auf das gegebene Modell.",
      "observablePerformanceEn": "The learner transfers both examples to a new intervention and limits the conclusion to the supplied model."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "operon",
      "epigenetic",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "system",
      "textDe": "Bakterielles Operon und eukaryotischer Promotor",
      "textEn": "Bacterial operon and eukaryotic promoter"
    },
    {
      "id": "time",
      "textDe": "Reizende, Mutation und persistierende Markierung",
      "textEn": "Input removal, mutation and persistent marking"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "regulation-operon-and-promoter",
      "taskDemandDe": "Erkläre getrennt die beiden Mechanismen vom Eingriff bis zur Transkription. Weshalb ist die eukaryotische Änderung keine nachgewiesene Mutation? Sage beiI-Entfernung die Operonreaktion voraus; ist eine ebenso schnelle Rückkehr des eukaryotischen Zustands zwingend?",
      "taskDemandEn": "Explain each mechanism from intervention to transcription. Why is the eukaryotic change not an established mutation? Predict the operon response whenI is removed; must the eukaryotic state return equally quickly?",
      "expectedPerformanceDe": "I hebt die Repressorbindung auf und ermöglicht koordinierte Transkription der Gene. Demethylierung verändert in diesem Modell die regulatorische Umgebung und den Zugang, nicht die Basenfolge; die vorhandene Aktivatorwirkung bleibt nötig. NachI-Entfernung kann der intakte Repressor wieder binden und Neutranskription senken, wobei bestehende mRNA/Proteine erst abgebaut werden. Epigenetische Zustände können andere Erhaltungszeiten haben; die zwei Messpunkte geben ihre Rückkehrgeschwindigkeit nicht vor.",
      "expectedPerformanceEn": "I releases repressor binding and enables coordinated transcription of the genes. In this model demethylation changes the regulatory environment and access rather than the base sequence; the existing activator is still required. RemovingI allows an intact repressor to bind again and reduce new transcription, while existing mRNA/proteins take time to decay. Epigenetic states can have different persistence; two measurements do not specify recovery speed.",
      "understandingFocusDe": "Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.",
      "understandingFocusEn": "An operon can coordinate transcription of related genes through regulator binding."
    },
    {
      "id": "regulation-cell-states-and-constitutive-operon",
      "taskDemandDe": "Erläutere die epigenetische Erklärung der Zelltypen und die Operon-Erklärung der Mutante. Trenne in beiden Fällen Daten, gegebene Mechanismen und noch offene Ursachen. Warum ist mehr mRNA keine ausreichende Aussage über eine DNA-Mutation?",
      "taskDemandEn": "Explain the epigenetic account of the cell types and the operon account of the mutant. Separate data, supplied mechanisms and unresolved causes in both cases. Why is more mRNA insufficient evidence of a DNA mutation?",
      "expectedPerformanceDe": "Die Zelltypen können unterschiedliche Histonmarken und Zugang bei gleicher DNA haben; Acetylierung passt hier zu erhöhter Zugänglichkeit, doch der Wirkstoffvergleich allein beweist nicht jeden kausalen Schritt. O verändert dagegen die DNA-Bindungsstelle; der Repressor bleibt funktionsfähig, kann dort jedoch nicht hemmen. mRNA ist ein Ergebnis mehrerer Regulationswege und zeigt allein keine Sequenzänderung.",
      "expectedPerformanceEn": "Cell types can have different histone marks and access with identical DNA; acetylation fits increased accessibility here, but the drug comparison alone does not prove every causal step. O instead changes the DNA binding site; the repressor still functions but cannot inhibit there. mRNA is an outcome of multiple regulatory routes and alone shows no sequence change.",
      "understandingFocusDe": "Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.",
      "understandingFocusEn": "An operon can coordinate transcription of related genes through regulator binding."
    }
  ]
}

### regulation-cell-states-and-constitutive-operon — Zellzustand und eine bleibende Operatoränderung

**materialDe**

Zwei synthetische Zelltypen besitzen dieselbe DNA-Sequenz an GenG. TypA: Histonacetylierung am Promotor hoch, Zugang hoch, mRNA50. TypB: Acetylierung niedrig, Zugang niedrig, mRNA5. Ein Wirkstoff erhöht in B Acetylierung und mRNA auf40; direkte Nebeneffekte sind noch ungeprüft. Bakterienvergleich: Wildtyp-operon zeigt mitI hohe, ohneI niedrige Transkription gemäß Repressorregel. MutanteO zeigt in beiden Bedingungen hohe Transkription; gegeben ist eine Operator-Basenänderung, die Repressorbindung verhindert. I bindet den Repressor weiterhin.

**materialEn**

Two synthetic cell types have the same DNA sequence at geneG. TypeA: high promoter histone acetylation, high access, mRNA50. TypeB: low acetylation, low access, mRNA5. A compound raises acetylation and mRNA in B to40; direct off-target effects remain untested. Bacterial comparison: wild-type operon shows high transcription withI and low withoutI under the repressor rule. MutantO shows high transcription in both conditions; a supplied operator base change prevents repressor binding. I still binds the repressor.

**taskDe**

Erläutere die epigenetische Erklärung der Zelltypen und die Operon-Erklärung der Mutante. Trenne in beiden Fällen Daten, gegebene Mechanismen und noch offene Ursachen. Warum ist mehr mRNA keine ausreichende Aussage über eine DNA-Mutation?

**taskEn**

Explain the epigenetic account of the cell types and the operon account of the mutant. Separate data, supplied mechanisms and unresolved causes in both cases. Why is more mRNA insufficient evidence of a DNA mutation?

**workedSolutionDe**

Die Zelltypen können unterschiedliche Histonmarken und Zugang bei gleicher DNA haben; Acetylierung passt hier zu erhöhter Zugänglichkeit, doch der Wirkstoffvergleich allein beweist nicht jeden kausalen Schritt. O verändert dagegen die DNA-Bindungsstelle; der Repressor bleibt funktionsfähig, kann dort jedoch nicht hemmen. mRNA ist ein Ergebnis mehrerer Regulationswege und zeigt allein keine Sequenzänderung.

**workedSolutionEn**

Cell types can have different histone marks and access with identical DNA; acetylation fits increased accessibility here, but the drug comparison alone does not prove every causal step. O instead changes the DNA binding site; the repressor still functions but cannot inhibit there. mRNA is an outcome of multiple regulatory routes and alone shows no sequence change.

**freshTransferDe**

Nach Auswaschen des Wirkstoffs fallen in B nach24h Acetylierung und mRNA auf den Ausgangswert. In O bleibt hohe Transkription über fünf Teilungen ohneI erhalten; der Operator wurde sequenziert und behält seine Änderung. Deute die unterschiedlichen Zeitverläufe und nenne eine Kontrolle gegen Verwechslung von epigenetischem Zustand und Mutation.

**freshTransferEn**

After drug washout, acetylation and mRNA in B return to baseline after24h. O retains high transcription through five divisions withoutI; sequencing shows its operator change remains. Interpret the different time courses and name a control against confusing epigenetic state with mutation.

**freshTransferSolutionDe**

B zeigt unter diesen Bedingungen reversible Regulation; dies widerspricht nicht der möglichen Persistenz anderer epigenetischer Zustände. O hat eine bestätigte, weitergegebene Operator-Sequenzänderung und bleibt im Modell dereprimiert. Vergleich der Basensequenz und Markierungen vor/nach, mit unbehandelten Kontrollkulturen, unterscheidet die Erklärungen. Persistenz allein würde Mutation nicht beweisen.

**freshTransferSolutionEn**

B shows reversible regulation under these conditions; this does not contradict persistence of other epigenetic states. O has a confirmed transmitted operator sequence change and remains derepressed in the model. Comparing base sequence and marks before/after with untreated controls distinguishes the accounts. Persistence alone would not prove mutation.

**limitsDe**

Keine klinische Wirkstoffempfehlung; keine reale Untersuchung. Histonacetylierung ist ein erklärtes Beispiel, DNA-Sequenz und Regulation werden getrennt.

**limitsEn**

No clinical compound recommendation or real experiment is claimed. Histone acetylation is an explained example; DNA sequence and regulation remain distinct.

**Rubrik**

{"id": "operon", "expectationIds": ["operon"], "criterionDe": "Die lernende Person erklärt Operator, Repressor und Induktor anhand der gegebenen Bindungsregeln und begründet eine veränderte Transkription.", "criterionEn": "The learner explains operator, repressor and inducer using supplied binding rules and justifies changed transcription."}

{"id": "epigenetic", "expectationIds": ["epigenetic"], "criterionDe": "Die lernende Person erläutert DNA-Methylierung oder Histon-Modifikation als Genregulation und trennt Markierung, Genaktivität und Sequenz.", "criterionEn": "The learner explains DNA methylation or histone modification as gene regulation and separates marking, gene activity and sequence."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person überträgt beide Beispiele auf einen neuen Eingriff und begrenzt die Aussage auf das gegebene Modell.", "criterionEn": "The learner transfers both examples to a new intervention and limits the conclusion to the supplied model."}

**Ganzes positives Profil**

{
  "archetype": "concept",
  "expectations": [
    {
      "id": "operon",
      "essentialUnderstandingDe": "Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.",
      "essentialUnderstandingEn": "An operon can coordinate transcription of related genes through regulator binding.",
      "observablePerformanceDe": "Die lernende Person erklärt Operator, Repressor und Induktor anhand der gegebenen Bindungsregeln und begründet eine veränderte Transkription.",
      "observablePerformanceEn": "The learner explains operator, repressor and inducer using supplied binding rules and justifies changed transcription."
    },
    {
      "id": "epigenetic",
      "essentialUnderstandingDe": "Epigenetische Mechanismen verändern regulatorische Bedingungen ohne notwendige Änderung der DNA-Basenfolge.",
      "essentialUnderstandingEn": "Epigenetic mechanisms alter regulatory conditions without necessarily changing DNA sequence.",
      "observablePerformanceDe": "Die lernende Person erläutert DNA-Methylierung oder Histon-Modifikation als Genregulation und trennt Markierung, Genaktivität und Sequenz.",
      "observablePerformanceEn": "The learner explains DNA methylation or histone modification as gene regulation and separates marking, gene activity and sequence."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Gleiche DNA kann unterschiedlich reguliert werden; Störungen an unterschiedlichen Stellstellen haben unterschiedliche Vorhersagen.",
      "essentialUnderstandingEn": "Identical DNA can be regulated differently; perturbations at different control points have different predictions.",
      "observablePerformanceDe": "Die lernende Person überträgt beide Beispiele auf einen neuen Eingriff und begrenzt die Aussage auf das gegebene Modell.",
      "observablePerformanceEn": "The learner transfers both examples to a new intervention and limits the conclusion to the supplied model."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "operon",
      "epigenetic",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "system",
      "textDe": "Bakterielles Operon und eukaryotischer Promotor",
      "textEn": "Bacterial operon and eukaryotic promoter"
    },
    {
      "id": "time",
      "textDe": "Reizende, Mutation und persistierende Markierung",
      "textEn": "Input removal, mutation and persistent marking"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "regulation-operon-and-promoter",
      "taskDemandDe": "Erkläre getrennt die beiden Mechanismen vom Eingriff bis zur Transkription. Weshalb ist die eukaryotische Änderung keine nachgewiesene Mutation? Sage beiI-Entfernung die Operonreaktion voraus; ist eine ebenso schnelle Rückkehr des eukaryotischen Zustands zwingend?",
      "taskDemandEn": "Explain each mechanism from intervention to transcription. Why is the eukaryotic change not an established mutation? Predict the operon response whenI is removed; must the eukaryotic state return equally quickly?",
      "expectedPerformanceDe": "I hebt die Repressorbindung auf und ermöglicht koordinierte Transkription der Gene. Demethylierung verändert in diesem Modell die regulatorische Umgebung und den Zugang, nicht die Basenfolge; die vorhandene Aktivatorwirkung bleibt nötig. NachI-Entfernung kann der intakte Repressor wieder binden und Neutranskription senken, wobei bestehende mRNA/Proteine erst abgebaut werden. Epigenetische Zustände können andere Erhaltungszeiten haben; die zwei Messpunkte geben ihre Rückkehrgeschwindigkeit nicht vor.",
      "expectedPerformanceEn": "I releases repressor binding and enables coordinated transcription of the genes. In this model demethylation changes the regulatory environment and access rather than the base sequence; the existing activator is still required. RemovingI allows an intact repressor to bind again and reduce new transcription, while existing mRNA/proteins take time to decay. Epigenetic states can have different persistence; two measurements do not specify recovery speed.",
      "understandingFocusDe": "Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.",
      "understandingFocusEn": "An operon can coordinate transcription of related genes through regulator binding."
    },
    {
      "id": "regulation-cell-states-and-constitutive-operon",
      "taskDemandDe": "Erläutere die epigenetische Erklärung der Zelltypen und die Operon-Erklärung der Mutante. Trenne in beiden Fällen Daten, gegebene Mechanismen und noch offene Ursachen. Warum ist mehr mRNA keine ausreichende Aussage über eine DNA-Mutation?",
      "taskDemandEn": "Explain the epigenetic account of the cell types and the operon account of the mutant. Separate data, supplied mechanisms and unresolved causes in both cases. Why is more mRNA insufficient evidence of a DNA mutation?",
      "expectedPerformanceDe": "Die Zelltypen können unterschiedliche Histonmarken und Zugang bei gleicher DNA haben; Acetylierung passt hier zu erhöhter Zugänglichkeit, doch der Wirkstoffvergleich allein beweist nicht jeden kausalen Schritt. O verändert dagegen die DNA-Bindungsstelle; der Repressor bleibt funktionsfähig, kann dort jedoch nicht hemmen. mRNA ist ein Ergebnis mehrerer Regulationswege und zeigt allein keine Sequenzänderung.",
      "expectedPerformanceEn": "Cell types can have different histone marks and access with identical DNA; acetylation fits increased accessibility here, but the drug comparison alone does not prove every causal step. O instead changes the DNA binding site; the repressor still functions but cannot inhibit there. mRNA is an outcome of multiple regulatory routes and alone shows no sequence change.",
      "understandingFocusDe": "Ein Operon kann zusammengehörige Gene durch Regulatorbindung koordiniert transkribieren.",
      "understandingFocusEn": "An operon can coordinate transcription of related genes through regulator binding."
    }
  ]
}

## 99544494-1825-5fc1-8e23-56f0df808e56

### epigenetic-promoter-and-acetylation — Zwei chemische Eingriffe am selben Gen

**materialDe**

Synthetische Kulturen mit gleicher GenG-Basenfolge und gleichem Aktivator. Kontrollkultur: Promotor-DNA-Methylierung75%, Histonacetylierung niedrig, Zugang20%, mRNA4. Nur gezielte Promotordemethylierung: Methylierung20%, Acetylierung niedrig, Zugang45%, mRNA18. Nur erhöhte Histonacetylierung: Methylierung75%, Acetylierung hoch, Zugang50%, mRNA22. Beide: Methylierung20%, Acetylierung hoch, Zugang80%, mRNA45. Gegeben: Methylgruppen am Promotor fördern hier die Bindung repressiver Proteine; Acetylierung kann Histon-DNA-Wechselwirkung und Rekrutierung beeinflussen. Replikate fehlen, Werte sind illustrative Mittelwerte.

**materialEn**

Synthetic cultures with identical geneG base sequence and activator. Control: promoter DNA methylation75%, low histone acetylation, access20%, mRNA4. Targeted promoter demethylation only: methylation20%, low acetylation, access45%, mRNA18. Increased histone acetylation only: methylation75%, high acetylation, access50%, mRNA22. Both: methylation20%, high acetylation, access80%, mRNA45. Supplied mechanism: promoter methyl groups promote repressive-protein binding here; acetylation can affect histone-DNA interaction and recruitment. Replicates are absent and values are illustrative means.

**taskDe**

Erkläre die zwei Mechanismen mit modifiziertem Molekül und möglicher Transkriptionsfolge. Begründe, warum mRNA45 keine Addition unabhängiger Effekte beweist. Prüfe die Aussage: Demethylierung ist eine Genmutation.

**taskEn**

Explain both mechanisms, identifying the modified molecule and possible transcriptional consequence. Explain why mRNA45 does not prove additive independent effects. Evaluate: demethylation is a gene mutation.

**workedSolutionDe**

Demethylierung betrifft Methylgruppen an DNA, Acetylierung chemische Gruppen an Histonen. Hier reduzieren sie repressive Bindung beziehungsweise erleichtern Zugang/Rekrutierung, sodass bei gegebenem Aktivator mehr mRNA entstehen kann. Die Basenfolge bleibt gleich; Markierungsänderung ist keine nachgewiesene Mutation. Einzelwerte18/22 und Doppelwert45 sind ohne Replikate und weitere Kontrollen kein Nachweis additiver oder unabhängiger Mechanismen; beide können dieselbe Zugangsbedingung beeinflussen.

**workedSolutionEn**

Demethylation changes methyl groups on DNA; acetylation changes chemical groups on histones. Here they reduce repressive binding or facilitate access/recruitment, permitting more mRNA with the supplied activator. Base sequence stays unchanged; altered marking is not an established mutation. Single values18/22 and combined45, without replicates and further controls, do not establish additive or independent mechanisms; both can affect the same accessibility condition.

**freshTransferDe**

Nach Auswaschen der Acetylierungsbehandlung fällt Acetylierung auf niedrig, DNA-Methylierung bleibt20%; mRNA sinkt von45 auf19. Nach erneutem Methylieren des Promotors sinkt sie auf4. Erläutere die getrennten Beiträge und nenne einen Kontrollversuch gegen direkte Wirkstoffeffekte auf die RNA-Polymerase.

**freshTransferEn**

After acetylation treatment washout, acetylation becomes low, DNA methylation stays20%, and mRNA falls from45 to19. Restoring promoter methylation lowers it to4. Explain the separate contributions and name a control against direct drug effects on RNA polymerase.

**freshTransferSolutionDe**

Die erste Änderung passt zum Wegfall des Acetylierungsbeitrags bei weiterhin demethyliertem Promotor; die zweite zum erneuten repressiven Promotorzustand. Ein nicht betroffenes, zugängliches Kontrollgen oder unabhängige gezielte Enzymmanipulation plus Polymerasefunktionstest kann direkte Medikamentenwirkungen prüfen. Zeitfolge und passende Werte stützen, beweisen aber nicht jede Zwischenstufe.

**freshTransferSolutionEn**

The first change fits loss of the acetylation contribution while the promoter remains demethylated; the second fits restoration of a repressive promoter state. An unaffected accessible control gene or independent targeted enzyme manipulation together with a polymerase-function test can test direct compound effects. Timing and matching values support but do not prove every intermediate step.

**limitsDe**

Promotorkontext ist gegeben; Genkörpermethylierung und alle Histonstellen dürfen nicht gleich bewertet werden. Keine Arzneimittelanwendung oder menschliche Vererbungsprognose.

**limitsEn**

Promoter context is supplied; gene-body methylation and every histone site must not be treated identically. No drug use or human inheritance prediction is involved.

**Rubrik**

{"id": "marks", "expectationIds": ["marks"], "criterionDe": "Die lernende Person benennt das modifizierte Molekül und erläutert den gegebenen Zusammenhang von Methylierung, Acetylierung, Zugang und Transkription.", "criterionEn": "The learner identifies the modified molecule and explains the supplied links between methylation, acetylation, accessibility and transcription."}

{"id": "mechanism", "expectationIds": ["mechanism"], "criterionDe": "Die lernende Person trennt die Messgrößen, berücksichtigt Kontrollen und vermeidet universelle Methylierungs- oder Acetylierungsschalter.", "criterionEn": "The learner separates measurements, considers controls and avoids universal methylation or acetylation switches."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe und begrenzt die Übertragung auf das tatsächlich untersuchte System.", "criterionEn": "The learner interprets a new mark or time series and limits transfer to the system actually studied."}

**Ganzes positives Profil**

{
  "archetype": "concept",
  "expectations": [
    {
      "id": "marks",
      "essentialUnderstandingDe": "DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.",
      "essentialUnderstandingEn": "DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way.",
      "observablePerformanceDe": "Die lernende Person benennt das modifizierte Molekül und erläutert den gegebenen Zusammenhang von Methylierung, Acetylierung, Zugang und Transkription.",
      "observablePerformanceEn": "The learner identifies the modified molecule and explains the supplied links between methylation, acetylation, accessibility and transcription."
    },
    {
      "id": "mechanism",
      "essentialUnderstandingDe": "Epigenetische Regulation benötigt keine Änderung der Basenfolge; ein Zusammenhang zwischen Markierung und mRNA beweist nicht allein die Ursache.",
      "essentialUnderstandingEn": "Epigenetic regulation requires no change of base sequence; a mark-mRNA association alone does not prove causation.",
      "observablePerformanceDe": "Die lernende Person trennt die Messgrößen, berücksichtigt Kontrollen und vermeidet universelle Methylierungs- oder Acetylierungsschalter.",
      "observablePerformanceEn": "The learner separates measurements, considers controls and avoids universal methylation or acetylation switches."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Erhaltung eines Zellzustands und Vererbung zwischen Organismengenerationen sind verschiedene Behauptungen.",
      "essentialUnderstandingEn": "Maintenance of a cellular state and inheritance across organism generations are different claims.",
      "observablePerformanceDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe und begrenzt die Übertragung auf das tatsächlich untersuchte System.",
      "observablePerformanceEn": "The learner interprets a new mark or time series and limits transfer to the system actually studied."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "marks",
      "mechanism",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "molecule",
      "textDe": "DNA-Methylierung gegenüber Histonacetylierung und positionsabhängiger Histonmethylierung",
      "textEn": "DNA methylation versus histone acetylation and site-dependent histone methylation"
    },
    {
      "id": "persistence",
      "textDe": "Reversible Änderung und Zellteilungs-Erhaltung",
      "textEn": "Reversible change and maintenance through cell division"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "epigenetic-promoter-and-acetylation",
      "taskDemandDe": "Erkläre die zwei Mechanismen mit modifiziertem Molekül und möglicher Transkriptionsfolge. Begründe, warum mRNA45 keine Addition unabhängiger Effekte beweist. Prüfe die Aussage: Demethylierung ist eine Genmutation.",
      "taskDemandEn": "Explain both mechanisms, identifying the modified molecule and possible transcriptional consequence. Explain why mRNA45 does not prove additive independent effects. Evaluate: demethylation is a gene mutation.",
      "expectedPerformanceDe": "Demethylierung betrifft Methylgruppen an DNA, Acetylierung chemische Gruppen an Histonen. Hier reduzieren sie repressive Bindung beziehungsweise erleichtern Zugang/Rekrutierung, sodass bei gegebenem Aktivator mehr mRNA entstehen kann. Die Basenfolge bleibt gleich; Markierungsänderung ist keine nachgewiesene Mutation. Einzelwerte18/22 und Doppelwert45 sind ohne Replikate und weitere Kontrollen kein Nachweis additiver oder unabhängiger Mechanismen; beide können dieselbe Zugangsbedingung beeinflussen.",
      "expectedPerformanceEn": "Demethylation changes methyl groups on DNA; acetylation changes chemical groups on histones. Here they reduce repressive binding or facilitate access/recruitment, permitting more mRNA with the supplied activator. Base sequence stays unchanged; altered marking is not an established mutation. Single values18/22 and combined45, without replicates and further controls, do not establish additive or independent mechanisms; both can affect the same accessibility condition.",
      "understandingFocusDe": "DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.",
      "understandingFocusEn": "DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way."
    },
    {
      "id": "epigenetic-mark-context-and-maintenance",
      "taskDemandDe": "Vergleiche DNA-Methylierung, die zwei Histon-Methylierungen und Acetylierung. Welche Beobachtung widerlegt Methylierung ist immer repressiv? Was belegt die Zellreihe über Erhaltung und was nicht über Eltern und Kinder?",
      "taskDemandEn": "Compare DNA methylation, the two histone methylations and acetylation. Which observation contradicts methylation is always repressive? What does the cell lineage show about maintenance and what does it not show about parents and children?",
      "expectedPerformanceDe": "A zeigt eine repressive Promotor-DNA-Markierung, B hat je nach Histonstelle unterschiedliche Aktivitätskontexte; hoheK4-Methylierung mit mRNA40 widerlegt den pauschalen Satz. Acetylierung ist eine andere chemische Histonänderung, hier mit höherem Zugang verbunden. Erhaltung in drei Zellteilungen passt zu einem weitergeführten zellulären Zustand. Keimzellen, Embryonen und Organismengenerationen wurden nicht untersucht; daher keine belegte transgenerationale Vererbung.",
      "expectedPerformanceEn": "A has a repressive promoter DNA mark; B has different activity contexts at different histone sites; highK4 methylation with mRNA40 contradicts the blanket claim. Acetylation is a different chemical histone change, associated with greater access here. Persistence across three divisions fits a maintained cellular state. Germ cells, embryos and organism generations were not studied, so transgenerational inheritance is not established.",
      "understandingFocusDe": "DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.",
      "understandingFocusEn": "DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way."
    }
  ]
}

### epigenetic-mark-context-and-maintenance — Eine Markierung bleibt über Zellteilungen

**materialDe**

Synthetische Kulturen mit identischer DNA. GenA: hohe Promotor-DNA-Methylierung, mRNA3; nach gezielter Demethylierung mRNA30. GenB: Histon-Methylierung an StelleK4 ist laut gegebenem Modell mit aktivem Promotor verbunden, mRNA40; Histon-Methylierung an StelleK27 mit repressivem Zustand, mRNA4. Histonacetylierung erhöht im repressiven B-Zustand die Zugänglichkeit, mRNA steigt auf20 bei vorhandenem Aktivator. In einer zusätzlichen Zellreihe bleibt ein methylierter A-Promotor sechs Tage und drei Zellteilungen methylierungsreich; die Sequenz ändert sich nicht. Alle Zahlen sind konstruiert.

**materialEn**

Synthetic cultures with identical DNA. GeneA: high promoter DNA methylation, mRNA3; targeted demethylation gives mRNA30. GeneB: histone methylation at siteK4 is associated with an active promoter in the supplied model, mRNA40; histone methylation at siteK27 with repression, mRNA4. Histone acetylation increases accessibility in repressed B, raising mRNA to20 with activator present. In an additional cell lineage the methylated A promoter stays highly methylated for six days and three divisions; sequence does not change. All numbers are constructed.

**taskDe**

Vergleiche DNA-Methylierung, die zwei Histon-Methylierungen und Acetylierung. Welche Beobachtung widerlegt Methylierung ist immer repressiv? Was belegt die Zellreihe über Erhaltung und was nicht über Eltern und Kinder?

**taskEn**

Compare DNA methylation, the two histone methylations and acetylation. Which observation contradicts methylation is always repressive? What does the cell lineage show about maintenance and what does it not show about parents and children?

**workedSolutionDe**

A zeigt eine repressive Promotor-DNA-Markierung, B hat je nach Histonstelle unterschiedliche Aktivitätskontexte; hoheK4-Methylierung mit mRNA40 widerlegt den pauschalen Satz. Acetylierung ist eine andere chemische Histonänderung, hier mit höherem Zugang verbunden. Erhaltung in drei Zellteilungen passt zu einem weitergeführten zellulären Zustand. Keimzellen, Embryonen und Organismengenerationen wurden nicht untersucht; daher keine belegte transgenerationale Vererbung.

**workedSolutionEn**

A has a repressive promoter DNA mark; B has different activity contexts at different histone sites; highK4 methylation with mRNA40 contradicts the blanket claim. Acetylation is a different chemical histone change, associated with greater access here. Persistence across three divisions fits a maintained cellular state. Germ cells, embryos and organism generations were not studied, so transgenerational inheritance is not established.

**freshTransferDe**

Eine neue Kontrollreihe schaltet die Aufrechterhaltung der DNA-Methylierung ab. Nach drei weiteren Teilungen ist die Promotormethylierung niedrig, mRNA steigt nur bei vorhandenem Aktivator; ohne Aktivator bleibt sie3. Deute dies und prüfe: Erhaltene Methylierung ist die einzige Bedingung der Genaktivität.

**freshTransferEn**

A new control lineage disables maintenance of DNA methylation. After three more divisions promoter methylation is low; mRNA rises only with activator, while without activator it remains3. Interpret this and evaluate: maintained methylation is the only condition determining gene activity.

**freshTransferSolutionDe**

Die neue Reihe passt zu einer erforderlichen Erhaltungsfunktion und einem repressiven Beitrag der Promotormethylierung; ohne Aufrechterhaltung kann der Zustand nach Teilungen verloren gehen. Niedrige Methylierung ist jedoch ohne Aktivator nicht hinreichend. Zugang, Regulatoren und übrige Transkriptionsmaschinerie bleiben eigene Bedingungen; Zellen an einem Gen erlauben keine automatische Eltern-Kind-Aussage.

**freshTransferSolutionEn**

The new lineage fits a maintenance requirement and a repressive contribution of promoter methylation; the state can be lost after divisions without maintenance. Low methylation is nevertheless insufficient without an activator. Accessibility, regulators and remaining transcription machinery are separate conditions; cells at one gene do not imply a parent-child inheritance claim.

**limitsDe**

StellenK4/K27 und Erhaltungsregeln sind gegeben. Dies ist kein Histoncode-/Enzymnamen-Quiz; reale generationenübergreifende Umweltvererbung bleibt unbelegt.

**limitsEn**

SitesK4/K27 and maintenance rules are supplied. This is not a histone-code/enzyme-name quiz; real cross-generation environmental inheritance remains unproven.

**Rubrik**

{"id": "marks", "expectationIds": ["marks"], "criterionDe": "Die lernende Person benennt das modifizierte Molekül und erläutert den gegebenen Zusammenhang von Methylierung, Acetylierung, Zugang und Transkription.", "criterionEn": "The learner identifies the modified molecule and explains the supplied links between methylation, acetylation, accessibility and transcription."}

{"id": "mechanism", "expectationIds": ["mechanism"], "criterionDe": "Die lernende Person trennt die Messgrößen, berücksichtigt Kontrollen und vermeidet universelle Methylierungs- oder Acetylierungsschalter.", "criterionEn": "The learner separates measurements, considers controls and avoids universal methylation or acetylation switches."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe und begrenzt die Übertragung auf das tatsächlich untersuchte System.", "criterionEn": "The learner interprets a new mark or time series and limits transfer to the system actually studied."}

**Ganzes positives Profil**

{
  "archetype": "concept",
  "expectations": [
    {
      "id": "marks",
      "essentialUnderstandingDe": "DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.",
      "essentialUnderstandingEn": "DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way.",
      "observablePerformanceDe": "Die lernende Person benennt das modifizierte Molekül und erläutert den gegebenen Zusammenhang von Methylierung, Acetylierung, Zugang und Transkription.",
      "observablePerformanceEn": "The learner identifies the modified molecule and explains the supplied links between methylation, acetylation, accessibility and transcription."
    },
    {
      "id": "mechanism",
      "essentialUnderstandingDe": "Epigenetische Regulation benötigt keine Änderung der Basenfolge; ein Zusammenhang zwischen Markierung und mRNA beweist nicht allein die Ursache.",
      "essentialUnderstandingEn": "Epigenetic regulation requires no change of base sequence; a mark-mRNA association alone does not prove causation.",
      "observablePerformanceDe": "Die lernende Person trennt die Messgrößen, berücksichtigt Kontrollen und vermeidet universelle Methylierungs- oder Acetylierungsschalter.",
      "observablePerformanceEn": "The learner separates measurements, considers controls and avoids universal methylation or acetylation switches."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Erhaltung eines Zellzustands und Vererbung zwischen Organismengenerationen sind verschiedene Behauptungen.",
      "essentialUnderstandingEn": "Maintenance of a cellular state and inheritance across organism generations are different claims.",
      "observablePerformanceDe": "Die lernende Person deutet eine neue Markierung oder Zeitreihe und begrenzt die Übertragung auf das tatsächlich untersuchte System.",
      "observablePerformanceEn": "The learner interprets a new mark or time series and limits transfer to the system actually studied."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "marks",
      "mechanism",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "molecule",
      "textDe": "DNA-Methylierung gegenüber Histonacetylierung und positionsabhängiger Histonmethylierung",
      "textEn": "DNA methylation versus histone acetylation and site-dependent histone methylation"
    },
    {
      "id": "persistence",
      "textDe": "Reversible Änderung und Zellteilungs-Erhaltung",
      "textEn": "Reversible change and maintenance through cell division"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "epigenetic-promoter-and-acetylation",
      "taskDemandDe": "Erkläre die zwei Mechanismen mit modifiziertem Molekül und möglicher Transkriptionsfolge. Begründe, warum mRNA45 keine Addition unabhängiger Effekte beweist. Prüfe die Aussage: Demethylierung ist eine Genmutation.",
      "taskDemandEn": "Explain both mechanisms, identifying the modified molecule and possible transcriptional consequence. Explain why mRNA45 does not prove additive independent effects. Evaluate: demethylation is a gene mutation.",
      "expectedPerformanceDe": "Demethylierung betrifft Methylgruppen an DNA, Acetylierung chemische Gruppen an Histonen. Hier reduzieren sie repressive Bindung beziehungsweise erleichtern Zugang/Rekrutierung, sodass bei gegebenem Aktivator mehr mRNA entstehen kann. Die Basenfolge bleibt gleich; Markierungsänderung ist keine nachgewiesene Mutation. Einzelwerte18/22 und Doppelwert45 sind ohne Replikate und weitere Kontrollen kein Nachweis additiver oder unabhängiger Mechanismen; beide können dieselbe Zugangsbedingung beeinflussen.",
      "expectedPerformanceEn": "Demethylation changes methyl groups on DNA; acetylation changes chemical groups on histones. Here they reduce repressive binding or facilitate access/recruitment, permitting more mRNA with the supplied activator. Base sequence stays unchanged; altered marking is not an established mutation. Single values18/22 and combined45, without replicates and further controls, do not establish additive or independent mechanisms; both can affect the same accessibility condition.",
      "understandingFocusDe": "DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.",
      "understandingFocusEn": "DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way."
    },
    {
      "id": "epigenetic-mark-context-and-maintenance",
      "taskDemandDe": "Vergleiche DNA-Methylierung, die zwei Histon-Methylierungen und Acetylierung. Welche Beobachtung widerlegt Methylierung ist immer repressiv? Was belegt die Zellreihe über Erhaltung und was nicht über Eltern und Kinder?",
      "taskDemandEn": "Compare DNA methylation, the two histone methylations and acetylation. Which observation contradicts methylation is always repressive? What does the cell lineage show about maintenance and what does it not show about parents and children?",
      "expectedPerformanceDe": "A zeigt eine repressive Promotor-DNA-Markierung, B hat je nach Histonstelle unterschiedliche Aktivitätskontexte; hoheK4-Methylierung mit mRNA40 widerlegt den pauschalen Satz. Acetylierung ist eine andere chemische Histonänderung, hier mit höherem Zugang verbunden. Erhaltung in drei Zellteilungen passt zu einem weitergeführten zellulären Zustand. Keimzellen, Embryonen und Organismengenerationen wurden nicht untersucht; daher keine belegte transgenerationale Vererbung.",
      "expectedPerformanceEn": "A has a repressive promoter DNA mark; B has different activity contexts at different histone sites; highK4 methylation with mRNA40 contradicts the blanket claim. Acetylation is a different chemical histone change, associated with greater access here. Persistence across three divisions fits a maintained cellular state. Germ cells, embryos and organism generations were not studied, so transgenerational inheritance is not established.",
      "understandingFocusDe": "DNA-Methylierung und Histon-Modifikationen betreffen unterschiedliche Moleküle und verändern Genregulation kontextabhängig.",
      "understandingFocusEn": "DNA methylation and histone modifications affect different molecules and alter gene regulation in a context-dependent way."
    }
  ]
}

## 40334348-bd84-5ed9-b76b-5f5b80c2d145

### poly-c1 — Zwei Pigmentgene und gleiche Phänotypen

**materialDe**

Fiktives Pflanzenmodell: zwei ungekoppelte diploide Gene A/a und B/b; jede Großbuchstaben-Kopie liefert eine Pigmenteinheit. Alle Gameten einer AaBb-Pflanze sind AB, Ab, aB und ab, je 1/4. Keine Dominanz, Epistasie oder Selektionsunterschiede; gleiche Kulturbedingungen. Unabhängig davon erhöht der vorgegebene Nährstoffzustand N=1 die gemessene Pigmentzahl um eine Einheit, ohne DNA zu verändern; bei N=0 nicht. Wir betrachten AaBb × AaBb.

**materialEn**

Fictional plant model: two unlinked diploid genes A/a and B/b; each uppercase allele copy contributes one pigment unit. AaBb produces AB, Ab, aB and ab gametes with probability 1/4 each. No dominance, epistasis or selection differences; identical growth conditions. Independently, supplied nutrient state N=1 increases measured pigment by one unit without changing DNA; N=0 does not. Consider AaBb × AaBb.

**taskDe**

Erstelle die 16 gleich wahrscheinlichen Gametenkombinationen und ordne sie den genetischen Pigmentzahlen 0–4 zu. Erkläre, weshalb ein 3:1-Schema für ein einziges Gen nicht genügt. Vergleiche AABb bei N=0 mit AaBb bei N=1: Kann gleiche Farbe einen gleichen Genotyp beweisen?

**taskEn**

Construct the 16 equally likely gamete combinations and classify them by genetic pigment count 0–4. Explain why a single-gene 3:1 scheme is insufficient. Compare AABb at N=0 with AaBb at N=1: can identical color prove identical genotype?

**workedSolutionDe**

Aus der Kombination der zwei unabhängigen 1:2:1-Verteilungen AA:Aa:aa und BB:Bb:bb ergeben sich für 0,1,2,3,4 Großbuchstaben 1,4,6,4,1 von 16 Nachkommen. Beispiel: AaBb trägt zwei, AABb drei Einheiten. Das Merkmal hängt von beiden Genen ab; Allele segregieren weiterhin, aber ihr gemeinsamer additiver Phänotyp ist keine einzelne dominant-rezessive Kategorie. AABb/N=0 ergibt 3; AaBb/N=1 ergibt ebenfalls 3. Gleiche Farbe erlaubt daher keinen eindeutigen Genotyp: Umweltwirkung ist keine neue Mutation.

**workedSolutionEn**

Combining independent AA:Aa:aa and BB:Bb:bb 1:2:1 distributions gives 1,4,6,4,1 out of 16 offspring with 0,1,2,3,4 uppercase alleles. AaBb contributes two units, AABb three. Both genes influence the trait; alleles still segregate, but the joint additive phenotype is not a single dominant-recessive category. AABb/N=0 gives 3; AaBb/N=1 also gives 3. Identical color therefore does not identify genotype: an environmental effect is not a new mutation.

**freshTransferDe**

Eine neue Kreuzung Aabb × aaBb erfolgt bei N=0. Leite die Gameten und Pigmentverteilung neu ab. Später bekommen alle Nachkommen N=1. Ändert das die vererbten Allele oder nur die beobachtete Pigmentzahl?

**freshTransferEn**

A new cross Aabb × aaBb is grown at N=0. Derive its gametes and pigment distribution anew. Later all offspring receive N=1. Does this change inherited alleles or only observed pigment?

**freshTransferSolutionDe**

Ab/ab × aB/ab ergibt AaBb, Aabb, aaBb, aabb mit je 1/4: Pigment 2,1,1,0, somit 0:1:2 = 1:2:1. N=1 verschiebt die Messwerte zu 1,2,3, ohne die Genotypverteilung zu ändern. Die frühere Verteilung 1:4:6:4:1 darf nicht übernommen werden.

**freshTransferSolutionEn**

Ab/ab × aB/ab gives AaBb, Aabb, aaBb, aabb with probability 1/4 each: pigment 2,1,1,0, hence 0:1:2 = 1:2:1. N=1 shifts observations to 1,2,3 without changing genotype frequencies. The previous 1:4:6:4:1 distribution cannot be reused.

**limitsDe**

Ein ausdrücklich vereinfachtes additives Modell, keine Behauptung über eine reale Pigmenteigenschaft oder alle polygenen Merkmale; echte Allelwirkungen und Umweltwechselwirkungen können anders sein.

**limitsEn**

An explicitly simplified additive model, not a claim about a real pigment trait or all polygenic traits; real allele effects and environmental interactions can differ.

**Rubrik**

{"id": "poly-c1-r1", "expectationIds": ["e1"], "criterionDe": "Beiträge beider Gene korrekt aus Gameten oder Allelzahl begründen.", "criterionEn": "Correctly explain both genes using gametes or allele counts."}

{"id": "poly-c1-r2", "expectationIds": ["e2"], "criterionDe": "Umwelt, Genotyp und Ergebnis/Wahrscheinlichkeit trennen; keine deterministische Individualdiagnose.", "criterionEn": "Distinguish environment, genotype and outcome/probability; no deterministic individual diagnosis."}

{"id": "poly-c1-r3", "expectationIds": ["e3"], "criterionDe": "Neue Bedingungen tatsächlich neu auswerten und Grenze benennen.", "criterionEn": "Actually reevaluate the new conditions and state a limitation."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Mehrere segregierende Gene können gemeinsam ein Merkmal beeinflussen; das Modell einer einzelnen dominant-rezessiven Eigenschaft reicht dann nicht aus.",
      "essentialUnderstandingEn": "Several segregating genes can jointly influence a trait; a single dominant-recessive trait model is then insufficient.",
      "observablePerformanceDe": "Die lernende Person leitet aus vorgegebenen Allelwirkungen verschiedene Merkmalsausprägungen ab und erklärt den Beitrag beider Gene.",
      "observablePerformanceEn": "The learner derives different trait values from supplied allele effects and explains the contribution of both genes."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Multifaktoriell verbindet genetische Beiträge mit Umwelteinflüssen; ein Merkmal oder Risikowert legt den Genotyp und den individuellen Verlauf nicht eindeutig fest.",
      "essentialUnderstandingEn": "Multifactorial combines genetic contributions with environmental influences; a trait or risk value does not uniquely determine genotype or individual outcome.",
      "observablePerformanceDe": "Die lernende Person trennt Allelvererbung, Umweltwirkung und modellierte Wahrscheinlichkeit, begründet mögliche gleiche Phänotypen und vermeidet genetischen Determinismus.",
      "observablePerformanceEn": "The learner distinguishes allele inheritance, environmental effects and modeled probability, explains possible identical phenotypes and avoids genetic determinism."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Kreuzungen oder Gen-Umwelt-Wechselwirkungen verlangen eine neue Erklärung aus den Bedingungen, nicht die Übernahme eines früheren Zahlenverhältnisses.",
      "essentialUnderstandingEn": "New crosses or gene-environment interactions require a new explanation from the conditions rather than reuse of an earlier ratio.",
      "observablePerformanceDe": "Die lernende Person bearbeitet beide Fälle und die neue Bedingung selbständig und prüft, welche Modellannahmen weiter gelten.",
      "observablePerformanceEn": "The learner independently addresses both cases and the new condition and checks which model assumptions still apply."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Genetische Kreuzung gegenüber Umwelt-/Risikomodell",
      "textEn": "Genetic cross versus environmental/risk model"
    },
    {
      "id": "v2",
      "textDe": "Additive Beiträge gegenüber Gen-Umwelt-Wechselwirkung",
      "textEn": "Additive contributions versus gene-environment interaction"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "poly-c1",
      "taskDemandDe": "Erstelle die 16 gleich wahrscheinlichen Gametenkombinationen und ordne sie den genetischen Pigmentzahlen 0–4 zu. Erkläre, weshalb ein 3:1-Schema für ein einziges Gen nicht genügt. Vergleiche AABb bei N=0 mit AaBb bei N=1: Kann gleiche Farbe einen gleichen Genotyp beweisen?",
      "taskDemandEn": "Construct the 16 equally likely gamete combinations and classify them by genetic pigment count 0–4. Explain why a single-gene 3:1 scheme is insufficient. Compare AABb at N=0 with AaBb at N=1: can identical color prove identical genotype?",
      "expectedPerformanceDe": "Aus der Kombination der zwei unabhängigen 1:2:1-Verteilungen AA:Aa:aa und BB:Bb:bb ergeben sich für 0,1,2,3,4 Großbuchstaben 1,4,6,4,1 von 16 Nachkommen. Beispiel: AaBb trägt zwei, AABb drei Einheiten. Das Merkmal hängt von beiden Genen ab; Allele segregieren weiterhin, aber ihr gemeinsamer additiver Phänotyp ist keine einzelne dominant-rezessive Kategorie. AABb/N=0 ergibt 3; AaBb/N=1 ergibt ebenfalls 3. Gleiche Farbe erlaubt daher keinen eindeutigen Genotyp: Umweltwirkung ist keine neue Mutation.",
      "expectedPerformanceEn": "Combining independent AA:Aa:aa and BB:Bb:bb 1:2:1 distributions gives 1,4,6,4,1 out of 16 offspring with 0,1,2,3,4 uppercase alleles. AaBb contributes two units, AABb three. Both genes influence the trait; alleles still segregate, but the joint additive phenotype is not a single dominant-recessive category. AABb/N=0 gives 3; AaBb/N=1 also gives 3. Identical color therefore does not identify genotype: an environmental effect is not a new mutation.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "poly-c2",
      "taskDemandDe": "Erstelle die Risikotabelle für die vier Genotypen bei E=0 und E=1. Erkläre polygen gegenüber multifaktoriell, die mögliche Rolle geteilter Gene und Umwelten innerhalb einer Familie und warum auch AABB/E=1 keine sichere Erkrankung bedeutet.",
      "taskDemandEn": "Construct the risk table for the four genotypes at E=0 and E=1. Explain polygenic versus multifactorial inheritance, possible shared genes and environments within a family, and why even AABB/E=1 does not mean certain disease.",
      "expectedPerformanceDe": "Bei E=0 ergeben sich AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; bei E=1 50%,45%,40%,30%. Zwei Gene tragen bei: polygen. Zusätzlich verändert E das Ergebnis: multifaktoriell. Familienähnlichkeit kann sowohl gemeinsame Allele als auch gemeinsame Umwelt einschließen. 50% ist eine Modellwahrscheinlichkeit, weder ein Beweis für Erkrankung noch für Gesundheit einer Einzelperson. Ein pauschales 3:1-Erkrankungsschema passt nicht zu dieser Konstellation.",
      "expectedPerformanceEn": "At E=0 the values are AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; at E=1 they are 50%,45%,40%,30%. Two genes contribute: polygenic. E also changes the outcome: multifactorial. Family resemblance can involve shared alleles and shared environment. 50% is a modeled probability, not proof of disease or health in one individual. A universal 3:1 disease ratio does not fit these conditions.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

### poly-c2 — Viele genetische Beiträge ergeben keine sichere Erkrankung

**materialDe**

Rein synthetischer Erkrankungsendpunkt Z; keine reale Diagnose. Vorgegebenes Zweigenmodell: k ist die Zahl der Großbuchstaben in A/a und B/b, E ist eine Umweltbedingung (0 oder 1). P(Z) in Prozent = 10 + 5k + 20E. AABB hat k=4, AaBB k=3, AaBb k=2, aabb k=0. Genotypen bleiben während der Beobachtung gleich; der Ausdruck ist ein vorgegebenes Unterrichtsmodell, keine aus Patientendaten geschätzte Formel.

**materialEn**

Entirely synthetic disease endpoint Z; no real diagnosis. Supplied two-gene model: k counts uppercase alleles at A/a and B/b; E is an environmental condition (0 or 1). P(Z) in percent = 10 + 5k + 20E. AABB has k=4, AaBB k=3, AaBb k=2, aabb k=0. Genotypes remain unchanged during observation; the expression is a supplied teaching model, not a formula fitted to patient data.

**taskDe**

Erstelle die Risikotabelle für die vier Genotypen bei E=0 und E=1. Erkläre polygen gegenüber multifaktoriell, die mögliche Rolle geteilter Gene und Umwelten innerhalb einer Familie und warum auch AABB/E=1 keine sichere Erkrankung bedeutet.

**taskEn**

Construct the risk table for the four genotypes at E=0 and E=1. Explain polygenic versus multifactorial inheritance, possible shared genes and environments within a family, and why even AABB/E=1 does not mean certain disease.

**workedSolutionDe**

Bei E=0 ergeben sich AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; bei E=1 50%,45%,40%,30%. Zwei Gene tragen bei: polygen. Zusätzlich verändert E das Ergebnis: multifaktoriell. Familienähnlichkeit kann sowohl gemeinsame Allele als auch gemeinsame Umwelt einschließen. 50% ist eine Modellwahrscheinlichkeit, weder ein Beweis für Erkrankung noch für Gesundheit einer Einzelperson. Ein pauschales 3:1-Erkrankungsschema passt nicht zu dieser Konstellation.

**workedSolutionEn**

At E=0 the values are AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; at E=1 they are 50%,45%,40%,30%. Two genes contribute: polygenic. E also changes the outcome: multifactorial. Family resemblance can involve shared alleles and shared environment. 50% is a modeled probability, not proof of disease or health in one individual. A universal 3:1 disease ratio does not fit these conditions.

**freshTransferDe**

Eine neue Modellhypothese lautet: Der Umweltbeitrag +20 gilt nur, wenn mindestens ein B vorhanden ist. Vergleiche bei E=1 AABB und aabb mit dem alten Modell und erkläre die Gen-Umwelt-Wechselwirkung. Welche zusätzliche Beobachtung wäre nötig, bevor man dieses neue Modell für eine reale Population verwendet?

**freshTransferEn**

A new model hypothesis says that the environmental +20 contribution applies only when at least one B is present. Compare AABB and aabb at E=1 with the old model and explain the gene-environment interaction. What additional observation is needed before applying this new model to a real population?

**freshTransferSolutionDe**

AABB bleibt 50%; aabb fällt von 30% auf 10%, weil dort kein B vorliegt. Der Umweltbeitrag hängt jetzt vom Genotyp ab; die alte uniforme Erhöhung gilt nicht allgemein. Nötig wären geeignete unabhängige Daten zu den Genotyp-/Umweltgruppen und Prüfung von Alternativerklärungen und Vorhersagegüte; die Unterrichtsformel selbst validiert kein reales Erkrankungsrisiko.

**freshTransferSolutionEn**

AABB remains 50%; aabb changes from 30% to 10% because B is absent. The environmental contribution now depends on genotype; the old uniform increase is not universal. Suitable independent genotype/environment-group data and evaluation of alternative explanations and predictive performance are required; the classroom formula does not validate a real disease risk.

**limitsDe**

Keine Heritabilitäts-, klinische Diagnose- oder Therapieaussage. Effekte, Basisrisiko und Interaktion sind fiktiv festgelegt; es wird keine reale Risikoformel trainiert.

**limitsEn**

No heritability, clinical diagnosis or treatment claim. Effects, baseline risk and interaction are fictional supplied quantities; no real risk model is trained.

**Rubrik**

{"id": "poly-c2-r1", "expectationIds": ["e1"], "criterionDe": "Beiträge beider Gene korrekt aus Gameten oder Allelzahl begründen.", "criterionEn": "Correctly explain both genes using gametes or allele counts."}

{"id": "poly-c2-r2", "expectationIds": ["e2"], "criterionDe": "Umwelt, Genotyp und Ergebnis/Wahrscheinlichkeit trennen; keine deterministische Individualdiagnose.", "criterionEn": "Distinguish environment, genotype and outcome/probability; no deterministic individual diagnosis."}

{"id": "poly-c2-r3", "expectationIds": ["e3"], "criterionDe": "Neue Bedingungen tatsächlich neu auswerten und Grenze benennen.", "criterionEn": "Actually reevaluate the new conditions and state a limitation."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Mehrere segregierende Gene können gemeinsam ein Merkmal beeinflussen; das Modell einer einzelnen dominant-rezessiven Eigenschaft reicht dann nicht aus.",
      "essentialUnderstandingEn": "Several segregating genes can jointly influence a trait; a single dominant-recessive trait model is then insufficient.",
      "observablePerformanceDe": "Die lernende Person leitet aus vorgegebenen Allelwirkungen verschiedene Merkmalsausprägungen ab und erklärt den Beitrag beider Gene.",
      "observablePerformanceEn": "The learner derives different trait values from supplied allele effects and explains the contribution of both genes."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Multifaktoriell verbindet genetische Beiträge mit Umwelteinflüssen; ein Merkmal oder Risikowert legt den Genotyp und den individuellen Verlauf nicht eindeutig fest.",
      "essentialUnderstandingEn": "Multifactorial combines genetic contributions with environmental influences; a trait or risk value does not uniquely determine genotype or individual outcome.",
      "observablePerformanceDe": "Die lernende Person trennt Allelvererbung, Umweltwirkung und modellierte Wahrscheinlichkeit, begründet mögliche gleiche Phänotypen und vermeidet genetischen Determinismus.",
      "observablePerformanceEn": "The learner distinguishes allele inheritance, environmental effects and modeled probability, explains possible identical phenotypes and avoids genetic determinism."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Kreuzungen oder Gen-Umwelt-Wechselwirkungen verlangen eine neue Erklärung aus den Bedingungen, nicht die Übernahme eines früheren Zahlenverhältnisses.",
      "essentialUnderstandingEn": "New crosses or gene-environment interactions require a new explanation from the conditions rather than reuse of an earlier ratio.",
      "observablePerformanceDe": "Die lernende Person bearbeitet beide Fälle und die neue Bedingung selbständig und prüft, welche Modellannahmen weiter gelten.",
      "observablePerformanceEn": "The learner independently addresses both cases and the new condition and checks which model assumptions still apply."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Genetische Kreuzung gegenüber Umwelt-/Risikomodell",
      "textEn": "Genetic cross versus environmental/risk model"
    },
    {
      "id": "v2",
      "textDe": "Additive Beiträge gegenüber Gen-Umwelt-Wechselwirkung",
      "textEn": "Additive contributions versus gene-environment interaction"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "poly-c1",
      "taskDemandDe": "Erstelle die 16 gleich wahrscheinlichen Gametenkombinationen und ordne sie den genetischen Pigmentzahlen 0–4 zu. Erkläre, weshalb ein 3:1-Schema für ein einziges Gen nicht genügt. Vergleiche AABb bei N=0 mit AaBb bei N=1: Kann gleiche Farbe einen gleichen Genotyp beweisen?",
      "taskDemandEn": "Construct the 16 equally likely gamete combinations and classify them by genetic pigment count 0–4. Explain why a single-gene 3:1 scheme is insufficient. Compare AABb at N=0 with AaBb at N=1: can identical color prove identical genotype?",
      "expectedPerformanceDe": "Aus der Kombination der zwei unabhängigen 1:2:1-Verteilungen AA:Aa:aa und BB:Bb:bb ergeben sich für 0,1,2,3,4 Großbuchstaben 1,4,6,4,1 von 16 Nachkommen. Beispiel: AaBb trägt zwei, AABb drei Einheiten. Das Merkmal hängt von beiden Genen ab; Allele segregieren weiterhin, aber ihr gemeinsamer additiver Phänotyp ist keine einzelne dominant-rezessive Kategorie. AABb/N=0 ergibt 3; AaBb/N=1 ergibt ebenfalls 3. Gleiche Farbe erlaubt daher keinen eindeutigen Genotyp: Umweltwirkung ist keine neue Mutation.",
      "expectedPerformanceEn": "Combining independent AA:Aa:aa and BB:Bb:bb 1:2:1 distributions gives 1,4,6,4,1 out of 16 offspring with 0,1,2,3,4 uppercase alleles. AaBb contributes two units, AABb three. Both genes influence the trait; alleles still segregate, but the joint additive phenotype is not a single dominant-recessive category. AABb/N=0 gives 3; AaBb/N=1 also gives 3. Identical color therefore does not identify genotype: an environmental effect is not a new mutation.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "poly-c2",
      "taskDemandDe": "Erstelle die Risikotabelle für die vier Genotypen bei E=0 und E=1. Erkläre polygen gegenüber multifaktoriell, die mögliche Rolle geteilter Gene und Umwelten innerhalb einer Familie und warum auch AABB/E=1 keine sichere Erkrankung bedeutet.",
      "taskDemandEn": "Construct the risk table for the four genotypes at E=0 and E=1. Explain polygenic versus multifactorial inheritance, possible shared genes and environments within a family, and why even AABB/E=1 does not mean certain disease.",
      "expectedPerformanceDe": "Bei E=0 ergeben sich AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; bei E=1 50%,45%,40%,30%. Zwei Gene tragen bei: polygen. Zusätzlich verändert E das Ergebnis: multifaktoriell. Familienähnlichkeit kann sowohl gemeinsame Allele als auch gemeinsame Umwelt einschließen. 50% ist eine Modellwahrscheinlichkeit, weder ein Beweis für Erkrankung noch für Gesundheit einer Einzelperson. Ein pauschales 3:1-Erkrankungsschema passt nicht zu dieser Konstellation.",
      "expectedPerformanceEn": "At E=0 the values are AABB 30%, AaBB 25%, AaBb 20%, aabb 10%; at E=1 they are 50%,45%,40%,30%. Two genes contribute: polygenic. E also changes the outcome: multifactorial. Family resemblance can involve shared alleles and shared environment. 50% is a modeled probability, not proof of disease or health in one individual. A universal 3:1 disease ratio does not fit these conditions.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

## 1320b82e-e438-59ff-9d53-ecc9fbacae58

### snp-c1 — Allelsignale und ein unklarer Messwert

**materialDe**

Synthetischer diploider G/A-Marker: referenzierte DNA 5′-ACGTA-3′, Variante 5′-ACATA-3′; Position 3 unterscheidet G/A. Alle Signale sind auf diesen Vorwärtsstrang umgerechnet. Vorgegebene validierte Unterrichts-QC: mindestens 20 unabhängige Molekülsignale; Heterozygotie bei beiden Allelanteilen 0,30–0,70, Homozygotie bei Minderanteil höchstens 0,02; andernfalls keine sichere Zuordnung. Proben: P 20G/20A, Q 30G/0A, R 8G/2A. Kontrollproben GG und GA erfüllen ihre erwarteten Signale. Der Marker hat hier keine bekannte krankheitsverursachende Bedeutung.

**materialEn**

Synthetic diploid G/A marker: reference 5′-ACGTA-3′, variant 5′-ACATA-3′; position 3 differs G/A. All signals are converted to this forward strand. Supplied validated classroom QC: at least 20 independent molecule signals; heterozygous calls require both allele fractions 0.30–0.70, homozygous calls a minor fraction at most 0.02; otherwise no certain assignment. Samples: P 20G/20A, Q 30G/0A, R 8G/2A. GG and GA controls have their expected signals. No disease-causing significance is known for this marker here.

**taskDe**

Lokalisiere und charakterisiere den SNP. Bestimme die unter diesen Regeln vertretbaren Genotypen von P/Q/R und begründe die Rolle der Kontrollen und Molekülzahl. Beurteile die Behauptung: „P enthält die Variante und ist daher krank.“

**taskEn**

Locate and characterize the SNP. Determine the defensible P/Q/R genotypes under these rules and explain controls and molecule count. Evaluate: “P contains the variant and therefore has a disease.”

**workedSolutionDe**

Es handelt sich um einen einzelnen G/A-Unterschied an Position 3. P erfüllt 40 Signale und 0,5/0,5: GA. Q erfüllt 30 Signale und Minderanteil 0: GG. R hat nur 10 Signale und 0,8/0,2; weder die Mindestzahl noch der Heterozygotenbereich ist erfüllt: ungeklärt, keine sichere AA/GA/GG-Aussage. Kontrollen prüfen die Funktionsfähigkeit des Assays, ersetzen aber nicht die einzelne Proben-QC. P zeigt Variation, keine hier belegte Erkrankungsdiagnose.

**workedSolutionEn**

This is a single G/A difference at position 3. P meets 40 signals and 0.5/0.5: GA. Q meets 30 signals and minor fraction 0: GG. R has only 10 signals and 0.8/0.2; minimum count and heterozygous range are unmet: inconclusive, no certain AA/GA/GG call. Controls assess assay operation but do not replace sample-specific QC. P shows variation, not a supported disease diagnosis.

**freshTransferDe**

R wird aus einer neuen aliquoten Probe erneut gemessen: 24G/26A bei bestandenen Kontrollen. Eine zusätzliche Probe S liefert nur Rückwärtsstrangsignale 30C/0T; für diese SNP-Position wird ausdrücklich die Komplementzuordnung G↔C und A↔T angegeben. Ordne beide neu ein; was bleibt über eine Krankheit offen?

**freshTransferEn**

R is remeasured from a new aliquot: 24G/26A with passing controls. An additional sample S produces reverse-strand signals 30C/0T; the supplied complement mapping at this SNP position is G↔C and A↔T. Interpret both anew; what remains unknown about disease?

**freshTransferSolutionDe**

R erfüllt nun 50 Signale und Anteile 0,48/0,52: GA unter der gegebenen QC. S entspricht nach Strandumrechnung 30G/0A: GG; C darf nicht als drittes Vorwärtsallel erfunden werden. Keiner dieser Markerbefunde liefert ohne entsprechende funktionelle/klinische Evidenz eine Krankheitsdiagnose.

**freshTransferSolutionEn**

R now meets 50 signals with fractions 0.48/0.52: GA under the supplied QC. After strand conversion S corresponds to 30G/0A: GG; C is not a third forward-strand allele. Neither marker result establishes disease without relevant functional/clinical evidence.

**limitsDe**

QC-Schwellen sind ausdrücklich Modellvorgaben und keine allgemeine Laborrichtlinie; Strand, Referenz, Assay und Krankheitsbedeutung müssen in realen Analysen gesondert validiert sein.

**limitsEn**

QC thresholds are explicit model assumptions, not universal laboratory guidelines; strand, reference, assay and disease significance need separate validation in real analyses.

**Rubrik**

{"id": "snp-c1-r1", "expectationIds": ["e1"], "criterionDe": "Basenposition und QC-Regeln korrekt anwenden; fehlerhafte Daten nicht sicher genotypisieren.", "criterionEn": "Correctly use base position and QC rules; do not assign a certain genotype to unreliable data."}

{"id": "snp-c1-r2", "expectationIds": ["e2"], "criterionDe": "Markeraussage, Häufigkeit und kausale/klinische Schlussfolgerung auseinanderhalten.", "criterionEn": "Distinguish marker evidence and frequency from causal/clinical conclusions."}

{"id": "snp-c1-r3", "expectationIds": ["e3"], "criterionDe": "Neue Daten ohne Übernahme der alten Aussage neu interpretieren.", "criterionEn": "Reinterpret new data without blindly retaining the old conclusion."}

**Ganzes positives Profil**

{
  "archetype": "data",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Ein SNP unterscheidet eine DNA-Basenposition; der diploide Genotyp folgt nur aus geeigneten orientierten, qualitätsgeprüften Allelsignalen.",
      "essentialUnderstandingEn": "A SNP varies at one DNA base position; a diploid genotype requires correctly oriented, quality-checked allele signals.",
      "observablePerformanceDe": "Die lernende Person identifiziert die Position, deutet valide homo-/heterozygote Signale und lässt unzureichende Daten ungeklärt.",
      "observablePerformanceEn": "The learner identifies the position, interprets valid homozygous/heterozygous signals and leaves insufficient data unresolved."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Eine SNP-Assoziation oder ein Markergenotyp ist nicht automatisch Ursache, sichere Diagnose oder universell übertragbares Erkrankungsrisiko.",
      "essentialUnderstandingEn": "A SNP association or marker genotype is not automatically a cause, certain diagnosis or universally transferable disease risk.",
      "observablePerformanceDe": "Die lernende Person wertet die gegebenen Gruppenhäufigkeiten aus, trennt absolute und relative Aussage und prüft eine alternative Erklärung.",
      "observablePerformanceEn": "The learner evaluates supplied group frequencies, distinguishes absolute and relative conclusions and checks an alternative explanation."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Qualitätsdaten oder eine relevante Gruppeneinteilung können die zulässige Interpretation verändern.",
      "essentialUnderstandingEn": "New quality data or relevant group stratification can change the permissible interpretation.",
      "observablePerformanceDe": "Die lernende Person begründet beide Fälle und revidiert ihre Schlussfolgerung an einer neuen Messung oder Vergleichsbedingung selbständig.",
      "observablePerformanceEn": "The learner justifies both cases and independently updates the conclusion after a new measurement or comparison condition."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Diploides Allelsignal gegenüber Populationsassoziation",
      "textEn": "Diploid allele signal versus population association"
    },
    {
      "id": "v2",
      "textDe": "Neue Messqualität, Strangorientierung oder Störfaktorschichtung",
      "textEn": "New measurement quality, strand orientation or confounder stratification"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "snp-c1",
      "taskDemandDe": "Lokalisiere und charakterisiere den SNP. Bestimme die unter diesen Regeln vertretbaren Genotypen von P/Q/R und begründe die Rolle der Kontrollen und Molekülzahl. Beurteile die Behauptung: „P enthält die Variante und ist daher krank.“",
      "taskDemandEn": "Locate and characterize the SNP. Determine the defensible P/Q/R genotypes under these rules and explain controls and molecule count. Evaluate: “P contains the variant and therefore has a disease.”",
      "expectedPerformanceDe": "Es handelt sich um einen einzelnen G/A-Unterschied an Position 3. P erfüllt 40 Signale und 0,5/0,5: GA. Q erfüllt 30 Signale und Minderanteil 0: GG. R hat nur 10 Signale und 0,8/0,2; weder die Mindestzahl noch der Heterozygotenbereich ist erfüllt: ungeklärt, keine sichere AA/GA/GG-Aussage. Kontrollen prüfen die Funktionsfähigkeit des Assays, ersetzen aber nicht die einzelne Proben-QC. P zeigt Variation, keine hier belegte Erkrankungsdiagnose.",
      "expectedPerformanceEn": "This is a single G/A difference at position 3. P meets 40 signals and 0.5/0.5: GA. Q meets 30 signals and minor fraction 0: GG. R has only 10 signals and 0.8/0.2; minimum count and heterozygous range are unmet: inconclusive, no certain AA/GA/GG call. Controls assess assay operation but do not replace sample-specific QC. P shows variation, not a supported disease diagnosis.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "snp-c2",
      "taskDemandDe": "Lokalisiere den SNP und bestimme anhand der gelieferten QC die Genotypen der beiden illustrativen Proben; begründe, welche Gruppeneinteilung bereits als Material gegeben ist. Bestimme beobachtete Endpunkthäufigkeiten, relative und absolute Unterschiede. Welche Aussage über Variation/Risikomarker ist vertretbar, welche Ursache oder individuelle Diagnose nicht? Nenne eine gezielte zusätzliche Vergleichsprüfung.",
      "taskDemandEn": "Locate the SNP and determine the genotypes of both illustrative samples using the supplied QC; explain which group classification is already supplied as material. Calculate observed endpoint frequencies and relative and absolute differences. What variation/risk-marker conclusion is defensible, and what causal or individual diagnosis is not? Specify a targeted additional comparison.",
      "expectedPerformanceDe": "An Position 3 liegt ein einzelner G/A-Unterschied vor. P_A erfüllt mit 30 unabhängigen Signalen und Anteilen 0,50/0,50 die GA-Regel; P_N erfüllt mit 25 Signalen und Minderanteil 0 die GG-Regel. Die bestandenen Kontrollen stützen die technische Auswertung; die Zuordnung aller 400 Gruppenmitglieder bleibt eine explizite Materialvorgabe und folgt nicht aus diesen zwei Beispielen. Mit A: 30/200=15%; ohne A: 10/200=5%. Relatives Verhältnis 3, absoluter Unterschied 10 Prozentpunkte. Es liegt eine Assoziation vor, keine sichere Diagnose: 170 A-Träger zeigen Z nicht und 10 Nichtträger zeigen Z. Ursache, Kopplung zu einer anderen Variante, Umwelt-/Populationsunterschiede und Stichprobenunsicherheit bleiben zu prüfen. Sinnvoll ist ein Vergleich bei gleicher U-Ausprägung sowie unabhängige Replikation; die Zahl allein beweist keine biologische Kausalität.",
      "expectedPerformanceEn": "Position 3 contains a single G/A difference. With 30 independent signals and fractions 0.50/0.50, P_A meets the GA rule; with 25 signals and minor fraction 0, P_N meets the GG rule. Passing controls support technical interpretation; classification of all 400 group members remains an explicit supplied assumption and does not follow from these two examples. With A: 30/200=15%; without A: 10/200=5%. Frequency ratio 3, absolute difference 10 percentage points. This is an association, not a certain diagnosis: 170 A carriers do not show Z and 10 noncarriers do. Causation, linkage to another variant, environmental/population differences and sampling uncertainty remain to be examined. Comparing equal U states and independent replication is useful; the numbers alone do not prove biological causality.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

### snp-c2 — Assoziation und eine neue Störfaktorprüfung

**materialDe**

Synthetische prospektive Beobachtung mit gleichem Nachbeobachtungszeitraum, ohne Aussage über eine reale Erkrankung: 200 Personen mit SNP-Allel A, davon 30 mit Endpunkt Z; 200 ohne A, davon 10 mit Z. Vollständige Nachbeobachtung; die Gruppeneinteilung erfolgte nicht nach Z. Unbekannt ist zunächst die Verteilung eines Umweltfaktors U. Die Daten behaupten keine Zufallszuteilung des Markers. Zusätzliches vollständiges Marker-Material für diesen Fall: Referenz 5′-ACGTA-3′ und Variante 5′-ACATA-3′ unterscheiden sich an Position 3 (G/A). Alle Molekülsignale sind auf diesen Vorwärtsstrang umgerechnet. Vorgegebene Unterrichts-QC: mindestens 20 unabhängige Signale; ein Heterozygot verlangt beide Allelanteile zwischen 0,30 und 0,70, ein Homozygot einen Minderanteil höchstens 0,02. GG- und GA-Kontrollen bestehen. Je eine illustrative neue Probe aus den beiden Gruppen liefert P_A: 15G/15A und P_N: 25G/0A. Ordne diese beiden Proben zu. Die qualitätsgeprüfte A-Träger-/Nichtträger-Einteilung der gesamten synthetischen Gruppen ist ausdrücklich gegeben; sie wird nicht aus den beiden illustrativen Proben auf alle 400 Personen hochgerechnet. Die QC-Schwellen sind Modellvorgaben, keine allgemeine Laborrichtlinie.

**materialEn**

Synthetic prospective observation over equal follow-up, with no claim about a real disease: 200 people carrying SNP allele A, 30 with endpoint Z; 200 without A, 10 with Z. Follow-up is complete; groups were not selected by Z. Distribution of environmental factor U is initially unknown. These data do not claim randomized marker assignment. Additional complete marker material for this case: reference 5′-ACGTA-3′ and variant 5′-ACATA-3′ differ at position 3 (G/A). All molecule signals are converted to this forward strand. Supplied classroom QC: at least 20 independent signals; a heterozygous call requires both allele fractions between 0.30 and 0.70, a homozygous call a minor fraction at most 0.02. GG and GA controls pass. One illustrative new sample from each group gives P_A: 15G/15A and P_N: 25G/0A. Classify these two samples. The quality-checked A-carrier/noncarrier classification of the complete synthetic groups is explicitly supplied; it is not extrapolated from the two illustrative samples to all 400 people. These QC thresholds are model assumptions, not universal laboratory guidelines.

**taskDe**

Lokalisiere den SNP und bestimme anhand der gelieferten QC die Genotypen der beiden illustrativen Proben; begründe, welche Gruppeneinteilung bereits als Material gegeben ist. Bestimme beobachtete Endpunkthäufigkeiten, relative und absolute Unterschiede. Welche Aussage über Variation/Risikomarker ist vertretbar, welche Ursache oder individuelle Diagnose nicht? Nenne eine gezielte zusätzliche Vergleichsprüfung.

**taskEn**

Locate the SNP and determine the genotypes of both illustrative samples using the supplied QC; explain which group classification is already supplied as material. Calculate observed endpoint frequencies and relative and absolute differences. What variation/risk-marker conclusion is defensible, and what causal or individual diagnosis is not? Specify a targeted additional comparison.

**workedSolutionDe**

An Position 3 liegt ein einzelner G/A-Unterschied vor. P_A erfüllt mit 30 unabhängigen Signalen und Anteilen 0,50/0,50 die GA-Regel; P_N erfüllt mit 25 Signalen und Minderanteil 0 die GG-Regel. Die bestandenen Kontrollen stützen die technische Auswertung; die Zuordnung aller 400 Gruppenmitglieder bleibt eine explizite Materialvorgabe und folgt nicht aus diesen zwei Beispielen. Mit A: 30/200=15%; ohne A: 10/200=5%. Relatives Verhältnis 3, absoluter Unterschied 10 Prozentpunkte. Es liegt eine Assoziation vor, keine sichere Diagnose: 170 A-Träger zeigen Z nicht und 10 Nichtträger zeigen Z. Ursache, Kopplung zu einer anderen Variante, Umwelt-/Populationsunterschiede und Stichprobenunsicherheit bleiben zu prüfen. Sinnvoll ist ein Vergleich bei gleicher U-Ausprägung sowie unabhängige Replikation; die Zahl allein beweist keine biologische Kausalität.

**workedSolutionEn**

Position 3 contains a single G/A difference. With 30 independent signals and fractions 0.50/0.50, P_A meets the GA rule; with 25 signals and minor fraction 0, P_N meets the GG rule. Passing controls support technical interpretation; classification of all 400 group members remains an explicit supplied assumption and does not follow from these two examples. With A: 30/200=15%; without A: 10/200=5%. Frequency ratio 3, absolute difference 10 percentage points. This is an association, not a certain diagnosis: 170 A carriers do not show Z and 10 noncarriers do. Causation, linkage to another variant, environmental/population differences and sampling uncertainty remain to be examined. Comparing equal U states and independent replication is useful; the numbers alone do not prove biological causality.

**freshTransferDe**

Die gegebene qualitätsgeprüfte Markerzuordnung bleibt bestehen. Später wird U aufgeschlüsselt: A/U=hoch 150 Personen,30Z; A/U=niedrig 50,0Z; ohne A/U=hoch 50,10Z; ohne A/U=niedrig 150,0Z. Prüfe die Häufigkeiten innerhalb der U-Gruppen und revidiere die Markerinterpretation.

**freshTransferEn**

The supplied quality-checked marker classification remains unchanged. Later U is resolved: A/high-U 150 people,30Z; A/low-U 50,0Z; no-A/high-U 50,10Z; no-A/low-U 150,0Z. Examine frequencies within U strata and update the marker interpretation.

**freshTransferSolutionDe**

Innerhalb hoch-U: 30/150=20% mit A und 10/50=20% ohne A; innerhalb niedrig-U: in beiden Gruppen 0%. Die ungleiche U-Verteilung kann die gesamte beobachtete 15%-gegen-5%-Assoziation erklären. Ein unabhängiger Beitrag des Markers ist damit aus diesen Daten nicht belegt. Auch 0 beobachtete Fälle beweisen kein exakt null biologisches Risiko; eine andere Population oder Bedingung kann anders sein.

**freshTransferSolutionEn**

Within high-U: 30/150=20% with A and 10/50=20% without A; within low-U both observed frequencies are 0%. Different U distributions can explain the complete observed 15%-versus-5% association. These data do not establish an independent marker contribution. Zero observed events do not prove exactly zero biological risk; another population or condition can differ.

**limitsDe**

Keine klinischen Testeigenschaften oder kausale Schlussfolgerung werden vorausgesetzt; die berechenbaren Häufigkeiten sind beobachtete Modellwerte, keine universelle Vorhersage.

**limitsEn**

No clinical test properties or causal conclusion are assumed; calculable frequencies are observed model values, not universal predictions.

**Rubrik**

{"id": "snp-c2-r1", "expectationIds": ["e1"], "criterionDe": "Basenposition und gelieferte QC-Regeln korrekt auf P_A und P_N anwenden; illustrative Einzelproben nicht als Nachweis der gesamten Gruppeneinteilung ausgeben.", "criterionEn": "Correctly apply the base position and supplied QC rules to P_A and P_N; do not present illustrative individual samples as proof of the complete group classification."}

{"id": "snp-c2-r2", "expectationIds": ["e2"], "criterionDe": "Markeraussage, Häufigkeit und kausale/klinische Schlussfolgerung auseinanderhalten.", "criterionEn": "Distinguish marker evidence and frequency from causal/clinical conclusions."}

{"id": "snp-c2-r3", "expectationIds": ["e3"], "criterionDe": "Neue Daten ohne Übernahme der alten Aussage neu interpretieren.", "criterionEn": "Reinterpret new data without blindly retaining the old conclusion."}

**Ganzes positives Profil**

{
  "archetype": "data",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Ein SNP unterscheidet eine DNA-Basenposition; der diploide Genotyp folgt nur aus geeigneten orientierten, qualitätsgeprüften Allelsignalen.",
      "essentialUnderstandingEn": "A SNP varies at one DNA base position; a diploid genotype requires correctly oriented, quality-checked allele signals.",
      "observablePerformanceDe": "Die lernende Person identifiziert die Position, deutet valide homo-/heterozygote Signale und lässt unzureichende Daten ungeklärt.",
      "observablePerformanceEn": "The learner identifies the position, interprets valid homozygous/heterozygous signals and leaves insufficient data unresolved."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Eine SNP-Assoziation oder ein Markergenotyp ist nicht automatisch Ursache, sichere Diagnose oder universell übertragbares Erkrankungsrisiko.",
      "essentialUnderstandingEn": "A SNP association or marker genotype is not automatically a cause, certain diagnosis or universally transferable disease risk.",
      "observablePerformanceDe": "Die lernende Person wertet die gegebenen Gruppenhäufigkeiten aus, trennt absolute und relative Aussage und prüft eine alternative Erklärung.",
      "observablePerformanceEn": "The learner evaluates supplied group frequencies, distinguishes absolute and relative conclusions and checks an alternative explanation."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Qualitätsdaten oder eine relevante Gruppeneinteilung können die zulässige Interpretation verändern.",
      "essentialUnderstandingEn": "New quality data or relevant group stratification can change the permissible interpretation.",
      "observablePerformanceDe": "Die lernende Person begründet beide Fälle und revidiert ihre Schlussfolgerung an einer neuen Messung oder Vergleichsbedingung selbständig.",
      "observablePerformanceEn": "The learner justifies both cases and independently updates the conclusion after a new measurement or comparison condition."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Diploides Allelsignal gegenüber Populationsassoziation",
      "textEn": "Diploid allele signal versus population association"
    },
    {
      "id": "v2",
      "textDe": "Neue Messqualität, Strangorientierung oder Störfaktorschichtung",
      "textEn": "New measurement quality, strand orientation or confounder stratification"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "snp-c1",
      "taskDemandDe": "Lokalisiere und charakterisiere den SNP. Bestimme die unter diesen Regeln vertretbaren Genotypen von P/Q/R und begründe die Rolle der Kontrollen und Molekülzahl. Beurteile die Behauptung: „P enthält die Variante und ist daher krank.“",
      "taskDemandEn": "Locate and characterize the SNP. Determine the defensible P/Q/R genotypes under these rules and explain controls and molecule count. Evaluate: “P contains the variant and therefore has a disease.”",
      "expectedPerformanceDe": "Es handelt sich um einen einzelnen G/A-Unterschied an Position 3. P erfüllt 40 Signale und 0,5/0,5: GA. Q erfüllt 30 Signale und Minderanteil 0: GG. R hat nur 10 Signale und 0,8/0,2; weder die Mindestzahl noch der Heterozygotenbereich ist erfüllt: ungeklärt, keine sichere AA/GA/GG-Aussage. Kontrollen prüfen die Funktionsfähigkeit des Assays, ersetzen aber nicht die einzelne Proben-QC. P zeigt Variation, keine hier belegte Erkrankungsdiagnose.",
      "expectedPerformanceEn": "This is a single G/A difference at position 3. P meets 40 signals and 0.5/0.5: GA. Q meets 30 signals and minor fraction 0: GG. R has only 10 signals and 0.8/0.2; minimum count and heterozygous range are unmet: inconclusive, no certain AA/GA/GG call. Controls assess assay operation but do not replace sample-specific QC. P shows variation, not a supported disease diagnosis.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "snp-c2",
      "taskDemandDe": "Lokalisiere den SNP und bestimme anhand der gelieferten QC die Genotypen der beiden illustrativen Proben; begründe, welche Gruppeneinteilung bereits als Material gegeben ist. Bestimme beobachtete Endpunkthäufigkeiten, relative und absolute Unterschiede. Welche Aussage über Variation/Risikomarker ist vertretbar, welche Ursache oder individuelle Diagnose nicht? Nenne eine gezielte zusätzliche Vergleichsprüfung.",
      "taskDemandEn": "Locate the SNP and determine the genotypes of both illustrative samples using the supplied QC; explain which group classification is already supplied as material. Calculate observed endpoint frequencies and relative and absolute differences. What variation/risk-marker conclusion is defensible, and what causal or individual diagnosis is not? Specify a targeted additional comparison.",
      "expectedPerformanceDe": "An Position 3 liegt ein einzelner G/A-Unterschied vor. P_A erfüllt mit 30 unabhängigen Signalen und Anteilen 0,50/0,50 die GA-Regel; P_N erfüllt mit 25 Signalen und Minderanteil 0 die GG-Regel. Die bestandenen Kontrollen stützen die technische Auswertung; die Zuordnung aller 400 Gruppenmitglieder bleibt eine explizite Materialvorgabe und folgt nicht aus diesen zwei Beispielen. Mit A: 30/200=15%; ohne A: 10/200=5%. Relatives Verhältnis 3, absoluter Unterschied 10 Prozentpunkte. Es liegt eine Assoziation vor, keine sichere Diagnose: 170 A-Träger zeigen Z nicht und 10 Nichtträger zeigen Z. Ursache, Kopplung zu einer anderen Variante, Umwelt-/Populationsunterschiede und Stichprobenunsicherheit bleiben zu prüfen. Sinnvoll ist ein Vergleich bei gleicher U-Ausprägung sowie unabhängige Replikation; die Zahl allein beweist keine biologische Kausalität.",
      "expectedPerformanceEn": "Position 3 contains a single G/A difference. With 30 independent signals and fractions 0.50/0.50, P_A meets the GA rule; with 25 signals and minor fraction 0, P_N meets the GG rule. Passing controls support technical interpretation; classification of all 400 group members remains an explicit supplied assumption and does not follow from these two examples. With A: 30/200=15%; without A: 10/200=5%. Frequency ratio 3, absolute difference 10 percentage points. This is an association, not a certain diagnosis: 170 A carriers do not show Z and 10 noncarriers do. Causation, linkage to another variant, environmental/population differences and sampling uncertainty remain to be examined. Comparing equal U states and independent replication is useful; the numbers alone do not prove biological causality.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

## 3f969b9e-68b0-5442-b8e4-df4e35e83087

### ngs-dna-targeted-workflow — Ein DNA-Panel mit einer verdächtigen Kontrolle

**materialDe**

Synthetisches Unterrichtslabor möchte Basenvarianten in drei definierten Pflanzen-Genregionen vergleichen. Gegebene Schritte in ungeordneter Reihenfolge: Interpretation der Kandidaten; DNA-Isolation mit Extraktions-Leerkontrolle; Qualität/Identität der Probe; gezielte Bibliotheksherstellung mit Adaptern und Probenindex; parallele Sequenzierung; Entfernen schlechter Reads und Adapter; Alignment zur passenden Referenz und Variantenkandidaten. In RegionG hat ProbeA20 qualitätsgefilterte Reads, davon8 mit einer abweichenden Base; ProbeB20, davon0. Die Leerkontrolle enthält4Reads derselben abweichenden Base. Keine unabhängige Wiederholung liegt vor. Gezielt bedeutet: Andere Genregionen wurden nicht untersucht.

**materialEn**

A synthetic teaching laboratory wants to compare base variants in three defined plant gene regions. Supplied steps in scrambled order: interpret candidates; isolate DNA with an extraction blank; check sample quality/identity; make a targeted library with adapters and sample index; parallel sequencing; remove poor reads and adapters; align to the appropriate reference and identify variant candidates. In regionG sampleA has20 quality-filtered reads,8 with a different base; sampleB20,0 different. The blank contains4 reads with that same different base. No independent repeat exists. Targeted means other gene regions were not examined.

**taskDe**

Ordne die Schritte und benenne jeweils den Zweck. Berechne den beobachteten Variantenanteil in A, begründe, weshalb dies noch keine sichere biologische Variante ist, und nenne eine Folgekontrolle. Darf das Panel alle genomischen Veränderungen ausschließen?

**taskEn**

Order the steps and identify each purpose. Calculate the observed variant fraction in A, explain why this is not yet a secure biological variant and name a follow-up control. Can the panel exclude every genomic change?

**workedSolutionDe**

Reihenfolge: Isolation/Leerkontrolle→Qualität/Identität→gezielte indizierte Bibliothek→parallele Sequenzierung→Read-/Adapter-QC→Referenzalignment/Variantenkandidaten→Interpretation. Anteil8/20=40%. Sequenzreads sind Messdaten, keine automatisch bestätigte Mutation: dieselbe Abweichung in der Leerkontrolle weist auf mögliche Kontamination, Fehlzuordnung oder Artefakte hin. Neue unabhängige Extraktion mit sauberer Kontrolle und gegebenenfalls anderer Bestätigungstechnik ist nötig. Das Panel kann über nicht untersuchte Regionen nichts ausschließen.

**workedSolutionEn**

Order: extraction/blank→quality/identity→targeted indexed library→parallel sequencing→read/adapter QC→reference alignment/variant candidates→interpretation. Fraction8/20=40%. Reads are measurements, not automatically a confirmed mutation: the same difference in the blank indicates possible contamination, misassignment or artifacts. A new independent extraction with a clean control and, where appropriate, another confirmation technique is needed. A panel excludes nothing in unexamined regions.

**freshTransferDe**

Später lautet die Frage: Reagieren die drei Gene auf Hitze mit anderer Aktivität, obwohl die DNA gleich bleibt? Entwirf eine angepasste Proben-/Bibliotheksroute und einen zeitlichen Vergleich. Weshalb reicht erneutes DNA-Panel-Sequenzieren nicht?

**freshTransferEn**

Later the question becomes: do the three genes respond to heat with different activity despite unchanged DNA? Design an adapted sample/library route and a time comparison. Why is repeating the DNA panel insufficient?

**freshTransferSolutionDe**

Für Transkriptmengen wird RNA aus passend vergleichbaren unbehandelten und erhitzten Pflanzen zu festgelegten Zeiten isoliert; Integrität/QC, gegebenenfalls RNA-Auswahl, cDNA-Bibliothek mit Adaptern/Index, Sequenzierung und Zuordnung zu Transkripten folgen. Vergleichbare Bibliotheksmengen/Normalisierung und biologische Replikate sind notwendig. Ein DNA-Panel erfasst Basenfolgen, nicht automatisch aktuelle mRNA-Mengen. RNA-Änderung allein zeigt weder Proteinmenge noch kausale Hitzewirkung ohne Kontrollen.

**freshTransferSolutionEn**

For transcript abundance, RNA is isolated from matched untreated and heated plants at specified times; integrity/QC, suitable RNA selection where needed, an indexed adapter-bearing cDNA library, sequencing and transcript assignment follow. Comparable library depth/normalization and biological replicates are required. A DNA panel measures sequence rather than automatically current mRNA abundance. An RNA change alone proves neither protein abundance nor causal heat effects without controls.

**limitsDe**

Die Fälle setzen einen gelieferten kurzen NGS-Workflow voraus, keine tatsächlich durchgeführte Sequenzierung. PCR, Clusterbildung und Auslesetechnik sind plattformabhängige Details und keine universelle Zusatzpflicht.

**limitsEn**

Cases use a supplied short NGS workflow rather than actual sequencing. PCR, cluster generation and readout technology are platform-dependent details rather than universal extra requirements.

**Rubrik**

{"id": "workflow", "expectationIds": ["workflow"], "criterionDe": "Die lernende Person skizziert die Schritte mit ihren Ein- und Ausgaben und unterscheidet DNA- und RNA-basierte Fragestellungen.", "criterionEn": "The learner outlines steps with their inputs and outputs and distinguishes DNA- and RNA-based questions."}

{"id": "quality", "expectationIds": ["quality"], "criterionDe": "Die lernende Person ordnet einen Qualitätsbefund der passenden Prozessstufe zu und begründet eine Kontrolle.", "criterionEn": "The learner assigns a quality finding to the relevant workflow stage and justifies a control."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person passt den Workflow an eine neue Frage oder Störung an und nennt eine Grenze der Anwendung.", "criterionEn": "The learner adapts the workflow to a new question or disruption and names an application limitation."}

**Ganzes positives Profil**

{
  "archetype": "procedure",
  "expectations": [
    {
      "id": "workflow",
      "essentialUnderstandingDe": "NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.",
      "essentialUnderstandingEn": "NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation.",
      "observablePerformanceDe": "Die lernende Person skizziert die Schritte mit ihren Ein- und Ausgaben und unterscheidet DNA- und RNA-basierte Fragestellungen.",
      "observablePerformanceEn": "The learner outlines steps with their inputs and outputs and distinguishes DNA- and RNA-based questions."
    },
    {
      "id": "quality",
      "essentialUnderstandingDe": "Messung vieler Reads ersetzt keine Qualitätskontrolle, eindeutige Zuordnung oder passende Vergleichsprobe.",
      "essentialUnderstandingEn": "Many reads do not replace quality control, unambiguous assignment or an appropriate comparison sample.",
      "observablePerformanceDe": "Die lernende Person ordnet einen Qualitätsbefund der passenden Prozessstufe zu und begründet eine Kontrolle.",
      "observablePerformanceEn": "The learner assigns a quality finding to the relevant workflow stage and justifies a control."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Datenmengen und Probentyp beeinflussen die Interpretation; Sequenzbefund und biologische Bedeutung sind getrennt.",
      "essentialUnderstandingEn": "Data volume and sample type affect interpretation; sequence findings and biological meaning are distinct.",
      "observablePerformanceDe": "Die lernende Person passt den Workflow an eine neue Frage oder Störung an und nennt eine Grenze der Anwendung.",
      "observablePerformanceEn": "The learner adapts the workflow to a new question or disruption and names an application limitation."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "workflow",
      "quality",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "input",
      "textDe": "DNA-Varianten gegenüber RNA-Expression",
      "textEn": "DNA variants versus RNA expression"
    },
    {
      "id": "problem",
      "textDe": "Kontamination, Bibliotheksmenge und Normalisierung",
      "textEn": "Contamination, library depth and normalization"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "ngs-dna-targeted-workflow",
      "taskDemandDe": "Ordne die Schritte und benenne jeweils den Zweck. Berechne den beobachteten Variantenanteil in A, begründe, weshalb dies noch keine sichere biologische Variante ist, und nenne eine Folgekontrolle. Darf das Panel alle genomischen Veränderungen ausschließen?",
      "taskDemandEn": "Order the steps and identify each purpose. Calculate the observed variant fraction in A, explain why this is not yet a secure biological variant and name a follow-up control. Can the panel exclude every genomic change?",
      "expectedPerformanceDe": "Reihenfolge: Isolation/Leerkontrolle→Qualität/Identität→gezielte indizierte Bibliothek→parallele Sequenzierung→Read-/Adapter-QC→Referenzalignment/Variantenkandidaten→Interpretation. Anteil8/20=40%. Sequenzreads sind Messdaten, keine automatisch bestätigte Mutation: dieselbe Abweichung in der Leerkontrolle weist auf mögliche Kontamination, Fehlzuordnung oder Artefakte hin. Neue unabhängige Extraktion mit sauberer Kontrolle und gegebenenfalls anderer Bestätigungstechnik ist nötig. Das Panel kann über nicht untersuchte Regionen nichts ausschließen.",
      "expectedPerformanceEn": "Order: extraction/blank→quality/identity→targeted indexed library→parallel sequencing→read/adapter QC→reference alignment/variant candidates→interpretation. Fraction8/20=40%. Reads are measurements, not automatically a confirmed mutation: the same difference in the blank indicates possible contamination, misassignment or artifacts. A new independent extraction with a clean control and, where appropriate, another confirmation technique is needed. A panel excludes nothing in unexamined regions.",
      "understandingFocusDe": "NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.",
      "understandingFocusEn": "NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation."
    },
    {
      "id": "ngs-rna-depth-versus-expression",
      "taskDemandDe": "Skizziere den Zweck der Stufen. Vergleiche G undH nach der gegebenen Normalisierung und widerlege die Aussage: Beide Gene sind wegen größerer Rohcounts hochreguliert. Welcher zusätzliche Versuch ist für eine biologische Schlussfolgerung nötig?",
      "taskDemandEn": "Outline the purpose of the stages. Compare G andH after the supplied normalization and challenge: both genes are upregulated because raw counts are larger. What additional experiment is needed for a biological conclusion?",
      "expectedPerformanceDe": "Die Bibliothek macht RNA-Information sequenzierbar und unterscheidet Proben; Sequenzierung erzeugt Reads, Analyse prüft/ordnet sie, Interpretation verbindet Daten und Frage. G:100/1=100CPM,200/2=100CPM, Verhältnis1. H:50CPM und150CPM, Verhältnis3. Doppelte Sequenziertiefe erklärt die G-Rohcountzunahme; H zeigt in diesem konstruierten Datensatz einen höheren normalisierten Wert. Biologische Replikate und passende Kontrollbedingungen sind nötig; ohne sie keine Signifikanz oder sichere Ursache.",
      "expectedPerformanceEn": "The library makes RNA information sequenceable and distinguishes samples; sequencing creates reads, analysis checks/assigns them, interpretation links data to the question. G:100/1=100CPM,200/2=100CPM, ratio1. H:50CPM and150CPM, ratio3. Doubled sequencing depth explains G raw-count increase; H has a higher normalized value in this constructed dataset. Biological replicates and appropriate controls are needed; without them neither significance nor a secure cause follows.",
      "understandingFocusDe": "NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.",
      "understandingFocusEn": "NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation."
    }
  ]
}

### ngs-rna-depth-versus-expression — Mehr Reads bedeutet nicht automatisch mehr Expression

**materialDe**

Synthetisches RNA-seq-Beispiel mit gleichen Genlängen und gleichem Referenztranskriptom. Für diesen Fall sind Counts bereits eindeutig zugeordnet; Normalisierung erfolgt als Counts pro Million zugeordneter Reads (CPM). Kontrolle:1Million zugeordnete Reads; GenG100, GenH50. Behandlung:2Millionen; G200,H300. Gegebene Vorbereitung: RNA-Isolation/Integritätsprüfung→Umwandlung in cDNA und passende indizierte Bibliothek→parallele Sequenzierung→Read-QC/Zuordnung→normalisierte Genvergleichswerte→Interpretation. Eine Probe je Bedingung, daher keine Streuungs- oder Signifikanzangaben.

**materialEn**

Synthetic RNA-seq example with equal gene lengths and the same reference transcriptome. Counts are already unambiguously assigned; this case normalizes as counts per million assigned reads (CPM). Control:1million assigned reads; geneG100,geneH50. Treatment:2million; G200,H300. Supplied preparation: RNA extraction/integrity check→conversion to cDNA and suitable indexed library→parallel sequencing→read QC/assignment→normalized gene comparison→interpretation. There is one sample per condition, so no variability or significance estimate.

**taskDe**

Skizziere den Zweck der Stufen. Vergleiche G undH nach der gegebenen Normalisierung und widerlege die Aussage: Beide Gene sind wegen größerer Rohcounts hochreguliert. Welcher zusätzliche Versuch ist für eine biologische Schlussfolgerung nötig?

**taskEn**

Outline the purpose of the stages. Compare G andH after the supplied normalization and challenge: both genes are upregulated because raw counts are larger. What additional experiment is needed for a biological conclusion?

**workedSolutionDe**

Die Bibliothek macht RNA-Information sequenzierbar und unterscheidet Proben; Sequenzierung erzeugt Reads, Analyse prüft/ordnet sie, Interpretation verbindet Daten und Frage. G:100/1=100CPM,200/2=100CPM, Verhältnis1. H:50CPM und150CPM, Verhältnis3. Doppelte Sequenziertiefe erklärt die G-Rohcountzunahme; H zeigt in diesem konstruierten Datensatz einen höheren normalisierten Wert. Biologische Replikate und passende Kontrollbedingungen sind nötig; ohne sie keine Signifikanz oder sichere Ursache.

**workedSolutionEn**

The library makes RNA information sequenceable and distinguishes samples; sequencing creates reads, analysis checks/assigns them, interpretation links data to the question. G:100/1=100CPM,200/2=100CPM, ratio1. H:50CPM and150CPM, ratio3. Doubled sequencing depth explains G raw-count increase; H has a higher normalized value in this constructed dataset. Biological replicates and appropriate controls are needed; without them neither significance nor a secure cause follows.

**freshTransferDe**

Eine neue Probe nach24h hat1Million zugeordnete Reads, G90,H60. In einer parallel gewonnenen DNA-Bibliothek wird fürH unveränderte Sequenz beobachtet. Ordne die zeitliche Veränderung ein und entscheide, ob eine abklingende mRNA-Antwort zwingend eine DNA-Mutation rückgängig macht.

**freshTransferEn**

A new24h sample has1million assigned reads, G90,H60. A parallel DNA library shows unchanged sequence forH. Interpret the time change and decide whether a declining mRNA response necessarily reverses a DNA mutation.

**freshTransferSolutionDe**

G90CPM liegt ähnlich zur Ausgangsgröße100, H60CPM näher zu50 als zu150; die Daten passen zu einer vorübergehenden Transkriptantwort. Fehlende Replikate begrenzen den Vergleich. Unveränderte DNA und andere mRNA sind mit Regulation vereinbar; es wurde keine zurückgenommene Mutation gezeigt. RNA- und DNA-Workflows beantworten verschiedene Fragen.

**freshTransferSolutionEn**

G90CPM is near the initial100; H60CPM is nearer50 than150, fitting a transient transcript response. Lack of replicates limits comparison. Unchanged DNA with changed mRNA is compatible with regulation; no reversed mutation was shown. RNA and DNA workflows answer different questions.

**limitsDe**

CPM wird als vereinfachte Fallhilfe angegeben, nicht als universell ausreichende RNA-seq-Analyse. Normalisierung, Streuung, Zellzusammensetzung und Transcriptlängen können im echten Workflow weitere Anforderungen stellen.

**limitsEn**

CPM is supplied as simplified case support rather than a universally sufficient RNA-seq analysis. Normalization, variability, cell composition and transcript lengths can add requirements in a real workflow.

**Rubrik**

{"id": "workflow", "expectationIds": ["workflow"], "criterionDe": "Die lernende Person skizziert die Schritte mit ihren Ein- und Ausgaben und unterscheidet DNA- und RNA-basierte Fragestellungen.", "criterionEn": "The learner outlines steps with their inputs and outputs and distinguishes DNA- and RNA-based questions."}

{"id": "quality", "expectationIds": ["quality"], "criterionDe": "Die lernende Person ordnet einen Qualitätsbefund der passenden Prozessstufe zu und begründet eine Kontrolle.", "criterionEn": "The learner assigns a quality finding to the relevant workflow stage and justifies a control."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person passt den Workflow an eine neue Frage oder Störung an und nennt eine Grenze der Anwendung.", "criterionEn": "The learner adapts the workflow to a new question or disruption and names an application limitation."}

**Ganzes positives Profil**

{
  "archetype": "procedure",
  "expectations": [
    {
      "id": "workflow",
      "essentialUnderstandingDe": "NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.",
      "essentialUnderstandingEn": "NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation.",
      "observablePerformanceDe": "Die lernende Person skizziert die Schritte mit ihren Ein- und Ausgaben und unterscheidet DNA- und RNA-basierte Fragestellungen.",
      "observablePerformanceEn": "The learner outlines steps with their inputs and outputs and distinguishes DNA- and RNA-based questions."
    },
    {
      "id": "quality",
      "essentialUnderstandingDe": "Messung vieler Reads ersetzt keine Qualitätskontrolle, eindeutige Zuordnung oder passende Vergleichsprobe.",
      "essentialUnderstandingEn": "Many reads do not replace quality control, unambiguous assignment or an appropriate comparison sample.",
      "observablePerformanceDe": "Die lernende Person ordnet einen Qualitätsbefund der passenden Prozessstufe zu und begründet eine Kontrolle.",
      "observablePerformanceEn": "The learner assigns a quality finding to the relevant workflow stage and justifies a control."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Datenmengen und Probentyp beeinflussen die Interpretation; Sequenzbefund und biologische Bedeutung sind getrennt.",
      "essentialUnderstandingEn": "Data volume and sample type affect interpretation; sequence findings and biological meaning are distinct.",
      "observablePerformanceDe": "Die lernende Person passt den Workflow an eine neue Frage oder Störung an und nennt eine Grenze der Anwendung.",
      "observablePerformanceEn": "The learner adapts the workflow to a new question or disruption and names an application limitation."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "workflow",
      "quality",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "input",
      "textDe": "DNA-Varianten gegenüber RNA-Expression",
      "textEn": "DNA variants versus RNA expression"
    },
    {
      "id": "problem",
      "textDe": "Kontamination, Bibliotheksmenge und Normalisierung",
      "textEn": "Contamination, library depth and normalization"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "ngs-dna-targeted-workflow",
      "taskDemandDe": "Ordne die Schritte und benenne jeweils den Zweck. Berechne den beobachteten Variantenanteil in A, begründe, weshalb dies noch keine sichere biologische Variante ist, und nenne eine Folgekontrolle. Darf das Panel alle genomischen Veränderungen ausschließen?",
      "taskDemandEn": "Order the steps and identify each purpose. Calculate the observed variant fraction in A, explain why this is not yet a secure biological variant and name a follow-up control. Can the panel exclude every genomic change?",
      "expectedPerformanceDe": "Reihenfolge: Isolation/Leerkontrolle→Qualität/Identität→gezielte indizierte Bibliothek→parallele Sequenzierung→Read-/Adapter-QC→Referenzalignment/Variantenkandidaten→Interpretation. Anteil8/20=40%. Sequenzreads sind Messdaten, keine automatisch bestätigte Mutation: dieselbe Abweichung in der Leerkontrolle weist auf mögliche Kontamination, Fehlzuordnung oder Artefakte hin. Neue unabhängige Extraktion mit sauberer Kontrolle und gegebenenfalls anderer Bestätigungstechnik ist nötig. Das Panel kann über nicht untersuchte Regionen nichts ausschließen.",
      "expectedPerformanceEn": "Order: extraction/blank→quality/identity→targeted indexed library→parallel sequencing→read/adapter QC→reference alignment/variant candidates→interpretation. Fraction8/20=40%. Reads are measurements, not automatically a confirmed mutation: the same difference in the blank indicates possible contamination, misassignment or artifacts. A new independent extraction with a clean control and, where appropriate, another confirmation technique is needed. A panel excludes nothing in unexamined regions.",
      "understandingFocusDe": "NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.",
      "understandingFocusEn": "NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation."
    },
    {
      "id": "ngs-rna-depth-versus-expression",
      "taskDemandDe": "Skizziere den Zweck der Stufen. Vergleiche G undH nach der gegebenen Normalisierung und widerlege die Aussage: Beide Gene sind wegen größerer Rohcounts hochreguliert. Welcher zusätzliche Versuch ist für eine biologische Schlussfolgerung nötig?",
      "taskDemandEn": "Outline the purpose of the stages. Compare G andH after the supplied normalization and challenge: both genes are upregulated because raw counts are larger. What additional experiment is needed for a biological conclusion?",
      "expectedPerformanceDe": "Die Bibliothek macht RNA-Information sequenzierbar und unterscheidet Proben; Sequenzierung erzeugt Reads, Analyse prüft/ordnet sie, Interpretation verbindet Daten und Frage. G:100/1=100CPM,200/2=100CPM, Verhältnis1. H:50CPM und150CPM, Verhältnis3. Doppelte Sequenziertiefe erklärt die G-Rohcountzunahme; H zeigt in diesem konstruierten Datensatz einen höheren normalisierten Wert. Biologische Replikate und passende Kontrollbedingungen sind nötig; ohne sie keine Signifikanz oder sichere Ursache.",
      "expectedPerformanceEn": "The library makes RNA information sequenceable and distinguishes samples; sequencing creates reads, analysis checks/assigns them, interpretation links data to the question. G:100/1=100CPM,200/2=100CPM, ratio1. H:50CPM and150CPM, ratio3. Doubled sequencing depth explains G raw-count increase; H has a higher normalized value in this constructed dataset. Biological replicates and appropriate controls are needed; without them neither significance nor a secure cause follows.",
      "understandingFocusDe": "NGS verbindet geeignete Probe, Bibliothek, parallele Sequenzierung, Datenverarbeitung und Interpretation; das Einsatzfeld bestimmt die Vorbereitung.",
      "understandingFocusEn": "NGS connects a suitable sample, library, parallel sequencing, data processing and interpretation; the application determines preparation."
    }
  ]
}

## ed4cf96f-e1c9-5784-97f2-8279ff5a31b1

### bioinformatics-alignment-and-local-hit — Kurze Perfektion oder breite Übereinstimmung

**materialDe**

Synthetische Sequenzen, kein tatsächlicher BLAST-Lauf. Alignment1: Referenz ACGTACGTACGT; Query ACGTTCGTACGT, beide in derselben Orientierung, keine Lücke. Identität=gleiche Spalten/alle Alignmentspalten. Zusätzlich gegebene BLAST-artige Treffer für eine100Aminosäuren-Query: TrefferA20 ausgerichtete Querypositionen,20 identisch, E=0,08; TrefferB95 ausgerichtete Querypositionen,84 identisch, E=1e-25. Keine anderen Treffer. E-Wert wird hier als erwartete Anzahl mindestens ebenso guter Zufallstreffer in dieser Datenbank erläutert, nicht als Krankheitswahrscheinlichkeit.

**materialEn**

Synthetic sequences; no actual BLAST run. Alignment1: reference ACGTACGTACGT; query ACGTTCGTACGT, same orientation, no gap. Identity=matching columns/all alignment columns. Also supplied BLAST-like hits for a100-amino-acid query: hitA20 aligned query positions,20 identical,E=0.08; hitB95 aligned query positions,84 identical,E=1e-25. No other hits. E-value is explained here as the expected count of equally good or better chance hits in this database, not a disease probability.

**taskDe**

Bestimme Mismatchposition und Identität in Alignment1. Berechne Queryabdeckung und Identität für A/B und begründe den geeigneteren Kandidaten für eine umfassende Ähnlichkeitsaussage. Welche biologische Aussage bleibt trotzdem offen?

**taskEn**

Determine mismatch position and identity in alignment1. Calculate query coverage and identity for A/B and justify the better candidate for a broad similarity statement. Which biological conclusion remains unresolved?

**workedSolutionDe**

Alignment1 hat an Position5 T stattA:11/12=91,7% Identität. A:20/100=20% Abdeckung,20/20=100% Identität; B:95% Abdeckung,84/95≈88,4% Identität. B bietet längere, signifikante Übereinstimmung für die ganze Query; A kann nur einen kurzen Abschnitt betreffen. E=1e-25 beschreibt Zufallstreffersignifikanz unter Suchbedingungen, nicht Funktion, Verwandtschaftsgrad mit Gewissheit oder Diagnose. Funktion benötigt passende Annotation und weitere biologische Befunde.

**workedSolutionEn**

Alignment1 differs at position5 with T instead ofA:11/12=91.7% identity. A:20/100=20% coverage,20/20=100% identity; B:95% coverage,84/95≈88.4% identity. B provides longer significant agreement for the whole query; A may concern only a short region. E=1e-25 describes chance-hit significance under search conditions rather than function, certain evolutionary relation or diagnosis. Function needs suitable annotation and further biological evidence.

**freshTransferDe**

Eine neue Sequenz enthält eine zusätzliche Base. Gegebenes Alignment: Referenz ACGT-ACGTACGT; Query ACGTTACGTACGT. Für dieses Alignment gelten +2 je identische Spalte,−1 je Mismatch,−2 je Lückenspalte. Berechne Identität und Score, erkläre die Lücke und entscheide, ob sie allein biologische Insertion gegenüber Sequenzierfehler beweist.

**freshTransferEn**

A new sequence has an extra base. Supplied alignment: reference ACGT-ACGTACGT; query ACGTTACGTACGT. This alignment scores +2 per identical column,−1 per mismatch,−2 per gap column. Calculate identity and score, explain the gap and decide whether it alone proves biological insertion rather than sequencing error.

**freshTransferSolutionDe**

13Spalten enthalten12Identitäten und1Lückenspalte:12/13≈92,3%, Score24−2=22. Die Lücke bildet eine zusätzliche Querybase relativ zur Referenz ab. Sie ist eine Ausrichtungsdarstellung; unabhängige qualitätsgesicherte Reads/Bestätigung sind nötig, um Variante von Fehler zu trennen. Der gelieferte Score beweist nicht, dass dies unter jedem Algorithmus das optimale Alignment ist.

**freshTransferSolutionEn**

Thirteen columns contain12 identities and1 gap column:12/13≈92.3%, score24−2=22. The gap represents an additional query base relative to the reference. It is an alignment representation; independent quality-controlled reads/confirmation are needed to distinguish a variant from error. The supplied score does not prove this is optimal under every algorithm.

**limitsDe**

Die Minisequenz dient dem Zählen, nicht echter statistischer Homologiesuche. Treffer sind illustrative, vollständig gelieferte Daten; es wird kein tatsächlicher Suchlauf oder Lernendenbefund behauptet.

**limitsEn**

The miniature sequence supports counting rather than real statistical homology searching. Hits are illustrative fully supplied data; no actual search or learner result is claimed.

**Rubrik**

{"id": "alignment", "expectationIds": ["alignment"], "criterionDe": "Die lernende Person wertet die gegebene Ausrichtung aus und erklärt Identität, Lücken und Queryabdeckung mit explizitem Nenner.", "criterionEn": "The learner evaluates the supplied alignment and explains identity, gaps and query coverage with explicit denominators."}

{"id": "quality", "expectationIds": ["quality"], "criterionDe": "Die lernende Person vergleicht die bereitgestellten Treffer anhand von Abdeckung, Identität, E-Wert und Datenqualität und trennt Kandidaten von Beweisen.", "criterionEn": "The learner compares supplied hits using coverage, identity, E-value and data quality and separates candidates from proof."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person deutet eine neue Lücke, Qualitätsstörung oder Datenbankänderung und begründet einen passenden Kontrollschritt.", "criterionEn": "The learner interprets a new gap, quality defect or database change and justifies an appropriate control step."}

**Ganzes positives Profil**

{
  "archetype": "data",
  "expectations": [
    {
      "id": "alignment",
      "essentialUnderstandingDe": "Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.",
      "essentialUnderstandingEn": "An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage.",
      "observablePerformanceDe": "Die lernende Person wertet die gegebene Ausrichtung aus und erklärt Identität, Lücken und Queryabdeckung mit explizitem Nenner.",
      "observablePerformanceEn": "The learner evaluates the supplied alignment and explains identity, gaps and query coverage with explicit denominators."
    },
    {
      "id": "quality",
      "essentialUnderstandingDe": "BLAST-Signifikanz hängt unter anderem von Länge, Datenbank und Komplexität ab und bestätigt nicht allein Funktion oder Diagnose.",
      "essentialUnderstandingEn": "BLAST significance depends among other factors on length, database and complexity and does not by itself establish function or diagnosis.",
      "observablePerformanceDe": "Die lernende Person vergleicht die bereitgestellten Treffer anhand von Abdeckung, Identität, E-Wert und Datenqualität und trennt Kandidaten von Beweisen.",
      "observablePerformanceEn": "The learner compares supplied hits using coverage, identity, E-value and data quality and separates candidates from proof."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Neue Sequenz- oder Datenbankinformation kann eine Interpretation verändern; reproduzierbare Suche braucht dokumentierte Eingaben.",
      "essentialUnderstandingEn": "New sequence or database information can change interpretation; reproducible searching requires documented inputs.",
      "observablePerformanceDe": "Die lernende Person deutet eine neue Lücke, Qualitätsstörung oder Datenbankänderung und begründet einen passenden Kontrollschritt.",
      "observablePerformanceEn": "The learner interprets a new gap, quality defect or database change and justifies an appropriate control step."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "alignment",
      "quality",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "alignment-type",
      "textDe": "Mismatch und Lücke, kurzer lokaler und langer Treffer",
      "textEn": "Mismatch and gap, short local and long match"
    },
    {
      "id": "quality-change",
      "textDe": "Datenbankumfang, Wiederholungen und Readqualität",
      "textEn": "Database size, repetitions and read quality"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "bioinformatics-alignment-and-local-hit",
      "taskDemandDe": "Bestimme Mismatchposition und Identität in Alignment1. Berechne Queryabdeckung und Identität für A/B und begründe den geeigneteren Kandidaten für eine umfassende Ähnlichkeitsaussage. Welche biologische Aussage bleibt trotzdem offen?",
      "taskDemandEn": "Determine mismatch position and identity in alignment1. Calculate query coverage and identity for A/B and justify the better candidate for a broad similarity statement. Which biological conclusion remains unresolved?",
      "expectedPerformanceDe": "Alignment1 hat an Position5 T stattA:11/12=91,7% Identität. A:20/100=20% Abdeckung,20/20=100% Identität; B:95% Abdeckung,84/95≈88,4% Identität. B bietet längere, signifikante Übereinstimmung für die ganze Query; A kann nur einen kurzen Abschnitt betreffen. E=1e-25 beschreibt Zufallstreffersignifikanz unter Suchbedingungen, nicht Funktion, Verwandtschaftsgrad mit Gewissheit oder Diagnose. Funktion benötigt passende Annotation und weitere biologische Befunde.",
      "expectedPerformanceEn": "Alignment1 differs at position5 with T instead ofA:11/12=91.7% identity. A:20/100=20% coverage,20/20=100% identity; B:95% coverage,84/95≈88.4% identity. B provides longer significant agreement for the whole query; A may concern only a short region. E=1e-25 describes chance-hit significance under search conditions rather than function, certain evolutionary relation or diagnosis. Function needs suitable annotation and further biological evidence.",
      "understandingFocusDe": "Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.",
      "understandingFocusEn": "An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage."
    },
    {
      "id": "bioinformatics-quality-and-database",
      "taskDemandDe": "Vergleiche R/U vor dem Trimmen anhand von Queryabdeckung, Identität, E-Wert und Komplexität. Bestimme anhand der expliziten Positionen, welche U-Positionen durch das Trimmen entfernt werden, und gib den U-Bereich in der neu nummerierten Query an. Berechne die Abdeckung des erhaltenen U-Alignments relativ zu 120 und zu 110. Erkläre, warum ein gefilterter Trefferverlust nicht bedeutet, dass die biologische Sequenz verschwunden ist, und warum aus der neuen Abdeckung allein kein neuer E-Wert folgt.",
      "taskDemandEn": "Compare R/U before trimming using query coverage, identity, E-value and complexity. Use the explicit coordinates to identify which U positions trimming removes and locate U within the renumbered query. Calculate coverage of the retained U alignment relative to 120 and to 110. Explain why losing a filtered hit does not mean the biological sequence disappeared and why the changed coverage alone does not determine a new E-value.",
      "expectedPerformanceDe": "Vor dem Trimmen: R deckt 30/120=25% ab und betrifft einen wenig informativen Repeat. U deckt 85/120≈70,8% ab, mit Identität 80/85≈94,1%; sein kleiner gegebener E-Wert und vielfältiger Abschnitt machen ihn zum besseren Ähnlichkeitskandidaten. Entfernt werden nur Originalpositionen 1–10. Diese schneiden den U-Bereich 31–115 nicht, somit bleiben alle 85 U-Positionen und 80 Identitäten erhalten. In der neu nummerierten Query liegt U an Positionen 21–105; 105−21+1=85. Die Abdeckung beträgt jetzt 85/110≈77,3%, während die Identität 80/85 unverändert bleibt. Dies wertet das gegebene erhaltene Alignment aus und behauptet keinen tatsächlich neu ausgeführten Suchlauf. Ein neuer E-Wert folgt nicht allein aus dieser Abdeckung; er muss für die neue Query unter dokumentierten Suchbedingungen gesondert ermittelt werden. Filterung verändert die Suchauswertung, nicht rückwirkend die DNA. Qualität und Region bleiben vor einer Funktionsbehauptung zu prüfen.",
      "expectedPerformanceEn": "Before trimming: R covers 30/120=25% and concerns an uninformative repeat. U covers 85/120≈70.8%, with identity 80/85≈94.1%; its small supplied E-value and diverse region make it the better similarity candidate. Only original positions 1–10 are removed. They do not intersect U positions 31–115, so all 85 U positions and 80 identities remain. In the renumbered query U occupies positions 21–105; 105−21+1=85. Coverage is now 85/110≈77.3%, whereas identity remains 80/85. This evaluates the supplied retained alignment rather than claiming an actual new search. Changed coverage alone does not determine a new E-value; this needs separate calculation for the new query under documented search conditions. Filtering changes search evaluation rather than retroactively changing DNA. Quality and region still need checking before a functional claim.",
      "understandingFocusDe": "Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.",
      "understandingFocusEn": "An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage."
    }
  ]
}

### bioinformatics-quality-and-database — Ein Repeat und ein verändertes Datenbankfenster

**materialDe**

Synthetische Suchausgabe, kein tatsächlicher BLAST-Lauf: Die Query ist 120 Basen lang. Originalpositionen 1–30 bestehen fast nur aus A; Positionen 31–120 sind vielfältig. Treffer R richtet ausschließlich Positionen 1–30 aus: 30 ausgerichtete Positionen, 30 Identitäten, E=0,6 ohne Komplexitätsfilter. Treffer U richtet lückenlos ausschließlich Originalpositionen 31–115 aus: 85 ausgerichtete Positionen, davon 80 Identitäten, E=1e-12. Qualitätsinfo: Ausschließlich Originalpositionen 1–10 stammen aus einem schlechten Readanfang im Repeat; sie werden entfernt. Die getrimmte Query umfasst Originalpositionen 11–120 und ist 110 Basen lang. Nummeriere ihren ersten verbleibenden Buchstaben als neue Position 1. Komplexitätsfilter sollen irreführende Repeat-Treffer reduzieren. Datenbankversion, Suchparameter, genaue Query und QC-Schritte müssen dokumentiert werden. Die E-Werte sind gegebene illustrative Suchausgaben vor dem Trimmen; ein neuer E-Wert nach dem Trimmen ist nicht geliefert.

**materialEn**

Synthetic search output, not an actual BLAST run: the query has 120 bases. Original positions 1–30 are almost entirely A; positions 31–120 are diverse. Hit R aligns only positions 1–30: 30 aligned positions, 30 identities, E=0.6 without a complexity filter. Hit U aligns only original positions 31–115 without gaps: 85 aligned positions, including 80 identities, E=1e-12. Quality information: only original positions 1–10 come from a poor-quality read beginning within the repeat; they are removed. The trimmed query comprises original positions 11–120 and has 110 bases. Number its first retained letter as new position 1. Complexity filters reduce misleading repeat matches. Database version, parameters, exact query and QC steps need documentation. E-values are supplied illustrative outputs before trimming; a new post-trimming E-value is not supplied.

**taskDe**

Vergleiche R/U vor dem Trimmen anhand von Queryabdeckung, Identität, E-Wert und Komplexität. Bestimme anhand der expliziten Positionen, welche U-Positionen durch das Trimmen entfernt werden, und gib den U-Bereich in der neu nummerierten Query an. Berechne die Abdeckung des erhaltenen U-Alignments relativ zu 120 und zu 110. Erkläre, warum ein gefilterter Trefferverlust nicht bedeutet, dass die biologische Sequenz verschwunden ist, und warum aus der neuen Abdeckung allein kein neuer E-Wert folgt.

**taskEn**

Compare R/U before trimming using query coverage, identity, E-value and complexity. Use the explicit coordinates to identify which U positions trimming removes and locate U within the renumbered query. Calculate coverage of the retained U alignment relative to 120 and to 110. Explain why losing a filtered hit does not mean the biological sequence disappeared and why the changed coverage alone does not determine a new E-value.

**workedSolutionDe**

Vor dem Trimmen: R deckt 30/120=25% ab und betrifft einen wenig informativen Repeat. U deckt 85/120≈70,8% ab, mit Identität 80/85≈94,1%; sein kleiner gegebener E-Wert und vielfältiger Abschnitt machen ihn zum besseren Ähnlichkeitskandidaten. Entfernt werden nur Originalpositionen 1–10. Diese schneiden den U-Bereich 31–115 nicht, somit bleiben alle 85 U-Positionen und 80 Identitäten erhalten. In der neu nummerierten Query liegt U an Positionen 21–105; 105−21+1=85. Die Abdeckung beträgt jetzt 85/110≈77,3%, während die Identität 80/85 unverändert bleibt. Dies wertet das gegebene erhaltene Alignment aus und behauptet keinen tatsächlich neu ausgeführten Suchlauf. Ein neuer E-Wert folgt nicht allein aus dieser Abdeckung; er muss für die neue Query unter dokumentierten Suchbedingungen gesondert ermittelt werden. Filterung verändert die Suchauswertung, nicht rückwirkend die DNA. Qualität und Region bleiben vor einer Funktionsbehauptung zu prüfen.

**workedSolutionEn**

Before trimming: R covers 30/120=25% and concerns an uninformative repeat. U covers 85/120≈70.8%, with identity 80/85≈94.1%; its small supplied E-value and diverse region make it the better similarity candidate. Only original positions 1–10 are removed. They do not intersect U positions 31–115, so all 85 U positions and 80 identities remain. In the renumbered query U occupies positions 21–105; 105−21+1=85. Coverage is now 85/110≈77.3%, whereas identity remains 80/85. This evaluates the supplied retained alignment rather than claiming an actual new search. Changed coverage alone does not determine a new E-value; this needs separate calculation for the new query under documented search conditions. Filtering changes search evaluation rather than retroactively changing DNA. Quality and region still need checking before a functional claim.

**freshTransferDe**

Eine unabhängige reine Datenbankvariation verwendet wieder die ursprüngliche ungetrimmte 120-Basen-Query mit denselben Filtern und sonst gleichen Bedingungen; Trimmen und Filteränderung werden hier nicht gleichzeitig vorgenommen. Die neue Datenbank ist etwa zehnmal größer. Für diese Aufgabe ist gegeben: gleicher Alignmentscore ergibt näherungsweise zehnfachen E-Wert. U behält seine 85 Positionen und 80 Identitäten. Bestimme den neuen E-Wert aus dem gegebenen ursprünglichen E=1e-12 und bewerte die Aussage: Die Sequenzen sind nun biologisch weniger ähnlich. Welche Suchdaten müssten zum Vergleich erhalten bleiben?

**freshTransferEn**

An independent database-only variation again uses the original untrimmed 120-base query, the same filters and otherwise identical conditions; trimming and a filter change are not performed at the same time. The new database is approximately tenfold larger. For this task, an unchanged alignment score yields approximately tenfold E-value. U retains its 85 positions and 80 identities. Calculate the new E-value from the supplied original E=1e-12 and evaluate: the sequences are now biologically less similar. Which search information must be preserved for comparison?

**freshTransferSolutionDe**

Für diese isolierte Datenbankvariation wird E näherungsweise 1e-11; Alignment und Identität bleiben gleich. Geändert ist die statistische Zufallserwartung im größeren Suchraum, nicht die Basenähnlichkeit. Zu erhalten sind die genaue hier ungetrimmte 120-Basen-Query einschließlich QC-Information, Datenbankname/Version/Umfang, Programm/Parameter, Filterung, Datum sowie vollständige Alignment- und Qualitätsangaben. Eine zusätzlich getrimmte Query wäre eine zweite Veränderung und müsste gesondert dokumentiert werden. Die angenommene Skalierung ist Fallhilfe, kein tatsächlich erneut berechneter BLAST-Wert.

**freshTransferSolutionEn**

For this isolated database variation E becomes approximately 1e-11; alignment and identity remain unchanged. The chance expectation in a larger search space changes rather than base similarity. Preserve the exact original untrimmed 120-base query with QC information, database name/version/size, program/parameters, filtering, date and full alignment/quality details. Additional trimming would be a second change and needs separate documentation. The assumed scaling is task support, not an actually recalculated BLAST value.

**limitsDe**

Schlechte Readqualität, statistische Signifikanz und biologische Funktion sind unterschiedliche Kriterien. Datenbank-/Filterwechsel ist echte Interpretationsvariation, kein reiner Zahltausch.

**limitsEn**

Poor read quality, statistical significance and biological function are distinct criteria. Database/filter changes provide meaningful interpretive variation rather than a simple number swap.

**Rubrik**

{"id": "alignment", "expectationIds": ["alignment"], "criterionDe": "Die lernende Person wertet die gegebene Ausrichtung aus und erklärt Identität, Lücken und Queryabdeckung mit explizitem Nenner.", "criterionEn": "The learner evaluates the supplied alignment and explains identity, gaps and query coverage with explicit denominators."}

{"id": "quality", "expectationIds": ["quality"], "criterionDe": "Die lernende Person vergleicht die bereitgestellten Treffer anhand von Abdeckung, Identität, E-Wert und Datenqualität und trennt Kandidaten von Beweisen.", "criterionEn": "The learner compares supplied hits using coverage, identity, E-value and data quality and separates candidates from proof."}

{"id": "transfer", "expectationIds": ["transfer"], "criterionDe": "Die lernende Person deutet eine neue Lücke, Qualitätsstörung oder Datenbankänderung und begründet einen passenden Kontrollschritt.", "criterionEn": "The learner interprets a new gap, quality defect or database change and justifies an appropriate control step."}

**Ganzes positives Profil**

{
  "archetype": "data",
  "expectations": [
    {
      "id": "alignment",
      "essentialUnderstandingDe": "Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.",
      "essentialUnderstandingEn": "An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage.",
      "observablePerformanceDe": "Die lernende Person wertet die gegebene Ausrichtung aus und erklärt Identität, Lücken und Queryabdeckung mit explizitem Nenner.",
      "observablePerformanceEn": "The learner evaluates the supplied alignment and explains identity, gaps and query coverage with explicit denominators."
    },
    {
      "id": "quality",
      "essentialUnderstandingDe": "BLAST-Signifikanz hängt unter anderem von Länge, Datenbank und Komplexität ab und bestätigt nicht allein Funktion oder Diagnose.",
      "essentialUnderstandingEn": "BLAST significance depends among other factors on length, database and complexity and does not by itself establish function or diagnosis.",
      "observablePerformanceDe": "Die lernende Person vergleicht die bereitgestellten Treffer anhand von Abdeckung, Identität, E-Wert und Datenqualität und trennt Kandidaten von Beweisen.",
      "observablePerformanceEn": "The learner compares supplied hits using coverage, identity, E-value and data quality and separates candidates from proof."
    },
    {
      "id": "transfer",
      "essentialUnderstandingDe": "Neue Sequenz- oder Datenbankinformation kann eine Interpretation verändern; reproduzierbare Suche braucht dokumentierte Eingaben.",
      "essentialUnderstandingEn": "New sequence or database information can change interpretation; reproducible searching requires documented inputs.",
      "observablePerformanceDe": "Die lernende Person deutet eine neue Lücke, Qualitätsstörung oder Datenbankänderung und begründet einen passenden Kontrollschritt.",
      "observablePerformanceEn": "The learner interprets a new gap, quality defect or database change and justifies an appropriate control step."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "alignment",
      "quality",
      "transfer"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "alignment-type",
      "textDe": "Mismatch und Lücke, kurzer lokaler und langer Treffer",
      "textEn": "Mismatch and gap, short local and long match"
    },
    {
      "id": "quality-change",
      "textDe": "Datenbankumfang, Wiederholungen und Readqualität",
      "textEn": "Database size, repetitions and read quality"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "bioinformatics-alignment-and-local-hit",
      "taskDemandDe": "Bestimme Mismatchposition und Identität in Alignment1. Berechne Queryabdeckung und Identität für A/B und begründe den geeigneteren Kandidaten für eine umfassende Ähnlichkeitsaussage. Welche biologische Aussage bleibt trotzdem offen?",
      "taskDemandEn": "Determine mismatch position and identity in alignment1. Calculate query coverage and identity for A/B and justify the better candidate for a broad similarity statement. Which biological conclusion remains unresolved?",
      "expectedPerformanceDe": "Alignment1 hat an Position5 T stattA:11/12=91,7% Identität. A:20/100=20% Abdeckung,20/20=100% Identität; B:95% Abdeckung,84/95≈88,4% Identität. B bietet längere, signifikante Übereinstimmung für die ganze Query; A kann nur einen kurzen Abschnitt betreffen. E=1e-25 beschreibt Zufallstreffersignifikanz unter Suchbedingungen, nicht Funktion, Verwandtschaftsgrad mit Gewissheit oder Diagnose. Funktion benötigt passende Annotation und weitere biologische Befunde.",
      "expectedPerformanceEn": "Alignment1 differs at position5 with T instead ofA:11/12=91.7% identity. A:20/100=20% coverage,20/20=100% identity; B:95% coverage,84/95≈88.4% identity. B provides longer significant agreement for the whole query; A may concern only a short region. E=1e-25 describes chance-hit significance under search conditions rather than function, certain evolutionary relation or diagnosis. Function needs suitable annotation and further biological evidence.",
      "understandingFocusDe": "Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.",
      "understandingFocusEn": "An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage."
    },
    {
      "id": "bioinformatics-quality-and-database",
      "taskDemandDe": "Vergleiche R/U vor dem Trimmen anhand von Queryabdeckung, Identität, E-Wert und Komplexität. Bestimme anhand der expliziten Positionen, welche U-Positionen durch das Trimmen entfernt werden, und gib den U-Bereich in der neu nummerierten Query an. Berechne die Abdeckung des erhaltenen U-Alignments relativ zu 120 und zu 110. Erkläre, warum ein gefilterter Trefferverlust nicht bedeutet, dass die biologische Sequenz verschwunden ist, und warum aus der neuen Abdeckung allein kein neuer E-Wert folgt.",
      "taskDemandEn": "Compare R/U before trimming using query coverage, identity, E-value and complexity. Use the explicit coordinates to identify which U positions trimming removes and locate U within the renumbered query. Calculate coverage of the retained U alignment relative to 120 and to 110. Explain why losing a filtered hit does not mean the biological sequence disappeared and why the changed coverage alone does not determine a new E-value.",
      "expectedPerformanceDe": "Vor dem Trimmen: R deckt 30/120=25% ab und betrifft einen wenig informativen Repeat. U deckt 85/120≈70,8% ab, mit Identität 80/85≈94,1%; sein kleiner gegebener E-Wert und vielfältiger Abschnitt machen ihn zum besseren Ähnlichkeitskandidaten. Entfernt werden nur Originalpositionen 1–10. Diese schneiden den U-Bereich 31–115 nicht, somit bleiben alle 85 U-Positionen und 80 Identitäten erhalten. In der neu nummerierten Query liegt U an Positionen 21–105; 105−21+1=85. Die Abdeckung beträgt jetzt 85/110≈77,3%, während die Identität 80/85 unverändert bleibt. Dies wertet das gegebene erhaltene Alignment aus und behauptet keinen tatsächlich neu ausgeführten Suchlauf. Ein neuer E-Wert folgt nicht allein aus dieser Abdeckung; er muss für die neue Query unter dokumentierten Suchbedingungen gesondert ermittelt werden. Filterung verändert die Suchauswertung, nicht rückwirkend die DNA. Qualität und Region bleiben vor einer Funktionsbehauptung zu prüfen.",
      "expectedPerformanceEn": "Before trimming: R covers 30/120=25% and concerns an uninformative repeat. U covers 85/120≈70.8%, with identity 80/85≈94.1%; its small supplied E-value and diverse region make it the better similarity candidate. Only original positions 1–10 are removed. They do not intersect U positions 31–115, so all 85 U positions and 80 identities remain. In the renumbered query U occupies positions 21–105; 105−21+1=85. Coverage is now 85/110≈77.3%, whereas identity remains 80/85. This evaluates the supplied retained alignment rather than claiming an actual new search. Changed coverage alone does not determine a new E-value; this needs separate calculation for the new query under documented search conditions. Filtering changes search evaluation rather than retroactively changing DNA. Quality and region still need checking before a functional claim.",
      "understandingFocusDe": "Ein Alignment beschreibt positionsbezogene Übereinstimmung und Lücken; lokaler Treffer und vollständige Sequenzabdeckung sind verschieden.",
      "understandingFocusEn": "An alignment describes positional agreement and gaps; a local hit differs from full sequence coverage."
    }
  ]
}

## ee686aee-43d3-50df-a60a-e47ac845586c

### risk-c1 — Bekannter Träger und unbekannter Partner

**materialDe**

Synthetisches vollständig penetrantes autosomal-rezessives Modell: aa zeigt Merkmal Z; AA und Aa nicht. Keine Neumutationen. Eine erwachsene Person ist durch einen für das Modell eindeutigen Test Aa. Der nicht verwandte Partner ist nicht untersucht und zeigt Z nicht. Aus einer ausdrücklich geeigneten zufälligen Bezugsgruppe von 1000 ebenfalls nicht betroffenen Erwachsenen sind 50 Aa und950 AA bekannt. Partnerauswahl und Allelweitergabe werden im Modell als unabhängig vorausgesetzt; Familiengeschichte des Partners liefert keine weitere Information.

**materialEn**

Synthetic fully penetrant autosomal-recessive model: aa shows trait Z; AA and Aa do not. No new mutations. An adult has an unambiguous model test result Aa. An unrelated partner is untested and unaffected. An explicitly suitable random reference sample of 1000 unaffected adults contains 50 Aa and950 AA. Partner selection and allele transmission are assumed independent in the model; partner family history adds no information.

**taskDe**

Erstelle Aa×Aa und Aa×AA und schätze das Z-Risiko eines Kindes aus Stammbaum-/Test- und Populationsinformation ab. Erkläre jede Wahrscheinlichkeit und weshalb „nicht betroffen“ beim Partner keine sichere AA-Zuordnung ist.

**taskEn**

Construct Aa×Aa and Aa×AA and estimate a child’s Z risk from pedigree/test and population information. Explain each probability and why an unaffected partner is not certainly AA.

**workedSolutionDe**

Aa×Aa liefert AA1/4,Aa1/2,aa1/4; Aa×AA liefert AA1/2,Aa1/2 und kein aa. Die bekannte Person trägt mit Wahrscheinlichkeit1 a; der Partner ist nach der passenden Referenz mit50/1000=1/20 Träger. Risiko aa=(1/20)×(1/4)=1/80=1,25%. Der Phänotyp schließt aa, aber nicht Aa aus. Dies ist eine Abschätzung unter den vorgegebenen Auswahl- und Erbannahmen.

**workedSolutionEn**

Aa×Aa gives AA1/4,Aa1/2,aa1/4; Aa×AA gives AA1/2,Aa1/2 and no aa. The confirmed person is a carrier with probability1; estimated partner carrier probability is50/1000=1/20. Risk aa=(1/20)×(1/4)=1/80=1.25%. Being unaffected excludes aa but not Aa. This is an estimate under supplied sampling and inheritance assumptions.

**freshTransferDe**

Ein neuer eindeutiger Partnerbefund lautet Aa. Das Paar hat bereits drei nicht betroffene Kinder. Bestimme das Modellrisiko für das nächste Kind und beurteile „jetzt muss ein betroffenes Kind kommen“.

**freshTransferEn**

A new unambiguous partner result is Aa. The couple already has three unaffected children. Determine modeled risk for the next child and evaluate “an affected child must now occur.”

**freshTransferSolutionDe**

Der individuelle Aa-Befund ersetzt die Populationsschätzung: nun Aa×Aa, also1/4=25% pro weiterer Geburt. Bei bekannten Genotypen und unabhängiger Allelweitergabe ändern die drei vorherigen Ausgänge diese Wahrscheinlichkeit nicht; es gibt keinen notwendigen Ausgleich. Die Daten behaupten keinen tatsächlichen Familienbefund.

**freshTransferSolutionEn**

Individual Aa evidence replaces the population estimate: now Aa×Aa, hence1/4=25% for each further birth. Given known genotypes and independent allele transmission, the three previous outcomes do not change this probability; no balancing outcome is required. No real family test result is claimed.

**limitsDe**

Keine klinische Beratung, keine Hardy-Weinberg-Annahme und keine Behauptung, jede reale Erbkrankheit sei vollständig penetrant; reale Testunsicherheit, Neumutationen und Verwandtschaft können die Voraussetzungen ändern.

**limitsEn**

No clinical counseling, no Hardy-Weinberg assumption and no claim that all real genetic conditions are fully penetrant; real test uncertainty, new mutations and relatedness can alter assumptions.

**Rubrik**

{"id": "risk-c1-r1", "expectationIds": ["e1"], "criterionDe": "Genotypwissen und Stammbauminferenz korrekt trennen.", "criterionEn": "Correctly distinguish genotype knowledge from pedigree inference."}

{"id": "risk-c1-r2", "expectationIds": ["e2"], "criterionDe": "Geeignete Bezugsgruppe, Trägerwahrscheinlichkeit und Kreuzungsrisiko korrekt verknüpfen.", "criterionEn": "Correctly combine suitable reference group, carrier probability and cross risk."}

{"id": "risk-c1-r3", "expectationIds": ["e3"], "criterionDe": "Neue Evidenz und Geburtenunabhängigkeit unter klaren Annahmen korrekt behandeln.", "criterionEn": "Correctly treat new evidence and birth independence under explicit assumptions."}

**Ganzes positives Profil**

{
  "archetype": "data",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Im gegebenen Erbmodell bestimmen Genotypen und ihre begründeten Wahrscheinlichkeiten die Risikoabschätzung; gesund bedeutet bei Rezessivität nicht automatisch kein Träger.",
      "essentialUnderstandingEn": "In the supplied inheritance model, genotypes and justified genotype probabilities determine risk; an unaffected individual is not automatically a noncarrier in recessive inheritance.",
      "observablePerformanceDe": "Die lernende Person interpretiert den gegebenen Stammbaum und trennt bestätigten Genotyp von aus Phänotypen abgeleiteter Unsicherheit.",
      "observablePerformanceEn": "The learner interprets the supplied pedigree and distinguishes confirmed genotype from phenotype-based uncertainty."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Eine geeignete Populationshäufigkeit kann ein unbekanntes Partnerrisiko ergänzen, ersetzt aber weder den Stammbaum noch gesicherte individuelle Befunde.",
      "essentialUnderstandingEn": "A suitable population frequency can inform unknown partner risk but replaces neither the pedigree nor confirmed individual evidence.",
      "observablePerformanceDe": "Die lernende Person verbindet die passende Trägerhäufigkeit mit der richtigen Mendel-Wahrscheinlichkeit und erklärt Annahmen und Herkunft der Daten.",
      "observablePerformanceEn": "The learner combines suitable carrier frequency with the correct Mendelian probability and explains assumptions and data origin."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Genotypinformation, Populationseignung oder Bedingungen verändern die zulässige Rechnung; bekannte Erbgänge machen Geburten nicht zu ausgleichenden Serien.",
      "essentialUnderstandingEn": "New genotype information, population suitability or conditions change the permissible calculation; known inheritance does not make births balancing sequences.",
      "observablePerformanceDe": "Die lernende Person begründet zwei unabhängige Abschätzungen und passt sie an frische Evidenz an, ohne Modellrisiko als individuelle Diagnose auszugeben.",
      "observablePerformanceEn": "The learner justifies two independent estimates and updates them using fresh evidence without presenting modeled risk as an individual diagnosis."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Bestätigter Genotyp gegenüber aus Stammbaum bedingter Unsicherheit",
      "textEn": "Confirmed genotype versus pedigree-conditional uncertainty"
    },
    {
      "id": "v2",
      "textDe": "Passende Zufallsreferenz, angereicherte Familiengruppe und neue individuelle Evidenz",
      "textEn": "Suitable random reference, enriched family group and new individual evidence"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "risk-c1",
      "taskDemandDe": "Erstelle Aa×Aa und Aa×AA und schätze das Z-Risiko eines Kindes aus Stammbaum-/Test- und Populationsinformation ab. Erkläre jede Wahrscheinlichkeit und weshalb „nicht betroffen“ beim Partner keine sichere AA-Zuordnung ist.",
      "taskDemandEn": "Construct Aa×Aa and Aa×AA and estimate a child’s Z risk from pedigree/test and population information. Explain each probability and why an unaffected partner is not certainly AA.",
      "expectedPerformanceDe": "Aa×Aa liefert AA1/4,Aa1/2,aa1/4; Aa×AA liefert AA1/2,Aa1/2 und kein aa. Die bekannte Person trägt mit Wahrscheinlichkeit1 a; der Partner ist nach der passenden Referenz mit50/1000=1/20 Träger. Risiko aa=(1/20)×(1/4)=1/80=1,25%. Der Phänotyp schließt aa, aber nicht Aa aus. Dies ist eine Abschätzung unter den vorgegebenen Auswahl- und Erbannahmen.",
      "expectedPerformanceEn": "Aa×Aa gives AA1/4,Aa1/2,aa1/4; Aa×AA gives AA1/2,Aa1/2 and no aa. The confirmed person is a carrier with probability1; estimated partner carrier probability is50/1000=1/20. Risk aa=(1/20)×(1/4)=1/80=1.25%. Being unaffected excludes aa but not Aa. This is an estimate under supplied sampling and inheritance assumptions.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "risk-c2",
      "taskDemandDe": "Leite die Trägerwahrscheinlichkeit des nicht betroffenen erwachsenen Kindes aus den verbleibenden Genotypfällen ab. Wähle die passende Partnerhäufigkeit und schätze das gemeinsame Kinderrisiko. Erkläre, warum weder 1/2 noch die Trägerquote aus N unkritisch übernommen werden darf.",
      "taskDemandEn": "Derive the unaffected adult child’s carrier probability from remaining genotype possibilities. Choose appropriate partner frequency and estimate their child’s risk. Explain why neither1/2 nor group N’s carrier frequency can be used uncritically.",
      "expectedPerformanceDe": "Aa×Aa hat vier gleich wahrscheinliche Allelkombinationen AA,Aa,aA,aa. Unter der bekannten Nichtbetroffenheit entfällt aa; von drei verbleibenden Fällen sind zwei Träger:2/3. Partnerquote aus M=90/900=1/10, nicht300/600 aus der angereicherten Gruppe N. Unter den unabhängigen Modellannahmen ergibt sich(2/3)×(1/10)×(1/4)=1/60≈1,67%.1/2 ist die unbedingte Aa-Wahrscheinlichkeit, nicht die bedingte Wahrscheinlichkeit nach Ausschluss von aa.",
      "expectedPerformanceEn": "Aa×Aa has four equally likely allele combinations AA,Aa,aA,aa. Known unaffected status excludes aa; two of three remaining cases are carriers:2/3. Suitable partner frequency M=90/900=1/10, not300/600 from enriched group N. Under independent model assumptions risk is(2/3)×(1/10)×(1/4)=1/60≈1.67%.1/2 is the unconditional Aa probability, not the conditional probability after excluding aa.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

### risk-c2 — Gesunder Angehöriger und passende Bezugsgruppe

**materialDe**

Dasselbe ausdrücklich fiktive autosomal-rezessive Modell mit vollständiger Penetranz und ohne Neumutationen. Zwei nicht betroffene Eltern haben ein aa-Kind; damit müssen beide Aa sein. Ein anderes erwachsenes Kind dieser Eltern zeigt Z nicht, sein Genotyp ist unbekannt. Sein nicht verwandter, ebenfalls nicht betroffener Partner hat keine informative Familiengeschichte. Geeignete Bezugsgruppe M:90 bestätigte Aa unter900 nicht betroffenen Erwachsenen. Eine andere, nicht passende Gruppe N besteht aus ausgewählten Angehörigen betroffener Familien und hat300 Aa unter600. Beide Stichproben sind vollständig ausgewertet; für den Partner ist nur M als zufällige passende Referenz vorausgesetzt.

**materialEn**

The same explicitly fictional fully penetrant autosomal-recessive model without new mutations. Two unaffected parents have an aa child, so both must be Aa. Another adult child is unaffected with unknown genotype. Their unrelated unaffected partner has no informative family history. Suitable group M contains90 confirmed Aa among900 unaffected adults. Different unsuitable group N consists of selected relatives of affected families with300 Aa among600. Both samples are completely evaluated; only M is assumed to be a random suitable reference for this partner.

**taskDe**

Leite die Trägerwahrscheinlichkeit des nicht betroffenen erwachsenen Kindes aus den verbleibenden Genotypfällen ab. Wähle die passende Partnerhäufigkeit und schätze das gemeinsame Kinderrisiko. Erkläre, warum weder 1/2 noch die Trägerquote aus N unkritisch übernommen werden darf.

**taskEn**

Derive the unaffected adult child’s carrier probability from remaining genotype possibilities. Choose appropriate partner frequency and estimate their child’s risk. Explain why neither1/2 nor group N’s carrier frequency can be used uncritically.

**workedSolutionDe**

Aa×Aa hat vier gleich wahrscheinliche Allelkombinationen AA,Aa,aA,aa. Unter der bekannten Nichtbetroffenheit entfällt aa; von drei verbleibenden Fällen sind zwei Träger:2/3. Partnerquote aus M=90/900=1/10, nicht300/600 aus der angereicherten Gruppe N. Unter den unabhängigen Modellannahmen ergibt sich(2/3)×(1/10)×(1/4)=1/60≈1,67%.1/2 ist die unbedingte Aa-Wahrscheinlichkeit, nicht die bedingte Wahrscheinlichkeit nach Ausschluss von aa.

**workedSolutionEn**

Aa×Aa has four equally likely allele combinations AA,Aa,aA,aa. Known unaffected status excludes aa; two of three remaining cases are carriers:2/3. Suitable partner frequency M=90/900=1/10, not300/600 from enriched group N. Under independent model assumptions risk is(2/3)×(1/10)×(1/4)=1/60≈1.67%.1/2 is the unconditional Aa probability, not the conditional probability after excluding aa.

**freshTransferDe**

Die erwachsene Person entscheidet sich später freiwillig für einen im Modell eindeutigen Test und erhält AA. Der Partner bleibt ungetestet. Rechne mit diesem neuen individuellen Befund und erkläre, warum die frühere Stammbaumwahrscheinlichkeit nicht weiter mitmultipliziert wird.

**freshTransferEn**

The adult later voluntarily chooses an unambiguous model test and receives AA. The partner remains untested. Recalculate from this new individual evidence and explain why the earlier pedigree probability is not still multiplied in.

**freshTransferSolutionDe**

Ein bestätigtes AA-Elternteil kann im Modell kein a weitergeben; auch mit Aa-Partner ist aa unmöglich. Das Modellrisiko beträgt0. Das neue eindeutige Genotypwissen ersetzt die frühere2/3-Trägerunsicherheit, statt zusätzlich als Faktor verwendet zu werden. Außerhalb der ausdrücklich ausgeschlossenen Testfehler/Neumutationen ist dies keine universelle medizinische Nullrisiko-Aussage.

**freshTransferSolutionEn**

A confirmed AA parent cannot transmit a in this model; even an Aa partner cannot produce aa. Modeled risk is0. New unambiguous genotype information replaces earlier2/3 carrier uncertainty instead of being multiplied as another factor. Outside explicitly excluded test errors/new mutations this is not a universal medical zero-risk claim.

**limitsDe**

Untersuchung von gegebenen Modelldaten, kein Aufruf zu realen Tests oder Offenlegung familiärer Daten; Genotypgewissheit und passende Populationsauswahl sind hier ausdrücklich geliefert.

**limitsEn**

Analysis of supplied model data, not a request for real testing or family-data disclosure; genotype certainty and suitable population selection are explicitly supplied.

**Rubrik**

{"id": "risk-c2-r1", "expectationIds": ["e1"], "criterionDe": "Genotypwissen und Stammbauminferenz korrekt trennen.", "criterionEn": "Correctly distinguish genotype knowledge from pedigree inference."}

{"id": "risk-c2-r2", "expectationIds": ["e2"], "criterionDe": "Geeignete Bezugsgruppe, Trägerwahrscheinlichkeit und Kreuzungsrisiko korrekt verknüpfen.", "criterionEn": "Correctly combine suitable reference group, carrier probability and cross risk."}

{"id": "risk-c2-r3", "expectationIds": ["e3"], "criterionDe": "Neue Evidenz und Geburtenunabhängigkeit unter klaren Annahmen korrekt behandeln.", "criterionEn": "Correctly treat new evidence and birth independence under explicit assumptions."}

**Ganzes positives Profil**

{
  "archetype": "data",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Im gegebenen Erbmodell bestimmen Genotypen und ihre begründeten Wahrscheinlichkeiten die Risikoabschätzung; gesund bedeutet bei Rezessivität nicht automatisch kein Träger.",
      "essentialUnderstandingEn": "In the supplied inheritance model, genotypes and justified genotype probabilities determine risk; an unaffected individual is not automatically a noncarrier in recessive inheritance.",
      "observablePerformanceDe": "Die lernende Person interpretiert den gegebenen Stammbaum und trennt bestätigten Genotyp von aus Phänotypen abgeleiteter Unsicherheit.",
      "observablePerformanceEn": "The learner interprets the supplied pedigree and distinguishes confirmed genotype from phenotype-based uncertainty."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Eine geeignete Populationshäufigkeit kann ein unbekanntes Partnerrisiko ergänzen, ersetzt aber weder den Stammbaum noch gesicherte individuelle Befunde.",
      "essentialUnderstandingEn": "A suitable population frequency can inform unknown partner risk but replaces neither the pedigree nor confirmed individual evidence.",
      "observablePerformanceDe": "Die lernende Person verbindet die passende Trägerhäufigkeit mit der richtigen Mendel-Wahrscheinlichkeit und erklärt Annahmen und Herkunft der Daten.",
      "observablePerformanceEn": "The learner combines suitable carrier frequency with the correct Mendelian probability and explains assumptions and data origin."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Genotypinformation, Populationseignung oder Bedingungen verändern die zulässige Rechnung; bekannte Erbgänge machen Geburten nicht zu ausgleichenden Serien.",
      "essentialUnderstandingEn": "New genotype information, population suitability or conditions change the permissible calculation; known inheritance does not make births balancing sequences.",
      "observablePerformanceDe": "Die lernende Person begründet zwei unabhängige Abschätzungen und passt sie an frische Evidenz an, ohne Modellrisiko als individuelle Diagnose auszugeben.",
      "observablePerformanceEn": "The learner justifies two independent estimates and updates them using fresh evidence without presenting modeled risk as an individual diagnosis."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Bestätigter Genotyp gegenüber aus Stammbaum bedingter Unsicherheit",
      "textEn": "Confirmed genotype versus pedigree-conditional uncertainty"
    },
    {
      "id": "v2",
      "textDe": "Passende Zufallsreferenz, angereicherte Familiengruppe und neue individuelle Evidenz",
      "textEn": "Suitable random reference, enriched family group and new individual evidence"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "risk-c1",
      "taskDemandDe": "Erstelle Aa×Aa und Aa×AA und schätze das Z-Risiko eines Kindes aus Stammbaum-/Test- und Populationsinformation ab. Erkläre jede Wahrscheinlichkeit und weshalb „nicht betroffen“ beim Partner keine sichere AA-Zuordnung ist.",
      "taskDemandEn": "Construct Aa×Aa and Aa×AA and estimate a child’s Z risk from pedigree/test and population information. Explain each probability and why an unaffected partner is not certainly AA.",
      "expectedPerformanceDe": "Aa×Aa liefert AA1/4,Aa1/2,aa1/4; Aa×AA liefert AA1/2,Aa1/2 und kein aa. Die bekannte Person trägt mit Wahrscheinlichkeit1 a; der Partner ist nach der passenden Referenz mit50/1000=1/20 Träger. Risiko aa=(1/20)×(1/4)=1/80=1,25%. Der Phänotyp schließt aa, aber nicht Aa aus. Dies ist eine Abschätzung unter den vorgegebenen Auswahl- und Erbannahmen.",
      "expectedPerformanceEn": "Aa×Aa gives AA1/4,Aa1/2,aa1/4; Aa×AA gives AA1/2,Aa1/2 and no aa. The confirmed person is a carrier with probability1; estimated partner carrier probability is50/1000=1/20. Risk aa=(1/20)×(1/4)=1/80=1.25%. Being unaffected excludes aa but not Aa. This is an estimate under supplied sampling and inheritance assumptions.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "risk-c2",
      "taskDemandDe": "Leite die Trägerwahrscheinlichkeit des nicht betroffenen erwachsenen Kindes aus den verbleibenden Genotypfällen ab. Wähle die passende Partnerhäufigkeit und schätze das gemeinsame Kinderrisiko. Erkläre, warum weder 1/2 noch die Trägerquote aus N unkritisch übernommen werden darf.",
      "taskDemandEn": "Derive the unaffected adult child’s carrier probability from remaining genotype possibilities. Choose appropriate partner frequency and estimate their child’s risk. Explain why neither1/2 nor group N’s carrier frequency can be used uncritically.",
      "expectedPerformanceDe": "Aa×Aa hat vier gleich wahrscheinliche Allelkombinationen AA,Aa,aA,aa. Unter der bekannten Nichtbetroffenheit entfällt aa; von drei verbleibenden Fällen sind zwei Träger:2/3. Partnerquote aus M=90/900=1/10, nicht300/600 aus der angereicherten Gruppe N. Unter den unabhängigen Modellannahmen ergibt sich(2/3)×(1/10)×(1/4)=1/60≈1,67%.1/2 ist die unbedingte Aa-Wahrscheinlichkeit, nicht die bedingte Wahrscheinlichkeit nach Ausschluss von aa.",
      "expectedPerformanceEn": "Aa×Aa has four equally likely allele combinations AA,Aa,aA,aa. Known unaffected status excludes aa; two of three remaining cases are carriers:2/3. Suitable partner frequency M=90/900=1/10, not300/600 from enriched group N. Under independent model assumptions risk is(2/3)×(1/10)×(1/4)=1/60≈1.67%.1/2 is the unconditional Aa probability, not the conditional probability after excluding aa.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

## 031fd4f3-906e-5919-ae7f-a2b0b9220604

### counsel-c1 — Bekannte Familienvariante und begrenzter Informationswunsch

**materialDe**

Fiktive erwachsene Person P,24 Jahre. Ein Elternteil trägt eine bestätigte autosomal-dominante Variante D/d; der andere ist d/d. Allelweitergabe ist1/2, der Stammbaum allein zeigt nicht, ob P die Variante trägt. Keine reale Erkrankung ist benannt. P möchte freiwillig genau diese Frage klären, aber keine Informationen über andere genetische Risiken; ein erwachsenes Geschwister möchte nichts erfahren. Methodenbeschreibung: M1 Stammbaum-/Anamnesegespräch liefert eine Wahrscheinlichkeitsabschätzung, keinen DNA-Befund. M2 gezielter Test der bekannten Variante beantwortet bei hier vorausgesetzter technischer Eindeutigkeit nur die D/d-Frage. M3 breite Sequenzuntersuchung kann weitere Varianten unklarer Bedeutung und zusätzliche Informationen erzeugen; sie garantiert keine klare klinische Zukunft. Konkreter Beginn/Schweregrad sind auch bei Variantenbefund nicht geliefert.

**materialEn**

Fictional adult P,24. One parent has a confirmed autosomal-dominant D/d variant, the other is d/d. Transmission probability is1/2; pedigree alone does not establish P’s genotype. No real condition is named. P voluntarily wants this particular question answered, not information about other genetic risks; an adult sibling wants no information. Methods: M1 pedigree/history counseling estimates probability without a DNA result. M2 targeted testing of the known variant answers only the D/d question under supplied technical certainty. M3 broad sequencing can yield variants of uncertain significance and additional information; it does not guarantee a clear clinical future. Onset/severity are not supplied even if a variant is found.

**taskDe**

Vergleiche M1–M3: Welche Frage beantwortet jede Methode, welchen Nutzen und welche Nachteile hat sie hier? Formuliere eine begründete, freiwillige Vorgehensentscheidung für P und den Umgang mit dem Geschwister. Benenne ausdrücklich, was die Entscheidung oder ein positiver Befund nicht festlegt.

**taskEn**

Compare M1–M3: what question does each answer, and what benefits and drawbacks does it have here? Formulate a justified voluntary plan for P and handling the sibling’s preference. Explicitly state what the decision or a positive result does not determine.

**workedSolutionDe**

M1 ermöglicht Verständnis der 1/2-Vererbung, Wünscheklärung und Grenzenbesprechung, entscheidet aber nicht zwischen D/d und d/d. Bei bestätigtem freiwilligem Informationswunsch ist M2 nach Aufklärung und klarem Ergebnisumfang eine gut begründete begrenzte Option; es kann auch bei M1 geblieben oder ein Test aufgeschoben werden. M3 beantwortet hier mehr als gewünscht, mit Zusatz-/Unklarheitsbelastung ohne gelieferten Zusatznutzen. Das Geschwister wird nicht automatisch informiert oder mitgetestet; dessen eigener Informationswunsch und der Schutz familiärer Angaben werden berücksichtigt. Weder Testwahl noch Variantenbefund bestimmen allein Lebensentscheidungen, Beginn oder Schweregrad. Andere fachlich und ethisch gut begründete Entscheidungen werden akzeptiert.

**workedSolutionEn**

M1 enables understanding of 1/2 transmission, clarification of preferences and discussion of limits, but does not distinguish D/d from d/d. With confirmed voluntary desire for information, M2 after explanation and a clear result scope is a defensible bounded option; staying with M1 or postponing testing can also be justified. M3 supplies more than requested, with incidental/uncertain-result burden and no supplied added benefit. The sibling is not automatically informed or tested; their own information preference and protection of family information matter. Neither choosing a test nor finding a variant alone determines life choices, onset or severity. Other scientifically and ethically well-justified decisions are accepted.

**freshTransferDe**

Vor einer Untersuchung ändert P den Wunsch: „Ich möchte vorerst nur die Wahrscheinlichkeiten verstehen und keinen persönlichen Variantenbefund.“ Begründe die neue Methodenwahl. Muss die vorherige freiwillige Entscheidung als bindend beibehalten werden?

**freshTransferEn**

Before any investigation P changes preference: “For now I only want to understand probabilities, not receive my personal variant result.” Justify the updated method choice. Must the earlier voluntary decision remain binding?

**freshTransferSolutionDe**

M1 beziehungsweise Aufschub ist nun passend; M2/M3 nicht gegen den aktuellen Wunsch durchführen. Geänderte informierte Wünsche verändern die vertretbare Entscheidung. Die 1/2-Stammbaumabschätzung bleibt unsicher über P, und Nichtwissen darf nicht als fehlendes Verständnis abgewertet werden. Keine konkrete Rechts- oder Behandlungsregel wird aus dem Unterrichtsfall abgeleitet.

**freshTransferSolutionEn**

M1 or postponement now fits; M2/M3 should not be imposed against the current preference. Changed informed preferences change the defensible decision. The 1/2 pedigree estimate remains uncertain for P, and not wanting a result is not lack of understanding. No specific legal or treatment rule is derived from this classroom case.

**limitsDe**

Fiktive ethische Methodenbewertung, kein tatsächlich durchgeführter Test und keine individuelle medizinische Empfehlung; konkrete Gesetze, Testverfahren und Klinikprognosen sind nicht Bestandteil der Angaben.

**limitsEn**

Fictional ethical comparison of methods, no performed test or individual medical recommendation; specific laws, assays and clinical prognoses are not supplied.

**Rubrik**

{"id": "counsel-c1-r1", "expectationIds": ["e1"], "criterionDe": "Methoden ziel- und datenbezogen vergleichen, Befund nicht mit sicherer klinischer Zukunft verwechseln.", "criterionEn": "Compare methods against question and data; do not confuse a result with a certain clinical future."}

{"id": "counsel-c1-r2", "expectationIds": ["e2"], "criterionDe": "Nutzen/Belastung, Freiwilligkeit und Informationsgrenzen konkret abwägen; andere begründete Entscheidungen zulassen.", "criterionEn": "Weigh usefulness/burden, voluntary choice and information boundaries concretely; allow other justified decisions."}

{"id": "counsel-c1-r3", "expectationIds": ["e3"], "criterionDe": "Geänderte Grundlage neu prüfen; keine diagnostische Aussage aus einer unsicheren Variante.", "criterionEn": "Reevaluate changed conditions; do not diagnose from an uncertain variant."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Stammbaumanalyse, gezielte Untersuchung einer bekannten familiären Variante und breite Sequenzuntersuchung beantworten unterschiedliche Fragen und haben unterschiedliche Grenzen.",
      "essentialUnderstandingEn": "Pedigree analysis, targeted testing of a known familial variant and broad sequencing address different questions and have different limitations.",
      "observablePerformanceDe": "Die lernende Person vergleicht Methoden anhand der gegebenen Erb- und Datenlage und trennt Risikoschätzung, Variantenbefund und klinische Vorhersage.",
      "observablePerformanceEn": "The learner compares methods using supplied inheritance and data conditions and distinguishes risk estimates, variant results and clinical predictions."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Eine begründete Beratungsentscheidung verbindet Zuverlässigkeit und Nutzen mit freiwilliger informierter Wahl, Nichtwissen und dem Schutz anderer Familienmitglieder.",
      "essentialUnderstandingEn": "A justified counseling decision connects reliability and usefulness with voluntary informed choice, not knowing and protection of other family members.",
      "observablePerformanceDe": "Die lernende Person wägt Vorteile und Nachteile konkret ab, berücksichtigt vorgegebene Wünsche und begründet eine vertretbare Entscheidung statt einen Test oder eine Lebensentscheidung aufzuzwingen.",
      "observablePerformanceEn": "The learner weighs concrete advantages and disadvantages, considers supplied preferences and justifies a defensible decision rather than imposing a test or life choice."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Ergebnisunsicherheit, veränderte Informationswünsche oder eine andere genetische Grundlage können die vertretbare Methodenwahl verändern.",
      "essentialUnderstandingEn": "New result uncertainty, changed information preferences or a different genetic basis can change defensible method choices.",
      "observablePerformanceDe": "Die lernende Person begründet zwei unterschiedliche Entscheidungssituationen und eine neue Bedingung mit fachlichen und ethischen Argumenten; mehrere sachgerecht begründete Wege sind möglich.",
      "observablePerformanceEn": "The learner justifies two different decisions and a fresh condition using scientific and ethical arguments; more than one appropriately justified path is possible."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Bekannte monogene Familienvariante gegenüber multifaktorieller Unsicherheit",
      "textEn": "Known monogenic familial variant versus multifactorial uncertainty"
    },
    {
      "id": "v2",
      "textDe": "Geänderte Informationswünsche und neue Variantenunsicherheit",
      "textEn": "Changed information preferences and new variant uncertainty"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "counsel-c1",
      "taskDemandDe": "Vergleiche M1–M3: Welche Frage beantwortet jede Methode, welchen Nutzen und welche Nachteile hat sie hier? Formuliere eine begründete, freiwillige Vorgehensentscheidung für P und den Umgang mit dem Geschwister. Benenne ausdrücklich, was die Entscheidung oder ein positiver Befund nicht festlegt.",
      "taskDemandEn": "Compare M1–M3: what question does each answer, and what benefits and drawbacks does it have here? Formulate a justified voluntary plan for P and handling the sibling’s preference. Explicitly state what the decision or a positive result does not determine.",
      "expectedPerformanceDe": "M1 ermöglicht Verständnis der 1/2-Vererbung, Wünscheklärung und Grenzenbesprechung, entscheidet aber nicht zwischen D/d und d/d. Bei bestätigtem freiwilligem Informationswunsch ist M2 nach Aufklärung und klarem Ergebnisumfang eine gut begründete begrenzte Option; es kann auch bei M1 geblieben oder ein Test aufgeschoben werden. M3 beantwortet hier mehr als gewünscht, mit Zusatz-/Unklarheitsbelastung ohne gelieferten Zusatznutzen. Das Geschwister wird nicht automatisch informiert oder mitgetestet; dessen eigener Informationswunsch und der Schutz familiärer Angaben werden berücksichtigt. Weder Testwahl noch Variantenbefund bestimmen allein Lebensentscheidungen, Beginn oder Schweregrad. Andere fachlich und ethisch gut begründete Entscheidungen werden akzeptiert.",
      "expectedPerformanceEn": "M1 enables understanding of 1/2 transmission, clarification of preferences and discussion of limits, but does not distinguish D/d from d/d. With confirmed voluntary desire for information, M2 after explanation and a clear result scope is a defensible bounded option; staying with M1 or postponing testing can also be justified. M3 supplies more than requested, with incidental/uncertain-result burden and no supplied added benefit. The sibling is not automatically informed or tested; their own information preference and protection of family information matter. Neither choosing a test nor finding a variant alone determines life choices, onset or severity. Other scientifically and ethically well-justified decisions are accepted.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "counsel-c2",
      "taskDemandDe": "Vergleiche die hier sinnvollen und nicht begründeten Methoden, absolutes gegenüber relativem beobachtetem Risiko, mögliche Vorteile/Belastungen und Informationswünsche. Begründe eine Vorgehensentscheidung, die sich fachlich von der bekannten monogenen Variante im ersten Fall unterscheidet.",
      "taskDemandEn": "Compare useful and unsupported methods here, absolute versus relative observed risk, possible benefits/burdens and information preferences. Justify a plan that scientifically differs from the known monogenic variant in the first case.",
      "expectedPerformanceDe": "4% gegenüber 2% entspricht einem beobachteten Verhältnis 2 und einem Unterschied 2 Prozentpunkte, nicht einer sicheren Erkrankung oder individueller 4%-Vorhersage für Q. Mehrere genetische/Umweltbeiträge und fehlende Referenzpassung machen eine monogene 1/2- oder 1/4-Regel unpassend. M1 kann zuerst die Frage, Familien-/Umweltinformation und freiwilligen Umfang klären. M2 ist ohne identifizierte passende Variante nicht begründet. M3 verlangt nachvollziehbare Aussagekraft, Grenzen- und Ergebnisumfangsklärung; mögliche Zusatz-/Unklarheitsbelastung muss gegen gelieferten Nutzen abgewogen werden. Aufschub/Verzicht oder eine weiterführende freiwillige Fachklärung sind begründbare Wege; familiäre Information wird nicht automatisch geteilt. Keine richtige Lebensentscheidung wird vorgegeben.",
      "expectedPerformanceEn": "4% versus 2% gives an observed ratio 2 and difference 2 percentage points, not certain disease or a personal 4% prediction for Q. Multiple genetic/environmental contributions and unproven reference applicability make a monogenic 1/2 or 1/4 rule inappropriate. M1 can first clarify the question, family/environment information and voluntary information scope. M2 is unsupported without an identified relevant variant. M3 requires understandable evidence of usefulness and clarification of limits/result scope; possible incidental/uncertain-result burdens must be weighed against supplied benefits. Postponement, declining, or further voluntary specialist clarification can be justified; family information is not automatically shared. No single correct life decision is imposed.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

### counsel-c2 — Multifaktorielles Familienrisiko und unklare Varianten

**materialDe**

Fiktive erwachsene Person Q hat zwei Verwandte mit einem ausdrücklich multifaktoriellen Endpunkt Z, ohne bekannte einzelne familiäre krankheitsverursachende Variante. Ein prospektives synthetisches Referenzkollektiv liefert im gleichen Zeitraum beobachtete Häufigkeiten 2% ohne eine SNP-Markergruppe und 4% mit ihr; Passung zu Qs Population und Umweltsituation ist nicht nachgewiesen. Q möchte Nutzen und Unsicherheit verstehen und keine unerwarteten Informationen an Verwandte weitergeben. Methoden: M1 freiwilliges Familien-/Umweltgespräch ordnet Gemeinsamkeiten ein, bestimmt keine persönliche DNA. M2 gezielter Test einer bekannten monogenen Familienvariante würde diese klären, aber eine solche Variante ist hier unbekannt. M3 breiteres genetisches Panel könnte Marker oder Varianten unklarer Bedeutung finden; daraus folgen weder eine sichere Z-Diagnose noch eine im Fall gelieferte Behandlung.

**materialEn**

Fictional adult Q has two relatives with explicitly multifactorial endpoint Z, with no known single familial disease-causing variant. A prospective synthetic reference cohort has observed frequencies 2% without a SNP marker group and 4% with it over the same interval; applicability to Q’s population/environment is unproven. Q wants to understand usefulness and uncertainty without giving unexpected information to relatives. Methods: M1 voluntary family/environment counseling assesses shared conditions without determining personal DNA. M2 targeted testing of a known monogenic familial variant would address that variant, but none is known here. M3 a broader genetic panel might identify markers or variants of uncertain significance; these do not establish certain Z disease or a treatment supplied in this case.

**taskDe**

Vergleiche die hier sinnvollen und nicht begründeten Methoden, absolutes gegenüber relativem beobachtetem Risiko, mögliche Vorteile/Belastungen und Informationswünsche. Begründe eine Vorgehensentscheidung, die sich fachlich von der bekannten monogenen Variante im ersten Fall unterscheidet.

**taskEn**

Compare useful and unsupported methods here, absolute versus relative observed risk, possible benefits/burdens and information preferences. Justify a plan that scientifically differs from the known monogenic variant in the first case.

**workedSolutionDe**

4% gegenüber 2% entspricht einem beobachteten Verhältnis 2 und einem Unterschied 2 Prozentpunkte, nicht einer sicheren Erkrankung oder individueller 4%-Vorhersage für Q. Mehrere genetische/Umweltbeiträge und fehlende Referenzpassung machen eine monogene 1/2- oder 1/4-Regel unpassend. M1 kann zuerst die Frage, Familien-/Umweltinformation und freiwilligen Umfang klären. M2 ist ohne identifizierte passende Variante nicht begründet. M3 verlangt nachvollziehbare Aussagekraft, Grenzen- und Ergebnisumfangsklärung; mögliche Zusatz-/Unklarheitsbelastung muss gegen gelieferten Nutzen abgewogen werden. Aufschub/Verzicht oder eine weiterführende freiwillige Fachklärung sind begründbare Wege; familiäre Information wird nicht automatisch geteilt. Keine richtige Lebensentscheidung wird vorgegeben.

**workedSolutionEn**

4% versus 2% gives an observed ratio 2 and difference 2 percentage points, not certain disease or a personal 4% prediction for Q. Multiple genetic/environmental contributions and unproven reference applicability make a monogenic 1/2 or 1/4 rule inappropriate. M1 can first clarify the question, family/environment information and voluntary information scope. M2 is unsupported without an identified relevant variant. M3 requires understandable evidence of usefulness and clarification of limits/result scope; possible incidental/uncertain-result burdens must be weighed against supplied benefits. Postponement, declining, or further voluntary specialist clarification can be justified; family information is not automatically shared. No single correct life decision is imposed.

**freshTransferDe**

Ein später im fiktiven Szenario freiwillig angefordertes Panel meldet „Variante unklarer Bedeutung“, ohne neue Funktions- oder klinische Evidenz. Ein Verwandter verlangt sofortige Bekanntgabe und bezeichnet sie als sichere Z-Ursache. Formuliere eine begründete Antwort und die offene nächste fachliche Frage.

**freshTransferEn**

A later voluntarily requested fictional panel reports a “variant of uncertain significance,” without new functional or clinical evidence. A relative demands immediate disclosure and calls it a certain Z cause. Give a justified response and the next unresolved scientific question.

**freshTransferSolutionDe**

Eine unklare Variante ist keine bestätigte Ursache oder Diagnose; ihre Bedeutung muss wissenschaftlich geklärt werden, ohne ihre Unsicherheit zu verschweigen. Es besteht kein sachlicher Anlass, alle Verwandten als betroffen zu erklären oder ihnen ungefragt Ergebnisse zu übermitteln. Mit Q wird der vereinbarte Informationsumfang besprochen; die offene Frage ist die belastbare funktionelle/klinische Bedeutung und deren Passung zur Fragestellung. Die angebotenen Häufigkeiten oder der Wunsch des Verwandten liefern diese Evidenz nicht.

**freshTransferSolutionEn**

An uncertain variant is not a confirmed cause or diagnosis; significance needs scientific clarification without concealing uncertainty. There is no scientific basis for labeling all relatives affected or sending unsolicited results. The agreed information scope is discussed with Q; the open question is reliable functional/clinical significance and relevance to the question. Supplied frequencies or a relative’s demand do not provide this evidence.

**limitsDe**

Kein reales Panel, keine Behandlungsempfehlung, keine gesetzliche Offenlegungsaussage; Referenzhäufigkeiten sind synthetisch, und individuelle Kalibrierung wird ausdrücklich nicht behauptet.

**limitsEn**

No real panel, treatment recommendation or statutory disclosure claim; reference frequencies are synthetic and individual calibration is explicitly not claimed.

**Rubrik**

{"id": "counsel-c2-r1", "expectationIds": ["e1"], "criterionDe": "Methoden ziel- und datenbezogen vergleichen, Befund nicht mit sicherer klinischer Zukunft verwechseln.", "criterionEn": "Compare methods against question and data; do not confuse a result with a certain clinical future."}

{"id": "counsel-c2-r2", "expectationIds": ["e2"], "criterionDe": "Nutzen/Belastung, Freiwilligkeit und Informationsgrenzen konkret abwägen; andere begründete Entscheidungen zulassen.", "criterionEn": "Weigh usefulness/burden, voluntary choice and information boundaries concretely; allow other justified decisions."}

{"id": "counsel-c2-r3", "expectationIds": ["e3"], "criterionDe": "Geänderte Grundlage neu prüfen; keine diagnostische Aussage aus einer unsicheren Variante.", "criterionEn": "Reevaluate changed conditions; do not diagnose from an uncertain variant."}

**Ganzes positives Profil**

{
  "archetype": "modeling",
  "expectations": [
    {
      "id": "e1",
      "essentialUnderstandingDe": "Stammbaumanalyse, gezielte Untersuchung einer bekannten familiären Variante und breite Sequenzuntersuchung beantworten unterschiedliche Fragen und haben unterschiedliche Grenzen.",
      "essentialUnderstandingEn": "Pedigree analysis, targeted testing of a known familial variant and broad sequencing address different questions and have different limitations.",
      "observablePerformanceDe": "Die lernende Person vergleicht Methoden anhand der gegebenen Erb- und Datenlage und trennt Risikoschätzung, Variantenbefund und klinische Vorhersage.",
      "observablePerformanceEn": "The learner compares methods using supplied inheritance and data conditions and distinguishes risk estimates, variant results and clinical predictions."
    },
    {
      "id": "e2",
      "essentialUnderstandingDe": "Eine begründete Beratungsentscheidung verbindet Zuverlässigkeit und Nutzen mit freiwilliger informierter Wahl, Nichtwissen und dem Schutz anderer Familienmitglieder.",
      "essentialUnderstandingEn": "A justified counseling decision connects reliability and usefulness with voluntary informed choice, not knowing and protection of other family members.",
      "observablePerformanceDe": "Die lernende Person wägt Vorteile und Nachteile konkret ab, berücksichtigt vorgegebene Wünsche und begründet eine vertretbare Entscheidung statt einen Test oder eine Lebensentscheidung aufzuzwingen.",
      "observablePerformanceEn": "The learner weighs concrete advantages and disadvantages, considers supplied preferences and justifies a defensible decision rather than imposing a test or life choice."
    },
    {
      "id": "e3",
      "essentialUnderstandingDe": "Neue Ergebnisunsicherheit, veränderte Informationswünsche oder eine andere genetische Grundlage können die vertretbare Methodenwahl verändern.",
      "essentialUnderstandingEn": "New result uncertainty, changed information preferences or a different genetic basis can change defensible method choices.",
      "observablePerformanceDe": "Die lernende Person begründet zwei unterschiedliche Entscheidungssituationen und eine neue Bedingung mit fachlichen und ethischen Argumenten; mehrere sachgerecht begründete Wege sind möglich.",
      "observablePerformanceEn": "The learner justifies two different decisions and a fresh condition using scientific and ethical arguments; more than one appropriately justified path is possible."
    }
  ],
  "coverageExpectations": {
    "requiredExpectationIds": [
      "e1",
      "e2",
      "e3"
    ],
    "alternativeExpectationGroups": [],
    "minimumIndependentDemonstrations": 2,
    "freshVariationRequired": true,
    "independentTransferRequired": true
  },
  "variationAxes": [
    {
      "id": "v1",
      "textDe": "Bekannte monogene Familienvariante gegenüber multifaktorieller Unsicherheit",
      "textEn": "Known monogenic familial variant versus multifactorial uncertainty"
    },
    {
      "id": "v2",
      "textDe": "Geänderte Informationswünsche und neue Variantenunsicherheit",
      "textEn": "Changed information preferences and new variant uncertainty"
    }
  ],
  "applicationCaseBriefs": [
    {
      "id": "counsel-c1",
      "taskDemandDe": "Vergleiche M1–M3: Welche Frage beantwortet jede Methode, welchen Nutzen und welche Nachteile hat sie hier? Formuliere eine begründete, freiwillige Vorgehensentscheidung für P und den Umgang mit dem Geschwister. Benenne ausdrücklich, was die Entscheidung oder ein positiver Befund nicht festlegt.",
      "taskDemandEn": "Compare M1–M3: what question does each answer, and what benefits and drawbacks does it have here? Formulate a justified voluntary plan for P and handling the sibling’s preference. Explicitly state what the decision or a positive result does not determine.",
      "expectedPerformanceDe": "M1 ermöglicht Verständnis der 1/2-Vererbung, Wünscheklärung und Grenzenbesprechung, entscheidet aber nicht zwischen D/d und d/d. Bei bestätigtem freiwilligem Informationswunsch ist M2 nach Aufklärung und klarem Ergebnisumfang eine gut begründete begrenzte Option; es kann auch bei M1 geblieben oder ein Test aufgeschoben werden. M3 beantwortet hier mehr als gewünscht, mit Zusatz-/Unklarheitsbelastung ohne gelieferten Zusatznutzen. Das Geschwister wird nicht automatisch informiert oder mitgetestet; dessen eigener Informationswunsch und der Schutz familiärer Angaben werden berücksichtigt. Weder Testwahl noch Variantenbefund bestimmen allein Lebensentscheidungen, Beginn oder Schweregrad. Andere fachlich und ethisch gut begründete Entscheidungen werden akzeptiert.",
      "expectedPerformanceEn": "M1 enables understanding of 1/2 transmission, clarification of preferences and discussion of limits, but does not distinguish D/d from d/d. With confirmed voluntary desire for information, M2 after explanation and a clear result scope is a defensible bounded option; staying with M1 or postponing testing can also be justified. M3 supplies more than requested, with incidental/uncertain-result burden and no supplied added benefit. The sibling is not automatically informed or tested; their own information preference and protection of family information matter. Neither choosing a test nor finding a variant alone determines life choices, onset or severity. Other scientifically and ethically well-justified decisions are accepted.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    },
    {
      "id": "counsel-c2",
      "taskDemandDe": "Vergleiche die hier sinnvollen und nicht begründeten Methoden, absolutes gegenüber relativem beobachtetem Risiko, mögliche Vorteile/Belastungen und Informationswünsche. Begründe eine Vorgehensentscheidung, die sich fachlich von der bekannten monogenen Variante im ersten Fall unterscheidet.",
      "taskDemandEn": "Compare useful and unsupported methods here, absolute versus relative observed risk, possible benefits/burdens and information preferences. Justify a plan that scientifically differs from the known monogenic variant in the first case.",
      "expectedPerformanceDe": "4% gegenüber 2% entspricht einem beobachteten Verhältnis 2 und einem Unterschied 2 Prozentpunkte, nicht einer sicheren Erkrankung oder individueller 4%-Vorhersage für Q. Mehrere genetische/Umweltbeiträge und fehlende Referenzpassung machen eine monogene 1/2- oder 1/4-Regel unpassend. M1 kann zuerst die Frage, Familien-/Umweltinformation und freiwilligen Umfang klären. M2 ist ohne identifizierte passende Variante nicht begründet. M3 verlangt nachvollziehbare Aussagekraft, Grenzen- und Ergebnisumfangsklärung; mögliche Zusatz-/Unklarheitsbelastung muss gegen gelieferten Nutzen abgewogen werden. Aufschub/Verzicht oder eine weiterführende freiwillige Fachklärung sind begründbare Wege; familiäre Information wird nicht automatisch geteilt. Keine richtige Lebensentscheidung wird vorgegeben.",
      "expectedPerformanceEn": "4% versus 2% gives an observed ratio 2 and difference 2 percentage points, not certain disease or a personal 4% prediction for Q. Multiple genetic/environmental contributions and unproven reference applicability make a monogenic 1/2 or 1/4 rule inappropriate. M1 can first clarify the question, family/environment information and voluntary information scope. M2 is unsupported without an identified relevant variant. M3 requires understandable evidence of usefulness and clarification of limits/result scope; possible incidental/uncertain-result burdens must be weighed against supplied benefits. Postponement, declining, or further voluntary specialist clarification can be justified; family information is not automatically shared. No single correct life decision is imposed.",
      "understandingFocusDe": "Eigenständig die angegebenen Daten und Modellannahmen verbinden; die frische Veränderung neu begründen und Grenzen benennen.",
      "understandingFocusEn": "Independently connect the supplied data and model assumptions, justify the fresh change and identify limitations."
    }
  ]
}

