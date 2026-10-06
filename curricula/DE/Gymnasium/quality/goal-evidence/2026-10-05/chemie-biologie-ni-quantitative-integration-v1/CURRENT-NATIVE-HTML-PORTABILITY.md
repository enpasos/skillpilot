# Additive portability of the current native HTML evidence

`current-native-html.portable.tar.gz` preserves the eight specifically reported
current native `book.html` files that match the existing
`curricula/**/*.html` ignore rule. Every member is the unchanged original byte
sequence, stored under its original relative repository path.

Archive SHA-256:
`b232d97fa84252cc68273771e9793f609e66ff12918b13459379c346a390add4`.
Archive size: 71056 bytes. Member count: 8.

`current-native-html-portability.actual.json` identifies each original file,
its byte count and SHA-256, the original freeze and its SHA-256, and the original
freeze entry. Every archived member was read and compared with both that frozen
entry and the actual unchanged original file. Archive member ordering,
timestamps, ownership and gzip metadata are deterministic.

## Restore for an audit

Inspect and restore into a separate, empty audit directory, retaining the
original repository-relative layout. From the repository root:

```bash
archive_path="$PWD/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-biologie-ni-quantitative-integration-v1/current-native-html.portable.tar.gz"
tar -tzf "$archive_path"
audit_root=$(mktemp -d /tmp/skillpilot-current-html-audit.XXXXXX)
tar -xzf "$archive_path" -C "$audit_root"
```

For every receipt row, compare
`$audit_root/<originalRelativeRepoPath>` with the recorded byte count and
SHA-256 and the referenced original freeze entry. A missing original file in a
fresh checkout may be restored at its recorded path only after this exact
comparison. An existing different file must not be overwritten as part of an
audit. No original repository file was extracted or rewritten in making this
archive.

## Bounded additional checks

The entire 66-file NI learner-view adoption freeze, 10-file cluster-schema
metadata guard freeze and 37-file Layer-A checkpoint freeze were compared with
their actual original bytes. They contain no additional ignored frozen HTML.
The final 19-file independent learner-view adoption guard was also available
and compared in full; it contains no additional ignored frozen HTML. The
receipt records the four exact freeze paths, digests and counts.

This archive covers the named eight current HTMLs and those four explicit
additional checks. It is not a new archive or review of all historical
curriculum evidence.

## Unchanged evidence, scope and rights

All referenced original freezes and HTML bytes remain unchanged. No ignore
rule, active curriculum, registry, ledger, runtime file or Git index was
changed. This addendum adds no scientific closure, restored scientific binding,
machine QA approval, human approval or human trial. Existing rights,
attribution and publication clearance remain unchanged.

`current-native-html-portability.final.freeze.json` binds only this note, the
archive and its portability receipt; it does not replace any original review
or integration freeze.
