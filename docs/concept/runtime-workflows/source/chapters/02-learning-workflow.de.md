## Operativer Lernablauf {#sec:learning-workflow}

Dieses Kapitel beschreibt den operativen Laufzeitablauf von statischen Skill-Landschaften unter `curricula/` bis zur personalisierten Navigation und binären Mastery-Fortschreibung.

Im Backend ist der Ablauf providerneutral. Für ChatGPT (@ref{sec:openai-mcp-oauth-session}) authentisiert ein registrierter OAuth-Client die Integration, während jeder ausdrückliche Klick auf **Lernen starten** eine frische, absolut nach 24 Stunden ablaufende `learningSessionId` erzeugt, in die Startnachricht einfügt und unverändert an jeden fachlichen MCP-Aufruf übergibt; die permanente SkillPilot-ID verbleibt ausschließlich im Backend. Der [Visible-Session-Flow](repo:docs/concept/runtime-workflows/chatgpt-visible-session-flow.md) dient nur als isolierter Rollback-Pfad, und der Claude-Adapter nutzt dieselbe sichere Zustandsprojektion vorbehaltlich vollständiger End-to-End-Abnahme. Die gemeinsame Grenze regelt @ref{sec:provider-neutral-coach-boundary}.

### Datengrundlage: Landschaften, Struktur und Filter {#sec:workflow-data-foundation}

Jede Skill-Landschaft unter `curricula/` bildet einen DAG mit `contains` (Hierarchie/Komposition) und `requires` (didaktische Voraussetzungen). Während der laufenden Clusterkanten-Migration leitet die Laufzeit **effektive Voraussetzungen** aus direkten `requires`-Kanten sowie über `contains`-Vorfahren vererbten `requires`-Kanten ab; Personal-Curriculum-Filter grenzen die sichtbare Ansicht ein, während für strikte Prüfungen weiterhin der strukturelle Gesamtgraph zur Verfügung steht.

### Lebenszyklus-Schritte 1–3: Basis-Curriculum, Personal Curriculum und Fokus {#sec:workflow-steps-1-to-3}

1. **Basis-Curriculum (Ebene 1):** Nach zustandsfreier Katalognavigation wählt die lernende Person ein veröffentlichtes Wurzel-Curriculum als vollständigen Zielraum.
2. **Verbindliches Personal Curriculum (Ebene 2):** Ausschließlich im First-Party-WebGUI konfiguriert (Bundesland/kanonische Sicht $\rightarrow$ Dauermodell $\rightarrow$ Stufe $\rightarrow$ Fächer $\rightarrow$ Kursprofil je Fach) als Kandidatenraum für Fokus, Frontier, Fortschritt und lokale Lehrkraft-Kursplanung (unabhängig vom veränderlichen Ebene-3-Fokus).
3. **Fokus und aktives Ziel (Ebene 3):**
   - **Ebene 3a (Fokuswurzeln):** Sobald Ebene 2 vollständig ist, ist der Fokus nie leer (deterministischer Standard auf der ersten sichtbaren Wurzel; Mehrfachwurzeln für kombinierte Backend-/Coach-Korridore möglich).
   - **Ebene 3b (Aktives Atomziel):** Höchstens ein atomares Lernziel aktiv in UI und Coach-Schleife.
   - **Plangesteuerte Progression:** Die bestätigte Planübernahme ersetzt einbezogene Fachpläne atomar, aktiviert den Planmodus (unterdrückt den generischen Autopilot) und wählt das erste fällige Frontier-Ziel eines offenen Periodenpensums; explizite Fachwechsel parken offene Ziele ohne Mastery-Änderung, und Übergaben nach Zielabschluss folgen deterministisch offenen Fachpensen ohne jemals `requires` zu umgehen oder Ersatzziele zu erfinden (siehe [Einheitlicher Lernplanstatus](repo:docs/concept/didactic/unified-learning-plan-status.md) sowie historisch [Tagesfortschritt](repo:docs/concept/runtime-workflows/daily-learning-progress.md)).
   - **Fokusweitung:** Bietet vom Backend publizierte breitere Vorfahren entlang des sichtbaren Wurzelpfads erst nach echtem Fokusabschluss und ausdrücklicher Zustimmung an.

### Schritt 4: Frontier-Berechnung und Auswertungsmodi {#sec:workflow-step4}

Ein atomares Ziel liegt genau dann auf der **Frontier**, wenn es selbst noch nicht beherrscht ist und sämtliche effektiven Voraussetzungen gemäß ihren Zieltyp-Verträgen erfüllt sind. Nach der Korrektur vom 4. November 2026 ([Abschlusskonzept](repo:docs/concept/skill-graph/assessment-gated-completion.md); Laufzeitanpassung offen) erfüllt effektive Beherrschung $M_{\mathrm{eff}} = M \cup W$ Voraussetzungen ohne synthetische Mastery-Zeilen, während eine gewöhnliche $B$-Mastery in $Q \to B \to A$ niemals $A$ anerkennt, solange die lokale Prüfung $Q$ offen ist.

- **Optimistischer Modus:** Prüft Voraussetzungen innerhalb des aktiven Fokus (berechnet transitive Erreichbarkeit vor Zielmaskierung, damit ausgeblendete Zwischenknoten keine Pfade kappen) und erlaubt den direkten Einstieg im gewählten Bereich.
- **Strikter Modus:** Wählt Kandidaten aus dem gefilterten Bereich, prüft Voraussetzungen jedoch global, um fehlende Grundlagen außerhalb des Filters offenzulegen.

Wünscht die lernende Person ein Nicht-Frontier-Ziel, ermittelt die Laufzeit die fehlenden effektiven Voraussetzungen und leitet gezielt dorthin.

### Schritt 5: Mastery, Aggregation und Rückmeldung {#sec:workflow-step5 anchors="step-5-mastery-aggregation-and-feedback"}

Jedes atomare Ziel besitzt auf seiner stabilen UUID genau ein gespeichertes Ergebnis: **gemeistert oder nicht gemeistert** (`0.0` oder `1.0`; Zwischenwerte sind kein dritter Lernstand).

- **Globale Geltung und Aggregation:** Mastery bleibt über Ansichts-, Ebene-2- und Ebene-3-Wechsel hinweg global erhalten. Cluster- und Bereichsprozentwerte zeigen den gewichteten Anteil eindeutig beherrschter Atomziele (60 % bedeutet z. B. 6 von 10 Zielen beherrscht, niemals 60 % eines Einzelziels).
- **Gedächtnis-/SRS-Ziele:** Leiten ihr binäres Zielergebnis aus dem Kartenstatus ab: Normales Karteikartenlernen im Cockpit oder in der dedizierten MCP-App-Komponente (*Noch nicht gewusst* / *Gewusst* mit Vor-/Zurück-Navigation) aktualisiert nur den Wiederholungsplan, während **Verified Recall** ein separater hilfefreier Coach-Batchtest ist. Ein Gedächtnisziel gilt erst als gemeistert, wenn alle Pflichtkarten verifiziert und aktuell nicht fällig sind (siehe [Knotentypen](repo:docs/concept/skill-graph/node-types.md)). Orientierungsziele speichern lediglich den abgeschlossenen Einstiegsdialog ohne Fachkompetenzanspruch.
- **Implementierungsstand (geprüft am 30. Oktober 2026):** `LearnerService` akzeptiert bei neuen allgemeinen Mastery-Schreibzugriffen nur `0.0` oder `1.0`, und `GoalCard.tsx` bietet binäre Steuerelemente; `Mastery.java` behält `double` samt Leseschwelle `>= 0.9` für Bestandszeilen. Browser-SRS-Synchronisation kann keinen Verified Recall erzeugen, und signierte Importe bewahren verifizierte Kartenergebnisse (siehe [Completion-Pilot](repo:docs/dev/assessment-gated-completion-pilot.md)). Bei jeder Mastery-Änderung werden freigeschaltete Ziele, Frontier und Fortschrittsübersichten unmittelbar neu berechnet.
