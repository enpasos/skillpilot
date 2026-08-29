# Append-only Coverage Correction Review v2: E-Trigonometrie vertieft verknüpfen

Review date: 2026-08-28

Reviewer: internal focused mathematics coverage correction

Decision: `released_coverage_correction`

## Korrektur

- Die historische `simulated_review_v1.md` bleibt bytegleich und wird nicht überschrieben.
- Teilaufgabe 4 leitet das transformierte Modell `h(t)=12-10 cos(pi t/20)` ab. Damit wird die innere lineare
  Transformation tatsächlich geprüft; das vorhandene kanonische Ziel `58d2f963-4fb9-550d-a832-f5ac60808900` wird deshalb ergänzt.
- Genau dieses Ziel wird an derselben Position in `requires` und `examData.coveredGoalIds` eingefügt.
- Aufgabenstellung, Musterlösung, Scoring, Punktzahlen und Bestehensgrenze bleiben unverändert.

## Finale identische Abdeckungslisten

- `bbef7cf2-90fa-59fa-a115-8b651aab9231`
- `e28e906e-e4f4-5cb1-b4b1-9bdc67d2ef32`
- `3401d95d-2191-5929-ac78-4de51d71a6be`
- `58d2f963-4fb9-550d-a832-f5ac60808900`
- `56fba457-ab98-5b96-963e-ec284458c17f`

## Byte- und Inhaltsschutz

- `curricula/DE/Gymnasium/assessments/mathematik/sekii/e/trigonometric-understanding-model-derivative/draft_v1.md`: SHA-256 `243699d66802f0376b6c87c79796c0f9452acbfb82e42fb7c07a7f2edc6f437c`
- `curricula/DE/Gymnasium/assessments/mathematik/sekii/e/trigonometric-understanding-model-derivative/solution_v1.md`: SHA-256 `ff8951926fcc861055f935cc8298f9e18bcac2ede67436598ae2468e4da1cccb`
- `curricula/DE/Gymnasium/assessments/mathematik/sekii/e/trigonometric-understanding-model-derivative/simulated_review_v1.md`: SHA-256 `1bf0a22560eb1a1c99a214c28293d6fc1f44d0cda635490591de1984886523ad`
- `examData.taskContent`: SHA-256 `38dbe4a45f7cc2ff60565320933398304be3b202996b142fc07c8a3a42743aca`
- `examData.solutionContent`: SHA-256 `5303263a5e39d0d2ae87288762b195e44cd9fc2f1b0188f12970a08a050a8209`
- `examData.scoring` (kanonisches Stable-JSON): SHA-256 `4e1140a2f71b193a59778676f0f8d2c03d2f7d4163a4014b6aadd3d3e7658a93`

## Grenze

Diese v2-Korrektur ändert keine Aufgabe, Lösung oder Bewertungsrubrik und trifft keine neue
fachliche Freigabeentscheidung. Sie repariert ausschließlich die maschinenlesbare Coverage-
Kopplung des bereits freigegebenen Assessments.
