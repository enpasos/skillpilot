# Learner Data Export & Import

This document explains the behavior and technical details of the Learner Data Export/Import functionality in SkillPilot.

## Overview

Users can export their entire learning profile (curriculum selection, progress/mastery, and planned goals) into a JSON file and import it into another SkillPilot instance or account.

## Import Behavior

When uploading an exported file to a new SkillPilot-ID, the system performs a **state transfer**. The target account will effectively inherit the profile contained in the file.

### Specific Actions:
1.  **Identity Preservation**: The target account (the one you are importing *into*) retains its unique `skillpilotId`. The ID from the file is ignored during import.
2.  **Curriculum Settings**:
    *   **Overwritten**: The target's "Selected Curriculum" and "Personal Curriculum" (enabled subjects/modules) are replaced by the values in the file.
3.  **Mastery (Progress)**:
    *   **Merged/Updated**: Mastery scores from the file are applied to the target.
    *   If the target already has a score for a topic, it is **updated** to the file's value.
    *   If the file contains new topics, they are **added**.
    *   Existing mastery scores for topics *not* in the file are **untouched** (they remain).
4.  **Planned Goals**:
    *   **Replaced**: The target's list of planned goals is strictly overwritten by the goals in the file. Any goal previously planned by the target user that is not in the file will be removed.

## Source Data Integrity

**What happens to the old data?**
Nothing. The export process is **read-only**.
*   The data of the original (source) SkillPilot-ID remains **completely unchanged** after export.
*   Importing that data into a new ID creates a **copy**. The source and target are completely independent after the operation.

## Security & Signatures

The exported file is secured with an **HMAC-SHA256 signature**. This ensures data integrity and prevents tampering (e.g., manually editing the file to give yourself 100% mastery).

### The File Structure
```json
{
  "data": {
    "learner": { ... },
    "mastery": { ... },
    "plannedGoals": [ ... ]
  },
  "signature": "a1b2c3d4..."
}
```

### What breaks the signature?

The signature is calculated based on the **data values**, not the exact byte-for-byte content of the file.

*   **Changing Values (BROKEN)**: If you change a mastery score from `0.5` to `1.0`, the signature verification will **FAIL**.
*   **Reformatting/Whitespace (SAFE)**: If you pretty-print the JSON, add newlines, or extra spaces *outside* of string values, the import will still **SUCCEED**.
    *   *Reason*: The system parses the JSON into a data object first, ignoring formatting, and then recalculates the signature from that standardized object.
*   **Reordering Fields (SAFE)**: If you change the order of keys (e.g., putting `"mastery"` before `"learner"`), the import will **SUCCEED**.
