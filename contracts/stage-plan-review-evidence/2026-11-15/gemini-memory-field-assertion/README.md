# Gemini memory-practice assertion repair

Recorded 15 November 2026, 12:41 MEZ (UTC+01:00). This is local evidence for
the next coherent delivery; it does not claim remote acceptance of the repair.

The first attempt of [Gemini workflow 43707177517](https://github.com/enpasos/skillpilot/actions/runs/43707177517)
at `c9a2d355ae68e2a9bd152fce78066b9fe8bf9fba` failed because an opaque
test capability token happened to contain `back`. The old assertion searched
the entire serialized response for that word. The response contained the
permitted card fields and did not release an answer. Rerunning the failed
workflow jobs subsequently succeeded; that result concerns the unchanged
PR head, not this test repair.

The revised start-contract test checks the exact allowed fields in both the
structured response and parsed text JSON, including every card. Actual answer
text, private instructions and learner/session identifiers remain forbidden.
Production code and the other seven tests are unchanged.

- Final native JUnit class: 8 tests, no failures, errors or skipped tests.
- Temporary native evidence case: a token containing `back` is accepted;
  all 20 intentional field/value leaks are rejected by the actual revised
  test method. The instrumented run had 9 tests and no failures.
- Gradle compiled the changed tests using existing unchanged runtime build
  inputs. This is a focused local test, not a full backend build.

The [manifest](evidence-manifest.json) binds every original evidence file in
`original-local-evidence.zip`, including the original failed job log, exact
candidate, commands, temporary mutation source, terminal exit codes, JUnit
XML and the author's original report. The archive retains raw bytes;
temporary test instrumentation is absent from the committed test source.

Candidate source SHA-256:
`bfc281aa6c6dd62ac01121f3040b66f6d9905b307d9c4565249f963d63c06be2`.
Fresh PR and main CI remain required for the delivery containing this repair.
