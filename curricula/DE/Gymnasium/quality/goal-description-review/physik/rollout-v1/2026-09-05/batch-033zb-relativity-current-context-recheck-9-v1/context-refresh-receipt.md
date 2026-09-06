# B033zb current-context preparation receipt

Prepared on 2026-09-05 from the current canonical Physics atlas. This is a new
immutable review input package for the same nine ordered goal IDs as
`../batch-033z-relativity-final-splits-current-recheck-9-v1.config.json`.
The short label B033zb avoids the already occupied B033za checkpoint batch.
It grants no review result, strict completion, approval, or rollout progress.

## Comparison method

Loaded the current full atlas with `loadGoalBookBuildInputs` from
`app/scripts/goalBookModel.ts`, then built the nine-goal subset with
`buildGoalDescriptionRolloutSubsetModel` from
`app/scripts/materializeGoalDescriptionRolloutBatch.ts`. For the old/current
comparison, the old book ID and title were retained so metadata renaming did
not obscure page-content differences. Every old page was compared recursively
with its current counterpart.

All nine goal fingerprints, titles, and descriptions remain unchanged.
Exactly three page fingerprints changed. The other six complete page objects
are identical: `19aef2ed-eb46-55b1-9486-ee83f7520bb6`,
`a9169a74-de19-54a9-a8ac-a2ce43c7342e`,
`6ebb6182-f221-5f4c-b112-4ac72b104321`,
`57ec031c-9a91-5331-81a7-6ef900f7c63e`,
`79da5c34-86b2-5c10-9726-9de886ccef7d`, and
`bfea7a23-1ce1-4a42-badd-1fc9bf30124a`.

## Exact changed pages

### a684bec1-ba59-59d0-98d2-4ca37236f64c

Relativitätspostulate formulieren und erläutern: `externalPrerequisites`
changed from `[]` to the single reference
`5c44b9ba-9b05-4774-95d5-073230d3fc4f`, titled
`Warum Physik? – Weltverständnis & Zukunft`, with canonical URL
`https://skillpilot.com/lernzielbuch?landscape=7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a&edition=curricular-atomic-v1#goal-5c44b9ba-9b05-4774-95d5-073230d3fc4f`.

- Old page fingerprint: `sha256:5f183afff92faef20f04631bffa1ba67beb06da0e3ded74cd7fba5a8b77944a3`
- Current page fingerprint: `sha256:0c319926e00d9d264022255df60af483d15d9455fc53e05969d4c7c3572b6071`

### 0c305cf9-3923-51cf-a9ae-5849edc99c9f

Längenkontraktion erläutern: `visualization` changed from `null` to an image
with title `Visualisierung: Längenkontraktion erläutern` and URL
`/assets/goal-visualizations/physik/0c305cf9-3923-51cf-a9ae-5849edc99c9f/0c305cf9-3923-51cf-a9ae-5849edc99c9f.jpg`.
Its exact alt text is: "Rechts werden ein Raumschiff mit Ruhelänge L₀ und ein
bewegtes Raumschiff mit kürzerer Länge L entlang der Bewegungsrichtung
verglichen. Ein Myonenbeispiel verweist auf experimentelle Zusammenhänge.
Links ist ergänzend die Zeitdilatation mit einer Lichtuhr dargestellt."
The current asset digest is
`sha256:6deadf30bfcc31b0248499633658df381af2b35a81a2003ca9f26bfcaae1470d`.
The existing status remains `qaStatus: review_candidate` and
`approvedForPublication: false`.

- Old page fingerprint: `sha256:f480c75d3e0548677ca303ac653fe96771947b8c672e61454bd114dfa7aa345e`
- Current page fingerprint: `sha256:c05b34c3890dda8f67d186583992c49afca30e69c2247449226068218d008453`

### 2239cb67-82cb-585f-ab82-e1f2510eb4f7

Relativistische Geschwindigkeitsaddition anwenden: `visualization` changed
from `null` to an image with title
`Visualisierung: Relativistische Geschwindigkeitsaddition anwenden` and URL
`/assets/goal-visualizations/physik/2239cb67-82cb-585f-ab82-e1f2510eb4f7/2239cb67-82cb-585f-ab82-e1f2510eb4f7.jpg`.
Its exact alt text is: "Zwei Inertialsysteme S und S′ mit einem Ereignis und
positiver Relativgeschwindigkeit v. Eine eigene Formelkarte zeigt die
kollineare Geschwindigkeitsumrechnung u′=(u−v)/(1−uv/c²); daneben stehen die
Lorentztransformationen als Kontext."
The current asset digest is
`sha256:4c71775fb31b57da660d291f3c66165ccdc31da35dba33969267a222947971d5`.
The existing status remains `qaStatus: review_candidate` and
`approvedForPublication: false`.

- Old page fingerprint: `sha256:b8fab644d278f197a413db41cb278ded085eac0830d8a4f550be77cfe27c2661`
- Current page fingerprint: `sha256:94816fc3ec49d1363c1e91188c938027d932015c64ac79aa679e4ee3354a5798`

## Preparation and validation evidence

The current full atlas contains 464 curricular atomic goals. Its model digest
is `sha256:291cea648caab00f64a56f2254e9b1af9671d38364a57645f1171eaf531b2006`;
the old B033z base digest was
`sha256:3774344fadcc817793163301c517521aae0d0d0f28b53336d2f945d94c33f10d`.
The old subset digest was
`sha256:695b7e0e53c4d5dffc50fc6a7c0a9ea2f54c1676197d031a4810e667c6195bca`;
the current subset under the old identity would have digest
`sha256:5a38907c3045eeca6a17932e63111fda33d0fce605e549d316b9832eb6e157bb`.

Existing prepare command, exit 0:

```text
Standalone goal-description batch prepared: physik-rollout-v1-batch-033zb-relativity-current-context-recheck-9-v1-20260905; goals=9; model=sha256:036852ba13891e715382a1d0471e078e4dda0de359ab9fb911f8d9de6a758ba1; bundle=sha256:e063b56b7d126b1e2cca338bb96dcd5ad04ff0b8252541b743fc288b4fb88ace
```

Existing check command, exit 0:

```text
Standalone goal-description batch valid: physik-rollout-v1-batch-033zb-relativity-current-context-recheck-9-v1-20260905; goals=9
```

`check` validates immutable package bindings. Current-source agreement was
checked separately through the fresh full-atlas/subset build described above.
After preparation, a second live full-atlas/subset build was compared with the
complete stored B033zb model using `stableGoalBookJson`; it matched exactly,
exit 0:

```text
CURRENT SOURCE MATCH PASS: all 9 pages and the complete prepared B033zb model exactly match freshly rebuilt current sources; digest=sha256:036852ba13891e715382a1d0471e078e4dda0de359ab9fb911f8d9de6a758ba1
```

Both `round-a/results` and `round-b/results` and the `resolutions` directory
are empty at preparation. No reviews were copied, created, or inferred.

The old config and all 28 files in its output directory were hashed before
and after preparing/checking the new package. The hash of the ordered
`[path, fileSha256]` list remained
`b1c706f338f876ffe441e226303acf4670a1630b2b6221f90d743b2de816171b`
across all 29 files. No old artifact bytes were changed.
