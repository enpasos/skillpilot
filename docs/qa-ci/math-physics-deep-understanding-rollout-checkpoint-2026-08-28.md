# Mathematik/Physik Deep-Understanding-Rollout – Checkpoint 2026-08-28

## Zweck und Stop-Grenze

Dieser Stand ist ein lokal reproduzierbarer, commit- und deployfähiger
Zwischenstopp. Das langfristige Ziel von 100 Prozent bleibt aktiv; in diesen
Checkpoint werden jedoch keine weiteren Lernziele, Graphkanten oder
Visualisierungen aufgenommen.

Es gilt weiterhin **KEEP by default**: Nur eine konkret belegte fachliche,
sprachliche oder strukturelle Schwäche rechtfertigt eine Änderung. Die
ursprünglichen Nenner 780 Mathematik und 426 Physik sind durch notwendige,
fachlich adjudizierte Aufteilungen nicht mehr aktuell. Maßgeblich ist der
gegenwärtige kanonische Bestand.

Codex hat nicht gestagt, committed, gepusht oder deployt.

## Strenger Fortschritt

| Fach | Vollständig durch alle Rollout-Gates | Fortschritt | Beschreibungen | Understanding-Evidence V2 | Atomicity | Memory | Visualisierung |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Mathematik | 113 / 792 | 14,3 % | 113 | 113 | 792 | 792 | 792 |
| Physik | 104 / 447 | 23,3 % | 104 | 104 | 447 | 447 | 447 |

Der zentrale Deep-Understanding-Check meldet **0 Blocking Issues**. Alle neun
geschützten Curriculum-Reifegraduntergrenzen bestehen; Mathematik und Physik
bleiben auf **M6**.

## In diesem Checkpoint stabilisierte Änderungen

- In Mathematik wurde das zu breite Volumenziel fachlich in zwei atomare
  Kompetenzen für einfache Quader-/Würfelvolumina und zusammengesetzte
  Quaderkörper aufgeteilt. Quellenmappings, Views, Voraussetzungen,
  Assessment und Review-Evidenz wurden gemeinsam neu gebunden.
- In Physik wurden zwei zu breite Kernphysikziele als Cluster adjudiziert und
  in fünf prüfbare atomare Ziele aufgeteilt. Zwei lokale Assessments,
  Quellenmappings, Composition Views und Applicability wurden konsistent
  nachgeführt.
- Die bundesweite Physikprojektion wurde für 13 belegte
  Applicability-Abweichungen korrigiert. CQR-104 und CQR-501 bestehen wieder
  ohne aktive Physikwarnung oder Routefehler.
- Kontext-Fingerprints wurden nur dort neu gebunden, wo sich durch die
  Applicability-Korrektur der kanonische Kontext geändert hatte; die bereits
  reviewte Lernzielsemantik blieb dabei unverändert.

## Bildregel

Die aktiven Mathematik- und Physikvisualisierungen wurden in diesem
Abschlusslauf weder ersetzt noch neu erzeugt. Die drei relevanten Quell- und
Runtime-Bäume sind ohne geänderte oder unversionierte Bilddateien. Gute
Nano-Banana-Pro-Bilder bleiben erhalten; repo-native Bilder sind weiterhin nur
bei dokumentierter Providergrenze zulässig.

## Lernzielbücher

| Fach | Seiten | Modelldigest | Modell-SHA256 | PDF-SHA256 | Manifest-SHA256 |
| --- | ---: | --- | --- | --- | --- |
| Mathematik | 792 | `sha256:cf69aed5fcb87652037a2d015626bf86e7364876ac466ad26e663768c3e4589c` | `08aefa88755ca88fc71f41ab8dcd32971e1ba1ccd51831f95f03cb1b192a5691` | `b09871c3c41f1e898c0c4d58dfb2e6bd5ce7d41efac0772d14107ec241e99c6b` | `0dabe15f668ed643ebd685b273c9fe03b647d6410ddd3842f7b14ac92b74e186` |
| Physik | 447 | `sha256:c162a9203ddd2e0a98c3c60aee6d41138aab649e274d0424e558497d9677fd2c` | `0460f694c623412d422ef12b5e2b03f6cb79d8db1b83d9f5206f49fc133bc881` | `94d06a7697c29910eae54adb67e5fb948803f2a4a4b3e7e223f299922da663ae` | `1921e96cae39bdb50088f7dab65802a1ecb050f1a8e6fbd749de902d51ef8efb` |

Die Mathematikartefakte und ihr Indexeintrag blieben während der isolierten
Physik-Neupublikation byteidentisch. Der Produktionsbuild enthält danach eine
bytegleiche Kopie des vollständigen Verzeichnisses `app/public/lernzielbuch`.

Nach dem Deployment sind die vorgesehenen URLs:

- `https://skillpilot.com/lernzielbuch`
- `https://skillpilot.com/lernzielbuch/de-gym-mathematik-bundesweit.pdf`
- `https://skillpilot.com/lernzielbuch/de-gym-physik-bundesweit.pdf`

## Bestandene Abschlussprüfungen

- deterministische Dry-Runs der Mathematik-Batch-012- und
  Physik-Batch-017-Applier
- zentraler Deep-Understanding-Check: 0 Blocker
- Curriculum-Status und neun geschützte Maturity Floors
- vollständige Lernzielbuch-Pipeline einschließlich zweier Reviewrunden,
  Understanding-Evidence V2, Publikation, Runtime und Workbench-Links
- Produktionsbuild und Parität der deploybaren Lernzielbuchbytes
- öffentliche Quellenrationalen und gebautes Runtime-Artefakt
- KI-Transparenzinventar, Frontend-Shell- und Transparenzartefakt
- OpenAI-Coach-v1-Review-Freeze
- `git diff --check`, leerer Git-Index und unveränderte Visualisierungsbäume

## Ressourceneffiziente Fortsetzung

1. Mit dem zentralen Rollout-Check die Ausgangswerte 113/792 und 104/447
   bestätigen.
2. Pro Fach einen fachlich zusammenhängenden Batch bilden. Eindeutige
   KEEP-Kandidaten dürfen in größeren Batches geprüft werden; mögliche Splits,
   Quellenkonflikte und fachliche Grenzfälle gehen in kleine Tiefenbatches.
3. Beide unabhängigen Reviewrunden parallel auf demselben unveränderlichen
   Evidenzpaket ausführen. Reviewer B erhält keine Ergebnisse von Reviewer A.
4. Nur Dissens, konkrete Schwächen oder strukturelle Folgen in die aufwendige
   Synthese und Adjudikation geben.
5. Fingerprint-stabile Entscheidungen nicht erneut erzeugen. Nach echten
   Kontextänderungen ausschließlich die betroffenen Bindungen aktualisieren.
6. Pro Batch gezielte Tests ausführen; Lernzielbücher, vollständige Pipeline,
   Build und Freeze erst am nächsten stabilen Checkpoint erneut materialisieren.

Commit-Message-Vorschlag:

```text
feat(curriculum): stabilize math and physics deep-understanding checkpoint
```
