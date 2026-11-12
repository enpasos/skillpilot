# Reduktionsnachweis eingefroren: Wiederverwendung der Reviews je Ziel

Stand: 12. November 2026. Dieses Protokoll hält fest, warum der Nachweis der
Voraussetzungsreduktion eingefroren wurde, was der Registervertrag V9 bindet
und was beim Einfrieren geprüft wurde. Kanonische Ziele, Laufzeitregeln und
Lernergebnisse ändern sich durch diese Lieferung nicht.

## Entscheidung

Der Product Owner hat am 12. November 2026 zweimal entschieden:

1. Die Bindung des Nachweises wird enger gefasst, bevor eine neue Prüfung in
   ein kanonisches Fach kommt.
2. Der Nachweis wird eingefroren. Vorausgegangen war der Befund im Code, dass
   eine engere Bindung das Nachrechnen der Historie beendet. Die Kette wird ein
   letztes Mal vollständig geprüft, das Ergebnis je Ziel festgehalten und die
   Historie danach nicht mehr nachgerechnet.

## Ausgangslage

Zwischen dem 7. und 11. November 2026 wurden die `requires`-Kanten von 1.465
Zielen in zehn Fächern normalisiert und transitiv reduziert. Reviews sind an
Fingerabdrücke des Ziels gebunden, wie es beim Review aussah: die
Semantic-Kind-Entscheidungen, die Evidenzreviews, die Beschreibungsreviews und
das Audit der kanonischen Bindung. Der Nachweis belegt, dass sich ein Ziel
seitdem nur durch eine bewiesene Reduktion geändert hat. Deshalb dürfen seine
Reviews mit dem damaligen Stand verglichen werden.

Die Verträge V1 bis V8 binden dafür jedes der 21 kanonischen Fachdokumente als
Ganzes. Kein historisches Dokument ist gespeichert: Jeder frühere Stand ist das
aktuelle Dokument, in dem die protokollierten Änderungen zurückgenommen sind,
und nur über den Digest des ganzen Dokuments exakt. Daraus folgte:

- Jede Zieländerung in irgendeinem Fach, auch eine neue Prüfung, machte den
  Nachweis ungültig. Die Wiederverwendung entfiel dann für alle Ziele zugleich,
  `CQR-303` scheiterte, und die fünf Fächer mit M7-Floor fielen auf M6. So
  geschah es am 12. November beim ersten Eintragen einer Lerneinheit.
- Die Kette ließ sich nur nachrechnen, solange der Katalog ihr Endstand war.
  Sie hing außerdem an lebenden Eingaben: am Applicability-Compiler und an
  dessen Mapping- und Override-Eingaben.
- Ein vollständiger Lauf dauerte 440 bis 830 Sekunden und lief in jedem Prozess
  neu, der Reviews prüft, in der CI in etwa acht Schritten.

## Registervertrag V9

`curricula/DE/Gymnasium/provenance/prerequisite-reduction-proof-registry.json`
trägt den Vertrag `frozen-goal-scoped-prerequisite-reduction-v9`. Der
vollständige V8-Nachweis liegt byteidentisch als Elternregister daneben:
`prerequisite-reduction-proof-registry-v8-politics-economics-20261111.json`.

| Feld | Inhalt |
| --- | --- |
| `parentRegistryPath`, `parentRegistryRawDigest` | Der eingefrorene V8-Nachweis, gebunden über den SHA-256 seiner Bytes. |
| `frozenCatalogSources` | Die Dokumentbindungen des Elternregisters als Historie: Ausgangs- und Endstanddigest je Fachdokument. Den aktuellen Katalog binden sie nicht. |
| `transfers` | Je Ziel, dessen Reviews einen anderen Stand gesehen haben als das Ziel beim Einfrieren: der Digest des ganzen Zielobjekts beim Einfrieren (`frozenGoalDigest`), die Felder, in denen der geprüfte Stand abweicht (`reviewedFields`, `reviewedAbsentFields`), und der Digest des geprüften Stands (`reviewedGoalDigest`). |

Beim Laden gilt:

- Hat ein Ziel noch seinen `frozenGoalDigest`, gilt seine Übertragung: Die
  Reviews werden mit dem geprüften Stand verglichen. Dieser entsteht aus dem
  aktuellen Ziel und den abweichenden Feldern und muss den `reviewedGoalDigest`
  haben.
- Hat sich das Ziel geändert oder gibt es das Ziel nicht mehr, gilt keine
  Übertragung. Seine Reviews werden strikt mit dem aktuellen Ziel verglichen.
  Es braucht ein neues Review, und nur dieses Ziel.
- Jede andere Katalogänderung lässt alle Übertragungen unberührt: neue Ziele,
  neue Fachdokumente, Änderungen an anderen Zielen, Lerneinheiten.
- Das Laden rechnet keine Historie nach und kompiliert keine Applicability. Es
  dauert 0,6 Sekunden.

Zeugenpfade gehören zum eingefrorenen Nachweis und werden gegen spätere
Katalogstände nicht erneut geprüft. Eine Auszählung der im Register genannten
Pfade ergab rund 5.300 Kanten, knapp die Hälfte aller verfassten
`requires`-Kanten; sie laufend zu binden hätte wieder den halben Graphen
gesperrt. Es wäre auch eine Sonderpflicht ohne Grundlage: Ein
gewöhnliches Review ist an das Zielobjekt gebunden und veraltet nicht, wenn
sich die Voraussetzungen eines anderen Ziels ändern.

## Vertrauensgrenze

V9 erkennt ein in sich stimmig gefälschtes Register nicht selbst. Wer
`reviewedFields` ändert und den `reviewedGoalDigest` passend neu berechnet,
erhält ein ladbares Register. Dagegen stehen:

- Die Ableitung aus dem Elternregister vergleicht das Register byteweise mit
  dem Ergebnis der vollständigen Prüfung
  (`npm --prefix app run check:prerequisite-reduction-freeze`). Sie ist nur
  möglich, solange der Katalog der Endstand des Nachweises ist.
- `testPrerequisiteReductionProof.ts` bindet die Bytes des Registers über einen
  festen Digest. Wer das Register später ändert, muss diesen Test sichtbar
  mitändern.
- Register und Elternregister sind unveränderliche Evidenz. Eine künftige
  Massennormalisierung braucht eine neue Nachweisepoche, keine Änderung an
  dieser.

## Ergebnis des Einfrierlaufs

| Größe | Wert |
| --- | --- |
| Vollständige Prüfung des V8-Nachweises | bestanden, 440 s |
| Fachdokumente | 21 mit 6.524 Zielen |
| Quellen von Nachweisoperationen | 1.465 |
| Übertragungen | 1.361 |
| Elternregister, SHA-256 der Bytes | `430d0f97911a119d259d7dc196f954d89daf2909c368121a626b73b7378ba518` (6,9 MB) |
| V9-Register, SHA-256 der Bytes | `a48b52ca0449ff75dce93e93a3ade8982210d32a03f9a585a03b935ebed052b7` (0,9 MB) |

Von den 1.465 Quellen haben 1.345 einen geprüften Stand, der vom heutigen Ziel
abweicht. Bei 120 Quellen heben sich die Operationen auf, etwa wenn eine
materialisierte Kante später wieder entfällt; sie brauchen keine Übertragung.
Hinzu kommen 16 Ziele, bei denen sich nur das zwischengespeicherte
`applicability` geändert hat (Vertrag V7).

| Fach | Übertragungen |
| --- | ---: |
| Mathematik | 520 |
| Biologie | 273 |
| Chemie | 160 |
| Physik | 156 |
| Politik und Wirtschaft | 95 |
| Wirtschaftswissenschaften | 62 |
| Informatik | 38 |
| Latein | 20 |
| Geschichte | 19 |
| Deutsch | 18 |

| Abweichendes Feld | Übertragungen |
| --- | ---: |
| `requires` | 1.345 |
| `extendedData` (ohne `assessmentApplicabilityBasis`, Vertrag V8) | 62 |
| `applicability` (Vertrag V7) | 27 |

Eine Übertragung kann mehrere Felder nennen.

## Prüfungen am Einfrierstand

| Prüfung | Ergebnis |
| --- | --- |
| `npm run test:transitive-minimality` (650 s) | bestanden. Der Live-Abschnitt prüft den vollständigen V8-Nachweis über das Elternregister und danach für alle 6.524 Ziele, dass das V9-Register denselben geprüften Stand liefert; alle 1.361 Übertragungen sind aktiv. |
| V9-Fixtures in `testPrerequisiteReductionProof.ts` | 15 angenommene und 29 abgelehnte Fälle: fremde Änderungen lassen alle Übertragungen bestehen, ein geändertes oder entferntes Ziel verliert nur seine eigene, manipulierte Register scheitern. |
| Java, `FirstMathPrerequisiteReductionTest` gegen das Elternregister | bestanden, alle 9 Tests; mit den 3 Tests von `LearningUnitLayerProjectionConformanceTest` 55 Minuten |
| Python-Brücke, `test_prerequisite_reduction_semantic_kind.py` | bestanden, 26 Tests in rund 85 s, darunter der Lauf über den echten Node-Prüfer mit dem V9-Register |
| `quality:curriculum-status` | neu erzeugt in 192 s statt zuvor rund 640 s. Es ändern sich Vertragsname, Registerdigest und die Liste der gestützten Ziele (1.465 Quellen werden zu 1.361 Übertragungen); kein Reifegrad ändert sich. |
| Paketmodell Mathematik, `run_curriculum_release_model_conformance.sh` | bestanden in 382 s. Der Inhaltsdigest des Modells bleibt `5d3cf9c7…`, der Weitergabeledger ist aktuell, zwei Bauten sind bytegleich; die Modellmetadaten nennen den Vertrag V9. |
| Verbrauchertests, die den Nachweiskontext laden | bestanden: Q4-Caterer-Umfang, Q2.5-Streckung, Q2-M7-Projektion, Deep-Understanding-Rollout, Auflösung der Beschreibungsreviews, Lernzielbuchmodell und Physik-Lernzielbuch-Eingaben |

## Was sich für Curriculum-Änderungen ändert

- Wer eines der 1.361 gestützten Ziele ändert, braucht für dieses Ziel neue
  Reviews. Der Qualitätsstatus führt die aktiven Übertragungen auf; ein
  geändertes Ziel fällt aus dieser Liste.
- Neue Ziele und Änderungen an anderen Zielen berühren die Wiederverwendung
  nicht. Sie durchlaufen die üblichen Prüfungen für neue oder geänderte Ziele.
- Die Eingabebindung des Mathematik-Dauerlayouts hasht weiterhin die
  Fachdatei ohne Einheitenschicht und veraltet bei jeder Zieländerung in
  Mathematik.

## Folgeschritt

Drei Prüfungen rechnen die echte Historie noch gegen den aktuellen Katalog
nach: der Live-Abschnitt von `testPrerequisiteReductionProof.ts`, die Java-Klasse
`FirstMathPrerequisiteReductionTest` und die Bindung der Einheitenprojektion an
den Dokumentdigest der Mathematik. Sie können nur am Einfrierstand bestehen. An
diesem Stand laufen sie in der CI noch einmal vollständig; das ist der Beleg
des Einfrierens. Ein Folge-PR nimmt sie aus der laufenden CI. Bis dahin darf
kein kanonisches Ziel geändert werden.
