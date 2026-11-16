# Q1-Erwerbsaufgaben – konkrete Autorenkandidaten vom 15.11.2026

Status: **Entwurf, keine unabhängige Freigabe, keine native Inhaltsakzeptanz**.
Der Kandidat enthält 27 neue atomare Prüfungsaufgaben mit neuen stabilen UUIDs
für exakt die 35 offenen gewöhnlichen Q1-Gesamtziele. Alle elf Ziele ohne
weiteren expliziten Erwerbsanspruch sind enthalten. Die übrigen 24 Ziele werden
nicht aufgrund der Bezeichnung oder des alten `released`-Status übernommen,
sondern erhalten vollständig ausgearbeitete neue Aufgaben.

## Prüfeingaben

- `content-candidate.json`: konkrete DE/EN-Aufgaben, selbständige Materialien,
  DE/EN-Lösungen, vollständige Punkteverteilung und Auslassungsschranken.
- `coverage-matrix.json`: für jedes der 35 Ziele die tatsächlichen
  P-Erwartungs-IDs und ihre Zuordnung zu den Bewertungskernen.
- `review-pack.json`: je Kern eine konkrete Gegenantwort, Grenze bei
  Auslassung, Bestehensnachweis für einen kleinen Fehler und Quellen-URLs.
- `native-review-contexts.json`: mit dem tatsächlichen Repository-Code
  `KnowledgeContextIndex` erzeugte aktuelle Wissenskontexte der 35 gewöhnlichen
  Ziele und, nur im Speicher ergänzt, der 27 Kandidaten. Alle Kandidaten werden
  nativ als `assessment` klassifiziert. Die 167 benötigten vollständigen
  DE/EN-Zieltexte sind dedupliziert enthalten.
- `input-pins.json`: genaue aktuelle Inputdateien einschließlich Physik,
  Mathematik und der 26 bisherigen P-Konfigurations-/Reviewdateien. Der ältere
  Prioritäts-Snapshot und parallele Elternänderungen sind ausdrücklich
  dokumentiert; alle 35 gewöhnlichen Zielobjekte blieben dabei unverändert.
- `author-checks.json`: 63 numerische Nachrechnungen, 27 konsistente
  Punkteverträge, transitive Minimalität, vollständige `requires`-Closure sowie
  Auslassungs-/Fehlerfälle. **Autorenchecks sind keine Inhaltsprüfung.**
- `candidate-artifact-pins.json`: Hashes des versiegelten Kandidatenpakets.

Die **vollständigen** bestehenden Whole-P-Beschreibungen, Erwartungen,
Variationsachsen und Fallprofile stehen in der exakt gepinnten Eingabe
`tmp/physics-release809-20261115/q1-whole-goal-review-priorities.actual.json`.
Diese Datei ist 544 KB groß und wird nicht als weitere Katalogkopie dupliziert.
Ihre Profile sind Autorenprofile mit `ai_candidate`-Autorität; dieses Paket
behauptet weder menschliche Zustimmung noch aktuellen nativen P-Pass.

## Inhaltliche Entscheidungen und Review-Schwerpunkte

1. **Gesamtziele statt Titelähnlichkeit.** Kleinteilige Aufgaben bleiben nach
   fachlichen Zusammenhängen und GK/LK getrennt. Beispielsweise hat grafische
   Superposition mit Radialfeld eine GK-Aufgabe; quantitative Superposition
   erhält eine eigene LK-Aufgabe. Die zwei Magnetbahnaufgaben trennen die
   GK-Bahnvergleiche von quantitativer LK-Umlaufzeit. Jede ausgewiesene
   P-Erwartung muss tatsächlich beurteilt werden.
2. **Unabhängige Übertragung.** Jede Aufgabe hat mindestens zwei konkrete
   unterschiedliche Situationen; MRT und Influenz jeweils drei. Feld- oder
   Ladungsumkehr, neue Geometrien, neue Träger und andere Randbedingungen
   verlangen eigene Entscheidungen. Auswendiglernen einer einzigen
   Zahlenkombination genügt nicht.
3. **Bestehen ohne Kernauslassung.** Jeder Bewertungskern umfasst vier Punkte;
   die Bestehensgrenze liegt zwei Punkte unter dem Maximum. Vollständiges
   Weglassen eines Kerns verliert bereits rechnerisch mehr Punkte. Zusätzlich
   begrenzt der existierende Beschreibungskontrakt das Gesamtergebnis unter
   die Bestehensgrenze, wenn eine einzelne wesentliche Kernaussage oder ihr
   verlangter Transfer fehlt bzw. durch eine explizite Fehlvorstellung ersetzt
   wird. Kleine Rechen-/Zeichenfehler bei richtigem Konzept bleiben innerhalb
   der Bestehensspanne; Folgefehler werden nicht mehrfach bestraft. Bei drei
   Fällen sind die Punkte pro Fall ausdrücklich im Schritt ausgewiesen.

Die Experimente werden genau nach den vorhandenen P-Profilen beansprucht:
Die Reibungsaufgabe verlangt Planung/Auswertung eines kontrollierten sicheren
Vergleichs, die Influenzaufgabe Planung, Protokollierung bereitgestellter
Simulationsdaten und Deutung. Es wird kein tatsächlich durchgeführter
Lernendenversuch behauptet. Bei anderen Teilgebieten werden bereitgestellte
Messdaten ausgewertet. Unabhängige Prüfung muss insbesondere beurteilen, ob
dies die konkrete bestehende P-Leistung vollständig einlöst.

## Quellen und eigenständige Materialien

Die Aufgabendaten und Formulierungen wurden neu verfasst. Fachliche
Modellgrenzen wurden anhand primärer Lehr-/Forschungsquellen geprüft:
CERN-Autor Frank Tecker, *Longitudinal Beam Dynamics in Circular Accelerators*
([arXiv-Fassung](https://arxiv.org/abs/2011.02932));
TU Dresden, *Erdmagnetisches Feld*, Abschnitte 2.1–2.4
([Praktikumsanleitung](https://tu-dresden.de/mn/physik/ressourcen/dateien/studium/lehrveranstaltungen/praktika/pdf/MF.pdf?lang=de));
NIST zur Resonanz und Ortscodierung beim MRT
([Erklärung](https://www.nist.gov/how-do-you-measure-it/how-does-mri-machine-work));
NIH/NIBIB zur HF-Anregung und Signalmessung
([MRT](https://www.nibib.nih.gov/science-education/science-topics/magnetic-resonance-imaging-mri)).
Die einzelnen OpenStax-Originalkapitel von Rice University sind in
`review-pack.json` direkt den Aufgaben zugeordnet. Die geblockte CERN-CDS-Seite
wurde nicht als gelesener Volltext ausgegeben; genutzt ist die zugängliche
Autorenfassung. Keine Quelle wird als amtlicher deutscher Lehrplan behauptet.

## Alte Aufgaben und Integrationsgrenze

Alle acht bestehenden vollständigen Altaufgaben wurden aktuell mit den
Objekten des Prioritätssnapshots verglichen und blieben vollständig gleich.
Die Aufgaben-, Lösungs-, Rubrik- und Ergebnisverträge werden nicht repariert
oder ersetzt. Zwei reale Altfehler verhindern ihre ungeprüfte Übernahme:

- `841edfdb…`: Der 8-mm-Plattenspalt bei 1600 V erlaubt keine 15-mm-Strecke
  entlang des homogenen Feldes vollständig zwischen diesen Platten. Die
  behauptete 3000-V-Potenzialdifferenz übersteigt die angegebene Plattenspannung.
  Die neue Aufgabe verwendet 4 mm Spalt und Punkte innerhalb dieses Spalts.
- `d8442d03…`: Die vorgegebene Forderung „unter 2 %“ wird durch eine exakt
  2-prozentige Maximalabweichung nicht erfüllt. Die alte Lösung bezeichnet sie
  dennoch als ausreichend. Die neuen Aufgaben übernehmen diese Aussage nicht.

Es wurden **keine aktiven** Canonical-, View-, Ledger-, Registry-, Git- oder
Lernendenergebnisdateien geschrieben. Keine neuen gewöhnlichen Ziele und
keine Bilder wurden benötigt. Der Platzierungsvorschlag verlangt den
bestehenden Aufgabencontainer erst dort, wo die tatsächlich benötigten ganzen
gewöhnlichen Ziele bereits zum Lernen gehören. Keine frühe breite Q1-Aufnahme,
kein vorgeschobenes Prärequisit und kein Transfer von Mastery.

Vor Integration stehen echte unabhängige informierte Inhaltsprüfung, native
Review-/Qualitätsgates und aktuelle Karten-/Unit-Prüfung aus. Das Paket bleibt
bis zu diesen Schritten `draft`.

Reproduktion der Autorenchecks:

```bash
python tmp/physics-q1-current-acquisition-20261115-v1/check_candidates.py
node --import ./app/node_modules/tsx/dist/loader.mjs tmp/physics-q1-current-acquisition-20261115-v1/derive-native-review-contexts.mts
```

Nach einer Neuberechnung sind die Artefaktpins erneut zu erstellen; ein
anderer Inputhash ist keine automatisch übernommene Freigabe.
