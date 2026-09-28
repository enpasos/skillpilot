# Aktueller D-Reviewinput: beide graphischen Stammfunktionsrichtungen

Stand: 28. September 2026. Der bestehende v2-Batch wurde mit dem nativen
`prepare`-Befehl erzeugt und anschließend mit `check` validiert. Er enthält
**zwei aktuelle Buchseiten und getrennte Blindrunden-Eingaben**. Zwei
unabhängige KI-Erstreviews je Ziel, explizite Synthese, native Resolutionen und
der zentrale D-Index sind inzwischen erstellt und validiert. Beide aktuellen
Beschreibungen werden auf den geprüften Seiten beibehalten. Das ist keine
menschliche Freigabe und keine vollständige M7-Freigabe. Der historische
v1-Batch bleibt unverändert: Sein `keep`/`keep` für `21676dae…` enthält
Formulierungsdissens; sein `revise`/`revise` für `85eda551…` bezieht sich auf
einen inzwischen korrigierten alten Zieltext und kann den aktuellen Text
nicht freigeben.

## Exakte aktuelle Bindung

- Batch: `mathematik-m7-graph-antiderivative-bidirectional-20260928-v2`.
- Basis: `de-gym-math-national-atlas.json`; kanonischer Mathematik-Nenner bei
  Vorbereitung: 799 `curricularAtomic`-Ziele.
- Buchmodell: `sha256:42c00ba492fb5887108d027a76a232da9a7f8fd7ae9353b5bca7a0d425330b55`.
- Reviewinput: `sha256:2ee4d7b22aa8d2b30d8684d90c5dd801f8b296669f6ecd640ea2ce3bcb8fa0bd`.
- `21676dae-8619-59d1-89e3-a35bb2297e2c` (`f`-Graph → möglicher
  `F`-Graph): Seitenfingerprint
  `sha256:96b5bd7a4b036ef467c08b42f897c94dbb73e7895d9b04d4f0bf8692ec69cade`,
  Ziel-Fingerprint
  `sha256:6bf767e8345b92a0bab034917a46d34d532cdd6a3db2d42f474629a225861669`,
  Bild `sha256:c0a71332b8ed8877f8e87ae7898007aeb29e4436680bf804b2e17692051d773a`.
  Das Buch zeigt Sek II GK/LK in BW, BY G9 und HE. Direkte reviewed
  Quellenkanten sind BW 3.4.4(17)/3.5.4(12), BY M12-EA.1.1 und HE E.2;
  die jeweiligen `partial`-Kanten dürfen nicht als vollständige
  Eins-zu-eins-Quelle ausgegeben werden.
- `85eda551-cfc1-52c6-a252-4c7394c1f7e6` (`F`-Graph → `f = F′`-Graph):
  Seitenfingerprint
  `sha256:a018b590ff00ba0d1d2d3863ff3e354ab89db38efeeb1aa5720ced7168556666`,
  Ziel-Fingerprint
  `sha256:05c9596623c0120bfb1cabc1a39607cbb0a95a41b09f8898acb2808d0a40963f`,
  Bild `sha256:3e76f9f36d4f0b9e9187ee2f85e08c0e45b9300bd143ff2c29568d5c1dd1aedb`.
  Das Buch zeigt Sek II GK/LK ausschließlich in BW. Die beiden BW-Quellen
  nennen beide Graphrichtungen und wurden daher je Richtung nur `partial`
  zugeordnet.

Beide Seiten setzen begrifflich `0404f20e…` (`F′ = f`) voraus. Der aktuelle
Kanon führt eigenständige, als `released` markierte Zeichenprüfungen
`728fd537…` bzw. `22842d80…`; diese Statusangabe ist kein Ersatz für eine
inhaltliche D-Prüfung oder einen Host-/Lernendentest. Die Buchbilder stehen
als Reviewkandidaten im Paket und sind keine menschliche Freigabe.

## Übergabe an voneinander isolierte Reviewer

Blindrunde A verwendet ausschließlich `round-a/` und dessen Batch-Input
`*.input.jsonl`, Blindrunde B ausschließlich `round-b/`; kein Reviewer erhält
vor seinem Urteil die alte v1-Entscheidung oder den anderen neuen Review.
Beide prüfen die mathematische Richtung eigenständig: Aus `f` folgt eine
Stammfunktion nur bis auf die vertikale Konstante; aus einem vorgegebenen
`F` folgen Werte, Vorzeichen und Nullstellen von `f = F′` aus **den
Tangentensteigungen von F**, nicht umgekehrt. Zeichnung, Begründung,
DE-/EN-Text, Quellen-/Kursgeltung, aktuelles Bild und tatsächlich
beobachtbare Verständnisleistung gehören jeweils in das Urteil. Ein
`keep_current` ist nur zulässig, wenn der **aktuelle** Wortlaut und die
exakte Buchseite tragen; Einwände als `revise`/`split_review` dokumentieren.

Beide unabhängigen Runden wurden nativ validiert; sie empfehlen für beide
Ziele `keep_current`. Die Synthese hat die mathematischen Richtungen und die
begrenzte Quellgeltung je Ziel erneut geprüft, eine Entscheidung pro Ziel
begründet und die Resolutionen sowie den Index materialisiert. Der zentrale
Report und sein Check bestehen danach mit Mathematik **774/799** strikt,
D **774/799**, P **794/799**, A/M/V je **799/799** und null Blockern. Die
beiden Ziele erhöhen den D-Zähler um zwei; 25 andere D-Bindungen mit
zwischenzeitlich neuem/geändertem Bild bleiben gesondert nachzuprüfen.
