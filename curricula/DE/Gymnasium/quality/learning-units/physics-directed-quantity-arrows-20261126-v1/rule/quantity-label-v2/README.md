# Nachfolger für die benannte Geschwindigkeitslegende

Das neue b77-Bild nennt in der Legende ausdrücklich **Geschwindigkeit** und
**Pfeilmaßstab**. Original und 360-px-Fassung wurden tatsächlich geöffnet;
die Beobachtung steht in `current-image-inspection.actual.json`.
Das vorherige positive Kriterienurteil war hinsichtlich des fehlenden
Größennamens zu positiv. Es bleibt byteidentisch als korrigierte Historie
erhalten. Die neue positive Entscheidung gilt ausschließlich für
`ea528e24f6a45adab8d80097e83d17874424dcde725453af5375a13cf5c661f5`.

`image-decisions.actual.json` ist eine neue Belegedition. Sie bindet den
unveränderten Vorgänger und die tatsächliche Nachfolgerprüfung. Die aktive
`physik.qa.json` verweist auf diese neue Edition. Die Vor-/Nach-Snapshots
sind ausdrücklich Abbilder des aktiven Bildregisters und des aktiven
semantischen Ledgers, keine neuen pauschalen fachlichen Freigaben.

Alle 88 A3-Größenpfeilbilder bleiben `undecided`, ebenso die gesonderten
6 ausgelagerten Konstruktionen und 7 mehrdeutigen Fälle. Die anderen
525 kriterienspezifischen Einzelurteile werden nicht umgedeutet. Allgemeine
AI-Freigabe und neues Pfeilkriterium sind weiterhin getrennt; Human-Felder
werden nicht freigegeben.

Die Bildänderung allein ändert keinen semantischen Contract-Fingerprint.
Die zugleich separat autorisierten neuen Beschreibungen von `4ca83b3f` und
`d61ea362` benötigen später ihre eigenen aktuellen semantischen Bindungen.
Dieser Bildnachfolger aktiviert weder diese Bindungen noch K4.

Reproduktion im Repository:

```bash
cd app
./node_modules/.bin/tsx scripts/generateGoalVisualizationQaLedgers.ts --subject=physik --check
./node_modules/.bin/tsx scripts/materializePhysicsDirectedQuantityArrowQa.ts --configuration=curricula/DE/Gymnasium/quality/learning-units/physics-directed-quantity-arrows-20261126-v1/rule/quantity-label-v2/projection-inputs.actual.json --check
./node_modules/.bin/tsx scripts/checkGoalVisualizationQaApprovalCoverage.ts physik
```

Der Materialisierer überschreibt keine abweichende bereits vorhandene
Belegdatei. Weitere Bildkorrekturen benötigen einen neuen Konfigurations-,
Prüf- und Belegpfad. Die frühere Standardausführung gehört zum historischen
Bildstand; sie darf nicht gegen aktuelle Nachfolgerbilder als neue Freigabe
wiederholt werden.
