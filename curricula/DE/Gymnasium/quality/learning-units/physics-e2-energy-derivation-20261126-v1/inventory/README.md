# Task N evidence lifecycle

The inventory covers every file changed by the non-merge first-parent Task N commits after `284063239db536f4b765d700db3a39a357fd7f12`, plus current uncommitted and untracked additions. Changes imported only through a main merge are excluded. Each file has its exact byte count and raw SHA-256. The eight explicitly named bootstrap files are anchored by the final Git commit, avoiding a checksum cycle. An unknown extra inventory file is included in the ordinary domain, never silently excluded.

`record-lifecycle.actual.json` separates current files, earlier records with an existing concrete successor and preservation epoch, and retained operational evidence outside the Git tree. “Current” concerns the file's place in this delivery; it does not confer scientific or human approval. Earlier names containing `final` or `current` retain their bytes and receive explicit lifecycle labels. Original independent responses remain unchanged. The semantic draft disclosure records the unsealed seven-object working output; this inventory claims no recovered immutable version of that draft.

`path-bindings.actual.jsonl` records actual path/digest pairs and exact origin bytes. It distinguishes current repository files, retained originals, exact historical Git blobs, recovered bytes, parsed JSON values and the native model digest. Recovery proves bytes without asserting an original workspace location. Every standalone 64-hex JSON/JSONL leaf is separately listed in `digest-contracts.actual.jsonl`. Scoped goal, page, profile, source, set and campaign fingerprints are never compared with raw file hashes. Old literals already present unchanged at the Task N baseline are explicitly retained pre-N literals; no new raw reproduction is claimed for them.

Description-resolution and synthesis-manifest fingerprints bind their native payloads with the fingerprint field omitted. Their path bindings are recomputed through the native fingerprint functions. The old books' full semantic-ledger value is reproduced from the exact order-only predecessor; their full image-ledger value is reproduced from the committed pre-order ledger. Both raw source bytes and native parsed values are checked. Neither value is relabelled as a failed raw-file hash.

The retained M tree includes its raw source captures, raw replay, original reports and six accepted M records. N preservation includes the four raw map reports, isolated fresh-blind material, provider attempts and viewed image/page captures. Only paths, byte counts and hashes enter this inventory; raw logs, account details and correspondence are not copied here. The provider-rejected first image remains retained evidence and receives no current approval.

Absolute path literals already present in immutable reviewer responses are represented by supplied root aliases in the new binding table. Their original spelling remains bound by the source record's raw hash; the new operational origin never depends on an account-specific path.

The initial whole-review v1 bound three raw working-state inputs that were never committed. `reproduce-seed-inputs.py` reconstructs all three exactly from the baseline and the preserved, raw-hash-pinned `seed.py`. All three resulting hashes equal their original v1 bindings. The live checkout is never used as the reconstruction output. There are no unreproduced Task N explicit raw path bindings in the sealed inventory.

The live chains retain semantic order-only repair before the Wagen basis-label-only correction, initial activation before withdrawal/current-owner repair, the preliminary 13-blocker Physics failure before the successful current native Physics result, the foreign-Mathematics explanatory-label successor, and original/ordered/final atlas input snapshots. The exact intermediate ledgers/configurations remain available. The failed full-domain report is never counted as success; its successor names the separately verified Physics scope. Wagen task scores and historical withdrawal/index bodies are not rewritten by this inventory.

Use portable root aliases; the directory values are supplied by the operator:

```sh
python3 "$inventory/reproduce-seed-inputs.py" --repo "$checkout" \
  --seed-script "$n_scratch/seed.py" --output-root "$new_empty_recovery"

python3 "$inventory/verify-lifecycle.py" --repo "$checkout" \
  --external-root "mReview=$m_review" \
  --external-root "nScratch=$n_scratch" \
  --external-root "seedRecovery=$new_empty_recovery" \
  --external-root "nativePages=$native_pages" \
  --external-root "nativePagesV4=$native_pages_v4" \
  --external-root "routeImages=$route_images" --refresh --native
```

Run the second command again without `--refresh` to verify. After committing the complete delivery, add `--anchor <implementation-commit>` to verify the finite committed domain and all bootstrap bytes. `--native` recomputes parsed JSON digests through `stableGoalBookJson`, validates sealed book models and recomputes every embedded profile-body fingerprint through the repository's native functions. Ordinary D/P/A/M/V and CI gates remain unchanged and must run separately.

Once terminal CI machine summaries exist, pass the optional `--external-root "finalCI=$final_ci"`. Its JSON/XML/Markdown receipts join the retained inventory. Verification then requires that same root to reproduce the sealed snapshot.

Refresh only after inspecting new files and deciding their lifecycle. The finite policy maps the initial candidate, refined/final-named candidates, v3 and v4 contexts to their actual successors. If another scientific successor is authored, add its explicit lifecycle mapping before the final refresh. A missing root, changed raw record, unresolved typed path, changed inventory or failed native integrity check fails the verification.
