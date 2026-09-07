# B039 energy / mean-torque repair — implementation receipt

Implemented by Codex; local integrity verification 2026-09-06T23:02:35.652Z. Layer A only.

## Result

The old atomic ID `5a951a0b-fd6c-51a1-9ffb-2a34ed6d3931` retains precisely its previous energy competency. New sibling `c2c3cdc5-3e87-47c4-89fd-4eb2c5c2f2ea` covers mean net torque from a given mean angular acceleration at constant inertia, including accelerating/braking interpretation. Both require inertia goal `642aebd7-66cd-5a50-b543-73c4b207525d`.

Only five existing canonical objects changed: energy, parent 9743, assessments 6d/879, and generic E endpoint 7f. One new object; zero removed. Root-corrected b49 and every other existing goal remain byte-equivalent at object level. The exact eleven pre-transaction source-file hashes were reconstructed successfully without writing restoration data.

There is no alias, splitFrom, mastery transfer, runtime-code change or learner-storage write. Both combined legacy mappings are now honest partial edges. Stored legacy values remain intact; exact-only visible projection may disappear, including energy uplift over a lower directly stored value.

## Assessment and source bounds

6d retains its existing concrete energy task and receives a five-point fixed-axis rotor startup task: I = 25 kg m², mean alpha = 10 rad/s², mean net M = 250 N m; lossless constant-speed net torque is zero. Axial acceleration is distinguished from subsequent transverse precession. Maximum/passing scores are 30/18. Existing 879 task 3 already assesses energy and mean torque; its requires/coverage now name both IDs. 7f receives only the prerequisite edge, no invented concrete torque coverage.

HE source `he-phys-sekii-e-7-b01-a01-8ba122e4` and RP source `rp-phys-sek2-ef-torque-lk` each map partially to general torque cf570 and the new mean-torque goal. RP rotational-energy source remains partially assigned to 642 and energy 5a. Scoped rationales explicitly retain the HE optional E.7 boundary and RP LK-only evidence; no RP-GK source claim or new exact equivalence was invented. See [source/compatibility check](repair-source-and-compatibility-check-v1.md).

## A / M / image / atlas

Energy and mean torque received separate content-specific atomicity and narrow memory decisions. Existing card physics_e_cov_089 remains one compact formula contrast, with both true origin IDs, fixed-axis/constant-I conditions and no content-mastery claim. Canonical and app/public DE/EN copies agree. Backend static build copies were not rebuilt; their old card data are a deployment-artifact followup, not a native M failure.

The existing energy image pixels were actually inspected and retained: its blue left panel independently explains energy; resource text marks the separate right panel as a moment comparison. Original image hash remains 7d2995fb02681e48f73947378d5d7a5253180e492ab4da547b81e1c09b00720b. The new goal has no image link; deferred because no reviewed scope-specific asset was available, not because of an invented provider failure.

The atlas contains 465 atoms: energy page 370, moment page 371; later pages shift by one. Their effective national-book scopes are identical (14 jurisdictions; neither BY nor BW). Raw applicability retains the prior 15-state declaration, with BW filtered out in the existing effective atlas projection.

## Native verification

| Check | Result |
| --- | --- |
| Graph | PASS, 593 landscapes |
| Composition views | PASS, 297 views; registry 21 |
| Semantic atomicity | PASS, 465 current / zero stale or open |
| Memory | PASS, 465 goals; 336 no-memory + 129 required; 148 current kept primary cards; 258 successful visibility checks |
| Read-only atlas build | PASS, 465 pages, same energy/moment scope |
| Read-only applicability | 0 errors; one unrelated existing APV-201 BW override warning on 4996346f-ab5d-4d09-9b9e-b9e559af153d |
| Bounded source / IDs / numeric / recovery assertions | PASS |

Native enum, card-normalization and atlas-count binding mistakes detected on initial checks were corrected and rerun. A checksum-helper replacement-string bug interpreted existing LaTeX $$; it affected the original forecast only, never canonical writes. Callback replacement verified every original hash and all unchanged objects.

The machine-readable [recoverable receipt](repair-implementation-v1.receipt.json), [verification result](repair-verification-v1.json) and read-only [verification helper](repair-verify-v1.ts) record exact before/after data and actual hashes.

## Parent continuation

Fresh D/P are required for changed energy and the new moment atom; rebind eligible unchanged profile bodies separately. Refresh book/page/review-bundle bindings, image QA/inventory and global source/public-rationale/status/M6 artifacts as appropriate. No global D/P, registry, claims, maturity, PDF or AI-inventory file was written by this transaction, and no protected floor was lowered. This report is local authoring completion, not publication or M6 acceptance.
