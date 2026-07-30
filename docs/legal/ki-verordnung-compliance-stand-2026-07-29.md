# KI-Verordnung: Compliance-Stand für SkillPilot

**Stand:** 29. Juli 2026  
**Status:** dokumentierter Repository-Stand; die Veröffentlichung muss im Deployment
noch geprüft werden. Dieses Dokument ersetzt keine Rechtsberatung.

## 1. Rechtskalender

| Track | Maßgeblicher Termin | Bedeutung für SkillPilot |
|---|---:|---|
| Art. 50 KI-VO | **2. August 2026** | Transparenz bei direkter KI-Interaktion sowie bei bestimmten synthetischen Inhalten. Die Übergangsfrist bis 2. Dezember 2026 betrifft nur Art. 50 Abs. 2 für bereits vor dem 2. August 2026 in Verkehr gebrachte generative Systeme. |
| Anhang III / Art. 6 Abs. 2 | **2. Dezember 2027** | Kapitel III Abschnitte 1–3 gelten ab diesem Datum für Anhang-III-Systeme. Dieser Track ist von Art. 50 getrennt. |
| Anhang I / Art. 6 Abs. 1 | **2. August 2028** | Späterer, für den aktuellen SkillPilot-Sachverhalt nicht vorrangiger Produktregulierungs-Track. |

Rechtsgrundlagen sind die
[KI-Verordnung (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=de),
die seit 27. Juli 2026 geltende
[Änderungsverordnung (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj?locale=de)
und die am 20. Juli 2026 angenommenen
[Leitlinien der Europäischen Kommission zu Art. 50](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems).
Die Leitlinien sind Auslegungshilfe, nicht der Verordnungstext.

## 2. Verifizierter Produktbestand

Das
[maschinenlesbare Transparenzinventar](./ai-transparency-inventory.json)
ist der fortzuschreibende Nachweis. Die folgenden Angaben wurden zusätzlich direkt
im Repository geprüft.

| Klasse | Repository-Fakt am 29. Juli 2026 | Aussagegrenze |
|---|---|---|
| Lernziel-Visualisierungen | `app/public/assets/goal-visualizations/` enthält 1.494 Bilder: 1.484 JPG und 10 PNG. Der kanonische Source-Bildbestand hat dieselbe Anzahl. | Anzahl und Dateityp belegen weder Veröffentlichung vor einem Stichtag noch eine Deepfake-Einstufung. |
| Bild-Provenienz | Ein einfacher Byte-Scan findet in 1.491 Bildern einen `c2pa`-Marker und in 1.484 Bildern den Text `Created by Google Generative AI`. Prompt-Sidecars nennen für viele Bilder Gemini/Nano Banana Pro. | Es wurde keine C2PA-Signatur, Zertifikatskette oder Manifestintegrität kryptografisch validiert. Marker und Sidecars sind Provenienzindizien, kein validierter Art.-50-Nachweis. |
| Narrative Illustrationen und Comics | Das Inventar unterscheidet fünf semantische Sammlungen mit insgesamt 24 Runtime-Bilddateien: 12 bilinguale Quickstart-Szenen-Dateien und 12 Sprach-/Formatvarianten aus vier weiteren Comic-Sammlungen einschließlich `docs/comic4/`. | Dateizahl ist nicht gleich Zahl eigenständiger Werke. Erzeugungsanbieter und Erstveröffentlichung sind nicht vollständig belegt. |
| Whitepaper-Rasterfiguren | `docs/whitepaper/` und `app/public/whitepaper/` enthalten 24 gebundene PNG-Dateien. Zwei davon sind zugleich Runtime-Kopien aus `docs/comic4/`. Zusammen mit den narrativen Sammlungen sind es damit 46 eindeutige Runtime-Bilder außerhalb der 1.494 Lernziel-Visualisierungen. | Die Provenienz ist gemischt oder unvollständig belegt. Aus der Inventarisierung folgt ausdrücklich nicht, dass alle 24 Whitepaper-Figuren KI-generiert sind. |
| Lerncoach | Angeboten werden zwei ChatGPT-Verbindungsvarianten. Der externe KI-Anbieter führt das Dialogmodell aus; SkillPilot liefert Lernkontext und Werkzeuge. | Eine im Repository erhaltene Claude-OAuth/MCP-Implementierung ist pausiert, im Frontend verborgen und backendseitig standardmäßig deaktiviert; sie ist kein aktuell angebotenes Produkt. |
| Texte und Lernkarten | Der Bestand hat redaktionelle und fachliche QA-Lanes; seine Entstehungsgeschichte ist nicht für jeden Text einheitlich providerbezogen nachgewiesen. | Keine pauschale Behauptung, jeder Text sei vollständig KI-generiert oder von einem bestimmten Modell erzeugt. Die Ausnahme für Texte von öffentlichem Interesse setzt im Einzelfall nachweisbare menschliche Prüfung und redaktionelle Verantwortung voraus. |

### Audio

| Datei | Dauer | SHA-256 | Verifizierbare Metadaten |
|---|---:|---|---|
| `app/public/audio/intro-de.m4a` | 1095,540680 s | `11af439ea19741567bd797d7b05314c2a1f5c416413beed5f781e2fd7d1cf196` | Encoder-Tag `Google` |
| `app/public/audio/intro-en.m4a` | 892,482177 s | `e4d53b9f15932b7b1ce863cf06a48b36323a8a1efa09f0238fe96407a471a923` | Encoder-Tag `Google` |
| `docs/notebooklm/SkillPilot_macht_Bildung_zum_Navigationssystem.m4a` | 801,413515 s | `267aafede53d9849a980cccd0304abc47c7069edee5ecac5ab8263c06c594876` | Encoder-Tag `Google` |
| `docs/notebooklm/Skill_Graphs_Tame_the_Smart_Liar.m4a` | 1134,410884 s | `1542430f14f1beee4738dfa5b655b7fc1d819503a95e31dc1f02dbd580da43f8` | Encoder-Tag `Google` |

Die veröffentlichten Audioeinführungen sind nicht byteidentisch mit den beiden
archivierten NotebookLM-Dateien. Ein Encoder-Tag oder ein UI-Symbol beweist weder
den konkreten Erzeugungsdienst noch die verwendete Stimme. Die vorsorgliche,
providerneutrale öffentliche Kennzeichnung „Diese Audioeinführung enthält
KI-erzeugte Stimmen“ ist deshalb kein vollständiger Provenienznachweis; die
genauere Anbieter-, Stimmen- und Segmentprovenienz bleibt offen.

## 3. Art. 50: Einordnung und Umsetzung

### Rollen

- Art. 50 Abs. 2 knüpft an den Anbieter des KI-Systems an, das synthetische
  Ausgaben erzeugt. Ob dies der externe Dienst oder SkillPilot ist, hängt vom
  jeweils in Verkehr gebrachten System und nicht allein vom Hosting des Modells
  ab.
- SkillPilot wird für die eigene Integration und Veröffentlichung vorsorglich als
  Betreiber der eingesetzten KI-Systeme behandelt. Eine zusätzliche Anbieterrolle
  muss neu geprüft werden, wenn SkillPilot ein System unter eigenem Namen in
  Verkehr bringt, wesentlich verändert oder dessen Zweck ändert.
- Die Rollenprüfung ist je System und Inhalt zu dokumentieren. Ein allgemeiner
  Hinweis verschiebt keine gesetzliche Pflicht auf einen anderen Akteur.

### Direkte Interaktion

Der Lerncoach wird im Chat des ausgewählten Anbieters geöffnet. Zusätzlich nennt
der Startbereich den KI-Assistenten und warnt vor möglichen Fehlern. Damit wird
nicht allein auf die Ausnahme „aus Sicht einer angemessen informierten Person
offensichtlich“ vertraut; besonders die Verständlichkeit für Minderjährige bleibt
Teil des Release-Tests.

### Deepfake-Prüfung

Nach Art. 3 Nr. 60 und den Kommissionsleitlinien wird ein Inhalt nicht schon
deshalb zum Deepfake, weil er KI-generiert ist. Zu prüfen sind kumulativ:

1. KI-Erzeugung oder -Manipulation,
2. Bild-, Audio- oder Videoinhalt,
3. Ähnlichkeit mit bestehenden Personen, Gegenständen, Orten, Einrichtungen oder
   Ereignissen; ein namentlich identifizierbares reales Vorbild ist nicht
   zwingend,
4. ein Kontext, in dem der Inhalt einer Person fälschlich authentisch oder
   wahrheitsgemäß erscheinen würde.

Realismus, Kontext, Zweck, Kennzeichnung und die erwartbare Wahrnehmung der
Zielgruppe gehören in die Prüfung. Bei einem Lernangebot für Minderjährige ist
ein strengerer Verständlichkeitsmaßstab sachgerecht.

Für die vorhandenen didaktischen Illustrationen und Schemata spricht der
erkennbare Darstellungscharakter regelmäßig gegen das vierte Merkmal. Das ist
eine Klassenannahme, keine pauschale Freistellung aller 1.494 Dateien. Realistische
Menschen, Stimmen, Orte oder Ereignisse, nach dem Stichtag KI-erzeugte oder
KI-manipulierte Inhalte und Änderungen, die die bisherige Einordnung oder
Bereitstellung verändern, müssen einzeln geprüft werden. Es wird kein globales
Bild-Badge behauptet oder verlangt.

Die beiden Audioeinführungen tragen vorsorglich direkt am Player den klaren
Hinweis, dass die Audioeinführung KI-erzeugte Stimmen enthält. Das ist eine
Produktentscheidung trotz noch offener Segment- und Stimmenprovenienz; eine
allgemeine Legal-Seite wäre für einen tatsächlich von Art. 50 Abs. 4 erfassten
Inhalt allein nicht ausreichend.

### Altbestand und neue Inhalte

Die Kommissionsleitlinien verlangen keine rückwirkende Kennzeichnung für Inhalte,
die vor dem 2. August 2026 erzeugt oder manipuliert **und bereits bereitgestellt**
wurden. Bloßes Vorhandensein im Repository beweist diese Voraussetzungen nicht.
SkillPilot beansprucht diesen Altbestandsschutz für den aktuellen Bestand mangels
durchgängigen Erstbereitstellungsbelegs nicht. Daraus entsteht kein offener
Nachweispunkt für den aktuellen Release: Die Umsetzung stützt sich auf die
inhaltliche Art.-50-Prüfung und die kontextnahen Audio- und Coach-Hinweise. Soll
der Übergangsschutz später für ein einzelnes Asset genutzt werden, müssen
Erzeugung und erste Bereitstellung dafür belegt sein.

Für nach dem 2. August 2026 KI-erzeugte oder KI-manipulierte Inhalte sowie für
Änderungen, die die bisherige Einordnung oder Bereitstellung verändern, gilt vor
der Veröffentlichung:

1. Akteur und Rolle feststellen,
2. Inhaltstyp und Deepfake-Merkmale prüfen,
3. bei Texten von öffentlichem Interesse menschliche Prüfung und redaktionelle
   Verantwortung belegen oder am Inhalt offenlegen,
4. gegebenenfalls klar, spätestens bei der ersten Exposition und unter Beachtung
   anwendbarer Barrierefreiheitsanforderungen kennzeichnen,
5. Entscheidung, Version, Datum und Prüferrolle im Inventar festhalten.

Die C2PA-Strukturen werden beim Deployment nicht absichtlich entfernt. Ihre
Präsenz ersetzt jedoch weder die inhaltliche Prüfung noch eine erforderliche
menschenlesbare Offenlegung.

## 4. Anhang III: vorläufige Hochrisiko-Einstufung

Die Vorprüfung klassifiziert nicht SkillPilot als Ganzes. Systemgrenze und
KI-Systemeigenschaft nach Art. 3 Nr. 1 sind für Lerncoach, deterministische
Zustandswerkzeuge und künftige Bewertungsmodule jeweils getrennt zu
dokumentieren.

Maßgeblich sind beabsichtigter Zweck, Produktunterlagen, Vermarktung und der
konkrete Einsatzkontext. Das Repository belegt nicht für jede Installation
denselben Kontext.

| Einsatz | Vorläufige Einstufung |
|---|---|
| Selbstgewähltes Lernen außerhalb einer Bildungs- oder Berufsbildungseinrichtung, ohne formale Noten-, Zugangs- oder Zertifikatswirkung | Derzeit nicht als Anhang III Nr. 3 Buchst. b behandelt. Die KI-Einschätzung bleibt ein weiches Hilfsmittel; formale Entscheidungen sind ausgeschlossen. |
| Einsatz durch eine Bildungs- oder Berufsbildungseinrichtung, bei dem KI-Ausgaben Lernleistungen bewerten oder aufgrund dieser Bewertung den Lernprozess steuern | **Vorsorglich als Hochrisiko nach Anhang III Nr. 3 Buchst. b behandeln**, bis eine dokumentierte Gegenprüfung ein anderes Ergebnis trägt. Vor Aktivierung ist ein eigener Release-Gate erforderlich. |

Die Beispiele im
[Education-Bereich des offiziellen AI Act Service Desk](https://ai-act-service-desk.ec.europa.eu/en/education-and-vocational-training)
stützen die Abgrenzung zwischen freiwilliger Lernunterstützung und institutioneller
Leistungsbewertung. Sie beruhen auf Entwurfsleitlinien und sind nicht bindend.

### Trigger für die Hochrisiko-Spur

- Vertrag, Pilot oder Marketing für Schulen, Hochschulen oder
  Berufsbildungseinrichtungen,
- Verwendung von KI-Ausgaben oder Mastery-Werten für Noten, Zertifikate,
  Zulassung, Versetzung oder Abschluss,
- institutionell vorgegebene Lernsteuerung aufgrund einer KI-Bewertung,
- neue automatische Bewertungs-, Ranking- oder Prognosefunktion,
- Profiling im Sinne von Art. 4 Nr. 4 DSGVO innerhalb eines bereits von
  Anhang III erfassten Systems,
- eigenes Inverkehrbringen, wesentliche Änderung oder Änderung des beabsichtigten
  Zwecks eines KI-Systems.

Tritt ein Trigger ein, bleibt die Hochrisiko-Einstufung der sichere
Planungsdefault. Eine Ausnahme nach Art. 6 Abs. 3 setzt voraus, dass das System
kein erhebliches Risiko für Gesundheit, Sicherheit oder Grundrechte birgt und
den Ausgang einer Entscheidung nicht wesentlich beeinflusst. Zusätzlich muss
mindestens eine der vier **alternativen** Fallgruppen belegt sein:

1. enge Verfahrensaufgabe,
2. Verbesserung eines Ergebnisses einer zuvor abgeschlossenen menschlichen
   Tätigkeit,
3. Erkennung von Mustern oder Abweichungen ohne Ersatz oder unzulässige
   Beeinflussung einer sachgerechten menschlichen Prüfung,
4. vorbereitende Aufgabe für eine Anhang-III-Bewertung.

Profiling führt bei einem bereits in Anhang III genannten System unabhängig
davon zur Hochrisiko-Einstufung. „Personalisiert“ ist nicht automatisch
„Profiling“; erforderlich ist automatisierte Verarbeitung personenbezogener
Daten zur Bewertung persönlicher Aspekte nach
[Art. 4 Nr. 4 DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu).
Wer die Ausnahme als Anbieter nutzt, muss die Bewertung vor Inverkehrbringen oder
Inbetriebnahme dokumentieren und sich sowie das System nach Art. 49 Abs. 2 in der
EU-Datenbank registrieren.

## 5. Nachweis- und Release-Status

| Maßnahme | Stand 29. Juli 2026 |
|---|---|
| Kurzer KI-Transparenzabschnitt in `/legal`, DE/EN | Im Repository umgesetzt; Deployment offen |
| KI-Transparenz ohne neues Zustimmungs- oder Haftungsverzichts-Gate | Im Repository umgesetzt |
| Vorhandenes allgemeines Haftungshinweis-Gate | Unverändert; kein KI-Bullet, keine Versionierung und kein Re-Consent. Es ist technisch und rechtlich von Art. 50 getrennt. Eine Änderung wäre eine eigene Haftungs- und Produktentscheidung, kein Blocker dieser Umsetzung. |
| KI-Hinweis am Audio-Player, DE/EN | Im Repository umgesetzt; lokaler Render- und Accessibility-Smoke bestanden; Deployment offen |
| KI-Hinweis beim Coach-Start, DE/EN | Im Repository umgesetzt; lokaler Render- und Copy-Test bestanden; Deployment offen |
| Datenschutztext | Bleibt bei den tatsächlich angebotenen zwei ChatGPT-Wegen; Claude wird nicht als aktives Angebot dargestellt |
| Maschinenlesbares Inventar und lokaler Validator | Repository-Prüfung bestanden |
| CI- und Deployment-Gates | Frontend-CI prüft UI, Inventar und gebautes Artefakt. Das Deployment prüft Inventar vor dem Build sowie die Pflichttexte im lokalen Build und remote nach Readiness. |
| Altbestandsschutz | Wird mangels Erstbereitstellungsbeleg nicht beansprucht; kein offener aktueller Nachweis |
| Kryptografische C2PA-Validierung | Nicht beansprucht; vorhandene Marker werden nur als Struktur dokumentiert |
| Institutioneller Hochrisiko-Gate | Zukunftstrigger vor einem institutionellen Pilot oder Release; kein Defizit des aktuellen Selbstlernprodukts |
| Produktions-Deployment | Noch nicht ausgeführt; dies ist die einzige verbleibende aktuelle Abnahme |

Für den neuen KI-Transparenzabschnitt wird kein eigenes Zustimmungsgate
eingeführt und kein erneuter Consent erzwungen. Das vorhandene allgemeine
Haftungshinweis-Gate bleibt davon getrennt und unverändert. Gesetzliche Rechte
und zwingende Haftung bleiben unberührt.

## 6. Pflege

Das Dokument und das Inventar werden neu geprüft bei Provider- oder Modellwechsel,
neuer Assetklasse, realistischer Stimme oder Personendarstellung, Änderung der
Coach- oder Bewertungsfunktionen, institutionellem Vertrieb und wesentlicher
Änderung des beabsichtigten Zwecks. Maßnahmen zur KI-Kompetenz nach Art. 4 werden
rollenbezogen unterstützt; ein interner Schulungsnachweis ist sinnvolle Evidenz,
aber keine im Verordnungstext ausdrücklich vorgeschriebene Form.
