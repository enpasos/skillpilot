# Full-report source companion reproducer successor

Use this successor for the complete 80-view Länder/national generator report. The sealed `lower-closures-v1/README.md` incorrectly advertised that input for its helper: that helper assumed a `sourcePassages` array in the flat BY assignments, then would remove a goal identity that the retained SN nested assignments already keep. These were representation errors in the reproducer; the actual generated and retained scientific source values agree.

The original rooted helper, README, checks and source companions remain byte-identical. This successor verifies their recorded hashes before doing any work. It accepts flat assignments only for the four recorded BY IMP/839 cases. Nested evidence remains mandatory everywhere else. It verifies source goal identity and removes a redundant generated identity only when the retained counterpart omits it. Every complete resulting assignment must still equal its retained value, including all source paths, hashes, pages, boundaries and topic codes.

The actual full80 replay compares 48 source assignments: 36 nested without a retained redundant identity, four flat BY, and eight nested with retained goal identity. Both reproduced companions are byte-identical to the sealed current companions. Thirteen input-driven regression controls pass, covering missing/wrong nested evidence, missing/wrong retained identity, wrong flat source data, unsupported flat fallback and a changed predecessor pin. None of these technical checks supplies another independent source-review vote or changes the six unresolved HH/TH IMP route gaps.

Supply fresh external paths. After producing the current full report with `python scripts/generate_laender_physics_stage_views.py --check --report <fresh-report>`, run:

```sh
python curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v2/refresh-source-companions.py \
  --repository "$PWD" --generator-report <fresh-report> --output-dir <fresh-directory>
python curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v2/test_refresh_source_companions.py \
  --repository "$PWD" --generator-report <fresh-report> --output <fresh-test-receipt>
```

The helper performs all checks and the final input-byte freshness check before creating its output directory. Existing output directories are rejected. The explicit repository argument also permits out-of-tree replay. The original helper's successful BW-only recovery and failed full-report invocation remain historical execution records, rather than being relabeled successful.
