## Curriculum-Pakete sicher provisionieren {#sec:pp-package-provisioning}

Dieses Runbook beschreibt die lokale Installation, Verifikation, CAS-Aktivierung und das Rollback fertig gebauter `full-standalone-v1`-JSON-Pakete. Der Provisioner (`scripts/provision_curriculum_package.py`) ist die einzige schreibende Komponente des Package-Stores; die SkillPilot-Runtime liest ausschließlich den exakt gepinnten aktiven Lock und verändert den Store niemals.

### Sechsstufiges Sicherheitsmodell und Store-Layout {#sec:pp-prov-security}

Ein eingehendes ZIP wird nie direkt als Laufzeitquelle konsumiert:

1. Unveränderte Eingabedatei mit stabiler Dateiidentität in eine private Quarantäne kopieren und äußeren SHA-256 sowie Bytezahl berechnen.
2. Unabhängigen Finished-Package-Validator v2 in einem getrennten Prozess aufrufen.
3. Ausschließlich das exakte, sichere Archivinventar in ein privates Staging-Verzeichnis extrahieren.
4. Manifest, `SHA256SUMS`, jeden Manifestrecord und den gesamten extrahierten Dateibaum erneut verifizieren.
5. Objekt, Validatorreport und Install-Record atomar unter `<outerZipSha256>` promoten.
6. Den aktiven Lock erst durch einen getrennten, expliziten Compare-and-Swap-(CAS-)Schritt umschalten.

Symlinks, Sonderdateien, Pfadkollisionen, ZIP64, Data Descriptors, verschachtelte Archive, unerwartete Dateien und Profilüberschreitungen scheitern fail-closed und lassen den bisherigen aktiven Lock unberührt.

```text
<store>/
  .provisioner.lock
  quarantine/ & staging/
  objects/sha256/<outerZipSha256>/<archiveRoot>/
  validation-reports/<outerZipSha256>.json
  install-records/<outerZipSha256>.json
  locks/active.json & locks/history/<lockSha256>.json
```

`objects/`, Validatorreports und Install-Records sind nach der Promotion unveränderlich; es gibt weder Verzeichnis-Discovery noch eine ungepinnte `latest`-Auswahl.

### Bedienfolge, Runtime-Konfiguration und Selbsttest {#sec:pp-prov-operations}

```bash
python3 -B scripts/provision_curriculum_package.py --help
python3 -B scripts/provision_curriculum_package.py activate --help
python3 -B scripts/provision_curriculum_package.py rollback --help
python3 -B scripts/provision_curriculum_package.py self-test
```

Normale Bedienfolge: (1) `install`, (2) `verify`, (3) `activate` mit `--expected-active-sha256` (`none` bei Erstaktivierung, sonst exakter SHA-256 des beobachteten Locks; kanonische Sortierung nach `packageId`, Abweisung doppelter IDs, inkompatibler Consumer-Bereiche oder widersprüchlicher Definitionen), (4) `status` und bei Bedarf (5) `rollback` per CAS auf einen historischen Lock.

Erst danach wird das Backend unter getrennter schreibgeschützter OS-Identität auf den Store konfiguriert (ohne Fallback auf Repository, Classpath oder Netzwerk):

```yaml
skillpilot:
  curriculum:
    source: package
    consumer-version: 0.1.0
    packages:
      store-directory: /srv/skillpilot/curriculum-packages
      active-lock: locks/active.json
```

### Bewusste Grenzen {#sec:pp-prov-boundaries}

- Eine technisch gültige Installation ersetzt keine Publikations-, Quellen- oder Rechtefreigabe; kryptographische Publisher-Signaturen folgen mit `DPK-011`.
- `embedded-fragment` bleibt bis zur vollständigen fachübergreifenden Closure- und Consumer-Lane fail-closed.
- Der checkout-freie Betrieb (15 Funktionsprüfungen unter `--clearenv`, Loopback-Netzwerk und Catalog-404-Fail-Closed-Test) ist seit `DPK-007` über denselben Store-Pfad bewiesen ([Curriculum-Paketbereitschaft](repo:docs/qa-ci/curriculum-package-readiness.md)).
