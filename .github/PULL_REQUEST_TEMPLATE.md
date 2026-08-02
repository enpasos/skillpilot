## What does this change?

<!-- One or two sentences. If it closes an issue, write "Closes #123". -->

## Why?

<!-- The problem behind the change. Skip if the "what" already says it. -->

## Checklist

- [ ] `./run_ci.sh` passes locally, or the relevant subset for this change
- [ ] Documentation updated in the same change, if behaviour or contracts changed
- [ ] No generated file edited by hand — the generating script was changed and rerun instead
- [ ] Curriculum changes stay traceable to their official source

<!--
Documentation-only change? These five are much faster than the full suite:

  cd app
  npm run check:docs-links
  npm run check:docs-indexes
  npm run check:terminology
  npm run check:generated-doc-notices
  npm run check:generated-status-registry
-->

## Anything reviewers should look at closely?

<!-- Trade-offs you made, things you were unsure about, parts you deliberately left out. -->
