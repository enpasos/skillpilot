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
Die [Sicherung mit Reviewnotizen](../archive/learning-units/2026-11-06-s0-freeze/README.md)
erklärt deren Umfang und Grenzen. Der neue CI-PR wird getrennt angelegt.

**Zwei Vertragsstände unterscheiden:** Der neue CI-Branch hat die Normtexte
von main. Die vorbereitete Anerkennungsänderung des Einheitenbranchs vom
6. November ist zusätzliches Zielmaterial, keine bereits auf main umgesetzte
Funktion. Der Audit muss beide Stände ausdrücklich kennzeichnen. Die neue
Prüfungsanerkennung, Einheitenruntime oder ein ganzer Einheitenkatalog werden
nicht als Nebenwirkung einer Testkorrektur implementiert.

## Verwendbare Ergebnisse

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
4. SRS hat einen dokumentierten Normkonflikt: „keine Karte fällig und alle
   verifiziert“ gegenüber aktuell verifiziertem Abruf ohne Due-Rücknahme.
   Erst eindeutig festlegen, dann Tests ableiten; nicht still einen Stand wählen.
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
