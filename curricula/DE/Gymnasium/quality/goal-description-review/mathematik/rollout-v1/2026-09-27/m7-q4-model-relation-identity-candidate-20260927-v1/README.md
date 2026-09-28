# Q4-Modellbeziehungen: `fde351a8…` und `07196e72…` (nichtkanonischer Kandidat)

Stand: 27. September 2026. **Fachlicher HOLD.** Dieser Vergleich ändert weder kanonische Ziele noch Source-Mappings, Registry, Bilddateien oder D/P/A/M/V-Entscheidungen. Alle Aussagen zum Status beziehen sich auf die zum Prüfzeitpunkt sichtbaren Dateien; historische Review-Pakete sind keine aktuelle Quellenfreigabe.

## Doppelung und eigenständige Leistung

| | `fde351a8…` | `07196e72…` |
| --- | --- | --- |
| Heutiges Ziel | „Beziehungen im Modell formulieren“: Gleichungen, Ungleichungen oder Funktionen **formulieren** und Terme im Kontext deuten. | „Beziehungen als Gleichungen, Funktionen oder Ungleichungen formulieren“: dieselben drei Formen **formulieren** und die Modellwahl begründen. |
| Kanonischer Elternzweig | `d7469bfb…` „Mathematische Modelle aufbauen“, `K2.3`, AB2; Geschwister Variablen/Annahmen, Nebenbedingungen, Modellanpassung. | `13f3bfd7…` „Mathematische Modelle bilden“, `K3.2`, AB2; Geschwister Variablen/Parameter, Rand-/Anfangsbedingungen, weitere Modellbildung. |
| Unmittelbare Vorbedingung | `7e1b43e2…` Variablen und Annahmen festlegen. | `670286aa…` Variablen und Parameter definieren. |
| Nachfolger | `e02b994f…` Nebenbedingungen; `70f37fda…` Ergebnis im Kontext deuten; Prüfungsziel `3095e125…`. | `c3cad3f5…` Rand- und Anfangsbedingungen. |

Die beiden Atome stehen im selben Q4.2-Teilbaum und werden über den Q4-Kanonikteilbaum in den HE-Sek-II-GK/LK-Views sichtbar. Zusätzlich listen die HE-G8/G9-Views **beide** IDs direkt unter „Weitere Kompetenzen“, obwohl beide `phase: Q4` tragen. Die breite G8/G9-Source-Extraction zu Sach-/Textaufgaben beweist die drei Formulierungstypen nicht automatisch als `exact` für diese Q4-Ziele. Eine Identitätsentscheidung braucht daher auch eine bewusste Stufen-/Projektionprüfung; die Q4-Metadaten allein entscheiden nicht über ein Ziel in Sek I.

## Primärquellen und Evidenzgrenzen

- Das amtliche HMKB-KC Mathematik gymnasiale Oberstufe (`input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-mathematik.pdf`) nennt in Q4.2 auf **gedruckter S. 52** unter Analysis „Begründen und interpretieren gegebener Terme“. Das ist eine **rezeptive** Leistung an *gegebenen* Termen. Es belegt nicht deren vorheriges Formulieren aus Größen als Gleichung/Funktion/Ungleichung. Q4.2 beginnt auf S. 51; dort ist nur Themenfeld 1 als verbindlich bezeichnet, und die danach angeführten Anwendungen sind exemplarisch durch die Lehrkraft auszuwählen. Dieser einzelne Q4.2-Beispielaspekt allein trägt keinen universellen GK/LK-Anspruch für alle heute gelisteten Länder.
- Die aktuelle HE-Sek-II-Source-Extraction führt hierfür `he-math-sekii-q4-2-b08-a02-a1b42ed0`, `sourceRef` S. 52. Die frühere `exact`-Kante auf `fde351a8…` wurde entfernt. Die zwei verbliebenen `exact`-Zuordnungen dieses Aspekts betreffen `2e40a879…` (Rechenregeln/Umformungen begründen) und `fcb4cef1…` (Aussagen strukturiert formulieren); sie sind keine automatische Deckung für das heutige `fde`.
- Das KC beschreibt K3-Modellieren auf S. 14 und K3.1–K3.8 auf S. 22. K3.2 stützt den Schritt Realsituation → Modell; K3.5 interpretiert **Modellierungsergebnisse**, nicht ausdrücklich gegebene Terme. `fde` und sein Elternzweig tragen dagegen aktuell `K2.3` (komplexes Problemlösen, AB3 im KC), das nicht ohne Einzelprüfung als Modellierungsbeleg taugt. Ein separater Prozessquellen-Kandidat ist in `docs/qa-ci/math-he-k3-process-source-candidate-2026-09-27.md` dokumentiert, aber nicht publiziert oder `exact` gemappt.
- BW BP2016, 2.3(5), S. 14, beschreibt Beziehungen mit Variablen, Termen, Gleichungen und Funktionen. Die aktuelle BW-Kante auf `fde` ist begründet nur `partial`: keine ausdrücklichen Ungleichungen und keine Termdeutung im Quellenausschnitt. Die ältere HE-Graph-zu-Kanonik-Abbildung für beide IDs reproduziert SkillPilot-Autorenschaft, nicht den amtlichen K3-/Q4.2-Wortlaut. Für `071` zeigt die aktuelle amtliche HE-Sek-II-E/Q-Mapping-Review keine direkte Kante; die sichtbaren amtlichen Zuordnungen sind breite HE-G8/G9-Anwendungsaspekte. Die D-KEEP-Entscheidung für `071` darf deshalb nicht als vollständiger Primärquellennachweis missverstanden werden.

## Prüfung, Bild und Qualitätssignale

- **P:** Beide haben aktuelle positive-understanding-v2-KI-Profile mit `status: needs_human_review`. `071` prüft Funktion, exakte Gleichung und Ungleichungsgrenze mit begründeter Wahl in drei neuen Kontexten. `fde` prüft unabhängig ein neu aufzustellendes Kostenmodell samt Termdeutung und eine Kapazitätsungleichung. Ein reines Deuten **vorgegebener** Terme wird durch `fde`-P derzeit nicht isoliert geprüft. Eine Textverengung würde dieses Profil neu benötigen.
- **Bilder/V:** Die gegenwärtigen PNGs sind bildgeprüfte KI-Kandidaten, aber nicht menschlich freigegeben. Das `071`-Taxi-Bild zeigt die drei Formulierungsformen. Das `fde`-Kiosk-Bild trägt ausdrücklich den Titel „Beziehungen im Modell formulieren“ und Pfeile von Kontextgrößen zur aufgestellten Funktion `K(x)=15+2x`. Sein fachlich korrigierter Kostenterm kann eine Deutung illustrieren, seine primäre Bildgeschichte ist jedoch **Aufstellen** statt Interpretation eines bereits vorgegebenen Terms. Bei der vorgeschlagenen Zielverengung wäre eine neue/angepasste bild- und seitengebundene V-Prüfung nötig; die alte PNG-Freigabe wandert nicht mit.
- **A/M/D:** Beide Voll-Ledger führen `atomic` und `no_memory_needed` mit jeweils gespeichertem Fingerprint. `071` hat eine aktuelle, zentral registrierte KI-Dual-Review-Synthese `keep_current` zum Taxi-PNG. `fde` steht in der aktuellen D-Triage unter den bildbereiten Quellen-/Niveau-HOLDs; seine zwei aktuellen D-Runden divergieren `revise / keep`. Keine dieser Bewertungen wird durch diese Notiz neu freigegeben. Ein neuer `fde`-Text ändert Fingerprints und verlangt frische, unabhängige D-Runden sowie A/M/P/V-Rechecks.
- **Assessment:** Das freigegebene Q4-Prüfungsziel `3095e125…` nennt `fde` in `requires` und `examData.coveredGoalIds`. Seine Caterer-Aufgabe lässt **zuerst** zwei Kostenfunktionen erstellen und anschließend deren Summanden erklären; sie legt die Terme nicht vor. Die Aufgabe kann daher ein künftig auf reines Deuten gegebener Terme begrenztes `fde` nicht unverändert als eigenständigen Covered-Goal-Nachweis tragen. Für `071` fand sich dagegen kein `examData.coveredGoalIds`-Eintrag im aktuellen kanonischen Graphen.

## Zielkandidat mit erhaltenen IDs — nur nach Strukturentscheid

`07196e72…` behält seine jetzige Aufgabe: Beziehungen **aus einer Situation formulieren** und die Wahl von Funktion, Gleichung oder Ungleichung begründen. `fde351a8…` würde eine davon getrennte, rezeptive Leistung erhalten:

> **DE-Titel:** Vorgegebene Modellterme deuten
>
> **DE-Beschreibung:** Die lernende Person kann die Bedeutung eines vorgegebenen mathematischen Terms und seiner Bestandteile in der beschriebenen Situation erklären und ihre Deutung anhand der Situationsangaben begründen.
>
> **EN title:** Interpret given model expressions
>
> **EN description:** The learner can explain the meaning of a given mathematical expression and its parts in the described situation and justify that interpretation using the contextual information.

Das ist ein **Kandidat**, kein `exact`-Mapping: Q4.2 belegt „gegebene Terme“ und deren Begründen/Interpretieren, aber die allgemeine Modell-/Sachkontextfassung erfordert eine gesondert geprüfte K3- oder weitere Quellenbindung. Der Begriff „Term“ meint hier einen bereits vorliegenden Ausdruck; weder die Wahl zwischen drei Formen noch das Aufstellen des Terms darf heimlich in der Prüfanforderung verbleiben. Ein positives Beispiel wäre, `K(x)=18+3x` **vorzugeben** und die Bedeutungen von 18, 3, x und `K(10)` samt Einheiten sowie eine falsche Erlös-Deutung prüfen zu lassen.

Diese ID-erhaltende Trennung ist fachlich besser als zweimal dieselbe Formulierungskompetenz. Sie ist aber **nicht** als isolierter Wortwechsel umsetzbar: `fde` stünde unter einem „Modelle aufbauen“-Elternzweig, sein gegenwärtiges Bild/P-Profil/Assessment zeigen das Aufstellen, und die `requires`-Kanten zu Nebenbedingungen und Ergebnisdeutung müssten nach der neuen Bedeutung einzeln geprüft werden. Besonders die G8/G9-Direkteinträge beider IDs sind gesondert mit alters- und quellengerechter Geltung abzugleichen. Ein kompletter Graph-Umbau oder neue Bilder werden hier nicht fingiert.

## Alternativen und Entscheidung

- **Beide heutigen Ziele beibehalten:** fachlich nicht empfohlen. Die Formulierungsleistung ist nahezu doppelt; verschiedene Elterncluster und Vorbedingungen allein schaffen keine eigenständige Beherrschung.
- **`fde` in `071` zusammenlegen:** vorerst ebenfalls HOLD. Dadurch würde das Deuten gegebener Terme als eigenständige Leistung aus dem Graphen verschwinden oder `071` würde erneut ein Doppelziel. Außerdem wären bestehende Mastery-Werte, Vorbedingungen, `contains`, direkte G8/G9-Einträge, P-/Bild-/Prüfungsbindungen und Quellennachweise migrationspflichtig. Keine automatische ID-Löschung oder Mastery-Übertragung.
- **ID-erhaltende Trennung „formulieren“/„gegebenen Term deuten“:** bevorzugter **Review-Kandidat**, solange die rezeptive Kompetenz als Ziel für den gewählten Q4-/Länderscope bestätigt und die abhängigen Artefakte neu gebunden werden. Q4.2 ist nur ein exemplarischer Anwendungsaspekt; ohne tragfähige Scope-/Quellenentscheidung bleibt auch dieser Kandidat HOLD.

**Freigabereihenfolge:** erst fachliche Zielidentität und verbindliche Geltung je View entscheiden; dann Elternzweig/`requires`/Assessment und Quelle gezielt korrigieren; erst danach Bild-Prompt bzw. Bild, P/A/M und zwei unabhängige D-Runden auf denselben aktuellen Fingerprints, zuletzt zentrale Gate-/Floor-Prüfung. Bis dahin **kein KEEP und kein M7-Zuwachs**.
