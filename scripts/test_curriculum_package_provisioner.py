#!/usr/bin/env python3
"""Fast lifecycle and adversarial self-test for the curriculum package provisioner."""

from __future__ import annotations

import argparse
import hashlib
import json
import stat
import sys
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Callable, TypeVar

sys.dont_write_bytecode = True

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

import provision_curriculum_package as provisioner  # noqa: E402


T = TypeVar("T")


class SelfTestFailure(RuntimeError):
    """One provisioner guarantee did not hold."""


@dataclass(frozen=True)
class PackageSpec:
    package_id: str
    version: str
    seed: str
    definitions: tuple[dict[str, Any], ...]
    software_range: str = ">=0.1.0 <1.0.0"
    payload_path: str = "data/payload.json"
    payload_mode: int = stat.S_IFREG | 0o644
    payload_raw: bytes | None = None
    landscape_id: str | None = None
    capabilities: tuple[str, ...] = ()

    @property
    def release_id(self) -> str:
        return f"{self.package_id}@{self.version}"

    @property
    def archive_root(self) -> str:
        slug = self.package_id.replace(".", "-")
        return f"{slug}-{self.version}-json"


class Results:
    def __init__(self, verbose: bool) -> None:
        self.verbose = verbose
        self.passed = 0

    def record(self, name: str) -> None:
        self.passed += 1
        if self.verbose:
            print(f"PASS {name}")

    def check(self, name: str, condition: bool, detail: str = "") -> None:
        if not condition:
            raise SelfTestFailure(f"{name}: {detail or 'condition is false'}")
        self.record(name)

    def rejects(
        self,
        name: str,
        operation: Callable[[], Any],
        *,
        contains: str | None = None,
    ) -> None:
        try:
            operation()
        except (provisioner.PackageRejected, provisioner.TrustFailure) as error:
            if contains is not None and contains not in str(error):
                raise SelfTestFailure(
                    f"{name}: expected message containing {contains!r}, got {error!r}"
                ) from error
            self.record(name)
            return
        except Exception as error:
            raise SelfTestFailure(
                f"{name}: unexpected exception {type(error).__name__}: {error}"
            ) from error
        raise SelfTestFailure(f"{name}: unsafe operation unexpectedly succeeded")


def stable_json_bytes(value: Any) -> bytes:
    return (
        json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n"
    ).encode("utf-8")


def sha256(raw: bytes) -> str:
    return hashlib.sha256(raw).hexdigest()


def digest(label: str) -> str:
    return "sha256:" + hashlib.sha256(label.encode("utf-8")).hexdigest()


def zip_info(path: str, *, mode: int = stat.S_IFREG | 0o644) -> zipfile.ZipInfo:
    info = zipfile.ZipInfo(path, date_time=(1980, 1, 1, 0, 0, 0))
    info.create_system = 3
    info.external_attr = mode << 16
    info.compress_type = zipfile.ZIP_STORED
    return info


def build_package(path: Path, spec: PackageSpec) -> None:
    closure_path = "data/runtime/dependency-closure.json"
    runtime_catalog_path = "data/runtime/catalog.json"
    resource_index_path = "data/resources/resource-index.json"
    landscape_id = spec.landscape_id or f"{spec.package_id}:landscape"
    view_id = f"{spec.package_id}:default-view"
    offering_id = f"{spec.package_id}:default-offering"
    closure = {
        "closureDigest": digest(f"closure:{spec.release_id}:{spec.seed}"),
        "definitionIndexDigest": digest(
            "definitions:"
            + json.dumps(spec.definitions, sort_keys=True, separators=(",", ":"))
        ),
        "embeddedFragments": [],
        "definitions": list(spec.definitions),
    }
    runtime_catalog = {
        "capabilities": list(spec.capabilities),
        "landscapes": [
            {
                "landscapeId": landscape_id,
                "role": "root",
            }
        ],
        "views": [
            {
                "viewId": view_id,
                "landscapeId": landscape_id,
            }
        ],
        "offeredScopes": [
            {
                "offeringId": offering_id,
                "landscapeId": landscape_id,
                "viewResolution": {
                    "viewIds": [view_id],
                },
            }
        ],
        "resources": [],
    }
    payloads: dict[str, tuple[bytes, int, str, bool]] = {
        closure_path: (
            stable_json_bytes(closure),
            stat.S_IFREG | 0o644,
            "dependency-closure",
            True,
        ),
        runtime_catalog_path: (
            stable_json_bytes(runtime_catalog),
            stat.S_IFREG | 0o644,
            "runtime-catalog",
            True,
        ),
        resource_index_path: (
            stable_json_bytes({"resources": []}),
            stat.S_IFREG | 0o644,
            "resource-index",
            True,
        ),
        spec.payload_path: (
            spec.payload_raw
            if spec.payload_raw is not None
            else stable_json_bytes(
                {
                    "packageId": spec.package_id,
                    "version": spec.version,
                    "seed": spec.seed,
                }
            ),
            spec.payload_mode,
            "canonical-landscape",
            True,
        ),
    }
    files = []
    for relative, (raw, _mode, role, runtime_required) in sorted(payloads.items()):
        files.append(
            {
                "path": relative,
                "role": role,
                "mediaType": "application/json",
                "bytes": len(raw),
                "sha256": sha256(raw),
                "runtimeRequired": runtime_required,
            }
        )
    manifest = {
        "packageFormatVersion": "1.0",
        "runtimeContractVersion": "1.0",
        "releaseProfile": "full-standalone-v1",
        "variant": "json",
        "archiveRoot": spec.archive_root,
        "packageId": spec.package_id,
        "packageVersion": spec.version,
        "releaseId": spec.release_id,
        "contentDigest": digest(f"content:{spec.release_id}:{spec.seed}"),
        "supportedSkillpilotSoftware": spec.software_range,
        "files": files,
    }
    manifest_raw = stable_json_bytes(manifest)
    checksums = {
        relative: sha256(raw)
        for relative, (raw, _mode, _role, _runtime) in payloads.items()
    }
    checksums["metadata/manifest.json"] = sha256(manifest_raw)
    sums_raw = "".join(
        f"{checksums[relative]}  {relative}\n" for relative in sorted(checksums)
    ).encode("utf-8")
    entries = {
        **{
            relative: (raw, mode)
            for relative, (raw, mode, _role, _runtime) in payloads.items()
        },
        "metadata/manifest.json": (manifest_raw, stat.S_IFREG | 0o644),
        "metadata/SHA256SUMS": (sums_raw, stat.S_IFREG | 0o644),
    }
    path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(path, "w", allowZip64=False) as archive:
        for relative, (raw, mode) in sorted(entries.items()):
            archive.writestr(
                zip_info(f"{spec.archive_root}/{relative}", mode=mode),
                raw,
            )


FAKE_VALIDATOR = r'''#!/usr/bin/env python3
import hashlib
import json
import sys
import zipfile
from pathlib import Path

def stable(value):
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")

zip_path = Path(sys.argv[sys.argv.index("--zip") + 1])
report_path = Path(sys.argv[sys.argv.index("--report") + 1])
raw_zip = zip_path.read_bytes()
with zipfile.ZipFile(zip_path) as archive:
    infos = archive.infolist()
    manifest_names = [name for name in archive.namelist() if name.endswith("/metadata/manifest.json")]
    if len(manifest_names) != 1:
        raise SystemExit(1)
    manifest_name = manifest_names[0]
    root = manifest_name[: -len("/metadata/manifest.json")]
    manifest_raw = archive.read(manifest_name)
    manifest = json.loads(manifest_raw)
    closure_records = [record for record in manifest["files"] if record.get("role") == "dependency-closure"]
    if len(closure_records) != 1:
        raise SystemExit(1)
    closure = json.loads(archive.read(root + "/" + closure_records[0]["path"]))

gate = {"status": "passed", "diagnosticCount": 0, "diagnosticCodes": []}
report = {
    "reportFormatVersion": 2,
    "validatorId": "skillpilot-full-standalone-package-validator-v2",
    "status": "valid",
    "input": {
        "path": str(zip_path),
        "bytes": len(raw_zip),
        "sha256": hashlib.sha256(raw_zip).hexdigest(),
    },
    "package": {
        "archiveRoot": manifest["archiveRoot"],
        "releaseId": manifest["releaseId"],
        "packageId": manifest["packageId"],
        "packageVersion": manifest["packageVersion"],
        "contentDigest": manifest["contentDigest"],
        "manifestSha256": hashlib.sha256(manifest_raw).hexdigest(),
        "closureDigest": closure["closureDigest"],
        "definitionIndexDigest": closure["definitionIndexDigest"],
    },
    "counts": {
        "archiveEntries": len(infos),
        "manifestFiles": len(manifest["files"]),
        "logicalArtifacts": len(manifest["files"]),
        "binaryResources": 0,
    },
    "gates": {
        name: dict(gate)
        for name in (
            "inventory",
            "runtimeCatalog",
            "offlineSchemaCatalog",
            "hardReferenceClosure",
            "contentDigest",
            "assetBytes",
        )
    },
    "diagnostics": [],
    "diagnosticsTruncated": False,
}
report_path.write_bytes(stable(report))
'''


def write_fake_validator(path: Path) -> None:
    path.write_text(FAKE_VALIDATOR, encoding="utf-8")
    path.chmod(0o700)


def locked(layout: provisioner.StoreLayout, operation: Callable[[], T]) -> T:
    with provisioner.exclusive_store_lock(layout):
        return operation()


def install(
    zip_path: Path,
    layout: provisioner.StoreLayout,
    profile: dict[str, Any],
    validators: dict[str, Any],
    fake_validator: Path,
) -> provisioner.VerifiedInstall:
    return locked(
        layout,
        lambda: provisioner.install_package(
            zip_path,
            layout,
            profile,
            validators,
            timeout_seconds=30,
            validator_path=fake_validator,
        ),
    )


def rewrite_read_only(path: Path, raw: bytes) -> None:
    path.chmod(0o600)
    path.write_bytes(raw)
    path.chmod(0o444)


def active_sha(
    layout: provisioner.StoreLayout, validators: dict[str, Any]
) -> str | None:
    return locked(
        layout,
        lambda: provisioner.read_active_lock(layout, validators["lock"])[2],
    )


def run_self_test(verbose: bool) -> int:
    results = Results(verbose)
    shared_key = {"kind": "goal", "id": "shared-goal"}
    shared_definition = {
        "key": shared_key,
        "ownerPackageId": "org.skillpilot.shared",
        "definitionDigest": "sha256:" + "1" * 64,
    }
    conflicting_definition = {
        "key": shared_key,
        "ownerPackageId": "org.skillpilot.shared",
        "definitionDigest": "sha256:" + "2" * 64,
    }

    tmp_root = provisioner.REPO_ROOT / "tmp"
    tmp_root.mkdir(exist_ok=True)
    with tempfile.TemporaryDirectory(
        prefix="curriculum-package-provisioner-test.", dir=tmp_root
    ) as temporary:
        root = Path(temporary)
        fake_validator = root / "fake-validator.py"
        write_fake_validator(fake_validator)
        profile = provisioner.load_profile()
        validators = provisioner.load_operational_validators()
        layout = provisioner.prepare_store(root / "store")

        package_v1 = root / "math-v1.zip"
        package_v2 = root / "math-v2.zip"
        package_conflict = root / "physics-conflict.zip"
        package_landscape_collision = root / "physics-landscape-collision.zip"
        package_embedded_capability = root / "physics-embedded-capability.zip"
        build_package(
            package_v1,
            PackageSpec(
                "org.skillpilot.curriculum.math",
                "0.1.0",
                "math-v1",
                (shared_definition,),
            ),
        )
        build_package(
            package_v2,
            PackageSpec(
                "org.skillpilot.curriculum.math",
                "0.2.0",
                "math-v2",
                (shared_definition,),
            ),
        )
        build_package(
            package_conflict,
            PackageSpec(
                "org.skillpilot.curriculum.physics",
                "0.1.0",
                "physics-conflict",
                (conflicting_definition,),
            ),
        )
        build_package(
            package_landscape_collision,
            PackageSpec(
                "org.skillpilot.curriculum.physics-collision",
                "0.1.0",
                "physics-landscape-collision",
                (shared_definition,),
                landscape_id="org.skillpilot.curriculum.math:landscape",
            ),
        )
        build_package(
            package_embedded_capability,
            PackageSpec(
                "org.skillpilot.curriculum.physics-embedded",
                "0.1.0",
                "physics-embedded-capability",
                (shared_definition,),
                capabilities=("embeddedDependencies",),
            ),
        )

        installed_v1 = install(
            package_v1, layout, profile, validators, fake_validator
        )
        results.check(
            "lifecycle install",
            installed_v1.record["releaseId"]
            == "org.skillpilot.curriculum.math@0.1.0",
        )
        verified_v1 = locked(
            layout,
            lambda: provisioner.verify_install(
                layout, installed_v1.record["outerZipSha256"], validators
            ),
        )
        results.check(
            "lifecycle verify",
            verified_v1.record_sha256 == installed_v1.record_sha256,
        )
        results.check(
            "immutable control modes",
            stat.S_IMODE(
                provisioner.record_path(
                    layout, installed_v1.record["outerZipSha256"]
                ).stat().st_mode
            )
            == 0o444
            and stat.S_IMODE(
                provisioner.report_path(
                    layout, installed_v1.record["outerZipSha256"]
                ).stat().st_mode
            )
            == 0o444,
        )
        results.check(
            "immutable object modes",
            stat.S_IMODE(installed_v1.package_root.stat().st_mode) == 0o555
            and all(
                stat.S_IMODE(path.stat().st_mode) == 0o444
                for path in installed_v1.package_root.rglob("*")
                if path.is_file()
            ),
        )

        lock_v1, _ = locked(
            layout,
            lambda: provisioner.activate(
                layout,
                [installed_v1.record["outerZipSha256"]],
                "none",
                "0.1.0",
                validators,
            ),
        )
        results.check("lifecycle activate", active_sha(layout, validators) == lock_v1)
        first_status = locked(
            layout, lambda: provisioner.status_document(layout, validators)
        )
        results.check(
            "lifecycle status",
            first_status["activeLockSha256"] == lock_v1
            and len(first_status["installed"]) == 1,
        )

        idempotent = install(
            package_v1,
            layout,
            profile,
            validators,
            root / "validator-must-not-run.py",
        )
        results.check(
            "idempotent install avoids validator",
            idempotent.record_sha256 == installed_v1.record_sha256,
        )

        installed_v2 = install(
            package_v2, layout, profile, validators, fake_validator
        )
        results.check(
            "second version install",
            installed_v2.record["packageVersion"] == "0.2.0",
        )
        results.rejects(
            "activation CAS rejection",
            lambda: locked(
                layout,
                lambda: provisioner.activate(
                    layout,
                    [installed_v2.record["outerZipSha256"]],
                    "none",
                    "0.1.0",
                    validators,
                ),
            ),
            contains="CAS mismatch",
        )
        results.check(
            "CAS rejection preserves active lock",
            active_sha(layout, validators) == lock_v1,
        )
        results.rejects(
            "consumer mismatch rejection",
            lambda: locked(
                layout,
                lambda: provisioner.activate(
                    layout,
                    [installed_v2.record["outerZipSha256"]],
                    lock_v1,
                    "1.0.0",
                    validators,
                ),
            ),
            contains="outside supportedSkillpilotSoftware",
        )
        lock_v2, _ = locked(
            layout,
            lambda: provisioner.activate(
                layout,
                [installed_v2.record["outerZipSha256"]],
                lock_v1,
                "0.1.0",
                validators,
            ),
        )
        results.check("second version activation", lock_v2 != lock_v1)
        rolled_back, _ = locked(
            layout,
            lambda: provisioner.rollback(
                layout,
                lock_v1,
                lock_v2,
                "0.1.0",
                validators,
            ),
        )
        results.check(
            "rollback lifecycle",
            rolled_back == lock_v1 and active_sha(layout, validators) == lock_v1,
        )
        results.rejects(
            "rollback stale CAS rejection",
            lambda: locked(
                layout,
                lambda: provisioner.rollback(
                    layout,
                    lock_v2,
                    lock_v2,
                    "0.1.0",
                    validators,
                ),
            ),
            contains="CAS mismatch",
        )

        input_symlink = root / "input-symlink.zip"
        input_symlink.symlink_to(package_v1)
        results.rejects(
            "symlink input rejection",
            lambda: install(
                input_symlink, layout, profile, validators, fake_validator
            ),
        )

        unsafe_zip = root / "unsafe-path.zip"
        build_package(
            unsafe_zip,
            PackageSpec(
                "org.skillpilot.curriculum.unsafe",
                "0.1.0",
                "unsafe",
                (),
                payload_path="../escape.json",
            ),
        )
        results.rejects(
            "malicious traversal path rejection",
            lambda: install(unsafe_zip, layout, profile, validators, fake_validator),
            contains="Unsafe ZIP entry path",
        )

        symlink_zip = root / "symlink-entry.zip"
        nested_magic_zip = root / "nested-magic.zip"
        overlong_full_path_zip = root / "overlong-full-path.zip"
        build_package(
            symlink_zip,
            PackageSpec(
                "org.skillpilot.curriculum.symlink",
                "0.1.0",
                "symlink-entry",
                (),
                payload_mode=stat.S_IFLNK | 0o777,
            ),
        )
        results.rejects(
            "ZIP symlink entry rejection",
            lambda: install(symlink_zip, layout, profile, validators, fake_validator),
            contains="not a regular file",
        )

        build_package(
            nested_magic_zip,
            PackageSpec(
                "org.skillpilot.curriculum.nested",
                "0.1.0",
                "nested-magic",
                (),
                payload_path="data/payload.bin",
                payload_raw=b"\x1f\x8bsynthetic nested gzip bytes",
            ),
        )
        results.rejects(
            "nested archive magic rejection",
            lambda: install(
                nested_magic_zip, layout, profile, validators, fake_validator
            ),
            contains="Nested archive magic",
        )

        build_package(
            overlong_full_path_zip,
            PackageSpec(
                "org.skillpilot.curriculum.longpath",
                "0.1.0",
                "overlong-full-path",
                (),
                payload_path="data/" + "a" * 200 + ".json",
            ),
        )
        results.rejects(
            "full archive path limit rejection",
            lambda: install(
                overlong_full_path_zip,
                layout,
                profile,
                validators,
                fake_validator,
            ),
            contains="Full ZIP entry path exceeds profile",
        )

        truncated_zip = root / "truncated.zip"
        original_zip = package_v1.read_bytes()
        truncated_zip.write_bytes(original_zip[: max(1, len(original_zip) // 2)])
        results.rejects(
            "truncated ZIP rejection",
            lambda: install(
                truncated_zip, layout, profile, validators, fake_validator
            ),
        )

        same_release_zip = root / "same-release-different.zip"
        build_package(
            same_release_zip,
            PackageSpec(
                "org.skillpilot.curriculum.math",
                "0.1.0",
                "different-bytes",
                (shared_definition,),
            ),
        )
        same_release_hash = sha256(same_release_zip.read_bytes())
        results.rejects(
            "immutable releaseId collision",
            lambda: install(
                same_release_zip, layout, profile, validators, fake_validator
            ),
            contains="releaseId already exists",
        )
        results.check(
            "release collision leaves no controls",
            not provisioner.record_path(layout, same_release_hash).exists()
            and not provisioner.report_path(layout, same_release_hash).exists(),
        )

        payload_path = installed_v1.package_root / "data/payload.json"
        payload_raw = payload_path.read_bytes()
        payload_path.chmod(0o644)
        results.rejects(
            "payload permission tamper rejection",
            lambda: locked(
                layout,
                lambda: provisioner.verify_install(
                    layout, installed_v1.record["outerZipSha256"], validators
                ),
            ),
            contains="mode drift",
        )
        payload_path.chmod(0o444)

        payload_path.chmod(0o600)
        payload_path.write_bytes(b'{"tampered":true}\n')
        payload_path.chmod(0o444)
        results.rejects(
            "payload hash tamper rejection",
            lambda: locked(
                layout,
                lambda: provisioner.verify_install(
                    layout, installed_v1.record["outerZipSha256"], validators
                ),
            ),
        )
        rewrite_read_only(payload_path, payload_raw)

        unexpected_dir = installed_v1.package_root / "unexpected-empty"
        installed_v1.package_root.chmod(0o755)
        unexpected_dir.mkdir(mode=0o555)
        installed_v1.package_root.chmod(0o555)
        results.rejects(
            "extra empty directory rejection",
            lambda: locked(
                layout,
                lambda: provisioner.verify_install(
                    layout, installed_v1.record["outerZipSha256"], validators
                ),
            ),
            contains="directory tree differs",
        )
        installed_v1.package_root.chmod(0o755)
        unexpected_dir.rmdir()
        installed_v1.package_root.chmod(0o555)

        record_v1_path = provisioner.record_path(
            layout, installed_v1.record["outerZipSha256"]
        )
        record_v1_path.chmod(0o644)
        results.rejects(
            "control permission tamper rejection",
            lambda: locked(
                layout,
                lambda: provisioner.status_document(layout, validators),
            ),
            contains="mode drift",
        )
        record_v1_path.chmod(0o444)

        report_v1_path = provisioner.report_path(
            layout, installed_v1.record["outerZipSha256"]
        )
        report_v2_path = provisioner.report_path(
            layout, installed_v2.record["outerZipSha256"]
        )
        record_v2_path = provisioner.record_path(
            layout, installed_v2.record["outerZipSha256"]
        )
        report_v1_raw = report_v1_path.read_bytes()
        report_v2_raw = report_v2_path.read_bytes()
        record_v2_raw = record_v2_path.read_bytes()
        replay_record = json.loads(record_v2_raw)
        replay_record["validationReportSha256"] = sha256(report_v1_raw)
        rewrite_read_only(report_v2_path, report_v1_raw)
        rewrite_read_only(record_v2_path, stable_json_bytes(replay_record))
        results.rejects(
            "validator report replay rejection",
            lambda: locked(
                layout,
                lambda: provisioner.verify_install(
                    layout, installed_v2.record["outerZipSha256"], validators
                ),
            ),
            contains="binding drift",
        )
        rewrite_read_only(report_v2_path, report_v2_raw)
        rewrite_read_only(record_v2_path, record_v2_raw)

        forged_outer = "f" * 64
        forged_record = dict(installed_v1.record)
        forged_record["outerZipSha256"] = forged_outer
        forged_path = provisioner.record_path(layout, forged_outer)
        forged_path.write_bytes(stable_json_bytes(forged_record))
        forged_path.chmod(0o444)
        results.rejects(
            "status rejects unverified install record",
            lambda: locked(
                layout,
                lambda: provisioner.status_document(layout, validators),
            ),
        )
        forged_path.unlink()

        installed_conflict = install(
            package_conflict, layout, profile, validators, fake_validator
        )
        results.rejects(
            "cross-package definition conflict",
            lambda: locked(
                layout,
                lambda: provisioner.activate(
                    layout,
                    [
                        installed_v1.record["outerZipSha256"],
                        installed_conflict.record["outerZipSha256"],
                    ],
                    lock_v1,
                    "0.1.0",
                    validators,
                ),
            ),
            contains="definition conflict",
        )
        results.check(
            "definition conflict preserves active lock",
            active_sha(layout, validators) == lock_v1,
        )

        installed_landscape_collision = install(
            package_landscape_collision,
            layout,
            profile,
            validators,
            fake_validator,
        )
        results.rejects(
            "cross-package landscape collision",
            lambda: locked(
                layout,
                lambda: provisioner.activate(
                    layout,
                    [
                        installed_v1.record["outerZipSha256"],
                        installed_landscape_collision.record["outerZipSha256"],
                    ],
                    lock_v1,
                    "0.1.0",
                    validators,
                ),
            ),
            contains="landscapeId",
        )
        installed_embedded = install(
            package_embedded_capability,
            layout,
            profile,
            validators,
            fake_validator,
        )
        results.rejects(
            "unsupported embedded dependency capability",
            lambda: locked(
                layout,
                lambda: provisioner.activate(
                    layout,
                    [installed_embedded.record["outerZipSha256"]],
                    lock_v1,
                    "0.1.0",
                    validators,
                ),
            ),
            contains="embeddedDependencies",
        )
        results.check(
            "activation semantic rejections preserve active lock",
            active_sha(layout, validators) == lock_v1,
        )

        bad_store = root / "world-writable-store"
        bad_store.mkdir(mode=0o700)
        bad_store.chmod(0o777)
        results.rejects(
            "world-writable store rejection",
            lambda: provisioner.prepare_store(bad_store),
            contains="must not be group/world writable",
        )
        bad_store.chmod(0o700)

        final_verified = locked(
            layout,
            lambda: provisioner.verify_install(
                layout, installed_v1.record["outerZipSha256"], validators
            ),
        )
        final_status = locked(
            layout, lambda: provisioner.status_document(layout, validators)
        )
        results.check(
            "restored store verifies after adversarial cases",
            final_verified.record_sha256 == installed_v1.record_sha256
            and final_status["activeLockSha256"] == lock_v1,
        )

        recovery_layout = provisioner.prepare_store(root / "recovery-store")
        recovery_first = install(
            package_v1,
            recovery_layout,
            profile,
            validators,
            fake_validator,
        )
        provisioner.record_path(
            recovery_layout, recovery_first.record["outerZipSha256"]
        ).unlink()
        recovery_retry = install(
            package_v1,
            recovery_layout,
            profile,
            validators,
            fake_validator,
        )
        results.check(
            "partial-promotion crash retry",
            recovery_retry.record["outerZipSha256"]
            == recovery_first.record["outerZipSha256"],
        )

        poisoned_layout = provisioner.prepare_store(root / "poisoned-store")
        package_hash = sha256(package_v1.read_bytes())
        poisoned_container = poisoned_layout.objects / package_hash
        poisoned_root = poisoned_container / PackageSpec(
            "org.skillpilot.curriculum.math",
            "0.1.0",
            "math-v1",
            (shared_definition,),
        ).archive_root
        poisoned_root.mkdir(parents=True, mode=0o555)
        poisoned_root.chmod(0o555)
        poisoned_container.chmod(0o555)
        results.rejects(
            "pre-existing object identity conflict",
            lambda: install(
                package_v1,
                poisoned_layout,
                profile,
                validators,
                fake_validator,
            ),
        )
        results.check(
            "object conflict publishes no controls",
            not provisioner.record_path(poisoned_layout, package_hash).exists()
            and not provisioner.report_path(poisoned_layout, package_hash).exists(),
        )

    print(f"Curriculum package provisioner self-test passed: {results.passed} guarantees.")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verbose", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    try:
        return run_self_test(args.verbose)
    except SelfTestFailure as error:
        print(f"FAIL curriculum package provisioner self-test: {error}", file=sys.stderr)
        return 1
    except Exception as error:
        print(
            "FAIL curriculum package provisioner self-test: "
            f"unexpected {type(error).__name__}: {error}",
            file=sys.stderr,
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
