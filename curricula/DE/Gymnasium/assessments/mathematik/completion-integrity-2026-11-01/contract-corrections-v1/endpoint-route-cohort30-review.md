Die erste begrenzte Routen-Kohorte ist abgeschlossen: **17 PASS_FOR_BOUNDED_LINK, 10 NEW_TASK_NEEDED, 3 UNRESOLVED**. Die fachlich genehmigte Umsetzung umfasst **zwölf neue Vorbereitungskanten an zehn vorhandenen Prüfungen und drei gezielte Supportkorrekturen**. Sie ändert keine Aufgabe, Lösung, Rubrik, Coverage, ID oder bestehende Mastery. Es wurde kein Canon-Kandidat geschrieben.

Grundlage ist die eingefrorene Probe mit 154 Angeboten aus 72 Views. Die 30 Ziele sind nach Häufigkeit unter den 431 verschiedenen uncoveredTargets ausgewählt; Gleichstände werden nach vollständiger UUID sortiert. Die Zahlen sind Arbeitspriorisierung, keine Aussage über den endgültigen Scope. Inhaltskontext ist der gemeinsame combined-draft einschließlich der 28 Oberstufenkorrekturen sowie der separaten c9d- und 4c319-Deltas.

- Probe-SHA: `a65645aacf888dd5e699a65e44c4ec11b305cad212b4a177926b2baac0c5089e`.
- Geprüfter Canon-SHA: `ee8fd88a3469925fc9153742ea23a7ebba3ff33070ad137c5d6da93dd18a3c0e`.
- [Vollständige 30-Fall-Matrix](endpoint-route-cohort30-review.json), SHA `80f0cceb1c04c87efd1a2714b818f0b5e828f0663cd917c1ae5c24ecefdfc49f`.

Die JSON bindet beide vollständigen Goalverträge je Fall, die konkreten Task-/Solution-/Rubrikbytes, sämtliche 165 vorhandenen direkten Prüfungsvoraussetzungen sowie exakte Vorher-/Nachher-Hashes der 13 geplanten Goaländerungen. Vorhandene Inhaltsreviews wurden wiederverwendet; dies ist kein erneutes 165er-Audit. Die damals noch ausstehende Gesamtprüfung des 28er-Autorenpatches ist inzwischen im konsolidierten Inhaltsstand berücksichtigt; dessen genaue Übertragungsbindung folgt unten.

| Rang | Ziel | Probeangebote | Entscheidung | Passende bestehende Prüfung | Grund |
|---:|---|---:|---|---|---|
| 1 | `9f9c7ece` Oberflächeninhalte von Körpern berechnen | 133 | UNRESOLVED | `e5494c67` | Prisma passt; der gesamte Oberflächen-Supportvertrag ist noch zu breit. |
| 2 | `250daae6` Einfache Parametertransformationen in Funktionsuntersuchungen nutzen | 132 | PASS_FOR_BOUNDED_LINK | `3da7863d` | Vertikale Lage und Skalierung von Minimum/Maximum in Kettenlinie/Glockenkurve. |
| 3 | `492463cf` Geradlinige Bewegungen mit Orts- und Geschwindigkeitsvektoren untersuchen | 132 | PASS_FOR_BOUNDED_LINK | `ea664a30` | Tatsächliche Orts-/Geschwindigkeitsdeutung; zuerst Winkelzwang im Support ersetzen. |
| 4 | `4b16fce6` Anschlussbedingungen ohne Sprung und Knick modellieren | 132 | NEW_TASK_NEEDED | `68a262fc` | Kein vorhandener Auftrag modelliert eine sprung- und knickfreie Naht. |
| 5 | `6481fc23` Geeignete Lösungsstrategien für lineare Gleichungssysteme auswählen | 132 | NEW_TASK_NEEDED | `8d314e15` | LGS-Lösen allein benötigt keinen zusätzlichen Vergleich mit einer günstigeren Alternative. |
| 6 | `6947245e` Parameterwerte aus vorgegebenen Funktionseigenschaften bestimmen | 132 | PASS_FOR_BOUNDED_LINK | `74e9a588` | Parameter wird aus der Wendestellenbedingung für die Ortskurve eliminiert. |
| 7 | `8e1b0d9c` Ganzrationale Funktionen aus Eigenschaften rekonstruieren | 132 | NEW_TASK_NEEDED | `ec707244` | Ballparabel nutzt fertigen Scheitel; ein unbekanntes Koeffizienten-LGS fehlt. |
| 8 | `b88cbf71` Sachzusammenhänge mit Wendestellen modellieren | 132 | NEW_TASK_NEEDED | `2f626446` | Fertige Führungsschiene wird untersucht, kein Modell aus Wendebedingungen aufgestellt. |
| 9 | `d5feba00` Notwendige und hinreichende Bedingungen für Extrem- und Wendestellen unterscheiden | 132 | PASS_FOR_BOUNDED_LINK | `2f626446` | Vorzeichenwechsel und Gegenbeispiel unterscheiden notwendige/hinreichende Bedingungen. |
| 10 | `d78946f9` Ganzrationale Funktionen mit Differentialrechnung analysieren | 132 | PASS_FOR_BOUNDED_LINK | `c4cf4273` | Echte analytische Polynomuntersuchung mit dokumentierter digitaler Kontrolle. |
| 11 | `e9c401b1` Polynomgleichungen in Funktionsuntersuchungen lösen | 132 | PASS_FOR_BOUNDED_LINK | `c4cf4273` | Polynomgleichungen werden strukturgerecht gelöst und analytisch verwendet. |
| 12 | `a9fde754` Durchstoßpunkte einer Geraden mit Koordinatenebenen bestimmen | 130 | NEW_TASK_NEEDED | `bc244d82` | Allgemeine Ebene ist kein spezifischer Gerade–Koordinatenebene-Auftrag. |
| 13 | `0e8417d7` Integrale bei verknüpften Exponential- und ganzrationalen Funktionen berechnen | 126 | PASS_FOR_BOUNDED_LINK | `5d3fd2c4` | Integral der Exponential-Polynom-Schar ist tatsächlich zu berechnen. |
| 14 | `ccfd4e60` Funktionenscharen mit Exponential- und ganzrationalen Anteilen untersuchen | 126 | PASS_FOR_BOUNDED_LINK | `5d3fd2c4` | Parametereinfluss auf Maximum/Wendestelle; echter vorhandener Weg über 0e8417. |
| 15 | `d144a855` Integrale ganzrationaler Funktionenscharen berechnen | 126 | NEW_TASK_NEEDED | `1969d4dc` | Bei1969 wird vor der Integration ausdrücklich a=3 eingesetzt. |
| 16 | `ded082ed` Kritik aufnehmen und integrieren | 126 | PASS_FOR_BOUNDED_LINK | `b9a501c4` | Prüfende Rückfragen aufnehmen und eigene Nachricht konkret überarbeiten. |
| 17 | `e33e75e3` Transformationsscharen bekannter Funktionsklassen untersuchen | 126 | PASS_FOR_BOUNDED_LINK | `3da7863d` | Glockenparameter bewirken genau Skalierung und Verschiebung einer Grundform. |
| 18 | `fc2cf102` Kooperativ Ergebnisse erarbeiten | 126 | NEW_TASK_NEEDED | `b9a501c4` | Keine der bestehenden Einzelaufgaben verlangt wirkliche Gruppenarbeit. |
| 19 | `436532fe` Lösungsmengen linearer Gleichungssysteme geometrisch deuten | 122 | PASS_FOR_BOUNDED_LINK | `8d314e15` | LGS liefert leere Menge, Gerade oder Ebene; freie Variablen werden gedeutet. |
| 20 | `61686d85` Einfache gebrochen rationale Funktionen untersuchen | 116 | UNRESOLVED | `bbb340ed` | Bereits korrekt an bbb340 gebunden; diese Prüfung fehlt in allen 116 betroffenen Angeboten. |
| 21 | `08b80080` Funktionsklassen argumentativ vergleichen | 114 | NEW_TASK_NEEDED | `6634ef12` | Vorhandener Vergleich beschränkt sich auf langfristige Modellpassung. |
| 22 | `1675fdde` Anzahl von Graph-Schnittpunkten anschaulich begründen | 114 | NEW_TASK_NEEDED | `629b1ce0` | Rechnerische Sichtprüfung ersetzt keine anschauliche Schnittanzahlbegründung am Graphen. |
| 23 | `18b43bc8` Lösungsweg auf eine verwandte Situation übertragen | 114 | PASS_FOR_BOUNDED_LINK | `99b3435a` | Konkreter Transfer von Faktor 2 zu 3 samt begründeter Strategieanpassung. |
| 24 | `21fa0c22` Zufallsexperimente und Ereignisse aus Termen formulieren | 114 | NEW_TASK_NEEDED | `f85d225d` | Bestehende Urne geht vom Experiment zum Term; benötigt wird die umgekehrte Richtung. |
| 25 | `3b64b90b` Logische Schlussfolgerungen entwickeln | 114 | PASS_FOR_BOUNDED_LINK | `99b3435a` | Echte vorhandene Argumentationskette hinter dem Transfer, kein weiterer Direktanhang. |
| 26 | `499b8a0d` Argumente und Aussagen beurteilen | 114 | PASS_FOR_BOUNDED_LINK | `99b3435a` | Zulässigkeit, Vollständigkeit und Ausgangsproben werden konkret geprüft. |
| 27 | `5d9c156b` Teilungsverhältnisse bei Strecken untersuchen | 114 | PASS_FOR_BOUNDED_LINK | `990739f7` | Schwerpunktaufgabe braucht gerichtetes Verhältnis 2:1; Körpervolumen/-fläche aus Support entfernen. |
| 28 | `6517427b` Einfache gebrochen rationale und Wurzelfunktionen ableiten | 114 | UNRESOLVED | `bbb340ed` | Bereits korrekt an bbb340 gebunden; diese Prüfung fehlt in allen 114 betroffenen Angeboten. |
| 29 | `87372f49` Eine heuristische Strategie anwenden | 114 | PASS_FOR_BOUNDED_LINK | `99b3435a` | Echte heuristische Strategiewahl in der Zahlensuche; keine generische Sammelkante. |
| 30 | `c0e34fa8` Mathematische Probleme erkennen und formulieren | 114 | PASS_FOR_BOUNDED_LINK | `99b3435a` | Sprachlich geänderte Bedingung wird mathematisch formuliert; sachfremde Analysis/Geometrie entfernen. |

**Exakt genehmigte Vorbereitungskanten**, alle bisherigen echten Anforderungen bleiben erhalten; Coverage bleibt unverändert:

| Prüfung | Zusätzliches requires | Konkrete Handlung |
|---|---|---|
| `3da7863d-9784-5ea2-bb53-856021b32b18` | `250daae6-58fd-59e4-8a11-f994e789ee47`, `e33e75e3-eae5-5a09-862f-d1a11176373f` | Vertikale Parameterwirkung und Transformationsschar an den vorhandenen Modellen. |
| `ea664a30-98be-508e-90ac-5304679814ee` | `492463cf-6cb2-5a5a-98e0-c1d77c36c256` | Orts- und Geschwindigkeitsvektor der Drohne deuten. |
| `74e9a588-cd05-5007-a715-f360fdea9989` | `6947245e-6bd7-52d7-9bc2-0c60cfa447c5` | a aus der Wendestellenbedingung gewinnen und eliminieren. |
| `2f626446-4b32-5674-a687-9cd754bdfede` | `d5feba00-4336-4f26-8dba-0537a797eddb` | Notwendige/hinreichende Bedingungen durch Vorzeichen und Gegenbeispiel unterscheiden. |
| `c4cf4273-cadc-5eca-9b35-b3edd6de26ce` | `d78946f9-1f5f-462c-a99c-fe01054042dd`, `e9c401b1-144d-525f-a148-a1113b2e82a8` | Polynomgleichungen, analytische Extremnachweise und echte digitale Kontrolle. |
| `5d3fd2c4-7c7e-569e-ae02-75486573f3cc` | `0e8417d7-effb-5314-93ba-a571b01726ce` | Exponential-Polynom-Integral; die Scharvorbereitung ccfd bleibt über 0e8417 erreichbar. |
| `b9a501c4-9d74-5514-b77b-895980b89b1b` | `ded082ed-ea38-510c-ab91-e0a50b064e07` | Rückfragen aufnehmen und eigene Darstellung überarbeiten. |
| `8d314e15-69e9-5af1-a10a-be820b2f821d` | `436532fe-cee6-5a13-a4be-05522435937b` | Gesamte LGS-Lösungsmenge geometrisch einordnen. |
| `99b3435a-fdda-5d1b-9681-0ae6d7d5bfcd` | `18b43bc8-ee2a-5505-99ad-3a261a62f64a` | Lösungswege auf die geänderte Gleichung übertragen; vorhandene kurze Prozesskette trägt die weiteren Fälle. |
| `990739f7-f17d-5199-bdec-0512eb846f14` | `5d9c156b-e5a4-5e91-9da3-22e858eb1f8e` | Gerichtete Teilungsverhältnisse der Seitenhalbierenden bestimmen und prüfen. |

**Drei erforderliche Supportkorrekturen** gehören zur selben begrenzten Umsetzung:

- **`492463cf-6cb2-5a5a-98e0-c1d77c36c256`**: Für x(t)=x0+t·v sind Orts-/Richtungsdeutung, skalare Multiplikation und Vektoraddition echte Vorbereitung. Ein Winkel zwischen zwei Vektoren mittels Skalarprodukt gehört nicht zum vollständigen Bewegungsvertrag. Der bisher allein geforderte Winkelvertrag wird durch diese vorhandenen Grundlagen ersetzt; seine bisher indirekte Vektordeutung bleibt ausdrücklich erhalten.
  Vollständige neue `requires`-Liste: `be0e8715-3c3a-5ffb-937a-0b6bce4f01d8`, `c63bbffd-8d1c-5fe2-a428-db194e6fe592`, `571793bd-34f1-539e-969c-dfcc2dfa96b3`.
- **`5d9c156b-e5a4-5e91-9da3-22e858eb1f8e`**: Räumliche Streckenteilungsverhältnisse benötigen Längen-/Vektorverhältnisse und affine Rechnung, aber keine Volumen- oder Oberflächenberechnung und keinen vollständigen Satz von Körpereigenschaften für Prismen/Pyramiden. Streckenlängen69eda bleiben; komponentenweise Vektoraddition und Skalierung kommen als konkrete Grundlage der Teilpunktgleichung hinzu. Genau die drei überbreiten Körperverträge636b,5f548,9f9c entfallen.
  Vollständige neue `requires`-Liste: `69eda7f9-1898-5220-932d-e7bec839b7af`, `c63bbffd-8d1c-5fe2-a428-db194e6fe592`, `571793bd-34f1-539e-969c-dfcc2dfa96b3`.
- **`c0e34fa8-fde5-5a4e-9b84-c5d5db719b58`**: Allgemeine Problemformulierung verlangt Gegebenes/Gesuchtes, Annahmen und Zielgrößen. Elementarableitungen und Gerade–Ebene-Lagebeziehungen werden dafür nicht allgemein benötigt. Genau diese zwei sachfremden direkten Anforderungen entfallen; der vorhandene volle Formulierungs-/Annahmenweg über a288 und die Orientierung bleiben.
  Vollständige neue `requires`-Liste: `a288231e-e4bb-5c65-b018-b79a51ca87d8`, `71cec9fb-3751-4d61-8b34-c5adbbf6e5f2`.

Die vollständigen bestehenden Verträge aller entfernten und hinzugefügten Anforderungen sowie die exakten Nachher-Goalhashes stehen in der JSON. Ein vollständiger geerbter/expandierter DAG-Check des nur im Speicher konstruierten Deltas ist grün. Die konkret entfernten Winkel-, Körper-, Ableitungs- und Gerade–Ebene-Verträge kehren über die reparierten Consumer nicht indirekt zurück. Andere volle Verträge werden weder gelöscht noch global beschnitten.

**Die verbleibenden Aufgabenlücken sind nicht automatisch zehn neue Prüfungsziele.** Polynomrekonstruktion, Anschluss-/Wendemodellierung und parameterabhängige Integration lassen sich fachlich sinnvoll planen; eine analytisch-geometrische Aufgabe kann echte Koordinatenebenen-Schnittpunkte und begründete Verfahrenswahl verbinden. Graphischer Klassen-/Schnittvergleich, umgekehrte Wahrscheinlichkeitsmodellierung und reale Kooperation benötigen jeweils ihre tatsächliche Handlung. Bestehende richtige Aufgaben werden dafür nicht dupliziert oder durch bloße Metadaten zu solchen Aufgaben erklärt.

**Die zwei bbb340-Fälle sind Auswahlfragen.** 61686 und 651742 sind bereits korrekt vorbereitet und tatsächlich geprüft. In den 116 bzw. 114 eingefrorenen Problemangeboten liegt bbb340 weder im Target noch im Kontext. Neue Kanten würden daran nichts ändern. Eine passende spätere Auswahl braucht die echte Landes-/Kurs-/Stufengeltung; dieser Bericht ordnet die Aufgabe nicht pauschal allen Angeboten zu.

**Der Oberflächenfall bleibt begrenzt offen.** Das bestehende Prisma ist fachlich geeignet. Der breite 9f9c-Support zieht aber unter anderem Volumen- und schiefe Körper-/Winkelkompetenzen hinein. Eine solche Kante wird nicht zur bloßen Erreichbarkeit freigegeben. Zuerst genau diesen Vertrag lokal klären, ohne die richtige Prisma-Prüfung neu zu schreiben.

Die erwartete SHA der vollständigen, nach diesen 13 Requires-Änderungen mit indent2/UTF-8/finalem Newline serialisierten Kandidatendatei wäre `9317cf027401c26fe63bb2fb50495ec59093074a87f63140b4f05bf507563cc5`. Sie wurde hier nicht geschrieben. Implementierung liegt bei Sol; die ursprünglichen Input- und Reviewdateien bleiben erhalten.

Der endgültige tatsächliche 154er-Angebotsvergleich bleibt bei Root. Die alten 72 View-Zahlen beweisen weder eine neue Auswahl noch, dass alle betroffenen Profile durch diese Links repariert sind. Insbesondere neue reale Vorbereitung kann dynamische Applicability beeinflussen. Kein Source-/Scope-/M7-, Release- oder Live-PASS wird behauptet. **Vorhandene gültige Mastery bleibt gültig; kein zweiter Ergebnisstatus und keine rückwirkende Requalifikation.**

**Übertragung auf den konsolidierten Inhaltsstand:** `common-offline-canonical-math.content-reviewed.json`, SHA `87bed8c1c27e10e1a0f92b26448cc18c9abf5a3c742e84a11de94ad55b155002`, enthält exakt dieselben Requires-Arrays und dieselben 143 hier herangezogenen Goalverträge. Alle 19 in dieser Matrix verwendeten Aufgaben, Lösungen, Rubriken und Coverage-Arrays sind byte- beziehungsweise strukturidentisch; nur bei c4cf, ea664 und ec707 ändern sich Freigabestatus und Reviewnotiz. Die 17/10/3-Entscheidungen und exakt dieselben 13 Requires-Deltas gelten daher auch für diesen Stand. Die JSON enthält zusätzlich die vollständig neu gebundenen Vorher-/Nachher-Goalhashes. Die erwartete vollständige Kandidatendatei nach Anwendung auf diesen neuen Stand hätte SHA `e70902a24a4a28b80c243b1971135431a5d4e8985533f23ad04e995734e8d660`; auch sie wurde nur im Speicher geprüft und nicht geschrieben. Alle 165 ExamData-Objekte bleiben durch dieses Delta unverändert. Die sechs geänderten Prüfungen mit dynamischer Applicability sind 2f626, ea664, 990739, 8d314, 3da786 und 74e9; ihre reale Angebotswirkung bleibt Teil der getrennten Scopeprüfung.
