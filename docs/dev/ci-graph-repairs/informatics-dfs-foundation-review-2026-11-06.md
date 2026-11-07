# Informatik: Graphbegriffe als Vorbereitung der Kreis-/Brückenerkennung

Stand: 6. November 2026. **Der enge Ersatz ist fachlich begründet:**
`6d10ced5…` „Kreis- und Brückenerkennung“ kann statt der vollständigen
DFS-/BFS-/Kürzeste-Wege-Kompetenz unmittelbar `f0910b55…` „Graphbegriffe kennen“
verlangen. Der [gesonderte Vorschlag](informatics-dfs-foundation-repair-proposal-2026-11-06.json)
enthält genau ein geschütztes Array. Er ist nicht in den eingefrorenen
Zwölf-Operationen-Kandidaten eingemischt. Nach dem unabhängigen zweiten Blick
wurde diese eine Operation im begrenzten
[Grundlagenpaket](informatics-german-foundation-application-2026-11-06.md) angewandt.

Der vollständige Zieltext verlangt das **Erkennen von Kreisen und Brücken als
DFS-Anwendung**, keine Implementierung eines Suchalgorithmus. Knoten, Kanten,
Pfade und die Unterscheidung von Grapharten sind die passende vorhandene
Vorbereitung. Die DFS-Verfahrensidee kann Teil des eigenen Erwerbs sein:
Die Lernperson verfolgt einen noch unbesuchten Nachbarn, markiert den aktuellen
Weg, kehrt bei ausgeschöpften Nachbarn zurück und untersucht Rückverbindungen.
Das geht manuell oder iterativ; eine vorherige Rekursions-, Programmier- oder
Adjazenzlistenleistung ist vom unveränderten Text nicht gefordert.

Der Beleg enthält ein konkretes Beispiel mit Dreieck A–B–C–A und Schwanz C–D.
Die nachvollzogene DFS A,B,C,D liefert die Baumkanten A–B, B–C, C–D und die
Rückverbindung C–A. Damit werden der Kreis A–B–C–A und die Brücke C–D erkannt.
Die tatsächliche iterative Referenzspur und vier Kantenentfernungsprüfungen
stimmen überein. Dieses Beispiel zeigt eine tragfähige Erwerbsroute ohne BFS;
es ist keine neu freigegebene Prüfung und kein allgemeiner Wirksamkeitsbeweis.
Ein bloßes Beherrschen der Graphbegriffe besteht die Kreis-/Brückenerkennung
weiterhin nicht: Deren eigener vollständiger Nachweis bleibt erforderlich.

Die bestehende Kompetenz `881edb2d…` behält **DFS, BFS und kürzeste Wege mit BFS**
in unveränderter Bedeutung. Ihre direkte Anforderung im Q1-Assessment sowie
alle Coverage-IDs und Prüfungspayloads bleiben erhalten. Es entsteht weder
ein neuer DFS-Knoten noch eine Ziel-/Einheitenzerlegung. Der historische Hold
für das bloße Löschen der Q1→881e-Kante war daher richtig; dieser Vorschlag
behebt stattdessen die überbreite gewöhnliche Vorbereitungskante.

Der globale Replay zeigt sowohl allein als auch nach dem bestehenden
Zwölf-Operationen-Kandidaten genau **eine** geänderte Nachfragequelle:
Kreis-/Brückenerkennung selbst. Im Goal-Abschluss fallen der breite Suchknoten,
die Adjazenz-/OO-Darstellung und der Graphbegriffscluster weg; der konkrete
Graphbegriffsatom wird direkt erreichbar. Im atomaren Abschluss war dieser
Atom bereits enthalten: Dort gibt es **keine neue Anforderung**, nur den
Entzug der breiten Suche, der Implementierungsdarstellung und der zusätzlichen
Netzwerkmodellierung/-klassifikation. Alle anderen Quellen und vorhandenen
zyklischen Komponenten bleiben gleich.

Die alte Graphbegriffe→E-Prüfungsbrücke bleibt ein gesonderter offener Befund.
Der [tatsächliche Produktionscheck](informatics-dfs-foundation-production-proof-2026-11-06.json)
besteht die neun übrigen Graphregeln, behält aber 62 G17-Findings: Die direkte
Q1-Anforderung an das vollständige Suchziel ist jetzt über „Planarität und
Färbung“ (`8d7aacfd…`) redundant. Dieser andere gewöhnliche Vorpfad ist dadurch
nicht fachlich freigegeben und wird hier nicht gelöscht.
Vor Anwendung sind ein unabhängiger zweiter Blick, die tatsächlichen
Graph-/Applicability-/QA-Prüfungen und Roots bewusste Zusammensetzung nötig.
Die zwei vorhandenen A-/M-Bindungen wären wegen unveränderter Zieltextprojektion
nicht neu zu etikettieren; die Praxisbindung umfasst dagegen das geänderte
`requires`-Array. Historische Ergebnisse und Quittungen bleiben unverändert.
