# Individueller informierter Audit: Strömungsbeispiele und Nervenleitungsmessverfahren

Stand: 8. September 2026. Verfasser: Codex-Subagent /root/physics_d043s_blind_b. Dies ist ein informierter, nicht blinder fachlicher Audit und ausschließlich eine AI-Kandidatennotiz. Keine D-Records, keine P-Abnahme, keine Quellenvollabdeckung, keine Bundeslandfreigabe und keine Änderung der Kanonik oder von Mastery.

## Ergebnis und engster Zuschnitt

- **333ca92b – Strömungsbeispiele:** Den aktuellen DE/EN-Zuschnitt beibehalten. Die Beispiele benennen mögliche, nicht kumulativ verpflichtende Gesetze. Kein automatischer Vierfachsplit und keine Pflicht zu einem Stokes-/Reynolds-Nachweis aus einem bereits gelungenen Kontinuitäts-/Bernoulli-Fall ableiten. Die noch fehlerhafte Quellenextraktion und Seitenbindung sind davon getrennte offene Quellenarbeit.
- **2825b528 – Nervenleitungsmessverfahren:** Eine einzige integrierte Beurteilung eines vorgegebenen Verfahrens ist fachlich möglich, aber die Quelle oder das gemeinsame Thema allein beweisen diese Atomarität nicht. Die Felder und eine gegebenenfalls auftretende Induktionsspannung müssen das Urteil über genau dieses Verfahren tragen. Engste lokale Präzisierung: die DE-Bedingtheit an EN angleichen und die zeitliche Flussänderung ausdrücklich nennen; keine allgemeine Pflicht, in jedem Verfahren sowohl E- als auch B-Felder und zusätzlich eine reale Induktionsspannung vorzufinden.
- Für 2825 bleibt eine **konkrete Quellenabdeckungslücke**: Die aktuelle Mapping-Union trägt die explizit quantitative Induktionsanforderung der BY-Quelle nicht nachweislich. Das darf weder durch eine großzügige P-Abnahme verdeckt noch als neue zusätzliche Pflicht ungeprüft in den kanonischen Text geschrieben werden.

## Gelesene Grundlagen und Grenzen

Read-only geprüft wurden genau die beiden aktuellen kanonischen Zielobjekte mit DE/EN, ihre benötigten Voraussetzungen, Container, direkten Nachfolger, die entsprechenden direkten RP-/BY-Platzierungen und Quellzuordnungen. Hinzu kamen ausschließlich die historischen B036-/B037-Einzelrecords zu diesen beiden IDs, die beiden zugehörigen Quellen-/Identitätsnotizen und die jeweiligen Einzelvorschläge in milestone-local-wording-four-v1.json vom 7. September. Die B036h-/B037h-Konfigurationen enthalten je diese eine ID; eigene ausgefüllte Hold-Rundenverzeichnisse wurden dabei nicht gefunden.

Keine Registry und keine anderen blinden D-Runden wurden in diesem Audit geöffnet; insbesondere D044r blieb geschlossen. Die separat vom Parent angeforderte mechanische Dateiorganisation der bereits abgeschlossenen eigenen B043s-/D045B-Ergebnisse änderte keine Urteile und war keine weitere fachliche Reviewrunde.

Aktuelle kanonische Objekte: [Physik-Kanonik, Strömungsziel](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json:34231), [Nervenleitungsziel](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json:47638).

Prüfstand als SHA-256 über JSON.stringify des jeweils vollständig gelesenen Zielobjekts, ausdrücklich **nicht** als nativer goalFingerprint:

- 333ca92b-a92c-46a9-86be-dea8ddbd43e0: sha256:a288d9b75896c591cf96f2b94bf92657582d8751920ad185ec61a6f00c7b0465
- 2825b528-00ee-52d0-870e-686890cb1195: sha256:e8b21dbb61ed6a772d24f770b50482720a6a281251f50bbb29089c2c2d9c2788

Die neue Notiz ist das einzige fachliche Audit-Artefakt dieses Auftrags. Es erfolgten keine Autorenänderungen an Kanonik, Quellartefakten, Mapping, Bildern, Profilen oder globalen Berichten.

## 1. Strömungsbeispiele – 333ca92b-a92c-46a9-86be-dea8ddbd43e0

### Aktueller Text und historischer Befund

DE-Titel: Strömungsbeispiele mit passenden Modellen erklären

EN-Titel: Explain flow examples using suitable models

DE: Die lernende Person kann an ausgewählten Strömungsbeispielen die Aussagen und Voraussetzungen der jeweils verwendeten Gesetze oder Kennzahlen qualitativ erläutern, etwa der Kontinuitätsgleichung, der Bernoulli-Gleichung, des Stokes-Gesetzes oder der Reynolds-Zahl.

EN: The learner can use selected flow examples to explain qualitatively the statements and assumptions of the laws or dimensionless quantities used in each case, such as the continuity equation, Bernoulli's equation, Stokes' law, or the Reynolds number.

Die beiden B036-Erstreviews beanstandeten an der damaligen Fassung die voneinander unabhängig nachweisbaren Aussagen von Kontinuität, ausgewähltem Strömungsgesetz und zusätzlich verpflichtender Reynolds-Zahl. Beide entschieden split_review. Das war kein Befund gegen jede denkbare beispielgebundene Modelldeutung. Der aktuelle Text entspricht inzwischen dem engeren Vorschlag aus dem [Quellen-/Identitätsaudit B036](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-036-spectra-models-methods-20-v1/source-identity-flow-models-v1.md). Der Einzeleintrag in [milestone-local-wording-four-v1.json](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-07/milestone-local-wording-four-v1.json) erklärt die Auswahlsemantik ausdrücklich. Diese Autorenbegründung wurde gelesen, nicht als unabhängige Abnahme übernommen.

### Exakte Originalquelle und verbleibende Quellenarbeit

Original: [RP Lehrplan Physik MSS, lokale amtliche PDF](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/RP/Physik_Sekundarstufe_II_MSS.pdf), gedruckte und PDF-Seite **45, Qualifikationsphase Grundfach**, sowie **75, Qualifikationsphase Leistungsfach**, jeweils Strömungsphysik als Wahlpflichtbaustein mit zehn Stunden. Beide vollständigen Tabellen wurden mit pdftotext -layout unmittelbar aus der Original-PDF gelesen. Datei-SHA-256: 3bf220e5e409fc4ae057b3327dfa3d445a8f27ad6961925aae5eb16f2d1c12cc.

Maßgebliche wörtliche Leitlinie: **„Die zu behandelnden Gesetze ergeben sich aus den gewählten Beispielen.“** Die Inhalte sind als mögliche Inhalte gekennzeichnet; Bernoulli, Stokes und Reynolds stehen in einer Beispielklammer. Damit ist die illustrative Auswahl gestützt. Die Quelle ist kein Beleg für vier eigenständig verpflichtende Routinen oder für die automatische Beherrschung eines Praktikums durch eine qualitative Erklärung.

Die aktuelle [RP-Extraktion](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/input/RP/upper-secondary/source-extraction/DE_RP_PHYSIK_SEKII_MSS_SOURCE_EXTRACTION_DRAFT.source-extraction.json:506) führt weiterhin page: 44 und eine zusammenfassende, nicht wortgetreue rawText-Liste. Der Einzelanker rp-phys-sek2-continuity-bernoulli-stokes-reynolds nennt bei Zeile 3128 weiterhin S. 44 und 75. Das ist für den GF-Teil falsch; die Auswahlhinweise fehlen. Diese Quelle muss bei einer nächsten freigegebenen Quellenkorrektur originalgetreu mit S.45/75 und Auswahlsemantik reconciled werden, ohne daraus neue Pflichtkompetenzen zu erzeugen.

Die zwei direkten RP-Zuordnungen sind aktuell partial. Die am 7. September erneuerten Begründungen unterscheiden bereits qualitative Modellinterpretation vom Sinkgeschwindigkeiten-Praktikum. Das ist angemessen; ihre sourceSpan-Felder tragen allerdings noch S.44/75. Weder partial zu exact hochstufen noch die selbstständige Praktikumsdurchführung dem Ziel unterschieben.

Der direkte Container ist Strömungsphysik; direkte RP-goalEntry-Platzierungen existieren in GK/LK und SekII-GK/LK. Das kanonische LK-Tag ist deshalb keine ausreichende Beschreibung des tatsächlichen RP-Scopes. Die Originalquelle belegt hier GF und LF, jeweils im genannten Wahlpflichtbaustein, nicht allgemeine Verpflichtung für alle Lernenden. Andere Bundesländer wurden nicht quellenfachlich freigegeben. Der einzige direkte requires-/coveredGoalIds-Nachfolger ist das Q4-Klausurziel; eine ID-Nennung dort ist noch kein konkreter positiver Fall.

### Zwei eigenständige P-Fallentwürfe

Beide Fälle prüfen denselben Erfolgskern: Eine bereitgestellte oder im gewählten Lernweg verwendete Modellbeziehung am Fall deuten, ihre Voraussetzungen prüfen und eine begrenzte physikalische Aussage begründen. Sie sind keine kumulative Prüfung aller im Text genannten Gesetze. Modellbeziehungen können bereitgestellt werden; keine neue Memorierpflicht.

**P-S1 – Diffusor statt der im Bild gezeigten Verengung.** Material: stationäre inkompressible Strömung durch ein waagerechtes, sich erweiterndes Rohr; keine Pumpe oder Turbine zwischen den betrachteten Stellen; Reibungsverluste im Modell vernachlässigbar. Die zweite Querschnittsfläche ist doppelt so groß wie die erste. Kontinuität und die passende Bernoulli-Bilanz sind angegeben. Die lernende Person erklärt eigenständig, weshalb die mittlere Geschwindigkeit sinkt und der statische Druck im idealisierten Modell steigt. Sie benennt Massenerhaltung und die Umverteilung der Energieanteile, nicht nur eine auswendig gelernte Druckregel. Geänderter Fall: Eine Pumpe liegt nun zwischen den Stellen. Erwartet wird die begründete Einschränkung, dass die unveränderte energiekonstante Zweipunktgleichung das System mit zusätzlicher Arbeitszufuhr nicht mehr vollständig beschreibt. Kein Zwang zur Pumpenleistungsrechnung.

**P-S2 – Gleichbleibender Querschnitt, aber Druckverlust.** Neues Material: langes waagerechtes Rohr gleichen Querschnitts, stationärer inkompressibler Fluss einer zähen Flüssigkeit, gleiche mittlere Ein-/Ausströmgeschwindigkeit und ein gemessener Druckabfall. Die lernende Person erklärt, weshalb dies die Kontinuität nicht widerlegt, wohl aber die unveränderte reibungsfreie Bernoulli-Bilanz als vollständige Beschreibung unbrauchbar macht. Geänderter Fall: Derselbe Aufbau wird bei gleichem Volumenstrom mit einem deutlich weniger zähen Medium gleicher Dichte betrieben; ein weiterhin laminares Regime ist für den Vergleich vorgegeben. Die lernende Person begründet, warum ein kleinerer dissipativer Druckverlust die Idealisierung plausibler macht, ohne aus Kontinuität allein die Größe des Druckverlusts zu errechnen. Kein Poiseuille-, Stokes- oder Reynolds-Pflichtnachweis.

Ein Erfolg in diesen Fällen belegt Modellverständnis im gewählten Kontinuitäts-/Bernoulli-Kontext. Er darf nicht als zusätzlich erworbene Stokes- oder Reynolds-Einzelkompetenz gespeichert oder berichtet werden. Werden im lokalen Lernweg andere Beispiele gewählt, müssen deren Voraussetzungen tatsächlich im passenden Nachweis vorkommen.

### Aktuelles Originalbild

Das vollständig in Originalauflösung betrachtete [JPG](/home/enpasos/projects/skillpilot/app/public/assets/goal-visualizations/physik/333ca92b-a92c-46a9-86be-dea8ddbd43e0/333ca92b-a92c-46a9-86be-dea8ddbd43e0.jpg) hat SHA-256 9c38b7ea32a8e2b8639949bec8783ca538c9d17b7978d4d73595eb7fdb45f177.

Die Verengung, Geschwindigkeitszunahme und Druckabnahme passen zum angegebenen vereinfachten Modell. Stationarität, Inkompressibilität, gleiche Höhe, Stromlinie und geringe Reibung werden sichtbar genannt; die Modellgrenzen sind markiert. Die Gleichheitszeichen bezeichnen die Idealisierung, nicht eine exakte Aussage für beliebige reale viskose Strömungen. Kein materieller Bildfehler festgestellt. Dass Stokes und Reynolds fehlen, ist bei der aktuellen Auswahlsemantik kein Mangel. Das Bild allein belegt keinen Transfer; P-S1/P-S2 verlangen andere Schlussfolgerungen als das Ablesen seiner zentralen Box.

## 2. Nervenleitung – 2825b528-00ee-52d0-870e-686890cb1195

### Aktueller Text und engste lokale Präzisierung

DE-Titel: Nervenleitungs-Messverfahren physikalisch beurteilen

EN-Titel: Evaluate nerve-conduction measurement methods physically

DE aktuell: Die lernende Person kann die Eignung eines vorgegebenen Verfahrens zur Messung der Signalleitungsgeschwindigkeit in Nervenzellen begründen, indem sie die verwendeten elektrischen oder magnetischen Felder abschätzt und eine dabei auftretende Induktionsspannung mithilfe der Änderung des magnetischen Flusses erklärt.

EN aktuell: The learner can justify the suitability of a supplied method for measuring signal-conduction speed in nerve cells by estimating the electric or magnetic fields used and explaining any resulting induced voltage in terms of the change in magnetic flux.

Die historische B037-Fassung reihte Messverfahren, E-/B-Abschätzungen und Induktion ohne gemeinsame Prüffrage aneinander; EN war eine deutsche Kopie. Beide damaligen Erstreviews entschieden split_review. Der heutige Text korrigiert Übersetzung und Zweckbeziehung bereits. Der [Quellen-/Identitätsaudit B037](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/quality/goal-description-review/physik/rollout-v1/2026-09-06/batch-037-biophysics-methods-pv-mechanics-20-v1/source-identity-nerve-conduction-v1.md) und der Einzelvorschlag vom 7. September halten die integrierte Variante nur dann für tragfähig, wenn Feld und Induktion genau die Verfahrensbeurteilung tragen. Diese Einschränkung bleibt nötig.

**Noch nicht angenommener lokaler Präzisierungsvorschlag**, ohne Titeländerung, zusätzlichen unabhängigen Teilinhalt oder Pflicht zu quantitativer Induktion in jedem Fall:

DE: Die lernende Person kann die Eignung eines vorgegebenen Verfahrens zur Messung der Signalleitungsgeschwindigkeit in Nervenzellen begründen, indem sie die für dieses Verfahren relevanten elektrischen oder magnetischen Felder abschätzt und gegebenenfalls auftretende Induktionsspannungen aus der zeitlichen Änderung des magnetischen Flusses erklärt.

EN: The learner can justify the suitability of a supplied method for measuring signal-conduction speed in nerve cells by estimating the electric or magnetic fields relevant to that method and explaining any induced voltages that arise in terms of the time variation of magnetic flux.

Der bestehende DE-Text ist nicht pauschal physikalisch falsch. Die Präzisierung verhindert aber, dass die unbedingte Formulierung einer auftretenden Induktionsspannung ein Verfahren ohne relevante Flussänderung künstlich ausschließt. EN ist mit any resulting bereits bedingter formuliert. Auch danach reicht eine richtige Laufzeitrechnung allein nicht; eine isolierte Feld- oder Induktionsrechnung ohne Einfluss auf das Verfahrensurteil reicht ebenfalls nicht.

### Exakte Originalquelle und konkrete Abdeckungsgrenze

Am 8. September live gelesen: [LehrplanPLUS Bayern, Gymnasium Physik 12, grundlegendes Anforderungsniveau Biophysik, Lernbereich 4 Neuronale Signalleitung](https://www.lehrplanplus.bayern.de/fachlehrplan/lernbereich/310657), zweite Kompetenzerwartung und zweiter Inhaltseintrag. Die Quelle verbindet Verfahrenseignung ausdrücklich mit Feldstärke und Zeitverlauf. Originalsatz: **„Auftretende Induktionsspannungen erklären sie, auch quantitativ, durch die mittlere Änderungsrate des magnetischen Flusses.“** Die Inhalte unterscheiden elektrische und induktive Signalanregung. Daher ist Induktion nicht generell nur eine unerwünschte Messstörung.

Diese Primärstelle gilt für den genannten BY-Biophysik-Lehrplan. Die lokale Extraktion Ph12-GA-BIO.4.2 bezeichnet courseLevel als GK_LK; daraus folgt keine eigenständige Prüfung eines anderen Kursprofils oder anderer Bundesländer.

Die aktuelle [BY-Mapping-Union](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_physics_source_extraction_to_canonical_physics.review.json:8300) enthält partial-Zuordnungen auf genau:

- 2825b528 – die integrierte Verfahrensbeurteilung;
- 1a037489 – Fluss bei homogenem Feld und **qualitative** Induktion;
- d3c153b9 – generische Versuchsplanung/Messauswertung.

Die Begründung bei Zeile 8309, reviewedAt 2026-09-07, schreibt den übrigen genannten Grundlagenzielen quantitative Fluss-/Induktionsbeziehungen zu. Das folgt aus ihren aktuellen Beschreibungen nicht. Der tatsächlich quantitative Nachbar [eb1ea150](/home/enpasos/projects/skillpilot/curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json:18969) ist nicht Teil dieser Mapping-Union. Eine fachliche Quellenreconciliation könnte dessen konkrete Abdeckung prüfen; diese Notiz fügt ihn nicht hinzu, ändert kein requires und hebt kein partial auf exact. Auch die durchgängige Abdeckung der zeitlichen Feldabschätzung ist im gegenwärtigen Textverbund nicht explizit gesichert.

Das Ziel liegt im Biophysik-Container und wird direkt in den vier BY-GK/LK-/SekII-GK/LK-Ansichten referenziert. Es gibt aktuell keinen direkten requires- oder examData.coveredGoalIds-Nachfolger. Keine dieser Strukturbeobachtungen schafft eine normative Freigabe für alle angezeigten Scopes.

### Zwei eigenständige P-Fallentwürfe

Ausschließlich vorgegebene, schematische Aufbauten und simulierte oder bereits bereitgestellte Messdaten; keine Untersuchung oder elektrische/magnetische Stimulation einer Person. Zahlen sind didaktische Modelldaten, keine medizinischen Geräteeinstellungen. Das Bestehen eines Falles bedeutet keine medizinische Eignungs- oder Sicherheitszertifizierung.

**P-N1 – Elektrische Anregung und gemeinsame Zeitverzögerung.** Material: elektrischer Anregungsimpuls von 24 mV über einen im Modell homogenen Abstand von 2 mm, wirksam von 0 bis 0,3 ms; zwei Ableitstellen im Abstand 0,18 m liefern korrespondierende Signalmerkmale bei 4 und 7 ms. Beide Kanäle besitzen dieselbe unbekannte Zusatzverzögerung. Während des maßgeblichen Messfensters gibt es keine zeitliche Änderung des Flusses durch die Messleitungen. Die lernende Person schätzt E ungefähr auf 12 V/m, beschreibt den endlichen Impulsverlauf und begründet aus der Laufzeitdifferenz 60 m/s. Sie erklärt, weshalb absolute Auslöseverzögerung und ein möglicher gemeinsamer früher Störimpuls nicht mit der Nervenlaufzeit gleichgesetzt werden dürfen und warum hier keine Induktionsspannung aus einem konstanten Fluss erforderlich ist.

Geänderter Fall: Ein externer kurzer Magnetfeldimpuls erzeugt bei beiden Kanälen einen zeitgleichen frühen Ausschlag, während das um 3 ms versetzte Signalpaar bestehen bleibt. Mit einer vorgegebenen Skizze der Leitungsschleifen erklärt die lernende Person die induktive Störung und beurteilt, welches Signalpaar noch einen Laufzeitnachweis trägt. Eine zusätzliche Referenzmessung ohne das Nervensignal kann als Begründungskontrolle vorgeschlagen werden; sie wird nicht an Menschen ausgeführt. Der positive Nachweis ist die physikalisch begründete Auswahl und Beurteilung der Daten, nicht allein 0,18/0,003.

**P-N2 – Induktive Anregung: gleicher Maximalwert, anderer Zeitverlauf.** Neues Material: ein als Modell vorgegebener magnetischer Anregungsaufbau mit separater Kalibrierschleife von 4 cm² senkrecht zum homogenen Feld. Ihr Fluss steigt um 2 µWb in 0,5 ms; danach bleibt er konstant. Die mittlere Induktionsbeziehung für die Kalibrierschleife und zwei unabhängig aufgezeichnete, zeitversetzte Nervensignalspuren werden bereitgestellt. Die lernende Person erschließt die Feldänderung von 5 mT und die mittlere Schleifenspannung von 4 mV und erklärt, weshalb im anschließenden Plateau trotz vorhandenen Magnetfelds keine entsprechende Induktionsspannung entsteht. Sie unterscheidet dabei ausdrücklich Kalibrierschleifenspannung, tatsächliche neuronale Anregung und aufgezeichnetes Laufzeitsignal.

Geänderter Fall: Derselbe Maximalfluss wird erst nach 2 ms erreicht. Die lernende Person begründet die kleinere mittlere Kalibrierspannung von 1 mV und prüft anhand der bereitgestellten Antwort- und Störsignalspuren, ob das geänderte Verfahren noch einen belastbaren Leitungsgeschwindigkeitsvergleich erlaubt. Die Behauptung, gleicher maximaler B-Wert garantiere gleiche induktive Anregung oder gleich gut auswertbare Signale, wird begründet zurückgewiesen. Fehlen die Antwortdaten, ist eine begrenzte Aussage über die Anregung statt einer erfundenen Eignungserklärung erforderlich. Die Kalibrierspannung darf nicht ohne zusätzliches Gewebemodell zur Membranspannung erklärt werden.

Die quantitative Rechnung in P-N2 ist eine konkret bereitgestellte Modellanwendung und kann den offenen Quellenaspekt sichtbar prüfen. Sie macht die bestehende Mapping-Union jedoch nicht automatisch vollständig und autorisiert keine neue kanonische Pflicht. Beide Fallentwürfe benötigen vor einem P-Abschluss eine eigenständige adversariale Prüfung: Erzeugt die Lösung wirklich ein zusammenhängendes Verfahrensurteil oder bleiben unverbundene Teilrechnungen? Beim zweiten Befund bleibt die Atomaritäts-/Scopefrage offen; das Wort Eignung allein darf sie nicht schließen.

### Aktuelles Originalbild

Das vollständig in Originalauflösung betrachtete [JPG](/home/enpasos/projects/skillpilot/app/public/assets/goal-visualizations/physik/2825b528-00ee-52d0-870e-686890cb1195/2825b528-00ee-52d0-870e-686890cb1195.jpg) hat SHA-256 67381efe80f8cfd2fe759cbd5664f9512c8a50156343066762609645886d530f.

Die Zahlen sind korrekt: 0,10 m / 2,0 ms = 50 m/s; 10 mV / 1,0 mm = 10 V/m; 10 cm² = 0,001 m² und 2 mT pro 1 ms ergeben bei der gezeigten Schleife 2 mV. Die E-Feld-Abschätzung ist ausdrücklich als homogenes Modell statt allgemeines Gewebefeld markiert. Die Induktion wird einer geometrisch gezeigten Messschleife zugeschrieben; die frühere unbegründete Spule-am-Axon-Verknüpfung ist nicht mehr vorhanden.

**Verbleibende didaktische Grenze:** Drei nebeneinanderstehende Panels plus Schlusszeile bilden noch kein vollständig spezifiziertes gemeinsames Messverfahren. Der Zusammenhang der 10-mV-Modellspannung mit Anregung oder Messsignal bleibt offen. Die zeitliche Lage und Größe der 2-mV-Störung relativ zu den Nutzsignalen sind nicht angegeben. Deshalb lässt sich aus dem Bild allein keine konkrete Verfahrenseignung herleiten. Das ist kein Rechenfehler; das Bild kann als Übersicht dienen. Soll es den integrierten Zielkern unmittelbar darstellen, wäre eine gezielte Bild-/Materialergänzung um einen gemeinsamen Aufbau, klar bezeichnete Feldrolle und aufeinander bezogene Zeitspuren sinnvoll. Die Quellenkompetenz darf dadurch nicht auf induktive Störungen verengt werden; induktive Signalanregung ist ein weiterer legitimer Fall.

## Sichere nächste Schritte – keine Ausführung durch diesen Audit

1. Strömung: aktuellen Text erhalten; die konkrete S.45/75- und Auswahlbindung in der RP-Quellenreconciliation korrigieren, Praktikumsgrenze und partial-Status erhalten.
2. Nervenleitung: die minimale DE/EN-Präzisierung ausdrücklich entscheiden. Quantitative Induktion und zeitliche Feldabschätzung separat quellenfachlich klären; keine Behauptung ihrer Vollabdeckung durch die aktuelle Dreier-Union.
3. Für den tatsächlich beschlossenen Zuschnitt frische D-Prüfung und zwei eigenständige, adversarial geprüfte P-Fälle erstellen. Diese Notiz ist dafür Material, nicht Ersatz.
4. Nur bei einem verbleibenden echten Splitbedarf Identität, Platzierung und Mastery-Historie explizit bearbeiten. Kein automatischer Split, kein verdeckter Pflichtkatalog, keine pauschale Bundeslandfreigabe.
