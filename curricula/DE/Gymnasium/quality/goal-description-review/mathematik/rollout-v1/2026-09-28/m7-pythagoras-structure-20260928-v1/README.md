# Pythagoras: eigenständige Konstruktion, Beweise und Kriterium

Implementierter AI-Arbeitsstand vom 28. September 2026. Keine menschliche
Freigabe und keine zentrale D/P/A/M/V- oder M7-Fertigmeldung. Die zentralen
Qualitätsnachweise bindet Root nach den finalen Bildern und Texten neu.

## Erhaltene Identität und echte Zieltrennung

`80956a2c` ist jetzt ein fachlicher Cluster. Er enthält das unveränderte
Rechenziel `4d78bbcc` sowie vier neue eigenständig prüfbare Atome:

| ID | Leistung | Verifizierte Geltung |
| --- | --- | --- |
| `3a69dab2` | Exakte Wurzelstrecke konstruieren und Konstruktion sichern | SL |
| `487ec508` | Satz des Pythagoras geometrisch beweisen | HE, RP, SH, SL |
| `6a3502ee` | Kehrsatz mittels Hilfsdreieck und Kongruenz beweisen | HE, SH, SL |
| `081c9802` | Rechtwinkligkeit aus Seitenlängen mit dem Kehrsatz prüfen | BB, BE, BW, HE, SH, SL |

Rechnung und geometrische Begründung des konkreten Ergebnisses bleiben im
vorhandenen `4d78bbcc`. Die beiden Beweise und die Anwendung des Kehrsatzes
werden jeweils getrennt geprüft; ein richtiges Zahlenbeispiel ersetzt
keinen allgemeinen Beweis. Der frühere Elterncluster `e6d4e44b` enthält das
Rechenatom über den neuen fachlichen Cluster genau einmal. Clustergewichte
wurden über eindeutige atomare Nachfolger berechnet.

Keine gespeicherten Lernstände wurden verändert. Alte Mastery unter der
früheren Bündel-ID erzeugt keine Mastery der neuen Atome. Die neue
Konstruktionskompetenz bleibt ein echtes Ziel; sie wird nicht durch
Retirement aus dem M7-Nenner entfernt. Die neuen Knoten haben eine explizite
Mapping-Vererbungsgrenze gegen sachlich zu breite Vorfahrenquellen.

## Quellenzuordnung

`source-edge-decisions.json` dokumentiert 22 einzeln entschiedene Quellen:
alle 14 früheren direkten Kanten des alten Atoms und acht eng erforderliche
weitere Beweis-/Kehrsatzquellen. Vorher-/Nachher-Kanten und fachliche Gründe
sind vollständig enthalten. Unbeteiligte Source-Zeilen bleiben erhalten.

- SL nennt die Wurzelkonstruktion auf S. 21 ausdrücklich und erlaubt
  Pythagoras **oder** Höhensatz. Das neue Atom nutzt den Pythagoras-Weg;
  diese Alternative erzeugt keinen zusätzlichen Höhensatz-Zwang.
- SL S. 20 nennt Satzbeweis, Kehrsatzbeweis und Anwendung des Kehrsatzes als
  einzelne Leistungen. Die zuvor falschen allgemeinen Assessment-/Cluster-
  Zuordnungen sind durch diese spezifischen Ziele ersetzt.
- HE KC S. 27 verlangt vollständige Beweise von Satz und Umkehrung. Diese
  spezifische Lücke ist jetzt durch beide neuen Beweisatome modelliert.
  Die G8-/G9-Quellen bleiben als Zeitzuordnung bei ihren konkreten Themen.
- BW 3.3.3(4) verlangt Rechnung und den Kehrsatz zur Orthogonalitätsprüfung.
  Die Anwendung wird gebunden; ein vollständiger Kehrsatzbeweis wird BW
  aus dieser Formulierung nicht zusätzlich als Pflichtziel zugeschrieben.
- BB/BE Kapitel 3.2, Niveau E, verlangt die Identifizierung rechtwinkliger
  Dreiecke durch die Umkehrung. Die zuvor unzutreffenden Flächen-, Körper-
  und Trigonometriekanten dieser konkreten Zeile wurden ersetzt.
- SH S. 41 verlangt Gültigkeitsnachweise von Satz und Umkehrung. Beide
  Beweisatome sind dort partiell gebunden; die Inhaltszeile zur Umkehrung
  trägt die Anwendung als eigenes Kriterium.
- RP S. 100 wurde im lokalen Original erneut geprüft. Die Extraktionszeile
  ist am Tabellenumbruch verkürzt; im vollständigen Kontext folgt auf die
  anschauliche Herleitung der Basis die Erarbeitung und Präsentation eines
  Beweises in der Erweiterung. Der konkrete Beweis ersetzt die bisherige
  allgemeine Prozessprüfung als fachlichen Beleg.

Amtliche Originale: [HE-KC](https://kultus.hessen.de/sites/kultus.hessen.de/files/2021-07/kerncurriculum_mathematik_gymnasium.pdf),
[SL-Lehrplan Klasse 9](https://www.saarland.de/SharedDocs/Downloads/DE/mbk/Lehrplaene/Lehrplaene_Gymnasium_neunjaehriges_23/Mathe/LP_MA_gym9_9_2025.pdf?__blob=publicationFile&v=3),
[BW 3.3.3](https://www.bildungsplaene-bw.de/BP2016BW_ALLG_GYM_M_IK_9-10_03),
[BB/BE-RLP](https://bildungsserver.berlin-brandenburg.de/rlp-online/c-faecher/mathematik).
Auch die lokalen RP-, SH- und BB-PDFs wurden mit Seitenkontext gelesen.
Die historischen BB-Alt-Landscape-Daten bleiben eine partielle Verbindung
zum Aggregat, kein amtlicher Quellenbeleg für einzelne neue Kinder.

## Views und reale Prüfungen

`view-scope-decisions.json` dokumentiert die gezielten Veränderungen an 54
Views: zulässige neue Ziele neben dem bereits vorhandenen Rechenziel;
explizite `prerequisiteOnly`-Grenzen bei sonst automatisch über gemeinsame
Cluster geerbten neuen Zielen und Aufgaben. SL-GK/LK erhalten erstmals die
ausdrücklich verlangte Wurzelkonstruktion an ihrer Jahrgang-9-Stelle.
Außerhalb der jeweils belegten Landesgeltung entstehen keine neuen
Pflichtziele. Bestehende Rechenkompetenz bleibt sichtbar.

Die alte Aufgabe `fbd97592` verlangt ausschließlich Kathetensatz,
Höhensatz und numerische Pythagoras-Kontrolle. `requires` und
`coveredGoalIds` verweisen jetzt auf `4d78bbcc`, nicht auf das alte Bündel.

Vier neue, jeweils einem Atom zugeordnete Aufgaben liegen im kanonischen
Jahrgang-9-Prüfungsordner. Jede enthält konkrete Aufgaben, vollständige
Lösungen, 10 Punkte und eine Bestehensgrenze von 8 Punkten. Die
Kernleistungsgrenzen sind in den Lösungen ausdrücklich genannt.
`reviewStatus: released` bedeutet aktive technische Verfügbarkeit dieses
AI-Arbeitsstands, keine menschliche Qualitätsfreigabe. Der Server erzwingt
die Gesamtpunktgrenze; die fachlichen Teilfallgrenzen stehen im Rubric.

| Inhaltsatom | Prüfungs-ID |
| --- | --- |
| `3a69dab2` | `e086671c-9f55-5d8b-8467-b6390dc6a879` |
| `487ec508` | `2686049c-2cb2-5595-be5b-4860c3ceb76b` |
| `6a3502ee` | `5c00b06d-9644-5e23-ac29-6ff1499ee0ca` |
| `081c9802` | `241915f4-8d90-5542-ac9c-230aa98bee39` |

Der Atlas referenziert die vier neuen Atome anstelle des ehemaligen Blatts;
das vorhandene Rechenatom bleibt an seiner bisherigen Stelle. Neue
SemanticKind-Bindungen klassifizieren diese Struktur und die Aufgaben;
sie ersetzen keine fachliche D-/A-/M-Freigabe.

## Bilder und Nachprüfung

Die exakten Bildmindestinhalte stehen in `visual-minimum-content.md`.
Das alte JPG wurde tatsächlich gesehen: Es bleibt als historische
Clusterorientierung mathematisch verständlich, passt aber wegen seiner
zweiten eigenständigen Rechenleistung nicht als aktives Bild des neuen
Konstruktionsatoms. Root ergänzt vier gezielte Bilder.

`testMathPythagorasStructure.ts` prüft alle authored Views auf explizite
Landesgeltung, vollständige neue Assessment-Routen und Mehrfachvorkommen,
die konkreten BB/BE/SL-Quellenkanten, die falsche Alt-Coverage und unabhängig
berechnete Aufgabenwerte. Es ist in `test:goal-book-model` eingebunden.
Abschließende Testresultate und Integrationsgrenzen stehen im separaten
Validierungsbeleg. Globale Duration-/Atlas-/CI- und aktuelle D/P/A/M/V-
Bindungen bleiben notwendige Integrationsschritte.

Der eigene Abschlusslauf ist grün: alle 88 authored Views, vier getrennte
Kompetenzen mit ihren Prüfungen, Quellen-Geltungsgrenzen und unabhängig
berechnete Beispiele. Die Schema-Prüfung bestand über 21.420 Dateien;
`git diff --check` bestand ebenfalls. Der Duration-Check stoppt derzeit an
der erwarteten veralteten globalen Canonical-Hashbindung während Roots
Bildintegration. Erst nach der anschließenden Regeneration ist erneut zu
prüfen, dass die erzeugten Views dieselben Scope-Grenzen bewahren.
