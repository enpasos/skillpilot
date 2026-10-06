# Additive portability of the original primary HTML

The unchanged author checkpoint is `author-proposal-checkpoint.final.freeze.json`
(SHA-256 `628d3f6b6ec62386a33ebc186c1cff21e5f1462dab36ead38126894a33c42309`,
100 original files). Its eleven official BY/BW raw HTML inputs are covered by
the existing `curricula/**/*.html` ignore rule. A normal Git add therefore does
not carry those local files into a fresh checkout.

`raw-primary-html.portable.tar.gz` preserves exactly those eleven frozen byte
sequences under their original relative repository paths. Its SHA-256 is
`6dd5961d4fda2f71cb8f58901a6882f9abc65b555880cd8e24de727e6513fe3c`
and its size is 177430 bytes. `portability-addendum.actual.json` records every
member's original path, byte count and SHA-256. All eleven archive members were
read and compared with the original freeze; all 100 original checkpoint files
remain unchanged. Archive order, timestamps, ownership and gzip metadata are
fixed for reproducibility.

## Restore original paths for an audit

Inspect the archive before restoring it. Restore into a separate, empty audit
directory; this retains the original repository-relative path layout without
overwriting current repository inputs. For example, from the repository root:

```bash
archive_path="$PWD/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b008-nine-source-operator-structural-current-author-candidate-v3/raw-primary-html.portable.tar.gz"
tar -tzf "$archive_path"
audit_root=$(mktemp -d /tmp/skillpilot-b008-html-audit.XXXXXX)
tar -xzf "$archive_path" -C "$audit_root"
```

For each receipt row, compare the byte count and SHA-256 of
`$audit_root/<originalRelativeRepoPath>` with `files[].bytes` and
`files[].sha256` in `portability-addendum.actual.json`, and with the matching
`primary-inputs/*.html` row in the unchanged original freeze. A missing input
in a fresh checkout can be restored at its original path only after this exact
comparison; an existing different input must not be overwritten as part of an
audit.

## Unchanged scope and rights

This is technical portability of already frozen inputs. It adds no scientific
review, native QA completion, current strict completion, human approval or
human trial. The nine-goal remediation, proposed atomic boundaries, two image
candidates and all unresolved findings remain unadopted candidates.

The official source URLs, original fetch provenance and attribution remain in
`primary-inputs/actual-official-fetch.receipt.json`. Third-party rights and
clearance status are unchanged; the archive does not relicense the sources.
The original README and original 100-file freeze are not replaced by this
addendum. `portability-addendum.final.freeze.json` binds only the three new
portability artifacts.
