# Verfahrensreview: tiefes Verständnis in Mathematik und Physik

Stand: 2. September 2026

## Ergebnis

Das am 29. August 2026 gesetzte Verfahrens-Gate ist mit den nachfolgenden
Entscheidungen und drei unmittelbar umgesetzten Härtungen geschlossen. Die
fachliche Bearbeitung darf fortgesetzt werden. Umgesetzt wurden ein
persistenter In-flight-Ledger, die präzisierte Resolution-Dokumentation und
atomisches Schreiben der Evidence-Review-JSONL.
Fortschritt wird weiterhin erst angerechnet, wenn ein Ziel gleichzeitig eine
aktuelle Zwei-Runden-Resolution, ein gültiges
`positive-understanding-evidence-v2`-Profil sowie aktuelle Atomicity-, Memory-
und Visualisierungsnachweise besitzt.

Der verifizierte Ausgangsstand ist:

- Mathematik: 145 von 792 Zielen, also 18,3 Prozent; 647 offen.
- Physik: 178 von 461 Zielen, also 38,6 Prozent; 283 offen.
- zentrale Blocker: 0.
- geschützte M6-Floors: bestanden.

Die Nenner werden bei jedem Check aus den aktuellen Semantic-Kind-Ledgern
ermittelt. Historische Nenner wie 780 oder 426 dürfen nicht weiterverwendet
werden. `ec6447d1-97da-5b77-94ae-4973b43f094e` bleibt als ausdrücklicher
Mathematik-Re-Review-Fall in der offenen Arbeit erhalten.

## 1. Coverage und Wiederholungsfreiheit

Die zentrale Deep-Understanding-Konfiguration und der daraus erzeugte strenge
Report bilden den persistenten Abschluss-Ledger. Jeder vorbereitete, aber noch
nicht zentral registrierte Batch wird zusätzlich über seine hashgebundene
Batch-Konfiguration im maschinell validierten
`in-flight-work-ledger.json` beansprucht. Der Selektor lädt diesen Ledger
standardmäßig und schließt die aktiven IDs automatisch aus.

Vor jeder weiteren Auswahl gilt deshalb:

1. den zentralen strengen Report ausführen,
2. den In-flight-Ledger fail-closed laden und alle referenzierten
   Batch-Konfigurationen validieren,
3. optionale weitere Kurzzeitausschlüsse mit `--exclude-config` übergeben,
4. die ausgewählten IDs gegen abgeschlossene, offene Sonderfälle und aktive
   Batches prüfen.

Es wird je Fach höchstens ein neuer Batch gleichzeitig ausgewählt, solange
dieser Abgleich nicht automatisiert ist. Beim Aufsetzen dieses Verfahrens war
der bereits vorbereitete Mathematik-Batch B021 der einzige In-flight-Batch.
Seine Vorbereitung gewährte keinen Fortschritt und die Reviewarbeit begann erst
nach Abschluss dieses Verfahrensreviews. Der aktuelle In-flight-Stand ist im
Abschnitt „Commit-fähiger Zwischenstopp nach B029/B031“ dokumentiert.

## 2. Nachweisbar unabhängige Reviewrunden

Runde A und Runde B erhalten ausschließlich ihr jeweiliges, hashgebundenes
Input-Paket mit Prompt, Fachkriterien und Schema. Sie erhalten weder die
Ausgabe der anderen Runde noch Synthese, historische Entscheidungen oder
Evidence-Profile.

Operativ werden beide Runden mit getrennten Reviewern gestartet. Die Reviewer
schreiben während der Blindphase keine Ergebnisse in gemeinsam lesbare
Resultatpfade, sondern liefern sie erst dem Integrator. Erst wenn beide Runden
abgeschlossen sind, materialisiert der Integrator die disjunkten A- und
B-Ergebnisse. Unterschiedliche Campaign-, Round-, Independence-, Run- und
Record-IDs sowie `blindToOtherRuns: true` bleiben maschinell verpflichtend.

Eine Runde, die den Output der anderen Runde lesen konnte oder deren
Input-Fingerprint nicht mehr aktuell ist, wird verworfen und neu ausgeführt.

## 3. `KEEP` und revidierte Ziele

- `keep` plus `keep`: Die kanonischen Texte bleiben unverändert. Nach zentraler
  Synthese darf unmittelbar das goal-spezifische Evidence-v2-Profil erstellt
  werden.
- Mindestens ein `revise`: Eine Änderung darf nur die bereits beanspruchte
  Kompetenz klarer und prüfbarer formulieren. Nach jeder kanonischen Änderung
  werden neue Input-Fingerprints erzeugt und beide Blindrunden auf den neuen
  Bytes vollständig wiederholt. Die erste Doppelprüfung zählt nicht als
  Abschluss.
- `split_review`: Keine stille Textreparatur. Atomizität, IDs, Kanten,
  Projektionen und Folgeartefakte werden gesondert geklärt.
- `block`: Autoritative Quelle oder fachliche Gültigkeit wird geklärt, bevor
  weiter materialisiert wird.

## 4. Evidence-Kosten, Batchgröße und Parallelisierung

Batchgrößen werden risikobasiert bestimmt, nicht künstlich auf 20 aufgefüllt:

- bis 20 Ziele nur bei fachlich kohärentem Phase-/Area-Block und überwiegend
  stabilen Formulierungen,
- 3 bis 8 Ziele bei fehlender Area-Metadaten, heterogenen Themen, erwartbaren
  Revisionen oder anspruchsvollen Transferprofilen,
- Einzelziel bei einem Re-Review, Grenzfall oder am Ende eines kohärenten
  Blocks.

Evidence-v2 wird erst nach stabiler finaler Beschreibung erstellt. Damit wird
kein Profil für Texte geschrieben, die anschließend erneut invalidiert
werden. Mit vier verfügbaren Agent-Slots bleiben höchstens drei Reviewer neben
dem Integrator parallel aktiv. Vorrang hat die gleichzeitige A/B-Prüfung eines
Fachs; ein dritter Reviewer kann bereits die erste Runde des nächsten Fachs
bearbeiten, ohne dessen Ergebnis zu veröffentlichen.

Der damalige Mathematik-Batch B021 blieb deshalb ein Einzelfall. Für den ersten
Physiklauf wurde der vom Selektor angebotene heterogene 20er-Block zunächst auf
die ersten drei fachlich zusammenhängenden Mechanikziele begrenzt; erst danach
wurde die nächste kohärente Gruppe gewählt. Der aktuelle In-flight-Stand ist im
Abschnitt „Commit-fähiger Zwischenstopp nach B029/B031“ dokumentiert.

## 5. Frühe und teure Gates

Günstige Gates laufen unmittelbar nach der jeweiligen Stufe:

- nach Vorbereitung: Batch-`check`,
- nach jeder Blindrunde: Campaign-Validator,
- nach beiden Runden: Summary-, Synthesis- und Resolution-Validator,
- nach Evidence-Authoring: Materializer einmal mit und einmal ohne `--write`
  sowie der Candidate-Test,
- nach zentraler Registrierung: strenger Deep-Understanding-Report.

Teure, fachübergreifende Gates laufen an einem stabilen Batch-Checkpoint. Dazu
gehören Curriculum-Status, Maturity-Floors, Lernzielbuch-/Publikationsprüfung
und der OpenAI-Review-Freeze. Wenn kanonische Texte, Ziele oder Kanten geändert
wurden, laufen zusätzlich alle davon betroffenen Layer-A-Lanes sofort; reine
Review-/Profilbatches ohne kanonische Änderung benötigen diese Vollprüfung erst
am Checkpoint.

## 6. Crash-Sicherheit und deterministische Wiederaufnahme

- Batch-Konfiguration, Eingaben und Manifest-Fingerprints bleiben unverändert.
- Generierte Artefakte werden nicht von Hand korrigiert; Materializer werden
  nach einem Schreibdurchlauf nochmals im reinen Prüfmodus ausgeführt.
- Bei Abbruch bleiben vollständige In-flight-Artefakte erhalten und werden über
  dieselbe Konfiguration wiederaufgenommen.
- Teilresultate verleihen keinen Fortschritt und werden nicht in den zentralen
  Rollout aufgenommen.
- Vor Integration werden `git diff`, unerwartete Residuen und doppelte IDs
  geprüft; der zentrale Integrator allein ändert die Rollout-Indizes.

## 7. Qualitätssamples und Eskalation

Der Integrator prüft jedes Ziel gegen Titel, beide Sprachfassungen, Kontext,
Voraussetzungen, Atomizität und gebundene Visualisierung. Bei größeren Batches
wird zusätzlich mindestens der erste, mittlere und letzte Datensatz vollständig
gegen die Rohartefakte gelesen. Revisionsfälle werden immer vollständig
geprüft, nicht nur stichprobenartig.

Autonom entschieden werden klare `keep`-Fälle und kleine, lokal begrenzte
Präzisierungen. Bei fachlichem Dissens wird zunächst ein dritter unabhängiger
Fachreview eingeholt. An den Product Owner werden nur danach verbleibende echte
Grenzfälle eskaliert:

- strittige fachliche Aussage oder autoritative Quelle,
- notwendiger Split oder Änderung von IDs/Kanten/Projektion,
- nicht auflösbarer Widerspruch der beiden Reviewrunden,
- nicht äquivalente deutsche und englische Kompetenz,
- eine Änderung, die Produkt-, Datenschutz- oder Freeze-Semantik berührt.

## 8. Visualisierungen

Die Beschreibungs- und Evidence-Arbeit ersetzt keine Bilder vorsorglich. Eine
gebundene Visualisierung wird nur geändert, wenn sie die fachliche Aussage oder
Prüfbarkeit tatsächlich beeinträchtigt. Für neue oder zu ersetzende Rasterbilder
gilt Nano Banana Pro als erster Weg. Repository-native SVGs oder andere
Eigenbilder sind nur ein dokumentierter Fallback, wenn Nano Banana Pro die
benötigte fachliche Präzision trotz gezielter Korrektur nicht erreicht. Eine
inhaltlich veränderte Visualisierung erzwingt eine neue fachliche Prüfung der
gebundenen Evidence; ein rein mechanischer Fingerprint-Rebind ist dann nicht
zulässig.

## Verbindlicher Ablauf je Batch

1. aktuellen strengen Report und In-flight-Ausschlüsse prüfen,
2. kohärent und risikobasiert auswählen,
3. deterministisch vorbereiten und prüfen,
4. zwei isolierte Blindrunden ausführen und einzeln validieren,
5. Differenzen synthetisieren und Entscheidung materialisieren,
6. nur echte Schwächen ändern; nach Textänderung beide Runden wiederholen,
7. individuelles Evidence-v2-Profil erstellen und validieren,
8. Resolution und Profil gemeinsam zentral registrieren,
9. strengen Fortschritt und geschützte Floors prüfen,
10. erst dann den neuen Prozentstand berichten.

## Commit-fähiger Zwischenstopp nach B029/B031

Die fachliche Ausweitung ist an dieser Stelle bewusst angehalten. Es werden
keine weiteren Ziele ausgewählt und insbesondere keine begonnenen Rechecks als
Fortschritt angerechnet. Der zuletzt streng geprüfte Stand lautet:

- Mathematik: 167 von 793 Zielen, also 21,1 Prozent; 626 offen.
- Physik: 203 von 461 Zielen, also 44,0 Prozent; 258 offen.
- zentrale Blocker: 0.

Die laufenden Ziele bleiben über genau diese beiden Konfigurationen im
In-flight-Ledger gegen eine erneute Auswahl geschützt:

- Mathematik B029:
  `batch-029-j8-interest-spreadsheet-parameters-3-v1.config.json`
- Physik B031:
  `batch-031-q2-oscillations-and-waves-15-v1.config.json`

Die Originalbatches bleiben absichtlich aktiv. Zusätzliche, überlappende
Recheck-Konfigurationen werden nicht in den Ledger aufgenommen, weil der
Validator doppelte aktive Zielansprüche ablehnt. Sämtliche drei B029- und
fünfzehn B031-Ziele bleiben bis zu ihrer vollständigen Resolution, ihrem
aktuellen Evidence-v2-Nachweis und der zentralen Registrierung außerhalb der
Fortschrittszählung.

### Exakter Wiedereinstieg Mathematik B029

1. `1842da92-ca2c-5fed-a946-e6413a6285bb` besitzt bereits die stabile
   `keep`/`keep`-Carryover-Resolution.
2. Die revidierte Laufzeitbeschreibung
   `fc34449a-fbf4-574c-884f-ecdf48b42d2e` ist in B029r in beiden unabhängigen
   Runden mit `keep` bestätigt und vollständig synthetisiert. Es fehlen noch
   Evidence-v2 und die zentrale Registrierung.
3. Die revidierte Beschreibung zum regelmäßigen Tilgungsbetrag oder zur
   regelmäßigen Sparrate
   `f6574cdc-e29c-5a8f-a009-9f28b3bcf9be` ist mit der vorbereiteten
   Konfiguration
   `batch-029dr-j8-interest-payment-amount-final-recheck-1-v1.config.json`
   inzwischen in zwei frischen, voneinander isolierten Blindrunden geprüft.
   Beide Runden entscheiden `keep` und empfehlen ein neues Evidence-v2-Profil;
   Einzelbatch- und Campaign-Validierung sind grün. Beim Wiedereinstieg folgen
   Dual-Summary, Synthese, Resolution, Evidence-v2 und erst danach die gemeinsame
   zentrale Registrierung aller drei B029-Ziele.

### Exakter Wiedereinstieg Physik B031

1. Die drei ursprünglichen `keep`/`keep`-Fälle werden als stabile
   Carryover-Resolutionen materialisiert.
2. B031r besitzt für zehn revidierte Beschreibungen zwei aktuelle unabhängige
   Runden und eine gültige Dual-Summary. Sechs Beschreibungen sind auf
   Entscheidungsebene `keep`/`keep`; da sich die vollständigen Reviewrecords
   unterscheiden, weist die Summary für alle zehn Ziele `exactAgreement: 0`,
   `disagreement: 10` und `requiresSynthesis: 10` aus. Vier fachliche
   Präzisierungen bleiben offen: harmonisches Idealmodell gegenüber realer
   Schwingung, Dopplerwinkel, Randbedingungen stehender Wellen bei
   Musikinstrumenten sowie die Schmalband-/Dispersionsbedingung für
   Wellenpakete. Das idempotente B031-Adjudikationsskript prüft am Zwischenstopp
   weiterhin exakt den bereits materialisierten ersten Revisionsstand und ist
   im Check-Modus grün. Die fachlich vorbereiteten, aber bewusst noch **nicht**
   materialisierten Zweitfassungen lauten:

   - `d03f1cb6-c224-53db-ad91-76cc7827978d`:
     „Die lernende Person kann eine harmonische Schwingung als sinusförmiges
     periodisches Modell beschreiben und anhand eines t-s-Diagramms
     experimentell untersuchen, inwieweit die Bewegung eines Federpendels im
     linearen Bereich oder eines Fadenpendels bei kleinen Winkelauslenkungen
     diesem Modell entspricht.“ / “The learner can describe harmonic
     oscillation as a sinusoidal periodic model and use a displacement-time
     graph to investigate experimentally how closely the motion of a spring
     oscillator in its linear range or a simple pendulum at small angular
     displacements matches this model.”
   - `e7131fe3-1da6-5555-80ec-fb6bdf8fcc29`:
     „Die lernende Person kann erklären, wie die Frequenzverschiebung von an
     bewegten Blutbestandteilen gestreutem Ultraschall von deren
     Geschwindigkeitskomponente in Strahlrichtung abhängt, und daraus bei
     bekanntem Einschallwinkel die Strömungsgeschwindigkeit bestimmen.“ / “The
     learner can explain how the frequency shift of ultrasound scattered by
     moving blood components depends on their velocity component along the beam
     and use it to determine flow velocity when the insonation angle is known.”
   - `0d2a4690-d891-503b-96f4-42c2de48fd8b`:
     „Die lernende Person kann erklären, wie die Randbedingungen die möglichen
     stehenden Wellenmoden in Saiten und Luftsäulen festlegen und dadurch die
     möglichen Töne bestimmen, und den Zusammenhang zwischen Instrumentenlänge,
     möglichen Wellenlängen und Frequenzen qualitativ ableiten.“ / “The learner
     can explain how boundary conditions select the permitted standing-wave
     modes in strings and air columns and thereby determine the possible tones,
     and qualitatively derive the relationship between instrument length,
     permitted wavelengths, and frequencies.”
   - `1c430e0a-b63e-5729-8715-a96a5a68740f`:
     „Die lernende Person kann bei einem schmalbandigen Wellenpaket die
     Gruppengeschwindigkeit als Geschwindigkeit seiner Hüllkurve deuten und
     erklären, wie frequenzabhängige Ausbreitung (Dispersion) seine Form und
     Breite verändert.“ / “The learner can interpret group velocity as the
     velocity of a narrowband wave packet's envelope and explain how
     frequency-dependent propagation (dispersion) changes its shape and width.”

   Beim Wiedereinstieg werden diese vier Fassungen materialisiert, alle
   abhängigen Layer-A-Ledger aktualisiert und anschließend in einem neuen
   Vierer-Recheck wieder doppelt blind geprüft.
3. Für die zwei ursprünglichen Dissensfälle ist B031d vorbereitet. Runde B ist
   vollständig und validiert; Runde A fehlt. Eine strukturelle Aufspaltung wird
   nicht stillschweigend vorgenommen, sondern erst nach kompletter
   Doppelprüfung adjudiziert.
4. Anschließend werden für alle stabilen B031-Ziele Resolutionen und
   Evidence-v2-Profile gemeinsam zentral registriert.

Die B029/B031-Beschreibungsarbeit hat keine Visualisierungsbytes ersetzt. Im
Arbeitsbaum bereits vorhandene, früher fachlich veranlasste Bildkorrekturen
bleiben davon getrennt erhalten. Für neue oder erneut zu erzeugende
Rasterbilder bleibt Nano Banana Pro der bevorzugte Weg; Eigenbilder bleiben
ein begründeter Präzisions-Fallback.

Vor dem Commit wurden bzw. werden nach der letzten Synchronisation erneut
geprüft: Deep-Understanding-Report, Semantic Atomicity, Memory-Card-Review,
Visualisierungs-QA und -Coverage, Lernzielbuch-Publikation, Curriculum-Status
mit geschützten M6-Floors, Anwendung-Build, KI-Transparenzinventar,
Review-Freeze und `git diff --check`. Erst ein vollständig grüner Lauf macht
diesen Zwischenstand commit-fähig. Danach bleibt die Bearbeitung bis zur
ausdrücklichen Wiederaufnahme eingefroren.

### Abschließender Checkpoint-Nachweis

Der Checkpoint wurde am 2. September 2026 nach der letzten Änderung nochmals
ohne neue Zielauswahl geprüft:

- B029dr Runde A und B: je ein Record, Einzelbatch und Campaign gültig;
  beide Entscheidungen `keep`, beide Evidence-Empfehlungen `create`.
- strenger Deep-Understanding-Report: Mathematik 167/793 (21,1 Prozent),
  Physik 203/461 (44,0 Prozent), 0 blockierende Probleme.
- Graphvalidierung: 593 Landschaften; Composition-View-Validierung: 297 Views.
- Semantic Atomicity und alle zehn Memory-Card-Konfigurationen: grün;
  Mathematik und Physik verbleiben auf dem geschützten Reifegrad M6.
- Curriculum-Status einschließlich aller neun geschützten Maturity-Floors:
  grün. Der bekannte nicht blockierende CQR-303-Warnhinweis zur noch nicht
  vollständig human-freigegebenen Visualisierungslane bleibt dokumentiert.
- Visualisierungs-QA, Rollout-Coverage, QA-Parität und Assetprüfung: grün;
  1.526 gebundene Visualisierungslinks geprüft.
- vollständige Lernzielbuch-Pipeline, Produktions-Build und Lint: grün.
- KI-Transparenzinventar und Artefakttest, Dokumentationslinks und -indizes,
  Terminologie, Generated-Doc-Hinweise, OpenAI-Review-Freeze sowie
  `git diff --check`: grün.

Damit ist der Arbeitsbaum ein commit-fähiger, deterministisch fortsetzbarer
Zwischenstand. B029 und B031 bleiben im In-flight-Ledger und zählen bis zu
Resolution, Evidence-v2 und zentraler Registrierung ausdrücklich nicht zum
Fortschritt. Nach diesem Nachweis wird die fachliche Bearbeitung angehalten.
