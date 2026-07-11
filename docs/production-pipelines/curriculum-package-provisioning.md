# Curriculum-Pakete sicher provisionieren

Dieses Runbook beschreibt die lokale Installation und Aktivierung bereits gebauter
`full-standalone-v1`-JSON-Pakete. Der Provisioner ist die einzige schreibende
Komponente des Package-Stores. Die SkillPilot-Runtime liest ausschließlich den
exakt gepinnten aktiven Lock und verändert den Store nicht.

## Sicherheitsmodell

Ein eingehendes ZIP wird nie direkt als Runtime-Quelle verwendet. Der Provisioner

1. kopiert eine unveränderte Eingabedatei mit stabiler Dateiidentität in eine private
   Quarantäne und berechnet dabei äußeren SHA-256 und Bytezahl;
2. ruft den unabhängigen Finished-Package-Validator v2 in einem getrennten Prozess
   auf;
3. extrahiert ausschließlich das exakte, sichere Archivinventar in ein privates
   Staging-Verzeichnis;
4. prüft Manifest, `SHA256SUMS`, jeden Manifestrecord und den vollständigen
   extrahierten Dateibaum erneut;
5. promotet Objekt, Validatorreport und Install-Record atomar unter dem äußeren
   ZIP-Hash;
6. verändert den aktiven Lock erst durch einen getrennten, expliziten CAS-Schritt.

Symlinks, Sonderdateien, unsichere oder kollidierende Pfade, ZIP64, Data Descriptor,
verschachtelte Archive, unerwartete Dateien und Profilüberschreitungen werden
fail-closed abgewiesen. Ein fehlgeschlagener Installations-, Aktivierungs- oder
Rollback-Versuch lässt den zuvor aktiven Lock unverändert.

## Store-Layout

```text
<store>/
  .provisioner.lock
  quarantine/
  staging/
  objects/sha256/<outerZipSha256>/<archiveRoot>/
  validation-reports/<outerZipSha256>.json
  install-records/<outerZipSha256>.json
  locks/active.json
  locks/history/<lockSha256>.json
```

`objects/`, Validatorreports und Install-Records sind nach erfolgreicher Promotion
unveränderlich. Jeder aktive Lock verweist auf die exakten Hashes dieser drei
Evidenzebenen sowie auf Manifest, Closure, Definition-Index und fachlichen
`contentDigest`. Es gibt weder Verzeichnisscan als Discoverymechanismus noch eine
ungepinnte `latest`-Auswahl.

## Bedienfolge

Die verbindliche CLI-Hilfe ist jederzeit verfügbar:

```bash
python3 -B scripts/provision_curriculum_package.py --help
```

Die normale Reihenfolge ist:

1. `install`: ZIP in Quarantäne kopieren, unabhängig validieren, sicher extrahieren
   und content-adressiert installieren;
2. `verify`: ein installiertes Objekt einschließlich aller Kontroll- und Payloadbytes
   erneut prüfen;
3. `activate`: eine vollständig angegebene Paketmenge bei passender
   `--expected-active-sha256` atomar aktivieren;
4. `status`: aktiven Lock und installierte Identitäten strukturiert ausgeben;
5. `rollback`: einen früheren, hashadressierten Lock ebenfalls per CAS reaktivieren.

Für die erste Aktivierung wird der erwartete Vorgänger ausdrücklich als `none`
angegeben. Jede weitere Aktivierung und jedes Rollback benötigt den SHA-256 des
aktuell beobachteten Locks. Damit kann ein paralleler oder überholter Operator keine
neuere Auswahl überschreiben. Die Lock-Einträge werden kanonisch nach `packageId`
sortiert; doppelte Paket-IDs, inkompatible Consumerbereiche und widersprüchliche
Definitionen verhindern die Aktivierung.

Die konkrete Syntax und alle Pflichtparameter stehen in den Unterkommando-Hilfen,
zum Beispiel:

```bash
python3 -B scripts/provision_curriculum_package.py activate --help
python3 -B scripts/provision_curriculum_package.py rollback --help
```

## Runtime-Konfiguration

Erst nach Installation und Aktivierung wird der Backend-Consumer auf den Store
geschaltet:

```yaml
skillpilot:
  curriculum:
    source: package
    consumer-version: 0.1.0
    packages:
      store-directory: /srv/skillpilot/curriculum-packages
      active-lock: locks/active.json
```

Der Runtime-Prozess benötigt nur Leserechte. In Produktion sollen Provisioner und
Runtime unter getrennten OS-Identitäten laufen; Schreibrechte auf Store und Lock
gehören ausschließlich zur Provisioning-/Deployment-Autorität. Paketmodus fällt bei
fehlender oder beschädigter Evidenz nicht auf Repository, Classpath oder Netzwerk
zurück.

## Qualitätssicherung

Der begrenzte adversariale Selbsttest läuft mit:

```bash
python3 -B scripts/provision_curriculum_package.py self-test
```

Zusätzlich validiert die Repository-CI die drei externen Betriebsverträge für
Validatorreport, Install-Record und aktiven Lock. Diese Schemas sind bewusst keine
paketlokalen fachlichen Payloadschemas und verändern daher weder das geschlossene
`full-standalone-v1`-Inventar noch dessen Digest.

## Bewusste Grenzen

- Eine technisch gültige Installation ist keine Publikationsfreigabe. Offene
  fachliche, Quellen- und Rechte-Reviews bleiben verbindlich.
- Der v2-Validatorreport und die lokale content-adressierte Evidenz schützen die
  Installation vor Drift und Replay innerhalb dieses Betriebsmodells. Die
  kryptographische Publisher-Identität und die signierte JSON-/OWL-Releasegruppe
  folgen mit DPK-011.
- `embedded-fragment` bleibt bis zur vollständigen fachübergreifenden Closure- und
  Consumer-Lane fail-closed.
- Der checkout-unabhängige Betrieb ist seit DPK-007 durch denselben Loader- und
  Storepfad nachgewiesen: eine package-only SkillPilot-Assembly besteht 15
  Funktionsprüfungen einschließlich realem React-/Chromium-Fluss und
  Catalog-404-Fail-closed-Fall. Sie läuft mit `--clearenv`, fester
  Environment-Allowlist und nur Loopback in einem checkout-verdeckten Namespace;
  der Datei-/Netzwerk-Trace des vollständigen Prozessbaums beobachtet keine
  fachliche Repository-Poison-Lane. Die evaluator-gesteuerte frische Attestation
  und ihre Assembly-/Evidence-Bindung sind unter
  [Curriculum Package Readiness](../qa-ci/curriculum-package-readiness.md) beschrieben.
