# B033b: tatsächliche fachliche Gegenprüfung der fünf V2-Profile

Reviewer: `openai-codex-parent-b033b-current-pair`, 6. September 2026.
Dies ist eine AI-Gegenprüfung nach Lesen aller fünf vollständigen Kandidaten,
der zehn Beschreibungsrecords sowie der aktuellen Ziel-/Nachbarkontexte.
Keine weitere Blindrunde, menschliche Freigabe oder Runtime-Abnahme.

Unveränderte Autorvorlage:
`canonical-math-positive-understanding-evidence-rollout-v1-batch-033b-coordinates-lines-motion-5-v1.candidates.json`
unter `quality/goal-evidence/`, SHA-256
`863431be6337b48475d24de738d514a29586621e54e4b4624f829c29627eea2c`.
Der getrennte Autor hat keine Beschreibungsrunden oder bisherigen Profile
gelesen. Seine ursprüngliche Dissensnotiz bleibt erhalten.

## Fachlicher Befund

| Ziel | Geprüfte Fälle und Abgrenzung |
| --- | --- |
| `19f170e4…` | West-/Aufwärtsversatz ergibt (-4,0,2); bei ausdrücklich anderen Achsen bedeutet (0,3,-2) keinen Nord-Süd-Anteil, drei Meter West und zwei Meter abwärts. Vorzeichen, Reihenfolge und Null werden erklärt, nicht nur benannt. Übersetzungsrichtung und Achsenbedeutung ändern sich. Keine Addition, Betragsrechnung oder Bewegungsgleichung. |
| `57f6d5e4…` | A(2,-1,3), B(2,2,3) tragen eine y-parallele Gerade; C(-1,2,0), D(2,-1,2) eine nicht achsenparallele Gerade mit C in der xy-Ebene. Alle Koordinaten, erkennbare Einteilungen, Konstruktion und beidseitige Fortsetzung werden verlangt. Keine parametrische oder metrische Nachfolgerleistung. |
| `235ae698…` | (1,2,-1)+t(4,-2,4) trifft A bei 0, B bei 1 und (3,1,1) bei 1/2. In der frischen Darstellung (0,7,-1)+s(0,2,-1) liegen C bei -3 und D bei 0; s=-3/2 ergibt (0,4,1/2). Ganze Gerade über R, abgeschlossene Strecke mit passenden Grenzen; äquivalente Ansätze zulässig. |
| `b025df0c…` | Schnitt S(3,2,1) verlangt t=2 und s=1 und erfüllt alle drei Koordinaten. Beim frischen orthogonalen Richtungspaar widerspricht z: 0=1; deshalb windschief, nicht parallel. Im dritten Fall ist h echt parallel (Stützpunktprobe widersprüchlich), k identisch (Stützpunkt liegt bei t=2 auf g). Alle Richtungsvektoren sind ungleich null. Keine Schnittwinkel oder Abstände. |
| `ba343971…` | Ebenes Robotermodell liefert p(4)=(8,6)m. Aus Kameraorten bei 2s und 5s folgt v=(2,-1,0)m/s, p0=(0,5,5)m, p(4)=(8,1,5)m. Der ausdrücklich angenommene gleichförmige Zeitraum 0–6s trägt die Rückbestimmung des Anfangsorts; aus zwei Messpunkten allein wird keine Gleichförmigkeit behauptet. Einheiten, Vorzeichen und Zeitdifferenz sind konsistent. |

Alle elf Fälle wurden vollständig gelesen; erforderliche Erwartungen sind
abgedeckt. Je Ziel gibt es mindestens zwei unabhängig stellbare Fälle und
eine strukturell relevante Variation. DE/EN drücken dieselben Größen,
Operationen, Bedingungen und Ansprüche aus. Die mathematischen Kernrechnungen
wurden zusätzlich mit 14 erfolgreichen Node-Assertions am
`2026-09-06T06:20:45.441Z` gegengeprüft. Die Assertions ersetzen nicht die
vorangehende fachliche Prüfung von Sprache, Scope und Transfer.

## Profilautor-Dissens zu den vier Geradenfällen

Die aktuelle Source-Extraktion zu BW BP2016 §3.3.3(13) und das zugehörige
Mapping `bw-math-seki-bp2016-3-3-3-13-3e974763` binden gerade dieses Ziel an
die Untersuchung von Lagebeziehungen und gegebenenfalls Schnittpunkten.
Zusammen mit dem ausdrücklich räumlichen kanonischen Anspruch sind identische,
echt parallele, sich schneidende und windschiefe Geraden die vollständigen
Fälle einfacher Geradenpaare. Ihre Prüfung spendet keine fremde Kompetenz.
Die konkrete Quelle schreibt weder Abstands-/Winkelrechnung noch ein weiteres
Verfahren vor; diese werden auch nicht gefordert. Die fehlende ausgeschriebene
Fallliste im kurzen Zieltext ist deshalb kein Grund, die V2-Fallabdeckung
abzuschwächen oder den Zieltext erneut zu ändern.

Gelesene öffentliche Repository-Artefakte:

- `mapping/DE-BW/lower-secondary/bw_math_lower_secondary_source_extraction_to_canonical_math.review.json`,
  SHA-256 `360b0f404eb77f28f74e46b24318693aca336225d6a8044b6f52d8d18652d154`.
- `input/BW/lower-secondary/source-extraction/DE_BW_MATHEMATIK_SEKI_BP2016.source-extraction.json`,
  SHA-256 `853372a979a5a3b430f7c39d0288ef1f5343773bf4885213a00d29079ab6b834`.

Dies beantwortet den konkreten AI-Scope-Dissens; es ist weder eine erneute
vollständige Original-PDF-Prüfung noch eine Freigabe sämtlicher Bundesländer-
Zuordnungen. Die Kandidaten bleiben E1/G1 und materialisieren ausschließlich
als `needs_human_review` / `ai_candidate`. Gute Primärbilder bleiben
unverändert; aus dieser Text-/Profilgegenprüfung folgt keine neue Bildfreigabe.
