## Import/Export Workflow {#sec:import-export-workflow}

This chapter specifies the portability workflows for moving pseudonymous learner state between SkillPilot accounts or instances and for encrypting browser-local teacher class files at rest.

### Learner-state export, signature verification, and import {#sec:import-export-learner}

Learner import/export provides **tamper-evident portability**:

- **Included:** selected curriculum, enabled modules/personalization, mastery state, planned goals, provenance (`copySources`), and client-side SRS state.
- **Excluded & guaranteed:** zero personal identifiers; exporting never mutates the source profile, and importing preserves the target profile's own `skillpilotId`.

1. **Export:** The backend composes an **HMAC-SHA256-signed** `serverExport` payload (computed over parsed values so JSON whitespace/key-order formatting remains safe while any value edit invalidates the signature), and the frontend wraps it with browser `clientData.srsState` inside a versioned `"2.0"` JSON envelope.
2. **Import:** The backend verifies the HMAC-SHA256 signature, applies curriculum settings, updates mastered/not-mastered outcomes on imported goals (leaving untouched goals intact; legacy numeric values remain storage compatibility rather than partial mastery, see @ref{sec:workflow-step5}), replaces planned goals, appends the source `skillpilotId` and timestamp to `copySources` provenance, and lets the browser re-key `srsState` to the target ID. Under the 4 November 2026 recognition contract, effective mastery is reconstructed from explicit outcomes and their fixed authored contracts without revoking valid recognition or enlarging old results via newer graph edges.

```json
{
  "version": "2.0",
  "exportedAt": "2024-05-20T10:00:00.000Z",
  "serverExport": {
    "data": { "learner": {}, "mastery": {}, "plannedGoals": [], "copySources": [] },
    "signature": "<hmac-sha256>"
  },
  "clientData": {
    "srsState": { "srs_state_USERID_GOALID": {} }
  }
}
```

### Teacher-held local class files {#sec:import-export-teacher-files}

Local trainer classes use a **separate browser-encrypted portability lane** because they map student names/aliases to permanent SkillPilot IDs; they are never learner-state exports and are never signed or seen by the backend:

1. The teacher enters and confirms a passphrase of at least **15 characters** (with consistent Unicode normalization prior to key derivation).
2. One validated local `ClassSession` is serialized inside a versioned `skillpilot-trainer-class` payload.
3. **PBKDF2-SHA-256** (`600,000` iterations, fresh 16-byte salt) derives an **AES-256-GCM** key (fresh 12-byte IV, 128-bit authentication tag, fixed class-file AAD).
4. Only the encrypted envelope downloads as `skillpilot-class-YYYY-MM-DD.skillpilot` (deliberately omitting the class name from the filename).

Algorithm, iteration count, version, purpose, Base64 fields, ciphertext, and decrypted payload are strictly validated before entering browser storage: recognized encrypted envelopes never fall back to plaintext parsing, and wrong passphrases vs. tampered ciphertexts emit the identical non-technical error message. Legacy plaintext `skillpilot-class-*.json` files remain importable with an explicit prompt to re-export in encrypted form. Because decrypted existing-learner class files restore permanent SkillPilot IDs with full learner access (see [Existing-Learner Teacher View](repo:docs/concept/runtime-workflows/existing-learner-teacher-view.md)), exported class files must be handled as bearer-secret containers; file encryption protects downloads at rest without encrypting unlocked browser local storage.
