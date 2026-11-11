## Secure Curriculum Package Provisioning {#sec:pp-package-provisioning}

This runbook documents local installation, verification, CAS activation, and rollback for finished `full-standalone-v1` JSON packages. The provisioner (`scripts/provision_curriculum_package.py`) is the sole writer to the package store; the SkillPilot runtime reads only the exact pinned active lock and never mutates the store.

### Six-Step Security Model and Store Layout {#sec:pp-prov-security}

An incoming ZIP is never consumed directly as a runtime source:

1. Copy the unmodified input file with stable file identity into private quarantine while computing its outer SHA-256 and byte length.
2. Invoke the independent finished-package validator v2 in a separate process.
3. Stream-extract only the exact verified archive inventory into a private staging directory.
4. Re-verify manifest, `SHA256SUMS`, every manifest record, and the complete extracted file tree.
5. Atomically promote object directory, validator report, and install record under `<outerZipSha256>`.
6. Switch the active lock only through a separate, explicit compare-and-swap (CAS) step.

Symlinks, special files, path collisions, ZIP64, data descriptors, nested archives, unexpected files, and profile violations fail closed while leaving the previously active lock untouched.

```text
<store>/
  .provisioner.lock
  quarantine/ & staging/
  objects/sha256/<outerZipSha256>/<archiveRoot>/
  validation-reports/<outerZipSha256>.json
  install-records/<outerZipSha256>.json
  locks/active.json & locks/history/<lockSha256>.json
```

Promoted `objects/`, validation reports, and install records are immutable; directory-scan discovery and unpinned `latest` selection do not exist.

### Operational Sequence, Runtime Configuration, and Self-Test {#sec:pp-prov-operations}

```bash
python3 -B scripts/provision_curriculum_package.py --help
python3 -B scripts/provision_curriculum_package.py activate --help
python3 -B scripts/provision_curriculum_package.py rollback --help
python3 -B scripts/provision_curriculum_package.py self-test
```

Standard sequence: (1) `install`, (2) `verify`, (3) `activate` passing `--expected-active-sha256` (`none` for initial activation, otherwise the exact SHA-256 of the observed lock; entries sort canonically by `packageId`, rejecting duplicate IDs, incompatible consumer ranges, or conflicting definitions), (4) `status`, and (5) CAS `rollback` to a historical lock when needed.

Only after activation is the backend configured under a separate read-only OS identity (never falling back to repository, classpath, or network sources):

```yaml
skillpilot:
  curriculum:
    source: package
    consumer-version: 0.1.0
    packages:
      store-directory: /srv/skillpilot/curriculum-packages
      active-lock: locks/active.json
```

### Deliberate Boundaries {#sec:pp-prov-boundaries}

- Technical installation validity never grants publication, source, or redistribution approval; cryptographic publisher signatures arrive in `DPK-011`.
- `embedded-fragment` remains fail-closed until cross-subject closure and consumer lanes complete.
- Checkout-free operation (15 functional checks under `--clearenv`, loopback-only networking, and Catalog-404 fail-closed probe) has been proven since `DPK-007` through this exact store path ([Curriculum Package Readiness](repo:docs/qa-ci/curriculum-package-readiness.md)).
