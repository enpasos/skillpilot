# Technischer Anschluss der Math-Paketbindung — 8. November 2026

PR #96 scheiterte im tatsächlichen Curriculum-Job `128834320684` des Laufs
`42512294687` nach erfolgreicher Kompilation und Modellvalidierung an
`REVIEW_IDENTITY_MISMATCH /contentDigest`. Der aktuelle normalisierte Modell-Digest
lautet `sha256:eec1b30025591b37014b7742635be15c71f0ad69020910051624b6021cd42ae6`.

Der vollständige Quellenvergleich von `0adcd834d5` nach `a2d7043e6c` bestätigt
ausschließlich die bereits zertifizierten 27 atomaren Materialisierungen und zwei
Cluster-Entfernungen in `requires`. Alle anderen Felder der 1.252 Math-Ziele,
`contains`, Feldpräsenzen und 20 weitere kanonische Dokumente bleiben identisch.
V3-Registry `deb3d78f…`, 204 historische Operationen, 200 Originalarrays und
21 Baselinebindungen werden durch diese Wartung nicht verändert.

Der unveränderte reguläre Redistribution-Generator wurde zuerst auf einer
isolierten Kopie ausgeführt. Sein vollständiger Objektdelta besteht nur aus
`/contentDigest`: Der Ledgerwert `sha256:fb51e95c0113339cf0252653ee91f0258bd56f80893d85fe6f45fb7dc775e602`
wird an den tatsächlichen Modell-Digest angeschlossen. Die Shell-Konstante
`EXPECTED_CONTENT_DIGEST` stand noch auf dem älteren
`sha256:e8ad1ec76513cac8248234798ea10e612db11fb58785ad9723b49b77ca80b97a` und wird ausdrücklich
an denselben Modell-Digest angeschlossen; sie bezeichnet keinen ZIP-Digest.
Beide Dateien ändern jeweils nur eine Digestzeile.

Alle 836 vollständigen Assetrecords, vier Klassenrecords, Evidenzen und
Fingerprints, Source-/Profilbindungen, Klassifizierungen, Lizenzangaben und
Summary bleiben exakt erhalten: 839 offene Redistributionsprüfungen, null
menschliche Freigaben in diesem Rechte-Ledger und `publicationReady: false`.
Dies ist technische Bindungspflege
nach dem bestehenden Anschluss in Commit
[`30d6fe824a`](https://github.com/enpasos/skillpilot/commit/30d6fe824a41ee285a7a2483579a46d76730cf2e),
keine neue Rechte-, Quellen- oder Layoutentscheidung und keine automatische
Assetfreigabe. Die geänderte rohe `requires`-Darstellung wird damit nicht als
vollständig unverändertes Datenmaterial ausgegeben.

Der vollständige vorige Ledger bleibt unter
[`a2d7043e6c`](https://github.com/enpasos/skillpilot/blob/a2d7043e6c4f40c71061e222ca043a71576b18b8/curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json)
erhalten (Gitblob `956463f046b98ffab69156b60131e8a8dced71bd`, Raw-SHA256
`c0956609116f7c330047814bdf39237ce98c85be123eede288f7fad8e4be8825`). Der kompakte technische
[Receipt](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-08/g17-math-package-redistribution-input-binding/receipt.json)
bindet Alt-/Neuwerte, vollständigen Deltavergleich und tatsächliche Ausführung.

Der vollständige unveränderte lokale Release-Modell-Conformancelauf ist mit Exit 0 bestanden: Fixtures, bestehende Bridge- und Mutationstests, unabhängige Validierung, aktuelle Redistribution- und Source-Bindungen sowie zwei bytegleiche Modellbuilds. Er lief wie der betroffene CI-Schritt mit `committed-bindings` und `SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false`; ein ZIP-Bau und eine Publikationsfreigabe gehören nicht zu diesem Beleg. Native-, Projektions- und CQR-Läufe wurden für diese reine Bindungspflege nicht zusätzlich wiederholt. Remote-CI bleibt ein eigener Nachweis.


## Folgeanschluss für den atomar reduzierten Math-Stand

Der anschließend fertig geprüfte Math-Nachlauf enthält ausschließlich 922
`requires`-Löschungen in 490 atomaren Quellen (2484→1562 Kanten). Die sieben
eingefrorenen Daten-/Proof-/Consumer-Inputs bleiben exakt erhalten, darunter
Math-Raw `664b6d15…` und V4-Registry `94f65d33…`. Alle anderen Zielfelder,
Feldpräsenzen und 20 übrige kanonische Dokumente sowie die alten
204/200/21-Bindungen und beide V3-29er-Inventare bleiben unverändert.

Die echte isolierte V4-Kompilation ermittelt den neuen Modell-Digest
`sha256:5d3cf9c732f2417fd4fd3df95eef7496a80ab05555bc7f34c6f6481d3540213d`. Der unveränderte reguläre Generator bestätigt wieder ausschließlich
`/contentDigest`; auch bytegenau wird nur der bisherige Wert
`sha256:eec1b30025591b37014b7742635be15c71f0ad69020910051624b6021cd42ae6` ersetzt. Ledger und Shellkonstante
werden jeweils mit einer Digestzeile angeschlossen. Alle 836 vollständigen
Assetrecords, vier Klassenrecords und übrigen Bindungen bleiben identisch:
839 offene Redistributionsprüfungen, null menschliche Freigaben in diesem
Rechte-Ledger und `publicationReady: false`. Es entsteht keine neue Rechte-,
Quellen-, Layout- oder Assetentscheidung.

Die vollständigen Vorstände sind sowohl in Parent
[`b973e78728`](https://github.com/enpasos/skillpilot/blob/b973e787282646402dea8fddac8b1a035277036c/curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json)
als auch im sichtbaren Merge
[`55fa7011c5`](https://github.com/enpasos/skillpilot/blob/55fa7011c59b7fd06e6d9416bb758180ebf11ead/curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json)
gebunden. Der neue kompakte
[Receipt](https://github.com/enpasos/skillpilot/blob/main/qa-artifacts/ci-contract-audit/2026-11-08/g17-math-tr-package-redistribution-input-binding/receipt.json)
führt beide Ledger-/Shell-Gitblobs, getrennte Raw-SHAs, die sieben unveränderten
Inputs und das tatsächliche Ausführungsergebnis. Der vorige V3-Wartungsbeleg
und der vorstehende historische Notiztext bleiben erhalten.

Der vollständige unveränderte lokale V4-Conformancelauf ist mit Exit 0 bestanden: 17 bestehende Bridge-Tests, Fixtures und Ausgabepfadschutz, unabhängige Modellvalidierung, aktuelle Redistribution-/Source-Bindungen samt bestehenden Negativtests und zwei bytegleiche Modellbuilds. Er lief mit `committed-bindings` und `SKILLPILOT_FULL_PACKAGE_CONFORMANCE=false`. ZIP-Bau und Publikationsfreigabe sind nicht umfasst. Die eingefrorenen Native-, Projektions-, CQR-, npm- und Schema-Belege wurden nicht durch separate Wiederholungen ersetzt. Remote-CI bleibt ein eigener Nachweis.
