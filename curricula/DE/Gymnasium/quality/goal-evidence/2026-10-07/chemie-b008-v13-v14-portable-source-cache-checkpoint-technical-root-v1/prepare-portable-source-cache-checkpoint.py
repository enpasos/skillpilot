# SPDX-License-Identifier: Apache-2.0
"""Append portable technical source receipts; never edit the sealed source dossiers."""
from __future__ import annotations

import collections
import hashlib
import json
import os
from pathlib import Path
import re
import subprocess
from datetime import datetime, timezone

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
EVIDENCE = ROOT / "curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07"
D13 = EVIDENCE / "chemie-b008-he-current-source-facet-boundary-author-v13"
D14 = EVIDENCE / "chemie-b008-bb-be-model-data-source-placement-author-v14"
assert not (OWN / "portable-technical-source-cache-checkpoint.freeze.json").exists()
NOW = datetime.now(timezone.utc).isoformat()
first_receipt = OWN / "four-original-sources-eight-external-local-cache-bindings.portable-receipts.json"
if first_receipt.exists():
    # Resume the same unsealed draft after a diagnosed technical reader failure.
    # Existing receipt bytes must remain exact; no sealed receipt is replaced.
    NOW = json.loads(first_receipt.read_text())["createdAtUTC"]


def sha(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def file_sha(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def bind(path: Path) -> dict:
    return {"path": rel(path), "sha256": file_sha(path), "bytes": path.stat().st_size}


def read(path: Path):
    return json.loads(path.read_text())


def write(name: str, value) -> Path:
    path = OWN / name
    encoded = json.dumps(value, ensure_ascii=False, indent=2) + "\n"
    if path.exists():
        assert path.read_text() == encoded, f"No overwrite: {path}"
        return path
    path.write_text(encoded)
    return path


def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for child in value.values():
            yield from strings(child)
    elif isinstance(value, list):
        for child in value:
            yield from strings(child)


def structured_file_refs(value, field=""):
    if isinstance(value, dict):
        for key, child in value.items():
            if key.lower() in {"comment", "comments", "description", "title", "rationale", "reason", "summary", "prompt", "text", "findings"}:
                continue
            yield from structured_file_refs(child, key)
    elif isinstance(value, list):
        for child in value:
            yield from structured_file_refs(child, field)
    elif isinstance(value, str) and re.search(r"path|file|config|review|resolution|ledger|binding|artifact|manifest|index|evidence|material|bundle|input|output|source|receipt|campaign|canonical|landscape", field, re.I):
        yield value


he_path = D13 / "actual-he-primary-operator-routine-components.author-input.json"
bb_path = D14 / "exact-bb-be-current-original-duties-and-specific-child-source-proposals.json"
he = read(he_path)
bb = read(bb_path)
supplement_paths = [D14 / "gk-authentic-source-supplements" / f"{land}.actual-current-topic-source-proposals.json" for land in ("BB", "BE")]
supplements = [read(path) for path in supplement_paths]
old_seals = []
old_payload_count = 0
for directory, expected in [
    (D13, "8261a5ae14faf45d03dbfed74f7adcc74147ad181d2d31a8a063491a466ae239"),
    (D14, "9d4183f6179566420145f343d9142a7cfbb0a7e8180415239a363f59cd7a7a1d"),
]:
    path = directory / "author.final.freeze.json"
    assert file_sha(path) == expected
    sealed = read(path)
    for item in sealed["payloads"]:
        assert bind(ROOT / item["path"]) == item, item["path"]
    old_payload_count += len(sealed["payloads"])
    old_seals.append({"historicalLocationLabel": rel(path), "expectedSha256": expected,
                      "payloadCount": len(sealed["payloads"]), "allLocalPayloadsActuallyVerifiedUnchanged": True,
                      "operativeInputToThisOrAnyActiveCurriculumGate": False})

page_uses = collections.defaultdict(set)
for name, pages in he["primaryReadingRanges"].items():
    key = "HE-G9" if name == "HEG9Physical" else "HE-SekII-current2026"
    page_uses[key].update(pages)


def collect_page_labels(value):
    for text in strings(value):
        match = re.search(r"/(joint-SekI|joint-SekII)\.physical-page-(\d+)\.txt$", text)
        if match:
            page_uses[match.group(1)].add(int(match.group(2)))


collect_page_labels(bb)
for item in supplements:
    collect_page_labels(item)

source_specs = [
    (D13, "HE-G9", ROOT / "curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json", "HE G9 SekI only; no current extracted process-source atom or G8 facet invented"),
    (D13, "HE-SekII-current2026", ROOT / "curricula/DE/Gymnasium/input/HE/upper-secondary/source-extraction/DE_HE_CHEMIE_SEKII_KC2024_CURRENT2026.source-extraction.json", "HE SekII current general standards: bounded components; no current extracted operator-source atom or whole source approval"),
    (D14, "joint-SekI", ROOT / bb["exactSourceInputs"][0]["currentBinding"]["path"], "BB/BE SekI: original content duties retained; only explicit model/data/operator components proposed"),
    (D14, "joint-SekII", ROOT / bb["exactSourceInputs"][1]["currentBinding"]["path"], "BB/BE SekII: explicit GK/LK table boundaries retained; four LK-only corrections and GK equilibrium component proposals remain bounded"),
]
raw_labels = []
receipts = []
version = subprocess.run(["pdftotext", "-v"], capture_output=True, text=True, check=True).stderr.splitlines()[0]
for directory, key, metadata_path, scope in source_specs:
    metadata = read(metadata_path)["sourceDocument"]
    pdf = directory / "primary" / f"{key}.actual.pdf.bin"
    text = directory / "primary" / f"{key}.full.actual.txt"
    original = ROOT / metadata["path"]
    assert file_sha(original) == file_sha(pdf)
    extracted = subprocess.check_output(["pdftotext", "-layout", str(original), "-"])
    assert extracted == text.read_bytes()
    parts = extracted.split(b"\x0c")
    raw_labels.extend([rel(pdf), rel(text)])
    pages = []
    for physical in sorted(page_uses[key]):
        stored = directory / "primary" / f"{key}.physical-page-{physical:03d}.txt"
        whole = parts[physical - 1]
        assert stored.read_bytes() == whole
        pages.append({"physicalPage1Based": physical, "wholeLayoutPageSha256": sha(whole),
                      "wholeLayoutPageBytes": len(whole),
                      "historicalReadEvidenceLocationLabel": rel(stored),
                      "currentCheck": "Actual reconstruction and frozen historical page digest, no repeated scientific approval"})
    tracked = bool(subprocess.check_output(["git", "ls-files", "--", rel(original)]).strip())
    receipts.append({
        "sourceKey": key, "officialSourceTitle": metadata["title"],
        "officialSourceUrl": metadata.get("url", metadata.get("sourceUrl")),
        "existingSourceMetadata": bind(metadata_path),
        "existingLocalOriginalPdfLocationLabel": rel(original), "existingLocalOriginalPdfIsTracked": tracked,
        "expectedOfficialPdfSha256": file_sha(original), "expectedOfficialPdfBytes": original.stat().st_size,
        "expectedWholeLayoutTextSha256": sha(extracted), "expectedWholeLayoutTextBytes": len(extracted),
        "expectedPhysicalPageCount": extracted.count(b"\x0c"), "actualPdftotextVersion": version,
        "historicalLocalRawCache": [{"historicalLocationLabel": rel(path), "expectedSha256": file_sha(path),
                                      "expectedBytes": path.stat().st_size,
                                      "referenceRole": "External local historical witness; not an operative repository file requirement"}
                                     for path in (pdf, text)],
        "historicalActuallyReadWholePageReceipts": pages,
        "reproduction": {"fetch": "Fetch officialSourceUrl into a local temporary directory; verify expectedOfficialPdfSha256 before extraction",
                         "extractArgv": ["pdftotext", "-layout", "<local-official-pdf-with-verified-sha256>", "<local-tmp-layout-output>"],
                         "select": "Split full layout bytes on form-feed 0x0c; physical page N is element N-1, without stripping whitespace",
                         "verify": "Verify whole-text and selected whole-page digests; retain official full texts locally only"},
        "retainedSourceScopeBoundary": scope, "localSourceAndPageBytesActuallyReproduced": True,
        "newScientificReadingOrApproval": False, "independentApproval": False,
        "wholeOriginalSourceDutyClosed": False, "rawOfficialFullTextCommittedByThisReceipt": False,
        "humanApproval": False,
    })
assert len(receipts) == 4 and len(raw_labels) == 8
source_receipt_path = write("four-original-sources-eight-external-local-cache-bindings.portable-receipts.json", {
    "schemaVersion": 1, "artifactKind": "portable-technical-historical-source-receipts-v1", "createdAtUTC": NOW,
    "role": "Technical successor receipts; preservation of actual historical evidence, no source review restart or scientific approval",
    "sourceCount": 4, "externalLocalRawCacheFileCount": 8, "sourceReceipts": receipts,
    "rawLocationLabelsAreNotOperativeFileInputs": True,
    "localHistoricalPayloadsRemainUnchanged": True, "activeWrites": 0, "strictGain": 0,
    "humanApproval": False, "independentSourceApproval": False,
})

he_components = [{key: value for key, value in row.items()
                  if key not in {"actualPrimaryText", "actualPrimaryPageBinding"}} for row in he["actualReadRoutineComponents"]]
bb_limits = [{"sourceGoalId": row["currentOriginalSourceGoalId"], "oldFamilyId": row["oldFamilyId"],
              "stage": row["stage"], "actualCourseScope": row["actualCourseScope"],
              "sourceScopeLimits": row["sourceScopeLimits"], "wholeOriginalSourceClosure": row["wholeOriginalSourceClosure"],
              "historicalAuthorScientificStatus": row["scientificStatus"]} for row in bb["original28UniqueFamilySourceDuties"]]
scope_path = write("retained-inert-author-source-scope-and-reading-lineage.portable.json", {
    "schemaVersion": 1, "artifactKind": "technical-scope-preservation-receipt-v1", "createdAtUTC": NOW,
    "historicalAuthorSeals": old_seals, "existingHistoricalReadRecordInputs": [bind(he_path), bind(bb_path), *map(bind, supplement_paths)],
    "HEHistoricalAuthorComponents": he_components, "HEOriginalActuallyReadRanges": he["primaryReadingRanges"],
    "HECurrentExtractedProcessFacet": "HOLD; no current process source IDs invented", "HEG8ChemistryFacet": "HOLD; existing policy G9 only",
    "BBBEOriginalTwentyEightWholeDutyScopeLimits": bb_limits,
    "BBBEAuthorEntrySnapshot": {"originalWholeDuties": 28, "GKOriginalSupplementalDuties": 4,
                               "partialComponentBindings": 56, "sourceViews": 6,
                               "wholeOriginalSourceDutyClosure": False},
    "sourceViewAndCourseCorrectionsAreInactiveAuthorCandidates": True,
    "existingLaterIndependentReviewsAreNotRewrittenOrReissued": True,
    "noWholeDescriptionPositiveEvidenceOrM7ApprovalCreated": True,
    "historicalRecordLocationReferencesAreLineageNotActiveInputs": True,
    "activeWrites": 0, "strictGain": 0, "humanApproval": False,
})

# Read the current registry and its real file references, rather than assuming
# that a raw file is inert because its containing directory is named candidate.
registry = ROOT / "curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json"
atlas_root = ROOT / "app/scripts/config/goal-books"
publication_root = ROOT / "app/public/lernzielbuch"
seeds = [registry, ROOT / "curricula/DE/Gymnasium/provenance/chemistry-evidence-watch-baseline.json",
         ROOT / "docs/qa-ci/status/curriculum-quality-status.json"]
seeds.extend(sorted(atlas_root.rglob("*.json")))
seeds.extend(sorted(publication_root.glob("*.json")))
queue = collections.deque(seeds)
seen = set()
scanned = []
hits = []
json_parse_failures = []
relative_prefixes = ("curricula/", "app/", "docs/", "contracts/", "scripts/", "backend/", "ai/")
raw_names = {Path(label).name for label in raw_labels}
while queue:
    path = queue.popleft()
    if path in seen or not path.is_file():
        continue
    seen.add(path)
    if path.suffix not in {".json", ".jsonl", ".md", ".txt", ".html"} and not path.name.endswith(".json.bin"):
        continue
    content = path.read_text()
    scanned.append(bind(path))
    if path.suffix == ".jsonl":
        values = []
        for line in content.splitlines():
            if line.strip():
                try:
                    values.append(json.loads(line))
                except json.JSONDecodeError:
                    json_parse_failures.append(rel(path))
    elif path.suffix == ".json" or path.name.endswith(".json.bin"):
        try:
            values = [json.loads(content)]
        except json.JSONDecodeError:
            json_parse_failures.append(rel(path))
            values = []
    else:
        values = []
    if path == registry:
        values = [subject for subject in values[0]["subjects"] if subject["subject"] in {"chemie", "biologie"}]
    if path.is_relative_to(publication_root):
        # Closed generated publication files are terminal artifacts. Their
        # actual bytes, index digests and direct raw references are checked;
        # narrative citations are not dependencies to expand.
        matched = [label for label in raw_labels if label in content]
        short_matches = [name for name in raw_names if name in content]
        if matched or short_matches:
            hits.append({"file": rel(path), "exactRawLabels": matched, "rawBasenames": short_matches})
        continue
    candidates = list(structured_file_refs(values))
    for value in candidates:
        if len(value) > 2048 or not value.endswith((".json", ".jsonl", ".json.bin", ".md", ".txt", ".html", ".pdf.bin")):
            continue
        if value.startswith(relative_prefixes):
            candidate = ROOT / value
        elif value.startswith("../") or value.startswith("./"):
            choices = [path.parent / value, ROOT / "app" / value, ROOT / value]
            candidate = next((p for p in choices if p.is_file()), choices[0])
        else:
            continue
        candidate = candidate.resolve()
        if any(str(candidate) == str((ROOT / label).resolve()) for label in raw_labels):
            hits.append({"file": rel(path), "operativeRawFileReference": value})
        if candidate.is_relative_to(ROOT) and candidate.is_file():
            queue.append(candidate)
assert not json_parse_failures, json_parse_failures
assert not hits, hits

index_path = publication_root / "index.json"
index = read(index_path)
assert len(index["books"]) == 4
book_checks = []
for book in index["books"]:
    result = {"bookId": book["bookId"], "publicationMode": book["publicationMode"], "goalPageCount": book["pageCount"]}
    for field, url_key, digest_key in [("model", "url", "sha256"), ("pdf", "url", "sha256"),
                                       ("pdfRenderManifest", "renderManifestUrl", "renderManifestSha256")]:
        record = book["model"] if field == "model" else book["pdf"]
        path = ROOT / "app/public" / record[url_key].lstrip("/")
        expected = record[digest_key].removeprefix("sha256:")
        assert file_sha(path) == expected
        result[field] = {**bind(path), "expectedIndexSha256": expected, "actualDigestEqualsCurrentIndex": True}
    original_sources = publication_root / (book["bookId"] + ".original-sources.json")
    result["originalSources"] = bind(original_sources)
    result["rawCacheFileRequirementsFound"] = 0
    result["checkScope"] = "Current local publication artifact/index digests and raw-cache-reference absence; no new scientific, host, human or external-publication acceptance"
    book_checks.append(result)
active_check_path = write("active-registry-DPAMV-atlas-and-four-publication-raw-cache-exclusion.actual.json", {
    "schemaVersion": 1, "artifactKind": "actual-technical-active-input-closure-check-v1", "createdAtUTC": NOW,
    "seedBindings": list(map(bind, seeds)), "readReferenceMethod": "Chemistry/Biology current registry D/P/A/M/V plus actual source-atlas inputs: recursively follow exact existing structured file references, excluding free comments and narratives. Four generated publication artifacts are terminal direct-reference and digest checks. No historical Math review is re-read scientifically; binary assets are not interpreted as textual configuration.",
    "forbiddenHistoricalRawCacheLocationLabels": raw_labels, "scannedTextFileCount": len(scanned), "scannedTextBindings": scanned,
    "actualRawCacheHits": hits, "rawCacheOperativeFileRequirementCount": 0,
    "currentPublicationIndex": bind(index_path), "actualFourPublicationBindings": book_checks,
    "activeCurrentInputsNotChanged": True, "activeWrites": 0, "strictGain": 0,
    "humanApproval": False, "fullPublicationScientificReviewOrExternalPublicationClaim": False,
})

# Capture the actual commit-checkpoint hygiene inventory without copying any
# official full text or printing possible private values.
untracked = [Path(value) for value in subprocess.check_output(["git", "ls-files", "--others", "--exclude-standard", "-z"]).decode().split("\0") if value]
scoped = [path for path in untracked if "/2026-10-07/" in str(path) or "20261007" in str(path)]
links = [path for path in scoped if path.is_symlink()]
broken = [str(path) for path in links if not path.exists()]
absolute = [str(path) for path in links if Path(os.readlink(path)).is_absolute()]
external = [str(path) for path in links if not path.resolve().is_relative_to(ROOT)]
debris_parts = {"native-isolated-repo", "node_modules", ".git", "__pycache__", ".cache", "cache", "sessions", "chats", "classes", "learners"}
debris = [str(path) for path in scoped if set(path.parts) & debris_parts]
empty_json = [str(path) for path in scoped if path.suffix == ".json" and path.exists() and path.stat().st_size == 0]
assert not broken and not absolute and not external and not debris and not empty_json
inventory_digest = sha("\n".join(sorted(map(str, scoped))).encode())
hygiene_path = write("actual-untracked-oct7-storage-and-private-data-bounded-audit.json", {
    "schemaVersion": 1, "artifactKind": "actual-bounded-local-storage-audit-v1", "createdAtUTC": NOW,
    "inventoryCommand": ["git", "ls-files", "--others", "--exclude-standard", "-z"],
    "scope": "New untracked paths containing /2026-10-07/ or 20261007; exact snapshot, not a guarantee for later files",
    "allUntrackedCount": len(untracked), "scopedUntrackedCount": len(scoped), "sortedScopedPathInventorySha256": inventory_digest,
    "priorActualContentAuditFromThisSameTask": {"scopedUntrackedSnapshotCount": 3556, "textFilesActuallyScanned": 2928,
        "method": "Actual recursive JSON/JSONL nonempty sensitive-key inspection and private-key/JWT/GitHub-token pattern inspection; email matches manually scoped against actual official PDF bytes",
        "nonemptySensitiveJSONKeyHits": [], "credentialPatternHits": [],
        "soleEmailHit": {"historicalLocationLabel": rel(D13 / "primary/HE-SekII-current2026.full.actual.txt"),
                         "finding": "Actual published HMKB ministry-imprint address; no learner/private contact data; value not exported"},
        "scopeLimit": "Actual earlier audit snapshot reused without claiming content inspection of later-created files"},
    "currentCheckpointStructuralScanOnly": True, "validRelativeInternalSymlinkCount": len(links),
    "brokenSymlinks": broken, "absoluteSymlinks": absolute, "outsideRepoSymlinks": external,
    "namedCacheOrPrivateStateFolderPaths": debris, "zeroByteJsonFiles": empty_json,
    "privacyCheckLimit": "Structured sensitive-key and bounded credential-pattern checks plus actual email-context inspection; no general legal or exhaustive security certification",
    "officialWholeRawCacheFindings": {"documentCount": 4, "fileCount": 8, "historicalLocationLabels": raw_labels,
                                     "wholeTXTExportsMustRemainLocalPerAGENTS1031": True,
                                     "PDFCopiesAreExistingOfficialInputDuplicates": True},
    "activeWrites": 0, "filesDeletedMovedOrRewritten": 0, "humanApproval": False,
})

history_path = write("local-original-v13-v14-history-unchanged.actual.json", {
    "schemaVersion": 1, "artifactKind": "actual-unchanged-local-history-checkpoint-v1", "createdAtUTC": NOW,
    "historicalSeals": old_seals, "actuallyVerifiedOriginalPayloadCount": old_payload_count,
    "actualRawSourceFileCount": 8, "allOriginalSealsAndPayloadsUnchangedBeforeAndAfter": True,
    "scope": "Local original historical byte preservation; optional external raw-cache location labels are not new committed publication inputs",
    "futureGitignoreOperation": "Root may add generic raw-primary cache suffix patterns; no validator exception or package-specific rule is introduced here",
    "historicalArtifactsMovedDeletedReboundOrRegenerated": 0,
    "existingScientificReviewsChangedOrSuperseded": 0, "activeWrites": 0, "strictGain": 0, "humanApproval": False,
})

readme = OWN / "README.md"
readme.write_text("""# B008 v13/v14: portable technical source-cache checkpoint

This append-only technical successor records four actual official sources and
eight unchanged local raw-cache witnesses. It copies no official full text or
PDF. AGENTS.md requires complete official-PDF extracts to remain local.

The original v13/v14 seals and all local payloads were actually verified byte
for byte. Historical reading ranges, source/course boundaries and HOLD claims
are retained. Reconstruct sources from the recorded official URL and expected
PDF digest, run the recorded `pdftotext -layout` procedure in a local temporary
directory, and check the whole-text and selected whole-page digests. Raw-cache
location labels are provenance labels; they are not required repository files.
The existing local official input PDFs are not tracked Git files.

Actual current registry D/P/A/M/V references, source-atlas inputs and four local
goal-book publication metadata bindings were inspected. They require none of
these eight raw-cache files. The checks concern technical input references and
artifact/index integrity, not a new scientific or publication approval.

The bounded untracked-file audit found no broken, absolute or external symlink,
named local cache/private-state directory, empty JSON, structured private state
or credential. Its scope and limits are explicit in the actual receipt.

No active curriculum files, source reviews, existing seals, images or goal-book
artifacts were changed. No new D/P/A/M/V, source-duty or M7 completion, human
review, legal clearance, deployment or external publication is claimed.
""")
entry_path = write("neutral-portable-source-cache-checkpoint.entry.json", {
    "schemaVersion": 1, "artifactKind": "neutral-technical-local-cache-checkpoint-entry-v1", "createdAtUTC": NOW,
    "portableSourceReceipts": bind(source_receipt_path), "retainedSourceScope": bind(scope_path),
    "actualActiveBindingsAndPublicationReferences": bind(active_check_path), "actualStorageAudit": bind(hygiene_path),
    "unchangedOriginalLocalHistory": bind(history_path), "readme": bind(readme),
    "independentSourceOrDescriptionApprovalCreated": False, "wholeSourceClosure": False,
    "activeWrites": 0, "strictGain": 0, "humanApproval": False,
})
for item in old_seals:
    assert file_sha(ROOT / item["historicalLocationLabel"]) == item["expectedSha256"]
    for original in read(ROOT / item["historicalLocationLabel"])["payloads"]:
        assert bind(ROOT / original["path"]) == original
payloads = sorted([path for path in OWN.iterdir() if path.is_file()], key=lambda path: path.name)
for path in payloads:
    if path.suffix == ".json":
        read(path)
compile((OWN / "prepare-portable-source-cache-checkpoint.py").read_text(), rel(OWN / "prepare-portable-source-cache-checkpoint.py"), "exec")
freeze_path = write("portable-technical-source-cache-checkpoint.freeze.json", {
    "schemaVersion": 1, "artifactKind": "sealed-portable-technical-source-cache-checkpoint-v1", "sealedAtUTC": NOW,
    "payloads": list(map(bind, payloads)), "role": "Technical source-cache portability and actual inactive raw-reference evidence only",
    "existingOriginalHistoryChanged": False, "fullScientificReviewsRestarted": False,
    "sourceDutyClosure": False, "independentApproval": False, "activeWrites": 0, "strictGain": 0, "humanApproval": False,
})
print(json.dumps({"entry": bind(entry_path), "freeze": bind(freeze_path), "payloadCount": len(payloads),
                  "historicalPayloadsActuallyVerifiedUnchanged": old_payload_count,
                  "actualActiveTextBindingsInspected": len(scanned), "rawOperativeRequirements": len(hits),
                  "publicationBooks": len(book_checks), "activeWrites": 0, "strictGain": 0}, ensure_ascii=False))
