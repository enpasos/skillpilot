# Vier offene Analysis-/Atomaritätsfälle: informierte Bestandsaufnahme

Stand: 21.09.2026, Lesesnapshot 21:23 UTC. Kein neuer unabhängiger D-Durchgang, keine Freigabe, keine Änderung an Canonical, zentraler Registry oder In-flight-Ledger. Die drei Strukturvorschläge sind **Vorschläge zur Entscheidung**, keine bereits genehmigten oder ausgeführten Splits.

## Ergebnis und effizienter Abschlussweg

| Ziel | Letzter konkreter D-Befund | Reparatur bereits erfolgt? | Kleinster begründeter nächster Schritt |
| --- | --- | --- | --- |
| `0d21097c-09bf-5375-8c56-34ce8dc5bc35` – Erweiterte Integrationsregeln anwenden (LK) | KEEP / REVISE; Dissens über zusätzliche Erklär- und Intervallangaben im Zieltext | Nein; eine Änderung ist nach inhaltlicher Abwägung aber nicht zwingend nötig | Informierte KEEP-Synthese, die den REVISE-Einwand einzeln beantwortet; vorhandenes gutes P-Profil gezielt aktuell binden. Kein neues Bild. |
| `31be24f0-3ab1-54d2-856d-fa9b7f36552f` – Stammfunktionen bestimmen und vorgegebene nutzen | zweimal `split_review` | Nein | Eigenständiges Konstruieren und Nutzen vorgegebener Ergebnisse abgrenzen; vorhandene passende Ziele wiederverwenden, nur echte Lücke neu modellieren. |
| `809ef78a-f282-5593-89be-0f2cb95570ac` – Bestände und Mittelwerte modellieren | zweimal `split_review` | Nein | Rekonstruktion auf vorhandenen passenden Atom zurückführen; Funktionsmittelwert getrennt behandeln. Danach Bild-Scopefehler „Optional“ gezielt korrigieren und Formelkarte dem tatsächlichen Mittelwertziel zuordnen. |
| `972cc7e8-be9c-444c-ba45-98e817b3cf14` – Parameter in Analysisaufgaben | zweimal `split_review` im neueren September-Durchgang | Nein | Vorwärtswirkung und inverse Parameterbestimmung mit vorhandenen Zielen und GK/LK-Scope abgleichen. Fehlerhaften gemeinsamen Scheitelpunkt im Bild gezielt korrigieren. Keine Wiederherstellung des älteren KEEP allein wegen unveränderter Hashes. |

Bei der Abfrage der aktuellen zentral registrierten D-Auflösungen und P-Konfigurations-Scopes hatte **keines der vier Ziele** eine aktive D-/P-Abschlusszuordnung. Die beiden beauftragten Carryover-Konfigurationen existieren; ihre vorgesehenen Ausgabeordner waren noch nicht materialisiert. Historische Reviewarbeit ist vorhanden und wird unten ausdrücklich wiederverwendet. Ein neues Paket darf diese Arbeit nicht als neue Blindprüfung ausgeben.

## 1. Erweiterte Integrationsregeln: `0d21097c…`

Aktuell werden Integrale von `(ax+b)^r`, `r ∈ ℚ \ {−1}`, und von `f′(x) exp(f(x))` genannt. Beide beruhen auf rückwärts angewandter Kettenregel. Die eine Form benötigt die Kompensation des konstanten inneren Ableitungsfaktors; in der anderen ist die innere Ableitung bereits im Integranden enthalten. Zwei sinnvoll kontrastierte Ausprägungen dieser Kompetenz sind nicht schon zwei unabhängige Lernziele.

Runde A behält den Text; Runde B möchte „auf geeigneten Intervallen“ und das Erläutern der Rolle der inneren Ableitung ergänzen. Runde B benennt keine falsche Formel im vorhandenen Text. Das Thema Definitionsbereich ist fachlich wichtig, die ausführliche Leistungsanforderung muss aber nicht vollständig in die kanonische Kurzbeschreibung. Die Klärung gehört konkret in die P-Nachweise, nicht bloß in eine pauschale KEEP-Begründung.

Das bereits vorhandene, noch nicht für dieses Ziel registrierte P-Kandidatenprofil enthält genau diese Anforderungen:

- `√(3x+1)` auf `(-1/3,∞)`: Stammfunktion `(2/9)(3x+1)^(3/2)+C`, erklärt und durch Ableiten geprüft.
- `2x exp(x²)`: Stammfunktion `exp(x²)+C`, mit innerem Ableitungsfaktor.
- Sonderfall `a=0`: für den dann konstanten Integranden `√4=2` ist `2x+C` richtig; die allgemeine Formel mit Division durch `a` ist hier nicht anwendbar.
- `5(2−5x)^(-2/3)` in reeller Kubikwurzelinterpretation: `−3∛(2−5x)+C` auf getrennten Intervallen links bzw. rechts von `2/5`; keine Integration über die Definitionslücke und unabhängige Konstanten auf den Zusammenhangskomponenten.
- `(2x+1) exp(x²+x)`: Stammfunktion `exp(x²+x)+C`.

Diese Rechnungen und die DE-/EN-Fälle wurden gezielt geprüft; sie sind fachlich korrekt. Der Materializer-Ausgabepfad der damaligen Acht-Ziele-Konfiguration existiert jedoch nicht. **Kandidatentext ist nicht materialisierte oder zentral registrierte Evidenz.**

Das bestehende Bild wurde schon am 16.07. korrigiert. Es zeigt korrekte unbestimmte Integrale mit `+C` und Ableitungschecks; seine aktive Datei stimmt mit dem positiven AI-Review-Hash überein. Kein belegter Bildmangel: KEEP und Wiederverwendung der gültigen Bildprüfung, kein erneutes Generieren.

Minimaler Abschluss: aktuelle native Ein-Ziel-Bindungen erzeugen, bestehenden Dissens informiert nach KEEP abwägen, den fachlich vorhandenen P-Text in einer neuen versionierten Kandidatenfassung übernehmen und aktuelle Ziel-/Seiten-/Kontext-/Quellen-/Bildbindungen prüfen. Keine Behauptung einer neuen unabhängigen D-Runde oder menschlichen Freigabe.

## 2. Stammfunktionen: `31be24f0…`

Der unveränderte Text verbindet **ohne Hilfsmittel konstruieren** mit **vorgegebene Stammfunktionen für Integral-/Rekonstruktionsaufgaben nutzen**. Beide September-Runden benennen denselben testbaren Unterschied: Das Einsetzen von Grenzen in eine vorgegebene Stammfunktion kann gelingen, obwohl deren selbstständige Konstruktion nicht gelingt. „Sicher nutzen“ oder ein zusätzliches „erklären“ beseitigt diese Unabhängigkeit nicht.

Minimaler Strukturvorschlag zur Entscheidung:

1. Konstruktion ganzrationaler Stammfunktionen ohne Hilfsmittel als genau benannte Kompetenz abdecken. Zuerst prüfen, ob `a9ed219d-d497-55e5-a4e0-4d45d2554f6b` („Einfache Integrale berechnen“) diesen curricularen Teil im jeweiligen Scope bereits erfüllt. Dieses Ziel enthält Faktor-/Summenregel und elementare Potenz-, Exponential- und trigonometrische Fälle, nennt aber das hilfsmittelfreie Arbeiten nicht ausdrücklich. Ähnliche Titel allein beweisen keine Gleichwertigkeit.
2. Nutzen vorgegebener Stammfunktionen gegen den bestehenden Hauptsatz-Atom `b9bbd2a8-1379-5ffb-817f-41467d48abef` und die tatsächlich benötigten Rekonstruktionsziele abgrenzen; keinen zweiten Atom für dieselbe bereits abgedeckte Kompetenz erzeugen.
3. Bei echtem Split den alten breiten Identifier nicht stillschweigend in nur einen engeren Kompetenznachweis umdeuten. Ein kompatibler fachlicher Cluster mit expliziten Zielreferenzen ist eine mögliche Lösung; konkrete `contains`-/`requires`-, Provenienz-, Mapping-, Projektions- und Mastery-Folgen müssen vor Umsetzung festgelegt werden.

Direkte abhängige Ziele: `d144a855-9139-55c7-a801-e8b85dab5f01`, `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4`, `226e5c66-b5ce-5b58-a11c-7ed64feadcc1`. Ihre Voraussetzungen nur auf die tatsächlich benötigte Teilkompetenz umhängen, nicht beide Kinder pauschal als Voraussetzung einsetzen.

Das vorhandene hashgebunden positiv geprüfte Bild ist fachlich richtig. Es muss nicht wegen eines Strukturvorschlags neu erzeugt werden. Erst die beschlossene künftige Ziel-/Clusterbindung entscheidet, ob es dort ein passendes Überblicksbild bleibt. Kein P-Kandidatenprofil für diesen Atom in der einschlägigen damaligen Acht-Ziele-Datei; die D-Entwürfe sind Arbeitsmaterial, keine positive Evidenz.

## 3. Bestände und Mittelwerte: `809ef78a…`

Zwei unabhängige Routinen stehen unverändert zusammen: Bestandsrekonstruktion `B(t)=B₀+∫r` und zeitlicher Funktionsmittelwert `(1/(b−a))∫f`. Mittelwert eines Bestands und Mittelwert einer Rate können dagegen als zwei Interpretationen **einer** Mittelwertkompetenz behandelt werden. Die lokale HE-Quellenextraktion trennt bereits Rekonstruktion und Mittelwerte als zwei Aspekte derselben offiziellen Aufzählung.

Minimaler Strukturvorschlag zur Entscheidung:

- Rekonstruktion mit `ece68088-71a8-466b-874c-09e6baac19fc` abgleichen: „Bestände aus Änderungsraten und einem Anfangsbestand berechnen“ und in Kontexten deuten ist bereits dessen ausdrückliche Kompetenz; GK/LK und Q1 passen. Kein neues Rekonstruktionsduplikat nötig, wenn die vollständige Quellen-/Scopeprüfung dies bestätigt.
- Nur die gegebenenfalls noch eigenständig fehlende Kompetenz „Zeitliche Funktionsmittelwerte mit Integralen bestimmen und deuten“ als fokussierten Atom modellieren. Beispiele Bestand/Rate brauchen jeweils korrekte Einheit und Interpretation.
- Alten breiten Identifier gegebenenfalls als kompatiblen Cluster erhalten; `6420e4be-fcb1-537a-8367-206431e5b14e` benötigt einen gezielten Abgleich seiner Voraussetzungen. Verwandte Gesamtmengen-/Wirkungsziele nicht in diesen kleinen Split hineinziehen.

**Bild tatsächlich betrachtet:** Die vorhandenen Werte sind korrekt: `r(t)=2t L/min`, `B₀=10 L`, Zeitraum `[0,3]`, Zuwachs `9 L`, Endbestand `19 L`, mittlere Rate `3 L/min`, mittlerer Bestand `13 L`. Das Bild nennt den letzten Teil weiterhin **„Mittlerer Bestand (Optional)“**, obwohl der gegenwärtige Zieltext ihn verbindlich enthält. Diese Scope-Irritation ist nicht repariert. Nach der Kompetenzentscheidung genügt eine gezielte Korrektur dieses Hinweises bzw. eine begründete neue Zuordnung; der freundliche brauchbare Rest ist zu erhalten. In der QA-Datei steht eine historische menschliche Bildfreigabe, aber **kein** aktueller `aiApproved`-/Hashnachweis für V. Diese Freigabetypen nicht gleichsetzen.

**M6-abhängiger Pflichtpunkt:** Dieses Ziel ist aktuell `memory_required` für `ca708087-71f8-5fae-91c5-b80721a4208f` / `de_gymnasium_math_analysis_core`. Die notwendige Karte `math_analysis_c16` hat derzeit ausschließlich `809ef78a…` als Ursprung. Bei einem Split gehört ihr Ursprung an den tatsächlichen Mittelwert-Atom samt positiver Memory-Entscheidung und Sichtbarkeitsnachweis. Weder die Karte löschen noch sie als verwaiste Karte an einem Cluster belassen. Erst danach können CQR-302 und die geschützten M6-Niveaus sauber geschlossen werden.

## 4. Parameter: `972cc7e8…`

Die neueren unabhängigen Runden vom 20.09. markieren beide `split_review`: Parameterwirkung auf Lage/Form eines Graphen ist ein Vorwärtsproblem; aus Bedingungen Parameter zu bestimmen ein inverses Problem. Der ältere B043-KEEP-/P-Eintrag wurde bei der Current-14-Integration **bewusst entfernt**. Das ist keine versehentlich verlorene Hashbindung, die einfach zurückgesetzt werden dürfte.

Für den kleinsten Strukturvorschlag genügt zuerst folgende Abdeckungsentscheidung, kein kompletter Graphumbau:

| Vorhandener Atom | Nutzen | Grenze einer Wiederverwendung |
| --- | --- | --- |
| `71683f37-24de-4e0f-badd-858b56fa4d64` – Parameter aus Kontextbedingungen bestimmen | Deckt das inverse Problem bereits ausdrücklich ab; GK/LK, gleicher fachlicher Parent | Konkrete Quellen-/Bedingungsbreite prüfen. |
| `91e2f564-3bc8-4924-af85-2a3fa84c1471` – Parameter im Kontext untersuchen | Thematisch passender Nachbar im selben Cluster | **Nur LK**: darf nicht still als Ersatz für den GK-Anteil eingesetzt werden. |
| `993a14e8-60f0-5764-9340-b2447a5fa84b` – Parameter in Funktionenscharen deuten | Vorwärtswirkung, GK/LK | Anderer Q4-/Parent-Scope und andere Voraussetzungen, darunter komplexe Zahlen. Nicht blind als früh erreichbaren Ersatz verwenden. |
| `250daae6-58fd-59e4-8a11-f994e789ee47` – Transformation `a f(x)+b` | Enger vorhandener Transformationsbaustein | Deckt nicht automatisch alle Parameter innerhalb einer Funktion ab. |

Der bestehende Parent `e7c9a459-52d1-5e29-8714-2b038c4d3a7f` bündelt schon `972cc7e8…`, `71683f37…`, `91e2f564…`. Deshalb zuerst die Vorwärts-/Rückwärtsabdeckung und GK/LK-Zuordnung explizit machen, dann höchstens eine tatsächlich fehlende fokussierte Kompetenz hinzufügen. Ein kompatibler Cluster für den alten breiten Identifier ist möglich, aber keine automatische Wahl. Abhängige Ziele `bf17cada-3ccd-5d9a-b9e3-42065cfdbb01` und `bd2c5e29-31c6-58bf-9858-d08e9c8a32ad` müssen nur die benötigten Teilkompetenzen voraussetzen.

**Bild tatsächlich betrachtet:** Im Vergleich zu `f(x)=a(x−2)²+b` teilen die nach oben geöffneten Parabeln den eingezeichneten Scheitel `S(2,b)`. Die nach unten geöffnete grüne Parabel liegt mit ihrem Scheitel dagegen auf der x-Achse. Für einen Vergleich unterschiedlicher `a` bei festem `b` ist das falsch. Die mittlere Rechnung mit `S(2,1)` und `P(4,9)` zu `a=2,b=1` stimmt. Kleinste Bildkorrektur: auch die nach unten geöffnete Parabel durch denselben Scheitel führen; eine zusätzliche b-Variation nur getrennt und ausdrücklich zeigen. Bestehender positiver AI-Hash hebt den später konkret belegten Bildfehler nicht auf. Keine ungeprüfte neue Freigabe.

Das vorhandene Current-20-P-Profil bietet richtige inverse Beispiele: `a(x−1)²+b`, `S(1,−2)`, `P(3,6)` ergibt `a=2,b=−2`; die zwei symmetrischen Punkte `(-1,6)` und `(3,6)` liefern beide nur `4a+b=6` und somit keine eindeutige Bestimmung. Diese Beispiele sind brauchbare Saat für den passenden Teil-Atom, schließen aber nicht den unabhängigen Vorwärtsanteil. Das Profil ist kein Ersatz für die ausstehende Atomaritätsentscheidung.

## Quellen und erhaltene Nachweise

Repo-relative Artefakte; für D-Pfade gilt der Präfix `curricula/DE/Gymnasium/quality/goal-description-review/mathematik/rollout-v1/`:

- Carryover: `2026-09-20/held-carryover-mathematik-rollout-v1-batch-041h-open-integral-applications-6-v1-20260907-carryover-after-held7-20260920-v1.config.json`; `2026-09-20/m7-parameter-atomicity-hold-1-v1.config.json`.
- Integral-D: `2026-09-07/batch-041-integral-applications-10-v1/round-a/results/mathematik-rollout-v1-batch-041-integral-applications-10-v1-20260907-first-pass-a.batch-001.records.jsonl` und entsprechendes `round-b/...first-pass-b...`; die drei Zielrecords und ihre Eingaben wurden gelesen.
- Parameter-D: `2026-09-20/m7-functions-calculus-current-20-v1/round-a/results/mathematik-m7-functions-calculus-current-20-v1-20260920-first-pass-a.batch-001.records.jsonl` und entsprechendes B-Artefakt; Zielrecord `record-019` beider Runden.
- Bewusste Parameter-Herausnahme: `2026-09-20/m7-functions-calculus-current-20-v1/registration-current-14.receipt.json`; Fortsetzungsstand `docs/qa-ci/math-m7-resumed-2026-09-20.md`.
- Bereits vorhandene Befundtriage: `2026-09-20/held-current-triage-v1.json`.
- P-Kandidaten: `curricula/DE/Gymnasium/quality/goal-evidence/canonical-math-positive-understanding-evidence-rollout-v1-batch-041-integral-applications-8-v1.candidates.json` und `canonical-math-positive-understanding-evidence-m7-functions-calculus-current-20260920-v1.candidates.json` im selben Verzeichnis.
- Aktueller Canonical: `curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json`.
- A/M/Karten: `curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-math-full.review.jsonl`; `curricula/DE/Gymnasium/quality/memory-card-review/canonical-math-full.review.jsonl` und `canonical-math-full.cards.review.jsonl`.
- V: `curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json`; aktive Dateien jeweils `app/public/assets/goal-visualizations/mathematik/<goalId>/<goalId>.jpg`.
- HE-Normtext, lokal erhalten: `curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_MATHEMATIK_SEKII_KC2024.source-extraction.json`. `31be24f0…`: Q1.1 S.36 Aspekt `he-math-sekii-q1-1-b04-a03-a7178d9f`; `0d21097c…`: Q1.1 S.36, LK, Aspekte `he-math-sekii-q1-1-b06-a01-07c3f5c1` und `he-math-sekii-q1-1-b06-a02-17e02078`; `809ef78a…`: Q1.2 S.37 Aspekte `he-math-sekii-q1-2-b02-a01-87fb433c` und `he-math-sekii-q1-2-b02-a02-00175ec3`.

## Bindungsprüfung und klare Grenzen

Im Snapshot `2026-09-21T21:23:27.899Z` hatte der Canonical die SHA-256 `ee31c20e64a2584c3be3a6fcacfe32a2d55bf95f079dbeb0234d1b06dffc47c6`. Die eigenen DE-/EN-Zieltexte, kanonischen Kontextfelder und aktiven Bildbytes der vier Ziele sind gegenüber ihren jeweils letzten D-Eingaben unverändert. Das bedeutet ausdrücklich **nicht**, dass sämtliche Buchseiten-, Kontext- und Quellenbindungen heute ohne native Prüfung wieder gültig sind. Parallelarbeit an anderen Zielen kann Buchbindungen ändern, ohne diese vier Zieltexte zu verändern.

| Zielpräfix | Aktuelle Bild-SHA-256 | Wiederverwendbarer Stand |
| --- | --- | --- |
| `31be24f0` | `c1c093225817766685acf41ce3ad8540c3741ff8cb009a2ebd610aae594ad797` | Positives AI-Bildreview hashgebunden; kein bekannter Bildfehler. |
| `0d21097c` | `38e2ed20d541723c04f32b493812d2a9f2f2ecb4a720c739001f54b617f2bee6` | Positives AI-Bildreview hashgebunden; Juli-Korrektur erhalten. |
| `809ef78a` | `027da3a06ec3b0f2f59a2d5a694b3caf0679f71f6e11040bf60f7182a291b9de` | Historische menschliche Freigabe, kein aktueller AI-V-Nachweis; „Optional“-Befund offen. |
| `972cc7e8` | `7809fc85b92e0818ec383fc778cfb61edf44443f347169d97cedd353fba6894f` | AI-Hash passt, aber später konkreter Scheitelpunkt-Befund offen. |

Die nativen A- und M-Fingerprints wurden mit den tatsächlichen Normalisierungs-/Feldregeln der jeweiligen Tools nachgerechnet und passen für alle vier Ziele. Die alten A-Records lauten `atomic`, sind aber generische Entscheidungen vom 05.05.; sie adjudizieren die konkreten späteren `split_review`-Befunde **nicht**. M lautet bei drei Zielen `no_memory_needed`, bei `809ef78a…` wie oben `memory_required`. Nach einer echten Inhalts-/Strukturänderung nur die abhängigen Bindungen und fachlichen Entscheidungen gezielt erneuern.

Kein globaler QS-Lauf, keine Registry-Freigabe und kein neuer fachlicher Abschluss wurden durch diese Bestandsaufnahme erzeugt. Die anschließende Ein-Ziel-Adjudikation für `0d21097c…` wird gegebenenfalls separat versioniert. Die drei Splitfälle bleiben bis zur begründeten Strukturentscheidung offen; keine Qualitätsgrenze und kein geschütztes M6-/Physik-M7-Niveau darf zum Schließen dieser Fälle abgesenkt werden.
