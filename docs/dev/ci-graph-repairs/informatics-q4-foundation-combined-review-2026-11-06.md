# Informatik Q4 und Grundlagen: gemeinsame Anwendungshypothese

Stand: 6. November 2026. **Dieser gemeinsame Kandidat ist historisch und
unverändert nicht angewandt.** Die sechs gewöhnlichen Grundlagenkorrekturen
wurden inzwischen [getrennt übernommen](informatics-german-foundation-application-2026-11-06.md).
Die aktuellen Quellen haben daher andere Hashes. Die neue Q4-Fassung benötigt
nach Korrektur der überbreiten alten Prüfungsvorpfade einen frischen Abgleich;
sie wird nicht durch Kopieren dieses älteren Vollquellenkandidaten übernommen.
Die [spätere tatsächliche Prologausführung](informatics-q4-prolog-execution-2026-11-06.md)
ergänzt die Inhaltsbelege, ohne eine Prüfungsfreigabe zu erteilen. Der
[vollständige Kandidat](informatics-q4-foundation-combined-candidate-2026-11-06.json)
komponiert **sieben Q4-Operationen und fünf gewöhnliche Voraussetzungskorrekturen**
feldweise auf derselben Quellbasis `5a1487a47e61f59fbc9dfcd71e350443ce3357da171f6507cd85cd6c3a785e7e`.
Alle zwölf Feldpfade sind disjunkt; Datei-, Goal-, Array- und Hashguards bestehen.
Nichts wurde angewendet. Beide Prüfungspayloads bleiben `draft`.

Im hypothetischen Ergebnis ändern sich sieben bestehende Goalpayloads, ein
neues GK-Assessment kommt hinzu und 275 vorhandene Goals bleiben vollständig
gleich. Die drei Vieweinträge sind exakt die bereits geprüften Q4-Einträge.
Die zurückgestellte Änderung an komplexen Zustandsdiagrammen gehört nicht zu
diesem Paket. Der [Fünferreview](informatics-foundation-prerequisite-review-2026-11-06.md)
begründet jede Vorbereitungskorrektur und grenzt offene Folgebefunde ab.

Von den 19 bisherigen Q4-Coverage-Kompetenzen ändert sich nur die unmittelbare
Vorbereitung von `a93357e9…` „Netz- und Systemsicherheit“. Deren neue Definition
wurde gegen Material C1, Lösung und Rubrik K09 **erneut inhaltlich geprüft**;
der [neue Successor-Beleg](informatics-q4-network-security-successor-review-2026-11-06.json)
ist positiv. Die alte 19er-Reviewquittung wird nicht geändert. Die übrigen 18
Definitionen, alle sechs GK-Kompetenzdefinitionen und sämtliche geprüften
Aufgaben-/Lösungs-/Rubrikbytes bleiben gleich. Separate IDs behalten separate
explizite Ergebnisse; es gibt keine automatische Passübertragung.

Die tatsächlichen Produktionsfunktionen wurden auf den vier nur lesend
eingeblendeten Kandidatendateien ausgeführt. Der
[Integrationsbeleg](informatics-q4-foundation-combined-integration-proof-2026-11-06.json)
enthält die vollständigen 35 vorherigen/nachherigen Targetmengen, sichtbaren
Baumdeltas, Compilerfindings und Implementierungsbindungen:

- Genau drei GK-Kontexte — HE, BY und kanonisch — tauschen die bisherige
  19er-Prüfung gegen die neue 6er-Prüfung. Die Targetzahlen bleiben 149, 149 und
  182. Die drei LK-Kontexte und die weiteren 29 Kontexte bleiben gleich.
- Alle 19 Composition-Views haben vor und nach der Änderung null Findings.
- Applicability wächst von 282 auf 283 Goals, weiterhin mit null Fehlern,
  null Warnungen und null Drifts. Alle 282 bestehenden berechneten
  Applicability-Mengen bleiben gleich. Zwölf Begründungsmengen ändern sich
  durch die echten Kanten-/Rootänderungen; ihre vollständigen Zu-/Abnahmen
  sind dokumentiert. **Es ist keine abgeleitete Applicability-Feldänderung
  vorgeschlagen.**
- Der einzige zusätzliche Diagnosehinweis ist `APV-202` für die bereits
  deklarierte teilweise BY-Mappingbasis des neuen GK-Ziels. Er bleibt sichtbar
  und ist keine neue amtliche Quellenfreigabe.
- Neun strikte Graphregeln bestehen. G17 bleibt mit denselben 62
  Endpunktpaaren offen; diese Hypothese stellt M6 noch nicht her.

Der [globale Abschlussbeleg](informatics-q4-foundation-combined-global-proof-2026-11-06.json)
prüft zusätzlich die Reihenfolge der beiden Reparaturen: Q4 verändert keine
Voraussetzungsabschlüsse bestehender Goals. Danach erzeugt der Fünferkern exakt
dieselben 20 Goal-/20 Atomic-Änderungen wie allein — 2.046 beziehungsweise 1.896
Entzüge, keine neuen Paare und keine fremden Fächer. Das neue GK-Assessment
erreicht über seine zwei konkret begründeten unmittelbaren Grundlagen weiterhin
historische Q3-/Ganzprüfungswege: 184 Goal- beziehungsweise 171 atomare
Voraussetzungen. Diese alten Vorpfade sind offengelegt, keine zusätzliche
GK-Coverage und kein implizites Mastery-Ergebnis. Ihre vollständige fachliche
Tragfähigkeit wird durch dieses Paket nicht behauptet.

Vor Anwendung bleiben Roots zweiter Gesamtblick, die tatsächliche
Schema-/QA-Prüfung und die ausdrückliche Inhaltsfreigabe der beiden getrennt
geprüften Assessments erforderlich. Alte Quellen-/Praxis-/Reviewbelege und
Lernerzustände werden nicht umgeschrieben. Die vier Dateien unter
`tmp/informatics-q4-foundation-combined/` sind ausschließlich hypothetische
Ergebnisdateien; die selbständigen Werte und erwarteten Ergebnishashes stehen
im versionierbaren Manifest.
