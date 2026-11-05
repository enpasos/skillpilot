# Lokale Aufnahme- und Performanceprüfungen für Mathematik

Die dauerhaften Werkzeuge unter `app/scripts/learningUnits/` prüfen die echten
Java-Komponenten mit gespeicherten Eingaben. Sie benötigen weder eine Kopie der
Lernzielbilder noch ein zweites Backend-Ressourcenverzeichnis. Die Gradle-Tasks
verwenden vorhandene Klassendateien und den Test-Runtime-Classpath.

## Tatsächlich erzeugtes Runtime-1.2-Modell

```bash
cd app
npx tsx scripts/learningUnitsProofs.ts admission \
  --model ../tmp/math-learning-units/release-model-current --publish-report
```

Der Modellpfad ist frei wählbar. Das Werkzeug liest die erzeugte kanonische
Landschaft, die tatsächlichen Views und die unveränderten Vertragswrapper. Es
übergibt diese Bytes an `LearningUnitPackageCatalog.load`, prüft die kalte
Aufnahme ohne Quarantäne und die enge Anerkennung des bestehenden
Projektionsvertrags: leeres M erkennt nichts an; bestandene Q erkennt genau A
an. Die vom Produzenten ergänzten semantischen Zieltypen bleiben erhalten.
Ein erfolgreicher Aufruf installiert oder bedient noch keine ZIP-Datei.

Der kleine [Aufnahmebericht](learning-units-mathematics-produced-model-admission.json)
bindet Inhaltsdigest, Eingabemanifest, JDK, ausgeführte Klassendateien und
Harnessquelle. Die vollständigen einzelnen Eingabedigests bleiben im lokalen
Rohbericht. Der separat geprüfte ZIP-/Provisionierungs-/HTTP-Pfad behält seinen
eigenen Nachweis.

Der gespeicherte Aufnahmebericht bezieht sich ausdrücklich auf den eingefrorenen
S2-Paketstand mit einer Einheit und dem dort genannten Inhaltsdigest. Die spätere
Prismenerweiterung hat einen neuen Datenstand und benötigt einen eigenen
Aufnahmenachweis; der frühere Bericht wird nicht als Prüfung neuer Bytes ausgegeben.

## Volltransitive Nachfrage und lokale Laufzeit

```bash
cd app
npx tsx scripts/learningUnitsProofs.ts performance \
  --native-inventory ../tmp/math-learning-units/native-backend.raw.json \
  --canonical ../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json \
  --publish-report
```

Der [Performancebericht](learning-units-mathematics-local-performance.json)
enthält 16 Paritätsfälle: je vier Zustände für die beiden tatsächlich erfassten
hessischen Angebote, die Vereinigung aller kanonischen Atome und einen
synthetischen Graphen mit 5.000 Knoten und 20.000 Kanten. Die Vereinigung ist
kein behauptetes natives `ALL`-Angebot. Geprüft werden leeres, fast vollständiges
und vollständiges M sowie ein kleinerer Fokusscope.

Eine unabhängige BFS-Referenz traversiert die vollständige Nachfrage je
Endpunkt. Sie stoppt weder an gemeisterten noch an außerhalb liegenden
Zwischenzielen. Alle Ergebniswerte müssen mit dem gemeinsamen topologischen
Durchlauf übereinstimmen. Unterschiedliche lokale Timingwerte ändern diese
semantische Paritätsanforderung nicht.

Die Zeiten sind lokale JVM-Aufrufe in Mikrosekunden, mit beobachtetem p50 und
p95. Statische Samples bauen jeweils einen neuen Graphen; die ersten Aufrufe
werden gesondert aufgezeichnet. Der Bericht nennt JDK, Eingabe- und
Klassen-Digests sowie die Aufwärm- und Wiederholungszahlen. Daraus folgt keine
HTTP-, Datenbank-, Browser-, Host- oder CI-Laufzeitzusage und kein allgemeiner
Akzeptanzgrenzwert.

Beide Tasks lassen sich direkt aus `backend/` über
`--init-script ../app/scripts/learningUnits/proofs.init.gradle` aufrufen.
`-PlearningUnitModelRoot=...`, `-PlearningUnitNativeInventory=...`,
`-PlearningUnitCanonicalSource=...`, `-PlearningUnitAdmissionOutput=...` und
`-PlearningUnitBenchmarkOutput=...` wählen die Pfade. Der TypeScript-Aufruf
bietet dieselben Eingaben und erzeugt auf Wunsch die kleinen öffentlichen
Berichte. Ohne `--publish-report` schreibt er ausschließlich den Rohbericht.
