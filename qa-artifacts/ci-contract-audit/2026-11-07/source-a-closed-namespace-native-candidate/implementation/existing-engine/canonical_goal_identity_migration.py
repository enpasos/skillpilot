#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Generate/verify an unapplied canonical-ID bijection and exact inverse proof.

No apply operation exists. Git source objects, historical evidence, asset/card
bytes, learner state and timestamps are never written. The only optional write
is the explicitly selected proposal JSON. Undeclared hits fail closed.
"""

import argparse
import copy
import hashlib
import json
import posixpath
import re
import subprocess
import sys
import tempfile
import uuid
from collections import defaultdict
from decimal import Decimal
from pathlib import Path

BASE_COMMIT = "212eebd39a28afba212551efd773633fd55d6338"
MIGRATION_ID = "canonical-goal-id-format-2026-11-06"
NAMESPACE = uuid.UUID("97d8c00c-411d-5dec-b260-4e6f22ab688b")
REGISTRY_PATH = "contracts/canonical-goal-identity/v1/reference-fields.json"
REGISTRY_SCHEMA_PATH = "contracts/canonical-goal-identity/v1/reference-fields.schema.json"
SCHEMA_PATH = "contracts/canonical-goal-identity/v1/migration.schema.json"
CANONICAL_PROFILE_PATH = "contracts/canonical-goal-identity/v1/canonical-json-profile.json"
UUID_PATTERN = re.compile(r"[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\Z")


class ContractError(ValueError):
    pass


def require(condition, message):
    if not condition:
        raise ContractError(message)


def parse_json(raw):
    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, "Duplicate JSON object property: " + key)
            result[key] = value
        return result

    def invalid_constant(value):
        raise ContractError("Nonfinite JSON number: " + value)

    return json.loads(raw, parse_float=Decimal, object_pairs_hook=unique_object, parse_constant=invalid_constant)


def stable(value):
    """skillpilot-canonical-json-decimal-v1; mirrored by the independent loader."""
    def encode(nested):
        if nested is None:
            return "null"
        if isinstance(nested, bool):
            return "true" if nested else "false"
        if isinstance(nested, str):
            return json.dumps(nested, ensure_ascii=False)
        if isinstance(nested, int):
            return str(nested)
        if isinstance(nested, (Decimal, float)):
            number = nested if isinstance(nested, Decimal) else Decimal(str(nested))
            require(number.is_finite(), "Nonfinite canonical JSON number")
            if number == 0:
                return "0"
            result = format(number, "f")
            return result.rstrip("0").rstrip(".") if "." in result else result
        if isinstance(nested, list):
            return "[" + ",".join(encode(child) for child in nested) + "]"
        require(isinstance(nested, dict) and all(isinstance(key, str) for key in nested), "Unsupported canonical JSON value")
        return "{" + ",".join(encode(key) + ":" + encode(nested[key]) for key in sorted(nested)) + "}"

    try:
        return encode(value).encode("utf-8")
    except UnicodeEncodeError as error:
        raise ContractError("Unpaired Unicode surrogate in canonical JSON") from error


def digest(raw):
    return hashlib.sha256(raw).hexdigest()


def pointer_token(value):
    return str(value).replace("~", "~0").replace("/", "~1")


def pointer_parts(pointer):
    require(pointer.startswith("/"), "Expected a non-root JSON pointer")
    return [part.replace("~1", "/").replace("~0", "~") for part in pointer[1:].split("/")]


def pointer_parent(document, pointer):
    parts = pointer_parts(pointer)
    value = document
    for part in parts[:-1]:
        value = value[int(part)] if isinstance(value, list) else value[part]
    return value, parts[-1]


def pointer_matches(pattern, pointer):
    left, right = pattern.strip("/").split("/"), pointer.strip("/").split("/")

    def match(i, j):
        if i == len(left):
            return j == len(right)
        if left[i] == "**":
            return any(match(i + 1, end) for end in range(j, len(right) + 1))
        return j < len(right) and (left[i] == "*" or left[i] == right[j]) and match(i + 1, j + 1)

    return match(0, 0)


def string_fields(value, pointer=""):
    if isinstance(value, dict):
        for key, child in value.items():
            target = pointer + "/" + pointer_token(key)
            yield target, key, True
            yield from string_fields(child, target)
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from string_fields(child, pointer + "/" + str(index))
    elif isinstance(value, str):
        yield pointer, value, False


class GitSnapshot:
    def __init__(self, repo_root, commit):
        self.root, self.commit = Path(repo_root), commit
        require(re.fullmatch(r"[0-9a-f]{40}", commit), "Base must be an exact Git commit")
        raw = subprocess.run(["git", "-C", str(self.root), "ls-tree", "-rz", commit],
                             check=True, capture_output=True).stdout
        self.entries = {}
        for row in raw.split(b"\0"):
            if not row:
                continue
            header, path = row.split(b"\t", 1)
            mode, kind, oid = header.decode().split(" ")
            if kind == "blob":
                self.entries[path.decode()] = (mode, oid)
        self.batch = subprocess.Popen(["git", "-C", str(self.root), "cat-file", "--batch"],
                                      stdin=subprocess.PIPE, stdout=subprocess.PIPE)

    def close(self):
        self.batch.stdin.close()
        self.batch.stdout.close()
        self.batch.wait()

    def read(self, path, seen=None):
        seen = set() if seen is None else seen
        require(path in self.entries and path not in seen, "Missing or cyclic Git path: " + path)
        seen.add(path)
        mode, oid = self.entries[path]
        self.batch.stdin.write((oid + "\n").encode())
        self.batch.stdin.flush()
        header = self.batch.stdout.readline().decode().strip().split(" ")
        require(len(header) == 3 and header[1] == "blob", "Git object is not a blob: " + path)
        raw = self.batch.stdout.read(int(header[2]))
        require(self.batch.stdout.read(1) == b"\n", "Invalid Git batch framing")
        if mode == "120000":
            target = posixpath.normpath(posixpath.join(posixpath.dirname(path), raw.decode()))
            require(not target.startswith("../") and not target.startswith("/"), "External symlink is not a catalog input")
            return self.read(target, seen)
        return raw

    def matching_paths(self, source_ids):
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8") as patterns:
            patterns.write("\n".join(sorted(source_ids)) + "\n")
            patterns.flush()
            result = subprocess.run(["git", "-C", str(self.root), "grep", "--null", "-I", "-l", "-F",
                                     "-f", patterns.name, self.commit, "--", "."], capture_output=True)
        require(result.returncode in (0, 1), "Git hit inventory failed")
        prefix = (self.commit + ":").encode()
        paths = set()
        for row in result.stdout.split(b"\0"):
            if row:
                require(row.startswith(prefix), "Unexpected Git grep record")
                paths.add(row[len(prefix):].decode())
        matcher = re.compile("|".join(map(re.escape, source_ids)))
        paths.update(path for path in self.entries if matcher.search(path))
        return sorted(paths)


def load_catalog(snapshot):
    catalog, source_files = {}, []
    for path in sorted(snapshot.entries):
        if not path.startswith("curricula/") or "/quality/" in path or not path.endswith(".json"):
            continue
        raw = snapshot.read(path)
        try:
            document = parse_json(raw)
        except (ValueError, UnicodeDecodeError):
            continue
        if not isinstance(document, dict) or not isinstance(document.get("landscapeId"), str) or not isinstance(document.get("goals"), list):
            continue
        catalog[path] = document
        source_files.append({"path": path, "sha256": digest(raw), "landscapeId": document["landscapeId"],
                             "goalCount": len(document["goals"]), "gitMode": snapshot.entries[path][0]})
    return catalog, source_files


def identity_index(catalog):
    owners, keys = defaultdict(set), set()
    for document in catalog.values():
        owner = document["landscapeId"]
        for goal in document["goals"]:
            require(isinstance(goal.get("id"), str) and goal["id"], "Invalid source goal identity")
            owners[goal["id"]].add(owner)
            keys.add((owner, goal["id"]))
    return owners, keys


def resolve_reference(raw, owner, owners, keys):
    require(isinstance(raw, str) and raw, "Non-string or empty endpoint")
    if ":" in raw:
        parts = raw.split(":")
        require(len(parts) == 2 and all(parts), "Malformed qualified endpoint: " + raw)
        key = tuple(parts)
    elif owner is not None:
        if (owner, raw) in keys:
            key = owner, raw
        else:
            require(any(pair[0] == owner for pair in keys), "Unknown explicit landscape owner: " + owner)
            matches = owners.get(raw, set())
            require(len(matches) == 1, "Dangling or ambiguous foreign endpoint: " + raw)
            key = next(iter(matches)), raw
    else:
        matches = owners.get(raw, set())
        require(len(matches) == 1, "Dangling or ambiguous owner: " + raw)
        key = next(iter(matches)), raw
    require(key in keys, "Dangling exact endpoint: " + raw)
    return key


def build_bijection(catalog, migration_id=MIGRATION_ID, namespace=NAMESPACE):
    owners, keys = identity_index(catalog)
    invalid = sorted(pair for pair in keys if not UUID_PATTERN.fullmatch(pair[1]))
    existing_ids = {str(uuid.UUID(goal_id)) if UUID_PATTERN.fullmatch(goal_id) else goal_id for goal_id in owners}
    targets, rules = set(), []
    for owner, old in invalid:
        name = stable([migration_id, owner, old]).decode()
        target = str(uuid.uuid5(namespace, name))
        require(target not in existing_ids, "Target collision with existing global identity: " + target)
        require(target not in targets, "Non-injective UUID derivation")
        targets.add(target)
        definitions = [(path, index, goal) for path, document in catalog.items()
                       if document["landscapeId"] == owner
                       for index, goal in enumerate(document["goals"]) if goal["id"] == old]
        require(len(definitions) == 1, "Migration source must have one exact serialized definition")
        path, index, goal = definitions[0]
        rules.append({"landscapeId": owner, "sourceGoalId": old, "targetGoalId": target,
                      "relation": "renamed", "masteryPolicy": "copy-exact",
                      "historyPolicy": "preserve-original-and-add-alias", "sourceFile": path,
                      "sourcePointer": "/goals/" + str(index), "beforeGoalSha256": digest(stable(goal))})
    return rules


def document_class(path, is_graph=False):
    if is_graph:
        return "runtime-graph", "active"
    if path.startswith("curricula/DE/Gymnasium/composition-views/") or path.startswith("app/scripts/config/goal-books/navigation/"):
        return "composition", "active"
    if path.startswith("curricula/DE/Gymnasium/mapping/"):
        return "mapping", "active"
    if path == "curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json":
        return "provenance-registry", "active"
    if path == "app/scripts/config/math-duration-split-spanning-tree-policy.json":
        return "duration-policy", "active"
    if re.fullmatch(r"curricula/DE/Gymnasium/quality/(?:semantic-atomicity|memory-card-review)/[^/]+\.config\.json", path):
        return "qa-scope-config", "active"
    return None, None


def nearest_owner(document, pointer, owner_fields):
    value, found = document, None
    if isinstance(value, dict):
        found = next((value[field] for field in owner_fields if isinstance(value.get(field), str)), None)
    for part in pointer_parts(pointer)[:-1]:
        value = value[int(part)] if isinstance(value, list) else value[part]
        if isinstance(value, dict):
            candidate = next((value[field] for field in owner_fields if isinstance(value.get(field), str)), None)
            if candidate is not None:
                found = candidate
    return found


def set_field(document, field, forward=True):
    parent, token = pointer_parent(document, field["pointer"])
    before, after = (field["before"], field["after"]) if forward else (field["after"], field["before"])
    if field["kind"] == "key":
        require(isinstance(parent, dict) and before in parent and after not in parent, "Key rename collision/missing origin")
        parent[after] = parent.pop(before)
    else:
        current = parent[int(token)] if isinstance(parent, list) else parent[token]
        require(current == before, "Exact field endpoint differs at " + field["pointer"])
        if isinstance(parent, list):
            parent[int(token)] = after
        else:
            parent[token] = after


def inverse_proof(original, candidate, fields):
    restored = copy.deepcopy(candidate)
    for field in reversed(fields):
        # A property-key rename changes its own last pointer segment only.
        inverse = dict(field)
        if field["kind"] == "key":
            inverse["pointer"] = field["pointer"].rsplit("/", 1)[0] + "/" + pointer_token(field["after"])
        set_field(restored, inverse, False)
    require(stable(restored) == stable(original), "Inverse rename changed semantic/source/timestamp payload")
    return digest(stable(restored))


def transform_document(document, kind, registry, renamed, owners, keys, matcher):
    candidate, fields, preserved, blockers = copy.deepcopy(document), [], [], []
    for pointer, value, is_key in string_fields(document):
        hits = sorted(set(matcher.findall(value)))
        if not hits:
            continue
        declarations = [rule for rule in registry["activeFields"]
                        if rule["class"] == kind and pointer_matches(rule["pointer"], pointer)
                        and (rule["role"] == "reference-key") == is_key]
        preserved_rules = [rule for rule in registry["preservedActiveFields"]
                           if rule["class"] == kind and pointer_matches(rule["pointer"], pointer)]
        if preserved_rules and not declarations:
            preserved.append({"pointer": pointer, "kind": "key" if is_key else "value", "matchedSourceGoalIds": hits,
                              "reason": preserved_rules[0]["reason"]})
            continue
        if len(declarations) != 1:
            blockers.append({"pointer": pointer, "reason": "Unclassified or overlapping active identity hit", "value": value})
            continue
        declaration = declarations[0]
        try:
            owner = nearest_owner(document, pointer, registry["ownerFields"])
            if declaration["role"] == "identity":
                require(owner is not None and (owner, value) in keys, "Identity owner mismatch")
                key = owner, value
            else:
                key = resolve_reference(value, owner, owners, keys)
                if kind in ("mapping", "provenance-registry", "qa-scope-config") and owner is not None:
                    require(key[0] == owner, "Endpoint conflicts with declared canonical document owner")
            require(key in renamed, "Declared hit is not an exact migration endpoint")
            target = renamed[key]
            after = key[0] + ":" + target if ":" in value else target
            fields.append({"pointer": pointer, "kind": "key" if is_key else "value", "role": declaration["role"],
                           "landscapeId": key[0], "before": value, "after": after})
        except ContractError as error:
            blockers.append({"pointer": pointer, "reason": str(error), "value": value})
    for field in fields:
        set_field(candidate, field)
    inverse_hash = inverse_proof(document, candidate, fields)
    return candidate, fields, preserved, blockers, inverse_hash


def validate_graph_references(catalog):
    owners, keys = identity_index(catalog)
    count = 0
    for document in catalog.values():
        owner = document["landscapeId"]
        for goal in document["goals"]:
            for relation in ("contains", "requires"):
                refs = goal.get(relation, [])
                require(isinstance(refs, list), "Non-array catalog relation")
                for raw in refs:
                    resolve_reference(raw, owner, owners, keys)
                    count += 1
    return count


def verify_accepted_bindings(manifest, manifest_raw, expected_base, accepted_digest):
    require(isinstance(expected_base, str) and re.fullmatch(r"[0-9a-f]{40}", expected_base), "Missing independent accepted base")
    require(isinstance(accepted_digest, str) and re.fullmatch(r"[0-9a-f]{64}", accepted_digest), "Missing independent manifest digest")
    require(manifest["baseCommit"] == expected_base, "Stale proof base does not match accepted snapshot")
    require(digest(manifest_raw) == accepted_digest, "Manifest bytes do not match independently accepted digest")


def verify_candidate_catalog_sources(candidate_root, manifest):
    projected = {document["path"]: document for document in manifest["documents"]
                 if document["handling"] == "explicit-pointer-projection"}
    for source in manifest["catalog"]["sourceFiles"]:
        raw = (Path(candidate_root) / source["path"]).read_bytes()
        if source["path"] in projected:
            require(digest(stable(parse_json(raw))) == projected[source["path"]]["hypotheticalCanonicalSha256"],
                    "Candidate catalog semantic delta: " + source["path"])
        else:
            require(digest(raw) == source["sha256"], "Untouched catalog source changed: " + source["path"])


def generate(repo_root, commit=BASE_COMMIT):
    require(re.fullmatch(r"[0-9a-f]{40}", commit), "Migration generation requires an exact 40-hex base commit")
    registry_raw = (Path(repo_root) / REGISTRY_PATH).read_bytes()
    registry = parse_json(registry_raw)
    validate_closed_schema(registry, parse_json((Path(repo_root) / REGISTRY_SCHEMA_PATH).read_bytes()))
    require(registry["migrationId"] == MIGRATION_ID and registry["uuidNamespace"] == str(NAMESPACE), "Registry identity mismatch")
    profile = parse_json((Path(repo_root) / CANONICAL_PROFILE_PATH).read_bytes())
    require(profile["id"] == "skillpilot-canonical-json-decimal-v1", "Unknown canonical JSON profile")
    for vector in profile["vectors"]:
        canonical = stable(parse_json(vector["inputJson"]))
        require(canonical == vector["canonicalJson"].encode("utf-8") and digest(canonical) == vector["sha256"],
                "Canonical JSON conformance vector mismatch")
    snapshot = GitSnapshot(repo_root, commit)
    try:
        catalog, source_files = load_catalog(snapshot)
        require(len(catalog) == 593, "The approved global collision catalog must contain exactly 593 runtime-shaped files")
        rules = build_bijection(catalog)
        require(len(rules) == 164, "The bounded proposal must contain exactly 164 identity rules")
        owners, keys = identity_index(catalog)
        before_refs = validate_graph_references(catalog)
        renamed = {(rule["landscapeId"], rule["sourceGoalId"]): rule["targetGoalId"] for rule in rules}
        old_ids = sorted({rule["sourceGoalId"] for rule in rules})
        matcher = re.compile("|".join(map(re.escape, old_ids)))
        documents, blockers, translated, immutable_blob_metadata = [], [], dict(catalog), {}
        for path in snapshot.matching_paths(old_ids):
            kind, _state = document_class(path, path in catalog)
            mode, oid = snapshot.entries[path]
            cached = immutable_blob_metadata.get(oid) if kind is None and mode != "120000" else None
            if cached is None:
                raw = snapshot.read(path)
                content_hash = digest(raw)
                if kind is None and mode != "120000":
                    immutable_blob_metadata[oid] = content_hash
            else:
                content_hash = cached
            # Git's fixed-string search already establishes whole-document hits.
            # Re-scanning gigabytes of immutable evidence with a 164-way regex
            # adds no proof: the complete original bytes are bound and retained.
            matched = sorted(set(matcher.findall(path)))
            if kind is not None:
                try:
                    original = catalog[path] if path in catalog else parse_json(raw)
                    candidate, fields, preserved, unknown, inverse_hash = transform_document(
                        original, kind, registry, renamed, owners, keys, matcher)
                    matched = sorted(set(matched)
                                     | {field["before"].split(":")[-1] for field in fields}
                                     | {goal_id for field in preserved for goal_id in field["matchedSourceGoalIds"]}
                                     | {goal_id for issue in unknown for goal_id in matcher.findall(issue["value"])})
                    record = {"path": path, "classification": kind, "handling": "explicit-pointer-projection",
                              "sourceSha256": content_hash, "beforeCanonicalSha256": digest(stable(original)),
                              "hypotheticalCanonicalSha256": digest(stable(candidate)), "inverseCanonicalSha256": inverse_hash,
                              "fields": fields, "preservedFields": preserved, "matchedSourceGoalIds": matched}
                    documents.append(record)
                    blockers.extend({"path": path, **issue} for issue in unknown)
                    if path in catalog:
                        translated[path] = candidate
                except (ValueError, TypeError, KeyError) as error:
                    blockers.append({"path": path, "pointer": "", "reason": "Cannot classify active document: " + str(error), "value": ""})
                continue
            immutable = next((rule for rule in registry["immutableExactDocuments"] if path == rule["path"]), None)
            immutable = immutable or next((rule for rule in registry["immutableDocumentRules"] if path.startswith(rule["prefix"])), None)
            active_code = next((rule for rule in registry["activeCodeConsumers"] if path == rule["path"]), None)
            if immutable:
                documents.append({"path": path, "classification": "immutable-original", "handling": "preserve-exact-bytes",
                                  "sourceSha256": content_hash, "reason": immutable["reason"], "matchedSourceGoalIds": matched})
            elif active_code:
                documents.append({"path": path, "classification": "active-code-consumer", "handling": "requires-integration",
                                  "sourceSha256": content_hash, "reason": active_code["reason"], "matchedSourceGoalIds": matched})
                blockers.append({"path": path, "pointer": "", "reason": active_code["reason"], "value": ""})
            else:
                derived = any(path.startswith(prefix) for prefix in registry["derivedDocumentPrefixes"])
                documents.append({"path": path, "classification": "derived-output" if derived else "unclassified",
                                  "handling": "requires-review", "sourceSha256": content_hash, "matchedSourceGoalIds": matched})
                blockers.append({"path": path, "pointer": "", "reason": "Derived output needs real regeneration" if derived else
                                 "Unclassified document containing a migration identity", "value": ""})
        by_path = {document["path"]: document for document in documents}
        for rule in rules:
            original = catalog[rule["sourceFile"]]
            parent, token = pointer_parent(original, rule["sourcePointer"])
            goal = parent[int(token)]
            extended = goal.get("extendedData") or {}
            urls = [extended.get(name) for name in ("vocabularySource", "vocabularySourceEn")]
            urls.extend(link.get("url") for link in goal.get("resourceLinks", []) if isinstance(link, dict))
            for url in sorted({url for url in urls if isinstance(url, str)}):
                if url.startswith("/data/"):
                    resource_path = "curricula/DE/Gymnasium/memory-decks/" + url.rsplit("/", 1)[-1]
                elif url.startswith("/assets/"):
                    resource_path = "app/public" + url
                else:
                    continue
                if resource_path not in snapshot.entries:
                    blockers.append({"path": rule["sourceFile"], "pointer": rule["sourcePointer"],
                                     "reason": "Referenced local card/asset has no bound Git source", "value": url})
                    continue
                if resource_path not in by_path:
                    resource = {"path": resource_path, "classification": "immutable-original", "handling": "preserve-exact-bytes",
                                "sourceSha256": digest(snapshot.read(resource_path)),
                                "reason": "Actual local card/asset bytes referenced by a renamed goal remain unchanged.",
                                "matchedSourceGoalIds": [], "boundFromGoalKeys": []}
                    by_path[resource_path] = resource
                    documents.append(resource)
                resource = by_path[resource_path]
                resource.setdefault("boundFromGoalKeys", []).append(rule["landscapeId"] + ":" + rule["sourceGoalId"])
        documents.sort(key=lambda document: document["path"])
        after_refs = validate_graph_references(translated)
        require(before_refs == after_refs, "Reference cardinality changed")
        for rule in rules:
            document = translated[rule["sourceFile"]]
            parent, token = pointer_parent(document, rule["sourcePointer"])
            goal = parent[int(token)]
            require(goal["id"] == rule["targetGoalId"], "Target identity was not generated at its exact source pointer")
            rule["hypotheticalGoalSha256"] = digest(stable(goal))
            rule["inverseGoalSha256"] = rule["beforeGoalSha256"]
            rule["semanticPayloadSha256"] = rule["beforeGoalSha256"]
        return {"$schema": "https://skillpilot.com/contracts/canonical-goal-identity/v1/migration.schema.json",
                "schemaVersion": 1, "migrationId": MIGRATION_ID, "uuidNamespace": str(NAMESPACE),
                "baseCommit": commit, "status": "blocked" if blockers else "proposal-verified", "runtimeApplied": False,
                "runtimeAliasSupportClaimed": False, "qaApprovalClaimed": False,
                "registry": {"path": REGISTRY_PATH, "sha256": digest(registry_raw)},
                "registrySchemaBinding": {"path": REGISTRY_SCHEMA_PATH,
                                          "sha256": digest((Path(repo_root) / REGISTRY_SCHEMA_PATH).read_bytes())},
                "schemaBinding": {"path": SCHEMA_PATH, "sha256": digest((Path(repo_root) / SCHEMA_PATH).read_bytes())},
                "canonicalJsonProfile": {"path": CANONICAL_PROFILE_PATH,
                                         "sha256": digest((Path(repo_root) / CANONICAL_PROFILE_PATH).read_bytes())},
                "verifier": {"path": "scripts/canonical_goal_identity_migration.py", "sha256": digest(Path(__file__).read_bytes())},
                "catalog": {"scope": "all-runtime-shaped-curricula-excluding-quality", "sourceFiles": source_files,
                            "fileCount": len(catalog), "serializedGoals": sum(len(d["goals"]) for d in catalog.values()),
                            "logicalGoalKeys": len(keys), "resolvedReferencesBefore": before_refs, "resolvedReferencesAfter": after_refs},
                "rules": rules, "documents": documents, "blockers": blockers,
                "proof": {"bijectiveRuleCount": len(rules), "globalExistingIdentityCollisionCount": 0,
                          "inverseDocumentEqualityVerified": True, "unclassifiedOrUnreadyHitCount": len(blockers),
                          "historicalEvidenceBytesPreserved": True, "cardAndAssetBytesRenamed": False,
                          "activationReady": False}}
    finally:
        snapshot.close()


def validate_closed_schema(value, schema, root=None, path="$"):
    """Small strict validator for the closed, deliberately simple local schema."""
    root = schema if root is None else root
    if "$ref" in schema:
        target = root
        for token in schema["$ref"][2:].split("/"):
            target = target[token]
        return validate_closed_schema(value, target, root, path)
    if "const" in schema:
        require(value == schema["const"], "Schema const mismatch at " + path)
    if "enum" in schema:
        require(value in schema["enum"], "Schema enum mismatch at " + path)
    kind = schema.get("type")
    predicates = {"object": lambda x: isinstance(x, dict), "array": lambda x: isinstance(x, list),
                  "string": lambda x: isinstance(x, str), "boolean": lambda x: isinstance(x, bool),
                  "integer": lambda x: isinstance(x, int) and not isinstance(x, bool)}
    if kind:
        require(predicates[kind](value), "Schema type mismatch at " + path)
    if isinstance(value, dict) and kind == "object":
        props = schema.get("properties", {})
        require(all(key in value for key in schema.get("required", [])), "Missing schema field at " + path)
        if schema.get("additionalProperties") is False:
            require(set(value) <= set(props), "Unknown schema field at " + path)
        for key, nested in value.items():
            if key in props:
                validate_closed_schema(nested, props[key], root, path + "/" + key)
    elif isinstance(value, list) and kind == "array":
        require(len(value) >= schema.get("minItems", 0) and len(value) <= schema.get("maxItems", len(value)), "Schema array count at " + path)
        for index, nested in enumerate(value):
            validate_closed_schema(nested, schema["items"], root, path + "/" + str(index))
    elif isinstance(value, str):
        require(len(value) >= schema.get("minLength", 0) and len(value) <= schema.get("maxLength", len(value)),
                "Schema string length at " + path)
        if "pattern" in schema:
            require(re.search(schema["pattern"], value) is not None, "Schema pattern mismatch at " + path)
    elif kind == "integer":
        require(value >= schema.get("minimum", value), "Schema integer minimum at " + path)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path(__file__).resolve().parents[1])
    sub = parser.add_subparsers(dest="command", required=True)
    produce = sub.add_parser("generate", help="Write only an unapplied proposal; blocked proposals exit 2")
    produce.add_argument("--base-commit", default=BASE_COMMIT)
    produce.add_argument("--output", type=Path, required=True)
    check = sub.add_parser("verify", help="Recompute the exact proposal from its Git baseline and compare")
    check.add_argument("--manifest", type=Path, required=True)
    check.add_argument("--candidate-root", type=Path,
                       help="Additionally verify an already prepared file tree; never modify it")
    check.add_argument("--expected-base-commit", help="Independently accepted active-snapshot base commit")
    check.add_argument("--accepted-manifest-sha256", help="Independently accepted SHA256 of original manifest bytes")
    args = parser.parse_args()
    try:
        schema = parse_json((args.repo_root / SCHEMA_PATH).read_bytes())
        if args.command == "generate":
            manifest = generate(args.repo_root, args.base_commit)
            validate_closed_schema(manifest, schema)
            args.output.parent.mkdir(parents=True, exist_ok=True)
            manifest_raw = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
            args.output.write_bytes(manifest_raw)
        else:
            manifest_raw = args.manifest.read_bytes()
            manifest = parse_json(manifest_raw)
            validate_closed_schema(manifest, schema)
            if args.expected_base_commit is not None:
                require(manifest["baseCommit"] == args.expected_base_commit, "Stale proof base does not match accepted snapshot")
            if args.accepted_manifest_sha256 is not None:
                require(digest(manifest_raw) == args.accepted_manifest_sha256, "Manifest bytes do not match independently accepted digest")
            require(stable(manifest) == stable(generate(args.repo_root, manifest["baseCommit"])),
                    "Manifest differs from deterministic independent recomputation")
            if args.candidate_root is not None:
                verify_accepted_bindings(manifest, manifest_raw, args.expected_base_commit, args.accepted_manifest_sha256)
                require(not manifest["blockers"], "An incompletely classified proposal cannot verify a candidate")
                original = GitSnapshot(args.repo_root, manifest["baseCommit"])
                try:
                    verify_candidate_catalog_sources(args.candidate_root, manifest)
                    for document in manifest["documents"]:
                        current_raw = (args.candidate_root / document["path"]).read_bytes()
                        if document["handling"] == "preserve-exact-bytes":
                            require(digest(current_raw) == document["sourceSha256"], "Immutable original changed")
                        else:
                            candidate = parse_json(current_raw)
                            require(digest(stable(candidate)) == document["hypotheticalCanonicalSha256"],
                                    "Candidate is not the exact declared pointer projection: " + document["path"])
                            inverse_proof(parse_json(original.read(document["path"])), candidate, document["fields"])
                finally:
                    original.close()
        print(json.dumps({"status": manifest["status"], "rules": len(manifest["rules"]),
                          "catalogFiles": manifest["catalog"]["fileCount"], "documents": len(manifest["documents"]),
                          "blockingHits": len(manifest["blockers"]), "runtimeApplied": False,
                          "manifestRawSha256": digest(manifest_raw),
                          "manifestCanonicalSha256": digest(stable(manifest))}, indent=2))
        return 2 if manifest["blockers"] else 0
    except (ContractError, KeyError, TypeError, OSError, subprocess.CalledProcessError) as error:
        print(json.dumps({"status": "FAIL", "error": str(error), "runtimeApplied": False}), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
