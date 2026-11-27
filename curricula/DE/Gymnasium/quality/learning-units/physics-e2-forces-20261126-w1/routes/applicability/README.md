# Zwei einzeln begrenzte Aufgabenwarnungen

Die beiden APV-201-Entscheidungen betreffen ausschließlich die eigenen Aufgaben
KB (`d513289a`) und KG (`4af06e7e`). Die Quellen belegen die jeweilige Kompetenz;
sie erklären diese eigenen Aufgaben nicht zu amtlichen Prüfungsaufgaben.
`source-roles/active-bg-v2/source-decisions.actual.json` begrenzt das reguläre
Angebot auf die tatsächlich belegten ganzen Ansichten. Die native Projektion
bestätigt KB in 61 und KG in 18 von 90 Ansichten. Vorbereitung erhält dadurch
kein Aufgabenangebot. KB bleibt in Hessen ein gewöhnliches Ziel der vierten
Teilstruktur, ohne deklarierte Einheit oder repräsentative Einheitenabdeckung.

Der unveränderte Vorgänger enthält 129 Zeilen. Genau zwei getrennte Schlüssel
wurden angehängt; die ursprünglichen Zeilen und ihr Byte-Präfix blieben
erhalten. Jede neue Zeile bindet den exakten Warntext, die vollständigen
Aufgabenbytes als JSON-Wert, die kompilierten Landeszuständigkeiten und die
tatsächlichen Angebotsansichten. Für G gibt es keine Akzeptanzzeile.
`canonical-physics.before-applicability.json.gz` bewahrt die exakten
Kanonikalbytes vor der Registeränderung; die Aufgabenwarnungsentscheidung
ändert den Katalog nicht.

`warning-review.actual.json` ist eine technische Quellen-/Angebotsattestation
durch den implementierenden Agenten. Sie behauptet weder eine neue unabhängige
Fachprüfung noch menschliche Freigabe. Die vorhandenen unabhängigen
Aufgabenbeurteilungen sind getrennt und mit ihren tatsächlichen Hashes gebunden.
`measurement.before.source.mts` bewahrt den tatsächlich ausgeführten ersten
Messquelltext. `check-current.mts` ist der anschließende begrenzte Nachprüfer.
Die zusätzliche Hülle `verify-final.mts` prüft zuerst die versiegelten
Belegdateien selbst und das beibehaltene Registerpräfix. Sie verändert den
Messquelltext nicht. Ein gesonderter Eingabebeleg hält die endgültigen
v5-Sichtbytes fest; der frühere Nachherbericht und die erfolgreiche v4-Prüfung
bleiben als unveränderte Vorgänger erhalten. Der einzige Nachfolger nach v4
bindet die zwei verschobenen neuen B-Referenzen in den reinen bayerischen
Oberstufensichten; das Aufgabenangebot bleibt exakt gleich.

```sh
node app/node_modules/tsx/dist/cli.mjs \
  curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-w1/routes/applicability/verify-final.mts \
  --mode=verify
```

Dieser Aufruf liest nur. Er prüft beide eigenen Warnungen einzeln und lehnt zehn
Gegenfälle ab: pro Aufgabe einen veränderten Warntext, einen fremden Schlüssel,
das Entfernen der Überschreibung, das Entfernen der Vererbungsgrenze und eine
explizite Erweiterung auf ein weiteres Land. Ohne Überschreibung gehen belegte
Landeszuständigkeiten verloren; ohne Grenze erweitert der Compiler sie auf
alle 16 Länder. Das sind im Speicher kompilierte Gegenmodelle. Die bestehende
Sichtpolitik bleibt dabei zusätzlich begrenzend; eine Compilererweiterung wird
nicht als bereits erzeugtes zusätzliches Lernangebot ausgegeben.

Die unveränderten Vorher-/Nachherberichte und der technische Prüfbeleg halten
die tatsächliche Ausführung fest. Nach der separaten Korrektur der G-Grenze
liegen nativ 21 Physikwarnungen vor, alle mit einzeln bestehenden Entscheidungen,
und keine offene Physikwarnung. Das ist lokale technische Evidenz und keine
Behauptung einer integrierten Main-CI.
