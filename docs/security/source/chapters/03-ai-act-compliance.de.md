## KI-Verordnung: Compliance-Stand für SkillPilot {#sec:sec-ai-act-compliance}

:::note{title="Dokumentierter Compliance-Stichtag und fortgeschriebenes Inventar"}
Stichtag dieser Bestandsaufnahme: **29. Juli 2026** (historischer Compliance-Nachweis im Repository; ersetzt keine Rechtsberatung). Das maschinenlesbare [KI-Transparenzinventar](repo:docs/legal/ai-transparency-inventory.json) wird bei neuen Assets deterministisch fortgeschrieben; für die spätere Provider-Reihenfolge ab September 2026 (aktive Claude-Lern-Beta vor fokussierter ChatGPT-Abnahme) gilt ergänzend die [Claude-first-Release-Strategie](repo:docs/deploy/claude-beta-chatgpt-release-strategy.md) sowie @ref{sec:sec-data-privacy}.
:::

### Rechtskalender {#sec:sec-ai-act-calendar}

:::table{cols="3.6cm,3.2cm,X"}
| Track | Maßgeblicher Termin | Bedeutung für SkillPilot |
| --- | --- | --- |
| **Art. 50 KI-VO** | **2. August 2026** | Transparenz bei direkter KI-Interaktion sowie bei bestimmten synthetischen Inhalten. Die Übergangsfrist bis **2. Dezember 2026** betrifft ausschließlich Art. 50 Abs. 2 für bereits vor dem 2. August 2026 in Verkehr gebrachte generative Systeme. |
| **Anhang III / Art. 6 Abs. 2** | **2. Dezember 2027** | Kapitel III Abschnitte 1–3 gelten ab diesem Datum für Anhang-III-Hochrisikosysteme. Dieser Track ist rechtlich von Art. 50 getrennt. |
| **Anhang I / Art. 6 Abs. 1** | **2. August 2028** | Späterer, für den aktuellen SkillPilot-Sachverhalt nicht vorrangiger Produktregulierungs-Track. |
:::

Rechtsgrundlagen sind die [KI-Verordnung (EU) 2024/1689](https://eur-lex.europa.eu/eli/reg/2024/1689/oj?locale=de), die seit 27. Juli 2026 geltende [Änderungsverordnung (EU) 2026/1744](https://eur-lex.europa.eu/eli/reg/2026/1744/oj?locale=de) sowie die am 20. Juli 2026 angenommenen [Leitlinien der Europäischen Kommission zu Art. 50](https://digital-strategy.ec.europa.eu/en/library/guidelines-transparency-obligations-providers-and-deployers-ai-systems) (Auslegungshilfe, nicht Verordnungstext).

### Verifizierter Produktbestand {#sec:sec-ai-act-inventory}

Das fortlaufend geprüfte [maschinenlesbare Transparenzinventar](repo:docs/legal/ai-transparency-inventory.json) bildet den technischen Nachweis; zum Stichtag 29. Juli 2026 wurden im Repository folgende Fakten und Aussagegrenzen festgestellt:

:::table{cols="3.3cm,6.3cm,X" longtable=true}
| Klasse | Repository-Fakt am 29. Juli 2026 | Aussagegrenze |
| --- | --- | --- |
| **Lernziel-Visualisierungen** | `app/public/assets/goal-visualizations/` enthält 1.494 Bilder (1.484 JPG, 10 PNG), identisch zum kanonischen Source-Bestand. | Dateizahl und Format belegen weder Erstbereitstellung vor einem Stichtag noch eine Deepfake-Einstufung. |
| **Bild-Provenienz** | Ein Byte-Scan findet in 1.491 Bildern einen `c2pa`-Marker und in 1.484 Bildern `Created by Google Generative AI`; Prompt-Sidecars nennen häufig Gemini / Nano Banana Pro. | Keine kryptografische Validierung von C2PA-Signatur, Zertifikatskette oder Manifestintegrität — Provenienzindizien statt validiertem Art.-50-Nachweis. |
| **Narrative Illustrationen & Comics** | Fünf semantische Sammlungen mit 24 Runtime-Dateien (12 bilinguale Quickstart-Szenen plus 12 Sprach-/Formatvarianten aus vier Comic-Sammlungen inkl. `docs/comic4/`). | Dateizahl entspricht nicht der Zahl eigenständiger Werke; Erzeugungsdienst und Erstveröffentlichung sind nicht lückenlos belegt. |
| **Whitepaper-Rasterfiguren** | `docs/whitepaper/` und `app/public/whitepaper/` enthalten 24 gebundene PNG-Dateien (davon 2 Kopien aus `docs/comic4/`), zusammen mit den narrativen Sammlungen also 46 eindeutige Runtime-Bilder außerhalb der Lernziel-Visualisierungen. | Gemischte bzw. unvollständig belegte Provenienz; aus der Inventarisierung folgt ausdrücklich nicht, dass alle 24 Figuren KI-generiert sind. |
| **Lerncoach (Stichtag 29.07.2026)** | Zum Stichtag zwei ChatGPT-Varianten; das Dialogmodell läuft beim externen KI-Anbieter, SkillPilot liefert Lernkontext und Werkzeuge. | Die am 29.07.2026 pausierte Claude-OAuth/MCP-Spur wurde erst im September 2026 durch Product-Owner-Beschluss zur aktiven Lern-Beta erhoben (siehe @ref{sec:sec-data-privacy}). |
| **Texte und Lernkarten** | Fachliche und redaktionelle QA-Lanes; Entstehungsgeschichte nicht für jeden Einzeltext einheitlich providerbezogen nachgewiesen. | Keine pauschale Behauptung reiner KI-Erzeugung; die Ausnahme für Texte von öffentlichem Interesse setzt im Einzelfall belegte menschliche Prüfung und redaktionelle Verantwortung voraus. |
:::

#### Audio-Bestand {#sec:sec-ai-act-audio}

- **`app/public/audio/intro-de.m4a`** — Dauer `1095,540680 s`, Encoder-Tag `Google`, SHA-256: `11af439ea19741567bd797d7b05314c2a1f5c416413beed5f781e2fd7d1cf196`
- **`app/public/audio/intro-en.m4a`** — Dauer `892,482177 s`, Encoder-Tag `Google`, SHA-256: `e4d53b9f15932b7b1ce863cf06a48b36323a8a1efa09f0238fe96407a471a923`
- **`docs/notebooklm/SkillPilot_macht_Bildung_zum_Navigationssystem.m4a`** — Dauer `801,413515 s`, Encoder-Tag `Google`, SHA-256: `267aafede53d9849a980cccd0304abc47c7069edee5ecac5ab8263c06c594876`
- **`docs/notebooklm/Skill_Graphs_Tame_the_Smart_Liar.m4a`** — Dauer `1134,410884 s`, Encoder-Tag `Google`, SHA-256: `1542430f14f1beee4738dfa5b655b7fc1d819503a95e31dc1f02dbd580da43f8`

Die veröffentlichten Audioeinführungen sind nicht byteidentisch mit den beiden archivierten NotebookLM-Dateien. Ein Encoder-Tag oder UI-Symbol beweist weder den konkreten Erzeugungsdienst noch die verwendete Stimme; die vorsorgliche, providerneutrale Player-Kennzeichnung *„Diese Audioeinführung enthält KI-erzeugte Stimmen“* ersetzt daher keinen vollständigen Segment- und Stimmennachweis.

### Art. 50: Einordnung und Umsetzung {#sec:sec-ai-act-art50}

- **Rollenabgrenzung:** Art. 50 Abs. 2 adressiert den Anbieter des generativen KI-Systems (maßgeblich ist das in Verkehr gebrachte System, nicht allein das Modell-Hosting). SkillPilot wird für seine Integration und Veröffentlichung vorsorglich als **Betreiber** behandelt; eine zusätzliche **Anbieterrolle** ist neu zu prüfen, falls SkillPilot ein KI-System unter eigenem Namen in Verkehr bringt, wesentlich verändert oder dessen Zweck ändert. Rollenprüfungen sind je System und Inhalt zu dokumentieren.
- **Direkte Interaktion:** Der Lerncoach läuft im Chat des gewählten Providers; zusätzlich nennt der SkillPilot-Startbereich den KI-Assistenten explizit und warnt vor möglichen Fehlern, statt sich bloß auf „Offensichtlichkeit“ zu stützen (insbesondere mit Blick auf Minderjährige).
- **Vierstufige kumulative Deepfake-Prüfung (Art. 3 Nr. 60):** Ein KI-Asset ist nur dann ein Deepfake, wenn kumulativ (1) KI-Erzeugung/-Manipulation, (2) Bild-/Audio-/Videoformat, (3) Ähnlichkeit mit realen Personen, Gegenständen, Orten, Einrichtungen oder Ereignissen (auch ohne namentlich identifizierbares Einzelvorbild) und (4) ein Kontext vorliegen, in dem es fälschlich authentisch oder wahrheitsgemäß wirkt (unter strengerem Verständlichkeitsmaßstab bei Minderjährigen). Bei schematischen Lernillustrationen spricht der Darstellungscharakter regelmäßig gegen Merkmal (4) — als Klassenannahme ohne pauschale Freistellung und ohne globales Bild-Badge. Die beiden Audioeinführungen tragen vorsorglich direkt am Player den klaren KI-Stimmen-Hinweis, da eine bloße Legal-Unterseite für Art. 50 Abs. 4 allein nicht genügen würde.
- **Altbestand und Fünf-Schritte-Gate für neue Inhalte:** Mangels lückenlosem Erstbereitstellungsbeleg vor dem 2. August 2026 beansprucht SkillPilot keinen pauschalen Altbestandsschutz, sondern stützt sich auf inhaltliche Art.-50-Prüfung und kontextnahe Player-/Coach-Hinweise. Für nach dem 2. August 2026 KI-erzeugte/-manipulierte oder neu eingeordnete Inhalte gilt vor Veröffentlichung verbindlich: (1) Akteur und Rolle feststellen, (2) Inhaltstyp und Deepfake-Merkmale prüfen, (3) bei Texten von öffentlichem Interesse menschliche Prüfung und redaktionelle Verantwortung belegen oder am Inhalt offenlegen, (4) erforderlichenfalls klar, barrierefrei und spätestens bei erster Exposition kennzeichnen sowie (5) Entscheidung, Version, Datum und Prüferrolle im Inventar festhalten. Vorhandene C2PA-Strukturen werden beim Deployment nicht entfernt, ersetzen aber keine erforderliche menschenlesbare Offenlegung.

### Anhang III: Vorläufige Hochrisiko-Abgrenzung {#sec:sec-ai-act-annex3}

Systemgrenze und KI-Systemeigenschaft (Art. 3 Nr. 1) sind für Lerncoach, deterministische Zustandswerkzeuge und etwaige Bewertungsmodule getrennt nach Zweck, Unterlagen, Vermarktung und Einsatzkontext zu beurteilen (gestützt u. a. auf die nicht bindenden Beispiele des [AI Act Service Desk für Bildung](https://ai-act-service-desk.ec.europa.eu/en/education-and-vocational-training)):

:::table{cols="6.4cm,X"}
| Einsatzkontext | Vorläufige Einstufung |
| --- | --- |
| **Selbstgewähltes Lernen außerhalb einer Bildungs- oder Berufsbildungseinrichtung** ohne formale Noten-, Zugangs- oder Zertifikatswirkung | Derzeit **nicht** als Anhang III Nr. 3 Buchst. b behandelt; die KI-Einschätzung bleibt ein weiches Hilfsmittel ohne formale Entscheidungswirkung. |
| **Einsatz durch eine Bildungs- oder Berufsbildungseinrichtung**, bei dem KI-Ausgaben Lernleistungen bewerten oder darauf gestützt den Lernprozess steuern | **Vorsorglich als Hochrisiko nach Anhang III Nr. 3 Buchst. b behandeln**, bis eine dokumentierte Gegenprüfung anderes trägt; vor Aktivierung ist ein eigenes Release-Gate zwingend. |
:::

**Sechs Trigger für die Hochrisiko-Spur:** (1) Vertrag, Pilot oder Marketing für Schulen, Hochschulen oder Berufsbildungseinrichtungen, (2) Nutzung von KI-Ausgaben oder Mastery-Werten für Noten, Zertifikate, Zulassung, Versetzung oder Abschluss, (3) institutionell vorgegebene Lernsteuerung aufgrund einer KI-Bewertung, (4) neue automatische Bewertungs-, Ranking- oder Prognosefunktionen, (5) Profiling nach [Art. 4 Nr. 4 DSGVO](https://eur-lex.europa.eu/eli/reg/2016/679/oj/deu) innerhalb eines bereits von Anhang III erfassten Systems (bloße Personalisierung ist nicht automatisch Profiling) sowie (6) eigenes Inverkehrbringen, wesentliche Änderung oder Zweckänderung eines KI-Systems.

Eine Ausnahme nach **Art. 6 Abs. 3** greift niemals bei Profiling und verlangt kumulativ fehlendes erhebliches Risiko, fehlende wesentliche Entscheidungsbeeinflussung sowie mindestens eine der vier **alternativen** Fallgruppen: (1) enge Verfahrensaufgabe, (2) Verbesserung des Ergebnisses einer zuvor abgeschlossenen menschlichen Tätigkeit, (3) Muster-/Abweichungserkennung ohne Ersatz menschlicher Prüfung oder (4) vorbereitende Aufgabe für eine Anhang-III-Bewertung — einschließlich Vorab-Dokumentation und EU-Datenbankregistrierung nach Art. 49 Abs. 2 durch den Anbieter.

### Nachweis-, Release-Status und laufende Pflege {#sec:sec-ai-act-status-maintenance}

:::table{cols="5.2cm,X" longtable=true}
| Maßnahme | Dokumentierter Stand (Baseline 29. Juli 2026) |
| --- | --- |
| **KI-Transparenzabschnitt in `/legal` (DE/EN)** | Im Repository umgesetzt, ohne neues Zustimmungs- oder Haftungsverzichts-Gate und ohne erneuten Consent-Zwang. |
| **Allgemeines Haftungshinweis-Gate** | Technisch und rechtlich von Art. 50 getrennt und unverändert beibehalten (zwingende gesetzliche Rechte bleiben unberührt). |
| **KI-Hinweise am Audio-Player & Coach-Start (DE/EN)** | Im Repository samt lokalem Render-, Copy- und Accessibility-Smoke umgesetzt. |
| **Maschinenlesbares Inventar & CI-/Deploy-Gates** | `check:ai-transparency-inventory`, `check:ai-transparency-artifact` und Deploy-Readiness-Checks verifizieren UI, Inventar und gebaute Artefakte. |
| **Altbestandsschutz & C2PA-Kryptovalidierung** | Werden beide nicht beansprucht; vorhandene C2PA-Marker sind lediglich als Byte-Struktur dokumentiert. |
| **Institutionelles Hochrisiko-Gate** | Zukunftstrigger vor einem institutionellen Pilot oder Release; kein Defizit des freiwilligen Selbstlernangebots. |
:::

**Pflegeanlässe:** Dossier und Inventar werden zwingend neu geprüft bei Provider- oder Modellwechsel, neuer Assetklasse, realistischer Stimme oder Personendarstellung, Änderung von Coach- oder Bewertungsfunktionen, institutionellem Vertrieb sowie wesentlicher Zweckänderung; rollenbezogene KI-Kompetenzmaßnahmen nach Art. 4 KI-VO werden begleitend unterstützt.
