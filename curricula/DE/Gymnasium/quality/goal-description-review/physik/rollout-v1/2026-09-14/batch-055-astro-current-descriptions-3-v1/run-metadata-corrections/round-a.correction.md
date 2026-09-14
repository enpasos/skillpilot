# Round A: Korrektur der Artefaktrollen

Metadatenkorrektur am 2026-09-14 ab 04:20:49 UTC durch den ursprünglichen unabhängigen Round-A-Gutachter. Dies ist kein neuer fachlicher Reviewlauf.

Das vollständige ursprüngliche Manifest liegt bytegleich in `round-a.original-manifest.json`; sein SHA-256 ist `sha256:ba19e7454971bc081884c90ff0249e288ed58756162dda8bb113033ce3dcc550`.

Zwei tatsächlich gelesene Dateien waren im optionalen `inputArtifacts`-Array unter unzutreffenden Rollen aufgeführt:

- `review_input_json` trug `sha256:86cd4824dbe414e92fad978b820546178af1e7ebf30d942dc7e7fe3db05c5387`. Das ist der Byte-Digest von `round-a/description-review-input.json`, dem aktuellen Description-Review-Eingabepaket, und nicht der Digest des unter dieser Rolle bezeichneten ursprünglichen Bundle-Artefakts `review-input.json`.
- `finding_schema` trug `sha256:b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff`. Das ist der Byte-Digest von `round-a/contracts/goal-description-review-record.schema.json`, dem Description-Record-Schema, und nicht der Digest des Goal-Evidence-Finding-Schemas des Bundles.

Diese beiden optionalen Einträge wurden entfernt. Es wurden keine Digests auf nicht gelesene Artefakte umgebunden. Das tatsächlich gelesene aktuelle Batch-JSONL bleibt unter `description_review_batch_input_jsonl` mit `sha256:26151ee92c549963722fda3601fc956c002d4fa1514eefd12003cabcf6cf361d` gebunden; es enthält die aktuellen Beschreibungen und den exakten `recordSchemaDigest`. Die ebenfalls tatsächlich gelesenen Rollen `review_prompt`, `review_criteria` und `run_manifest_schema` bleiben unverändert enthalten.

Die drei Reviewrecords, sämtliche Urteile, `outputDigest`, Start- und Endzeit sowie alle übrigen Manifestfelder bleiben unverändert. Die Korrektur entstand aus dem Hinweis der technischen Zusammenfassungsprüfung; andere Reviews oder historische Urteile wurden dafür nicht gelesen.
