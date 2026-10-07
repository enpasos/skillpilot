# Chemie 25: finaler inerter Autorenstand v2

Dieser Stand ist ein **Autorenkandidat für zwei unabhängige D/P-Prüfungen**.
Er wurde vom jetzt aktuellen Kanon mit 479 Zielen und SHA
`4f3e7abaf7233c36b6e36a09ad2e03f1335dcb6d7fed6c1e7ec99fcca73751a6`
abgeleitet. Die aktive Landschaft, QA-Dateien, Register, SourceAtlas,
Memory-Sichten und Git wurden hier nicht geändert.

## Neutraler Eingang für Reviewer

- `exact-current25-final-native-d-p-review-input-routing.author.json`: konkrete
  native Kampagnen, Eingänge, HTML/PDFs, Prüfkommandos und tatsächlicher Mirror.
- `actual-final-current25-whole-native-review-inputs.author.raw.json`: alle
  25 ganzen aktuellen DE/EN-Ziele, kanonischen Kontexte, tatsächlichen nativen
  Seiten, Primärquellenbindungen, Raster und vollständigen DE/EN-Fälle.
- `native-d-twenty/bundle/` und `native-d-five/bundle/`: tatsächliche native
  HTML/PDFs, Modelle, Bundle- und Render-Manifeste, jeweils A/B-Kampagnen in
  den danebenliegenden `round-a/` und `round-b/`-Verzeichnissen.
- `positive-evidence.twenty-five.final-native-author-candidates.review.jsonl`,
  zugehörige `.config.json`, `twenty-five-positive-profile-specifications.author-candidates.json`
  und `fifty-complete-materials.de-en.author-candidates.json`: 25 P-Kandidaten
  und 50 vollständige bereitgestellte Referenzfälle. Es handelt sich um keine
  durchgeführten Lernendenexperimente und keine Aufgabenquote.
- `actual-current25-primary-scope-and-boundaries.author.json` bindet die
  begrenzten amtlichen Absätze und originalen HTTPS-/PDF-Rasterbelege.
  BY-C8 wird ausdrücklich als **Chemie 8 (NTG)** geführt.

`targeted-root-findings-and-two-author-remediations.actual.json` dokumentiert
separat den Autorenauftrag und dessen Herkunft. Dieser Befund-/Antwortpfad
und `preexisting-unsealed-draft-history/` gehören nicht zum neutralen neuen
Science-Eingang für einen blinden Reviewer. Neue Peer-D/P-Verdikte liegen in
keinem Eingang dieser Autorenstufe vor.

## Exakte Änderung und fachliche Grenzen

Sieben resourceLinks verwenden die bereits separat unabhängig mit A/B KEEP
geprüften finalen PNGs. Drei gute neue Raster werden aus ihren unveränderten
historischen A/B-Prüfungen weitergetragen; die vier gezielt korrigierten
Raster binden ihre tatsächlichen v2-A/B-Prüfungen. Die weitere operative
Vorbereitung ist separat versiegelt. Alte menschliche Flags der früheren
JPGs wurden archiviert und nicht auf neue PNGs übertragen.

Nur 3bc erhält im EN-Zielsatz zusätzlich die im unveränderten DE-Text schon
enthaltene Elektronenverteilung in Atomen und Atom-Ionen. Damit ändern sich
acht ganze Zielobjekte; alle übrigen 471 bleiben vollständig gleich.

Nur zwei P-Profile und ihre jeweils bestehenden case-2-Fälle sind fachlich
gezielt erweitert:

- **3bc:** Aus den gegebenen Quantenzahlen und zwei Spins werden die
  Kapazitäten 2/6/10/14 begründet; die gegebenen neutralen Zr-/Nd-Konfigurationen
  werden zu d/f, Perioden und Haupt-/Nebengruppen beziehungsweise
  Lanthanoid-/Actinoidreihen eingeordnet. Ausnahmslose Aufbau-Mnemonik,
  Serienmitgliederzahl und Gruppenrandkonventionen werden nicht behauptet.
- **e675:** Eine reine unbekannte Sauerstoff-Elementgasprobe wird aus dem
  gegebenen Dichteverhältnis zum einatomigen Helium bei gleichen T/p zu O2
  bestimmt. Die Molekülformel ist keine vorgegebene Dateneingabe; die
  vorhandenen binären CO/CO2-Leistungen bleiben erhalten.

23 ganze Profil-Einträge bleiben exakt zu V1. Deren 46 Fälle und die beiden
unveränderten case-1-Fälle der geänderten Familien ergeben **48 exakte Fälle
von 50**. NIST-Referenzen für Zr/Nd und beide amtlichen Lehrplanausschnitte
wurden vom Autor zusätzlich tatsächlich gegengelesen und als originale
HTTPS-Antworten sowie Textderivate gebunden. Das ersetzt keine unabhängige
wissenschaftliche Prüfung dieser beiden Ergänzungen.

## Tatsächliche native Ergebnisse

Unveränderte Produktionshelper wurden als 467 exakte TS-Kopien in einem
begrenzten temporären Repository verwendet. Der tatsächliche Renderer erhält
alle 25 betroffenen Bilder als physische Kopien innerhalb seines Public-Root:
sieben final ausgewählte PNGs und 18 unveränderte ursprüngliche JPGs.

Native prepare/check: **PASS20 und PASS5**. Die beiden PDFs umfassen 22 und
7 physische Seiten. Beide vollständigen aktuellen/finalen Modelle enthalten
378 Seiten mit identischen IDs, Reihenfolgen, Kapiteln und Navigation.
Genau acht Seiten und D-Kontexte ändern sich; alle anderen 370 bleiben als
ganze Seiten und native Eingangsobjekte gleich. Alle 127 geschützten aktuellen
Ziele, Seiten, Kontexte und Raster bleiben gegenüber der post-BW-Basis exakt.
Die korrekten, größenbegrenzten nativen Druckderivate werden separat mit ihren
Originalraster-SHAs geführt.

P-Materializer, geschlossene Schemas, vollständiger nativer P-Checker und
P-CLI: **PASS25**, 0 Blocker. Status aller 25 Records:
`needs_human_review`, Autorität `ai_candidate`, E1/G1, keine ReviewRun-IDs.
Tatsächliche P-Fingerprints: ein GoalFP-Wechsel (3bc), acht InputFP-Wechsel
(sieben Bilder plus 3bc), zwei ProfileFP-Wechsel (3bc/e675). ProfileFP und
InputFP sind gemäß unverändertem Produktionsvertrag getrennt. Alle neu
materialisierten Records tragen ausdrücklich neue Autorenmetadaten; es wird
keine Ganzrecord-Gleichheit mit historischen V1-Records behauptet. Bei 16
Records ist der gesamte Payload nach Herausnahme genau dieser drei
Autorenfelder (`reviewId`, `reviewedAt`, `reviewer`) tatsächlich gleich.

Die eigene Kandidaten-Kinddatei bindet den inerten Kanonpfad und den tatsächlichen
neuen 3bc-SourceFP. 478 ganze aktuelle Decisions bleiben gleich; sämtliche
479 Klassifikationen, Begründungen und Counts werden erhalten. Das ist eine
technische Bindung und keine neue Kind-Fachprüfung.

## Verbleibende HOLDs und Geschichte

**Konkreter Nano-Locator-HOLD bleibt offen:** Das aktuelle 5e2-Ziel hat in
`extendedData.provenance.sourceRef` weiterhin BW 3.2.1.1(7), S.13. Der tatsächlich
gebundene Absatz steht physisch16/gedruckt14. Diese Metadaten waren außerhalb
der vorausgehenden BW21-Korrektur an 3.2.1.2 und wurden hier nicht geändert.
Der zusätzliche Größenordnungsabsatz 3.2.1.2(4) liegt physisch18/gedruckt16.
Eine spätere enge Metadatenkorrektur erfordert eine gezielte aktuelle
Quell-/Kind-/operative Bindungsprüfung. Dafür ist keine erneute historische
Fachprüfung nötig.

Alle weitergehenden nationalen SourceAtlas-, Operator-, Mapping-, Kind-,
GK/LK-, 403/413-/40-Sichten-/Superset-HOLDs bleiben getrennt offen. Aus diesem
Paket entsteht keine vollständige Landesquellen- oder Superset-Freigabe.

Der V1-Freeze und alle 145 eigenen V1-Dateien sind unverändert. Die ursprüngliche
unversiegelte v2-Vorbereitung ist in `preexisting-unsealed-draft-history/`
erhalten. Eigene abgewiesene native Vorläufe und die Ursachen ihrer
Autoren-/Isolationsfehler sind ausdrücklich dokumentiert. Kein Schema,
Produktionshelper oder Validator wurde gelockert.

**Keine neue unabhängige D/P-Freigabe, kein aktiver Bindungsabschluss,
kein strenger Nettozuwachs, keine menschliche Freigabe oder Erprobung.**
