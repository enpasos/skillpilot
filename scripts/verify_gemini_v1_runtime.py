#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check an operator's private Gemini configuration without printing its values."""
import argparse
import json
import os
from pathlib import Path
import pwd
import re
import stat
import subprocess
import sys
from urllib.parse import urlsplit

ORIGIN = "https://mcp-gemini-v1.skillpilot.com"
NODE_VERSION = "v22.22.0"
KEY_FILES = ("operator-key", "client-secret", "gateway-secret", "signing-secret", "capability-secret")
CONFIG_KEYS = {"origin", "clientId", "clientAuthMethod", "allowRefreshResourceOmission"}


class ConfigError(Exception):
    pass


def secure_path(path, *, directory=False, uid=None):
    path = Path(path)
    try:
        info = path.lstat()
    except OSError:
        raise ConfigError("Required private configuration is missing") from None
    kind = stat.S_ISDIR if directory else stat.S_ISREG
    if not kind(info.st_mode) or stat.S_ISLNK(info.st_mode):
        raise ConfigError("Private configuration must use regular files and directories")
    if stat.S_IMODE(info.st_mode) != (0o700 if directory else 0o600):
        raise ConfigError("Private directory must be 0700 and every private file 0600")
    if uid is not None and info.st_uid != uid:
        raise ConfigError("Private configuration must belong to the gateway service user")


def read_private(directory, name, uid=None):
    path = Path(directory) / name
    secure_path(path, uid=uid)
    if path.stat().st_size > 32768:
        raise ConfigError("Private configuration exceeds its bounded size")
    try:
        with path.open(encoding="utf-8", newline="") as stream:
            text = stream.read()
    except (OSError, UnicodeError):
        raise ConfigError("Private configuration cannot be read") from None
    if name == "gemini-callback.txt" and "\r" in text:
        raise ConfigError("The callback file must use canonical LF line endings; CRLF changes the pinned URI bytes")
    return text.strip()


def check_node(node):
    if not Path(node).is_absolute() or not os.access(node, os.X_OK):
        raise ConfigError("An absolute executable Node path is required")
    try:
        result = subprocess.run([str(node), "--version"], capture_output=True, text=True, timeout=10, check=False)
    except (OSError, subprocess.TimeoutExpired):
        raise ConfigError("The selected Node executable could not be verified") from None
    if result.returncode or result.stdout.strip() != NODE_VERSION:
        raise ConfigError("The gateway requires the repository-pinned Node 22.22.0")


def validate_runtime(runtime, *, uid=None, allow_unconfigured_callback=False):
    secure_path(runtime, directory=True, uid=uid)
    try:
        config = json.loads(read_private(runtime, "connection.json", uid))
    except (ValueError, TypeError):
        raise ConfigError("connection.json must contain a valid object") from None
    if not isinstance(config, dict) or set(config) != CONFIG_KEYS:
        raise ConfigError("connection.json must contain exactly the documented fixed-profile properties")
    if config.get("origin") != ORIGIN:
        raise ConfigError("The controlled production test requires its exact dedicated HTTPS origin")
    if not isinstance(config.get("clientId"), str) or not re.fullmatch(r"[A-Za-z0-9._-]{1,100}", config["clientId"]):
        raise ConfigError("A valid fixed confidential client ID is required")
    if config.get("clientAuthMethod") != "client_secret_post":
        raise ConfigError("Use the measured fixed Gemini client_secret_post profile")
    if type(config.get("allowRefreshResourceOmission")) is not bool:
        raise ConfigError("The refresh compatibility setting must be a JSON boolean")
    secrets = {name: read_private(runtime, name, uid) for name in KEY_FILES}
    if any(not 32 <= len(value) <= 4096 or re.search(r"\s", value) for value in secrets.values()):
        raise ConfigError("Each dedicated key must contain 32–4096 non-whitespace characters")
    if len(set(secrets.values())) != len(KEY_FILES):
        raise ConfigError("All five Gemini keys must be independent")
    callbacks = read_private(runtime, "gemini-callback.txt", uid).splitlines()
    if len(callbacks) > 10 or len(callbacks) != len(set(callbacks)):
        raise ConfigError("At most ten distinct exactly measured callbacks are allowed")
    for callback in callbacks:
        try:
            url = urlsplit(callback)
            invalid = (len(callback) > 2048 or "*" in callback or re.search(r"\s", callback)
                       or url.scheme != "https" or url.hostname != "oauth-redirect.googleusercontent.com"
                       or url.port is not None or url.username or url.password or url.fragment)
        except ValueError:
            invalid = True
        if invalid:
            raise ConfigError("Every callback must be one complete measured HTTPS Google redirect URI")
    if not callbacks and not allow_unconfigured_callback:
        raise ConfigError("Pin the callback measured for this origin before host acceptance")
    audit = Path(runtime) / "events.jsonl"
    if audit.exists() or audit.is_symlink():
        secure_path(audit, uid=uid)
    return config, secrets, callbacks


def validate_spring(spring_path, config, secrets, *, uid=None):
    secure_path(spring_path, uid=uid)
    if spring_path.stat().st_size > 32768:
        raise ConfigError("Private Spring configuration exceeds its bounded size")
    # This is a deliberately narrow generated YAML shape, not a generic YAML
    # parser. Refuse extra global/provider sections, duplicate keys and aliases.
    lines = [line for line in spring_path.read_text(encoding="utf-8").splitlines()
             if line.strip() and not line.lstrip().startswith("#")]
    if lines[:4] != ["skillpilot:", "  gemini:", "    connector:", "      v1:"]:
        raise ConfigError("The private Spring addition must contain only the Gemini v1 block")
    fields = {}
    for line in lines[4:]:
        match = re.fullmatch(r"        ([a-z-]+): (.+)", line)
        if not match or match[1] in fields:
            raise ConfigError("The private Spring addition has unknown shape or duplicate fields")
        fields[match[1]] = match[2]
    origin = config["origin"]
    expected = {
        "enabled": "true", "public-base-url": origin, "public-mcp-url": origin + "/mcp",
        "public-resource-metadata-url": origin + "/.well-known/oauth-protected-resource/mcp",
        "public-auth-server-metadata-url": origin + "/.well-known/oauth-authorization-server",
        "public-documentation-url": "https://enpasos.github.io/skillpilot/deploy/gemini-integration/",
        "gateway-audience": origin + "/mcp",
        **{field: json.dumps(secrets[field]) for field in ("gateway-secret", "signing-secret", "capability-secret")},
    }
    if fields != expected:
        raise ConfigError("The private Spring origin/audience/three key bindings differ from the gateway runtime")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--gateway-dir", required=True, type=Path)
    parser.add_argument("--node", required=True, type=Path)
    parser.add_argument("--backend-port", required=True, type=int)
    parser.add_argument("--expected-user")
    parser.add_argument("--spring-config", type=Path)
    parser.add_argument("--allow-unconfigured-callback", action="store_true",
                        help="Bootstrap only: an empty allowlist still rejects every callback")
    args = parser.parse_args()
    if not 1 <= args.backend_port <= 65535:
        raise ConfigError("An explicit valid existing backend port is required")
    uid = pwd.getpwnam(args.expected_user).pw_uid if args.expected_user else os.geteuid()
    check_node(args.node)
    if not (args.gateway_dir / "server/cli.mjs").is_file():
        raise ConfigError("Install the reviewed gateway source before starting its unit")
    if not (args.gateway_dir / "node_modules/express/package.json").is_file():
        raise ConfigError("Run npm ci --ignore-scripts in the reviewed gateway checkout first")
    config, secrets, callbacks = validate_runtime(args.gateway_dir / ".runtime", uid=uid,
                                                 allow_unconfigured_callback=args.allow_unconfigured_callback)
    if args.spring_config:
        validate_spring(args.spring_config, config, secrets, uid=uid)
    expected_upstream = f"http://127.0.0.1:{args.backend_port}/gemini/v1/mcp"
    if os.environ.get("GEMINI_BACKEND_MCP_URL", expected_upstream) != expected_upstream:
        raise ConfigError("The upstream must be the exact existing loopback Spring port and Gemini path")
    if os.environ.get("GEMINI_GATEWAY_PORT", "8795") != "8795":
        raise ConfigError("The reviewed edge expects the gateway on loopback port 8795")
    print("PASS private Gemini runtime, five independent keys, fixed client and loopback upstream")
    print("PASS exact callback pinned" if callbacks else "BOOTSTRAP callback not configured; authorization remains denied")


if __name__ == "__main__":
    try:
        main()
    except (ConfigError, KeyError, OSError, UnicodeError) as error:
        print(f"FAIL {error if isinstance(error, ConfigError) else 'Private configuration or gateway service user could not be checked'}", file=sys.stderr)
        sys.exit(1)
