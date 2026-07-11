#!/usr/bin/env python3
"""Sandbox entrypoint: probe isolation, launch SkillPilot, run loopback smokes."""

from __future__ import annotations

import errno
import json
import os
import signal
import socket
import subprocess
import sys
import time
from pathlib import Path


OUTPUT = Path("/opt/runtime-output")
EXPECTED = json.loads(Path("/opt/skillpilot-runtime/expected.json").read_text(encoding="utf-8"))
RUNTIME_CONFIGURATION = json.loads(
    Path("/opt/skillpilot-runtime/runtime-configuration.json").read_text(encoding="utf-8")
)


def external_network_unreachable() -> bool:
    candidate = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    candidate.settimeout(1)
    try:
        result = candidate.connect_ex(("192.0.2.1", 9))
        return result in {errno.ENETUNREACH, errno.EHOSTUNREACH, errno.EACCES}
    finally:
        candidate.close()


def loopback_available() -> bool:
    listener = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    try:
        listener.bind(("127.0.0.1", 0))
        listener.listen(1)
        return True
    except OSError:
        return False
    finally:
        listener.close()


def package_store_is_read_only() -> bool:
    probe = Path("/opt/curriculum-store/.package-consumer-write-probe")
    try:
        probe.write_bytes(b"must-not-be-written")
    except OSError as error:
        return error.errno in {errno.EROFS, errno.EACCES, errno.EPERM}
    else:
        probe.unlink(missing_ok=True)
        return False


def write_isolation_probe() -> None:
    repository = Path(EXPECTED["hostRepositoryPath"])
    source_checkout = Path(EXPECTED["hostSourceCheckoutPath"])
    repository_markers = [
        repository / ".git",
        repository / "AGENTS.md",
        repository / "scripts",
    ]
    payload = {
        "sourceCheckoutAccessible": (source_checkout / ".git").exists(),
        "repositoryMountAccessible": any(path.exists() for path in repository_markers),
        "networkPolicy": (
            "loopback-only"
            if loopback_available() and external_network_unreachable()
            else "unrestricted"
        ),
        "packageStoreReadOnly": package_store_is_read_only(),
        "environmentKeys": sorted(os.environ),
    }
    (OUTPUT / "isolation-probe.json").write_text(
        json.dumps(payload, sort_keys=True, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def main() -> int:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    write_isolation_probe()

    java_command = [
        "java",
        *RUNTIME_CONFIGURATION["javaOptions"],
        "-cp",
        ":".join(RUNTIME_CONFIGURATION["classpath"]),
        RUNTIME_CONFIGURATION["javaMainClass"],
        *RUNTIME_CONFIGURATION["applicationArguments"],
    ]
    with (OUTPUT / "backend-console.log").open("wb") as log:
        backend = subprocess.Popen(java_command, stdout=log, stderr=subprocess.STDOUT)
        try:
            with (OUTPUT / "http-smoke.log").open("wb") as smoke_log:
                smoke = subprocess.Popen(
                    ["python3", "/opt/skillpilot-runtime/package_consumer_smoke_http.py"],
                    stdout=smoke_log,
                    stderr=subprocess.STDOUT,
                )
                deadline = time.monotonic() + 420
                while smoke.poll() is None:
                    if backend.poll() is not None:
                        smoke.terminate()
                        smoke.wait(timeout=10)
                        return 1
                    if time.monotonic() >= deadline:
                        smoke.terminate()
                        smoke.wait(timeout=10)
                        return 1
                    time.sleep(0.25)
                if smoke.returncode != 0:
                    return smoke.returncode

            with (OUTPUT / "browser-smoke.log").open("wb") as browser_log:
                browser = subprocess.Popen(
                    ["node", "/opt/skillpilot-runtime/package_consumer_browser_smoke.cjs"],
                    stdout=browser_log,
                    stderr=subprocess.STDOUT,
                )
                deadline = time.monotonic() + 240
                while browser.poll() is None:
                    if backend.poll() is not None:
                        browser.terminate()
                        browser.wait(timeout=10)
                        return 1
                    if time.monotonic() >= deadline:
                        browser.terminate()
                        browser.wait(timeout=10)
                        return 1
                    time.sleep(0.25)
                return browser.returncode
        finally:
            if backend.poll() is None:
                backend.send_signal(signal.SIGTERM)
                try:
                    backend.wait(timeout=30)
                except subprocess.TimeoutExpired:
                    backend.kill()
                    backend.wait(timeout=10)


if __name__ == "__main__":
    sys.exit(main())
