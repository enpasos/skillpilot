# Mathematik-Atlas: GK/LK-Projektion vorbereiten

Stand: 2026-09-27. **Der globale Kursmarker-Schalter ist vorbereitet,
nicht aktiviert.** Der produktive Atlas-Config-Eintrag, die generierte
öffentliche Buchdatei, die D-Resolutionen und die zentrale
Statusregistrierung bleiben unverändert. Anders als der Schalter sind
elf quellenbelegte BY-GK-`goalEntry`-Placements sowie die Entfernung von
vier ausschließlich dem Vertiefungskurs zugeordneten Q4-Knoten aus beiden
BY-GK-Views bereits als **noch nicht freigegebene Source-Edits im Worktree**
vorhanden. Die 35 atomaren Vertiefungskurs-Ziele liegen damit im aktuellen
Atlas nur in BY-LK; die LK-Views bleiben unverändert. Ein neuer Build würde
diese Änderungen sehen; weder ein grüner alter D-Index noch dieser
Diagnose-Report erklärt sie automatisch zu fertiger Curriculum-QS.

**Aktueller Nachtrag zur bayerischen Zwischenregel:** Die älteren Zahlen und
80/95-Kompatibilitäts-Receipts unten beschreiben einen früheren Kanonstand und
sind keine Aktivierungsfreigabe. Der neu abgeleitete globale Policy-Kandidat
ändert inzwischen 99 Seiten, entfernt 1.447 GK-Scopes und berührt 98
registrierte D-Claims; der diagnostische Report ist neu gebunden. Der
erneute vollständige Kompatibilitäts-Check bestätigt 82/98 als reine
Scope-Verengung und schließt 16/98 aus; **0** davon sind als neue D-Claims
registriert. Noch
wichtiger: Die vom Product Owner festgelegte technische Bedeutung von BY-GK
ist der gesamte vierstündige Pflichtstoff, BY-LK ergänzt alle fünf Module des
Vertiefungskurses. Ein Quellenabgleich zeigt, dass weder der aktuelle noch
der vorgeschlagene globale GK/LK-Atlas diese Pflichtstoffmenge vollständig
abbildet. Deshalb darf der globale Schalter nicht allein aktiviert werden;
zuerst ist die bayerische source-gebundene Kursprojektion zu korrigieren und
danach die D-Bindung zielgenau neu zu bewerten. Die lokale BY-View-Korrektur
erspart den globalen Schalter nicht nur nicht, sondern macht ihn für die
reinen Vertiefungskurs-Ziele **unnötig**. Die übrigen 99-seitigen
länderübergreifenden Änderungen werden nicht als Nebenwirkung aktiviert.
Die spätere echte Auswahl von
drei Modulen bleibt [Issue #59](https://github.com/enpasos/skillpilot/issues/59).

## Ergebnis

Der opt-in Policy-Schalter `atlasCourseProfilePolicy: "canonical-course-markers-v1"` schneidet für eine Sek-II-GK-/LK-Quell-View die authored Zielmenge mit der expliziten kanonischen GK-/LK-Markierung des einzelnen Ziels. Die vorhandene Sek-I-Herleitung bleibt davon getrennt: `upperIdsByJurisdiction` wird weiterhin aus den ungeschnittenen Sek-II-Views gebildet, sodass ein herausgefiltertes LK-Ziel nicht fälschlich in Sek I wandert. Die GK/LK-Entscheidung spiegelt `LearnerService.matchesCourseFilter` einschließlich der Legacy-Sonderregel für komplett leere Tags und des OR-Verhaltens bei widersprüchlichem Tag und `release.courseLevel`. Der aktuelle Mathematikbestand enthält keinen durch diesen Sonderfall zusätzlich betroffenen Ziel-Datensatz.

Der [reproduzierbare Report](course-projection-delta.json) vergleicht den unveränderten [zentralen Atlas-Config](../../../../../../../../../app/scripts/config/goal-books/de-gym-math-national-atlas.json) mit dem [opt-in-Vorschlag](proposed-atlas.config.json):

| Messgröße | Ergebnis |
| --- | ---: |
| Atlasseiten vorher/nachher | 797/797 |
| Seiten mit ausschließlich entfallenden GK-Geltungen | 103 |
| Entfernte Sek-II-GK-Geltungen | 1.517 |
| Hinzugefügte Geltungen | 0 |
| Betroffene, zentral deklarierte strenge D-Resolutionen | 95 |
| Andere Änderungen an betroffenen vollständigen Atlas-Seiten | 0 |

Der Checker verlangt für jede der 797 Seiten identische Ziel-ID, `goalFingerprint`, Text, Navigation, Quellenreferenzen und Visualisierungsdaten außerhalb von `applicability` und dem daraus abgeleiteten `pageFingerprint`. Er prüft für **alle** vorgeschlagenen Sek-II-Geltungen die kanonische Kursmarkierung, HE/BY-Gegenproben für drei LK-Anwendungsziele und den Erhalt eines geteilten Integralanwendungsziels im GK-Profil. Er prüft die Bytes/Digests aller 95 registrierten D-Resolutionen und hält deren **Review-Subset-Seitenfingerprint** getrennt vom vollständigen Atlas-Seitenfingerprint fest. Diese 95 sind hier nur deklarierte, nicht neu gebundene D-Claims.

```bash
app/node_modules/.bin/tsx app/scripts/auditMathAtlasCourseProjection.ts
```

Nach einer bewussten Änderung der kanonischen Landschaft oder Review-Registrierung kann der vorbereitete Report neu materialisiert werden mit `--write`; das ist **keine** Aktivierung. Der Schalter steht ausschließlich in `proposed-atlas.config.json`, nicht in `app/scripts/config/goal-books/de-gym-math-national-atlas.json`.

## Warum die 95 D-Claims nicht einfach umgebunden werden dürfen

Eine D-Resolution bindet exakt `goalFingerprint`, `pageFingerprint` und `goalReviewContextFingerprint` des Review-Inputs. Der Validator `validateGoalDescriptionDualRoundResolution.ts` verlangt die übereinstimmende aktuelle V3-Seite und beide Review-Kontexte. Das bisherige D-Review verwendet außerdem **kleine paginierte Review-Bücher**: zum Beispiel hat `49f9059a…` im alten Review-Subset eine andere `pageNumber`, `navigationOrder`, `treeOrder` und referenzierte Vorgängerseitennummer als im 797-seitigen Atlas. Sein Review-Seitenfingerprint kann daher schon vor diesem GK/LK-Fix nicht mit dem vollständigen Atlas-Seitenfingerprint gleichgesetzt werden. Ein bloßer Austausch der 95 Fingerprints in JSON wäre unprüfbar und unzulässig.

Ein echter Metadaten-Kompatibilitäts-Materializer braucht pro Ziel mindestens:

1. Den SHA-geprüften alten Resolution-Index, die Resolution, das originale Review-Subset mit V3-Input und die beiden unabhängig gebundenen Reviews; die alte Resolution muss gegen ihre bisherige aktuelle kanonische Text-/Bildlage streng validieren.
2. Ein neues Review-Subset mit **derselben geordneten Zielauswahl und Navigation** aus dem vorgeschlagenen Atlas. Der Zielseitenvergleich muss bytegenau nur `applicability` und `pageFingerprint` ausnehmen; Canonical-Kontext, zweisprachiger Text, Evidenzprofil, Quellbelege, Bild-URL und Originalbild-Digest müssen gleich bleiben. Die neue Geltung muss eine echte Teilmenge der alten sein, und ausschließlich Sek-II-GK-Scopes eines nach kanonischer Markierung reinen LK-Ziels entfernen.
3. Ein eigenes SHA-gebundenes Kompatibilitäts-Receipt mit alten/neuen Buch-, Seiten- und Kontext-Fingerprints, exakter Felddifferenz, entfernten Scope-Keys, validierter alter Resolution und unveränderten Originaldateien. Ein neuer Validator-Zweig muss dieses Receipt ausdrücklich akzeptieren und jeden abweichenden Fall verweigern; der vorhandene strenge D-Validator akzeptiert so einen Transfer **nicht**.
4. Erst nach diesem Validator- und Test-Schnitt dürfen die 95 betroffenen zentralen Indizes zielgenau ersetzt werden. Die acht ohnehin D-offenen LK-Seiten bleiben offen; jede der 95 Seiten, deren alte/neue Review-Subset-Seite in weiteren Feldern abweicht, braucht ein neues, unabhängiges D-Review.

Die vorhandene reine Atlas-Felddifferenz ist dafür ein notwendiger Vorcheck, aber **kein** Nachweis für die Review-Subset-Kompatibilität und keine rückwirkende D-Freigabe. Bis die Kompatibilitätsbindung oder neue Reviews vorliegen, bleibt die zentrale GK/LK-Umstellung aus.

## Ergebnis der 95er Review-Subset-Forensik

Ein separater, rein lesender Lauf liest die alten D-gebundenen Review-Subset-Bücher, prüft ihre Seitenfingerprints sowie die SHA-Digests der registrierten Resolutionen und vergleicht jede alte Seite mit einer aus dem vorgeschlagenen Atlas neu abgeleiteten **gleich geordneten** Review-Subset-Seite:

```bash
app/node_modules/.bin/tsx app/scripts/auditMathAtlasReviewSubsetCompatibility.ts
```

Ergebnis des gebundenen Stands: **nur 80 von 95** erfüllen überhaupt den notwendigen Feld-Diff „ausschließlich entfallende Sek-II-GK-Geltungen; alle anderen Seitenfelder identisch“. Die anderen **15** scheitern bereits vor jeder Vertragsfrage: bei sechs ist `visualization` anders, bei fünf sind Navigation/Breadcrumbs/Chapter-IDs anders (bei einer davon kommt gegenüber dem alten Review-Subset sogar eine Geltung hinzu), und vier stammen aus einem Batch mit dem heute nicht mehr im Atlas vorhandenen Ziel `12a8dffc-dea7-5f2c-b490-2a1a2bb6901b`. Für diese vier lässt sich die alte Zielauswahl nicht gleichwertig neu bauen. Die sechs Bilddifferenzen dürfen nicht als bloße Metadaten behandelt werden. Der Checker zeigt die einzelnen IDs und Differenzfelder, materialisiert aber keine Resolutionen.

Auch für die 80 exakten Kandidaten verhindert der **bestehende** geschlossene D-Vertrag eine neue Resolution mit den alten Review-Runden: Die Runden binden den alten `goalReviewContextFingerprint` und `reviewInputFingerprint`; manifestgebundene Entscheidungen binden darüber hinaus `pageFingerprint`, `bookDigest` und `bundleFingerprint`. Der gezielte Negativtest in `app/scripts/testGoalDescriptionDualRoundResolution.ts` entfernt ausschließlich eine GK-Geltung, berechnet den neuen Seiten-/Kontext-Fingerprint korrekt und bestätigt, dass die alten Reviews **nicht** als neue strenge D-Resolution akzeptiert werden. Das ist eine gewollte Sicherheitsgrenze, kein Testfehler.

**Entscheidung:** Kein 95er Materializer, keine automatische D-Übernahme und keine zentrale Aktivierung in diesem Schnitt. Der unten beschriebene separate Kompatibilitätsvertrag beweist inzwischen die 80 exakten Fälle **in einer nicht registrierten Diagnoseschiene**. Die übrigen 15 brauchen weiterhin zielgenaue neue Review-Inputs und unabhängige D-Entscheidungen. Bis zur gesonderten Registry-/Atlas-Integration bleibt die jetzige Anzeige-/Review-Inkonsistenz als offener, dokumentierter Befund bestehen.

## Ausführbarer Kompatibilitäts-Vorbeweis (weiterhin ohne D-Übernahme)

Der diagnostische Checker `auditMathAtlasReviewSubsetCompatibility.ts` nutzt jetzt einen separaten, fail-closed Feldvergleich. Er verlangt für die 80 Kandidaten gültige alte und neue Seitenfingerprints, identische **sämtliche** anderen Seitenfelder, eine echte Teilmenge ohne neue oder doppelte Scopes, ausschließlich entfernte Sek-II-GK-Geltungen sowie die unveränderte Reihenfolge aller verbleibenden Geltungen. Die alten Resolution-Dateien müssen die im zentralen Index deklarierten SHA-256-Digests besitzen und die alten Review-Subset-Seiten ihre alten Seitenfingerprints. Der Checker erzeugt aus den 80 Ziel-IDs, alten Resolution-Digests, alten/neuen Seiten-Digests und den tatsächlich entfernten Scopes ein deterministisches Receipt. Für diesen Stand lautet dessen Digest:

`sha256:27027c4ececdd74b4c0883fe19e900426aec0f11d64d8f7b318526944e012315`

Sowohl **80** als auch dieser Digest sind im Diagnose-Lauf gepinnt: jede Abweichung muss vor einer etwaigen Übernahme erneut untersucht werden. Mit `--receipts` werden alle 80 Einzel-Receipts **für diesen Seitendifferenz-Vorbeweis** ausgegeben; ohne den Schalter nur Digest und die 15 ausgeschlossenen Fälle. Der neue gezielte Negativtest verwirft einen alten/neuen stale Fingerprint, Text-, Bild- und Navigationsänderungen, eine LK- statt GK-Entfernung, Scope-Zugänge, doppelte Geltungen und geänderte Reihenfolge.

```bash
app/node_modules/.bin/tsx app/scripts/auditMathAtlasReviewSubsetCompatibility.ts
app/node_modules/.bin/tsx app/scripts/auditMathAtlasReviewSubsetCompatibility.ts --receipts
app/node_modules/.bin/tsx app/scripts/testMathAtlasReviewSubsetCompatibility.ts
app/node_modules/.bin/tsx app/scripts/testGoalDescriptionDualRoundResolution.ts
```

Das ist **nur ein notwendiger Vorbeweis der Seitendifferenz**. Er validiert nicht alle ursprünglichen Review-Quellen neu und wird vom heutigen D-Validator nicht als neue Resolution akzeptiert. Die bestehenden Review-Runden und zentralen D-Indizes bleiben unverändert.

### Separater geschlossener D-Kompatibilitätsvertrag: 80/80 Echtfälle validiert

Aufbauend auf dem Vorbeweis existiert jetzt der **eigene** geschlossene Vertrag `contracts/goal-description-review/v1/goal-description-scope-narrowing-compatibility.schema.json` mit dem Validator `app/scripts/validateGoalDescriptionScopeNarrowingCompatibility.ts`. Er erweitert oder überschreibt **nicht** das V1-Resolution-Schema. Jedes Receipt bindet Original-Resolution-Bytes, Original-V3-Review-Input, altes Review-Subset, vorgeschlagenen vollständigen Atlas, daraus neu aufgebautes gleich geordnetes Review-Subset, beide Seiten-Digests und exakt entfernte GK-Scopes. Die Receipt-Fingerprints werden aus dem vollständigen geschlossenen Payload berechnet.

Der Validator führt für jedes Ziel die **vorhandene vollständige Dual-Round-Validierung** erneut aus: ursprüngliche zwei Runden, Kampagnen, Ergebnisse, Zusammenfassung, Synthese-Entscheidungsmanifest und heutiger kanonischer Zieltext werden im **alten** Review-Kontext geprüft. Anschließend fordert er einen aktuell LK-only markierten kanonischen Zielkontext, den expliziten Atlas-Policy-Schalter und eine einzige zulässige Seitendifferenz: Sek-II-GK-Geltungen entfallen; Text, Quellen, Bild, Navigation, restliche Scopes und Reihenfolge bleiben identisch. Die alten Review-Runden und ihre Fingerprints werden nicht umgeschrieben.

Ein echter registrierter Positivfall und acht manipulierte Artefaktvarianten werden im Einzeltest geprüft; der zweite Lauf prüft **alle 95** zentral deklarierten betroffenen Original-D-Claims mit ihren SHA-gebundenen Resolutionen und alten Review-Artefakten. Ergebnis: **80/80** vollständige Kompatibilitätsnachweise, **15/15** ausgeschlossen. Fingerprint-Digest über die 80 neu berechneten Receipts: `sha256:1b84cc60a6a65d997febc7ab4ac206a1771b063e5b607cf43c349ae6579ca720`.

```bash
app/node_modules/.bin/tsx app/scripts/testGoalDescriptionScopeNarrowingCompatibility.ts
app/node_modules/.bin/tsx app/scripts/checkMathAtlasScopeNarrowingCompatibility.ts
```

Diese Ergebnisse sind **keine 80 neuen D-Abschlüsse**: die Receipts werden absichtlich nur berechnet und validiert, nicht in der zentralen Registry eingetragen; der Produktiv-Atlas bleibt unverändert. Die Einzelvalidator-API akzeptiert Artefakte; die spätere zentrale Integration muss ihre Index-Owner, Eingabepfade und den dann aktuellen Atlas selbst verbindlich bestimmen.

### Erforderlicher Schnitt für eine spätere sichere Aktivierung

1. **Erledigt, noch nicht registriert:** Eigener geschlossener Kompatibilitätsvertrag und vollständiger Validator für die alte D-Resolution plus reine Scope-Einschränkung, ohne die bestehende V1-Resolution oder ihre zwei Review-Runden zu ändern. Die Receipt-Payloads enthalten kein frei editierbares `strictDescriptionComplete`-Flag.
2. **Erledigt, noch nicht als D aktiviert:** Vollständige Original-D-Revalidierung und Echtlauf für alle 80 Kandidaten sowie gezielte Negativtests. Die 15 fachlich anders geänderten Fälle werden nicht durch den Vertrag geschleust.
3. **Offen:** Einen ausdrücklich neuen Indextyp in `reportDeepUnderstandingRollout.ts` und das geschlossene Registry-Schema aufnehmen; dort alte und neue D-Owner eindeutig und ohne Doppelzählung auflösen. Die 95 alten Index-Einträge dürfen nicht zusätzlich als zweite D-Owner stehen bleiben. Danach den produktiven Atlas-Schalter aktivieren, Buch und abhängige Layer-A-Artefakte neu bauen und **zentralen Fünf-Gate-Bericht plus Schutzuntergrenzen** prüfen. Dieser Schnitt benötigt gezielte End-to-End-Negativtests über Index-Owner und den **dann** aktiven Atlas.
4. Die **15 nicht kompatiblen Fälle** separat in aktuelle Review-Subsets überführen und erneut unabhängig entscheiden: sechs Bildbindungen (`e105bad8`, `fdce0ced`, `79444ef9`, `e7350739`, `164921f6`, `b71c332f`), fünf Navigations-/Kapitelbindungen (`f9c24dd8`, `bfc2bf06`, `36e0de23`, `edaf0bb4`, `fd4b7145`), vier wegen der entfallenen alten Batch-Ziel-ID `12a8dffc…` nicht rekonstruierbare Subsets (`6a66b4f5`, `10efb267`, `f1eee698`, `b66d13c5`). Die vollständigen UUIDs stehen in der Checkerausgabe. Besonders `f9c24dd8` erhält im Vorschlag sogar LK-Geltungen hinzu und kann nicht als reine Einschränkung gelten.

Die ersten zwei Phasen sind bewusst als separater Vertrag umgesetzt worden. Die produktive D-Zählung und die beiden alten Review-Runden bleiben unverändert.
