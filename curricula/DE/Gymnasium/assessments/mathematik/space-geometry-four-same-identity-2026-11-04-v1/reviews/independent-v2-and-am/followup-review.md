# Gezielter v2-Folgereview und acht A/M-Revalidierungen

Reviewdatum: **4. November 2026** (Europe/Berlin; Prüfung nach Mitternacht).
Reviewer: `/root/astra_space_geometry_four_forms`, unabhängiger maschineller Review.

**PASS für die vier effektiven vollständigen Prüfungsformen. F-PLANE-01 ist
geschlossen.** Der neue DE/EN-Satz erfasst das vollständige Fehlen des
Sonderfalls a=1/F unabhängig von seiner Ursache. Der dokumentierte
15-Punkte-Gegenbeleg erhält nun höchstens 14 Punkte und besteht nicht.
Eine knappe begründete Identität E₁=F an beliebiger Stelle genügt weiterhin;
ein lokaler Rechen-/Übertragungsfehler allein löst keine Kappung aus.
Richtige Folgearbeit bleibt anzuerkennen, ohne denselben Ursprungsfehler
mehrfach abzuziehen.

Geprüft wurden die zwei geänderten Rubriken, ihre beiden Einbettungen und die
Vertragskopien mit `missing-or-invalid-special-case-a1`. Genau fünf deklarierte
Ersatzdateien ändern sich. Alle 52 v1-Dateien und die drei anderen Formen sind
unverändert. Die v1-Prüfung der unveränderten Mathematik, DE/EN-Texte und
Darstellung wird weiterverwendet; sie wurde nicht unnötig wiederholt.
Eigene gezielte Fallurteile stehen in `v2-content-followup-review.json`.
Die Zahlen hypothetischer Autorprofile wurden nicht als Bewertungsautorität
übernommen; bei einem lokalen Fehler richtet sich der konkrete Abzug nach
der tatsächlichen Abgabe und der bestehenden Folgefehlerregel.

**PASS für genau acht A/M-Revalidierungen.** Die neuen Entscheidungen behalten
jeweils `atomic` / `semanticAtomic: true` und `no_memory_needed` /
`memoryUseful: false` bei, mit neuem tatsächlichem Reviewdatum, Reviewer und
individuellem inhaltlichem Grund.

| Kompetenz | Fachliche Einheit | Warum kein eigenes Gedächtniskartendeck? |
|---|---|---|
| Geradlinige Bewegung | Anfangsort, zeitabhängiger Ort und gerichtete Änderung pro Zeit sind Teile desselben Bewegungsmodells. | Modell und Einheiten müssen verstanden und aus Daten angewendet werden; kein zusätzlicher notwendiger Faktenbestand. |
| Spurpunkte | Alle Koordinatenebenen und Sonderfälle sind Varianten derselben Schnitt- und Zugehörigkeitsuntersuchung. | Ebenenbedingungen sind aus Koordinatenbedeutung ableitbar und gegeben; Parameterlösung und Probe erfordern Anwendung. |
| Geradenschar | Parameterbedingungen, Lagefälle und ihre Deutung bilden eine zusammenhängende Scharanalyse. | Fälle und Parameter werden aus der jeweiligen Schar hergeleitet; kein sinnvoller eigener Abrufkatalog. |
| Ebenenschar | Normalen, Ausnahmefälle, gemeinsame Achse und Lagebedingungen untersuchen dieselbe parameterabhängige Konfiguration. | Achse, Ausnahmeparameter und Punktbedingungen sind problemabhängige Herleitungen, keine Liste dauerhaft zu memorierender Ergebnisse. |

Grundlage waren die ganzen unveränderten Zielkompetenzen, die schon vollständig
geprüften Formen, AGENTS §7.1/7.2, das Atomicity-Reviewdokument und die aktiven
Reader. Beide Reader berücksichtigen die authoritative `curricularAtomic`-
Bindung vor ihren generischen `examData`-Ausschlüssen. Die vier Ziele bleiben
deshalb Teil der bereits festgelegten curricularen Population von 807; die
Prüfungsrolle entfernt oder klassifiziert sie nicht um.

Die Fingerprintfunktionen wurden unabhängig direkt aus den aktuellen
TypeScript-Readern ausgewählt und ausgeführt. Alle acht alten und neuen
Fingerprints stimmen. Ihr einziger semantischer Payload-Unterschied ist
`nodeKind: "" → "exam"`. Das bestätigt die Bindung, ersetzt aber nicht die
acht oben begründeten Inhaltsentscheidungen.

`am-revalidation.json` enthält die acht alten vollständigen Zeilen und die
acht vollständigen freigegebenen Ersatzzeilen. Ausschließlich `fingerprint`,
`reviewedAt`, `reviewer` und `reason` ändern sich. Die alten Daten und Reviewer
werden nicht als neue Prüfung ausgegeben. Die spätere Materialisierung darf
je vier Zeilen in zwei additiven vollständigen 807-Zeilen-Snapshots ersetzen;
alle übrigen Rohzeilen bleiben bytegleich, die bisherigen Dateien erhalten.

Gebundene Ergebnisse:

- `v2-content-followup-review.json`: SHA256
  `3aafff6df0cc7d405e76c952071c5753e95ccaaa22f43d265d08199f9cf888cd`.
- `am-revalidation.json`: SHA256
  `27ce83979afc96316479119a27f1254c6d18a87059f732baf1d9775fe116fe62`.

Keine kanonische Datei, registrierte Konfiguration, Reviewhistorie oder
Gitdatei wurde durch diesen Reviewer geändert. Technische Integration,
reguläre Abschlussprüfungen und M7-Abschluss bleiben nachgelagerte Arbeit.
