# Runde B: Korrektur der Modellmetadaten

Am 2026-09-14T05:10:33.560Z wurden ausschließlich `model` und `modelVersion` im aktuellen Runde-B-Runmanifest auf `not-exposed-by-runtime` vereinheitlicht. Die Runtime legt keine genaue Modellkennung oder Modellversion offen; unterschiedliche Freitexte sollen keine vermeintliche Modellvielfalt erzeugen.

Das ursprüngliche Manifest liegt byteidentisch in `round-b.original-manifest.json` (SHA-256: `sha256:46c9764d41205b59dff22b5b76f327460c70a71937fc2fdb4cdac321bbd6375c`). Urteile, Records, IDs, Reviewzeiten, Eingabebindungen und Output-Digest bleiben unverändert. Es fand keine neue fachliche Prüfung statt.

`generationParametersFingerprint` bleibt unverändert an den tatsächlich verwendeten JSON-String gebunden:

```json
{"modelVersion":"not_disclosed","temperature":"not_disclosed","top_p":"not_disclosed","seed":"not_disclosed","reasoning_effort":"not_disclosed"}
```
