# Current image-output copy permissions

Technical repair only, 7 October 2026. No new curriculum or image approval; strict gain zero. The build failed when `scripts/deploy_goal_visualizations.ts` attempted to overwrite the current frontend copy of Chemie goal `23533087-89ea-5f29-8ec1-9f2e01197bb6`.

The actual inspection found six Chemie PNGs with mode `0444` in each current output tree: `app/public/assets/goal-visualizations` and `backend/src/main/resources/static/assets/goal-visualizations`. Each tree contained 1,852 regular files, no symbolic links, and writable directories. The repair adds owner-write only to the twelve affected regular output copies, changing `0444` to `0644`.

The helper rejects aliases and multiply linked files before changing permissions. It verifies each affected copy against the corresponding original source image, binds bytes, SHA256, mode and inode, and checks that only the output permission changed. Source images, their original modes, and all historical snapshot files remain unchanged. This initial permission-only application did not change the original deployment script. Full build, schema and central curriculum gates are separate Root-run checks.

## Rule for future review preparation

Freeze immutable, independent review snapshots and their manifests. A review producer must never call `chmod` through a relative or absolute file alias, a linked directory, or a resolved path that points into active source or current frontend/backend output copies. Inspect links with `lstat`/`is_symlink` before any permission change; reject directory-alias traversal and require the resolved target to belong to the producer's independently copied snapshot. Record external input hashes without changing external permissions.

Store isolated native dependency snapshots outside curriculum discovery, retaining relative committable aliases when needed. Raw stdout and stderr use `.txt`. A `.json` report is published only after the producing process completes successfully and its output parses. Failed outputs remain raw history and are not promoted to passing reports.

Run `python -B restore_current_output_permissions.py --apply` once, then `--verify` to verify the actual result without changing permissions. The actual receipt provides the twelve before/after bindings and the unchanged source bindings. Technical procedure and helper: Apache-2.0 under `LICENSING.md`; image licensing is unchanged.

## Reproduced copy-mode recurrence

The six source PNGs themselves remain `0444`. An isolated actual Node fixture confirms that `fs.copyFileSync` copies that mode onto an existing `0644` target, returning the target to `0444`. The raw stdout, fixture source and terminal receipt are retained here. The fixture changes no repository image or production script.

This initial permission-only intervention makes the currently affected output copies writable. The uncorrected deployment could copy the protected source mode onto them again. Its receipt retains the actual earlier statement that production scripts were unchanged; it is not rewritten to claim the subsequent correction or a passed full build.

## Subsequent permanent producer correction

After the recurrence fixture, Root explicitly assigned the narrow production correction. `scripts/deploy_goal_visualizations.ts` now makes existing regular output copies owner-writable before overwriting and restores owner-write after copying. It refuses symbolic directory/file aliases and hard-linked outputs before changing permissions. Source and historical modes and bytes remain unchanged. The CLI still copies the existing discovered image files into the same two output trees; it does not alter images, metadata, curriculum decisions or publication behavior.

`app/scripts/testDeployGoalVisualizations.ts`, run through `npm --prefix app run test:goal-visualization-deploy`, verifies three repeated deployments from a `0444` source into each initially `0444` output; each resulting copy has exact source bytes and mode `0644`, while the source remains `0444`. It also covers a new nested output and protected symbolic file, dangling file, nested directory, root directory and hard-link aliases. Protected target bytes and modes remain intact. The production script exports only its copy helper for this actual regression test and runs normal deployment only when invoked directly.

Targeted command results and production/test/package source hashes are recorded separately from the initial application and from full Root-run build or CI results.
