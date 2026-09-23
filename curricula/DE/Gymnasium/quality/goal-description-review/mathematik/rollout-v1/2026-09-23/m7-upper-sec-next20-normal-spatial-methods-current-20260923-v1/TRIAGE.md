# M7 Mathematik – nächste disjunkte Oberstufenrunde (20 Ziele)

Stand der Auswahl: 23.09.2026, 08:03 UTC. Die Ziel-IDs wurden aus den aktuellen `curricularAtomic`-Entscheidungen des kanonischen Mathematik-Graphen gegen die zentral registrierten D-Resolutionen, P-Evidence-Konfigurationen und das aktive In-flight-Ledger abgeglichen. Sie waren in keinem dieser drei Bereiche als erledigt beziehungsweise bereits beansprucht enthalten. Das ist eine **Vorbereitung**, kein fachlicher Abschluss; gültige ältere Einzelreviews oder historische Artefakte werden dadurch nicht umgeschrieben.

Die drei zusammenhängenden Review-Untergruppen teilen eine gemeinsame native Batch-Konfiguration, damit zwei unabhängige D-Runden auf genau demselben aktuellen GoalBook-Stand arbeiten können:

1. **Normalverteilung und stetige Zufallsgrößen (Q3 LK, 6):** `fd13605e`, `8c32d941`, `c406d5a0`, `55d0474b`, `a7778885`, `b431148b`.
2. **Räumliche Verhältnisse und Volumen (GLOBAL/Q2/Q4/J10, 8):** `3016ec37`, `0a846521`, `3256476b`, `fac75b4a`, `58f613da`, `f2a12269`, `a506fc1d`, `5619ca5b`.
3. **Strategie, Visualisierung und Funktionsscharen (Q4/E, 6):** `8b885220`, `d0475ed5`, `6fcd6a1a`, `fdce0ced`, `79444ef9`, `4b16fce6`.

Zustand der zugehörigen Lernzielbilder bei Prepare: 11 `available`, davon 1 bereits ausdrücklich `aiApproved:no` (`f2a12269`), und 9 `missing`. Die D-Runden dürfen dieses V-HOLD weder übergehen noch aus einem vorhandenen Bild automatisch eine Freigabe ableiten. P-Profile werden für diesen Batch erst nach eigenständiger fachlicher Bearbeitung erstellt.

Native Vorbereitung: `materializeGoalDescriptionRolloutBatch.ts prepare` und `check` erfolgreich; das GoalBook-Bundle liegt unter `bundle/`, die strikt getrennten Revieweingaben unter `round-a/` und `round-b/`. Bundle-Fingerprint bei Prepare: `sha256:e4997cd5104440d0ea9566e1cb471267cc39521ee1d695828ae21c97ce4dc0bc`. Erst nach dem erfolgreichen Check wurde **genau dieser eine Konfigurationspfad** in `in-flight-work-ledger.json` ergänzt; der native Ledger-Loader meldete 15 gültige aktive Batches ohne Zielkollision.
