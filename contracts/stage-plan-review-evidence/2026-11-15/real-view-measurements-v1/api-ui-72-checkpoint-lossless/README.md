# Lossless historical API/UI checkpoint retention

This is a compact retention candidate, prepared in TMP only. It preserves the
actual checkpoint `actual-api-ui-72-checkpoint.actual.json` (SHA-256
`6a9760dd391db13d6d4acfaf014679fe6855203f696af81203b3845e0fcdf1ff`)
and all twelve artifacts bound by that checkpoint. It does not regenerate
measurements from today's curriculum.

The checkpoint is historical: current-after inputs bind Physics canonical
`6a77eb45c54b065a13b6e0e255f1b79711dd79e41a87923eaef58097d0437f52`.
Its original CQR104-follow-up limitation remains unchanged. The checkpoint
contains actual native API and current UI-helper measurements with an explicitly
synthetic read-only repository, not learner mastery or human trials. It cannot
establish that subsequent route repairs passed, M7, CI or main integration.

## Exact retention

- `objects.cas.xz` contains each distinct raw goal JSON byte sequence once,
  alongside exact structural/measurement fragments. Objects are addressed by
  SHA-256 and checked independently on load.
- `index.json.xz` contains the ordered fragment references for all thirteen
  retained artifacts, original compressed and uncompressed byte counts/hashes,
  and exact gzip headers, trailers and compression parameters.
- 271,015 source goal occurrences reduce to 2,711 distinct raw goal objects.
  These are exact byte variants, not a claim of 2,711 distinct competency IDs.
- Pool plus compressed index are 3,012,080 bytes, replacing 182,113,531 bytes of
  bound original artifacts plus the 338,449-byte checkpoint. No original
  artifact is modified. No book is copied.

Raw UTF-8 byte fragments preserve original key order, escaping, whitespace and
numbers. JSON is never parsed and reserialized for restoration. Java source
gzip streams use raw DEFLATE from Python zlib 1.2.11. UI-map gzip streams use
their actual producer, Node `gzipSync`, Node v20.20.2 / zlib 1.3.1-e00f703.
Both compressed hashes and uncompressed hashes are mandatory; a different
compressor producing merely equivalent JSON fails the compressed-byte check.

`verification.actual.json` records the actual successful streaming restoration
of all thirteen artifacts, including every original gzip SHA-256, and a fresh
comparison with all unchanged original files. Restored bytes were streamed
through hashes; a second 182 MB file set was not written. The earlier failed
development checks remain in the TMP logs and are not acceptance receipts.

## Reproduce

Keep the following six files together: this README, `pack.py`, `node-gzip.mjs`,
`objects.cas.xz`, `index.json.xz`, and `verification.actual.json`. The separate
`retention-seal.actual.json` binds their exact bytes.

```bash
python3 /path/to/pack.py verify
python3 /path/to/pack.py unpack --out /path/to/new-restoration-directory
```

`verify` reconstructs and checks all artifact bytes without writing restored
files. `unpack` additionally writes original repository-relative paths beneath
the chosen new directory, refuses to overwrite files, and verifies every hash.
Original TMP artifacts are optional for replay: when present at the original
location they are compared again; otherwise the retained hashes remain the
byte contract. Runtime versions are recorded in the proof and index.

The `build` command is a producer step tied to the original historical TMP
layout and checkpoint inputs. It is unnecessary for replay, and must not be
used to replace this retained checkpoint with measurements of later inputs.
