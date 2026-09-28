# Mathematik M7: commitfähiger Pausen-Checkpoint

Stand: 28. September 2026. Basis: `main` bei `3ef222952264` vor diesem
Arbeitsstand. **Die M7-Goal-Verfolgung bleibt pausiert.** Dieses Paket ist ein
lokal geprüfter Zwischenstand, weder ein M7-Abschluss noch eine Veröffentlichung.

## Aktueller Qualitätsstand

Der aktuelle Nenner umfasst 799 `curricularAtomic`-Ziele in 1203
Mathematik-Knoten. Die zentrale strenge D/P/A/M/V-Schnittmenge beträgt
**772/799 (96,6 %)**. Die einzelnen gültigen Gates betragen D 772, P 794,
A 799, M 799 und V 799; alle sechs erforderlichen technischen
Abschlussprüfungen bestehen und es gibt keine zentralen Blocking-Issues.
Mathematik hält damit die geschützte Stufe **M6**, aber nicht M7. Physik bleibt
bei 478/478 und M7. Das ist maschinelle Evidenz, keine menschliche Freigabe
oder Erprobung.

## Was dieser Checkpoint aktiviert

- Die begrenzte HE-LK-Q2.5-Aufgabe `7d160e08…` prüft die Flächen- und
  Volumenskalierung des Ziels `7d37513b…` direkt; die alte Pyramidenaufgabe
  beansprucht dieses Ziel nicht mehr. Die fachlich offene Begründung des
  LK-only-Scopes bleibt im [Abschlusskonzept](math-m7-concept-and-handoff-2026-09-28.md)
  dokumentiert.
- Sieben bereits aktive Mathe-Prüfungen wurden inhaltlich geprüft, Aufgaben,
  Lösungen und Rubriken nötigenfalls präzisiert und **nur maschinell** als
  `released` markiert. Der [Checkpoint-Vertrag](https://github.com/enpasos/skillpilot/blob/main/app/scripts/testMathCheckpointExamRelease.ts)
  hält IDs, bewertete Kernschritte, Punkteschwellen und Quellenbindung fest.
- Die Gültigkeit des bayerischen Mandelbrot-Ziels und seiner Prüfung erbt
  keine unpassenden breiten Q4.3-Quellenzuordnungen mehr. Die Tankprüfung
  folgt genau ihren bayerischen Voraussetzungen; der ausgeblendete
  historische Lagen-Cluster behauptet keine aktive landesweite Geltung.
  Für diese vier zuvor abweichenden Knoten bleiben keine APV-203-Befunde.
- Die bestehenden Scope-, Buch-, Bild- und Statusartefakte sind auf diesen
  Kanonstand nachgeführt. KI-geprüfte Bildkandidaten sind keine menschliche
  Bildfreigabe.

## Lokale Prüfung vor Übergabe

Bestanden: Graphvalidierung (593 Regeln), Composition Views (297),
Math-G8/G9-View-Parität (18 Varianten), Schemaprüfung (21 053 Dateien),
HE-Q2.4/Q2.5- und neue Q2.5-Scope-Regression (je 88 Views),
Sek-I/Sek-II-Routen, sieben Checkpoint-Prüfungsverträge, die zentrale
D/P/A/M/V-Berichtsprüfung, Anwendbarkeitskompilierung ohne Fehler,
Visualisierungs-Rolloutstatus und Dokumentationslinks. Der lokale
Lernzielbuch-Neubau samt Artefakt-Integritätsprüfung, Buchmodell-Test,
Frontend-Produktionsbuild, Backend-Integrationstest (35/35) und die
Curriculum-Statusprüfung mit neun geschützten Mindestständen sind ebenfalls
bestanden. GitHub-CI, Deployment, Coach-Host-Akzeptanz und menschliche
Erprobung sind dadurch nicht behauptet.

## Fachlich offen und erster Schritt nach Wiederaufnahme

27 Ziele fehlen noch in der strengen Schnittmenge, darunter fünf ohne
aktuelles P-Profil. Die Q2-Pyramidenaufgabe trägt weiterhin zu breite
Coverage; auch `2f8a3a90…` und die Spiegelungsidentität brauchen die
konzeptionell beschriebene Überprüfung. Der HE-LK-Status von `7d37513b…`,
die Quellen-/Landesscope-Fälle und die bayerische Kurs-UX bleiben getrennte
offene Entscheidungen. Die Kandidaten unter
`q2-geometry-terminal-repair-candidate-20260928-v2` sind **nicht** aktiv
integriert. Nach Commit und Push durch den Product Owner beginnt die
ausdrücklich wiederaufgenommene Goal-Verfolgung mit dem im
[Abschlusskonzept](math-m7-concept-and-handoff-2026-09-28.md) beschriebenen
Ziel-/Quellenentscheid, dann Scope und Q2-Aufgaben; erst danach werden
betroffene Nachweise gebündelt neu geprüft.
