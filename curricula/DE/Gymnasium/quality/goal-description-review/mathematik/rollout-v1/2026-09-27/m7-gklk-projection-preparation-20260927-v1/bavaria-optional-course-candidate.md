# Bayern-Wahlkurs: quellabgeleiteter, nicht aktiver Projektionskandidat

**Überholte Umsetzungsoption:** Die hier untersuchte Entfernung der 35 BY-LK-Geltungen war eine Diagnose vor der beschlossenen M7-Zwischenregel, **nicht** der aktuelle Umsetzungsweg. Technisches BY-`GK` soll das verpflichtende vierstündige Mathematikfach umfassen; technisches BY-`LK` soll darauf aufbauen und **alle fünf** Vertiefungsmodule als Ziele enthalten. Ein Fokus auf drei Module entfernt die anderen zwei nicht aus `target`, Fortschritt oder Abschluss. Die Zahlen und der JSON-Report unten bleiben als historischer Scope-Befund erhalten; sie aktivieren nichts und schließen Gate D nicht ab. Die echte optionale Kurs-/Modulauswahl bleibt [Issue #59](https://github.com/enpasos/skillpilot/issues/59) vorbehalten.

Stand: 2026-09-27. **Nur Diagnose und Entwurf.** Aktive und vorgeschlagene Atlas-Konfiguration, Buchpublikation, kanonische IDs, D-Resolutionen und die bisherigen 80 Kompatibilitäts-Receipts werden dadurch nicht geändert. Der amtliche Kursunterschied und die Quellen sind im [Scope-Audit](bavaria-vertiefungskurs-scope-audit.md) belegt.

## Reproduzierbares Ergebnis

`auditMathBavariaOptionalCourseProjection.ts` verbindet die Source-Extraction und das BY-Mapping über `sourceGoal.id = mapping.legacyGoalId`. Es zieht **nur** kanonische IDs heran, deren sämtliche BY-Zuordnungen aus dem Dokument `JGST12_VERTIEFUNG` mit Rolle `optional-extension` stammen; eine künftige zusätzliche Zuordnung aus dem regulären Mathematiklehrplan würde diese ID automatisch aus der Ausschlussmenge herausnehmen. Dokumentrolle, vollständige Zuordnung aller Wahlkurs-Source-Ziele, eindeutige IDs, Input-Digests und der aktuelle Atlasstand werden geprüft. Es gibt keine hardcodierte Liste der 35 Seiten.

| Befund | Anzahl |
| --- | ---: |
| Wahlkurs-Source-Ziele / Mapping-Zeilen | 41 / 66 |
| Kanonische IDs nur aus diesem BY-Wahlkurs / davon Atlasseiten | 48 / 35 |
| Im vorbereiteten GK/LK-Atlas zusätzlich zu entfernende BY-Sek-II-LK-Geltungen | 35 |
| Dadurch vollständig geltungslose Atlasseiten | 0 |
| Betroffene Seiten mit heute registriertem D-Claim | 32 |
| Überschneidung mit der nichtkanonischen 15-Seiten-Doppelreview | 5 |

Die `topicCode`-Zuordnung zerlegt die 35 betroffenen **atomaren**
Atlasseiten reproduzierbar in `M12-V.1` bis `.5` mit **8 / 12 / 3 / 11 / 1**
Seiten. Jede der 35 Seiten ist derzeit genau einem Modul zugeordnet; der
Audit prüft dies bei jedem Lauf. Die anderen 13 der 48 zugeordneten
kanonischen IDs sind Cluster, nicht Atlasseiten. Diese Cluster dürfen nicht
ungeprüft als ganze `canonicalSubtree`s in die Wahlkursansicht übernommen
werden: Beispielsweise enthält `213c3e11…` einen breiten regulären
Stochastikzweig. Für jedes Modul sind daher ausdrücklich geprüfte
**atomare Placements** erforderlich.

Der [Einzelreport](bavaria-optional-course-candidate.json) enthält für jede Seite die Ziel-ID, aktuelle und vorgeschlagene BY-Sek-II-Scopes, den konkreten Kandidat-Scope, verbleibende Geltungen und D-/Review-Überlappung. Er bindet die beiden Quell-Dateien und die beiden Atlas-Buchmodelle über SHA-256 beziehungsweise Model-Digests. Der Checker hält den Report ohne `--write` gegen die aktuelle Ableitung; `--write` ist lediglich eine bewusste Neu-Materialisierung des Diagnoseberichts, **keine** Aktivierung.

```bash
app/node_modules/.bin/tsx app/scripts/testMathBavariaOptionalCourseProjection.ts
app/node_modules/.bin/tsx app/scripts/auditMathBavariaOptionalCourseProjection.ts
```

## Warum es nicht einfach ein weiterer GK/LK-Filter ist

Der bestehende Vorschlag entfernt zwar elf BY-GK-Geltungen dieser Wahlkursseiten, lässt aber alle 35 im gewöhnlichen BY-LK-Zielumfang. Ein einfaches `courseProfile: LK` bedeutet in Bayern nicht „Vertiefungskurs gewählt“; Mathematik ist dort als reguläres Fach kein wählbares Leistungsfach. Auch die Modulwahl fehlt: Der eigenständige Wahlkurs umfasst fünf Module, von denen drei unterrichtet werden. Würden alle 35 Seiten nur unter einem Wahlkurs-Flag wieder sichtbar, würde SkillPilot weiter nicht gewählte Module als Lernziele ausgeben.

Für eine spätere **aktivierbare** Fassung braucht es deshalb eine getrennte Programm-/Angebotsdimension in der Lernenden-Scope-Auswahl: reguläres verpflichtendes BY-Mathematikfach einerseits, optionaler Vertiefungskurs in Jahrgangsstufe 12 andererseits. Beim Wahlkurs muss die Auswahl der tatsächlich belegten drei Module (`M12-V.1` bis `M12-V.5`, aus den quellgebundenen `topicCode`-Feldern) den `target`-Umfang bestimmen; nicht belegte Module dürfen weder in Baum noch Fortschritt/Frontier/Abschluss eingehen. Vor einer produktiven Ausspielung sind die Modulauswahl, Quell-zu-Ziel-Zuordnung, alle 35 Seiten und mögliche geteilte kanonische Ziele gegen Pflichtfach und Wahlkurs getrennt zu testen. Der jetzige Report ist ein sicherer Negativ-/Scope-Vorcheck, kein vollständiges Modell für die Wahlkursansicht.

Ein nicht belegter Kurs und ein belegter Kurs mit noch unbekannter
Modulwahl sind verschiedene Zustände. Der zweite darf nicht stillschweigend
alle fünf Module oder irgendeine Standard-Dreierwahl in den Zielumfang
ziehen. Das bisherige `courseProfile: LK` kann diese Unterscheidung nicht
ausdrücken und ist gerade kein Nachweis für die Belegung des Wahlkurses.

## Bindungsfolgen bei einer tatsächlichen Umstellung

Ein Entfernen der 35 BY-LK-Geltungen verändert 35 `pageFingerprint`s und den vollständigen Atlas-`digest`. Damit sind die **80 bereits berechneten, noch nicht registrierten GK-Narrowing-Receipts** an ein anderes vorgeschlagenes Gesamtbuch gebunden und können nicht unverändert übernommen werden. Noch wichtiger: Ihr heutiger Vertrag erlaubt ausschließlich entfernte **GK**-Scopes; für die 32 bereits D-gebundenen Wahlkursseiten ist eine entfernte **LK**-Geltung gerade **nicht** durch diesen Vertrag gedeckt. Alte D-Bindungen bleiben historische Evidenz, sind aber keine automatische neue D-Freigabe für die geänderte Seite. Der Schnitt braucht einen eigenständigen, fachlich geprüften Vertrags-/Reviewweg oder neue unabhängige D-Reviews.

Fünf der aktuellen 15 Doppelreview-Seiten sind direkt betroffen: `6a66b4f5…`, `10efb267…`, `f1eee698…`, `b66d13c5…` und `e105bad8…`. Deren Seiten- und gemeinsamer 15er-Subset-Buchdigest ändern sich. Dadurch sind auch die **anderen zehn** an den alten 15er-Book-/Bundle-Digest gebundenen Review-Artefakte nicht ohne erneute Materialisierung/Bindungsprüfung in eine neue D-Resolution übertragbar. Die beiden abgeschlossenen Runden dürfen als historische Beurteilung erhalten bleiben, aber weder automatisch regebunden noch als menschliche Freigabe ausgegeben werden.

Erst nach modellierter Wahlkurs-/Modul-Auswahl und fachlich korrekter BY-Pflichtfachprojektion: den Atlas neu bauen, Scope-Diffs und Review-Bindungen neu entscheiden, die zentrale D-Registry ohne Doppelzählung migrieren, den vollständigen Fünf-Gate-Bericht und die geschützten Fachstände prüfen. Bis dahin bleiben Produktions-Atlas und zentrales M7-Ergebnis unverändert.
