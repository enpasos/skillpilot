## Verlässliche Kurspläne bei Curriculum-Updates {#sec:course-plan-update-continuity}

:::note{title="Stand und Geltungsrahmen"}
Stand: 8. September 2026 — vom Product Owner angefordertes UX- und Umsetzungskonzept; die weitergehenden automatischen Ausführungsübergänge und Diagnosedaten sind noch nicht implementiert. Mit *Planersteller* ist die Lehrkraft bzw. betreuende Person gemeint, die Lernabschnitte und Termine festlegt. Aus diesem Konzept folgen weder ein automatisches Deployment noch Änderungen an veröffentlichten Coach-Verträgen.
:::

### Ziel und aktueller Befund {#sec:update-continuity-goal}

Wer „Sek II Physik bis Ende September“ plant, soll diesen Plan nach einer redaktionellen oder fachlich gleichwertigen Überarbeitung einzelner Lernziele ohne technischen Reparaturschritt weiterverwenden können. Eine Lehrkraftentscheidung ist nur dann nötig, wenn sich der gewählte Kompetenzumfang, ein Termin oder eine didaktisch relevante Voraussetzung tatsächlich ändert. Der wichtigste Schutz liegt **vor** dem Curriculum-Update: Ein reguläres Update darf einen inhaltlich gültigen, laufenden Plan nicht unangekündigt unbrauchbar machen.

- **Lokaler Lehrkraftplan:** Ein lokaler Korrektur-Fix verhindert inzwischen, dass ein einzelnes entfallenes Atom der historischen fachweiten Baseline sämtliche Abschnitte pauschal sperrt.
- **Übernommener Schülerplan:** Die unabhängige persönliche Kopie ignoriert bereits bloße fachweite Fingerprint-Änderungen, kann aber bei entfallenen übernommenen Atom-IDs oder geänderter Voraussetzungssortierung weiterhin den Fachplan sperren; aufgeteilte Ziele benötigen eine fachlich geprüfte Übergangsregel (bloße Textähnlichkeit genügt nicht).
- **Diagnose- und Kommunikationsgrenze:** Die Fachübersicht muss lokalen Entwurf und wirksamen Schülerplan strikt trennen, und das Backend darf nicht verschiedene Konflikte pauschal unter `stale` / `personal-curriculum-changed` ausgeben, ohne dass eine Personalisierungsänderung belegt ist. Da Klassen lokal im Browser liegen, gibt es keinen zentralen Benachrichtigungskanal vor dem nächsten Schülerzugriff.

### Ablauf und Zustände für den Planersteller {#sec:update-continuity-states}

1. **Beim Planen:** Kompetenzbereich und Zeitraum festlegen; *„Für Schüler aktivieren“* übernimmt erst nach bestätigter Vorschau. Die Zusage automatischer Kompatibilität bei gleichwertigen Korrekturen wird erst gemeinsam mit den technischen Garantien aktiviert.
2. **Kompatibles Update:** Der Plan läuft ohne Dialog, roten Status oder erneute Übernahme weiter (optionaler Verlaufshinweis: *„Lernzielbeschreibungen aktualisiert. Dein Plan gilt weiter.“*).
3. **Vorgeschlagene fachliche Erweiterung:** Der bisherige Plan bleibt wirksam (z. B. *„Physik läuft · Änderungsvorschlag für 1 Abschnitt“*).
4. **Gezielte Prüfung und Entscheidung:** Ein Klick öffnet direkt den betroffenen Abschnitt mit Tastaturfokus, Änderungsgrund, Auswirkung und Auswahl (z. B. *„Bisherigen Umfang beibehalten“* vs. *„Zusätzliches Thema aufnehmen“*); Abbrechen erhält die gültige Planung.

Die Fachkarte beantwortet zuerst **„Was gilt beim Schüler?“** und trennt davon nachgeordnet **„Dein Entwurf“**.

:::table{cols="4.6cm,4.8cm,X"}
| Situation | Anzeige für Ersteller | Verhalten |
| --- | --- | --- |
| Aktiver Plan gültig | `Läuft beim Schüler` | Lernen läuft; keine Handlung nötig. |
| Lokale Entwurfsänderung | `Läuft beim Schüler · Entwurf geändert` | Bisheriger Plan gilt bis zur bestätigten Übernahme. |
| Freiwillige Erweiterung | `Läuft weiter · Änderungsvorschlag` | Vorschlag einsehbar; kein Pflichtdialog. |
| Tatsächlicher Konflikt | `Entscheidung nötig: Abschnitt …` | Exakter Grund, betroffene Ziele und Lösungsweg (z. B. belegter Wechsel LK $\rightarrow$ GK). |
| Technischer Lesefehler | `Status derzeit nicht abrufbar · zuletzt geprüft …` | Erneut laden; keine Aufforderung zum Planumbau. |
| Planmodus ausgeschaltet | `Planlernen pausiert` | Als bewusster Zustand erklärt, nicht als Fehler. |
:::

Rot bleibt einem nachgewiesenen Ausführungsproblem vorbehalten; bloße Versionswechsel, geänderte Atomzahlen oder Netzwerkfehler beweisen keinen fachlichen Konflikt.

### Plattformpflichten bei Curriculum-Updates {#sec:update-continuity-platform}

**Planungsentscheidung und abgeleitete Ausführung trennen:** Dauerhaft sind Kompetenzbereich, Geltung und Termine; die konkreten Atomlisten sind eine versionierte Ableitung, und eine Neuberechnung schreibt weder historische Baselines um noch erfindet sie Mastery.

:::table{cols="5.6cm,X"}
| Änderungstyp | Vorgesehener Umgang |
| --- | --- |
| Beschreibung/Darstellung bei gleichem Ziel | Ohne Planaktion kompatibel halten. |
| Änderung außerhalb des geplanten Umfangs | Keine Auswirkung auf diesen Plan. |
| Umbenennung / interne Neuordnung | Stabile Referenz bzw. explizit geprüfte Referenznachfolge (keine Titelheuristik). |
| Gleichwertige Atomaufteilung | Geprüfte Zuordnung Altziel $\rightarrow$ Nachfolgeziele samt konsistenter Aufgaben-, Nachweis- und Fortschrittssemantik (kein scheinbarer Rückstandssprung, kein automatischer 100-%-Mastery-Transfer). |
| Neues Kompetenzziel im Cluster | Als freiwilligen Änderungsvorschlag behandeln; zugesagter Umfang bleibt nutzbar. |
| Neue Voraussetzung | Zuerst zulässige Reihenfolge im bestehenden Plan prüfen; nur echte Umfangs-/Terminänderung vorlegen. |
| Geändertes Personal Curriculum | Separat als Änderung der Lernendenauswahl erklären und gezielt abgleichen. |
:::

Vor jeder Veröffentlichung prüft ein Update-Gate alte gegen neue Curriculumdaten auf entfernte Anker, Aufteilungen und Voraussetzungsänderungen, spielt repräsentative Pläne durch und hält ungeklärte Brüche auf (ergänzt durch datenschutzkonforme interne Auswirkungsprüfung und nachgelagerte Smoke-Tests). Im Schülerbetrieb laufen bei Teilkonflikten unabhängige gültige Fächer weiter (z. B. *„Physik wird gerade geprüft. Mit Mathematik kannst du heute weiterlernen.“*), ohne abhängige Aufgaben ungeprüft freizugeben oder Schüler zum Fehlerboten zu machen.

### Vier Umsetzungsschritte und Anschluss {#sec:update-continuity-rollout}

1. **Gemeinsamer Diagnosevertrag** statt pauschalem `stale` (Ursache, Fach/Abschnitt, Auswirkung, Prüfzeitpunkt, Aktion; identisch in Lehreransicht, Vorschau und Cockpit).
2. **Sichtbarer UX-Ablauf** auf Fachkarten und in der Kursübersicht nach Vorab-Abstimmung an drei Referenzszenarien (Textupdate, Atomaufteilung, echter Profilwechsel).
3. **Geprüfte Übergänge und Update-Gate** für Referenznachfolge, Aufteilung und Voraussetzungskorrekturen über alte und neue Planformate hinweg (erst dieser Schritt behebt die eigentliche Bruchursache).
4. **End-to-End-Abnahme und Rollout** aus Schüler- und Lehrkraftsicht inklusive Regressionen, Update-Gate und Smoke-Test.

Relevante Codepfade: `app/src/utils/localTeacherCoursePlan.ts`, `app/src/components/CoursePlanPilotView.tsx`, `app/src/views/TrainerView.tsx`, `app/src/utils/teacherLearningPlanActivation.ts`, `app/src/components/TrainerLearningPlanActivation.tsx`, `backend/src/main/java/com/skillpilot/backend/service/LearnerService.java`, `LearnerLearningPlanService.java` und `app/src/utils/learnerLearningPlanCopy.ts` (siehe auch @ref{sec:existing-learner-teacher-view}, @ref{sec:teacher-goal-book-planning} und [Review-Freeze](repo:docs/deploy/openai-plugin-v1-review-freeze.md)).
