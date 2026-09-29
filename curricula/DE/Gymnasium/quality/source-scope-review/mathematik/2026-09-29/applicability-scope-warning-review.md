# Einzelprüfung der zehn Mathematik-APV-203-Scopewarnungen

KI-Prüfung am 29.09.2026. Dies akzeptiert zehn genau bezeichnete Compiler-/Autoren-Scope-Abweichungen als Zwischenstand; es ändert keine Zielgeltung, View, Quelle oder D/P/A/M/V-Freigabe. Keine menschliche Freigabe.

## Mechanismus und technische Grenze

Die Applicability-Override-Registry ist rein additiv und erzeugt APV-201; sie kann diese Überprojektionen nicht begrenzen. Deshalb bleibt sie unverändert. Die bestehende Warnungsakzeptanz wird ausschließlich für die zehn unten geprüften Ziele benutzt. Der Compiler bleibt unverändert und meldet die APV-203 weiterhin roh.

Die vorhandene CQR-501-Implementierung vergleicht Akzeptanzen nur über code/landscapeId/goalId/dimension/value. Sie prüft die zusätzlichen Evidenzhashes nicht automatisch. Die folgenden Bindungen werden in dieser Prüfung separat verifiziert; bei Änderungen an Geltung, Evidenz oder Views ist eine erneute Einzelprüfung nötig. Die Registry enthält den Goal-Input-SHA, den SHA des vollständigen kompilierten Goal-Reports, die Quellnotiz-Dateihashes und den SHA aller geprüften Mathematics-View-Dateihashes. JSON-Digests verwenden UTF-8, sortierte Objektkeys und kompakte Separatoren.

## Native Prüfung

Alle landesspezifischen Mathematik-Views wurden mit collectAuthoritativeTargetAtomicGoalIds (runtime projection) geprüft. Für keines der zehn Ziele wird ein Target außerhalb seiner expliziten Länder projiziert. Nationale Inhaltskataloge ohne jurisdiction wurden nicht als Landeslehrplan gewertet. Explizite stage-/LK-Grenzen bleiben in den jeweiligen Quellenentscheidungen und Views bestehen. Die Appicability-Kompilierung selbst ist weiterhin nur jurisdictionsbasiert.

| Ziel | Autorisierte Länder | Zusätzliche Compiler-Länder | Sichere Landes-Views mit Target |
| --- | --- | --- | --- |
| `06bdbecb-53e0-5ac3-992f-d6fd20555b59` | DE-BB, DE-BE, DE-BW, DE-SH | DE-BY, DE-HB, DE-HE, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | 11 |
| `2850e8f6-2330-50d3-a577-d519540d9924` | DE-BB, DE-BW, DE-HB, DE-HE, DE-MV, DE-NI, DE-NW, DE-RP, DE-SH, DE-SL, DE-SN, DE-ST, DE-TH | DE-BY | 63 |
| `5518ceb3-f668-5b52-a9b1-57653b16ca98` | DE-BB, DE-BE, DE-BW, DE-HB, DE-HH, DE-SH | DE-BY, DE-HE, DE-MV, DE-NI, DE-NW, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | 21 |
| `5f6496ef-e4d2-5341-8a2c-3293b2e4e25a` | DE-BW | DE-BB, DE-BE, DE-BY, DE-HB, DE-HE, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | 3 |
| `803d910d-96d1-5118-b9ca-29e93d0da76d` | DE-HE | DE-BB, DE-BE, DE-BW, DE-HB, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | 4 |
| `853905c5-e82b-592f-a485-1ff84c8bb22e` | DE-BB, DE-BW, DE-SL | DE-BE, DE-BY, DE-HB, DE-HE, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SH, DE-SN, DE-ST, DE-TH | 4 |
| `ad66009f-55fb-563f-ace0-dbfeae7c76c3` | DE-BW, DE-HH, DE-SH | DE-BB, DE-BE, DE-BY, DE-HB, DE-HE, DE-MV, DE-NI, DE-NW, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | 13 |
| `b43a1e45-f05c-4d78-8453-f6fa677dc24c` | DE-BW, DE-SH | DE-BB, DE-BE, DE-BY, DE-HB, DE-HE, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | 11 |
| `bea0e5a0-4833-5337-b6f1-7251b8cf8089` | DE-BB, DE-BW, DE-SL | DE-BE, DE-BY, DE-HB, DE-HE, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SN, DE-ST, DE-TH | 11 |
| `d3c42193-f1b7-5c6d-a991-bf034d99359f` | DE-HE | DE-BB, DE-BE, DE-BW, DE-HB, DE-HH, DE-MV, DE-NI, DE-NW, DE-RP, DE-SL, DE-SN, DE-ST, DE-TH | 4 |

## Einzelentscheidungen

### 06bdbecb-53e0-5ac3-992f-d6fd20555b59 — Tangenten als lineare Approximationen nutzen

Broad ancestor mappings import linear approximation into other jurisdictions; the original-page review supports the whole atom only in BW SekI and BB/BE/SH SekII LK. The corrected BE original is printed p27/PDF29. Narrow authored scope and LK-only views are retained. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/mapping/mathematik-j10-analysis-source-stage-decisions-20260929.md`.

### 2850e8f6-2330-50d3-a577-d519540d9924 — Monotonie und Extrema mit der ersten Ableitung untersuchen

BY M11.4.2 has a real partial mapping for local extrema but does not establish the whole atom including global comparison. Preserve that partial source evidence without promoting the whole atom to a BY target; the documented BY whole-atom HOLD remains open. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/mapping/mathematik-j10-analysis-source-stage-decisions-20260929.md`.

### 5518ceb3-f668-5b52-a9b1-57653b16ca98 — Funktions- und Ableitungsgraphen in Beziehung setzen

The surplus countries come exclusively from requires-closure of ad66009f. Prerequisite support is not an independent curricular source target. Preserve BB/BE/BW/HH SekI and HB/SH SekII targets documented by the original-page review. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/mapping/mathematik-j10-analysis-source-stage-decisions-20260929.md`.

### 5f6496ef-e4d2-5341-8a2c-3293b2e4e25a — Aufgabe 14 (Jahrgangsstufe 9, BW, 8 BE)

This new J9 midpoint exam inherits old broad mappings through shared year/exam ancestors. Its actual spatial-midpoint task is BW SekI only. BB/SL teach the midpoint atom in SekII, which does not authorize this BW J9 exam there. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/quality/assessment-review/mathematik/bea-crossstage-source-and-j9-route-20260929-v1/decision.md`, `curricula/DE/Gymnasium/assessments/mathematik/vector-shared-operations-2026-09-28/j9-stage-split-ai-review-2026-09-29.md`.

### 803d910d-96d1-5118-b9ca-29e93d0da76d — Parallelprojektionen auf Ursprungsebenen mit Matrizen darstellen (LK)

The overprojection combines requires-closure from generic terminal 81823f27 with legacy NI partial mapping 67bd9b91. NI supports a narrower 2x3 drawing-plane projection and optional further maps, not arbitrary origin-plane R3 endomorphisms; HE Q2.5 LK is retained. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-09-29/q2-matrix/decision.md`.

### 853905c5-e82b-592f-a485-1ff84c8bb22e — Aufgabe 6 (Jahrgangsstufe 9, 13 BE)

The compiler intersects prerequisite jurisdictions but has no stage/course scope in that calculation. Broad shared vector prerequisites therefore overproject the source-reviewed J9 task; explicit BB/BW/SL scope from the reviewed v4 route is retained. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/quality/assessment-review/mathematik/bea-crossstage-source-and-j9-route-20260929-v1/decision.md`, `curricula/DE/Gymnasium/assessments/mathematik/vector-shared-operations-2026-09-28/j9-stage-split-ai-review-2026-09-29.md`.

### ad66009f-55fb-563f-ace0-dbfeae7c76c3 — Wendestellen und Krümmungsverhalten mit Ableitungen beschreiben

Broad ancestor cluster mappings import the atom into other countries; direct source-stage review supports BW/HH SekI and SH SekII. Those authored placements and view roles remain authoritative; this acceptance does not validate the broader inherited mappings. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/mapping/mathematik-j10-analysis-source-stage-decisions-20260929.md`.

### b43a1e45-f05c-4d78-8453-f6fa677dc24c — Tangenten- und Normalengleichungen in einfachen Fällen aufstellen

Inherited cluster mappings plus requires-closure of 06bdbecb overproject the whole tangent-and-normal competence. The reviewed whole-atom targets remain BW SekI and SH SekII. A related tangent prerequisite is not evidence for the full normal-line competence in another land. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/mapping/mathematik-j10-analysis-source-stage-decisions-20260929.md`.

### bea0e5a0-4833-5337-b6f1-7251b8cf8089 — Mittelpunkte von Raumstrecken aus Koordinaten bestimmen

The surplus jurisdictions arise solely from requires-closure of the overprojected BW J9 exam 5f6496ef. Original sources support BW SekI, BB Q3 and SL SekII; cross-stage placements preserve the same stable atom without inventing J9 targets for BB/SL. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/quality/assessment-review/mathematik/bea-crossstage-source-and-j9-route-20260929-v1/decision.md`.

### d3c42193-f1b7-5c6d-a991-bf034d99359f — Fixpunkte linearer Abbildungen bestimmen (LK)

The surplus jurisdictions arise solely from requires-closure of generic terminal 81823f27. The original audit supports the linear geometric fixed-point atom in HE LK. RP affine fixed elements are handled by separate new A1 atoms, not by granting this linear-only atom general RP applicability. Current native view audit found no target outside the authored jurisdictions. This is a reviewed warning acceptance, not approval of the compiler surplus as curriculum coverage.

Quellenentscheidung: `curricula/DE/Gymnasium/quality/source-scope-review/mathematik/2026-09-29/q2-matrix/decision.md`.

## Verbleibende technische Arbeit

Breite Ancestor-Mappings und didaktische requires-closure müssen künftig curricularen Target-Scope von bloßer Voraussetzungsgeltung unterscheiden. Bei Assessments muss die explizite Quellen-/Stufengrenze zusätzlich zur prerequisites-Intersection gelten. BYs Teilumfang und die NI-Legacy-Kante dürfen nicht durch eine pauschale Compiler-Übernahme zu Vollbelegen werden. Diese Akzeptanz repariert weder diese Modellgrenze noch historische unpassende Mappingdetails.
