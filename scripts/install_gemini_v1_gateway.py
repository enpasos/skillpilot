#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare Gemini-only service, private configuration and inactive HTTPS edge files."""
import argparse
from datetime import datetime, timezone
import grp
import json
import os
from pathlib import Path
import pwd
import re
import secrets
import shutil
import subprocess
import sys
import tempfile

from verify_gemini_v1_runtime import ConfigError, KEY_FILES, ORIGIN, check_node, secure_path, validate_runtime, validate_spring

SOURCE_ROOT = Path(__file__).resolve().parent.parent


def safe_target(path):
    """Reject symlinks throughout paths receiving private or root-owned files."""
    for ancestor in [path, *path.parents]:
        if ancestor.is_symlink():
            raise ConfigError("A Gemini installation path must not traverse a symlink")
    if path.exists() and not path.is_file():
        raise ConfigError("An installed Gemini file must be a regular file")


def owned_directory(path, mode, uid, gid):
    if path.exists() or path.is_symlink():
        if path.is_symlink() or not path.is_dir():
            raise ConfigError("A Gemini installation directory must be a real directory")
    for ancestor in path.parents:
        if ancestor.is_symlink():
            raise ConfigError("A Gemini installation path must not traverse a symlink")
    path.mkdir(parents=True, exist_ok=True)
    path.chmod(mode)
    if os.geteuid() == 0:
        os.chown(path, uid, gid)


def write_file(path, content, mode, uid, gid, *, backup_dir=None):
    safe_target(path)
    encoded = content.encode("utf-8")
    if path.exists() and path.read_bytes() == encoded:
        path.chmod(mode)
        if os.geteuid() == 0:
            os.chown(path, uid, gid)
        return False
    if path.exists() and backup_dir is not None:
        # Backup filenames are role names, never original secret/config values.
        backup = backup_dir / (str(path).strip("/").replace("/", "__"))
        shutil.copyfile(path, backup)
        backup.chmod(0o600)
    descriptor, temporary = tempfile.mkstemp(prefix=".gemini-install-", dir=path.parent)
    try:
        os.fchmod(descriptor, mode)
        if os.geteuid() == 0:
            os.fchown(descriptor, uid, gid)
        with os.fdopen(descriptor, "wb") as stream:
            stream.write(encoded)
        os.replace(temporary, path)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    return True


def verify_backend_service(service, uid):
    if not re.fullmatch(r"[A-Za-z0-9_.@-]+\.service", service):
        raise ConfigError("Select a valid existing backend service name")
    try:
        result = subprocess.run(["systemctl", "show", service, "--property=LoadState,User,PrivateNetwork,NetworkNamespacePath"],
                                capture_output=True, text=True, timeout=15, check=False)
    except (OSError, subprocess.TimeoutExpired):
        raise ConfigError("The existing backend service could not be checked") from None
    properties = dict(line.split("=", 1) for line in result.stdout.splitlines() if "=" in line)
    if result.returncode or properties.get("LoadState") != "loaded":
        raise ConfigError("The existing backend service must be loaded before production preparation")
    try:
        backend_uid = pwd.getpwnam(properties.get("User") or "root").pw_uid
    except KeyError:
        raise ConfigError("The existing backend service user is unknown") from None
    if backend_uid != uid:
        raise ConfigError("Gateway and existing Spring service must use the same OS user for private 0600 configuration")
    if properties.get("PrivateNetwork") != "no" or properties.get("NetworkNamespacePath"):
        raise ConfigError("The existing backend must share the host network namespace with this gateway unit")


def provision_runtime(runtime, uid, gid):
    if runtime.exists():
        secure_path(runtime, directory=True, uid=uid)
    else:
        owned_directory(runtime, 0o700, uid, gid)
    connection = runtime / "connection.json"
    if connection.exists() or connection.is_symlink():
        secure_path(connection, uid=uid)
        try:
            config = json.loads(connection.read_text(encoding="utf-8"))
        except (ValueError, UnicodeError):
            raise ConfigError("Existing Gemini connection configuration is invalid") from None
        if not isinstance(config, dict) or config.get("origin") != ORIGIN:
            raise ConfigError("Existing Gemini configuration has another origin; migrate it explicitly")
    else:
        config = {"origin": ORIGIN, "clientId": "skillpilot-gemini-beta",
                  "clientAuthMethod": "client_secret_post", "allowRefreshResourceOmission": True}
        write_file(connection, json.dumps(config, indent=2) + "\n", 0o600, uid, gid)
    for name in KEY_FILES:
        path = runtime / name
        if path.exists() or path.is_symlink():
            secure_path(path, uid=uid)
        else:
            write_file(path, secrets.token_hex(32) + "\n", 0o600, uid, gid)
    callback = runtime / "gemini-callback.txt"
    if not callback.exists() and not callback.is_symlink():
        write_file(callback, "", 0o600, uid, gid)
    return validate_runtime(runtime, uid=uid, allow_unconfigured_callback=True)


def prepare(args):
    repository = Path(args.repository)
    if not repository.is_absolute() or not re.fullmatch(r"/[A-Za-z0-9_./-]+", str(repository)) or ".." in repository.parts:
        raise ConfigError("Use an absolute repository path without whitespace or template metacharacters")
    if not (repository / "ai/gemini/gateway/server/cli.mjs").is_file() or not (repository / "scripts/verify_gemini_v1_runtime.py").is_file():
        raise ConfigError("The target checkout must contain the reviewed Gemini gateway and runtime verifier")
    if not re.fullmatch(r"/[A-Za-z0-9_./-]+", str(args.node)):
        raise ConfigError("Use an absolute Node path without whitespace or template metacharacters")
    check_node(args.node)
    if not 1 <= args.backend_port <= 65535:
        raise ConfigError("Select the verified existing Spring loopback port explicitly")
    if not re.fullmatch(r"[A-Za-z0-9_.@-]+\.service", args.backend_service):
        raise ConfigError("Select a valid existing backend service name")
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", args.user) or not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_-]*", args.group):
        raise ConfigError("Select the existing gateway service user and group explicitly")
    try:
        uid, gid = pwd.getpwnam(args.user).pw_uid, grp.getgrnam(args.group).gr_gid
    except KeyError:
        raise ConfigError("The gateway service user and group must already exist") from None
    destination = args.destination_root.resolve()
    if destination == Path("/") and os.geteuid() != 0:
        raise ConfigError("Production preparation requires root; use --destination-root for local staging")
    if destination == Path("/"):
        verify_backend_service(args.backend_service, uid)
    if os.geteuid() != 0 and (uid != os.geteuid() or gid != os.getegid()):
        raise ConfigError("Local staging must use the current user and group")
    target = lambda path: destination / str(path).lstrip("/")
    runtime = target(repository / "ai/gemini/gateway/.runtime")
    config, key_values, callbacks = provision_runtime(runtime, uid, gid)
    private = target("/etc/skillpilot/gemini-v1")
    # Root owns the parent containing nginx material so the gateway user cannot
    # replace a root-owned edge file. Its group can traverse to the 0600 files.
    owned_directory(private, 0o750, 0, gid)
    owned_directory(target("/var/lib/skillpilot-gemini-acme"), 0o755, 0, 0)
    owned_directory(target("/var/lib/skillpilot-gemini-acme/.well-known"), 0o755, 0, 0)
    owned_directory(target("/var/lib/skillpilot-gemini-acme/.well-known/acme-challenge"), 0o755, 0, 0)
    # Never append a second EnvironmentFile to the existing Spring service.
    # The owner merges the one additional-location setting into its current file.
    spring = """# Generated private Gemini-only addition. Preserve existing global/provider settings.
skillpilot:
  gemini:
    connector:
      v1:
        enabled: true
        public-base-url: %s
        public-mcp-url: %s/mcp
        public-resource-metadata-url: %s/.well-known/oauth-protected-resource/mcp
        public-auth-server-metadata-url: %s/.well-known/oauth-authorization-server
        public-documentation-url: https://enpasos.github.io/skillpilot/deploy/gemini-integration/
        gateway-audience: %s/mcp
        gateway-secret: %s
        signing-secret: %s
        capability-secret: %s
""" % (ORIGIN, ORIGIN, ORIGIN, ORIGIN, ORIGIN,
       json.dumps(key_values["gateway-secret"]), json.dumps(key_values["signing-secret"]), json.dumps(key_values["capability-secret"]))
    replacements = {"USER": args.user, "GROUP": args.group, "REPOSITORY": str(repository),
                    "NODE": str(args.node), "BACKEND_PORT": str(args.backend_port), "BACKEND_SERVICE": args.backend_service}
    unit = (SOURCE_ROOT / "deploy/gemini-v1/skillpilot-gemini-v1-gateway.service.in").read_text()
    for name, value in replacements.items():
        unit = unit.replace(f"@{name}@", value)
    if re.search(r"@[A-Z_]+@", unit):
        raise ConfigError("An unrendered service placeholder remains")
    values = {
        private / "gateway.env": (f"GEMINI_GATEWAY_PORT=8795\nGEMINI_BACKEND_MCP_URL=http://127.0.0.1:{args.backend_port}/gemini/v1/mcp\n", 0o600, uid, gid),
        private / "spring.yml": (spring, 0o600, uid, gid),
        private / "spring-environment-merge.txt": ("# Merge into the existing Spring EnvironmentFile; preserve any existing comma-separated locations.\nSPRING_CONFIG_ADDITIONAL_LOCATION=file:/etc/skillpilot/gemini-v1/spring.yml\n", 0o600, uid, gid),
        target("/etc/systemd/system/skillpilot-gemini-v1-gateway.service"): (unit, 0o644, 0, 0),
        runtime / "DEIN-PRODUKTIONS-GEMINI-TEST.md": (f"# Privater kontrollierter Gemini-Test\n\nServer: {ORIGIN}/mcp\nClient-ID: {config['clientId']}\nClient-Secret: {key_values['client-secret']}\nVerbindungsschlüssel: {key_values['operator-key']}\n\nNur für das eigene Operator-Konto. In Gemini Advanced settings exakt dieses Client-Profil verwenden. Den für diesen Origin gemessenen Google-Callback separat in gemini-callback.txt pinnen. Keine Zugangsdaten veröffentlichen.\nOAuth-Verbindungen leben maximal eine Stunde und gehen bei Gateway-Neustart verloren. Eine Lernsession aus skillpilot.com separat vorbereiten. Die direkte Lernzielbildanzeige ist weiterhin nicht abgenommen.\n", 0o600, uid, gid),
    }
    for name in ("nginx-acme.conf", "nginx-tls.conf", "nginx-main-deny.conf"):
        values[private / name] = ((SOURCE_ROOT / "deploy/gemini-v1" / name).read_text(), 0o644, 0, 0)
    # Preflight every existing target before changing any installed artifact.
    for path, (_content, mode, owner_uid, _owner_gid) in values.items():
        safe_target(path)
        if path.exists() and mode == 0o600:
            secure_path(path, uid=owner_uid)
    existing_spring = private / "spring.yml"
    if existing_spring.exists():
        validate_spring(existing_spring, config, key_values, uid=uid)
    existing_env = private / "gateway.env"
    if existing_env.exists() and existing_env.read_text() != values[existing_env][0]:
        raise ConfigError("Existing Gemini gateway port/upstream configuration differs; verify the topology explicitly")
    backup_dir = private / "backups" / (datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ") + "-" + secrets.token_hex(4))
    if any(path.exists() and path.read_text(encoding="utf-8") != value[0] for path, value in values.items()):
        owned_directory(backup_dir, 0o700, 0, 0)
    changed = 0
    for path, (content, mode, owner_uid, owner_gid) in values.items():
        path.parent.mkdir(parents=True, exist_ok=True)
        changed += write_file(path, content, mode, owner_uid, owner_gid, backup_dir=backup_dir if backup_dir.exists() else None)
    print(f"PASS prepared Gemini-only deployment files ({changed} updated); existing keys preserved")
    print("PASS exact callback pinned" if callbacks else "BOOTSTRAP capture and pin the actual Google callback before acceptance")
    print("No services started/restarted, nginx configuration activated, or existing Spring environment modified")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repository", required=True)
    parser.add_argument("--node", required=True, type=Path)
    parser.add_argument("--backend-port", required=True, type=int)
    parser.add_argument("--backend-service", default="skillpilot.service")
    parser.add_argument("--user", required=True)
    parser.add_argument("--group")
    parser.add_argument("--destination-root", type=Path, default=Path("/"), help="Local staging prefix; never activates services")
    args = parser.parse_args()
    args.group = args.group or args.user
    prepare(args)


if __name__ == "__main__":
    try:
        main()
    except (ConfigError, OSError, UnicodeError) as error:
        # OS error objects may contain private paths; report the failure class only.
        print(f"FAIL {error if isinstance(error, ConfigError) else 'Gemini-only file preparation failed; inspect permissions privately'}", file=sys.stderr)
        sys.exit(1)
