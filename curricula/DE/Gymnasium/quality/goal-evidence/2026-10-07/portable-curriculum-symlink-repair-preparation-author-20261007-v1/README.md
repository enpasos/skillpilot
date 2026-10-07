# Portable curriculum symlink repair preparation

Author-only technical checkpoint, 7 October 2026. No scientific approval and no link application by this agent.

## Prepared scope

The original committable inventory contains 358 absolute pointers: six tracked historical checkout links, 344 current Chem final-image pointers, two current Bio clinical native-book `app/public` pointers and six current Bio4 source pointers. All destinations exist inside this repository and contain tracked or nonignored committable payloads. The 42 previously existing relative pointers remain byte exact; four directory destinations in `qa-artifacts/native-review-inputs` each contain 497 tracked files.

The separate Bio4 author migrated its six pointers to the exact planned relative literals before final seal. They are excluded from the current Root application manifest. `original-358-portable-symlink-replacement-plan.json` and all 358 literal archives preserve the original inventory. `portable-symlink-replacement-plan.json` contains the remaining 352 pointers, including all six tracked historical links. Historical HEAD/index blob bytes for those six are preserved separately.

The initial literal guard and later stale-count assertion correctly rejected concurrent pointer changes. Their exact reason is retained in `checks/preparation-attempts.actual.json`; the relocation verification itself passed for all 358 original links.

## Root application

Run the helper from any directory with an explicit repository root. Its default is check-only; the author executed this mode only. Root may apply the authorized technical plan and capture its JSON receipt into a new technical repair dossier:

```sh
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/portable-curriculum-symlink-repair-preparation-author-20261007-v1/apply_portable_symlink_plan.py --root /home/enpasos/projects/skillpilot --apply
```

Every remaining pointer must retain its exact original literal and indexed Git blob where tracked. Its lexical and resolved destination must remain inside the same repository and resolve to the same file/directory before and after replacement. Existing relative pointers are checked without modification. The helper restores parent directory permissions after atomic symlink replacement. It freshly binds each file SHA256 immediately before and after the pointer operation; preparation hashes remain historical observations and do not reapprove or rebind science.

Target files that are currently untracked but committable must accompany their referring links in the eventual commit. The only untracked destination files are the two Bio21 freeze JSONs; all 344 Chem image destinations are already tracked. No outside, ignored-only or unknown payload is copied.

## Prevention and verification

The authorized change to `scripts/validate_schemas.py` discovers tracked and nonignored untracked curriculum candidates through Git. Before JSON traversal it rejects absolute pointers, dangling/cyclic targets and resolutions outside the repository, including directory symlinks. Ignored scratch dependencies are excluded by ordinary Git rules; there are no artifact-name exceptions or schema relaxations. Existing schema and JSON validation behavior is preserved.

Seven focused unittest fixtures pass: valid relative file/directory links after repository relocation; locally existing absolute file and directory links; broken relative links; existing external relative targets; ordinary ignored dependencies versus forced tracked links; and escape through a directory symlink.

All 358 original proposed relative pointers passed an independently relocated temporary repository fixture with the generic guard green before and after relocation. Every file destination was projected with its actual bytes; each directory destination included an actual tracked sample. The temporary projection was removed. This verifies portability of the pointers without retaining copied image trees in this dossier.

At seal, Root application and full `python scripts/validate_schemas.py` success remain pending. The current guard truthfully identifies the 352 remaining absolute pointers. There are no new goals, curriculum data changes, image changes, validator artifact exceptions, peer judgments or human approval claims.
