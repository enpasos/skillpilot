# Final b391 API/UI checkpoint: exact lossless retention

This standalone package retains exactly the four requested final artifacts:
the native API input bank, UI maps, summary, and
`boundary-b391-final72-receipt.actual.json` (SHA-256
`95bbbab739e61d3f0192242372bdd5140cb79f25f0082c6029288d249258bc0d`).
No earlier API banks or measurement epochs are copied into this package.
The receipt's separate small source-pin artifact remains in the retained
author evidence; it is not a fifth payload here.

The final source is Physics canonical
`b391f6a72d6fee14cc5836cd42ad9a46f30ff9dbc07b23a5dd7e0f47c7467173`.
The measured API/UI reader uses a read-only synthetic repository. Against the
ee9829 checkpoint, all 72 ordinary seed/learning sets are unchanged; three BY
G9 profiles remove only two practice tasks, and 69 complete contexts are
unchanged. Against the rejected 721585 intermediate candidate, the two BY
method atoms and their two tasks are removed from 60 expanded contexts.

National top maps have zero backflows and zero outside atoms. Existing inner
and regional findings remain open: the national inner counts are 11/12/12
arrows with 27/30/32 distinct atomic causes. Top and inner measures must not be
combined. This package establishes neither universal zero-backflow acceptance,
subject M7, learning effectiveness, real learner results, CI nor main delivery.

## Byte contract

`objects.cas.xz` stores each distinct raw goal JSON byte sequence once, plus
exact structure and measurement fragments. `index.json.xz` stores their ordered
references and all original compressed/uncompressed sizes and SHA-256 hashes.
130,277 goal occurrences reduce to 2,595 distinct raw byte variants; these are
not asserted to be 2,595 distinct competency IDs. Pool plus index total
1,957,640 bytes, replacing 89,686,895 bytes of the four original artifacts.

Restoration preserves original UTF-8 bytes, key order, escaping, whitespace and
numbers; it does not parse and reserialize JSON. Source-bank gzip uses Python
zlib 1.2.11 raw DEFLATE. UI-map gzip uses the original native Node `gzipSync`,
Node v20.20.2 / zlib 1.3.1-e00f703. A merely semantically equivalent JSON/gzip
file fails the required original compressed-byte hash.

`verification.actual.json` records actual streaming restoration of all four
artifacts and exact checks against every unchanged original. Restored bytes
are hashed without writing another large output set. The content-addressed
objects are also independently hash-checked. `retention-seal.actual.json`
binds the six replay/documentation/proof files; keep those and the seal together.

```bash
python3 /path/to/pack.py verify
python3 /path/to/pack.py unpack --out /path/to/new-restoration-directory
```

`verify` reconstructs and checks all bytes. `unpack` additionally writes the
original repository-relative paths beneath a new output directory, refuses
overwrites and checks every hash. Original TMP inputs are optional for replay;
if present at the original producer location they are checked again. Runtime
versions and helper hashes are in the proof. `build` is a producer command tied
to the original TMP layout and is unnecessary for replay. Do not replace these
retained bytes with a later measurement.
