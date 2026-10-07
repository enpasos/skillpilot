# Biologie Q1: sieben finale native Revieweingänge, Autor v1

Dieses Paket ist eine **inaktive technische Vorbereitung**. Es enthält keine
neuen unabhängigen D-, P-, A- oder M-Entscheidungen und wird nicht als M7-Abschluss
gezählt. Die bereits tatsächlich durchgeführte unabhängige Bildprüfung bleibt
an ihre unveränderten Bilder und Zieltexte gebunden. Menschliche Freigabe und
Erprobung bleiben offen und getrennt.

## Tatsächlich hergestellt

- Reale kanonische Kandidatendatei mit 472 Knoten und 390 curricularAtomic-Zielen,
  vollständig aus dem Komponentenkanon v6 übernommen; genau sieben zusätzliche
  primäre Bildlinks stammen aus den eingefrorenen nativen Bild-Helperausgaben.
- Vollständige aktuelle semantische Klassifikations- und Bild-QA-Eingänge,
  einschließlich sieben inaktiver V-Datensätze aus der unabhängigen Sichtprüfung.
  Der semantische Parserstatus ersetzt keine Atomaritätsentscheidung.
- Reale native Quellen-Atlasberechnung für 390 Ziele mit den unveränderten
  v7-Quellenkorrekturen und ausschließlich der gezielten MV-v8-Fortsetzung:
  dreimal physische Überschriftseite 4→17, gedruckte Seite null→13. Alle übrigen
  Quellenfelder sind identisch. Die kleinen technischen Eingangsdateien binden
  ihre tatsächlichen lokalen Quellenpfade; fachliche Mappingentscheidungen
  werden dadurch nicht verändert oder neu freigegeben.
- Reales natives BookModel mit 390 Seiten. Alle bisherigen **383 ganzen
  Seitenziele, Ziel- und Seitenfingerprints** sowie die **67 geschützten strikten
  Ziele** sind identisch. Alle 464 bisherigen kanonischen IDs bleiben erhalten;
  beim bisherigen Wurzelcluster ist allein der zusätzliche `contains`-Eintrag
  für den neuen Komponentencluster vorgesehen.
- Reales natives Subset mit sieben Seiten, passendem HTML und geprüftem PDF,
  nativen Render-Manifesten und echtem Reviewbundle. Das PDF hat sieben
  Lernzielseiten und zwei native Vorspannseiten, insgesamt neun physische Seiten.
  Es wurde kein vollständiges 390-Seiten-PDF gebaut.
- Zwei getrennte native, blind vorbereitete Beschreibungsreview-Kampagnen
  `round-a` und `round-b`. **Keine Ergebnisdatensätze oder Auflösungen** wurden
  vom technischen Autor erzeugt.
- Exakte native P-v2-Ziel-/Revieweingangsfingerprints für sieben Ziele, gebunden
  an die aktuellen DE/EN-Ziele, tatsächliche Bildbytes und **16 unveränderte
  vollständige Materialfälle**. Sieben positive Profile fehlen noch. Der
  unveränderte native P-Checker meldet deshalb korrekt `HOLD` mit sieben
  fehlenden Datensätzen; dies ist kein bestandener P-Gate.
- Vollständige vorhandene A-/M-/Karten- und Sichtbarkeitsbaselines als exakt
  gebundene Referenzen plus die sieben aktuellen nativen Seiten als offene
  Revieweingänge. Keine neue A-/M-Entscheidung oder Kartenfreigabe wurde erzeugt.

## Native Eingänge für unabhängige D-Reviews

Das Bundle-Fingerprint ist
`sha256:a7ba39569f7f810d46e6b13ecaa104ab765ceb378e26974f77416bd6f9c35d57`.
Das Sieben-Seiten-BookModel-Digest ist
`sha256:2eba1515e6344f5779d12e0457eef23566b55d731a47380213bb622af357df03`.
Beide Kampagnen binden denselben aktuellen Revieweingang
`sha256:3875cdc1f10dc8750ff088ec683a5db40349edbda17ba3433362166c9d22019f`.

- [Bundle](bundle/manifest.json), [sieben native Seiten](bundle/book-model.json),
  [tatsächliches PDF](bundle/book.pdf), [tatsächliches HTML](bundle/book.html).
- [Runde A](round-a/description-review-campaign.json) und deren
  [Eingang](round-a/description-review-input.json).
- [Runde B](round-b/description-review-campaign.json) und deren
  [Eingang](round-b/description-review-input.json).
- [P-v2-Eingänge](inputs/positive-review-inputs.native-fingerprints.pending.json)
  und [tatsächlicher P-Hold](qa-artifacts/native-positive-check.pending-profiles.actual.json).
- [A-/M-Eingänge](inputs/atomicity-memory-native-review-inputs.pending.json).
- [Erhaltung und Bildbindungen](qa-artifacts/native-input-and-preservation-verification.actual.json).

Ein unabhängiger Reviewer liest nur seine eigene Runde, deren gebundenes Bundle
und die hier gebundenen aktuellen fachlichen Quellen-/Materialeingänge. Die
Reviewkampagnen allein sind keine zwei Beschreibungsreviews.

## Isolation und Wiederverwendung

Alle Produktionshelper bleiben unverändert. Die native `repositoryRoot`-Option
des Book-Loaders liest eine kleine Eingangs-Wurzel unter
`tmp/biologie-q1-seven-final-native-review-inputs-author-v1/sparse-root` mit
Symlinks auf bestehende Dateien. Vorhandene und neue Bildbytes wurden nicht in
aktive Assetpfade kopiert. Der native Renderer erhält die tatsächliche isolierte
`native-helper-output/app/public`-Wurzel des vorhandenen Autorenbildpakets,
weil seine unveränderte reale Pfadprüfung nach außen führende Bild-Symlinks
korrekt zurückweist.

Die sieben PNGs werden weiterhin fachlich durch die unabhängige V-Freeze
`6320646059702bb78de426ea84a14238fc463a060b664e7e5e5639aa12d685cb`
belegt. Die Quellenkorrektur verändert keine dieser sieben Zieltexte oder
Bildbytes; es wurde keine Bildprüfung erneut durchgeführt oder behauptet.
Historische Autoren-/Reviewartefakte und verworfene Bildversuche bleiben exakt.

Der P-Checker/Materializer löst Bild-URLs derzeit fest gegen das aktive
Repository-`app/public` auf. Die sieben ausgewählten Bilder sind in diesem
Vorbereitungsstand dort absichtlich noch nicht integriert. Ein späterer
vollständiger P-Lauf braucht tatsächlich integrierte Assets oder einen regulär
unterstützten isolierten Eingang. Diese technische Vorbereitungslimitation ist
keine fehlende Nutzerautorisierung. Es wurde kein Sonderpfad im Checker eingebaut,
und `reviewedResourceTypes` bleibt `goal-visualization`.

Der aktuelle AGENTS-Hash und das sachfremde Gemini-Policy-Delta aus dem externen
Commit `fbc4e2bc5` sind gesondert dokumentiert. Alte AGENTS-Bindungen werden weder
als aktuell behauptet noch durch neue Hashes in historischen Freeze ersetzt.

## Offene Gates und Fortschritt

Vor Integration bleiben erforderlich: zwei unabhängige aktuelle D-Reviews mit
aufgelösten Befunden; echte sieben positive P-v2-Kandidaten und deren unabhängige
fachliche Qualitätssicherung; native A-/M-Entscheidungen und gegebenenfalls
Kartenprüfungen; geprüfte vollständige GUI-Sichtbarkeitssupersets; abschließende
aktuelle D/P/A/M/V-/Quellen- und Layer-A-Bindungsprüfungen nach der Integration.
Die historische Whole-Source-Holds anderer bzw. breiter ursprünglicher Ziele
werden durch diese sieben Komponenten nicht geschlossen.

Aktive Quellen, kanonische Ziele, Bilder, Registry und In-flight-Ledger wurden
nicht geändert. Die 19 geschützten aktiven Eingänge sind vor und nach der
Vorbereitung byteidentisch. Fortschritt dieses Vorbereitungspakets:
**0 neue fachliche Abschlüsse, 0 wiederhergestellte aktive Bindungen,
0 strikter Nettozuwachs**. Chemie bleibt 112/378, Biologie 67/383; die geschützten
Mathematik-M7- und Physik-M7-Grenzen bleiben erhalten. Menschliche Release-Gates
sind offen; keine Veröffentlichung, kein Deployment, kein Commit oder Push.

Der Paket-Freeze versiegelt auch die offenen Gates. Änderungen nach diesem
Zwischenstand erfolgen in einem neuen Fortsetzungspaket.
