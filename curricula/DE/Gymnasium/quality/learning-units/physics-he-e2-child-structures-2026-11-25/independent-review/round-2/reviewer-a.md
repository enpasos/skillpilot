# Unabhängige Bestätigungsprüfung A – E.2-Kindstrukturen

Geprüft am 25. November 2026 durch Codex als Reviewer A. Verbindlicher Prüfstand: `4f963b4b78`, darunter `19c14af91e`; ursprünglicher Strukturstand: `a88f17523b`. Sämtliche fachlichen und technischen Quellen wurden mit `git show` aus diesen Pins gelesen, nicht aus dem möglicherweise inzwischen fortgeschrittenen Checkout. Andere Reviewer-Ergebnisse dieser Bestätigungsrunde wurden nicht gelesen. Als ausdrücklich angeforderter alter Messbeleg wurde ausschließlich `tmp/e1-handover/reviews/e2-child-structures/structure.actual.json` verwendet.

**Urteil: Die angeforderten Korrekturen an Platzierungsnachweis und altem Plan sind bestätigt; im geprüften Delta keine weitere erforderliche E.2-Korrektur.** Der neue Laufzeitregressionstest bildet den richtigen Zustand ab und prüft die angeforderten Service-Aufrufe. Die tatsächlichen neuen Coach-Probeläufe und JUnit-Ergebnisse sind Sache des eigenen Hauptprüflaufs; ich habe sie weder ausgeführt noch aus fremden Ergebnissen übernommen. Zwei Präzisierungen zur Aussagekraft und eine falsche Begründung im Handover stehen unten.

## 1. Eigene Messung und Identität der acht Views

Eigenes Skript: `probes/reviewer-a/measure.py`; unveränderte Ausgabe: `probes/reviewer-a/measurement.actual.json`. Es liest Git-Blobs, implementiert Rollenprioritäten, kanonische Expansion und Voraussetzungshüllen selbst und importiert keinen Autoren- oder Reviewer-Code. Für die Planmengen berücksichtigt es zusätzlich die GK-/LK-Anwendbarkeit und explizite Erwerbsplätze; diese Laufzeitfrage ist von den unveränderten Quellrollen zu unterscheiden.

Ergebnis: genau acht von 90 Physik-Views unterscheiden sich von `19c14af91e`; die übrigen 82 sind byteidentisch. Alle 90 Physik-Views sind außerdem byteidentisch zu `a88f17523b`. Alle 16 im neuen `regrouping.actual.json` angegebenen Vorher-/Nachher-SHA256 stimmen mit den Blobs überein. Die atomaren Zielrollen, Voraussetzung-allein-Rollen und fachübergreifenden Lernmengen sind in allen acht Fällen unverändert. Der gesamte kanonische Katalog hat in allen drei Pins denselben Tree `aceb771ff330667cfad93ba8d91e60091d5055e8`.

| View-Datei | Blob bei `19c14af91e` | Blob bei `4f963b4b78` und `a88f17523b` | Erwerbsplatz-Moves |
|---|---|---|---:|
| `de-he-gk-g8.view.json` | `b07171bc238686b791241ec92e0bccdbe14f6da9` | `647e04dd73fbc2b5cdff1d6a94d782871764e1aa` | 0 |
| `de-he-gk-g9.view.json` | `0614f91813615087c0d471b0a12c175734407eac` | `02561eb16b46863d0ad39df6683de707b7b24732` | 0 |
| `de-he-gk.view.json` | `5eeb859d2104c7cfadeb44efdd53ca6747f08114` | `3fa734e83eba6a195cb19d19ab4ee74834cb4892` | 0 |
| `de-he-lk-g8.view.json` | `292b56da81b34889bad4e06460a84450c02b4678` | `78878f718267a99953c8d08bdbcf04b3c05e528d` | 6 |
| `de-he-lk-g9.view.json` | `e46efca8956db1eb5b4d1bab6694380341fbf16a` | `3709207e14b5b7bbdfc7f96e671ec16c303676ec` | 6 |
| `de-he-lk.view.json` | `697e7f4cd78406b9c236059aab2553d72a1cb313` | `6cc8dc0e2ce60945b4e5e2a00761016d7bd607ac` | 6 |
| `de-he-sekii-gk.view.json` | `3e2effc3420b778009b4218e280bc384c0fad2c2` | `3dededc6ca17746878c8c90c567239d2ff115875` | 3 |
| `de-he-sekii-lk.view.json` | `66a604274d56cd93e7e8f93ef6e9e928c8dad909` | `2bb71cad3d4ecb09689d573868174ae035a3d75a` | 9 |

## 2. Alle neun Vorbereitungsziele, alle 30 Orte

Die Vergleichsmenge ist jeweils das Tupel `(goalId, view-Datei, vorheriger Elternknoten, neuer Elternknoten)`. Eigene Blobmessung, ursprüngliche `structure.actual.json` und neue `preparationPlaces.goals[].views[]` sind exakt gleich: neun verschiedene Ziele, 30 Tupel, weder fehlende noch zusätzliche oder falsch zugeordnete Tupel. Bei allen 30 Änderungen existiert genau ein alter und ein neuer expliziter Erwerbsplatz; die vollständigen Strukturpfade stehen in der eigenen JSON-Ausgabe.

Abkürzungen: **LK4** = `de-he-lk-g8`, `de-he-lk-g9`, `de-he-lk`, `de-he-sekii-lk`; **SekII2** = `de-he-sekii-gk`, `de-he-sekii-lk` (jeweils `.view.json`). **Vorbereitung E** = `physics-required-preparation-physics-e-phase`; **E.2** = `physics-e2-newton-and-conservation`; **E.5** = `he-physics-topic-0ade0d10-8b32-5a95-a1a9-8ac64e2a8089`.

| Ziel-ID | Inhalt | Jede betroffene View | Vorher → nachher |
|---|---|---|---|
| `f242a3e8-55a3-492e-8354-b81b24cdbb78` | Punkte im räumlichen Koordinatensystem als Tupel | LK4 | Vorbereitung E → E.5 |
| `075f1ef2-6860-4b20-9df2-878157eb395e` | Punkte und Vektoren im Raum koordinatisieren | LK4 | Vorbereitung E → E.5 |
| `be0e8715-3c3a-5ffb-937a-0b6bce4f01d8` | Orts-, Richtungs- und Verschiebungsvektoren im Raum | LK4 | Vorbereitung E → E.5 |
| `fb7a4fa0-03b5-53b4-bd86-608480b748a1` | Betrag eines Vektors im Raum | LK4 | Vorbereitung E → E.5 |
| `2ac2e902-a6ad-53c9-b139-d1c63d823023` | Skalarprodukt definieren | LK4 | Vorbereitung E → E.5 |
| `ae5010cc-ea8d-5b14-aa4a-b0f2b5846a75` | Kettenregel anwenden (LK) | LK4 | Vorbereitung E → E.5 |
| `5ea765ac-c279-551a-8a94-a07da2381e5b` | Kräfte und Trägheit qualitativ erklären | SekII2 | E.2 → `physics-e2-inertia` |
| `722857cf-f327-5740-8151-64eb92195ec8` | Mechanische Energieformen qualitativ unterscheiden | SekII2 | E.2 → `physics-e2-energy` |
| `9c328f68-41ed-55dd-9e02-34414a6246f2` | Masse und Gewichtskraft unterscheiden | SekII2 | E.2 → E.5 |

**Die Aussage zu den sechs Mathematikvorbereitungen stimmt.** Je LK-View liegt ihr einziger expliziter Erwerbsplatz jetzt in E.5. Die eigene transitive Bedarfsabfrage über die Zielinhalte der Einführungsphase findet für jedes dieser sechs Ziele ausschließlich E.5; kein Ziel, das in E.2 verbleibt, benötigt sie. Für die Kettenregel sind dies `e359f8bb` und `8a1d4093`; für die übrigen fünf zusätzlich `16caf92e` und `89cadf81`. Das bestätigt README Zeilen 53 und 58–62 sowie AGENTS.md Zeilen 807–810 auf dem Prüfstand. Dies behauptet keinen fehlenden späteren Bedarf in Q-Phasen.

## 3. Die wirkliche Vorgängermenge des alten Plans

Die alte Menge wurde aus den SekII-Blobs vor dem Schnitt unabhängig rekonstruiert, einschließlich der im jeweiligen Kurs geltenden Zielrollen, der fachinternen Erwerbsplätze und der GK-/LK-Tags. Die vier gemischten E.2-Prüfungsreferenzen bleiben als Strukturkinder erhalten; die beiden nur mit `GK` markierten Prüfungen erklären, weshalb die LK-Planmenge trotz zusätzlichen LK-Inhalten ebenfalls 32 betrug.

| Kurs | Vorher | Neue Auswahl | Exakt aus der Auswahl ausgeschieden | Neue Auswahl ∪ Testliste = alte Menge |
|---|---:|---:|---|---|
| GK | 32 | 28 | `eb0ffdea`, `a42f91a4`, `594f7f21`, `9c328f68` | ja |
| LK | 32 | 27 | dieselben vier und `e359f8bb` | ja |

Damit bildet `planStoredForForcesBeforeTheCutKeepsTheGravitationGoals` die richtige alte Auswahl ab (`ClaudeV1CompletionRouteIntegrationTest.java:2111–2134`). Das zuvor fehlende `9c328f68` ist jetzt enthalten. Die Prüfung geht über den Summenvergleich von 32 hinaus: Die eigene Messung vergleicht die vollständigen Mengen und weist keine zusätzlich erfundenen oder unterschlagenen Ziele aus.

Der Test baut den gespeicherten alten Block in der Datenbank nach, prüft `stale=false`, unveränderte Blöcke, Export/Import und ein verschobenes Ziel als nächste fällige Planarbeit (`2135–2154`). Er läuft nach seiner Annotation für beide Kurse, besitzt selbst keine Pilot-Parametrisierung. Er ist kein vollständiger Plan-Durchlauf über alle 32 Ziele. Ein unveränderter alter Fingerprint wird dort ebenfalls nicht hergestellt; das ist für diesen Regressionszweck kein Loch in der Gültigkeitsentscheidung: `LearnerLearningPlanService.java:1871–1884` verwendet die gegenwärtige Kompatibilität, und `LearnerService.java:4731–4735` ordnet den Fingerprint ausdrücklich als historischen Nachweis ein. README Zeilen 66–68 bleibt innerhalb dieser Bedeutung.

## 4. Neues Laufzeitszenario und gespeicherter Fokus

`goalInProgressSurvivesTheCutOfForces` (`ClaudeV1CompletionRouteIntegrationTest.java:2060–2098`) hat vier reale Parametervarianten: GK/LK × Pilot aus/an. Der Helfer konfiguriert das persönliche Curriculum entsprechend (`749–769`). Der Test setzt E.2 als gewählten Fokus, weist die heutige Nichtzugehörigkeit von `eb0ffdea` nach, erfüllt dessen wirkliche Voraussetzungshülle und stellt dann den alten gespeicherten Zustand `activeGoalId=eb0ffdea`, `TEACHING` her.

Geprüft werden anschließend:

- `getCoachLearnerState` liefert das laufende Gravitationsziel.
- Der reguläre `getLearnerState` bleibt `TEACHING`, zeigt genau dieses Ziel und ausschließlich E.2 in `goals.planned`; der gespeicherte aktive Zeiger bleibt erhalten.
- `setMastery` kann das Ziel bestehen lassen; der bestätigte Wert ist `1.0`, der gespeicherte Fokus danach weiterhin genau E.2.

Das trifft den gemeldeten Fehler. Die darunterliegende Regel des Pins `19c14af91e` erhält ausschließlich einen gewöhnlichen aktuellen atomaren Zielinhalt desselben Fachs außerhalb des gewählten Fokus (`LearnerService.java:5958–5984`). Die reguläre Zustandsprüfung berücksichtigt genau diese Ausnahme (`10199–10205`); `resolveEffectiveProjectedFocusIds` bleibt der gewählte Fokus, während nur die Laufzeitfunktion den laufenden Zielinhalt ergänzt (`5910–5945`). README Zeilen 69–70 behauptet in diesem Zusammenhang nichts darüber hinaus.

**Aussagegrenze des Tests:** Der neue E.2-Test ruft die Coach-Service-Lesefunktion auf, nicht den MCP-Adapter mit einer neuen Coach-Context-Antwort. Nach dem Bestehen prüft er Mastery und Fokus, aber nicht ausdrücklich den verschwundenen aktiven Zeiger oder den vollständigen nächsten Coach-Schritt. Der bestehende allgemeine Test `goalInProgressSurvivesARegroupingOutOfTheFocusedSection` prüft das Ende des aktiven Ziels bereits (`2045–2054`). Ein unabhängiger echter Coach-Probelauf ergänzt sinnvoll diese Grenzen; aus dem bloßen Lesen der neuen Testquelle lässt sich kein beobachtetes Laufzeitergebnis ableiten.

## 5. Der in #199 angepasste kanonische Unit-Test

`LearnerServiceCanonicalProjectionTest.java:1159–1184` stellt einen gewöhnlichen kanonischen Mathematik-Zielinhalt aus Sek I als aktiv her, bei einem gewählten Analysis-Fokus desselben Fachs. Er modelliert weder eine abgewählte Kompetenz noch ein fremdes Fach, einen ungültigen Zielbezeichner, eine Prüfung oder ein Kartendeck. Die frühere Erwartung „bei regulärem Lesen löschen“ trifft genau die Klasse von Zuständen, die #199 jetzt absichtlich erhält. Dass der Inhalt in einer anderen Stufe liegt, ändert daran nichts, solange er aktuelles Ziel des persönlichen Curriculums ist.

Die Umstellung auf „erhalten und gewählten Fokus unverändert zeigen“ ist deshalb sachlich richtig. Der alte Test bewies keine historische Herkunft dieser Kombination; auch der neue beweist keine geschehene Umgruppierung, sondern die heute gewollte Behandlung des vorgefundenen gespeicherten Zustands. Die durch die erste #199-Runde widerlegte Behauptung einer einzig möglichen Entstehung sollte daraus nicht wieder abgeleitet werden. Ein besonderer anderer Schutz, den gerade dieses ursprüngliche Szenario bewacht hätte und den die neue Erwartung unbeabsichtigt aufhebt, ist in der Quelle nicht erkennbar.

## 6. Nachweistext und verbleibende Präzisierungen

Der korrigierte Nachweis beseitigt den wesentlichen alten Mangel: Die Ortsbehauptung ist in `regrouping.actual.json:236` auf Zielrollen eingeschränkt, und die Vorbereitungsorte sind daneben vollständig benannt (`335–555`). README Zeilen 36–62 beschreibt die 30 Änderungen offen. Keine Curriculum- oder Ergebnisänderung wird als neue Beherrschung ausgegeben. Die zehn Zeilen der E.2-Struktur sind sechs Kindstrukturen plus vier Prüfungsreferenzen; dies ist eine Strukturzählung und keine Behauptung von zehn im jeweiligen Kurs verpflichtenden Lerninhalten.

Zwei Formulierungen verdienen eine genaue Lesart, sind aber keine weitere sachliche Reparatur des Schnitts:

1. README Zeilen 34–35 verbindet „Target goals“ mit „four from E.2 to E.5“. Die vier sind die vier benannten verschobenen IDs über die Varianten hinweg. Im GK ist `e359f8bb` eine Voraussetzung-allein-Referenz; pro GK-View wechseln daher drei Zielrollen und diese Supportreferenz nach E.5. Das JSON-Feld `goalsMovedToE5=4` zählt Referenzen, nicht vier GK-Zielrollen. Präziser wäre „three target goals in GK, four in LK; four named references in every view“. Die vollständigen Dateien und der neue Vorbereitungsnachweis sind dennoch eindeutig.
2. „Cards of the moved goals are practised with E.5“ (README Zeile 72) beschreibt die heutige kontextuelle Zugehörigkeit. Daraus folgt keine automatische Umschreibung alter gespeicherter E.2-Planblöcke oder des gewählten E.2-Kartenkontexts. #199 belässt diese Auswahl absichtlich. Die Persistenzzusage betrifft den Erhalt des laufenden gewöhnlichen Ziels; sie ist keine Zusage, alle historischen Kontexte auf E.5 umzubiegen.

**Falsche Handover-Begründung, außerhalb des E.2-Curriculum-Deltas:** Im Eintrag vom 25. November, 10:57 CET, heißt es, die App-Quellen seien gegenüber `a88f17523b` unverändert. Tatsächlich unterscheiden sich acht Dateien unter `app/src`: `components/ChatGptDesktopStart.tsx`, `locales/de.ts`, `locales/en.ts`, `utils/chatGptDesktopBeta.ts`, `utils/coachProviderMatrixCopy.ts`, dessen Test, `utils/faqViewCopy.ts` und dessen Test. Sie kamen mit dem neuen Parent hinzu; gegenüber `19c14af91e` ändert dieses E.2-Paket dort nichts. Der frühere vollständige Frontendlauf bleibt Beleg für den alten Pin. Eine aktuelle vollständige Abdeckung muss bei Bedarf über die erfolgreichen Prüfungen des neuen Parents bzw. des neuen Heads belegt werden und kann nicht mit einer Byteidentität der App-Quellen begründet werden. Dies ändert die bestätigte Byteidentität aller Physik-Views und des kanonischen Katalogs nicht.

**Prüfumfang:** eigene statische Messung und Quellreview, keine neue JUnit-Ausführung, keine Host-Akzeptanz, kein eigener Build und kein CI-Urteil. Geschrieben wurden ausschließlich dieser Bericht und die eigenen Proben unter dem angewiesenen Round-2-Verzeichnis.
