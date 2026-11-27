# Common curriculum-package 1.4 successor candidate

This unpublished successor transports composition-view format 1.3 and the
`voluntary` goal-entry projection role. A voluntary offer identifies one
canonical atom in one view. It is distinct from regular targets and necessary
preparations. An acquisition placement still belongs only to a nested
`prerequisiteOnly` atomic entry. Regular prerequisite closure cannot pass
through a voluntary offer. A voluntary offer may require any of the three
roles; selecting it activates that extra path.

The exact source schema and `viewFormatVersion: "1.3"` bind the new source
format. Its closed runtime projection binds the new 1.4 runtime-view schema,
also with view format 1.3. Unknown versions and values fail closed. Earlier
package profiles cannot transport the new role. No current catalog view is
migrated by this contract delivery.

The successor retains all 28 trusted components of package 1.3 unchanged and
adds two components: the 1.4 runtime catalog and runtime composition view.
The existing resource schema, assessment-material rules, field-semantics
registry and learning-unit contract retain their exact 1.3/1.2 identities.
Source views 1.0 and 1.2 keep their existing runtime projection and exact
logical-artifact bytes when built with the new profile. Neither old contracts
nor published snapshots or archives are rewritten.

`python -B scripts/generate_curriculum_package_v14_contracts.py --check`
verifies the reproducibly derived successor. Explicitly select the 1.4 build
and standalone profiles; the default remains 1.0. The redistribution-review
generator has an explicit `--runtime-v14-candidate` option and a separate
ledger. Existing rights decisions and publication gates remain binding.
This candidate authorizes no publication, deployment, catalog migration,
learner mastery change or stage-plan activation.
