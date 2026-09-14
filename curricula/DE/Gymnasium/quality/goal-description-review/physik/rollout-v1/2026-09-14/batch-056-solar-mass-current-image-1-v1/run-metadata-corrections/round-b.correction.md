# Metadatenkorrektur Runde B

Das unveröffentlichte Run-Manifest wurde ausschließlich um die im bereits gelesenen Kampagnen- und Batchinput belegten Felder ergänzt:

- `campaignId`: `physik-rollout-v1-batch-056-solar-mass-current-image-1-v1-20260914-b`
- `roundId`: `physik-rollout-v1-batch-056-solar-mass-current-image-1-v1-20260914-first-pass-b`
- `batchId`: `physik-rollout-v1-batch-056-solar-mass-current-image-1-v1-20260914-first-pass-b.batch-001`
- `batchInputFingerprint`: `sha256:facd8d8226a8d5b7d43e0a07a0e7c6bb4a5710147db2b0ae9db4a3008c4cced3`

Der native Kampagnen-Summarizer benötigt diese vier Kampagnenfelder, obwohl das allgemeine Run-Schema sie als optional zulässt. Der ergänzte Batchfingerprint entspricht dem bereits unter `description_review_batch_input_jsonl` gebundenen Digest. Die vollständigen ursprünglichen Manifestbytes vor sämtlichen Ergänzungen sind unverändert in `round-b.original-manifest.json` erhalten. Records, Urteil, bestehende Bindungen und Digests sowie Start- und Abschlusszeit wurden nicht verändert; es wurden keine weiteren Eingabeartefakte gebunden.

Zusätzlich wurde der tatsächlich gleiche Anbieter im aktuellen Manifest von `openai` zu `OpenAI` normalisiert. Der native Summarizer hatte die unterschiedliche Groß-/Kleinschreibung sonst als verschiedene Provider gezählt. Diese Schreibweisenkorrektur belegt keine Provider- oder Modellverschiedenheit. Das ursprüngliche Backup, die Records, Digests, Zeitstempel und `promptFamilyId` bleiben unverändert.
