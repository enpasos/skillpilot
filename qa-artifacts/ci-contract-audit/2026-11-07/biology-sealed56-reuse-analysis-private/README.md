# Biologie: endlicher Wiederverwendungsweg für 56 vorhandene V-Originalkontexte

Private Analyse vom 7. November 2026, **keine Qualifikation oder Aktivierung**.
Empfohlen wird ein einzelner geschlossener Reader für **Human20 + Flora19 + HE17**.
Das ist der größte in diesem Vergleich bestätigte gemeinsame Aufbau der erhaltenen
Biologie-Originalfamilien. Unter den Einzelpaketen sind Human20 und Ecology20 mit
je 20 die größten; Ecology20 besitzt eine andere Reviewhülle und wird hier nicht
mit einem beliebigen Feldmapping hinzugenommen.

Der konkrete nächste Implementierungsbatch umfasst **56 zusätzliche mögliche
V-Receipts**, nicht 355 pauschale Census-Passes. Wenn spätere echte Qualifikation
und gewöhnliche Integration alle 56 bestätigen, würde der gemeldete Stand
132/2483 auf 188/2483 steigen, mit Biologie 56/397. Dies ist eine bedingte
Auswirkungsrechnung, kein hier ausgeführter oder erfolgreicher nativer Lauf.

Die vollständigen **56 Ziel-IDs, vier Originaltextfelder, demandLevel, jeweilige
Originalpfade und SHA-256, Zeitangaben, Reviewer, Einzelbegründungen und aktuelle
Assetkopien** stehen in [analysis.json](analysis.json), insbesondere `families`
und `selectedRows`. Das Paket kopiert keine Bilder oder alten Reviewdateien.
[inspect_originals.py](inspect_originals.py) reproduziert ausschließlich den
lesenden Byte-/Inhaltsabgleich und schreibt die Analyse in diesen neuen Ordner.
Es importiert keinen Qualifier und führt weder Git noch native Checks aus.

| Endliche Familie | Ursprüngliche Entscheidungen | Jetzt in diesem Batch | Originale Attribution | Originaler Entscheidungsdatensatz `recordedAt` |
| --- | ---: | ---: | --- | --- |
| Human20 | 20 KEEP/PASS | 20 | `/root/flora_fauna_independent_a` | `2026-10-07T21:26:35.424845+00:00` |
| Flora20 | 20 KEEP/PASS | 19 | `/root/flora_fauna_independent_a` | `2026-10-07T22:22:46.889600+00:00` |
| HE18 | 18 KEEP/PASS | 17 | `/root/chemistry_open_packets` | `2026-10-07T23:41:40.153993+00:00` |

Die Originaldateien liefern jeweils individuelle fachliche Sichtbegründungen:
etwa getrennte aktive/passive Immunisierung und gerichteten Gasaustausch bei
Human20, die tatsächlich korrigierte Leserichtung des Bestimmungsbuchs sowie
Wahlbeispielgrenzen bei Flora20, und AB0-Bindungsmodell, negative hormonelle
Rückkopplung sowie Chromosomen-/Chromatidunterscheidung bei HE18. Das sind
inhaltliche Originalentscheidungen, keine aus heutigen QA-Notizen erzeugten
Rekonstruktionen. Diese Analyse hat keine Bilder neu betrachtet oder freigegeben.

Für alle 56 stimmen die **ganzen original gebundenen kanonischen Kandidatenziele**
heute überein, einschließlich DE/EN, `dimensionTags`, `requires`, `applicability`,
Quellenzuordnung und `resourceLinks` samt Alttext. Die ersten Census-Wortlautdateien
für Flora und HE besitzen noch keine Bildlinks; deren Ergänzung ist separat im
damals versiegelten finalen kanonischen Kandidaten gebunden. Deshalb wird die
Gleichheit nicht fälschlich aus einem heutigen Ledger ergänzt. Die 112 aktuellen
Public-/Canonical-Bilddateien sind bytegleich zum jeweiligen tatsächlich
beurteilten Original. Die historischen 112 Chromium-Ansichten haben die echten
PNG-Breiten 360/680; 56 vollständige Buchseiten-Captures und die drei PDFs sind
vorhanden und stimmen mit ihren ursprünglichen Bindungen überein. Die alten
BookModels binden pro Ziel Titel, Beschreibung, Alttext und den Originalbildhash;
ihre Seitennummern stimmen mit den originalen Captureverweisen überein.

387 unterschiedliche Dateien wurden im abschließenden lesenden Lauf gehasht.
Der aktuelle kanonische Biologie-Pin ist
`9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79`,
der aktive QA-Pin
`fc5540c93a737e722bc40e61e0802766fa90c309747b8753fe444cfd45ae1dcf`.
Der aktive 132er-Index ist bytegleich zu
`441b710b8965f529c231f046bbde6ade4be17d2c0bd4a43baf46829ee0287803`.
Der Arbeits-Head `96b770b2` stammt aus dem Auftrag; Git wurde nicht erneut
abgefragt. Ebenso sind die historischen `gitCommit`-Locators `6fe35a6…` aus
dem abgeschlossenen Census erhalten, in diesem Paket aber **nicht neu durch
Git-/Rohobjektauthentisierung qualifiziert**.

Die drei Familien teilen exakt die entscheidenden Recordfelder
`machineCandidateDecision`, `scientificAndVisualVerdict`,
`actualObservedFullRaster`, `actualObservedChromiumCaptures`,
`actualObservedNativePdfPage`, `substantiveActualObservationsDe`,
`nativePageObservation`, `imageAndAltCorrespond`, `humanApproval` und
`deviceAcceptanceClaim`. Jede Hülle besitzt `schemaVersion=1`, `actualAgent`,
`recordedAt`, `records`, `findings=[]`, `keep`, `hold=0`, `reject=0` und
explizite Sichtzählungen. Die wenigen Formatvarianten sind abschließend benennbar:

| Stelle | Human/Flora | HE18 |
| --- | --- | --- |
| Erstseal zum Autorinput | `exactAuthorInputSeal` | `authorInput` |
| Native Capture | `actualObservedNativePdfPage.capture` | direkter `path/sha256` im selben Feld |
| PDF | im nativen Seitenrecord gebunden | im erstversiegelten Autorinput gebunden |
| Unabhängigkeitsflag | `peerReviewReadBeforeThisFirstSeal=false` | `peerFinalBReadBeforeSeal=false` |
| Wortlaut | kanonischer Kandidat, bei Flora zusätzlich unveränderter DE/EN-Zieleingang | kanonischer Kandidat plus eigener versiegelter ganzer Zieleingang |

Die drei `artifactKind`-Werte und alle festen Pfade stehen in `families`.
HE7, Ecology20, Bio8, Evolution18 und weitere Census-Familien haben andere
Recordfelder, Actor-/Zeitformen oder Eingabeverknüpfungen. Sie sind sinnvolle
Folgebatches, aber keine stillen Varianten dieses endlichen Readers.

Der minimale Implementierungsweg verwendet den vorhandenen
`createVisualizationContextVerifier`, die Authentisierung der Originalbytes,
den geschlossenen Receipt-Schema-Vertrag, den heutigen Kontextvergleich und den
Abgleich beider aktiver Assetkopien weiter. Ein einziger neuer Profilwert,
beispielsweise `biology-sealed-native-three-families-v1`, bekommt einen kleinen
Reader mit einer unveränderlichen Liste genau dieser drei Familien und 56 IDs.
Die alten Math-/Econ-Profile dürfen nicht durch andere Ownerwerte zweckentfremdet
werden. Der neue Reader hat den festen Owner
`08a43a1b-d97e-522c-9dfa-c950a493364e`, das Fach `biologie` und den festen
kanonischen Biologie-Quellpfad.

Die neue Qualifikationshülle kann das bestehende Schema verwenden:
`originalReview` ist die originale Batch-V-Datei, `originalInput` der feste
unabhängige Erstseal, `reviewedAsset` das darin tatsächlich betrachtete Original.
Der Reader authentisiert Erstseal → Autorseal → finalen kanonischen Kandidaten,
zusätzlich die originalen Wortlaut-/BookModel-/Breiten-/PDF-/Seitenverweise.
Er selektiert exakt einen Record mit der Ziel-ID aus der festen Familie; die
bisherige Top-Level-`review.goalId`-Annahme benötigt dafür einen expliziten
geschlossenen Batchzweig. Er übernimmt die **tatsächlichen** vier Textfelder,
`dimensionTags.demandLevel`, Bildhash, Entscheidung, `actualAgent`, `recordedAt`
und individuelle Begründung. Eine heute geschriebene `qualification` beschreibt
nur diese heutige technische Fortgeltungsprüfung. Sie ist kein neues historisches
Reviewdatum und kein neuer fachlicher Sichtentscheid.

Die vorhandenen Economics-Q3/Q2-Reader liefern das Muster für feste
Familienpfade, Actor-/Verdict-Prüfung und originale Breitenartefakte; Math58 zeigt
bereits den geschlossenen Umgang mit Batchreviews. Es braucht keine neue
allgemeine Importengine, keine konfigurablen JSON-Feldpfade und kein universelles
Receiptformat. Der externe Index und das authentisierte Originalpaket werden
erst in einer späteren echten Integration um genau die tatsächlich qualifizierten
Receipts ergänzt. Die bestehende endliche Autorität bleibt maßgeblich; dieses
Analyse-JSON darf niemals als Bereitschaftsindex geladen werden.

Die normative Grenze folgt
`docs/dev/ci-graph-repairs/visualization-reviewed-context-binding-plan-2026-11-06.md:5-7`
und `qualification.schema.json`: zwingend sind Owner/Ziel/Fach, wirklich
begutachteter DE-Titel und DE-Beschreibung, exakte Bildbytes sowie ursprünglicher
Verdict/Actor/Zeit/Grund und Originaleingänge. EN und Darstellungsniveau werden
hier nicht weggelassen, weil beide tatsächlich vorliegen. Ganze Goalgleichheit
ist eine zusätzliche jetzt belegte Tatsache, kein universeller Ersatz für die
V-Kontextsemantik. Die alten Seiten-/Scopebelege werden erhalten; daraus folgt
keine neue Freigabe heutiger ganzer Buchseiten, Länderabdeckung, P-Profile,
Lernendenleistung oder Human-/Device-Abnahme. Keine fehlende EN-, Zeit- oder
Mobilsichtung muss für diesen Batch erfunden werden.

Flora benötigt einen kleinen ausdrücklich fest verdrahteten Retentionszweig:
neun Originalraster wurden bereits um `2026-10-07T21:47:05.935778+00:00` mit
KEEP beurteilt, damals waren 360/680 und Buchseiten **offen**. Diese originale
Datei und ihre portable Versiegelung sind erhalten; neun Asset-/Ziel-/Actorbindungen
stimmen. Der spätere originale Finalreview um 22:22 enthält die echten 360/680-
und Buchseitenurteile. Es darf weder neun neue Vollrastersichtungen um 22:22
behauptet noch die vorher offene Mobilprüfung verschwiegen werden. Für
`5f39afac-897c-5ed3-95b5-89ccf66b2532` bleibt der ursprüngliche V1-HOLD bestehen;
die im Erstseal gebundene gezielte V2-Auflösung und tatsächliche spätere
V2-Sichtung rechtfertigen den positiven aktuellen Kontext.

Zwei konkrete Holds bleiben außerhalb der 56:

- `321ea315-37fe-5f9e-8fa8-dd631bb447c7` (Entwicklung und Vergleich): der
  hier beurteilte V2-Hash `ead167064da58d5000b86cac7c7b0ff5344ad46ea4b4fc0dd9736effb2e97586`
  ist nicht der aktuelle Hash `5b213d0416a38e01cf1368b36186f907cf0a77711411e78cea22cca9a29584a5`.
  Keine Übernahme der alten Bildentscheidung auf die Nachfolgebytes.
- `1b7f08a1-33df-5779-af66-430c91d699b7` (Grundbegriffe der Gentechnik):
  aktuelles Bild und DE-Text stimmen, der tatsächlich vorhandene ursprüngliche
  EN-Titel/-Text spricht von Biotechnology und unterscheidet sich vom heutigen
  Gene-Technology-Text. EN darf zur Rettung dieses Falls nicht aus dem Profil
  entfernt werden. Der alte HE18-Ausschluss des Splitziels
  `3ee4b55c-81c3-5826-9d26-1a8c22cbd0b8` bleibt ebenfalls außerhalb der Familie.

Die alten Erstseals nennen zunächst ausstehende **native D/P-Schemaprüfungen**.
Die erhaltenen späteren `completed-native-D20-P20…` bzw.
`completed-native-D18-P18-V18…`-Originale bestätigen ihre damaligen begrenzten
D/P-Prüfungen und behalten die V-Entscheidungen bei. Sie lassen die gewöhnliche
öffentliche P-CLI bis zur damaligen Integration offen. Das ist kein negativer
V-Sichtentscheid und kein Grund, die nachweislich erfolgten V-Sichtungen neu zu
erfinden. Umgekehrt ersetzt ein heutiger D/P/A/M-Producerpass keinen fehlenden
V-Originalteil. Der vorgeschlagene Reader qualifiziert ausschließlich die hier
nachgewiesene V-Kontextkette; die heutige gewöhnliche D/P/A/M/M7-Verbraucherkette
bleibt getrennt erforderlich.

Offen bleiben die endliche Readerimplementierung, ihre unabhängige Prüfung,
die echte Authentisierung/Qualifikation im bestehenden Kern und die spätere
gewöhnliche Integration. Diese Analyse erzeugt **0 native Receipts, 0 neue
Sichturteile, 0 aktive Änderungen und keinen CI-/M7-Pass**. Git, DB, Deployment,
Subagenten und SourceA-Probes wurden nicht ausgeführt.
