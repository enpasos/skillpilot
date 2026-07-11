#!/usr/bin/env python3
"""Generate and verify the Mathematik source-verification review lane.

The lane deliberately distinguishes three things:

* a source text occurs contiguously in an authored passage carrier;
* a source text occurs contiguously in an ephemeral ``pdftotext -layout``
  projection of the bound official PDF, with only metadata and hashes retained;
* neither machine check succeeds and a human review is required.

Neither machine outcome is a human approval.  Normal checks bind source PDF
bytes and projection metadata, but honestly do not independently prove the
five PDF matches.  ``--replay-pdf-evidence`` re-extracts projections only in
memory and requires identical hashes, sizes, match records, and review queue.
No extracted PDF text is committed.
"""

from __future__ import annotations

import argparse
import copy
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import unicodedata
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from jsonschema import Draft202012Validator, FormatChecker


REPO_ROOT = Path(__file__).resolve().parents[1]
CONTRACT_ROOT = REPO_ROOT / "contracts/curriculum-package/v1"
SCHEMA_PATH = CONTRACT_ROOT / "source-verification-review.schema.json"
PROFILE_REL = (
    "contracts/curriculum-package/v1/profiles/"
    "de-gymnasium-mathematik-publication-evidence-v1.profile.json"
)
LEDGER_REL = (
    "curricula/DE/Gymnasium/quality/source-verification/"
    "de-gymnasium-mathematik-v1.review.json"
)
REPORT_REL = (
    "docs/qa-ci/status/"
    "source-verification-de-gymnasium-mathematik-v1.md"
)
SCHEMA_ID = (
    "https://skillpilot.com/schemas/curriculum-package/v1/"
    "source-verification-review.schema.json"
)
REVIEW_ID = "de-gymnasium-mathematik-source-verification-v1"
PACKAGE_ID = "org.skillpilot.curriculum.de.gymnasium.mathematik"
PROFILE_ID = "de-gymnasium-mathematik-publication-evidence-v1"
SOURCE_GOAL_IDENTITY = "mappingCollectionId+sourceGoalId"
PASSAGE_CARRIER_FIELDS = ("text", "rawText", "extractedText", "title")
PDF_INVOCATION = ("pdftotext", "-layout", "{sourcePdfPath}", "-")

PENDING_STATUS = "pending-human-review"
ACCEPTED_STATUSES = {
    "verified-verbatim",
    "verified-normalized-transcription",
    "reviewed-paraphrase",
}
COMPLETED_STATUSES = ACCEPTED_STATUSES | {"rejected"}
class VerificationError(RuntimeError):
    """Trusted inputs or generated evidence violate the lane contract."""


def duplicate_safe_object(pairs: list[tuple[str, Any]]) -> dict[str, Any]:
    result: dict[str, Any] = {}
    for key, value in pairs:
        if key in result:
            raise VerificationError(f"Duplicate JSON object key {key!r}")
        result[key] = value
    return result


def reject_nonfinite(value: str) -> None:
    raise VerificationError(f"Non-finite JSON number {value!r} is forbidden")


def read_json(path: Path) -> Any:
    try:
        raw = path.read_text(encoding="utf-8")
    except OSError as error:
        raise VerificationError(f"Cannot read {path}: {error}") from error
    try:
        return json.loads(
            raw,
            object_pairs_hook=duplicate_safe_object,
            parse_constant=reject_nonfinite,
        )
    except (json.JSONDecodeError, VerificationError) as error:
        raise VerificationError(f"Invalid JSON in {path}: {error}") from error


def canonical_json_bytes(value: Any) -> bytes:
    return json.dumps(
        value,
        ensure_ascii=False,
        allow_nan=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def sha256_bytes(value: bytes) -> str:
    return f"sha256:{hashlib.sha256(value).hexdigest()}"


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    try:
        with path.open("rb") as handle:
            for chunk in iter(lambda: handle.read(1024 * 1024), b""):
                digest.update(chunk)
    except OSError as error:
        raise VerificationError(f"Cannot hash {path}: {error}") from error
    return f"sha256:{digest.hexdigest()}"


def semantic_digest(value: Any) -> str:
    return sha256_bytes(canonical_json_bytes(value))


def require_object(value: Any, label: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise VerificationError(f"{label} must be an object")
    return value


def require_list(value: Any, label: str) -> list[Any]:
    if not isinstance(value, list):
        raise VerificationError(f"{label} must be an array")
    return value


def require_nonblank(value: Any, label: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise VerificationError(f"{label} must be a non-blank string")
    return value


def repo_file(relative_path: str) -> Path:
    require_nonblank(relative_path, "repository path")
    if relative_path.startswith("/") or "\\" in relative_path:
        raise VerificationError(f"Unsafe repository path {relative_path!r}")
    parts = Path(relative_path).parts
    if any(part in {"", ".", ".."} for part in parts):
        raise VerificationError(f"Unsafe repository path {relative_path!r}")
    unresolved = REPO_ROOT / relative_path
    if unresolved.is_symlink():
        raise VerificationError(f"Repository input must not be a symlink: {relative_path}")
    candidate = unresolved.resolve()
    try:
        candidate.relative_to(REPO_ROOT.resolve())
    except ValueError as error:
        raise VerificationError(f"Repository path escapes checkout: {relative_path}") from error
    if not candidate.is_file() or candidate.is_symlink():
        raise VerificationError(
            f"Repository input must be a regular non-symlink file: {relative_path}"
        )
    return candidate


def output_path(relative_path: str) -> Path:
    if relative_path.startswith("/") or "\\" in relative_path:
        raise VerificationError(f"Unsafe output path {relative_path!r}")
    candidate = (REPO_ROOT / relative_path).resolve()
    try:
        candidate.relative_to(REPO_ROOT.resolve())
    except ValueError as error:
        raise VerificationError(f"Output path escapes checkout: {relative_path}") from error
    return candidate


def atomic_write(path: Path, payload: bytes) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    descriptor, temp_name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    try:
        with os.fdopen(descriptor, "wb") as handle:
            handle.write(payload)
            handle.flush()
            os.fsync(handle.fileno())
        os.chmod(temp_name, 0o644)
        os.replace(temp_name, path)
    except BaseException:
        try:
            os.unlink(temp_name)
        except FileNotFoundError:
            pass
        raise


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", unicodedata.normalize("NFC", value)).strip()


def normalized_projection_bytes(raw_text: str) -> bytes:
    normalized = normalize_text(raw_text)
    if not normalized:
        raise VerificationError("pdftotext produced an empty normalized projection")
    return (normalized + "\n").encode("utf-8")


def pdftotext_version() -> str:
    try:
        completed = subprocess.run(
            ["pdftotext", "-v"],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=30,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        raise VerificationError(f"Cannot execute pdftotext -v: {error}") from error
    combined = completed.stdout + completed.stderr
    try:
        lines = combined.decode("utf-8", errors="strict").splitlines()
    except UnicodeDecodeError as error:
        raise VerificationError("pdftotext -v output is not UTF-8") from error
    first = next((line.strip() for line in lines if line.strip()), "")
    if completed.returncode != 0 or not first.startswith("pdftotext version "):
        raise VerificationError(
            f"Unexpected pdftotext -v result ({completed.returncode}): {first!r}"
        )
    return first


def extract_pdf_projection(source_pdf: Path) -> bytes:
    try:
        completed = subprocess.run(
            ["pdftotext", "-layout", str(source_pdf), "-"],
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=180,
        )
    except (OSError, subprocess.TimeoutExpired) as error:
        raise VerificationError(f"Cannot extract {source_pdf}: {error}") from error
    if completed.returncode != 0:
        stderr = completed.stderr.decode("utf-8", errors="replace").strip()
        raise VerificationError(
            f"pdftotext failed for {source_pdf} ({completed.returncode}): {stderr}"
        )
    try:
        text = completed.stdout.decode("utf-8", errors="strict")
    except UnicodeDecodeError as error:
        raise VerificationError(f"pdftotext output is not UTF-8 for {source_pdf}") from error
    return normalized_projection_bytes(text)


def document_key_for_goal(
    goal: dict[str, Any],
    passage: dict[str, Any],
    documents: dict[str, dict[str, Any]],
    label: str,
) -> str:
    candidates: list[str] = []
    for value in (goal.get("sourceDocumentKey"), passage.get("sourceDocumentKey")):
        if isinstance(value, str) and value:
            candidates.append(value)
    tags = goal.get("tags", [])
    if tags is not None:
        for tag in require_list(tags, f"{label}.tags"):
            if isinstance(tag, str) and tag.startswith("sourceDocument:"):
                candidates.append(tag.split(":", 1)[1])
    for source_path in (goal.get("sourcePath"), passage.get("sourcePath")):
        if isinstance(source_path, str) and source_path:
            for key, document in documents.items():
                if source_path in {document.get("path"), document.get("textPath")}:
                    candidates.append(key)
    candidates = list(dict.fromkeys(candidates))
    if not candidates and len(documents) == 1:
        candidates = [next(iter(documents))]
    if len(candidates) != 1 or candidates[0] not in documents:
        raise VerificationError(
            f"{label} must resolve to exactly one declared source document; "
            f"got {candidates!r}"
        )
    return candidates[0]


def passage_carrier_projection(passage: dict[str, Any], label: str) -> dict[str, Any]:
    projection: dict[str, Any] = {"passageId": require_nonblank(passage.get("id"), label)}
    for field in PASSAGE_CARRIER_FIELDS:
        value = passage.get(field)
        if value is not None and not isinstance(value, str):
            raise VerificationError(f"{label}.{field} must be a string when present")
        projection[field] = value
    return projection


def schema_diagnostics(document: Any) -> list[str]:
    schema = read_json(SCHEMA_PATH)
    validator = Draft202012Validator(schema, format_checker=FormatChecker())
    diagnostics: list[str] = []
    for error in sorted(validator.iter_errors(document), key=lambda item: list(item.path)):
        location = "/" + "/".join(str(part) for part in error.path)
        diagnostics.append(f"SCHEMA {location}: {error.message}")
    return diagnostics


def validate_unique_ledger_keys(document: dict[str, Any]) -> list[str]:
    diagnostics: list[str] = []
    collection_ids = [
        item.get("mappingCollectionId")
        for item in document.get("sourceCollections", [])
        if isinstance(item, dict)
    ]
    duplicate_collections = sorted(
        key for key, count in Counter(collection_ids).items() if count > 1
    )
    if duplicate_collections:
        diagnostics.append(f"DUPLICATE_COLLECTION_IDS {duplicate_collections!r}")

    review_keys = [
        (item.get("mappingCollectionId"), item.get("sourceGoalId"))
        for item in document.get("humanReviewRecords", [])
        if isinstance(item, dict)
    ]
    duplicate_reviews = sorted(key for key, count in Counter(review_keys).items() if count > 1)
    if duplicate_reviews:
        diagnostics.append(f"DUPLICATE_REVIEW_KEYS {duplicate_reviews[:5]!r}")

    pdf_match_keys = [
        (item.get("mappingCollectionId"), item.get("sourceGoalId"))
        for item in document.get("pdfProjectionMatchRecords", [])
        if isinstance(item, dict)
    ]
    duplicate_pdf_matches = sorted(
        key for key, count in Counter(pdf_match_keys).items() if count > 1
    )
    if duplicate_pdf_matches:
        diagnostics.append(f"DUPLICATE_PDF_MATCH_KEYS {duplicate_pdf_matches[:5]!r}")
    overlap = sorted(set(review_keys) & set(pdf_match_keys))
    if overlap:
        diagnostics.append(f"MACHINE_HUMAN_RECORD_OVERLAP {overlap[:5]!r}")

    for index, item in enumerate(document.get("humanReviewRecords", [])):
        if not isinstance(item, dict) or not isinstance(item.get("decision"), dict):
            continue
        fingerprint = item.get("reviewEvidenceSha256")
        evidence = {
            key: value
            for key, value in item.items()
            if key not in {"reviewEvidenceSha256", "decision"}
        }
        if isinstance(fingerprint, str) and semantic_digest(evidence) != fingerprint:
            diagnostics.append(
                f"REVIEW_EVIDENCE_FINGERPRINT_MISMATCH humanReviewRecords[{index}]"
            )
        decision = item["decision"]
        source_text = item.get("sourceText")
        verified_text = decision.get("verifiedSourceText")
        if decision.get("status") == "verified-verbatim" and verified_text != source_text:
            diagnostics.append(
                f"VERBATIM_TEXT_MISMATCH humanReviewRecords[{index}] must preserve sourceText exactly"
            )
        if decision.get("status") == "verified-normalized-transcription":
            if not isinstance(source_text, str) or not isinstance(verified_text, str):
                continue
            if normalize_text(source_text) != normalize_text(verified_text):
                diagnostics.append(
                    "NORMALIZED_TRANSCRIPTION_MISMATCH "
                    f"humanReviewRecords[{index}] differs beyond normalization"
                )

    projections = document.get("extractorEvidence", {}).get("projections", [])
    for field in ("sourcePdfSha256",):
        values = [item.get(field) for item in projections if isinstance(item, dict)]
        duplicates = sorted(key for key, count in Counter(values).items() if count > 1)
        if duplicates:
            diagnostics.append(f"DUPLICATE_PROJECTION_{field.upper()} {duplicates!r}")
    return diagnostics


def decision_map(existing: dict[str, Any] | None) -> dict[tuple[str, str], dict[str, Any]]:
    if existing is None:
        return {}
    result: dict[tuple[str, str], dict[str, Any]] = {}
    for index, value in enumerate(existing.get("humanReviewRecords", [])):
        record = require_object(value, f"humanReviewRecords[{index}]")
        key = (
            require_nonblank(record.get("mappingCollectionId"), "mappingCollectionId"),
            require_nonblank(record.get("sourceGoalId"), "sourceGoalId"),
        )
        if key in result:
            raise VerificationError(f"Duplicate human-review key {key!r}")
        decision = copy.deepcopy(require_object(record.get("decision"), "decision"))
        fingerprint = record.get("reviewEvidenceSha256")
        if fingerprint is not None and not isinstance(fingerprint, str):
            raise VerificationError(f"Invalid review-evidence fingerprint for {key!r}")
        result[key] = {
            "decision": decision,
            "reviewEvidenceSha256": fingerprint,
        }
    return result


def initial_decision() -> dict[str, Any]:
    return {
        "status": PENDING_STATUS,
        "reviewer": None,
        "reviewedAt": None,
        "rationale": None,
        "verifiedSourceText": None,
    }


def decision_for_evidence(
    key: tuple[str, str],
    prior: dict[str, Any] | None,
    review_evidence_sha256: str,
) -> dict[str, Any]:
    if prior is None:
        return initial_decision()
    decision = require_object(prior.get("decision"), f"decision for {key!r}")
    previous_fingerprint = prior.get("reviewEvidenceSha256")
    if previous_fingerprint == review_evidence_sha256:
        return copy.deepcopy(decision)
    if decision.get("status") == PENDING_STATUS:
        return initial_decision()
    raise VerificationError(
        "Completed human review became stale after evidence drift: "
        f"{key!r} ({previous_fingerprint!r} -> {review_evidence_sha256!r})"
    )


def pdf_match_evidence(
    goal_evidence: dict[str, Any],
    projection: dict[str, Any],
    normalized_source_text: str,
    normalized_match_start: int,
) -> dict[str, Any]:
    normalized_match_end = normalized_match_start + len(normalized_source_text)
    if normalized_match_start < 0 or normalized_match_end > projection["normalizedCharacterCount"]:
        raise VerificationError(
            "PDF match position is outside the bound projection: "
            f"{goal_evidence['mappingCollectionId']} / {goal_evidence['sourceGoalId']}"
        )
    binding = {
        "sourcePdfSha256": goal_evidence["sourcePdfSha256"],
        "projectionSha256": projection["projectionSha256"],
        "sourceGoalId": goal_evidence["sourceGoalId"],
        "sourceTextSha256": goal_evidence["sourceTextSha256"],
        "normalizedMatchStart": normalized_match_start,
        "normalizedMatchEnd": normalized_match_end,
    }
    return {
        **goal_evidence,
        "verificationMethod": "pdf-projection-contiguous-normalized",
        "projectionSha256": projection["projectionSha256"],
        "normalizedMatchStart": normalized_match_start,
        "normalizedMatchEnd": normalized_match_end,
        "matchEvidenceSha256": semantic_digest(binding),
    }


def build_review(
    *,
    existing: dict[str, Any] | None,
    extract_projections: bool,
    recorded_version: str,
) -> tuple[dict[str, Any], dict[str, Any]]:
    profile_path = repo_file(PROFILE_REL)
    profile = require_object(read_json(profile_path), "publication evidence profile")
    if profile.get("profileId") != PROFILE_ID:
        raise VerificationError(f"Unexpected publication profile ID {profile.get('profileId')!r}")
    profile_version = require_nonblank(profile.get("version"), "profile.version")
    target_landscape_id = require_nonblank(
        profile.get("targetLandscapeId"), "profile.targetLandscapeId"
    )
    mapping_collections = require_list(
        profile.get("mappingCollections"), "profile.mappingCollections"
    )
    mapping_ids = [
        require_nonblank(item.get("mappingCollectionId"), "mappingCollectionId")
        for item in mapping_collections
        if isinstance(item, dict)
    ]
    if len(mapping_ids) != len(mapping_collections):
        raise VerificationError("Every mapping collection must be an object")
    duplicate_mapping_ids = sorted(
        key for key, count in Counter(mapping_ids).items() if count > 1
    )
    if duplicate_mapping_ids:
        raise VerificationError(f"Duplicate mapping collection IDs {duplicate_mapping_ids!r}")

    preserved_decisions = decision_map(existing)
    existing_projections: dict[str, dict[str, Any]] = {}
    existing_pdf_matches: dict[tuple[str, str], dict[str, Any]] = {}
    if not extract_projections:
        if existing is None:
            raise VerificationError("A normal check requires a committed review ledger")
        for raw_projection in existing.get("extractorEvidence", {}).get("projections", []):
            projection = require_object(raw_projection, "extractorEvidence.projection")
            pdf_sha = require_nonblank(projection.get("sourcePdfSha256"), "sourcePdfSha256")
            if pdf_sha in existing_projections:
                raise VerificationError(f"Duplicate PDF projection binding {pdf_sha}")
            existing_projections[pdf_sha] = projection
        for raw_match in existing.get("pdfProjectionMatchRecords", []):
            match = require_object(raw_match, "pdfProjectionMatchRecords item")
            key = (
                require_nonblank(match.get("mappingCollectionId"), "mappingCollectionId"),
                require_nonblank(match.get("sourceGoalId"), "sourceGoalId"),
            )
            if key in existing_pdf_matches:
                raise VerificationError(f"Duplicate PDF match binding {key!r}")
            existing_pdf_matches[key] = match
    all_goal_evidence: list[dict[str, Any]] = []
    all_carrier_evidence: list[dict[str, Any]] = []
    all_pdf_evidence: list[dict[str, Any]] = []
    all_pending_evidence: list[dict[str, Any]] = []
    collection_work: list[dict[str, Any]] = []
    global_goal_keys: set[tuple[str, str]] = set()
    source_document_reference_count = 0
    all_pdf_paths: set[str] = set()

    for mapping_index, raw_mapping in enumerate(mapping_collections):
        mapping = require_object(raw_mapping, f"mappingCollections[{mapping_index}]")
        collection_id = require_nonblank(
            mapping.get("mappingCollectionId"), f"mappingCollections[{mapping_index}].id"
        )
        extraction_rel = require_nonblank(
            mapping.get("sourceExtractionPath"),
            f"mappingCollections[{mapping_index}].sourceExtractionPath",
        )
        extraction_path = repo_file(extraction_rel)
        extraction = require_object(read_json(extraction_path), extraction_rel)
        extraction_id = require_nonblank(extraction.get("extractionId"), f"{extraction_rel}.extractionId")

        raw_documents = require_list(extraction.get("sourceDocuments"), f"{extraction_rel}.sourceDocuments")
        documents: dict[str, dict[str, Any]] = {}
        document_evidence: list[dict[str, Any]] = []
        for document_index, raw_document in enumerate(raw_documents):
            document = require_object(
                raw_document, f"{extraction_rel}.sourceDocuments[{document_index}]"
            )
            key = require_nonblank(document.get("key"), "sourceDocument.key")
            if key in documents:
                raise VerificationError(f"Duplicate source document key {key!r} in {extraction_rel}")
            pdf_rel = require_nonblank(document.get("path"), f"sourceDocument[{key}].path")
            if Path(pdf_rel).suffix.lower() != ".pdf":
                raise VerificationError(f"Source document is not a PDF: {pdf_rel}")
            pdf_path = repo_file(pdf_rel)
            if document.get("official") is not True:
                raise VerificationError(f"Source document is not marked official: {pdf_rel}")
            pdf_sha = sha256_file(pdf_path)
            documents[key] = document
            document_evidence.append(
                {
                    "sourceDocumentKey": key,
                    "sourcePdfPath": pdf_rel,
                    "sourcePdfBytes": pdf_path.stat().st_size,
                    "sourcePdfSha256": pdf_sha,
                    "official": True,
                }
            )
            all_pdf_paths.add(pdf_rel)
        if not documents:
            raise VerificationError(f"No source documents in {extraction_rel}")
        source_document_reference_count += len(documents)

        raw_passages = require_list(extraction.get("passages"), f"{extraction_rel}.passages")
        passages: dict[str, dict[str, Any]] = {}
        for passage_index, raw_passage in enumerate(raw_passages):
            passage = require_object(raw_passage, f"{extraction_rel}.passages[{passage_index}]")
            passage_id = require_nonblank(passage.get("id"), "passage.id")
            if passage_id in passages:
                raise VerificationError(f"Duplicate passage ID {passage_id!r} in {extraction_rel}")
            passages[passage_id] = passage

        goals = require_list(extraction.get("sourceGoals"), f"{extraction_rel}.sourceGoals")
        collection_goal_evidence: list[dict[str, Any]] = []
        collection_carrier: list[dict[str, Any]] = []
        collection_misses: list[dict[str, Any]] = []
        seen_goal_ids: set[str] = set()
        document_evidence_by_key = {
            item["sourceDocumentKey"]: item for item in document_evidence
        }
        for goal_index, raw_goal in enumerate(goals):
            goal = require_object(raw_goal, f"{extraction_rel}.sourceGoals[{goal_index}]")
            goal_id = require_nonblank(goal.get("id"), "sourceGoal.id")
            if goal_id in seen_goal_ids:
                raise VerificationError(f"Duplicate source goal ID {goal_id!r} in {extraction_rel}")
            seen_goal_ids.add(goal_id)
            global_key = (collection_id, goal_id)
            if global_key in global_goal_keys:
                raise VerificationError(f"Duplicate source-goal identity {global_key!r}")
            global_goal_keys.add(global_key)

            passage_id = require_nonblank(goal.get("passageId"), f"sourceGoal[{goal_id}].passageId")
            if passage_id not in passages:
                raise VerificationError(
                    f"Source goal {global_key!r} references unknown passage {passage_id!r}"
                )
            passage = passages[passage_id]
            source_text = require_nonblank(goal.get("sourceText"), f"sourceGoal[{goal_id}].sourceText")
            normalized_source_text = normalize_text(source_text)
            if not normalized_source_text:
                raise VerificationError(f"Source goal {global_key!r} has empty normalized sourceText")
            document_key = document_key_for_goal(
                goal, passage, documents, f"sourceGoal {global_key!r}"
            )
            document = document_evidence_by_key[document_key]
            carrier_projection = passage_carrier_projection(
                passage, f"passage {passage_id!r}"
            )
            carrier_sha = semantic_digest(carrier_projection)
            goal_evidence = {
                "mappingCollectionId": collection_id,
                "sourceGoalId": goal_id,
                "sourceTextSha256": sha256_bytes(source_text.encode("utf-8")),
                "passageId": passage_id,
                "passageCarrierSha256": carrier_sha,
                "sourceDocumentKey": document_key,
                "sourcePdfPath": document["sourcePdfPath"],
                "sourcePdfSha256": document["sourcePdfSha256"],
            }
            collection_goal_evidence.append(goal_evidence)
            all_goal_evidence.append(goal_evidence)

            matched_field: str | None = None
            match_start: int | None = None
            for field in PASSAGE_CARRIER_FIELDS:
                carrier_value = passage.get(field)
                if isinstance(carrier_value, str):
                    position = normalize_text(carrier_value).find(normalized_source_text)
                    if position >= 0:
                        matched_field = field
                        match_start = position
                        break
            if matched_field is not None:
                evidence = {
                    **goal_evidence,
                    "verificationMethod": "carrier-contiguous-normalized",
                    "carrierField": matched_field,
                    "normalizedMatchStart": match_start,
                }
                collection_carrier.append(evidence)
                all_carrier_evidence.append(evidence)
            else:
                collection_misses.append(
                    {
                        "goal": goal,
                        "sourceText": source_text,
                        "normalizedSourceText": normalized_source_text,
                        "goalEvidence": goal_evidence,
                    }
                )

        collection_work.append(
            {
                "mappingCollectionId": collection_id,
                "sourceExtractionPath": extraction_rel,
                "sourceExtractionSha256": sha256_file(extraction_path),
                "extractionId": extraction_id,
                "passageCount": len(passages),
                "sourceGoalCount": len(goals),
                "sourceGoalSetSha256": semantic_digest(
                    sorted(
                        collection_goal_evidence,
                        key=lambda item: item["sourceGoalId"],
                    )
                ),
                "sourceDocuments": sorted(
                    document_evidence,
                    key=lambda item: (item["sourceDocumentKey"], item["sourcePdfPath"]),
                ),
                "carrierEvidence": collection_carrier,
                "misses": collection_misses,
            }
        )

    candidate_pdf_paths: dict[str, set[str]] = defaultdict(set)
    representative_pdf_paths: dict[str, str] = {}
    for collection in collection_work:
        for miss in collection["misses"]:
            goal_evidence = miss["goalEvidence"]
            sha = goal_evidence["sourcePdfSha256"]
            relative_path = goal_evidence["sourcePdfPath"]
            candidate_pdf_paths[sha].add(relative_path)
            representative_pdf_paths.setdefault(sha, relative_path)

    projections_by_pdf_sha: dict[str, dict[str, Any]] = {}
    projection_text_by_pdf_sha: dict[str, str] = {}
    for pdf_sha in sorted(candidate_pdf_paths):
        representative_rel = representative_pdf_paths[pdf_sha]
        representative_path = repo_file(representative_rel)
        actual_sha = sha256_file(representative_path)
        if actual_sha != pdf_sha:
            raise VerificationError(
                f"Source PDF hash drift for {representative_rel}: {actual_sha} != {pdf_sha}"
            )
        structural_binding = {
            "sourcePdfSha256": pdf_sha,
            "sourcePdfBytes": representative_path.stat().st_size,
            "sourcePdfPaths": sorted(candidate_pdf_paths[pdf_sha]),
        }
        if extract_projections:
            payload = extract_pdf_projection(representative_path)
            decoded = payload.decode("utf-8")
            projection_text_by_pdf_sha[pdf_sha] = decoded[:-1]
            projections_by_pdf_sha[pdf_sha] = {
                **structural_binding,
                "projectionBytes": len(payload),
                "projectionSha256": sha256_bytes(payload),
                "normalizedCharacterCount": len(decoded) - 1,
            }
        else:
            bound = existing_projections.get(pdf_sha)
            if bound is None:
                raise VerificationError(
                    f"Missing PDF projection metadata for source PDF {pdf_sha}"
                )
            expected_binding = {
                **structural_binding,
                "projectionBytes": bound.get("projectionBytes"),
                "projectionSha256": bound.get("projectionSha256"),
                "normalizedCharacterCount": bound.get("normalizedCharacterCount"),
            }
            if bound != expected_binding:
                raise VerificationError(
                    f"PDF projection metadata drift for source PDF {pdf_sha}"
                )
            projections_by_pdf_sha[pdf_sha] = expected_binding

    obsolete_projection_bindings = sorted(
        set(existing_projections) - set(candidate_pdf_paths)
    )
    if not extract_projections and obsolete_projection_bindings:
        raise VerificationError(
            f"Obsolete PDF projection metadata {obsolete_projection_bindings!r}"
        )

    human_records: list[dict[str, Any]] = []
    report_pdf_matches: list[dict[str, Any]] = []
    expected_review_keys: set[tuple[str, str]] = set()
    source_collections: list[dict[str, Any]] = []
    for collection in collection_work:
        collection_pdf: list[dict[str, Any]] = []
        collection_pending: list[dict[str, Any]] = []
        for miss in collection["misses"]:
            goal = miss["goal"]
            goal_evidence = miss["goalEvidence"]
            pdf_sha = goal_evidence["sourcePdfSha256"]
            projection = projections_by_pdf_sha[pdf_sha]
            key = (
                collection["mappingCollectionId"],
                goal_evidence["sourceGoalId"],
            )
            existing_match = existing_pdf_matches.get(key)
            if extract_projections:
                projection_text = projection_text_by_pdf_sha[pdf_sha]
                position = projection_text.find(miss["normalizedSourceText"])
                evidence = (
                    pdf_match_evidence(
                        goal_evidence,
                        projection,
                        miss["normalizedSourceText"],
                        position,
                    )
                    if position >= 0
                    else None
                )
            elif existing_match is not None:
                position = existing_match.get("normalizedMatchStart")
                if not isinstance(position, int):
                    raise VerificationError(f"Invalid PDF match position for {key!r}")
                evidence = pdf_match_evidence(
                    goal_evidence,
                    projection,
                    miss["normalizedSourceText"],
                    position,
                )
                if evidence != existing_match:
                    raise VerificationError(f"PDF match evidence drift for {key!r}")
            else:
                evidence = None

            if evidence is not None:
                collection_pdf.append(evidence)
                all_pdf_evidence.append(evidence)
                report_pdf_matches.append(
                    {
                        **evidence,
                        "sourceText": miss["sourceText"],
                        "sourceRef": goal.get("sourceRef"),
                    }
                )
                continue

            pending_evidence = {
                **goal_evidence,
                "verificationMethod": "pending-human-review",
                "projectionSha256": projection["projectionSha256"],
            }
            collection_pending.append(pending_evidence)
            all_pending_evidence.append(pending_evidence)
            expected_review_keys.add(key)
            record_evidence = {
                "mappingCollectionId": collection["mappingCollectionId"],
                "sourceGoalId": goal_evidence["sourceGoalId"],
                "sourceText": miss["sourceText"],
                "sourceTextSha256": goal_evidence["sourceTextSha256"],
                "passageId": goal_evidence["passageId"],
                "passageCarrierSha256": goal_evidence["passageCarrierSha256"],
                "sourceDocumentKey": goal_evidence["sourceDocumentKey"],
                "sourcePdfPath": goal_evidence["sourcePdfPath"],
                "sourcePdfSha256": goal_evidence["sourcePdfSha256"],
                "sourceRef": goal.get("sourceRef")
                if isinstance(goal.get("sourceRef"), str) and goal.get("sourceRef").strip()
                else None,
                "locator": {
                    "sourcePage": goal.get("sourcePage")
                    if isinstance(goal.get("sourcePage"), int)
                    else None,
                    "sourceLine": goal.get("sourceLine")
                    if isinstance(goal.get("sourceLine"), int)
                    else None,
                },
                "machineDisposition": (
                    "no-contiguous-match-in-authored-carriers-or-bound-pdf-projection"
                ),
            }
            review_evidence_sha256 = semantic_digest(record_evidence)
            human_records.append(
                {
                    **record_evidence,
                    "reviewEvidenceSha256": review_evidence_sha256,
                    "decision": decision_for_evidence(
                        key,
                        preserved_decisions.get(key),
                        review_evidence_sha256,
                    ),
                }
            )

        source_collections.append(
            {
                "mappingCollectionId": collection["mappingCollectionId"],
                "sourceExtractionPath": collection["sourceExtractionPath"],
                "sourceExtractionSha256": collection["sourceExtractionSha256"],
                "extractionId": collection["extractionId"],
                "passageCount": collection["passageCount"],
                "sourceGoalCount": collection["sourceGoalCount"],
                "sourceGoalSetSha256": collection["sourceGoalSetSha256"],
                "sourceDocuments": collection["sourceDocuments"],
                "carrierVerifiedCount": len(collection["carrierEvidence"]),
                "pdfProjectionVerifiedCount": len(collection_pdf),
                "pendingHumanReviewCount": len(collection_pending),
                "carrierEvidenceSetSha256": semantic_digest(
                    sorted(
                        collection["carrierEvidence"],
                        key=lambda item: item["sourceGoalId"],
                    )
                ),
                "pdfMatchEvidenceSetSha256": semantic_digest(
                    sorted(collection_pdf, key=lambda item: item["sourceGoalId"])
                ),
                "pendingEvidenceSetSha256": semantic_digest(
                    sorted(collection_pending, key=lambda item: item["sourceGoalId"])
                ),
            }
        )

    unconsumed_pdf_matches = sorted(
        set(existing_pdf_matches)
        - {(item["mappingCollectionId"], item["sourceGoalId"]) for item in all_pdf_evidence}
    )
    if not extract_projections and unconsumed_pdf_matches:
        raise VerificationError(
            f"Obsolete or invalid PDF match records {unconsumed_pdf_matches[:5]!r}"
        )

    obsolete_completed_decisions = sorted(
        key
        for key in set(preserved_decisions) - expected_review_keys
        if preserved_decisions[key]["decision"].get("status") != PENDING_STATUS
    )
    if obsolete_completed_decisions:
        raise VerificationError(
            "Completed human-review rows became obsolete; inspect source drift before "
            f"regeneration: {obsolete_completed_decisions[:5]!r}"
        )

    human_records.sort(key=lambda item: (item["mappingCollectionId"], item["sourceGoalId"]))
    source_collections.sort(key=lambda item: item["mappingCollectionId"])
    all_goal_evidence.sort(key=lambda item: (item["mappingCollectionId"], item["sourceGoalId"]))
    all_carrier_evidence.sort(key=lambda item: (item["mappingCollectionId"], item["sourceGoalId"]))
    all_pdf_evidence.sort(key=lambda item: (item["mappingCollectionId"], item["sourceGoalId"]))
    all_pending_evidence.sort(key=lambda item: (item["mappingCollectionId"], item["sourceGoalId"]))

    statuses = Counter(record["decision"]["status"] for record in human_records)
    completed_count = sum(statuses[status] for status in COMPLETED_STATUSES)
    accepted_count = sum(statuses[status] for status in ACCEPTED_STATUSES)
    rejected_count = statuses["rejected"]
    pending_count = statuses[PENDING_STATUS]
    machine_count = len(all_carrier_evidence) + len(all_pdf_evidence)
    fully_verified = pending_count == 0 and rejected_count == 0

    review = {
        "$schema": SCHEMA_ID,
        "reviewFormatVersion": "1.0",
        "reviewId": REVIEW_ID,
        "scope": {
            "packageId": PACKAGE_ID,
            "targetLandscapeId": target_landscape_id,
            "publicationEvidenceProfileId": PROFILE_ID,
            "publicationEvidenceProfileVersion": profile_version,
            "publicationEvidenceProfilePath": PROFILE_REL,
            "publicationEvidenceProfileSha256": sha256_file(profile_path),
            "sourceGoalIdentity": SOURCE_GOAL_IDENTITY,
        },
        "verificationPolicy": {
            "unicodeNormalization": "NFC",
            "whitespaceNormalization": (
                "collapse-each-unicode-whitespace-run-to-U+0020-and-trim"
            ),
            "sourceTextField": "sourceText",
            "passageCarrierFields": list(PASSAGE_CARRIER_FIELDS),
            "matchMode": "case-sensitive-contiguous-substring-after-normalization",
            "carrierPrecedence": "first-matching-field-in-policy-order",
            "pdfFallback": "only-after-no-authored-passage-carrier-match",
            "machineMatchesAreHumanApprovals": False,
            "evidenceBoundary": (
                "PDF matches are recorded only as hashes, sizes and match positions from an "
                "ephemeral deterministic pdftotext projection; extracted PDF text is never "
                "committed. Source-PDF bytes and projection metadata are hash-bound. A normal "
                "check proves ledger consistency, while replaying extraction is required to "
                "independently prove the PDF match. A matching projection is machine "
                "provenance evidence, not a human assertion that sourceText is an exact legal "
                "quotation."
            ),
        },
        "extractorEvidence": {
            "extractor": "pdftotext",
            "recordedVersion": recorded_version,
            "invocation": list(PDF_INVOCATION),
            "projectionFormat": (
                "Ephemeral UTF-8 bytes; NFC; each Unicode whitespace run collapsed to U+0020; "
                "trimmed; one trailing LF; only byte count, character count and SHA-256 are "
                "committed"
            ),
            "replayPolicy": (
                "No extracted PDF text is committed. A normal check validates source-PDF "
                "bytes, projection metadata and ledger consistency but cannot independently "
                "prove PDF matches. --replay-pdf-evidence reruns the recorded invocation in "
                "memory and requires identical projection hashes, sizes and match records; "
                "the replay version is reported but need not equal the recorded version."
            ),
            "projections": [projections_by_pdf_sha[key] for key in sorted(projections_by_pdf_sha)],
        },
        "sourceCollections": source_collections,
        "machineVerification": {
            "sourceCollectionCount": len(source_collections),
            "sourceExtractionCount": len(source_collections),
            "sourceDocumentReferenceCount": source_document_reference_count,
            "uniqueSourcePdfPathCount": len(all_pdf_paths),
            "sourceGoalCount": len(all_goal_evidence),
            "carrierVerifiedCount": len(all_carrier_evidence),
            "pdfProjectionVerifiedCount": len(all_pdf_evidence),
            "pendingHumanReviewCount": len(all_pending_evidence),
            "automaticHumanApprovalCount": 0,
            "sourceGoalSetSha256": semantic_digest(all_goal_evidence),
            "carrierEvidenceSetSha256": semantic_digest(all_carrier_evidence),
            "pdfMatchEvidenceSetSha256": semantic_digest(all_pdf_evidence),
            "pendingEvidenceSetSha256": semantic_digest(all_pending_evidence),
        },
        "pdfProjectionMatchRecords": all_pdf_evidence,
        "humanReviewRecords": human_records,
        "summary": {
            "machineVerifiedCount": machine_count,
            "humanReviewRecordCount": len(human_records),
            "pendingHumanReviewCount": pending_count,
            "completedHumanReviewCount": completed_count,
            "acceptedHumanReviewCount": accepted_count,
            "rejectedHumanReviewCount": rejected_count,
            "fullyVerified": fully_verified,
            "humanReviewRequired": pending_count > 0,
        },
    }

    context = {
        "pdfMatches": sorted(
            report_pdf_matches,
            key=lambda item: (item["mappingCollectionId"], item["sourceGoalId"]),
        ),
    }
    return review, context


def render_report(review: dict[str, Any], context: dict[str, Any]) -> str:
    machine = review["machineVerification"]
    summary = review["summary"]
    scope = review["scope"]
    status = "Menschliche Reviews offen" if summary["humanReviewRequired"] else "Vollständig geprüft"
    lines = [
        "# Source-Verification Mathematik-Pilot",
        "",
        "> Generated artifact. Do not edit manually.",
        ">",
        "> Generated by: `scripts/generate_curriculum_source_verification_review.py`",
        "> Regenerate with: `python3 -B scripts/generate_curriculum_source_verification_review.py --update`",
        "> Source of truth: `curricula/DE/Gymnasium/quality/source-verification/de-gymnasium-mathematik-v1.review.json`",
        "> Source of truth: `contracts/curriculum-package/v1/profiles/de-gymnasium-mathematik-publication-evidence-v1.profile.json`",
        "> Source of truth: `curricula/DE/Gymnasium/input/`",
        "",
        f"**Status:** {status}",
        "",
        "Die maschinelle Prüfung weist nur zusammenhängende Texttreffer nach. Sie ist "
        "keine menschliche Freigabe und keine Aussage darüber, ob ein Text rechtlich als "
        "wörtliches Zitat behandelt werden darf.",
        "",
        "## Ergebnis",
        "",
        "| Prüfschritt | Anzahl | Einordnung |",
        "| --- | ---: | --- |",
        f"| Source-Ziele gesamt | {machine['sourceGoalCount']} | 31 gebundene Source-Extraction-Dateien |",
        f"| Treffer in authored Passage-Carriern | {machine['carrierVerifiedCount']} | automatisch, keine Human-Freigabe |",
        f"| zusätzliche Treffer in gebundener PDF-Projektion | {machine['pdfProjectionVerifiedCount']} | automatisch, keine Human-Freigabe |",
        f"| offene Human-Reviews | {summary['pendingHumanReviewCount']} | fachlich am Original prüfen |",
        f"| abgeschlossene Human-Reviews | {summary['completedHumanReviewCount']} | davon akzeptiert: {summary['acceptedHumanReviewCount']}, abgelehnt: {summary['rejectedHumanReviewCount']} |",
        "",
        "## Offene Reviews nach Collection",
        "",
        "| Mapping-Collection | Source-Ziele | Carrier | PDF-Projektion | Offen |",
        "| --- | ---: | ---: | ---: | ---: |",
    ]
    open_collections = [
        item for item in review["sourceCollections"] if item["pendingHumanReviewCount"] > 0
    ]
    for item in open_collections:
        lines.append(
            f"| `{item['mappingCollectionId']}` | {item['sourceGoalCount']} | "
            f"{item['carrierVerifiedCount']} | {item['pdfProjectionVerifiedCount']} | "
            f"{item['pendingHumanReviewCount']} |"
        )
    zero_collection_count = len(review["sourceCollections"]) - len(open_collections)
    lines.extend(
        [
            "",
            f"Weitere {zero_collection_count} Collections haben keine offenen Source-Text-Reviews.",
            "",
            "## Offene Reviews nach Quelldokument",
            "",
            "| PDF | Offen |",
            "| --- | ---: |",
        ]
    )
    pending_by_pdf = Counter(
        item["sourcePdfPath"]
        for item in review["humanReviewRecords"]
        if item["decision"]["status"] == PENDING_STATUS
    )
    for path, count in sorted(pending_by_pdf.items()):
        lines.append(f"| `{path}` | {count} |")

    lines.extend(
        [
            "",
            "## Fünf zusätzliche PDF-Projektions-Treffer",
            "",
            "Diese Treffer lagen nicht zusammenhängend in den authored Passage-Carriern, "
            "wohl aber in der bei `--update` nur im Speicher erzeugten "
            "`pdftotext -layout`-Projektion. Committed werden ausschließlich Hash, Größe, "
            "Trefferposition und SourceGoal-/SourceText-Bindung – kein extrahierter PDF-Text.",
            "",
            "| Collection | SourceGoal | SourceText | PDF |",
            "| --- | --- | --- | --- |",
        ]
    )
    for item in context["pdfMatches"]:
        escaped_text = item["sourceText"].replace("|", "\\|").replace("\n", " ")
        lines.append(
            f"| `{item['mappingCollectionId']}` | `{item['sourceGoalId']}` | "
            f"{escaped_text} | `{item['sourcePdfPath']}` |"
        )

    lines.extend(
        [
            "",
            "## Was Menschen prüfen müssen",
            "",
            "Jeder Datensatz in `humanReviewRecords` des Ledgers benötigt eine bewusste "
            "Entscheidung am gebundenen Originaldokument:",
            "",
            "- `verified-verbatim`: Der Text ist am Original als wörtlicher Wortlaut bestätigt.",
            "- `verified-normalized-transcription`: Nur dokumentierte typografische oder "
            "Extraktionsnormalisierung war nötig.",
            "- `reviewed-paraphrase`: Der Eintrag ist fachlich eine Paraphrase und darf nicht "
            "als wörtlicher Originaltext ausgegeben werden.",
            "- `rejected`: Der Eintrag ist falsch oder nicht ausreichend belegbar.",
            "",
            "Reviewer, Zeitstempel und Begründung sind für jede abgeschlossene Entscheidung "
            "Pflicht. Automatische Treffer werden dabei nicht in Human-Freigaben umgedeutet.",
            "",
            "## Evidenzbindung und technische Grenze",
            "",
            f"- Profil: `{scope['publicationEvidenceProfilePath']}` "
            f"(`{scope['publicationEvidenceProfileSha256']}`)",
            f"- Source-Extraction-Dateien: {machine['sourceExtractionCount']}",
            f"- Source-Dokument-Referenzen: {machine['sourceDocumentReferenceCount']} "
            f"auf {machine['uniqueSourcePdfPathCount']} unterschiedliche PDF-Pfade",
            f"- PDF-Projektions-Metadatensätze: {len(review['extractorEvidence']['projections'])}",
            f"- aufgezeichnetes Werkzeug: `{review['extractorEvidence']['recordedVersion']}`",
            "- normaler Check: prüft Profil-, Extraction-, SourceGoal-, Passage-Carrier-, "
            "PDF-, Projektionsmetadaten- und Ledgerkonsistenz; er behauptet ausdrücklich "
            "keinen unabhängigen Nachweis der fünf PDF-Treffer",
            "- Replay-Check: `python scripts/generate_curriculum_source_verification_review.py "
            "--check --replay-pdf-evidence` erzeugt alle Projektionen nur im Speicher erneut "
            "und verlangt gleiche Hashes, Größen, Treffer und Reviewqueue",
            "",
            "Es werden keine vollständigen `pdftotext`-Ausgaben amtlicher PDFs versioniert. "
            "Die kryptografische Metadatenbindung allein beweist weder den PDF-Treffer noch, "
            "dass ein PDF-Extractor semantisch korrekt gelesen hat. Der Replay-Check beweist "
            "die technische Reproduzierbarkeit; unklare Fälle bleiben trotzdem in der "
            "menschlichen Reviewqueue.",
            "",
        ]
    )
    return "\n".join(lines)


def compare_review(actual: dict[str, Any], expected: dict[str, Any]) -> list[str]:
    diagnostics = schema_diagnostics(actual)
    diagnostics.extend(validate_unique_ledger_keys(actual))
    actual_keys = Counter(
        (item.get("mappingCollectionId"), item.get("sourceGoalId"))
        for item in actual.get("humanReviewRecords", [])
        if isinstance(item, dict)
    )
    expected_keys = Counter(
        (item["mappingCollectionId"], item["sourceGoalId"])
        for item in expected["humanReviewRecords"]
    )
    missing = sorted((expected_keys - actual_keys).elements())
    obsolete = sorted((actual_keys - expected_keys).elements())
    if missing:
        diagnostics.append(f"MISSING_REVIEW_ROWS {missing[:5]!r} (total {len(missing)})")
    if obsolete:
        diagnostics.append(f"OBSOLETE_REVIEW_ROWS {obsolete[:5]!r} (total {len(obsolete)})")
    if canonical_json_bytes(actual) != canonical_json_bytes(expected):
        diagnostics.append("LEDGER_DRIFT generated review differs from trusted inputs")
    return diagnostics


def replay_pdf_evidence(review: dict[str, Any]) -> str:
    current_version = pdftotext_version()
    replayed, _ = build_review(
        existing=review,
        extract_projections=True,
        recorded_version=review["extractorEvidence"]["recordedVersion"],
    )
    if canonical_json_bytes(replayed) != canonical_json_bytes(review):
        raise VerificationError(
            "PDF evidence replay changed projection hashes, sizes, match records or queue"
        )
    return current_version


def self_test(expected: dict[str, Any]) -> None:
    try:
        json.loads(
            '{"sourcePdfBytes":{"type":"integer","type":"number"}}',
            object_pairs_hook=duplicate_safe_object,
        )
    except VerificationError:
        pass
    else:
        raise VerificationError("Self-test failed to reject a duplicate raw JSON key")

    stale_completed = {
        "decision": {
            "status": "verified-verbatim",
            "reviewer": "self-test",
            "reviewedAt": "2026-01-01T00:00:00Z",
            "rationale": "self-test",
            "verifiedSourceText": "self-test",
        },
        "reviewEvidenceSha256": "sha256:" + "1" * 64,
    }
    try:
        decision_for_evidence(
            ("self-test-collection", "self-test-goal"),
            stale_completed,
            "sha256:" + "2" * 64,
        )
    except VerificationError:
        pass
    else:
        raise VerificationError("Self-test failed to reject a stale completed review")

    def assert_detected(name: str, mutated: dict[str, Any]) -> None:
        if not compare_review(mutated, expected):
            raise VerificationError(f"Self-test failed to detect {name}")

    duplicate = copy.deepcopy(expected)
    duplicate["humanReviewRecords"].append(copy.deepcopy(duplicate["humanReviewRecords"][0]))
    assert_detected("duplicate human-review row", duplicate)

    missing = copy.deepcopy(expected)
    missing["humanReviewRecords"].pop()
    assert_detected("missing human-review row", missing)

    obsolete = copy.deepcopy(expected)
    fabricated = copy.deepcopy(obsolete["humanReviewRecords"][0])
    fabricated["sourceGoalId"] += "-obsolete"
    obsolete["humanReviewRecords"].append(fabricated)
    assert_detected("obsolete human-review row", obsolete)

    false_claim = copy.deepcopy(expected)
    false_claim["machineVerification"]["carrierVerifiedCount"] += 1
    assert_detected("false automatic claim", false_claim)

    text_drift = copy.deepcopy(expected)
    text_drift["humanReviewRecords"][0]["sourceTextSha256"] = "sha256:" + "0" * 64
    assert_detected("source-text hash drift", text_drift)

    pdf_drift = copy.deepcopy(expected)
    pdf_drift["sourceCollections"][0]["sourceDocuments"][0]["sourcePdfSha256"] = (
        "sha256:" + "0" * 64
    )
    assert_detected("PDF hash drift", pdf_drift)

    carrier_drift = copy.deepcopy(expected)
    carrier_drift["sourceCollections"][0]["carrierEvidenceSetSha256"] = (
        "sha256:" + "0" * 64
    )
    assert_detected("passage-carrier evidence drift", carrier_drift)

    projection_drift = copy.deepcopy(expected)
    projection_drift["extractorEvidence"]["projections"][0]["projectionSha256"] = (
        "sha256:" + "0" * 64
    )
    assert_detected("projection hash drift", projection_drift)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--update", action="store_true", help="regenerate evidence, ledger, report")
    mode.add_argument("--check", action="store_true", help="verify committed evidence and outputs")
    mode.add_argument("--self-test", action="store_true", help="run fail-closed mutation tests")
    parser.add_argument(
        "--replay-pdf-evidence",
        action="store_true",
        help="rerun pdftotext in memory and require identical hashes and match records",
    )
    parser.add_argument(
        "--ledger",
        default=LEDGER_REL,
        help="repository-relative source-verification ledger path",
    )
    parser.add_argument(
        "--report",
        default=REPORT_REL,
        help="repository-relative generated Markdown report path",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    ledger_path = output_path(args.ledger)
    report_path = output_path(args.report)
    existing: dict[str, Any] | None = None
    if ledger_path.exists():
        existing = require_object(read_json(ledger_path), "source verification ledger")
        diagnostics = validate_unique_ledger_keys(existing)
        if not args.update:
            diagnostics = schema_diagnostics(existing) + diagnostics
        if diagnostics:
            raise VerificationError("Existing ledger is invalid:\n" + "\n".join(diagnostics))

    if args.update:
        version = pdftotext_version()
        review, context = build_review(
            existing=existing,
            extract_projections=True,
            recorded_version=version,
        )
        diagnostics = schema_diagnostics(review) + validate_unique_ledger_keys(review)
        if diagnostics:
            raise VerificationError("Generated ledger is invalid:\n" + "\n".join(diagnostics))
        report = render_report(review, context)
        atomic_write(
            ledger_path,
            json.dumps(review, ensure_ascii=False, indent=2, allow_nan=False).encode("utf-8")
            + b"\n",
        )
        atomic_write(report_path, report.encode("utf-8"))
        print(
            "updated source verification: "
            f"goals={review['machineVerification']['sourceGoalCount']} "
            f"carrier={review['machineVerification']['carrierVerifiedCount']} "
            f"pdf={review['machineVerification']['pdfProjectionVerifiedCount']} "
            f"pending={review['summary']['pendingHumanReviewCount']}"
        )
        return 0

    if existing is None:
        raise VerificationError(f"Missing ledger {args.ledger}; run --update")
    recorded_version = require_nonblank(
        existing.get("extractorEvidence", {}).get("recordedVersion"),
        "extractorEvidence.recordedVersion",
    )
    expected, context = build_review(
        existing=existing,
        extract_projections=False,
        recorded_version=recorded_version,
    )
    diagnostics = compare_review(existing, expected)
    expected_report = render_report(expected, context).encode("utf-8")
    try:
        actual_report = report_path.read_bytes()
    except OSError as error:
        diagnostics.append(f"REPORT_MISSING {error}")
    else:
        if actual_report != expected_report:
            diagnostics.append("REPORT_DRIFT generated Markdown status is stale")
    if diagnostics:
        raise VerificationError("Source verification check failed:\n" + "\n".join(diagnostics))

    if args.self_test:
        self_test(expected)
        print(
            "source-verification self-test passed "
            "(8 fail-closed mutations, duplicate raw JSON key and stale completed review "
            "detected)"
        )
    else:
        print(
            "source verification check passed: "
            f"goals={expected['machineVerification']['sourceGoalCount']} "
            f"carrier={expected['machineVerification']['carrierVerifiedCount']} "
            f"pdf={expected['machineVerification']['pdfProjectionVerifiedCount']} "
            f"pending={expected['summary']['pendingHumanReviewCount']}"
        )
    if args.replay_pdf_evidence:
        replay_version = replay_pdf_evidence(expected)
        print(
            "PDF evidence replay passed: "
            f"projections={len(expected['extractorEvidence']['projections'])} "
            f"replayVersion={replay_version!r}"
        )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except VerificationError as error:
        print(f"ERROR: {error}", file=sys.stderr)
        raise SystemExit(1)
