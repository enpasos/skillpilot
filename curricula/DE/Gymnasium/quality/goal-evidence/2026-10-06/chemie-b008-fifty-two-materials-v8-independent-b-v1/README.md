# B008 v8 — unabhängige Materialprüfung B

**Ergebnis: gezielte Materialkorrektur erforderlich.** Alle 52 Fälle in DE/EN, 26 Profile, 173 zweisprachige Kriterien, 14 Moderatorprotokolle, das Modellkartenset und sechs Recherchedateien wurden tatsächlich gelesen. Die 13 Autoren-Dateien und 14 externen Eingabebindungen passen exakt zum v8-Freeze `a86b11b5de0ea0e858468bc37dccdbdda06f0d4c2461dc10e9cd8eea57ac97e1`. Peer-Fachurteile wurden nicht gelesen.

## Tatsächliche Befunde

- **B-v8-01:** NaCl-Konzentration und Leitfähigkeit sind in den Fällen 14, 18 und 44 um etwa Faktor 10 falsch gekoppelt. Der [Hach-Primärstandard](https://www.hach.com/p-conductivity-standard-solution-1990-scm-nacl-100-ml/210542) nennt bei 25 °C für 1000 mg/L NaCl 1990 µS/cm; Fall 14 nennt für 1,0 g/L 199 µS/cm. Die Trend-/Temperaturdeutung bleibt richtig; Daten, Einheiten und verknüpfte Differenzen müssen korrigiert werden.
- **B-v8-02:** In den praktischen Fällen 5 und 7–10 fehlen konkrete Standard-/Temperatur-/Indikator-/Kalibrier-/Transfer- oder Verdünnungsangaben. Der Bericht unterscheidet die einzelnen Kit-Lücken und zulässige gleichwertige Ausstattungen. Keine neue universelle Pflicht zur eigenen Hypothesenformulierung wird eingeführt.
- **B-v8-03:** Fall 11 verlangt im Transfer eine tatsächliche spätere Temperaturprüfung zu einem fiktiven alten Rohblatt, ohne neue Daten oder Messaufbau. Eine neue nachvollziehbare Messnotiz oder ein neuer realer Aufbau ist erforderlich; keine nachträgliche Temperaturverifikation erfinden.

Die exakten `caseKey`-IDs und alle DE/EN-JSON-Pointer stehen in `literal-material-scientific-findings.actual.json`. Die Zahlen 1–52 dienen nur zur Anzeige; JSON-Indizes sind 0–51. Das Autorenformat enthält kein `caseId`-Feld.

## Vollständige Einzelfall- und Profilprüfung

43 Fälle behalten ihr fachlich begrenztes Kandidatenmaterial; neun benötigen die genannten Korrekturen. Sieben Profile sind über ihre Fälle direkt betroffen, 19 Profile und ihre Falltexte bleiben wissenschaftlich unverändert. Alle 26 Profilbeschreibungen bleiben wortgleich v7. Die eigene Reflexion zu Fall 7 hat eine bedingte Vorroute; ihr Reflexionsoperator und eigener Falltext werden dadurch nicht als fehlerhaft bezeichnet.

Eigene Fragen/theoriegestützte Hypothesen sind als eigene Formulierungsprodukte gefordert. Vorgegebene Hypothesen bleiben in praktischen Routen zulässig. Qualitative **und** quantitative Durchführung, echte Roh-/Handlungslogs, selbst ausgeführte digitale Verarbeitung, tatsächliche Recherche, eigene Reflexion, echte Partnerreaktionen und Präsentationsprodukte/Abläufe sind ausdrücklich verlangt. Vorgefertigte Antworten zählen nicht als Leistung. Präsentation verlangt chemischen Sachverhalt **und** eigene Lern-/Arbeitsergebnisse mit analogen **und** digitalen Medien.

Das obere Modellpaar behält Atombau/PSE/Gleichgewicht, komplexe Amid-/Phenylgeometrie, Bindungsverhältnisse, Rezeptorkontakte und Ester-Substrat/Enzym-Umsetzung. Die tatsächliche räumliche Kartenanordnung und eigene digitale Tabellen bleiben Pflicht. Freie Gleichgewichts-Ligandkonzentration und einfache unabhängige 1:1-Stellen begrenzen das Belegungsmodell; Belegung beweist keine Aktivierung oder klinische Wirkung. Das ist kein implementierter Simulator und kein Laborversuch.

## Unabhängige Prüfungen und Grenzen

`check-material-inputs-and-recompute.py` prüft Eingabehashes, Sprachfelder, 26 wortgleiche v7-Beschreibungen und Quellenverträge, Fälle/Kriterien/Protokolle und wahrheitsgemäße E1/G1-Flags. `independent-calculations.actual.json` enthält eigene Regressionen, Residuen, pH-, Stoffmengen-, Einheiten-, Bilanz-, Gleichgewichts- und Belegungsrechnungen. Der Primärzugriffsbericht nennt tatsächlich gelesene lokale Zeilen und erreichbare institutionelle/Anbieterquellen; keine nicht gelesene Quelle gilt als geprüft. K11 wird mit dem wirksamen Override **138–140** geprüft; der historische Basisbereich 141–151 bleibt unverändert.

Die Materialien bleiben **ai_candidate / needs_human_review / E1 / G1**. Es gab keine Lernendenleistung, tatsächliche physische Durchführung, Human Approval, Human Trial, native P/D/M7-Freigabe oder aktive Integration. Konkrete örtliche Gefährdungsbeurteilung, aktuelle Betriebs-/Stofffreigaben und echte Ausführungsprotokolle bleiben vor einer Durchführung erforderlich; diese QS erteilt keine solche Freigabe.

Alle 1646 ursprünglichen nationalen Quellenbindungen bleiben unverändert als offene Verpflichtungen erhalten. Keine Gesamtfreigabe der nationalen Quellen, keine aktuellen nativen IDs, source placements/target-Zuordnungen, aktuellen P-Routen, Memory- oder V-Freigaben. Diese offenen Folgeschritte sind von den hier gefundenen Materialdefekten getrennt.

Aktive Dateien und historische B-v6/B-v7-Berichte wurden nicht geändert. Kein globaler Build. Strenger Gewinn **0**; eingefrorener Stand Chemie **112/378**, Biologie **67/383**, Mathematik **807/807**, Physik **478/478** bleibt erhalten. Der neue eigene Freeze bindet ausschließlich diesen B-v8-Review und seine tatsächlichen Eingaben.
