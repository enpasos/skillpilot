"""Disposable CI database; no production configuration or credentials."""

import re
import subprocess
import sys
import time


# Both official registry references retain the existing immutable image digest.
# https://docs.docker.com/reference/cli/docker/image/pull/#pull-an-image-by-digest-immutable-identifier
DIGEST = "sha256:9b1d34adbce1dd07ee6e94b4a2cf698884b89bd44a6c9c12f5da8f3acbfe4957"
IMAGES = (
    f"public.ecr.aws/docker/library/postgres@{DIGEST}",
    f"docker.io/library/postgres@{DIGEST}",
)
CONTAINER = "skillpilot-ci-postgres"


def start(database, *, run=subprocess.run, sleep=time.sleep):
    if not re.fullmatch(r"[a-z][a-z0-9_]{0,62}", database):
        raise ValueError("Invalid disposable database name")
    image = None
    for candidate in IMAGES:
        print(f"Pulling pinned PostgreSQL image: {candidate}", flush=True)
        try:
            pulled = run(["docker", "pull", candidate], check=False, timeout=180)
        except subprocess.TimeoutExpired:
            print("Registry pull timed out; trying the next pinned source.", flush=True)
            continue
        if pulled.returncode == 0:
            image = candidate
            break
        print("Registry pull failed; trying the next pinned source.", flush=True)
    if image is None:
        raise RuntimeError("Neither official registry supplied the pinned PostgreSQL image")

    run(
        [
            "docker", "run", "--detach", "--pull=never", "--name", CONTAINER,
            "--publish", "127.0.0.1:5432:5432",
            "--env", f"POSTGRES_DB={database}",
            "--env", "POSTGRES_PASSWORD=skillpilot-test-only",
            "--health-cmd", f"pg_isready -U postgres -d {database}",
            "--health-interval", "2s", "--health-timeout", "5s",
            "--health-retries", "20", image,
        ],
        check=True, timeout=30,
    )
    for attempt in range(60):
        health = run(
            ["docker", "inspect", "--format", "{{.State.Health.Status}}", CONTAINER],
            check=True, capture_output=True, text=True, timeout=10,
        ).stdout.strip()
        if health == "healthy":
            break
        if health != "starting" or attempt == 59:
            run(["docker", "logs", CONTAINER], check=False, timeout=10)
            raise RuntimeError(f"PostgreSQL did not become healthy: {health}")
        sleep(2)
    version = run(
        ["docker", "exec", CONTAINER, "psql", "-U", "postgres", "-d", database,
         "-tA", "-c", "SHOW server_version_num"],
        check=True, capture_output=True, text=True, timeout=10,
    ).stdout.strip()
    if not version.isdecimal() or int(version) // 10000 != 15:
        raise RuntimeError(f"Expected PostgreSQL 15, received {version!r}")
    print(f"Disposable PostgreSQL 15 is healthy (server_version_num={version}).", flush=True)


def stop(*, run=subprocess.run):
    removed = run(
        ["docker", "rm", "--force", "--volumes", CONTAINER],
        check=False, capture_output=True, text=True, timeout=30,
    )
    if removed.returncode and "No such container" not in removed.stderr:
        raise RuntimeError(f"Could not remove disposable PostgreSQL: {removed.stderr}")


if __name__ == "__main__":
    command, database = sys.argv[1:]
    if command == "start":
        start(database)
    elif command == "stop":
        stop()
    else:
        raise ValueError("Expected start or stop")
