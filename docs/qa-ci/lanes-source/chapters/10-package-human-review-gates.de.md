## Menschliche Review-Gates für Curriculum-Releases (`HR-001`–`HR-006`) {#sec:qal-human-review-gates}

Dieses Kapitel bündelt die sechs strikt voneinander unabhängigen menschlichen Freigabegates, die keine Toolchain automatisch entscheiden darf (zunächst bezogen auf `org.skillpilot.curriculum.de.gymnasium.mathematik`; jede Hash- oder Inhaltsänderung setzt betroffene Freigaben auf stale zurück).

### Überblick der sechs unabhängigen Gates {#sec:qal-hr-overview}

:::table{cols="2.2cm,4.2cm,2.8cm,X",longtable=true}
| Gate | Offener Umfang | Blockiert | Primäre Arbeitsquelle |
| --- | --- | --- | --- |
| `HR-001` Bildqualität | `559` aktive Bilder offen (`152` freigegeben; `69` von `780` Zielen providerbedingt zurückgestellt) | Fachliche Publikationsreife | `curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json` |
| `HR-002` Bildrechte | `715` Einzelentscheidungen (`708` Provider-Pipeline, `6` Nutzer-Claim, `1` deterministischer SVG-Render) | Öffentliche Weiterverbreitung | `curricula/DE/Gymnasium/quality/package-redistribution/de-gymnasium-mathematik-v1.review.json` |
| `HR-003` Nicht-Binärrechte | `3` Klassenentscheidungen (`skillpilot-data`, `official-source-evidence`, `generated-metadata`) | Öffentliche Weiterverbreitung | Dasselbe Redistribution-Ledger |
| `HR-004` Quelltext-Verifikation | `479` Einzelentscheidungen (neben `9.498` technischen Treffern) | Quellen-QA / Promotion | `curricula/DE/Gymnasium/quality/source-verification/de-gymnasium-mathematik-v1.review.json` |
| `HR-005` Ontologie-Sign-off | `1` hashgebundene fachlich-ontologische und rechtliche Expertenfreigabe | Ontologie-Promotion | `DPK-008c`-FWU-Receipt & `DPK-008d`-Reverse-Receipt |
| `HR-006` Signatur & `stable` | `1` Trust-/Release-Entscheidung je Releasegruppe | Öffentlicher `stable`-Release | Künftiger `DPK-011`-Release-Index |
:::

### Fach-, Rechte- und Quelltext-Gates (`HR-001` bis `HR-004`) {#sec:qal-hr-content-rights}

- **`HR-001` (Fachliche Bildfreigabe):** Prüft mathematische Korrektheit aller Werte/Relationen, Passung zu Lernziel und Altersstufe sowie Lesbarkeit, Sprache und Alt-Text auf dem aktuellen Asset-Hash (`human-approved`, `rejected`, `deferred-provider-limitation`).
- **`HR-002` (Rechte an 715 Bildern):** Alle eingebetteten Bilder stehen zunächst auf `pending-human-review`, `review-required` und `licenseExpression: null` (`708` Provider-Pipeline-Claims, `6` `user-provided-generated-claim` mit zusätzlicher Uploader-Attestation, `1` deterministischer Render via `librsvg rsvg-convert` 2.52.5 aus reviewtem SkillPilot-SVG). Provenienzlabels sind keine Lizenz; nötig sind Provider-/Lizenzprüfung, SPDX-artige `licenseExpression`, Evidenz, Reviewer und Zeitstempel auf allen 715 Records (nicht belegbare Assets werden `prohibited` und vor Publikation entfernt/ersetzt).
- **`HR-003` (Rechte der Nicht-Binärartefakte):** Nur `software-contracts` (gebunden an den Root-`LICENSE`-Hash) ist automatisch Apache-2.0. Offen sind (1) `skillpilot-data`, (2) `official-source-evidence` (Trennung zwischen Fakten/Metadaten, eigener Paraphrase und geschütztem Wortlaut) und (3) `generated-metadata`.
- **`HR-004` (479 Source-Text-Entscheidungen):** Neben `9.493` Treffern in authored Passage-Carriern und `5` temporären PDF-Projektionstreffern (`9.498` technische Nachweise ohne Rechtsfreigabe) erfordern `479` Records eine durch `reviewEvidenceSha256` an `sourceText`, Passage, PDF und Locator gebundene Entscheidung (`verified-verbatim`, `verified-normalized-transcription`, `reviewed-paraphrase`, `rejected`; Aufschlüsselung in [source-verification-de-gymnasium-mathematik-v1.md](repo:docs/qa-ci/status/source-verification-de-gymnasium-mathematik-v1.md)).

### Ontologie-Sign-off und Stable-Promotion (`HR-005` & `HR-006`) {#sec:qal-hr-ontology-promotion}

- **`HR-005` (Core-first Ontologie-Sign-off):** Hashgebundene Expertenfreigabe über das `DPK-008c`-FWU-OWL-ZIP (`2.362.455.128` Byte, SHA-256 `abab1d8aac3e9394af26c614bbf231954ba45ab11f725dd0f93f088820dc3f94`, Manifest `29f308424d1aeba9095f0e800253acadcdfaca0562dfa1fc37741c77c76023b3`), das rekonstruierte JSON-ZIP (`1.737.571.471` Byte, SHA-256 `7dcd233dd495900f6d6bd971ff6e86bdcdcfe5701f3522ed480be8336de23195`, Manifest `8d7970435431ff78743d0bf413a54bbebee009bbaafe35f1283ebcb89b4f2ff0`), das `DPK-008d`-Reverse-Receipt (`12.185` Byte, `94035f2d88e2c2b7588f13f01cb44b917c83900b9f839c66558ea7eae585884f`), das 20-teilige Evidenzmanifest (`3.483` Byte, `31c256ff612aa7a346fb0792c83b109d4bc01df52fdc36e98a8c717bf9b8eafc`, Inventardigest `8483f5ce428cc54cca1353668370ae09f32f51166af6a3235a2ff19ccb88ea1e`) und die 454-Einträge-Registry (`2e536c3f8d63e2acf45690375ace69ec0c6a6e92787bc8a16957b80120c4ca48`). Zu bestätigen sind semantische Passung jedes FWU-Core-Terms, Begrenzung von Erweiterungen und JSON-Literalen, saubere Schichtentrennung sowie Lizenz-/Share-Alike-Pflichten (`CC-BY-SA-4.0`; bis zum Sign-off bleibt die Core-Datei im Manifest `review-required` mit `licenseExpression: null`).
- **`HR-006` (Signatur und `stable`-Promotion nach `DPK-011`):** Bestätigt die vertrauenswürdige Signing-Identität und den Abschluss aller vorherigen Human-Gates auf den gebundenen Hashes vor der atomaren Promotion der JSON-/OWL-Releasegruppe von `staging` auf `stable`.
