# CI-Vertragsaudit: Übergabe vom 6. November 2026

## Auftrag und Trennung

Der Product Owner will **vor der Fortsetzung der Lerneinheitenarbeit** alle
verbindlichen deterministischen Skill-Graph-Regeln gegen ihre tatsächliche
Durchsetzung in CI prüfen und die notwendigen deterministischen Gates herstellen.
Das Einheiten-Goal ist ausdrücklich pausiert. Die Agenten wurden angehalten.
Es findet keine weitere fachliche Einheitenzerlegung statt.

Der neue Branch `feat/skill-graph-ci-contracts` setzt frisch auf `origin/main`
auf. Die beim Einfrieren erneut abgerufene Basis ist
`0ce5a8d791eeb9783a919195fd8590bfb79f3595`. Der Einheitenstand bleibt auf
`docs/learning-units-restart-20261106` in
[Draft-PR #83](https://github.com/enpasos/skillpilot/pull/83) erhalten.
Sein eingefrorener Commit ist
[`52619b960e7b261e1cc18d070063c8e7aca74e21`](https://github.com/enpasos/skillpilot/commit/52619b960e7b261e1cc18d070063c8e7aca74e21),
zusätzlich unverändert gesichert auf
`archive/learning-units-s0-before-ci-audit-20261106`.
Die [Sicherung mit Reviewnotizen](../archive/learning-units/2026-11-06-s0-freeze/README.md)
erklärt deren Umfang und Grenzen. Der getrennte
[Draft-PR #84](https://github.com/enpasos/skillpilot/pull/84) ist angelegt.

**Zwei Vertragsstände unterscheiden:** Der neue CI-Branch hat die Normtexte
von main. Die vorbereitete Anerkennungsänderung des Einheitenbranchs vom
6. November ist zusätzliches Zielmaterial, keine bereits auf main umgesetzte
Funktion. Der Audit muss beide Stände ausdrücklich kennzeichnen. Die neue
Prüfungsanerkennung, Einheitenruntime oder ein ganzer Einheitenkatalog werden
nicht als Nebenwirkung einer Testkorrektur implementiert.

## Verwendbare Ergebnisse

- **Fortsetzung am 6. November:** Der [feste Regelkorpus](../qa-ci/skill-graph-ci-rule-corpus-2026-11-06.md)
  enthält 494 unabhängige Regeln mit festem Quellenregister und getrennten
  Main-/PR-83-Verträgen; die [JSON-Fassung](../qa-ci/skill-graph-ci-rule-corpus-2026-11-06.json)
  enthält die Quellrevisionen und Hashes. Alle IDs sind genau einmal der
  [statischen Matrix](../qa-ci/skill-graph-ci-static-matrix-2026-11-06.md)
  (261), der [Laufzeitmatrix](../qa-ci/skill-graph-ci-runtime-matrix-2026-11-06.md)
  (219) oder der [Content-/Bildmatrix](../qa-ci/skill-graph-ci-content-presentation-matrix-2026-11-06.md)
  (14) zugeordnet. Diese Vollständigkeit betrifft den deklarierten Quellenkorpus
  und seine Zuordnung, nicht bestandene Regeln oder vollständige CI-Durchsetzung.
- [Auditentwurf](../qa-ci/skill-graph-deterministic-ci-audit-2026-11-06.md):
  45 statische Beleggruppen und 41 Laufzeitprädikate mit Code-/Test-/Workflow-
  Ankern. Der normative Gesamt-Abgleich ist noch offen; kein Vollständigkeitsurteil.
- [Minimalitätsaudit](learning-units-inventory/2026-11-06/transitive-minimality.md):
  echter Bestand mit **923 Mathematik- und 396 Physikbefunden**, Zeugenpfaden,
  Kantenentfernung und erneut aufgelöster Vererbung. `--check` scheitert korrekt.
- [Natives Inventar](learning-units-inventory/2026-11-06/README.md):
  266 Einzel-Fach-Konfigurationen, 190 exakte Mitgliedschaftsklassen und
  18 Deckreferenzen anhand des vorhandenen Backends. Die bestehende
  Ziel-/Voraussetzungsauflösung wird wiederverwendet, keine zweite Scopeengine.
- [Gesicherte Astra-/Sol-Notizen](../archive/learning-units/2026-11-06-s0-freeze/review-notes.zip):
  unterbrochener Zensus mit 147 Regeln und technische Detailbelege.

Die sechs neuen Dateien unter `app/scripts/` sind reine Inventar-/Auditwerkzeuge:
`auditTransitiveMinimality.ts`, `testTransitiveMinimality.ts`,
`reportMathPhysicsNativeInventory.ts`, `testMathPhysicsNativeInventory.ts`,
`MathPhysicsNativeProjectionInventory.java`, `mathPhysicsNativeInventory.init.gradle`.
Es wurde noch kein neues hartes Curriculum-Gate in die Workflows verdrahtet.

## Zusätzlicher verbindlicher Reparaturauftrag vom 6. November

Der Product Owner verlangt die Wiederherstellung der früheren Meilensteine:

| Fach | Verbindliches Ziel |
| --- | --- |
| Biologie, Chemie, Mathematik, Physik, Wirtschaftswissenschaften | M7 |
| Deutsch, Geschichte, Informatik, Latein, Politik und Wirtschaft | M6 |

**Harte deterministische Prüfungen gehören dafür in die Meilensteinberechnung
selbst.** Ein separater Bericht oder ein isolierter Algorithmustest reicht
nicht. Regelverletzungen müssen den Meilenstein verhindern und durch die
geschützten Untergrenzen als CI-Fehler wirken. Die Wiederherstellung erfolgt
durch echte Fehlerbehebung, ohne schwächere Prüfer, abgesenkte Untergrenzen,
Warnungsabstufung oder akzeptierte Fehlerbaselines. Die bestehende Policy
enthält genau diese zehn Untergrenzen und keine aktiven Ausnahmen.

Der bisher gespeicherte CQR-Bericht trägt bereits diese alten M6-/M7-Werte;
seine Existenz ist kein Nachweis der neuen harten Prüfungen. Der frische
Abgleich des bisherigen Prüferprofils und die anschließende Integration der
vollständigen Strukturprüfungen sind getrennt zu belegen. Die statische
Reparatur beginnt beim Graphvertrag in CQR-001, einschließlich eindeutigem
Referenzraum, UUID-/Gewichtsdomäne, globalen und atomar normalisierten Zyklen
sowie lokaler und transitiver Minimalität. Tatsächliche Befunde und notwendige
Identitätsmigrationen werden vor Datenkorrekturen präzise inventarisiert.
Keine automatische fachliche Kantenkorrektur und keine Einheitenzerlegung
sind dadurch erlaubt.

## Bereits belegte Lücken und Grenzen

1. Transitive Minimalität ist konzeptionell Pflicht, bislang aber kein
   vollständiges hartes Curriculum-CI-Gate. Kleine Formalbeispiele ersetzen
   keine Bestandsvalidierung. Der neue Auditor findet echte offene Fehler.
2. Der UUID-CLI sucht mit einem Pfadglob, der kanonische Dateien nicht erfasst.
   Der allgemeine Graphvalidator prüft Zyklen landschaftslokal und erzwingt im
   unqualifizierten Fremd-ID-Fallback keine Eindeutigkeit. Gegen-Gates wie
   kanonische Eindeutigkeitsprüfung sind getrennt zu berücksichtigen.
3. Ein Test kann aktiv die alte Semantik absichern. Die vorbereitete neue
   globale Anerkennung und vollständige transitive Fokusauswertung sind
   dadurch nicht bereits nachgewiesen.
4. Der Product Owner hat den Kartenzielvertrag am **6. November 2026**
   klargestellt: Die Karten gehören zum Lernziel und werden mit Wiederholungen
   gelernt; die bestandene Abschlussprüfung liefert dessen Masterednachweis.
   Kartenfälligkeit öffnet ein abgeschlossenes Ziel nicht erneut und entzieht
   keine Mastery. Die alten Aussagen über eine zusätzliche Fälligkeitsbedingung
   und einen Widerruf durch erneute Prüfung waren veraltete Dokumentation.
   Bereits bestandene Karten sind im aktuellen Prüfablauf ausgeschlossen.
   Maßgeblich ist [der korrigierte Zieltypvertrag](../concept/skill-graph/node-types.md#due-and-mastery-semantics).
   Die eingefrorenen Reviewnotizen enthalten noch die alte Darstellung und
   dürfen sie nicht wieder als offene Produktentscheidung einführen.
5. CQR-Bericht, harte Einzelprüfungen, geschützte Reifegrad-Untergrenzen und
   optionale Paket-/OWL-Workflows sind verschiedene Durchsetzungsstärken.
   Grüne CI oder M7 belegen nur den tatsächlich implementierten Prüfvertrag.

## Nächste Schritte im neuen Chat

1. Main-Basis und Arbeitsstatus verifizieren. Gesicherte Dateien lesen und ein
   eigenständiges CI-Goal anlegen; das Einheiten-Goal bleibt pausiert.
2. Mit Astra Ultra den festen Regelkorpus vervollständigen. Im unterbrochenen
   Zensus fehlen noch Plan-/Perioden-, QA-/Quellen-/Bild-/Buch- und Paketblöcke.
   Jede unabhängige deterministische Regel erhält genau eine nachvollziehbare ID.
3. Sol 6.1 Ultra ordnet je Regel Implementierung, tatsächlichen Gegenprüfer,
   Workflow/Job/Befehl, Trigger, geprüften Scope und Fehlerwirkung zu.
   „Test vorhanden“ genügt nicht. Nicht geprüft ist kein erfülltes Kriterium.
4. Normkonflikte und nicht deterministisch entscheidbare Inhaltsurteile
   gesondert ausweisen. Maschinen können aktuelle Reviewbelege prüfen, nicht
   fachliche Richtigkeit oder reale Lernwirksamkeit beweisen.
5. Kleine getrennte Reparaturen mit echten Negativfällen liefern. Regeln aus
   main und zusätzliche Einheiten-Sollregeln nicht unbemerkt vermischen.
   Kein verdecktes Warnungs-/Baseline-Pass und keine automatischen fachlichen
   Kantenkorrekturen. Vor Befundkorrekturen den Geltungsbereich präzise festlegen.
6. PR-Stand früh sichern, CI bis passed begleiten. Lokale Prüfung, tatsächlicher
   Remote-Lauf, Betreiber-Deployment und Hostabnahme einzeln benennen.
   Erst nach Abschluss des eigenständigen CI-Themas das Einheiten-Goal fortsetzen.

## Starttext für den neuen Chat

> Wir arbeiten am eigenständigen CI-Vertragsaudit. Lies zuerst
> `docs/dev/ci-contract-audit-handoff-2026-11-06.md` und prüfe Branch/Main-Basis.
> Das Lerneinheiten-Goal und PR #83 sind eingefroren. Lege ein neues Goal für
> den vollständigen Audit der verbindlichen deterministischen Skill-Graph-Regeln
> und ihre korrekte CI-Durchsetzung an. Nutze Astra Ultra für grundlegende
> Analysen und Sol 6.1 Ultra für das Doing. Vervollständige zuerst die
> Regel-zu-CI-Matrix, priorisiere kleine überprüfbare Reparaturen und sichere
> den Fortschritt im neuen PR. Vermische die Regeln von main nicht mit der
> noch ungemergten Anerkennungsänderung aus dem eingefrorenen Einheitenstand.
> Keine weitere Einheitenzerlegung oder Produktionsänderung.
