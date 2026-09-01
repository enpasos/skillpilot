# Import/Export Workflow

This document describes the runtime workflow for moving learner state between SkillPilot instances or accounts. It focuses on what is transferred, how it is applied, and which safeguards exist.

## Scope and goals

Import/export is designed for **data portability** without breaking integrity:
- **Included**: curriculum selection, enabled modules, mastery values, planned goals, provenance (copy sources), and client-side SRS state.
- **Excluded**: personal identifiers; the target account keeps its own SkillPilot-ID.
- **Guarantee**: the source profile is never modified by export.

## Export workflow

1. **Collect server state**: the backend composes the signed learner export payload.
2. **Collect client state**: the frontend gathers local SRS progress from browser storage.
3. **Wrap and save**: the client bundles server and client data into a versioned export file.

## Import workflow

1. **Verify signature**: the backend validates the signed server payload.
2. **Apply server state**: the target profile adopts the imported learning state (see rules below).
3. **Restore client state**: the client re-keys SRS entries to the current user and writes them back to local storage.
4. **Append provenance**: the target profile records the import source and timestamp.

## State application rules

When importing into a target profile:
- **Identity preservation**: the target keeps its own `skillpilotId`; the imported ID is ignored.
- **Curriculum settings**: selected curriculum and enabled modules are overwritten by the import.
- **Mastery**: imported mastery values update existing ones; untouched topics remain as-is.
- **Planned goals**: the planned goal list is replaced by the imported list.

## Provenance (chain of custody)

Every import appends the source SkillPilot-ID and timestamp to a **copySources** history. This makes origin transparent and prevents denial of authorship while keeping data portable.

## Integrity and signatures

The server export payload is protected by an **HMAC-SHA256 signature**:
- **Changing values** (e.g., a mastery score) invalidates the signature.
- **Reformatting JSON** (whitespace, key order) is safe because the signature is computed on parsed values.

## Versioned wrapper (client data)

The export file is versioned so client-only data can ride along:

```json
{
  "version": "2.0",
  "exportedAt": "2024-05-20T10:00:00.000Z",
  "serverExport": {
    "data": { "learner": { ... }, "mastery": { ... }, "plannedGoals": [ ... ], "copySources": [ ... ] },
    "signature": "..."
  },
  "clientData": {
    "srsState": {
      "srs_state_USERID_GOALID": { ... }
    }
  }
}
```

This wrapper keeps the backend contract stable while allowing the frontend to preserve local learning progress.

## Teacher-held local class files

Local trainer classes are a separate portability lane because they contain the
re-identification mapping between student names and permanent SkillPilot IDs.
They are not learner-state exports and are never signed by the backend.

New class exports are encrypted entirely in the browser before download:

1. the teacher enters and confirms a unique passphrase of at least fifteen
   characters; Unicode input is normalized consistently before key derivation;
2. SkillPilot serializes one validated local `ClassSession` inside a versioned
   `skillpilot-trainer-class` payload;
3. PBKDF2-SHA-256 with 600,000 iterations and a fresh 16-byte salt derives an
   AES-256-GCM key;
4. AES-GCM uses a fresh 12-byte IV, a 128-bit authentication tag and fixed
   class-file additional authenticated data; and
5. only the versioned password envelope is downloaded as a generic
   `skillpilot-class-YYYY-MM-DD.skillpilot` file. The class name is deliberately
   absent from the filename.

The envelope has strict, bounded metadata. Algorithm, iteration, version,
purpose, Base64 encoding, salt, IV, ciphertext and decrypted payload are
validated before a class can enter browser storage. A recognized encrypted
envelope never falls back to plaintext parsing. Wrong passwords and changes to
authenticated encrypted data intentionally produce the same non-technical
message. Structurally invalid or unsupported envelopes use the generic invalid
file message without exposing parser or cryptographic internals.

Import still accepts old plaintext `skillpilot-class-*.json` files so existing
teachers are not locked out. These files pass the same strict class-session
validation, and the UI explicitly advises exporting them again in the
protected format.

An existing-learner teacher-view class is part of this local file lane. Its
encrypted payload may contain the local class name, learner name or alias,
permanent SkillPilot ID, and cached Level-2 personalization. The file must
therefore be treated as a bearer-secret container: decrypting it restores an
ID with the same full learner access as before export. Export encryption does
not turn that ID into a read-only capability or create a server-side teacher,
class, authorization record, or membership relationship.

This protection covers downloaded class files at rest. It does not encrypt the
active browser's local storage, recover forgotten passwords, secure an already
unlocked device, or replace institutional access and deletion policies.
