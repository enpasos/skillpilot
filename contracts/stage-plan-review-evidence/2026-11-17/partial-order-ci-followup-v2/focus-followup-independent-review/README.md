# Unabhängiger Runtime-Folgefund: needs_revision

Der kanonische J8-Test kann bestehen, obwohl die tatsächliche Lernansicht ihren Fokus verengt. Der Test verwendet inzwischen den Rohkatalog; `LearnerView` berechnet denselben Fokus aus dem bereits projizierten `goalIndexAll`.

`probe.ts` verwendet die wirkliche Reihenfolge aus `useAppCore`: Compositionprojektion → optionale Route → normalize → Personal-Curriculum-Projektion → `buildGoalContainsClosure`. S stammt vollständig aus der aktuellen View; L und sämtliche Zeugen werden eigenständig durch BFS auf allen21 unverfälschten kanonischen Katalogen bestimmt. Dies ist eine konsistente synthetische Fixture, keine Behauptung einer Backend-Ausführung.

- Generische Sek-I-View: S266, L342, erwartete J8-Basis40 Atome, tatsächlich28;12 gehen im Fokus verloren.
- Dieselbe View mit direkter J8-Route:0 von40.
- BY-GK: ohne Route40 von40; mit direkter J8-Route0 von40.

Beispiel: `15512e77` (Bruchterme addieren und subtrahieren) gehört über `0a154cbd → 15512e77` nachweislich zu L und zum kanonischen J8-Fokus, fehlt aber im Runtime-Fokus. Die Wiederherstellung in `applyPersonalCurriculumProjection` erfasst nur direkte `goalEntry`-Cluster. Ein versteckter persistierter kanonischer Fokus wird dadurch nicht vollständig rekonstruiert; eine direkte Route kann seine Kinder vollständig leeren.

Die Runtime muss den stabilen kanonischen Fokus unter der geschlossenen aktuellen Lernbasis erhalten. Dazu gehören echte Reihenfolgetests; der bisherige Rohkataloghash ist nur eine zusätzliche Invariante. Eine Route darf weiterhin keine fremden POnly-Ziele zu S machen. Keine Produktdatei wurde geändert. Der vorherige Reviewstand bleibt unverändert erhalten, sein Schluss zur Runtime ist durch diesen Gegenfall überholt.
