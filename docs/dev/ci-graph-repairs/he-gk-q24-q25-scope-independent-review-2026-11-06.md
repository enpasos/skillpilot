# Unabhängiger Review der HE-Q2.4/Q2.5-Testkorrektur

6. November 2026. KI-Inhalts- und Codereview, keine menschliche Freigabe.
**Kein Hold gegen die begrenzte Testkorrektur.** Der Review bindet
`app/scripts/testHessenMathQ24Q25Scope.ts` mit SHA-256
`45cd0fa4b38110214d4be1766c3b44dc6f8bf82d9282984d21b8ef516fe2e548`
und den [separaten Untersuchungsbeleg](he-gk-q24-q25-scope-regression-repair-2026-11-06.json)
mit SHA-256 `46e6e81b3fc4a99e7368da49a0ab0b7a5d5ece69c50fc03065cd129601f4fc13`.

Gelesen wurden der vollständige geänderte Test, die vollständigen bilingualen
räumlichen Alt- und Ersatzziele samt kanonischen Eltern, die sechs
Alt-/Kind-Leistungszuordnungen sowie die historischen Struktur- und getrennten
Quellen-/Scopeentscheidungen des Untersuchungsbelegs. Die aktuelle Mathematikquelle
und alle Mathematikansichten unterscheiden sich nicht von Main
`0ce5a8d791eeb9783a919195fd8590bfb79f3595`.
Die Quellenpins des Untersuchungsbelegs wurden gegen die vorhandenen Bytes geprüft.
Die HE-Originalquelle mit SHA-256
`d53bd18522ee045c9b3142a9576eb3fef0a212b6a1e712d50fc084856dae5953`
wurde auf den Seiten 41–44 direkt gelesen.

Die historischen sechs Sammelziele werden nicht allein wegen eines heutigen
`type: cluster` aus dem Verlustvergleich herausgefiltert. Die Testkorrektur bindet
jede konkrete Identität, ihre genaue Kindmenge, ihre aktuelle semantische
Einordnung und die erforderlichen HE-Kinder. Ihre tatsächliche Targetprojektion
wird geprüft; gezielte Rollenmutationen müssen die Prüfung scheitern lassen.
Die separat belegten regionalen Einschränkungen bleiben dabei erforderlich:
beispielsweise ist der räumliche Mittelpunkt kein neuer HE-Target, während
Vektorbetrag und Punktabstand ausdrücklich erhalten bleiben. Dies behauptet
keine neue globale Gleichwertigkeit sämtlicher Alt- und Kindprüfungen.

Die drei zusätzlichen HE-GK-Supportrollen sind keine globale LK-Klassifikation.
Der Test sichert die HE-LK-Targets sowie die zwei SL-GK-Spatprodukt-Targets
positiv und durch tatsächliche Projektionsmutationen. Die fünf späteren ganzen
Quellen-/Stufenentscheidungen sind separat an die aktuellen Landesmengen und
HE-CrossStage-/SekII-Rollen gebunden. Ein weiterer fachfremder Verlust am
bestehenden Fixzustandsziel schlägt weiterhin fehl. Der historische
September-22-Vergleich wird damit um konkrete später umgesetzte Entscheidungen
ergänzt; er wird nicht durch einen allgemeinen Ausnahmenmechanismus ersetzt.

Für die vier G9-Platzierungen ist die inhaltliche Erhaltung unterschiedlich
begründet. `235ae698` bleibt durch `525b1da9` einschließlich der begrenzten
Strecke und der Parameterbedeutung enthalten. `f242a3e8` bleibt durch `075f1ef2`
einschließlich Eintragen, Ablesen und geometrischer Deutung enthalten.
`d1352ce0` bleibt durch `54cfe5ce` einschließlich rechnerischer und geometrischer
Kollinearitätsdeutung erhalten; das neue Ziel behandelt zusätzlich den Nullvektor
explizit korrekt.

Für `57f6d5e4` genügt die Parameterform **allein nicht** als Zeichnungsbeleg.
Die kombinierte Bindung ist hier fachlich tragfähig: `075f1ef2` fordert das
wirkliche Eintragen und Ablesen räumlicher Punkte und Richtungen; `525b1da9`
fordert die Gerade beziehungsweise Strecke zwischen zwei Punkten und die
geometrische Bedeutung des Parameterbereichs; `7680701b` fordert ausdrücklich
das Zeichnen geeigneter Schrägbilder räumlicher Objekte und deren fachsprachliche
Erläuterung. Sein tatsächlicher Elternkontext ist „Räumliche Objekte im
dreidimensionalen Koordinatensystem darstellen“. Damit bleiben die zeichnerische
räumliche Darstellung und ihre Erklärung neben der algebraischen Darstellung
als Erwerbsziele erhalten. Das passt zu HE Q2.2 S.41 (räumliche Objekte,
Schrägbilder und Punkte) und Q2.3 S.42 (Geraden und Strecken). Die Prüfung bindet
alle drei notwendigen Komponenten sowie ihre vollständigen bilingualen
Definitionen, statt eine beliebige einzelne Teilfähigkeit genügen zu lassen.
Dies ist eine curriculare Target-Erhaltungsbegründung: keine automatische
Anerkennung des alten Ziels, keine Übertragung gespeicherter Mastery und keine
Behauptung, dass eine bestimmte Prüfung bereits die ganze alte Leistung belegt.
Ein direktes aktuelles `examData.coveredGoalIds`-Vorkommen der drei Ersatzziele
wurde im kanonischen Mathematikgraphen nicht gefunden; es wird hier auch nicht
als Beweis verwendet.

Die vorhandenen terminalen Logs der beiden echten Läufe wurden gelesen und
gegen ihre Beleg-SHAs geprüft: 88 gültige Views, vier HE-GK-Kontexte,
50 Ersatzverlust-, 30 regionale Rollen-, 20 Quellenrollen- und sechs räumliche
Verlustkontrollen sowie die vier zusätzlichen Fixzustands-Verlustkontrollen;
separat 80 Views und 637 Paare der Q2-Assessmentprojektion. Der Reviewer hat diese
Suites nicht erneut ausgeführt. Der Hilfs-Strict-Typecheck bleibt laut getrenntem
Vorher-/Nachherbeleg mit denselben 20 Bestandsfehlern rot; er wird nicht als
bestandene Prüfung dargestellt. Dies ist weder eine frische Remote-CI-Abnahme
noch eine neue M7-, D/P/A/M/V- oder Wirksamkeitsfreigabe. Kanonische Quellen,
Ansichten, historische Reviews und Lernerzustand wurden nicht geändert.
