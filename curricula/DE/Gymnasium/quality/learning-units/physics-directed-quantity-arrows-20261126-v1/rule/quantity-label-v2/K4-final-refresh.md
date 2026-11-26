# K4 erst nach tatsächlicher Freigabe binden

K4 ist in dieser Bildedition nicht aktiviert. Nach der ausdrücklichen
Freigabemeldung wird ausschließlich die tatsächlich angenommene Endfassung
übernommen, gegebenenfalls V3. V1/V2, ihre Markierungen und alle
Intermediate-Registerentscheidungen bleiben unverändert.

Ein endgültiger K4-Text, eine geänderte Rubrik oder die bei der Aktivierung
ergänzten `examData`-Reviewfelder ändern den Fingerprint. Deshalb müssen
beide folgenden Werte am **endgültigen kanonischen Objekt** ermittelt werden,
nachdem dessen erlaubte Aktivierungsmetadaten geschrieben sind. Ein Hash
des früheren `candidate.goal.json` ist dafür kein Ersatz.

```bash
cd app
./node_modules/.bin/tsx -e '
import { readFileSync } from "node:fs";
import { fingerprintSemanticKindSourceGoal } from "./scripts/goalBookModel";
import { fingerprintDirectedQuantityArrowContract } from "./scripts/lib/directedQuantityArrows";
const landscape = JSON.parse(readFileSync("../curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json", "utf8"));
const goal = landscape.goals.find((item: { id: string }) => item.id === "2569d84a-5bf1-542b-bc43-6ade1df971c4");
if (!goal) throw new Error("K4 is not activated; no positive decision may be produced");
console.log(JSON.stringify({ goalId: goal.id, nativeSourceFingerprint: fingerprintSemanticKindSourceGoal(goal), arrowContractFingerprint: fingerprintDirectedQuantityArrowContract(goal) }, null, 2));
'
```

Die neue Einzelentscheidung ist `practiceAssessment`, `authoritative`, mit
`decisionBasis=reviewed-current-pilot-practice-assessment` und
`directedQuantityArrows.usage=required`. Sie muss die tatsächliche Freigabe,
die beiden unabhängigen Markierungen, Aufgabe/Rubrik und endgültigen
Contract-Fingerprint binden. Ihre Kante zum Pfeilziel ist am aktuellen
Objekt zu prüfen. Eine bloße vorhandene Kandidatendatei ist keine Freigabe.

Die finale semantische Edition braucht einen **neuen** Pfad, beispielsweise
`rule/final-k4-v3/`. Weder `rule/new-semantic-decisions.actual.json` noch
`rule/semantic-decisions.actual.json` darf dabei umgeschrieben werden.
Der bisherige Standardmaterialisierer ist ein historischer A-ohne-K4-Rezeptstand;
seine Ausgabe darf nicht als K4-Nachfolger über die alten Pfade geschrieben
werden. Der finale Materialisierer muss außerdem die separat genehmigten,
aktuellen Wortlaute von `4ca83b3f` und `d61ea362` einzeln binden. Ihre Marker
bleiben `required`; daraus folgt keine zusätzliche Voraussetzungskante.
Ein Unterschied zu einem normalisierten QA-Anzeigetext begründet hingegen
kein Katalogdelta: maßgeblich ist der Vergleich der vollständigen aktuellen
Zielobjekte mit der tatsächlichen Ausgangsfassung.

Erst danach werden aktive Register und betroffene Zähl-/Buchbindungen
erneuert und neue native Prüfbelege angelegt. Erwartet sind 873 semantische
Einzelentscheidungen und 26 `required` (24 L + Pfeilziel + freigegebenes K4),
wenn der restliche Katalog unverändert bleibt. Die 132 Cluster werden weiter
an ihren Kindern beurteilt. K4 gehört wegen `examData` und Assessment-Tags
nicht in den normalen Zielbild-QA-Scope; seine tatsächlichen SVG-Stimuli
unterliegen der eigenen Material- und Aufgabenprüfung. Die Zielbild-QA bleibt
damit bei 526 Bildern, darunter dieselben 88 offenen A3-Größenpfeilbilder.

Nach der Aktivierung ist der bestehende Routen-Audit neu auszuführen. Seine
Pflichtbereiche und die A5-Pfade müssen bestehen; bekannte offene andere
Scopes dürfen dabei nicht als neuer Gesamt-Pass dargestellt werden.
