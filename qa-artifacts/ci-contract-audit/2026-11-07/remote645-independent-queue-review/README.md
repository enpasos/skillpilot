# Independent review of the unapplied remote645 UI candidate

The within-scope burst repair is independently challenged by an actual native callback execution. After a context change A to B, the old in-flight A refresh consumes a legitimately queued B event and then discards it using its old scope key. B receives zero refreshes instead of one. The initial candidate remains unapplied.

`countercase.cjs` extracts and transpiles the actual candidate callback, executes native deferred promises and applies the real cleanup preconditions. `review.json` records the observed terminal execution and exact candidate/callback/script hashes. This is a deterministic callback counterexample; browser lifecycle acceptance still needs its own regression. The sealed original remote645 packet is unchanged.
