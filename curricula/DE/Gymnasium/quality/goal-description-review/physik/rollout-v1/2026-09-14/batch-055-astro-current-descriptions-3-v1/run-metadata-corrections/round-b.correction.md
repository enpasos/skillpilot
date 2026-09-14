# Runmetadatenkorrektur: unabhängige Blindrunde B

Korrekturzeitpunkt: 2026-09-14T04:21:06Z.

Das ursprüngliche eigene Manifest ist vollständig und unverändert in `round-b.original-manifest.json` archiviert. Im aktiven Manifest wurden ausschließlich zwei falsch etikettierte optionale `inputArtifacts` entfernt:

- `review_input_json` mit `sha256:86cd4824dbe414e92fad978b820546178af1e7ebf30d942dc7e7fe3db05c5387` bezeichnete tatsächlich die gelesene Datei `round-b/description-review-input.json`. Diese Datei ist das Current-Description-Review-Input, nicht das unter dieser Rolle erwartete Bundle-Artefakt `review-input.json`.
- `finding_schema` mit `sha256:b1d5fe108f157ebcb3e6b5c5f0376b3f4d88da935fab9aab79fac8a49b50b7ff` bezeichnete tatsächlich das gelesene Description-Record-Schema `round-b/contracts/goal-description-review-record.schema.json`, nicht das Goal-Evidence-Finding-Schema des Bundles.

Für diese beiden gelesenen Dateien stellt das Runmanifest-Schema keine entsprechende eigene Artefaktrolle bereit. Die korrekte verbleibende Rolle `description_review_batch_input_jsonl` bindet den tatsächlich gelesenen Current-Description-Batch mit `sha256:6141309fcabb528151b43dda9dd246ffd7efbd8cbfa410710bb9f334c9d890ad`; dessen Datensätze enthalten bereits `recordSchemaDigest`. Die übrigen drei verbleibenden Rollen sind `review_prompt`, `review_criteria` und `run_manifest_schema`, jeweils mit ihren zuvor verifizierten tatsächlichen Digests.

Es wurden keine Artefakte durch nicht gelesene Dateien ersetzt. Records, Entscheidungen, Output-Digest, ursprüngliche Laufzeiten und alle weiteren Manifestfelder bleiben unverändert. Diese Korrektur betrifft ausschließlich die eigene Metadatenzuordnung und enthält keine neue fachliche Prüfung.
