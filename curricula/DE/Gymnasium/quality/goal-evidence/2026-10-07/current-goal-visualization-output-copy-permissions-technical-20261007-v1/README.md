# Current image-output copy permissions

Technical repair only, 7 October 2026. No new curriculum or image approval; strict gain zero. The build failed when `scripts/deploy_goal_visualizations.ts` attempted to overwrite the current frontend copy of Chemie goal `23533087-89ea-5f29-8ec1-9f2e01197bb6`.

The actual inspection found six Chemie PNGs with mode `0444` in each current output tree: `app/public/assets/goal-visualizations` and `backend/src/main/resources/static/assets/goal-visualizations`. Each tree contained 1,852 regular files, no symbolic links, and writable directories. The repair adds owner-write only to the twelve affected regular output copies, changing `0444` to `0644`.

The helper rejects aliases and multiply linked files before changing permissions. It verifies each affected copy against the corresponding original source image, binds bytes, SHA256, mode and inode, and checks that only the output permission changed. Source images, their original modes, and all historical snapshot files remain unchanged. The original deployment script remains unchanged. Full build, schema and central curriculum gates are separate Root-run checks.

## Rule for future review preparation

Freeze immutable, independent review snapshots and their manifests. A review producer must never call `chmod` through a relative or absolute file alias, a linked directory, or a resolved path that points into active source or current frontend/backend output copies. Inspect links with `lstat`/`is_symlink` before any permission change; reject directory-alias traversal and require the resolved target to belong to the producer's independently copied snapshot. Record external input hashes without changing external permissions.

Store isolated native dependency snapshots outside curriculum discovery, retaining relative committable aliases when needed. Raw stdout and stderr use `.txt`. A `.json` report is published only after the producing process completes successfully and its output parses. Failed outputs remain raw history and are not promoted to passing reports.

Run `python -B restore_current_output_permissions.py --apply` once, then `--verify` to verify the actual result without changing permissions. The actual receipt provides the twelve before/after bindings and the unchanged source bindings. Technical procedure and helper: Apache-2.0 under `LICENSING.md`; image licensing is unchanged.

## Reproduced copy-mode recurrence

The six source PNGs themselves remain `0444`. An isolated actual Node fixture confirms that `fs.copyFileSync` copies that mode onto an existing `0644` target, returning the target to `0444`. The raw stdout, fixture source and terminal receipt are retained here. The fixture changes no repository image or production script.

This permission-only intervention makes the currently affected output copies writable. A later ordinary deployment can copy the protected source mode onto them again. The permanent generic deployment correction belongs to the Root integration: keep source permissions unchanged, reject output aliases, ensure existing regular output copies are writable before overwriting, and retain owner-write on the resulting output copies. The temporary repair is not reported as that production correction or as a passed full build.
