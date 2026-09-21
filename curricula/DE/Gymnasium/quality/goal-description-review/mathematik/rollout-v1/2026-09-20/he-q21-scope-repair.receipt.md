# B049 — HE Q2.1: begrenzter Scope-/Routen-Reparaturkandidat

Stand: 20. September 2026. Autor: `math_b049_scope_repair` (KI).
Status: **implementierter Kandidat; unabhängige Aufgabenprüfung und abhängige
Evidenzintegration noch offen**. Keine menschliche Freigabe, kein neuer
M7-Abschluss und keine Aussage über Produktion oder Remote-CI.

## Quelle und erneute fachliche Prüfung

Die historischen Dokumente vom 13./14. September bleiben unverändert:

- `../2026-09-13/he-q21-scope-repair.proposal.md`
- `../2026-09-13/he-q21-prerequisite-necessity.audit.md`

Die damaligen Vorschläge wurden nicht blind per Script angewandt. Erneut gelesen
wurden die aktuellen Zieltexte und Kanten, die aktuelle HE-Extraction und ihr
Mapping sowie der lokal vorhandene amtliche Lehrplan:

- `curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`
- SHA-256: `d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`
- Extraktion mit `pdftotext -layout`, physische und gedruckte Seiten 32, 40–41, 51.
- S. 40, Q2.1, grundlegendes Niveau: Kehrwert-/Wurzelfunktionen und Ableitungen;
  Transformationen einschließlich allgemeinem Term und Symmetriebegründungen;
  Umkehrfunktionen einschließlich Graphenbeziehung und Definitions-/Wertemengen.
- S. 41 beginnt ausdrücklich das erhöhte Niveau: natürliche Logarithmusfunktion,
  ln als Stammfunktion von 1/x, graphisches Verknüpfen/Verketten.
- E.3 S. 32 und Q4.1/Q4.2 S. 51 bestätigen den eigenständigen Parameter- bzw.
  Problemformulierungsbedarf; diese Kompetenzen benötigen nicht allgemein
  logarithmische Integration.

## 1. Sechs fachlich falsche Pflichtkanten entfernt

Keine Titel, Beschreibungen, IDs oder Bilder bestehender Ziele wurden geändert.
Die sechs Kanten waren noch exakt vorhanden; es wurden keine Ersatzkanten
erfunden. Das gilt fachlich kanonisch, also nicht nur für Hessen.

| Ziel | Entfernte direkte Voraussetzungen | Aktuelle fachliche Gegenprobe |
|---|---|---|
| `993a14e8-60f0-5764-9340-b2447a5fa84b` | `972cc7e8-be9c-444c-ba45-98e817b3cf14`, `91e2f564-3bc8-4924-af85-2a3fa84c1471` | Bei `f_a(x)=x²+a` bedeutet größeres a eine Verschiebung nach oben. Diese qualitative Deutung braucht keine vorherige Parameterkalibrierung oder vollständige Scharanalyse. |
| `c0e34fa8-fde5-5a4e-9b84-c5d5db719b58` | dieselben beiden Parameterziele | Die Formulierung eines Rechteckproblems mit `2x+2y=24`, `x,y>0` und Ziel `xy` maximieren ist schon vollständig, bevor das Modell gelöst wird; keine Funktionenschar ist notwendig. |
| `972cc7e8-be9c-444c-ba45-98e817b3cf14` | `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` | Scheitel (1,2) und Punkt (3,10) ergeben bei `a(x-b)²+c` die Werte `b=1,c=2,a=2`; dafür ist ln-Integration nicht erforderlich. |
| `91e2f564-3bc8-4924-af85-2a3fa84c1471` | `3bf1ce9e-f4d3-502e-9d6e-94f7b7f697d4` | Im Gewinnmodell `G_p(q)=pq-q²-20` beeinflusst p die optimale Menge `p/2` und den maximalen Gewinn `p²/4-20`; Bedeutung und Einfluss können ohne ln-Integration untersucht werden. |

Der zusätzliche historische Vorschlag zur Kante `91e2f564… → 71683f37…`
wurde **nicht** nebenbei umgesetzt. Andere breite Voraussetzungen sind dadurch
nicht fachlich zertifiziert. Die transitive Kopplung der vier bearbeiteten Ziele
an die ln-Stammfunktion entfällt; die Regression prüft das explizit.

## 2. Explizite gemeinsame Auswahl statt gemischtem Q2.1-Teilbaum

Nur diese vier Composition Views wurden geändert:

- `de-he-sekii-gk.view.json`
- `de-he-gk.view.json`
- `de-he-gk-g8.view.json`
- `de-he-gk-g9.view.json`

Jeweils wird die breite Referenz `5ebfc509-0b4c-5c60-befb-2477eb24d4b5`
durch die zehn aktuellen, direkt auf HE Q2.1 b1–b3 gemappten Atome ersetzt.
Die fünf Transformationsatome bleiben über ihren vorhandenen Cluster
`bf922603-bfb7-5107-9aa9-e270b519d239` zusammengefasst. Sieben ausdrückliche
LK-Atome und acht nicht direkt Q2.1-gedeckte Ergänzungen werden dadurch nicht
länger allein aufgrund ihrer gemeinsamen Parent-Zuordnung zu GK-Pflichtzielen.
Keine dieser Kompetenzen wird kanonisch gelöscht, umbenannt oder abgewertet.

## 3. Drei tatsächlich passende lokale Endpunkte

Die vorhandene Analysis-Aufgabe `bd2c5e29-31c6-58bf-9858-d08e9c8a32ad`
verlangt ln/Verkettung und behauptet zu breite Coverage; sie konnte deshalb
nicht unverändert als GK-Q2.1-Endpunkt übernommen werden. Vier bisher breit
eingeblendete Analysis-Aufgaben entfallen nur in den vier genannten GK-Views.
Die fünf vorhandenen Geometrie-/Matrixaufgaben bleiben dort unverändert.
Bestehende kanonische Aufgaben und alle anderen View-Referenzen bleiben erhalten.

| Neuer Assessment-Endpunkt | Tatsächlich geprüfte Inhaltsziele |
|---|---|
| `bbb340ed-1009-4966-ae96-bfea4437505a` — Kehrwertpotenzen und Quadratwurzel | `61686d85…`, `5dabf0b3…`, `6517427b…` |
| `46bb8422-a822-46e1-8bcc-8b6475994b3a` — unbekannten Graphen umformen | `dd6c5e08…`, `772b11c9…`, `a12bef54…`, `4c6369b0…`, `62a1c6f2…` |
| `1429363f-628f-4f42-80e5-8a9a935147cc` — Umkehrfunktion durch Einschränkung | `c15fe32d…`, `dbc13bb0…` |

Vollständige IDs, Aufgaben, Lösungen und Rubriken stehen in
`curricula/DE/Gymnasium/assessments/mathematik/he-q21-common-2026-09-20/candidate.md`
und identisch in den neuen `examData`. Sie stehen ausdrücklich auf
`needs_review`, nicht auf `released`. Gegenüber dem historischen Entwurf wurde
die Transformationsaufgabe um eine echte grafische Handlung und deren Rubrik
ergänzt: Graphenkompetenz wird nicht durch reine Textrechnung behauptet.

Die Aufgaben hängen unter dem separaten Cluster
`967d1863-1b9b-4798-8a35-ae4e9760e322` direkt an der kanonischen
Mathematik-Wurzel, mit expliziter Auswahl im jeweiligen Q2-Übungsabschnitt.
Der gemeinsame alte Q2-Aufgabencluster wurde nicht erweitert. Eine
`applicabilityMappingInheritance: boundary` verhindert die ungewollte Vererbung
breiter Parent-Quellenbindungen. Das Wurzelgewicht steigt um drei von 925 auf
928. **Keine neuen curricularAtomic-Inhalte:** drei `nodeKind: exam`-Endpunkte,
ein Cluster, null entfernte bestehende Ziel-IDs. Neue Semantic-Kind-Ledgereinträge
sind bei der gesonderten Integration noch zu ergänzen.

## 4. Gezielte Prüfungen

Bestanden:

- `app/node_modules/.bin/tsx app/scripts/testHessenMathQ21Scope.ts`
- `app/node_modules/.bin/tsx app/scripts/testCompositionProjectionRoles.ts`
  (inklusive unverändertem Hessen-Physik-Test).
- gezieltes ESLint für beide Testdateien und `git diff --check`.
- Read-only-DFS über den aktuellen Mathematikgraphen: `contains` und `requires`
  jeweils zyklusfrei (1187 Knoten), eindeutige Ziel-IDs.
- zusätzliche Read-only-Gegenprobe gegen `git show HEAD:<Pfad>` für alle
  88 Mathematik-Views: **84 andere Targetmengen identisch**; keine neue direkte
  fehlende Voraussetzungskante in den vier geänderten Views.

| View | Target-Knoten vorher → Kandidat | Hinzu / heraus | Neu fehlende direkte Kanten |
|---|---:|---:|---:|
| HE Sek II GK | 698 → 676 | 4 / 26 | 0 |
| HE GK | 1031 → 1009 | 4 / 26 | 0 |
| HE GK G8 | 980 → 958 | 4 / 26 | 0 |
| HE GK G9 | 1003 → 981 | 4 / 26 | 0 |

Das sind Projektionsknoten einschließlich Cluster und Aufgaben, **keine Änderung
des fachlichen M7-Nenners**. Der Regressionstest prüft vier fehlerfrei kompilierte
Views, alle zehn gemeinsamen Targets, echte Abdeckungslisten und Punktesummen,
die sieben LK-Atome auch gegen verstecktes `prerequisiteOnly`, unmittelbare
Voraussetzungen der zehn Ziele und drei Endpunkte, die entfallene ln-Kopplung
sowie sichtbare Memory-Unterstützung für alle verbleibenden
`memory_required`-Targets. Er ist in den vorhandenen
`test:composition-projection-roles`-Lauf eingebunden.

## Offene Integrationsgrenzen — nicht als erledigt zählen

- Unabhängige fachliche Aufgabenprüfung und erst danach explizite Freigabe.
- Neue Semantic-Kind-Einträge; gezielte Nachprüfung der vier geänderten
  Voraussetzungskontexte sowie tatsächlich betroffener Ziel-, Buchseiten-,
  View- und Reviewbindungen. Keine bestehenden QA-/Registry-Ledger wurden
  durch diesen Reparaturautor geändert.
- Vorbestehende direkte Scope-Lücken außerhalb dieses Eingriffs bleiben
  dokumentiert: Sek II GK 59, HE GK 72, G8 29, G9 30 Kanten. Insbesondere ist
  die historische Sek-II-Einstiegsfrage nicht durch erfundene Vor-Mastery gelöst.
- Alte überbreite Assessment-Coverage außerhalb der vier GK-Views, der
  Extraction-Seitenlocator b4–b6 (S. 41 statt S. 40) und der historische
  LK-Abdeckungsbefund zu Ableitungsgraphen bleiben eigenständige Prüfgegenstände.
- Vollständige Curriculum-Status-/Maturity-Floor-/Layer-A-Prüfungen und Builds
  führt der Hauptlauf gebündelt nach unabhängiger Prüfung und Integration aus;
  diese kurzen Prüfungen ersetzen sie nicht. Keine Maturity-Untergrenze senken.
