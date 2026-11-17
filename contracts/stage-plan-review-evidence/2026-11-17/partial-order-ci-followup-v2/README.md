# CI-Nachtrag und kanonischer Lernfokus

Der vollständige zweite PR-Lauf 44037739517 auf
`bce7769b25b5c4f37dc68dace3484d21b590b5d6` endet mit elf erfolgreichen
und drei fehlgeschlagenen Jobs. Die drei konkreten Fehlerauszüge und der
terminale Jobbestand sind enthalten. Dieser Nachtrag liefert keinen
erfolgreichen Remote-Gesamtlauf und keine Integration auf main.

Die Korrektur aktualisiert den generierten Dauerbericht und installiert die
vorhandenen Python-Paketabhängigkeiten auch im integrierten Baujob. Sie
behebt außerdem einen tatsächlich reproduzierten Fokusfehler: Die
kanonische J8-Auswahl verlor zwölf ihrer vierzig Atome, wenn sie aus dem
bereits gefilterten Darstellungsbaum gelesen wurde. Kanonische Fokuswurzeln
verwenden jetzt die kanonischen Unterziele; synthetische Gruppen behalten
ihre tatsächlichen sichtbaren Kinder. Vollständige Lernbasis, Einschreibung
und Lernergebnisse werden dadurch nicht verändert.

Die Belege sind bewusst getrennt:

- `independent-review/` prüft die ursprünglichen drei CI-Korrekturdateien.
- `focus-followup-independent-review/` bewahrt die weitere Diagnose. Deren
  erste Gegenprobe mit 0/40 bei direkter Route verwendete noch keine
  Scope-Metadaten und ist kein bestätigter App-Fehler. Die korrigierte
  zweite Gegenprobe reproduziert den tatsächlichen Verlust von zwölf Atomen.
- `canonical-focus-root-author-v1/` bindet den folgenden Fünfdateientwurf.
- `independent-focus-fix-v1/` prüft diesen Entwurf unabhängig: sechs echte
  UI-Reihenfolgefälle mit jeweils 40/40 Fokusatomen, 831 Gleichheitsprüfungen
  synthetischer Gruppen, 30 exakte Markierungsfälle und wirksame
  Negativmutationen. Die App-Quellverdrahtung ist mitgeprüft; eine zusätzliche
  Browser- oder HTTP-Abnahme wird nicht behauptet.
- `independent-workflow-order-addendum-v1/` prüft die anschließende reine
  Verschiebung der zwei unveränderten Python-Schritte hinter das gemeinsame
  CI-Vorbereitungspräfix. Der ältere Fünfdateisnapshot bleibt unverändert.

Die lokale isolierte Python-Prüfung besteht mit 16 Tests, die CI-Struktur-
prüfung mit 9 Tests. Frühere fehlgeschlagene Prüfungen bleiben zur
Nachvollziehbarkeit erhalten. Der Vite-Produktionsbau besteht.
Die fortgeführten Prüfungen und der endgültige Dateiinhalt werden vor dem
Commit gesondert im Abgabemanifest gebunden. Andere StagePlan- und
Assessmentarbeiten gehören nicht zu dieser Freigabe.
