# Chemie450: aktueller APV-201-Bindungskandidat

Dies ist ein **Autorenkandidat für die unabhängige gezielte Bindungsprüfung
durch A**. Er registriert keine normale Warnungsannahme und erzeugt keine
neue fachliche D/P/A/M/V-Entscheidung. Die Arbeit ist informiert; sie behauptet
keine Blindheit, menschliche Freigabe, Lernendenausführung oder M7.

Die Hauptdatei
`CANDIDATE.current87-221-warning-context-decisions.json` enthält exakt
87 aktuelle Warnschlüssel und 221 unterschiedliche Ziel/Land-Paare.
Der Autor schlägt alle 221 Paare zur **begrenzten Kontextannahme** vor;
bei den geprüften Bindungen verblieb kein unbelegtes Paar. Das sind
Vorschläge, keine bereits akzeptierten Einträge.

## Daten und Belege

- `warningDecisions` hält die exakten normalen APV-201-Befunde, den echten
  Warnschlüssel mit leerem `value`, die ganze heutige Override-Ländermenge
  und die zugehörigen Paarordnungen fest.
- `pairDecisions` bindet aktuelle ganze Ziele, aktuelle Profilhashes,
  Registry-/Inline-Ursprung, vorhandene endgültige AP-Evidenz, konkrete
  authored View-/Kurs-/Stufen-Kontexte, explizite heutige Erwerbsdeklarationen,
  tatsächliche frühere Scope-Entscheidungen mit Datei-/Objekthashes und
  JSON-Pointern sowie eine individuelle Begründung.
- `inputs/` enthält die 87 ganzen aktuellen Zielobjekte, ihre schon
  vorhandenen AP-Fakten, 85 bytegleiche aktuelle Profilzeilen, den kleinen
  `contains`-Graphen, 41 aktuelle ganze View-Objekte und die tatsächlichen
  Role-/Filterfakten. Die beiden HE-Abschlussziele haben hier keinen
  erfundenen gewöhnlichen P-Nachweis.
- `existing-evidence-file-index.json` nennt die direkt benutzten bestehenden
  wissenschaftlichen und Autorendateien. Repositorybelege werden an ihren
  vorhandenen Pfaden referenziert. Elf unmittelbar benötigte, bislang nur
  unter `tmp` gefundene Originaldateien zu c95, NI4955 und den HE-Nachfolgern
  liegen bytegleich unter `evidence/`;
  `portable-original-evidence-map.json` löst die alten Pfade darauf auf.
  Eingebettete historische Herkunftsstrings sind unverändert. Es wurde
  keine weitere Reviewbibliothek oder transitive Cachekopie angelegt.
- `inputs/previous-reviewed-whole-scope-excerpts.json` sichert nur die für
  den heutigen Vergleich benötigten ganzen Zielobjekte aus bestehenden
  Review-Eingaben, mit Originaldateihash und genauem Objektlocator.

Die Rolle wurde mit den unveränderten Stockfunktionen
`normalizeCompositionView`, `collectCompositionProjectionRoleGoalIds` und
`goalMatchesFilters` gelesen. Jurisdiktion kommt aus dem vorhandenen
normalen AP-Bericht. Dies ist keine neue Applicability-Kompilierung und
kein behaupteter neuer gerenderter View- oder Laufzeitnachweis. Die
strukturgebenden Vorfahren und tatsächlichen Referenzen sind je Kontext
enthalten; Stufe wird nicht aus `requires` oder Phase erfunden.

## Gezielte Nachfolgergrenzen

1. **0959/223e und 3eb/4965:** Die ältere Gesamtkompetenz wird nicht als
   unverändert ausgegeben. Der D5-Nachfolger erhält die genaue Teilung
   und die ursprünglichen Zielkoordinaten. Bei 223e/4965 ist zusätzlich
   der tatsächlich unabhängig geprüfte P2-v2-Nachfolger für getrennte
   Ausgangs-/Transferbriefe gebunden; dessen ganze Profilobjekte stimmen
   exakt mit den aktuellen Profilen überein. Eine neue P-Prüfung wird
   daraus nicht gezählt.
2. **64b:** Der neue GK-Tag und HB-Override sind über den wirklichen
   begrenzten HB-Nachfolger referenziert. A verfasste jenen Vorschlag;
   B akzeptierte ihn unabhängig. Der Autor A wird nicht als zweites
   unabhängiges Scope-Votum dargestellt. Die älteren LK-/Nicht-HB-Urteile
   bleiben getrennt sichtbar. Die aktuelle ganze Profilhashbindung ist
   unverändert gegenüber dem tatsächlich akzeptierten Nachfolger.
3. **Zusätzliche HB-SekII-Views:** Bei 7f, dfbccd und f0f67 werden die
   späteren expliziten SekII-Projektionskontexte gesondert aufgeführt.
   Die Autorenbegründung verwendet denselben ganzen kanonischen Inhalt,
   dasselbe Land und dasselbe Kursprofil wie die vorher geprüften
   oberen Zweige der CrossStage-Views. A soll diese begrenzte
   Nachbindung konkret verifizieren; keine zusätzliche amtliche
   Quellendeckung wird daraus abgeleitet.
4. **HE145/327:** Vorgeschlagen wird ausschließlich die dokumentierte
   Legitimität der bewussten DE-HE-Zuordnung einer ausdrücklich benannten
   begrenzten Kursabschlussaufgabe. Frühere REVISE-Voten zu damaligen
   Eintrittslisten und konkrete spätere Nachfolger bleiben erkennbar.
   Die gesamte heutige Zulassungsroute, alle vorausgesetzten Kompetenzen
   oder eine gesamte Kursabdeckung werden hier nicht freigegeben.
   Bei 327 ersetzt `assessment-requires` im vorhandenen Endbericht die
   rohe Override-Evidenz vollständig; die Warnung stammt weiterhin vom
   vorher gelesenen Inline-Override. Die normalen Metadaten sind unverändert.

## Prüfung und Übergabe

`CHECK.finite-current87-221-bindings.actual.json` bestätigt:

- exakte 87 Warnschlüssel und 221 Paarmengen aus den aktuellen normalen
  Registry-/Inline-Eingaben;
- 85 bytegleiche Profilzeilen und 41 unveränderte ganze View-Objekte;
- alle direkt verwendeten wissenschaftlichen Locators mit ihren tatsächlichen
  Objekt- und Dateihashes sowie alle elf portablen Originalkopien;
- unveränderte normale Eingangsdateien zum Prüfzeitpunkt.

Reproduzierbare begrenzte Konsistenzprüfung vom Repository-Root:

```bash
python curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-applicability-warning-binding-author-20261018-v1/scripts/check-finite-warning-matrix.py --no-write
```

Diese technische Konsistenzprüfung ersetzt A nicht. A prüft die fachliche
Legitimität der konkret gebundenen Warnungsmetadaten und besonders die oben
genannten Nachfolgergrenzen. Erst Root kann anschließend tatsächlich
geprüfte Entscheidungen in das normale Accepted-Warnings-Register aufnehmen.

Alle Quellenextraktionen, Zuordnungen, Source3-Grenzen, Kursqualifikationen
und amtlichen Teil-/Ganzdeckungen bleiben unverändert. Die 2241 vorhandenen
APV-202-Diagnosen sind nicht Teil dieser Warnungsannahme. Dieser Kandidat
liefert keinen Ersatz für CQR-003/-004.
