# Freiwillige Angebote im persönlichen Lernumfang und Lernplan

VR2a führt freiwillige Ziele in der Ansicht und im persönlichen Fachplan ein. Eine ausdrücklich bestellte Leistung zählt im eigenen Plan. Für den Fachabschluss und die Statistik des Fachs gelten die regulären Ziele. Angebote stehen in den Testansichten. Die fachlichen Lehrpläne enthalten weiterhin null freiwillige Einträge.

## Bestehende Ansichten

Auf den unveränderten Produktionsklassen von `8bf30f868d` wurden für alle 387 Ansichten Ziel-ID und deutscher Titel in sichtbarer Reihenfolge erfasst. Ein zweiter Lauf bestätigte die Referenz. Bei absichtlich umgekehrter Reihenfolge bestanden die bisherigen Mengenvergleiche, der zusätzliche Vergleich schlug fehl. Die bereits geprüften Zielmengen, Voraussetzungspfade und 2.355 lesbaren Deck-/Ansichtskombinationen bleiben eigene Kontrollen. [Reihenfolge und Gegenprobe](vr2a-visible-order-base.json) · [Ausgangsmessung der Mengen](baseline-parity.json)

## Pläne aus früheren Katalogständen

Ein gespeicherter Abschnitt kann nach einer Rollenänderung keine weitere Pflicht enthalten. Die Planfortsetzung darf dann wie bei der bisherigen E.1-Regel ein anderes erreichbares persönliches Ziel anbieten. Bei einem Fach mit ausschließlich freiwilligen Angeboten kann die reguläre Fortsetzung leer sein. Identität und Form der damaligen Erfassung werden anhand des gespeicherten Plans geprüft. Für die Termin- und Vorwissensprüfung zählen die heute wirksamen Leistungen. Ein als eigener Eintrag gewähltes Atom behält denselben Status wie eine reguläre Einzelwahl mit derselben Form der Erfassung.

## Projektion und Zählung

Die gemeinsame Rangfolge für überlappende Einträge lautet Pflichtziel, notwendiges Vorwissen, freiwilliges Angebot. Die Laufzeit bewahrt die Menge der wirksamen Angebots-IDs. Beim Lesen eines Plans ohne Angebote läuft zuerst die bestehende Regel für Unterrichtsmaterial. Die Ansichtsindizes halten fest, ob der jeweilige Katalog überhaupt Angebote enthält. Ein Fach mit gültiger, leerer Pflichtmenge hat null zu zählende Ziele, auch wenn ein freiwilliges Ziel bereits bestanden wurde.

## Gegenprüfung des Zwischenstands

Die Korrekturrunde prüft den Rollenvergleich im Repository und im Paket, die Erfassung neuer und historischer Pläne sowie die sichtbare Reihenfolge der Ziele. Die reguläre Wurzel mit ausgelassenem Atom und der Rückfallpfad der E.1-Regel wurden zusätzlich auf den unveränderten Produktionsklassen ausgeführt. [Planerfassung auf der Basis](vr2a-legacy-plan-base.json) · [Aktive Ansichten](vr2a-current-view-validation.json) · [Ergebnisse der gezielten Wiederholungen](vr2a-review-focused-history.json)

Für die Punkte 1 bis 12 und 14 sind die geänderten Regeln, die Positivfälle und die tatsächlich gescheiterten Gegenproben einzeln dokumentiert. Punkt 13 betrifft die Fachzuordnung und den Klausurumfang einer ausdrücklichen Wahl und gehört zur anschließenden Lieferung VR2b. [Korrekturen und beobachtete Fehler](korrekturrunde-vr2a.md) · [24 Gegenproben](vr2a-review-negative-controls.json)

Der vollständige Lauf auf `29291bf8c7` machte weitere veraltete Konstruktoraufrufe in den Tests sichtbar. Die fünf betroffenen Testsuiten erzeugen synthetische Projektionen nun über eine gemeinsame typisierte Prüfhilfe. [Ursache und abgebrochener Lauf](vr2a-review-full-fixture-repair.json) · [Gezielter Testlauf](vr2a-projection-fixtures-all.json)

## Vollständiger Backend-Lauf

Auf `92d9182d02` lief `./gradlew --offline --max-workers=4 clean check -PbackendTestForks=3` mit Exitcode 0. JUnit meldete 3321 Fälle in 324 Klassen. 3301 bestanden, 20 waren im Standardlauf deaktiviert. Es gab 0 Fehler und 0 fehlgeschlagene Assertions. [Klassen, Protokoll und SHA-256](vr2a-reviewed-full-verified.json)

Die deaktivierten Fälle verteilen sich auf CompletionPerformanceTest (1), ProvisionedCurriculumPackageConformanceTest (1), LearnerCardStateMigrationTest (1), OAuthClientSecurityPostgresIntegrationTest (8), AssessmentCompletionBackendBrowserIntegrationTest (4), AssessmentCompletionPostgresIntegrationTest (4), AssessmentCompletionRestartIntegrationTest (1). Die ungekürzten Gradle- und JUnit-Protokolle sind außerhalb des Repositories im Laufverzeichnis `runs/vr2a-reviewed-full-verified/` hinterlegt.

## Frühere Prüfläufe und Folgeregeln

Der [Zwischenstand vom 27. November](zwischenstand-a91d9cf4af.md) enthält die ersten zwanzig Negativkontrollen und ihre Rohdatenbindungen. Die seither entfallene Rückverfolgung der Angebots-ID bis zur Quelldatei und die damalige Behandlung einer leeren Planfortsetzung sind dort als früherer Stand dokumentiert. Der erste vollständige Backendlauf deckte drei veraltete Konstruktoraufrufe in den Prüfhilfen für das Pflichtvorwissen auf. [Abbruchbefund](vr2a-full-interrupted.json)

Für VR4 bleiben zwei fachliche Prüfregeln offen. Der Auftakt einer deklarierten Einheit muss im Pflichtweg erreichbar sein. Hat ein Deck ausschließlich Karten, deren Verständnisziele freiwillige Angebote sind, soll auch sein Deckziel freiwillig sein.

## Gesicherter Arbeitsstand VR2b

Am 27. November um 06:16 MEZ hat der Product Owner die Konzeption zur erneuten Entscheidung gestellt. Der Zweig sichert die bisherige Implementierung einschließlich ihrer gezielten Prüfungen. Für VR2b stehen der vollständige Backend-Lauf und die Wiederholung der Releaseprüfungen aus. [Arbeitsstand der Teilprüfungen](vr2b-pruefstand.md) · [Spätere Gegenproben](vr2b-pausenstand-gegenproben.json)

OpenAI und Gemini zeigen bei der hessischen Wurfprüfung den Zusatz „Freiwillig:“ in beiden Stellungen des Einheitspiloten. Der Pilot ist standardmäßig ausgeschaltet. Nach einer Bereitstellung wäre diese Änderung in beiden Beta-Anbietern sichtbar. Das reguläre Nachbarangebot blieb in allen sechs geprüften Ausgaben bytegleich. [Wortlaut vor und nach der Änderung](vr2b-e1-provider-choice.actual.json) · [Zielreihenfolge und reguläre Wahl](vr2b-e1-regular-bytes.actual.json)
