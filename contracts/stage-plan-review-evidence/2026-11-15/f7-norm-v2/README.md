# F7: bilingual target norm and independent review

This delivery reconciles the Graph Definition, architecture, glossary and agent
guidance with the agreed stage-plan model. It declares no real Land plan and
does not implement the later unit runtime F8–F13.

The target model distinguishes official curricular assignment from learning
placement, makes one Land/duration plan authoritative across subjects and
defines E1–E4 per declaration layer. `after` orders units without adding
prerequisites, mastery or an atomic-frontier lock. Necessary preparation is
placed at its earliest actual need; an already carried later goal remains a
backflow finding until explicitly repaired. The current compatibility runtime
is described separately from this target.

## Decisions and inspection points

- [The independent v1 review](independent-review-v1.md) rejected four normative
  defects and identified three consistency issues. Its evidence is retained.
- [The independent v2 review](independent-review-v2.md) accepts their correction,
  including own atomic children under E3, the retired whole-unit access lock,
  exact old/new rule values and the boundary between current content repair
  and later unit runtime work. Seven concrete counterexamples are documented.
- [The decision matrix](decision-matrix-v2.md) covers all 26 U/P register rows.
  The 145-rule register remains 12 hard, 50 partial, 57 open and 26 optional;
  existing atomic G17 coverage is not evidence of future E3/E4 runtime gates.

These are independent agent reviews and deterministic consistency checks.
They are not observations with learners or evidence of educational effectiveness.

## Exact evidence and reproduction

[The source-binding receipt](integration-source-bindings.actual.json) inventories
all 149 original author/reviewer files in `sealed-candidates-and-reviews.tar.gz`.
The compressed archive preserves their exact bytes, including both baselines,
both candidate patches, check scripts and actual logs. Generated render-root
copies are omitted. The readable decisions beside this file are exact copies.

The integrated 26-source patch matches the reviewed v2 source bytes except for
one removed blank EOF line in each glossary language. The root separately adds
a concise `CLAUDE.md` mirror. The handover's normative sections and appendices
remain byte-identical to the reviewed input; only its delivery-status section
had advanced. Original source and review pins are not rebound.

To rerun the original review scripts in a clean checkout, extract the archive
into a temporary directory and copy each `snapshots/<name>` directory to its
original `tmp/<name>` location in that checkout. Then run the original
`check_review.py` and `check_native.py` from the v2 independent-review directory.
Use a separate checkout or compare existing files first; do not overwrite
ongoing local work. The native source/build checks on the integrated sources are:

```bash
python3 scripts/build_compendia.py --compendium skill-graph --compendium skill-graph-architecture --compendium glossary --all
python3 scripts/build_compendia.py --verify-sources --check-committed-web --check-untracked-outputs
```

The local PDF build requires LuaLaTeX with luaotfload and language packages.
This environment used the builder's existing `--texmf` option with an unpacked
local TeX tree; the initial missing-dependency failure is retained alongside
the successful build log. Generated outputs follow each compendium's normal
tracking policy. No historical publication or immutable curriculum proof is
changed by this delivery.

Remote integration and fresh main CI remain separate acceptance conditions.
