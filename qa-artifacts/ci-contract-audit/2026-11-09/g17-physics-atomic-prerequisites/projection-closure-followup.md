<!-- SPDX-License-Identifier: Apache-2.0 -->
# Physik: expliziter Voraussetzungsscope nach dem ersten nativen Lauf

Der erste tatsächliche native Physiklauf scheiterte an einer Rollenabweichung:
Ein echtes Ziel wurde vor dem Batch wegen eines nicht deklarierten
Voraussetzungsclusters blockiert, danach nicht mehr. Die anschließende
beidseitige Diagnose umfasst 178 Konfigurationen, davon 140 vollständige,
und 83.417 Rollenvergleiche. Sie findet 314 Zielpaare `false→true`,
74 Zielpaare `true→false` und drei reine Kontextpaare `false→true`.
Der ursprüngliche Fehler und alle Rohbelege bleiben erhalten.

Der gezielte Nachtrag deklariert 169 tatsächlich betroffene View/Ziel-Paare in
49 verfassten Physik-Views explizit als `prerequisiteOnly`: 64 Verweise auf drei
bestehende Cluster über `canonicalSubtree` und 105 Verweise auf sechs bestehende,
autoritativ als `curricularAtomic` klassifizierte Atome über `goalEntry`.
Zusammengesetzte GK/LK-Views erhalten keine zusätzlichen Pauschaleinträge.
Zwei weitere Clusterbindungen für Baden-Württemberg werden nicht übernommen:
Dort verändert sich nur die Prüfung eines nicht ausgewählten Kontextknotens.
Das tatsächliche Gravitationsziel bleibt vor und nach dem Batch wegen derselben
fehlenden atomaren Rolle `92d8f398…` gesperrt; eine zusätzlich entfallende rohe
Cluster-Anforderung wird nicht als gesonderte Scopepflicht konserviert.

Die sechs Atome gehören bereits zum vollständigen atomaren Bedarf vor dem
Batch. Der tatsächliche native Bedarfsvergleich bestätigt dies in 36 Scopes
für 74 betroffene Zielpaare und 218 Ziel/Voraussetzungs-/Scope-Paare. Es werden
keine neuen Abhängigkeiten, IDs, Inhalte, Fingerprint-Verträge oder
Lernendenzustände geschrieben.

Die bestehenden TypeScript-Autorenfunktionen und der Composition-Compiler
prüfen alle 49 Kandidaten. Der ungefilterte Autoren-Collector verliert dabei
**105 rohe Target-Zuordnungen in 30 Views**, exakt für diese nun expliziten
Atomrollen; neue rohe Targets und unerwartete Rollenänderungen gibt es nicht.
Dieser Rohunterschied bleibt dokumentiert. Er ist kein Nachweis eines Verlusts
von Lernzielen in einem tatsächlich aufgelösten Scope. Vorher-/Nachher-
Vergleiche der tatsächlichen Zielmengen, sichtbaren Bäume und GK/LK-Vereinigung
verwenden die bestehende native Projektion und bleiben bis zu deren Ergebnis
offen. Die atomaren Unterstützungsrollen werden ausdrücklich erweitert.

Eine allgemeine Ein-Zeilen-Korrektur im neuen nativen Test vergleicht die
Rollenverfügbarkeit nur für tatsächliche atomare Zielkandidaten. Der vollständige
atomare Bedarf wird weiterhin für alle Kontextatome geprüft. Sämtliche echten
Ziel-, Frontier-, Fehlrollen- und Completion-Kontrollen bleiben bestehen;
es gibt keine ID-Ausnahme und keine erwartete Ergebnisumkehr als Ersatz für
die Reparatur. Die vier historischen Regressionen bleiben erhalten.

[projection-closure-followup.json](projection-closure-followup.json) bindet die
49 View-Dateien, die Testkorrektur, die neun bestehenden IDs und die tatsächlichen
Diagnosen. Der große TS-Lauf, der neue native Lauf, frisches CQR nach dem
View-Nachtrag und Remote-CI sind getrennte Nachweise und bleiben bis zum
tatsächlichen Abschluss offen. Frühere CQR-Ergebnisse werden nicht als neue
Prüfung der geänderten Views ausgegeben.
