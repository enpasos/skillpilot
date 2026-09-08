# P043 – informierter fachlicher Gegencheck

Alle 20 aktuellen DE/EN-Profile wurden gegen die aktuellen kanonischen DE/EN-Beschreibungen gelesen. Ergebnis: 16 eng begründete Profilkorrekturen, 4 unveränderte Profile. Das ist ein informierter AI-Kandidaten-Gegencheck, keine neue blinde D-Runde und keine menschliche Freigabe.

Die Korrekturen betreffen Aufgaben-/Erwartungspassung, echte zweite Anwendungen, fehlende Modellbedingungen sowie zwei Antwort-/Definitionsprobleme. Die Kriterien wurden vollständig gelesen; jedes Ziel erhielt einen eigenen frischen Gedanken- oder Rechencheck. Keine echte Lernleistung, Quellen-/Projektions-Neuverifikation oder genaue Modellidentität wird behauptet.

Native Materialisierung und anschließende rein lesende Verifikation: jeweils PASS, 20 aktuelle AI-Kandidaten (E1/G1, keine Review-Run-Behauptung). Der Emitter wurde syntaktisch geprüft und lädt die expliziten Einzelkorrekturen, statt sie beim nächsten Erzeugen zu verlieren. Es gab keine D-, Source-, View-, A/M-, Karten- oder zentrale Registerwrites.

Maschinenlesbare Vorher-/Nachher-Felder, Zieltexte, Profilfingerprints und geprüfte Dateihashes: `physics100-p043-informed-content-cross-review-v1.json`. Explizite Emitter-Eingabe: `positive-candidate-counterreview-overrides-v1.json`.

## 1. 37b33812-d428-5953-852e-57a53a4347fe — revise

Vorher: Both cases compared unequal particle masses at equal T; case 1 instead expected a higher-T comparison.

Entscheidung: Revise case 1 to temperature change versus particle-number change; retain independent mass-at-equal-T case.

Eigener Transfercheck: At 450 K, helium and neon have equal mean translational energy; doubling only N doubles total translational energy but leaves T unchanged.

## 2. 2088ccf0-48f4-51d4-be5f-67affd0fb099 — revise

Vorher: Rough-body task incorrectly expected an independently analyzed piston.

Entscheidung: Align general observable performance and first-case expectation to rough body, heated surface, driving surroundings and recoverable work; retain free-expansion transfer.

Eigener Transfercheck: Compressing freely expanded gas restores V, but external work and any released heat prevent restoration of system plus surroundings as the sole effect.

## 3. 5f17e992-fd07-56ee-80a0-567f45bbd10c — revise

Vorher: Case supplied ΔU=Q+W while requiring formulation without a supplied equation; storage-versus-transfer distinction was not demanded.

Entscheidung: Remove equation leakage and ask explicitly for transfer meaning; separate rigid heating/cooling from independent insulated compression.

Eigener Transfercheck: Insulated compression with 40 J work on stationary gas yields Q=0, ΔU=+40 J; no stored 'work content' results.

## 4. 912a5489-abcc-55f9-8f1a-9ee1e2d7fd9d — revise

Vorher: Case 1 only sorted given signs, but expected autonomous system choice and direction prediction for two bodies.

Entscheidung: Replace sign recognition with two-body prediction, local versus total entropy and reversible-limit comparison; retain externally powered cooling transfer.

Eigener Transfercheck: A freezer can lower its interior entropy while releasing greater entropy to the room; it does not reverse isolated spontaneous equalization.

## 5. 0de2ca8c-7272-59ed-9c89-0971d6ce2f47 — revise

Vorher: Both cases repeated slow piston with/without friction; finite-temperature heat transfer and free expansion named in the goal were not tested.

Entscheidung: Retain piston comparison and replace duplicate with slow finite-gradient heat transfer plus free expansion; align expectation to each task.

Eigener Transfercheck: A low-conductivity barrier slows heat flow but cannot make a finite temperature jump reversible; a free expansion is not quasi-static.

## 6. 239aac49-1137-5df5-b197-49e72292e40c — revise

Vorher: Physics and transfer sound; expected formulation of the guiding question was not explicitly requested.

Entscheidung: Add the already intended guiding-question demand; retain energy-arrow construction and independent friction reversal.

Eigener Transfercheck: A 20 J transfer from cold to hot can conserve energy mathematically; that balance alone gives no reason for its absence as a spontaneous process.

## 7. e713dc34-beeb-5807-8a90-f872e049aa4e — revise

Vorher: First task assumed a substitute path rather than asking learners to construct it; second case repeated adiabatic free-expansion idea.

Entscheidung: Require autonomous substitute paths and actual Clausius use: constant-T ideal-gas expansion versus variable-T solid heating.

Eigener Transfercheck: For C=10 J/K, heating 300→600 K gives ΔS=10 ln 2 J/K, not C(600−300)/600=5 J/K.

## 8. 6e79ef4a-2666-5f7a-885c-b175954506f8 — revise

Vorher: Second case incorrectly said the Q_rev/T statement applies only to the heat route; the definition also applies to the reversible adiabat with Q_rev=0.

Entscheidung: Explicitly preserve validity on both routes and distinguish negative entropy change during heat release from zero during reversible adiabatic work.

Eigener Transfercheck: Reversible adiabatic compression with 60 J work produces ΔS=0 even while U rises; a reversible 60 J heat release at 300 K gives −0.20 J/K.

## 9. 741e7056-69e4-59be-a159-0e2583d748d1 — revise

Vorher: First case expected numerical mass-specific conversion although it supplied only total heats.

Entscheidung: Keep first case's valid −3/+4 J/K calculation and fit its expectation; make independent freezing case supply mass and specific latent heat for the expected conversion.

Eigener Transfercheck: 0.50 kg freezing with 20 kJ/kg at 250 K gives signed L=−10 kJ and ΔS=−40 J/K, not −80 J/K.

## 10. eaef821b-4dbe-52a4-a0e2-574e5ce2040d — revise

Vorher: First task omitted requested temperature-role explanation and units; variation axis mentioned changed n while actual transfer changed T.

Entscheidung: Demand symbols, units and fixed-T rationale explicitly; align axis with the actual heated-endpoint transfer.

Eigener Transfercheck: If V doubles and endpoint T also rises, nR ln 2 alone omits the thermal entropy contribution; for isothermal compression V→V/2, ΔS=−nR ln 2.

## 11. 14099861-897c-53f4-8c6c-48d088ee9f01 — revise

Vorher: Second 'fresh' case only relabeled system and surroundings; this is not a changed physical condition.

Entscheidung: Add actual reversed transfer with a quantitative negative total; relabeling remains a separate invariance check.

Eigener Transfercheck: 80 J from 250 K to 500 K produces −0.16 J/K for the otherwise isolated pair; external work cannot be silently omitted.

## 12. 81a45dec-37be-529b-89ce-2f3101237293 — revise

Vorher: Proof first case sound; second case claimed isothermal heat→work for unspecified gas, and 'contact temperature' was less precise than canonical reservoir T.

Entscheidung: Specify fixed ideal gas and reversible single step; distinguish endpoint volume change from a full cycle; make reservoir-temperature wording exact.

Eigener Transfercheck: For the cyclic 100 J/400 K proposal, ∮δQ/T=+0.25 J/K contradicts ≤0; one ideal-gas isothermal expansion has ΔU=0 but no cyclic restoration.

## 13. 616ac6cf-901b-509a-8cbb-bd422ddecf05 — revise

Vorher: Free-expansion first case incorrectly expected friction and thermal-contact mechanisms; all four named mechanisms lacked case coverage.

Entscheidung: Match free-expansion expectation to its system; keep independent mixture separation and add friction/thermal-contact comparison.

Eigener Transfercheck: Insulated free expansion produces entropy without entropy transport; subsequent isothermal compression can lower gas S only by exporting entropy and changing surroundings.

## 14. b61d233a-1902-526b-a9b5-6b3d553f4013 — revise

Vorher: First construction is valid; second ideal-gas example did not explicitly fix particle count or equilibrium/no-flow conditions.

Entscheidung: Keep labeled-particle construction and make ideal-gas endpoint constraints explicit; no probability calculus added.

Eigener Transfercheck: Exchanging two labeled particles between halves changes the toy microstate but leaves the macro count 2/2; fixed N,V,mean energy can preserve equilibrium p,T.

## 15. b6dfd3e6-2dd3-5983-9a27-7e7db70e8db8 — revise

Vorher: Case 1 leaked 6/16 before requiring independent counting; modeling archetype lacked explicit model justification and validity challenge.

Entscheidung: Remove answer leakage, require assumptions and constructed counts, specify odd-N balanced range and challenge equal likelihood with unequal subvolumes.

Eigener Transfercheck: N=5 gives Ω2=Ω3=10, balanced-range probability20/32 versus two-extremes2/32; no single exact half state exists.

## 16. 77604656-7ffe-516c-8af3-7cbe7de2f2a4 — keep

Vorher: No necessary content correction: fixed N, classical ideal gas, unchanged T, product counting, logarithm and Nk_B=nR are present; two-step transfer is physically different from one-step derivation.

Entscheidung: Keep profile unchanged; first task derives the factor, independent second task tests multiplicativity versus additivity without dependence on the image layout.

Eigener Transfercheck: Compression V→V/2→V/4 gives factors(1/2)^N each, total(1/4)^N and ΔS=−Nk_B ln4; two entropy steps add to the direct result.

## 17. 23c5382a-4b0f-5715-84b5-cf87b8323152 — revise

Vorher: Case 1 expected vanishing terms though both supplied transfers were nonzero; rigidity alone was not enough to exclude every possible work form in case 2.

Entscheidung: Fit first expectation to signed70 J balance and move explicit zero-term reasoning to rigid/no-other-work versus insulated-piston transfer.

Eigener Transfercheck: 120 J heat in and50 J work out gives+70 J in both conventions; electrical work would invalidate inferring W=0 from rigidity alone.

## 18. 91b20476-12cf-50d6-880a-ea509ffe8a9a — keep

Vorher: No necessary content correction: total isolation, subsystem distinction and chronological prediction are explicit; friction transfer changes mechanism and boundary.

Entscheidung: Keep profile unchanged; proposed evidence is independent ordering/explanation, not copying a completed arrow-of-time graphic.

Eigener Transfercheck: A freely slowing block warms the included rough track; reversing only the block's position sequence omits the entropy-generating track. A written case can test this without the original raster.

## 19. 18058384-a1bc-5ba2-8f5d-1fe9498acbf0 — keep

Vorher: No necessary content correction: cyclic working medium, hot/cold reservoirs, necessary heat rejection and qualitative reversible maximum align with the goal.

Entscheidung: Keep profile unchanged; transfer changes cold-reservoir temperature and asks a qualitative bound prediction, not extra calculation.

Eigener Transfercheck: At fixed hot-reservoir temperature, a warmer sink lowers the reversible maximum; reduced friction can improve a real engine at unchanged temperatures but cannot raise that maximum.

## 20. 73b5af24-7750-520a-bb16-43136ce19a5c — keep

Vorher: No necessary content correction: fresh numerical data, matched reservoirs, uncertainty ranges and cautious attribution are demanded; second case challenges an apparent bound exceedance.

Entscheidung: Keep profile unchanged; data archetype has independent quantitative processing plus uncertainty/model checks rather than bare substitution.

Eigener Transfercheck: Case1 η lies[290/1020,310/980]=[0.2843,0.3163]; Carnot bound lies[1−302/598,1−298/602]=[0.4950,0.5050], so intervals remain separated. Fresh check with W=510±20 J,Q=1000±20 J and same temperatures givesη∈[0.4804,0.5408], overlapping the bound: no established violation.
