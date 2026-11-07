# Nächster Integrationsschritt: tatsächliche Preparer-Dateisicht

Dies ist ein statischer Integrationsvorschlag. Keine Pfadregel, kein weiterer Toolsymlink und kein großes Paar wurden hinzugefügt. Der [gebundene Vergleich](https://github.com/enpasos/skillpilot/blob/feat/skill-graph-ci-contracts/qa-artifacts/ci-contract-audit/2026-11-07/node-vm-runtime-observation/scope-mount-cwd-comparison.json) enthält tatsächliche Smoke-Argumente/-CWD/-Traces und die unveränderten Preparer-Quellpins.

## Was sich tatsächlich unterscheidet

| Bestandteil | Kleine tatsächliche Smoke-Probe | Vorhandener Preparer, aus seinem Code abgeleitet |
| --- | --- | --- |
| CWD | Rollenwurzel | `<Rollenwurzel>/app` |
| tsx-Verteilung | Separate physische Capturewurzel, dort explizit RO gemountet | Privater Dependency-Capture auf `<Rollenwurzel>/app/node_modules` RO eingeblendet |
| Quellen | Winzige kontrollierte Fixtureinputs | Gepinnte Originaltexte beziehungsweise geprüfte Source-A-Projektionen |
| Assets | Keine eigentlichen Landschaftsassets | Verifizierte private Forest-/Binärmounts |
| Ausgaben/Temp | Kontrollierte Pipes und privates `/tmp` | Deklarierte abgetrennte Outputdateien und `run`-Verzeichnisse |
| Umgebung | Exakt geleert und wenige feste Variablen | HOME/TMPDIR/npm-cache explizit gesetzt; der aktuelle generierte Wrapper hat kein `clearenv` |
| Recorder/PIDs | Geschützter externer Recorder, eigener PID-Namespace | Der vorhandene Wrapper besitzt noch keinen solchen Recorderadapter und kein `--unshare-pid` |

Der Preparer nutzt **keine virtuelle `/repo/app`-Abbildung**. Sein generierter Launcher setzt CWD auf den tatsächlichen privaten Rollenpfad plus `/app` und blendet dort die Dependencies ein. `/repo` in einem vorhandenen Parsertest ist kein Produktions-Mountvertrag. Ein vollständiger großer Produzentenlauf wurde für diesen Vergleich nicht ausgeführt.

Der konkrete äußere Lookup ist nicht als bloßer CWD-Artefakt belegt. Unmittelbar zuvor sucht derselbe CLI-PID tatsächlich nach `fsevents/package.json`, `fsevents`, `fsevents.js/.json/.node` im Capture. Die gebundene tsx-CLI enthält einen abgefangenen optionalen `require('fsevents')`; ihr Require-Helfer wird mit `createRequire(import.meta.url)` erzeugt. Die Verteilungslage beeinflusst deshalb die Suchvorfahren. `fsevents` ist im tatsächlichen Lock optional und Darwin-beschränkt; im aktuellen vollständigen installierten `app/node_modules` fehlt es ebenfalls. Das spricht gegen die Annahme, allein der andere CWD oder der vollständige Linux-Dependencybaum beseitige diese Suche. Es ersetzt keinen layoutgleichen nativen Vergleich und keinen gemessenen JavaScript-Stack.

## Kleinster brauchbarer Adapter

Ein getrenntes `run_prepared_readonly` sollte zuerst eine echte verifizierte **Mountsicht** des bestehenden Receipts übernehmen. Das ist eine Dateisystemabbildung, keine neue Goal-/Personalisierungs-Scopeengine:

1. Extern gepinntes Preparationreceipt, tatsächliche Source-A-Original-/Kandidatenbytes und vorhandene Captureprüfung ausführen. `verify_prepared_inputs` vor/nach dem Befehl unverändert weiterverwenden. Ein Receiptfeld oder Report-`verified` genügt nicht.
2. Aus genau den vorhandenen Receiptfeldern Rollenwurzel, CWD, Dependency-, Forest-, Binär- und gegebenenfalls abgetrennte Outputmounts binden. Den vorhandenen privaten Dependency-Capture erneut authentisieren und wiederverwenden; keine zweite große Kopie erzeugen.
3. Die namespace-sichtbaren Pfade der tatsächlichen RO-Mountziele auf ihre geprüften physischen Quellen abbilden. Das betrifft erfolgreiche Reads ebenso wie negative Tool-Lookups. Bloß den aktuellen physischen Capturepfad in einer Pfadliste zu ersetzen wäre falsch: Nach dem Lauf zeigt der Hostpfad unter `app/node_modules` gegebenenfalls nur auf den leeren Mountstub. Typen, Linkketten, FD-Annotationen, Bytequellen und Directorydiscovery müssen aus derselben tatsächlichen Mountsicht stammen.
4. Externen Recorder und PID-Isolation beibehalten; Recorder/Provenienz außerhalb sämtlicher RW-Run-/Outputmounts halten. Umgebung und Root-/Child-Executablebindungen ausdrücklich prüfen. Das jetzige VM-Profil deckt die gemessene direkte Node-Startform ab; ein `npm`-/Shell-Start ist damit nicht automatisch qualifiziert.

Die Abbildung darf fehlende Curriculum-/QA-/Codeinputs nicht in legitime Toolabsenzen umdeuten. Überlappende oder unbekannte Mounts, falsche tatsächliche Quellen und überdeckte Inputs müssen scheitern. Auch übergeordnete Node-Suchverzeichnisse außerhalb der geprüften Toolwurzel bleiben zunächst geschlossen.

## Der nächste kleine tatsächliche Vergleich

Vor einer großen Materialisierung genügt eine winzige echte Materializer-Fixture mit den **gleichen Layoutregeln**: Original/Kandidat mit `app/scripts`, authentisierten kleinen Quelldateien und demselben privaten Toolbaum, der am tatsächlichen `app/node_modules`-Mountziel sichtbar wird. Dort dieselbe normale kleine TS-Discovery mit CWD `app` ausführen und vollständige positive/negative Reads mit dem vorhandenen Smoke-Beleg vergleichen. Dafür sind keine aktiven Quell-/QA-Änderungen oder neuen Symlinks nötig.

Dieser Schritt prüft erstmals den realen Preparer→Recorder-Pfad und die Bytebindung hinter den Overlays. Er verspricht nicht, dass `/dev/shm/node_modules`, andere Suchvorfahren oder weitere Laufzeitzugriffe verschwinden. Ein verbleibender äußerer Lookup braucht einen allgemeinen belegten Namespace-/Toolprovenienzvertrag und darf nicht durch eine historische Pfadübernahme oder `/dev/shm`-Prefixfreigabe grün werden.

Die geschützten Capture19-/Preparer-Dateien bleiben für diese Planung unverändert. Erst ein eigener reviewter Adapter mit kleinen echten Positiv-/Negativfällen wäre implementierbar; Produktions-Source-A, volle Deep-/CQR-Produzenten und AQA02/03 bleiben danach eigene Nachweise.
