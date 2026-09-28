# `0f4f9957…`: aktuelle Ebene–Ebene-Fassung, D noch offen

Der neue kanonische Titel, beide Beschreibungen, der `sourceRef` und das
ersetzte PNG beanspruchen einheitlich die **Lagebeziehung zweier Ebenen**.
Die alte Formulierung im Titel über „Geraden und Ebenen“ und das alte JPG
gehören nicht zur aktuellen gebundenen Seite. Deshalb sind die früheren
`block`/`block`-Runden ein nützlicher Fehlerbefund, aber keine aktuelle
D-Entscheidung.

## Fachlicher Quellenbefund

- [Hessen, KCGO Mathematik 2024, Q2.3, gedruckte S. 43](https://kultus.hessen.de/sites/kultus.hessen.de/files/2024-11/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf)
  führt auf erhöhtem LK-Niveau die Ebene–Ebene-Lage, das systematische Lösen
  des zugehörigen LGS und die geometrische Lösungsdeutung gemeinsam auf.
  Die aktuelle DE/EN-Beschreibung bildet diesen einen Zusammenhang ab.
- Das aktuelle Bild `0f4f9957….png` rechnet für
  `E1: x+y+z=3` und `E2: x−y+z=1` korrekt `y=1`, `x+z=2` und die
  Schnittgerade `X=(2;1;0)+t(−1;0;1)` her. Es zeigt den Schnittfall als
  Beispiel. Für eine unabhängige Verständnisprüfung sind zusätzlich
  **echt parallele und identische Ebenen** als Transferfälle nötig.
- [Bayern, LehrplanPLUS M13.3](https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/13/mathematik)
  verlangt im Pflichtfach mit erhöhtem Anforderungsniveau systematisch
  begründete Lageentscheidungen für Ebenen. Die bestehende BY-Mappingzeile
  `0ef5009c…` → `0f4f9957…` ist aber ausdrücklich nur `partial`: Der
  kanonische Zusatz zum LGS und zur geometrischen Lösungsmenge steht dort
  nicht vollständig in diesem einen Quellensatz. Eine mögliche
  kombinierte Quellenbegründung muss vor dem BY-Placement geprüft werden.

## Offene Bindung

Das vorbereitete Ein-Ziel-Buch bindet die aktuelle Beschreibung und das
PNG (`BookModel` `sha256:da5d175cd5a4234664bcb72f1ac6770589fe7b7c1f9de360d460c5aa89110e92`,
Seite `sha256:77d8e56e58cb4b79ebc089580989458e8f81cbf0d926fa4126520d1a134abddc`).
Es projiziert derzeit BW/HE/SH als LK; Bayern erscheint auf der Seite nicht.
Die kanonische `requires`-Liste enthält außerdem `36e0de23…` („Normalenform
und Hessesche Normalenform … (LK)“), obwohl die Lagebeziehung zweier Ebenen
per Gleichungssystem keine Hessesche Normalenform voraussetzt. Dazu kommen
weitere Vorgänger, die in der technischen BY-GK-Projektion fehlen. Diese
fachliche Route und die BY-Zuordnung müssen vor einer stabilen neuen
D-Seite geklärt werden.

Es wurden **keine neuen A/B-Review-Records** und keine D-Registrierung
geschrieben. Nach Quellennachweis, Prerequisite-/Placement-Reparatur und
erneutem Bauen des bounded-atlas-Pakets sind zwei frische voneinander
unabhängige Runden und die Synthese nötig. Der vorbereitete Digest darf
nach jeder relevanten Seitenänderung nicht weiterverwendet werden.
