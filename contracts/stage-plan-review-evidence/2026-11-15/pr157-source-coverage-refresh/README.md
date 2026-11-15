# PR 157 source-rationale coverage report refresh

Recorded 15 November 2026. The exact UTC timestamp and file bindings are in
the [evidence manifest](evidence-manifest.json). This is local repair evidence;
the running PR CI and fresh main acceptance remain separate.

In complete CI run 43707177492, Curriculum CI job 132797544269 reached
`check:goal-source-rationale-coverage` and correctly rejected two stale generated
reports. The report still omitted the three elementary assessment tasks already
present in PR head `c9a2d355ae68e2a9bd152fce78066b9fe8bf9fba`.

The repository generator now records all 1,262 goals and 988 atomic leaves.
The 807 source-relevant competencies and every previously recorded goal row
remain unchanged. Three assessment rows are added; relationship totals become
1,397 `contains` and 1,576 `requires`. No source assertion, curriculum content,
quality floor, learner result or assessment score changes.

All **21 actual downstream Curriculum CI commands** were then run locally,
including the regenerated report check, documentation checks, complete
composition validation, stage-plan tests, physics regression cases, Memory
review checks and strict deep-QA/M7 transitions. Every command exited zero.
The archive contains each command, start/end time, original output and terminal
exit code. The native strict-QA self-test retained all five protected subject
denominators: Mathematics 807, Physics 481, Biology 397, Chemistry 455 and
Economics 346.

The separate full quality calculation was not repeated for this report-only
change: the current canonical Mathematics bytes were checked against the PR
head, and all canonical inputs remain unchanged. The existing full-quality
receipt remains evidence for those inputs. The local followup's F7 documentation
was present during the 21-command run; it is explicitly not claimed to be
already part of PR 157.

`original-local-evidence.zip` preserves the original failed remote job log,
the structural before/after comparison and every local command receipt/log
byte-for-byte. It excludes caches and reconstructed runtime artifacts. The
original remote failure is retained; successful local tests do not replace the
required next PR run or fresh main CI.
