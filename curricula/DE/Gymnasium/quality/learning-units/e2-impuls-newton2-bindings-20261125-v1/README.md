# Physik E.2 · Impuls und Newtons zweites Axiom

Der Katalogentwurf `84b220d0e5` trennt drei Leistungen. Lernende addieren die vorzeichenbehafteten Impulse zweier Körper auf einer Geraden, berechnen eine mittlere Kraft aus zwei Impulswerten oder lesen die momentane Kraft an der Tangente eines Impuls-Zeit-Diagramms ab. Das engere Newton-Ziel gilt für konstante Masse im Inertialsystem.

**Fachliche Voraussetzung.** Für den Gesamtimpuls sind die Massen und Geschwindigkeiten gegeben. Die neue Voraussetzung führt deshalb direkt zum vorhandenen Physik-Motivationsanker und zu den zwei benötigten Rechengrundlagen. Der Katalogentwurf verlangte die experimentelle Bestimmung einer gleichförmigen Geschwindigkeit. `validate:graph` prüfte die direkte Anbindung über 548 Skill-Landschaften. Die Minimalitätsprüfung umfasste für Physik mitsamt ihren Abhängigkeiten 1.148 Ziele und 1.660 verfasste Kanten und meldete keine redundante Kante.

## Quellenziel und Vorbereitung nach Land

IMP bezeichnet hier den Gesamtimpuls zweier Körper, RATE-M die mittlere Kraft und RATE-I die momentane Kraft. Die tatsächlichen Lernmengen umfassen auch notwendige Vorbereitung. Alle 90 Physiksichten wurden mit der produktiven Projektion der Lernkarte geprüft. Die [Ländertabelle mit Quellenstellen, Schulformen, Kursen, Vorgängerorten und Vorziehungen](views/README.md) belegt die einzelnen Entscheidungen.

| Gebiet | Neu als reguläres Ziel sichtbar |
|---|---|
| Baden-Württemberg | IMP, RATE-M |
| Bayern | IMP |
| Berlin | Keine allgemeine Zielaufnahme |
| Brandenburg | Keine allgemeine Zielaufnahme |
| Bremen | IMP |
| Hamburg | IMP |
| Hessen | IMP |
| Mecklenburg-Vorpommern | IMP |
| Niedersachsen | Keine |
| Nordrhein-Westfalen | IMP |
| Rheinland-Pfalz | IMP |
| Saarland | IMP |
| Sachsen | IMP, RATE-M, RATE-I, jeweils LK |
| Sachsen-Anhalt | IMP im LK/eAN |
| Schleswig-Holstein | IMP |
| Thüringen | IMP |
| National | Keine amtliche Zielaufnahme |

Der bayerische Erhaltungssatz ist Ph10.2 zugeordnet. Der bestehende Kraftstoß aus Ph8.3 benötigt diesen Satz und zieht dadurch auch die Vorbereitung IMP in Jahrgang 8. Die Entscheidung über eine freiwillige Vertiefung für den Kraftstoß bleibt offen. In Berlin und Brandenburg belegen die amtlichen Seiten die Wahlpflicht für bestimmte Schulformen. Ein entsprechender Auswahlschalter fehlt in den gewöhnlichen Gymnasialsichten.

## Bilder, Lernkarten und Datenquellen

Die Bilder zum Gesamtimpuls, zur mittleren Kraft und zu Newton stammen aus der ChatGPT/Codex-Bilderzeugung. Ein genauer Plot macht die Tangentensteigung bei 2 s in der vierten Abbildung ablesbar. Der [Bildreview 096](../../goal-visualization-review/physik-batch-096.md) bindet die vier JPEGs, die Aufträge, die Prüfung der Vorzeichen und die Mobilansicht. Die Anzahl der Zielbilder steigt um drei, da Newton bereits ein Bild hatte.

Das zweisprachige Mechanikdeck umfasst jetzt 90 Karten. [Karteninhalt und Herkunft](memory/card-author-review.actual.json) sowie [Prüfungen der Kartenbindungen](memory/validation.actual.json) halten den Umfang für jede Sprache fest. Die [Quellenbelege](quality/official-source-support.actual.json) nennen die physischen PDF-Seiten. Die [strengen aktuellen Bindungen](quality/strict-current-bindings.actual.json) weisen die tatsächlich geprüften Werte je Ziel aus.

## Abschlussrouten und Unterrichtsreihenfolge

In BW bleibt für RATE-M und in HH und TH für IMP jeweils der Abschlussweg in den beiden jahrgangsübergreifenden Sichten und in der reinen Sek-I-Sicht offen. Die [Diagnose des Abschlusswegs](inventory/current-native-route-diagnostic.actual.json) enthält die betroffenen Scopes und die untersuchten vorhandenen Aufgaben. Zwei kurze, für Sek I geeignete Aufgaben könnten diese Lücken schließen. Dafür ist ein eigener Aufgaben- und Bewertungsreview erforderlich.

Die sächsische LK-Herleitung liegt jetzt in Klasse 11 nach der Differentialform. In Sachsen-Anhalt wechselt sie aus Klasse 10 nach Q 11/12. Das geteilte Mathematik-Zeitband lässt den genauen Unterrichtstermin offen. Für beide Länder prüft [der Backend-Test](../../../../../../backend/src/test/java/com/skillpilot/backend/service/MomentumDerivationFrontierTest.java) die Freigabe durch die tatsächliche Lernsteuerung in drei aufeinanderfolgenden Zuständen. Erst die mathematische Tangentensteigung gibt die Momentankraft frei, dann die Momentankraft die Herleitung.

Die erneuerte [Bindung der Prüfungsgrundlagen](inventory/current-stage-preparation.successor.actual.json) prüft alle 216 zuvor gebundenen Zieldefinitionen. Drei Definitionen haben neue Werte und drei Ziele kommen in der Vorbereitung bereits abgelehnter Angebote hinzu. Bei beiden angenommenen Angeboten bleiben die vollständigen 66 beziehungsweise 69 Voraussetzungen identisch. Die sechs früher abgelehnten Alternativen, deren Vorbereitung zunimmt, erhalten dadurch keine Abschlussrolle.

Der [Atlasnachweis](inventory/national-atlas-inventory-delta.actual.json) und die [Gegenprüfung der 1.036 Mathematik-Zuordnungen](views/foreign-math-recheck.actual.json) dokumentieren die abgeleiteten Bestandsänderungen.


## Geparkte Fachentscheidung

Zwei unabhängige Erstprüfungen verlangen beim bestehenden Ziel zur Impulserhaltung eine Präzisierung des Wortlauts. In einem Inertialsystem sind bei verschwindendem resultierendem äußeren Kraftstoß über das betrachtete Intervall die Gesamtimpulse des materiell abgeschlossenen Systems an dessen Endpunkten gleich. Auch wenn die Endwerte übereinstimmen, kann der Gesamtimpuls dazwischen variieren. Zur zusätzlichen Voraussetzung „Grundgleichung der Mechanik anwenden“ liegen unterschiedliche Urteile vor. Beide Fragen gehen mit den Einzelvoten in die Übernahmeprüfung.


## Reproduzierbarer Prüfstand

Die vier aktuellen Prüfungen für Verständnisprofile, Atomarität, Karten und Bilder umfassen je 493 von 493 fachlichen Einzelzielen. Beim Zieltext sind 492 von 493 bestätigt. Alle sechs technischen Validierungen der Qualitätsnachweise bestehen. Der einzige offene Text ist die Impulserhaltung. Die digestgebundene Rücknahme des alten Urteils erhält den historischen Eintrag und die gültigen Urteile seiner fünf Nachbarziele. [Prüfung der Rücknahme](quality/withdrawal-guard-checks.actual.json)

Die beiden Review-Bücher lassen sich aus den gebundenen Modellen samt ursprünglichem PDF-Zeitstempel bytegenau wiederherstellen. Die [Reproduktionsanleitung](quality/RENDER-RECOVERY.md) und das [lokale Prüfprogramm](quality/reproduce-review-artifacts.mts) ermöglichen den Vergleich mit den vier ursprünglichen SHA-256-Werten. Die gerenderten Originale liegen im Übergabearchiv.

Der Gesamtstatus ist M3, Sek I M2 und Sek II M4. Die Sek-I-Abschlusswege und die offene Beschreibung stehen in der [Statusmessung](curriculum-status.actual.json). Der Physik-Pin verlangt weiterhin M7. Die [Zählungs- und Regressionstests](checks/count-repairs.actual.json), [lokalen Einzelprüfungen](checks/local-author-checks.actual.json) und [Änderungen der Lernkarte](views/backflows.actual.json) zeigen die Prüfumfänge. Die Läufe am Remote-Stand werden mit Commit, Zeitpunkt und Ergebnis im Übergabeprotokoll festgehalten. Für die spätere Aufnahme in den Projektstand liegt ein [Entwurf zum Managementbericht](management-summary-entwurf.md) bei.

## Befunde aus den vollständigen Läufen

Die heutige E.2-Auswahl enthält gegenüber dem früheren Plan im GK einen und im LK drei zusätzliche Impulsinhalte. Der [Regressionstest mit den beiden datierten Planblöcken](checks/dated-e2-prior-plan.actual.json) verwendet nun die jeweils 32 tatsächlich gespeicherten Ziele. Er prüft weiterhin die Wiederherstellung und die Freigabe der vier beziehungsweise fünf verschobenen Ziele.

Bei M3 erzeugt die bestehende Mindestanforderung M6 für die Fächerwahl keine Physikangebote. Lokal entfernt die Generierung dadurch 180 Zeilen aus den beiden Angebotstabellen. Die Eingangsprüfung der Angebotsdatei, die Backend-Fachliste und die Trainer-Fächerwahl zeigen die Auswirkung. Die Zielbuchprüfung und die Prüfungsprojektion verlangen beide eine gültige Sek-I-Abschlussroute und bleiben an CQR-104 rot. Eine Übernahme erfordert die fachliche Klärung und einen erneuten Lauf mit den wiederhergestellten Angeboten.
