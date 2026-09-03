#!/usr/bin/python3 -I
"""Fail-closed one-shot revocation for SkillPilot Claude Connector v1.

The public source contains no credentials. Production execution is deliberately
restricted to a root-owned installed copy. Its candidate database connection
comes only from the inherited environment of the running SkillPilot systemd
process. The tool never changes nginx, systemd, or feature flags; an operator
must contain the connector first.
"""

from __future__ import annotations

import argparse
import datetime as dt
import hashlib
import json
import os
from pathlib import Path
import re
import stat
import subprocess
import sys
from typing import Mapping, Sequence


PROCEDURE_ID = "SP-CLAUDE-V1-IR-001"
PROCEDURE_VERSION = "1.0.0"
CONFIRMATION = "REVOKE-CLAUDE-V1-AUTHORIZATIONS-AND-SESSIONS"
INSTALL_PATH = Path("/usr/local/libexec/skillpilot/claude_v1_revoke")
DEFAULT_SERVICE = "skillpilot"
DEFAULT_ENVIRONMENT_FILE = Path("/etc/skillpilot/skillpilot.env")
APPLICATION_MAIN_CLASS = "com.skillpilot.backend.SkillpilotApplication"
CGROUP_ROOT = Path("/sys/fs/cgroup")
RESULT_PREFIX = "SP_CLAUDE_V1_REVOKE_RESULT|"
TRUSTED_COMMAND_PATHS = {
    "curl": Path("/usr/bin/curl"),
    "nginx": Path("/usr/sbin/nginx"),
    "psql": Path("/usr/bin/psql"),
    "systemctl": Path("/usr/bin/systemctl"),
}
CLAUDE_V1_ORIGIN = "mcp-claude-v1.skillpilot.com"
CONTAINMENT_CONFIG_PATH = Path("/etc/nginx/skillpilot-claude-connector-v1.conf")
CONTAINMENT_CONFIG_SHA256 = (
    "23a9302fa24132a69c9bf3b134f0a4e9079541a2871eeed69a4a68117042020e"
)
CONTAINMENT_HEADER_NAME = "X-SkillPilot-Claude-V1-Containment"
CONTAINMENT_MARKER = "SP-CLAUDE-V1-CONTAINED-1"
LIVE_STATUS_PREFIX = "SP_CLAUDE_V1_CONTAINMENT_STATUS:"
DATABASE_SOURCE_NAMES = (
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
)
SPRING_CONFIG_SUFFIXES = (".properties", ".xml", ".yml", ".yaml")
DatabaseResult = tuple[int, int, int, int, str]

ALLOWED_CLIENT_IDS_SQL = """
(
    'https://claude.ai/oauth/mcp-oauth-client-metadata',
    'https://claude.ai/oauth/claude-code-client-metadata'
)
""".strip()

SCOPE_PREDICATE = f"""
rc.client_id IN {ALLOWED_CLIENT_IDS_SQL}
AND left(a.principal_name, 5) = 'spca_'
AND a.attributes::jsonb ->> 'skillpilot_provider' = 'claude-v1'
""".strip()

CONSENT_SCOPE_PREDICATE = f"""
rc.client_id IN {ALLOWED_CLIENT_IDS_SQL}
AND left(c.principal_name, 5) = 'spca_'
""".strip()

TARGET_FINGERPRINT_SQL = """
pg_catalog.encode(
    pg_catalog.sha256(
        pg_catalog.convert_to(
            pg_catalog.concat_ws(
                pg_catalog.chr(31),
                pg_catalog.current_database(),
                CURRENT_USER,
                (
                    SELECT d.oid::text
                      FROM pg_catalog.pg_database d
                     WHERE d.datname = pg_catalog.current_database()
                ),
                coalesce(pg_catalog.inet_server_addr()::text, 'local-socket'),
                coalesce(pg_catalog.inet_server_port()::text, 'local-socket'),
                extract(epoch FROM pg_catalog.pg_postmaster_start_time())::text
            ),
            'UTF8'
        )
    ),
    'hex'
)
""".strip()

SCHEMA_GUARD_SQL = """
DO $skillpilot_schema_guard$
BEGIN
    IF pg_catalog.current_schema() IS DISTINCT FROM 'public' THEN
        RAISE EXCEPTION 'claude_v1_revoke_effective_schema_guard';
    END IF;
END
$skillpilot_schema_guard$;
""".strip()

COMMON_GUARDS_SQL = f"""
DO $skillpilot_guard$
DECLARE
    migration_count bigint;
    client_count bigint;
    table_shape_count bigint;
    mutating_fk_count bigint;
    approved_cascade_count bigint;
    delete_trigger_count bigint;
    delete_rule_count bigint;
    row_security_table_count bigint;
    inheritance_link_count bigint;
    anomaly_count bigint;
BEGIN
    IF NOT pg_try_advisory_xact_lock(763911421, 1) THEN
        RAISE EXCEPTION 'claude_v1_revoke_lock_unavailable';
    END IF;

    IF pg_catalog.current_setting('fsync') <> 'on' THEN
        RAISE EXCEPTION 'claude_v1_revoke_durability_guard';
    END IF;

    SELECT count(*) INTO migration_count
      FROM (
          SELECT id
            FROM public.databasechangelog
           WHERE id IN (
               '023-add-claude-connector-v1',
               '024-replace-claude-v1-binding-with-learning-sessions'
           )
             AND exectype = 'EXECUTED'
           GROUP BY id
          HAVING count(*) = 1
      ) exact_migrations;
    IF migration_count <> 2 THEN
        RAISE EXCEPTION 'claude_v1_revoke_migration_guard';
    END IF;

    SELECT count(*) INTO client_count
      FROM public.oauth2_registered_client
     WHERE client_id IN {ALLOWED_CLIENT_IDS_SQL};
    IF client_count <> 2 THEN
        RAISE EXCEPTION 'claude_v1_revoke_client_guard';
    END IF;

    SELECT count(*) INTO table_shape_count
      FROM pg_catalog.pg_class c
      JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
     WHERE n.nspname = 'public'
       AND c.relname IN (
           'databasechangelog',
           'oauth2_registered_client',
           'oauth2_authorization',
           'oauth2_authorization_consent',
           'claude_v1_learning_session',
           'claude_v1_session_idempotency'
       )
       AND c.relkind = 'r'
       AND c.relpersistence = 'p';
    IF table_shape_count <> 6 THEN
        RAISE EXCEPTION 'claude_v1_revoke_table_shape_guard';
    END IF;

    SELECT count(*) INTO mutating_fk_count
      FROM pg_catalog.pg_constraint pc
     WHERE pc.contype = 'f'
       AND pc.confrelid IN (
           pg_catalog.to_regclass('public.oauth2_authorization_consent'),
           pg_catalog.to_regclass('public.oauth2_authorization'),
           pg_catalog.to_regclass('public.claude_v1_learning_session'),
           pg_catalog.to_regclass('public.claude_v1_session_idempotency')
       )
       AND pc.confdeltype IN ('c', 'n', 'd');

    SELECT count(*) INTO approved_cascade_count
      FROM pg_catalog.pg_constraint pc
     WHERE pc.contype = 'f'
       AND pc.conname = 'fk_claude_v1_session_idempotency_session'
       AND pc.conrelid = pg_catalog.to_regclass('public.claude_v1_session_idempotency')
       AND pc.confrelid = pg_catalog.to_regclass('public.claude_v1_learning_session')
       AND pc.confdeltype = 'c'
       AND pg_catalog.array_length(pc.conkey, 1) = 1
       AND pg_catalog.array_length(pc.confkey, 1) = 1
       AND EXISTS (
           SELECT 1
             FROM pg_catalog.pg_attribute child_column
            WHERE child_column.attrelid = pc.conrelid
              AND child_column.attnum = pc.conkey[1]
              AND child_column.attname = 'token_hash'
              AND NOT child_column.attisdropped
       )
       AND EXISTS (
           SELECT 1
             FROM pg_catalog.pg_attribute parent_column
            WHERE parent_column.attrelid = pc.confrelid
              AND parent_column.attnum = pc.confkey[1]
              AND parent_column.attname = 'token_hash'
              AND NOT parent_column.attisdropped
       );
    IF mutating_fk_count <> 1 OR approved_cascade_count <> 1 THEN
        RAISE EXCEPTION 'claude_v1_revoke_cascade_guard';
    END IF;

    SELECT count(*) INTO delete_trigger_count
      FROM pg_catalog.pg_trigger t
     WHERE t.tgrelid IN (
           pg_catalog.to_regclass('public.oauth2_authorization_consent'),
           pg_catalog.to_regclass('public.oauth2_authorization'),
           pg_catalog.to_regclass('public.claude_v1_learning_session'),
           pg_catalog.to_regclass('public.claude_v1_session_idempotency')
       )
       AND NOT t.tgisinternal
       AND (t.tgtype::integer & 8) = 8;
    IF delete_trigger_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_delete_trigger_guard';
    END IF;

    SELECT count(*) INTO delete_rule_count
      FROM pg_catalog.pg_rewrite r
     WHERE r.ev_class IN (
           pg_catalog.to_regclass('public.oauth2_authorization_consent'),
           pg_catalog.to_regclass('public.oauth2_authorization'),
           pg_catalog.to_regclass('public.claude_v1_learning_session'),
           pg_catalog.to_regclass('public.claude_v1_session_idempotency')
       )
       AND r.ev_type = '4';
    IF delete_rule_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_delete_rule_guard';
    END IF;

    SELECT count(*) INTO row_security_table_count
      FROM pg_catalog.pg_class c
     WHERE c.oid IN (
           pg_catalog.to_regclass('public.oauth2_authorization_consent'),
           pg_catalog.to_regclass('public.oauth2_authorization'),
           pg_catalog.to_regclass('public.claude_v1_learning_session'),
           pg_catalog.to_regclass('public.claude_v1_session_idempotency')
       )
       AND (c.relrowsecurity OR c.relforcerowsecurity);
    IF row_security_table_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_row_security_guard';
    END IF;

    SELECT count(*) INTO inheritance_link_count
      FROM pg_catalog.pg_inherits i
     WHERE i.inhparent IN (
           pg_catalog.to_regclass('public.oauth2_authorization_consent'),
           pg_catalog.to_regclass('public.oauth2_authorization'),
           pg_catalog.to_regclass('public.claude_v1_learning_session'),
           pg_catalog.to_regclass('public.claude_v1_session_idempotency')
       )
        OR i.inhrelid IN (
           pg_catalog.to_regclass('public.oauth2_authorization_consent'),
           pg_catalog.to_regclass('public.oauth2_authorization'),
           pg_catalog.to_regclass('public.claude_v1_learning_session'),
           pg_catalog.to_regclass('public.claude_v1_session_idempotency')
       );
    IF inheritance_link_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_table_inheritance_guard';
    END IF;

    SELECT count(*) INTO anomaly_count
      FROM public.oauth2_authorization a
      LEFT JOIN public.oauth2_registered_client rc ON rc.id = a.registered_client_id
     WHERE (
           left(a.principal_name, 5) = 'spca_'
           OR coalesce(a.attributes::jsonb ->> 'skillpilot_provider', '') = 'claude-v1'
       )
       AND NOT (
           coalesce(rc.client_id, '') IN {ALLOWED_CLIENT_IDS_SQL}
           AND coalesce(left(a.principal_name, 5), '') = 'spca_'
           AND coalesce(a.attributes::jsonb ->> 'skillpilot_provider', '') = 'claude-v1'
       );
    IF anomaly_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_authorization_scope_guard';
    END IF;

    SELECT count(*) INTO anomaly_count
      FROM public.oauth2_authorization_consent c
      LEFT JOIN public.oauth2_registered_client rc ON rc.id = c.registered_client_id
     WHERE left(c.principal_name, 5) = 'spca_'
       AND coalesce(rc.client_id, '') NOT IN {ALLOWED_CLIENT_IDS_SQL};
    IF anomaly_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_consent_scope_guard';
    END IF;

    SELECT count(*) INTO anomaly_count
      FROM public.claude_v1_session_idempotency i
      LEFT JOIN public.claude_v1_learning_session s ON s.token_hash = i.token_hash
     WHERE s.token_hash IS NULL;
    IF anomaly_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_orphan_guard';
    END IF;
END
$skillpilot_guard$;
""".strip()

PLAN_SQL = (
    f"""
\\set QUIET 1
BEGIN ISOLATION LEVEL SERIALIZABLE READ ONLY;
{SCHEMA_GUARD_SQL}
SET LOCAL search_path = pg_catalog, public, pg_temp;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL idle_in_transaction_session_timeout = '30s';
{COMMON_GUARDS_SQL}
SELECT
    (SELECT count(*)
       FROM public.oauth2_authorization a
       JOIN public.oauth2_registered_client rc ON rc.id = a.registered_client_id
      WHERE {SCOPE_PREDICATE}) AS oauth,
    (SELECT count(*)
       FROM public.oauth2_authorization_consent c
       JOIN public.oauth2_registered_client rc ON rc.id = c.registered_client_id
      WHERE {CONSENT_SCOPE_PREDICATE}) AS consents,
    (SELECT count(*) FROM public.claude_v1_learning_session) AS sessions,
    (SELECT count(*) FROM public.claude_v1_session_idempotency) AS idempotency,
    {TARGET_FINGERPRINT_SQL} AS target_sha256
\\gset sp_
COMMIT;
\\echo {RESULT_PREFIX}:sp_oauth|:sp_consents|:sp_sessions|:sp_idempotency|:sp_target_sha256
""".strip()
    + "\n"
)

EXECUTE_SQL = (
    f"""
\\set QUIET 1
BEGIN ISOLATION LEVEL SERIALIZABLE;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SET LOCAL idle_in_transaction_session_timeout = '30s';
SET LOCAL synchronous_commit = on;
LOCK TABLE
    public.databasechangelog,
    public.oauth2_registered_client,
    public.oauth2_authorization,
    public.oauth2_authorization_consent,
    public.claude_v1_learning_session,
    public.claude_v1_session_idempotency
IN SHARE ROW EXCLUSIVE MODE;
{SCHEMA_GUARD_SQL}
SET LOCAL search_path = pg_catalog, public, pg_temp;
{COMMON_GUARDS_SQL}
CREATE TEMPORARY TABLE pg_temp.skillpilot_claude_v1_revoke_result (
    oauth bigint NOT NULL,
    consents bigint NOT NULL,
    sessions bigint NOT NULL,
    idempotency bigint NOT NULL,
    target_sha256 varchar(64) NOT NULL
) ON COMMIT DROP;
DO $skillpilot_execute$
DECLARE
    actual_oauth bigint;
    actual_consents bigint;
    actual_sessions bigint;
    actual_idempotency bigint;
    actual_target_sha256 text;
    deleted_oauth bigint;
    deleted_consents bigint;
    deleted_sessions bigint;
    remaining_count bigint;
BEGIN
    SELECT count(*) INTO actual_oauth
      FROM public.oauth2_authorization a
      JOIN public.oauth2_registered_client rc ON rc.id = a.registered_client_id
     WHERE {SCOPE_PREDICATE};
    SELECT count(*) INTO actual_consents
      FROM public.oauth2_authorization_consent c
      JOIN public.oauth2_registered_client rc ON rc.id = c.registered_client_id
     WHERE {CONSENT_SCOPE_PREDICATE};
    SELECT count(*) INTO actual_sessions FROM public.claude_v1_learning_session;
    SELECT count(*) INTO actual_idempotency FROM public.claude_v1_session_idempotency;
    SELECT {TARGET_FINGERPRINT_SQL} INTO actual_target_sha256;

    IF actual_oauth <> (SELECT oauth FROM pg_temp.skillpilot_claude_v1_revoke_expected)
       OR actual_consents <> (SELECT consents FROM pg_temp.skillpilot_claude_v1_revoke_expected)
       OR actual_sessions <> (SELECT sessions FROM pg_temp.skillpilot_claude_v1_revoke_expected)
       OR actual_idempotency <> (SELECT idempotency FROM pg_temp.skillpilot_claude_v1_revoke_expected)
       OR actual_target_sha256 <> (SELECT target_sha256 FROM pg_temp.skillpilot_claude_v1_revoke_expected) THEN
        RAISE EXCEPTION 'claude_v1_revoke_expected_count_guard';
    END IF;

    DELETE FROM public.oauth2_authorization_consent c
    USING public.oauth2_registered_client rc
     WHERE c.registered_client_id = rc.id
       AND {CONSENT_SCOPE_PREDICATE};
    GET DIAGNOSTICS deleted_consents = ROW_COUNT;

    DELETE FROM public.oauth2_authorization a
    USING public.oauth2_registered_client rc
     WHERE a.registered_client_id = rc.id
       AND {SCOPE_PREDICATE};
    GET DIAGNOSTICS deleted_oauth = ROW_COUNT;

    DELETE FROM public.claude_v1_learning_session;
    GET DIAGNOSTICS deleted_sessions = ROW_COUNT;

    IF deleted_oauth <> actual_oauth
       OR deleted_consents <> actual_consents
       OR deleted_sessions <> actual_sessions THEN
        RAISE EXCEPTION 'claude_v1_revoke_deleted_count_guard';
    END IF;

    SELECT
        (SELECT count(*)
           FROM public.oauth2_authorization a
           JOIN public.oauth2_registered_client rc ON rc.id = a.registered_client_id
          WHERE {SCOPE_PREDICATE})
      + (SELECT count(*)
           FROM public.oauth2_authorization_consent c
           JOIN public.oauth2_registered_client rc ON rc.id = c.registered_client_id
          WHERE {CONSENT_SCOPE_PREDICATE})
      + (SELECT count(*) FROM public.claude_v1_learning_session)
      + (SELECT count(*) FROM public.claude_v1_session_idempotency)
      INTO remaining_count;
    IF remaining_count <> 0 THEN
        RAISE EXCEPTION 'claude_v1_revoke_postcondition_guard';
    END IF;

    SELECT count(*) INTO remaining_count
      FROM public.oauth2_registered_client
     WHERE client_id IN {ALLOWED_CLIENT_IDS_SQL};
    IF remaining_count <> 2 THEN
        RAISE EXCEPTION 'claude_v1_revoke_client_postcondition_guard';
    END IF;

    INSERT INTO pg_temp.skillpilot_claude_v1_revoke_result
        (oauth, consents, sessions, idempotency, target_sha256)
    VALUES (
        deleted_oauth,
        deleted_consents,
        deleted_sessions,
        actual_idempotency,
        actual_target_sha256
    );
END
$skillpilot_execute$;
SELECT oauth, consents, sessions, idempotency, target_sha256
  FROM pg_temp.skillpilot_claude_v1_revoke_result
\\gset sp_
COMMIT;
\\echo {RESULT_PREFIX}:sp_oauth|:sp_consents|:sp_sessions|:sp_idempotency|:sp_target_sha256
""".strip()
    + "\n"
)


class ToolError(RuntimeError):
    """A deliberately non-sensitive failure."""

    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


class DatabaseApplyOutcomeUnverified(ToolError):
    """The destructive client call ended without a trustworthy commit result."""


class AppliedButContainmentUnverified(ToolError):
    """The transaction committed, but the post-commit containment check failed."""

    def __init__(self, result: DatabaseResult):
        super().__init__("post_commit_containment_unverified")
        self.counts = result[:4]
        self.target_sha256 = result[4]


def _utc_now() -> str:
    return (
        dt.datetime.now(dt.timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z")
    )


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _safe_output(
    *,
    tool_sha256: str,
    operation: str,
    incident_id: str,
    status: str,
    counts: Sequence[int] | None = None,
    expected_counts: Sequence[int] | None = None,
    target_sha256: str | None = None,
    expected_target_sha256: str | None = None,
    error: str | None = None,
) -> dict[str, object]:
    payload: dict[str, object] = {
        "procedureId": PROCEDURE_ID,
        "procedureVersion": PROCEDURE_VERSION,
        "operation": operation,
        "incidentId": incident_id,
        "timestampUtc": _utc_now(),
        "toolSha256": tool_sha256,
        "status": status,
    }

    def count_payload(values: Sequence[int]) -> dict[str, int]:
        return {
            "oauthAuthorizations": values[0],
            "oauthConsents": values[1],
            "learningSessions": values[2],
            "sessionIdempotency": values[3],
        }

    if counts is not None:
        payload["counts"] = count_payload(counts)
    if expected_counts is not None:
        payload["expectedCounts"] = count_payload(expected_counts)
    if target_sha256 is not None:
        payload["targetSha256"] = target_sha256
    if expected_target_sha256 is not None:
        payload["expectedTargetSha256"] = expected_target_sha256
    if error is not None:
        payload["error"] = error
    return payload


def _print_output(payload: Mapping[str, object]) -> None:
    print(json.dumps(payload, sort_keys=True, separators=(",", ":")))


def _require_command(name: str) -> str:
    path = TRUSTED_COMMAND_PATHS.get(name)
    if path is None:
        raise ToolError(f"missing_{name.replace('-', '_')}")
    try:
        metadata = path.lstat()
    except OSError as exc:
        raise ToolError(f"missing_{name.replace('-', '_')}") from exc
    permissions = stat.S_IMODE(metadata.st_mode)
    if (
        stat.S_ISLNK(metadata.st_mode)
        or not stat.S_ISREG(metadata.st_mode)
        or metadata.st_uid != 0
        or metadata.st_gid != 0
        or permissions & 0o022
        or not permissions & 0o111
        or metadata.st_mode & (stat.S_ISUID | stat.S_ISGID | stat.S_ISVTX)
    ):
        raise ToolError(f"unsafe_{name.replace('-', '_')}_command")
    _validate_secure_parent_directories(
        path,
        unavailable_code="command_parent_unavailable",
        unsafe_code="unsafe_command_parent",
    )
    return str(path)


def _validate_installed_tool(expected_sha256: str) -> None:
    source = Path(__file__)
    if source != INSTALL_PATH:
        raise ToolError("tool_not_installed")
    try:
        metadata = source.lstat()
    except OSError as exc:
        raise ToolError("tool_metadata_unavailable") from exc
    if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode):
        raise ToolError("unsafe_tool_file")
    if metadata.st_uid != 0 or metadata.st_gid != 0:
        raise ToolError("unsafe_tool_owner")
    if stat.S_IMODE(metadata.st_mode) != 0o755:
        raise ToolError("unsafe_tool_mode")
    _validate_secure_parent_directories(source)
    if _sha256(source) != expected_sha256:
        raise ToolError("tool_changed_during_operation")


def _validate_secure_parent_directories(
    path: Path,
    *,
    unavailable_code: str = "tool_parent_unavailable",
    unsafe_code: str = "unsafe_tool_parent",
) -> None:
    directory = path.parent
    while True:
        try:
            metadata = directory.lstat()
        except OSError as exc:
            raise ToolError(unavailable_code) from exc
        if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISDIR(metadata.st_mode):
            raise ToolError(unsafe_code)
        if metadata.st_uid != 0 or stat.S_IMODE(metadata.st_mode) & 0o022:
            raise ToolError(unsafe_code)
        if directory == Path("/"):
            return
        directory = directory.parent


def _validate_environment_file(path: Path) -> None:
    try:
        metadata = path.lstat()
    except OSError as exc:
        raise ToolError("environment_file_unavailable") from exc
    if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode):
        raise ToolError("unsafe_environment_file")
    if metadata.st_uid != 0 or metadata.st_gid != 0:
        raise ToolError("unsafe_environment_owner")
    if stat.S_IMODE(metadata.st_mode) != 0o600:
        raise ToolError("unsafe_environment_mode")


def _validate_containment_config_file() -> None:
    try:
        metadata = CONTAINMENT_CONFIG_PATH.lstat()
    except OSError as exc:
        raise ToolError("containment_config_unavailable") from exc
    if stat.S_ISLNK(metadata.st_mode) or not stat.S_ISREG(metadata.st_mode):
        raise ToolError("unsafe_containment_config")
    if metadata.st_uid != 0 or metadata.st_gid != 0:
        raise ToolError("unsafe_containment_config_owner")
    if stat.S_IMODE(metadata.st_mode) != 0o644:
        raise ToolError("unsafe_containment_config_mode")
    _validate_secure_parent_directories(
        CONTAINMENT_CONFIG_PATH,
        unavailable_code="containment_config_parent_unavailable",
        unsafe_code="unsafe_containment_config_parent",
    )
    if _sha256(CONTAINMENT_CONFIG_PATH) != CONTAINMENT_CONFIG_SHA256:
        raise ToolError("containment_config_sha256_mismatch")


def _systemctl_properties(service_name: str) -> dict[str, str]:
    systemctl = _require_command("systemctl")
    command = [
        systemctl,
        "show",
        service_name,
        "--no-pager",
        "--property=LoadState,ActiveState,SubState,MainPID,ControlGroup,EnvironmentFiles",
    ]
    completed = subprocess.run(
        command, capture_output=True, text=True, timeout=10, check=False
    )
    if completed.returncode != 0:
        raise ToolError("service_state_unavailable")
    properties: dict[str, str] = {}
    for line in completed.stdout.splitlines():
        key, separator, value = line.partition("=")
        if separator:
            properties[key] = value
    return properties


def _contains_claude_enable_override(text: str) -> bool:
    normalized = re.sub(r"[^a-z0-9]", "", text.lower())
    return (
        "skillpilotclaudeconnectorv1enabled" in normalized
        or "skillpilotclaudeenabled" in normalized
    )


def _contains_spring_target_override(text: str) -> bool:
    normalized = re.sub(r"[^a-z0-9]", "", text.lower())
    return any(
        marker in normalized
        for marker in (
            "springdatasource",
            "springconfig",
            "springprofiles",
            "springapplicationjson",
            "springliquibase",
            "springjpa",
            "hibernatedefaultschema",
            "userdir",
            "postgreshost",
            "postgresport",
            "postgresdb",
            "postgresuser",
            "postgrespassword",
        )
    )


def _normalized_property_name(value: str) -> str:
    return re.sub(r"[^A-Z0-9]", "", value.upper())


def _parse_process_environment(raw_environment: bytes) -> dict[str, str]:
    process_environment: dict[str, str] = {}
    for assignment in raw_environment.split(b"\0"):
        if not assignment:
            continue
        key, separator, value = assignment.partition(b"=")
        if not separator:
            raise ToolError("invalid_process_environment")
        decoded_key = key.decode("utf-8", "strict")
        if not decoded_key or decoded_key in process_environment:
            raise ToolError("duplicate_process_environment")
        process_environment[decoded_key] = value.decode("utf-8", "strict")
    return process_environment


def _is_skillpilot_application_process(
    executable: Path, raw_command_line: bytes
) -> bool:
    arguments = [
        value.decode("utf-8", "strict")
        for value in raw_command_line.split(b"\0")
        if value
    ]
    return executable.name == "java" and arguments.count(APPLICATION_MAIN_CLASS) == 1


def _find_application_process(control_group: str) -> tuple[int, bytes]:
    if (
        not re.fullmatch(r"/[A-Za-z0-9_.@/-]{1,511}", control_group)
        or ".." in Path(control_group).parts
        or control_group == "/"
    ):
        raise ToolError("invalid_service_control_group")
    try:
        cgroup_root = CGROUP_ROOT.resolve(strict=True)
        cgroup_path = (cgroup_root / control_group.lstrip("/")).resolve(strict=True)
        cgroup_path.relative_to(cgroup_root)
        process_files = {
            cgroup_path / "cgroup.procs",
            *cgroup_path.rglob("cgroup.procs"),
        }
        process_ids: set[int] = set()
        for process_file in process_files:
            for value in process_file.read_text(encoding="ascii").splitlines():
                if not re.fullmatch(r"[1-9][0-9]*", value):
                    raise ToolError("invalid_service_cgroup_process")
                process_ids.add(int(value))
    except (OSError, RuntimeError, ValueError) as exc:
        raise ToolError("service_cgroup_unavailable") from exc

    candidates: list[tuple[int, bytes]] = []
    for process_id in sorted(process_ids):
        try:
            executable = Path(f"/proc/{process_id}/exe").resolve(strict=True)
            raw_command_line = Path(f"/proc/{process_id}/cmdline").read_bytes()
            if _is_skillpilot_application_process(executable, raw_command_line):
                candidates.append((process_id, raw_command_line))
        except (OSError, RuntimeError, UnicodeError):
            continue
    if len(candidates) != 1:
        raise ToolError("application_process_not_unique")
    return candidates[0]


def _validate_database_source(
    process_environment: Mapping[str, str],
    raw_command_line: bytes,
    working_directory: Path,
) -> None:
    for canonical_name in DATABASE_SOURCE_NAMES:
        aliases = [
            name
            for name in process_environment
            if _normalized_property_name(name)
            == _normalized_property_name(canonical_name)
        ]
        if aliases != [canonical_name] or not process_environment[canonical_name]:
            raise ToolError("database_credentials_unavailable")

    for name, value in process_environment.items():
        if not value:
            continue
        normalized_name = _normalized_property_name(name)
        if (
            normalized_name.startswith("SPRINGDATASOURCE")
            or normalized_name.startswith("SPRINGCONFIG")
            or normalized_name.startswith("SPRINGPROFILES")
            or normalized_name.startswith("SPRINGLIQUIBASE")
            or normalized_name.startswith("SPRINGJPA")
            or normalized_name == "SPRINGAPPLICATIONJSON"
        ):
            raise ToolError("database_target_override")

    override_text = " ".join(
        [
            raw_command_line.replace(b"\0", b" ").decode("utf-8", "replace"),
            process_environment.get("JAVA_TOOL_OPTIONS", ""),
            process_environment.get("JDK_JAVA_OPTIONS", ""),
            process_environment.get("_JAVA_OPTIONS", ""),
        ]
    )
    command_arguments = [value for value in raw_command_line.split(b"\0") if value]
    option_sources = (
        process_environment.get("JAVA_TOOL_OPTIONS", ""),
        process_environment.get("JDK_JAVA_OPTIONS", ""),
        process_environment.get("_JAVA_OPTIONS", ""),
    )
    if (
        _contains_spring_target_override(override_text)
        or any(argument.startswith(b"@") for argument in command_arguments)
        or any(re.search(r"(?:^|\s)@", value) for value in option_sources)
    ):
        raise ToolError("database_target_override")

    config_directory = working_directory / "config"
    try:
        config_roots = [working_directory, config_directory]
        if config_directory.is_dir():
            config_roots.extend(
                child for child in config_directory.iterdir() if child.is_dir()
            )
        for root in config_roots:
            if not root.is_dir():
                continue
            for candidate in root.iterdir():
                name = candidate.name
                if (
                    name.startswith("application-") or name.startswith("application.")
                ) and name.endswith(SPRING_CONFIG_SUFFIXES):
                    raise ToolError("external_spring_config_present")
    except OSError as exc:
        raise ToolError("spring_config_state_unavailable") from exc


def _validate_feature_flag_containment(
    process_environment: Mapping[str, str], raw_command_line: bytes
) -> None:
    canonical_v1_name = "SKILLPILOT_CLAUDE_CONNECTOR_V1_ENABLED"
    v1_aliases = [
        name
        for name in process_environment
        if _normalized_property_name(name)
        == _normalized_property_name(canonical_v1_name)
    ]
    if v1_aliases != [canonical_v1_name] or (
        process_environment[canonical_v1_name].strip().lower() != "false"
    ):
        raise ToolError("claude_v1_flag_not_false")
    canonical_legacy_name = "SKILLPILOT_CLAUDE_ENABLED"
    legacy_aliases = [
        name
        for name in process_environment
        if _normalized_property_name(name)
        == _normalized_property_name(canonical_legacy_name)
    ]
    if legacy_aliases not in ([], [canonical_legacy_name]) or (
        legacy_aliases
        and process_environment[canonical_legacy_name].strip().lower() != "false"
    ):
        raise ToolError("legacy_claude_flag_not_false")
    override_text = " ".join(
        [
            raw_command_line.replace(b"\0", b" ").decode("utf-8", "replace"),
            process_environment.get("JAVA_TOOL_OPTIONS", ""),
            process_environment.get("JDK_JAVA_OPTIONS", ""),
            process_environment.get("_JAVA_OPTIONS", ""),
            process_environment.get("SPRING_APPLICATION_JSON", ""),
        ]
    ).lower()
    if _contains_claude_enable_override(override_text):
        raise ToolError("claude_enable_override_present")


def _validate_service_environment(
    service_name: str,
    environment_file: Path,
    *,
    require_containment: bool,
) -> tuple[dict[str, str], tuple[int, int, str]]:
    properties = _systemctl_properties(service_name)
    if properties.get("LoadState") != "loaded":
        raise ToolError("service_not_loaded")
    configured = properties.get("EnvironmentFiles", "")
    match = re.fullmatch(r"(.+) \(ignore_errors=(?:yes|no)\)", configured)
    if not match or match.group(1) != str(environment_file):
        raise ToolError("environment_file_mismatch")
    if (
        properties.get("ActiveState") != "active"
        or properties.get("SubState") != "running"
    ):
        raise ToolError("service_not_ready")
    try:
        main_pid = int(properties.get("MainPID", "0"))
    except ValueError as exc:
        raise ToolError("invalid_service_pid") from exc
    if main_pid <= 1:
        raise ToolError("invalid_service_pid")
    control_group = properties.get("ControlGroup", "")
    application_pid, raw_command_line = _find_application_process(control_group)
    try:
        raw_environment = Path(f"/proc/{application_pid}/environ").read_bytes()
        working_directory = Path(f"/proc/{application_pid}/cwd").resolve(strict=True)
    except (OSError, RuntimeError) as exc:
        raise ToolError("service_process_unavailable") from exc
    process_environment = _parse_process_environment(raw_environment)
    _validate_database_source(process_environment, raw_command_line, working_directory)
    if not require_containment:
        return process_environment, (main_pid, application_pid, control_group)
    _validate_feature_flag_containment(process_environment, raw_command_line)
    return process_environment, (main_pid, application_pid, control_group)


def _validate_service_process_unchanged(
    service_name: str, expected_identity: tuple[int, int, str]
) -> None:
    expected_main_pid, expected_application_pid, expected_control_group = (
        expected_identity
    )
    properties = _systemctl_properties(service_name)
    if (
        properties.get("LoadState") != "loaded"
        or properties.get("ActiveState") != "active"
        or properties.get("SubState") != "running"
        or properties.get("MainPID") != str(expected_main_pid)
        or properties.get("ControlGroup") != expected_control_group
    ):
        raise ToolError("service_changed_during_operation")
    application_pid, _ = _find_application_process(expected_control_group)
    if application_pid != expected_application_pid:
        raise ToolError("service_changed_during_operation")


def _validate_nginx_containment() -> None:
    _validate_containment_config_file()
    nginx = _require_command("nginx")
    completed = subprocess.run(
        [nginx, "-T"], capture_output=True, text=True, timeout=15, check=False
    )
    if completed.returncode != 0:
        raise ToolError("nginx_configuration_unavailable")
    effective_configuration = completed.stdout + "\n" + completed.stderr
    if (
        "/internal/connectors/claude/v1/" in effective_configuration
        or effective_configuration.count(CONTAINMENT_MARKER) != 1
    ):
        raise ToolError("claude_v1_proxy_still_active")

    curl = _require_command("curl")
    live_probe = subprocess.run(
        [
            curl,
            "--disable",
            "--silent",
            "--show-error",
            "--insecure",
            "--noproxy",
            "*",
            "--proto",
            "=https",
            "--connect-timeout",
            "3",
            "--max-time",
            "5",
            "--output",
            "/dev/null",
            "--dump-header",
            "-",
            "--write-out",
            f"\n{LIVE_STATUS_PREFIX}%{{http_code}}",
            "--resolve",
            f"{CLAUDE_V1_ORIGIN}:443:127.0.0.1",
            f"https://{CLAUDE_V1_ORIGIN}/mcp",
        ],
        capture_output=True,
        text=True,
        timeout=10,
        check=False,
        env={"LC_ALL": "C"},
    )
    response_lines = live_probe.stdout.replace("\r\n", "\n").splitlines()
    status_values = [
        line.removeprefix(LIVE_STATUS_PREFIX)
        for line in response_lines
        if line.startswith(LIVE_STATUS_PREFIX)
    ]
    containment_values = [
        line.partition(":")[2].strip()
        for line in response_lines
        if line.partition(":")[0].strip().lower() == CONTAINMENT_HEADER_NAME.lower()
    ]
    if (
        live_probe.returncode != 0
        or status_values != ["404"]
        or containment_values != [CONTAINMENT_MARKER]
    ):
        raise ToolError("claude_v1_live_route_not_contained")


def _minimal_database_environment(source: Mapping[str, str]) -> dict[str, str]:
    if any(not source.get(name) for name in DATABASE_SOURCE_NAMES):
        raise ToolError("database_credentials_unavailable")
    if not re.fullmatch(r"[A-Za-z0-9._-]{1,253}", source["POSTGRES_HOST"]):
        raise ToolError("unsupported_database_target")
    if not re.fullmatch(r"[0-9]{1,5}", source["POSTGRES_PORT"]) or not (
        1 <= int(source["POSTGRES_PORT"]) <= 65535
    ):
        raise ToolError("unsupported_database_target")
    for name in ("POSTGRES_DB", "POSTGRES_USER"):
        if not re.fullmatch(r"[A-Za-z0-9_.-]{1,63}", source[name]):
            raise ToolError("unsupported_database_target")
    return {
        "LC_ALL": "C",
        "PGAPPNAME": "skillpilot-claude-v1-revoke",
        "PGCONNECT_TIMEOUT": "10",
        "PGHOST": source["POSTGRES_HOST"],
        "PGPORT": source["POSTGRES_PORT"],
        "PGDATABASE": source["POSTGRES_DB"],
        "PGUSER": source["POSTGRES_USER"],
        "PGPASSWORD": source["POSTGRES_PASSWORD"],
    }


def _parse_result(stdout: str) -> DatabaseResult:
    lines = [line.strip() for line in stdout.splitlines() if line.strip()]
    if len(lines) != 1 or not lines[0].startswith(RESULT_PREFIX):
        raise ToolError("invalid_database_result")
    values = lines[0][len(RESULT_PREFIX) :].split("|")
    if len(values) != 5 or any(
        not re.fullmatch(r"0|[1-9][0-9]{0,18}", value) for value in values[:4]
    ):
        raise ToolError("invalid_database_result")
    parsed_counts = tuple(int(value) for value in values[:4])
    if any(value > 9223372036854775807 for value in parsed_counts) or not re.fullmatch(
        r"[0-9a-f]{64}", values[4]
    ):
        raise ToolError("invalid_database_result")
    return (
        parsed_counts[0],
        parsed_counts[1],
        parsed_counts[2],
        parsed_counts[3],
        values[4],
    )


def _run_psql(
    sql: str,
    source_environment: Mapping[str, str],
    variables: Mapping[str, int | str] | None = None,
    *,
    destructive: bool = False,
) -> DatabaseResult:
    psql = _require_command("psql")
    command = [psql, "-X", "--no-password", "--set=ON_ERROR_STOP=1", "--quiet"]
    for name, value in sorted((variables or {}).items()):
        valid_value = (
            isinstance(value, int)
            and not isinstance(value, bool)
            and 0 <= value <= 9223372036854775807
        ) or (
            isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value) is not None
        )
        if not re.fullmatch(r"expect_[a-z_]+", name) or not valid_value:
            raise ToolError("invalid_database_variable")
        command.append(f"--set={name}={value}")
    database_environment = _minimal_database_environment(source_environment)
    try:
        completed = subprocess.run(
            command,
            input=sql,
            capture_output=True,
            text=True,
            timeout=45,
            check=False,
            env=database_environment,
        )
    except subprocess.TimeoutExpired as exc:
        if destructive:
            raise DatabaseApplyOutcomeUnverified(
                "database_apply_outcome_unverified"
            ) from exc
        raise ToolError("database_operation_failed") from exc
    except (OSError, UnicodeError, KeyboardInterrupt) as exc:
        if destructive:
            raise DatabaseApplyOutcomeUnverified(
                "database_apply_outcome_unverified"
            ) from exc
        raise ToolError("database_operation_failed") from exc
    if completed.returncode != 0:
        if destructive:
            raise DatabaseApplyOutcomeUnverified("database_apply_outcome_unverified")
        raise ToolError("database_operation_failed")
    try:
        return _parse_result(completed.stdout)
    except ToolError as exc:
        if destructive:
            raise DatabaseApplyOutcomeUnverified(
                "database_apply_outcome_unverified"
            ) from exc
        raise


def _execute_sql_with_expected(args: argparse.Namespace) -> str:
    expected_table = """
CREATE TEMPORARY TABLE pg_temp.skillpilot_claude_v1_revoke_expected (
    oauth bigint NOT NULL,
    consents bigint NOT NULL,
    sessions bigint NOT NULL,
    idempotency bigint NOT NULL,
    target_sha256 varchar(64) NOT NULL
) ON COMMIT DROP;
INSERT INTO pg_temp.skillpilot_claude_v1_revoke_expected
    (oauth, consents, sessions, idempotency, target_sha256)
VALUES (
    :expect_oauth,
    :expect_consents,
    :expect_sessions,
    :expect_idempotency,
    :'expect_target_sha256'
);
""".strip()
    marker = COMMON_GUARDS_SQL
    return EXECUTE_SQL.replace(marker, marker + "\n" + expected_table, 1)


def _run(args: argparse.Namespace, tool_sha256: str) -> DatabaseResult:
    if os.geteuid() != 0:
        raise ToolError("root_required")
    service_name = DEFAULT_SERVICE
    environment_file = DEFAULT_ENVIRONMENT_FILE
    _validate_installed_tool(tool_sha256)
    _validate_environment_file(environment_file)
    require_containment = args.operation == "execute"
    process_environment, service_identity = _validate_service_environment(
        service_name, environment_file, require_containment=require_containment
    )
    if require_containment:
        _validate_nginx_containment()
    _validate_service_process_unchanged(service_name, service_identity)
    if args.operation == "execute":
        result = _run_psql(
            _execute_sql_with_expected(args),
            process_environment,
            {
                "expect_oauth": args.expect_oauth,
                "expect_consents": args.expect_consents,
                "expect_sessions": args.expect_sessions,
                "expect_idempotency": args.expect_idempotency,
                "expect_target_sha256": args.expect_target_sha256,
            },
            destructive=True,
        )
        try:
            _validate_service_process_unchanged(service_name, service_identity)
            _validate_nginx_containment()
        except (
            ToolError,
            OSError,
            UnicodeError,
            subprocess.TimeoutExpired,
            KeyboardInterrupt,
        ) as exc:
            raise AppliedButContainmentUnverified(result) from exc
        return result
    result = _run_psql(PLAN_SQL, process_environment)
    _validate_service_process_unchanged(service_name, service_identity)
    return result


def _nonnegative(value: str) -> int:
    if not re.fullmatch(r"0|[1-9][0-9]{0,18}", value):
        raise argparse.ArgumentTypeError("must be a non-negative integer")
    parsed = int(value)
    if parsed > 9223372036854775807:
        raise argparse.ArgumentTypeError("must fit a PostgreSQL bigint")
    return parsed


class _SafeArgumentParser(argparse.ArgumentParser):
    def error(self, message: str) -> None:
        del message
        raise ToolError("invalid_arguments")


def _parser() -> argparse.ArgumentParser:
    parser = _SafeArgumentParser(
        description="Plan or execute Claude v1 credential revocation.",
        allow_abbrev=False,
    )
    parser.add_argument("operation", choices=("plan", "execute"))
    parser.add_argument("--procedure-id", required=True)
    parser.add_argument("--incident-id", required=True)
    parser.add_argument("--expect-oauth", type=_nonnegative)
    parser.add_argument("--expect-consents", type=_nonnegative)
    parser.add_argument("--expect-sessions", type=_nonnegative)
    parser.add_argument("--expect-idempotency", type=_nonnegative)
    parser.add_argument("--expect-target-sha256")
    parser.add_argument("--expect-tool-sha256")
    parser.add_argument("--confirm")
    return parser


def _reject_secret_arguments(argv: Sequence[str]) -> None:
    forbidden = {
        "--database-url",
        "--dsn",
        "--learner-id",
        "--password",
        "--session-id",
        "--sql",
        "--token",
    }
    seen_options: set[str] = set()
    for argument in argv:
        option = argument.split("=", 1)[0]
        if option in forbidden:
            raise ToolError("secret_arguments_forbidden")
        if option.startswith("--"):
            if option in seen_options:
                raise ToolError("duplicate_arguments")
            seen_options.add(option)


def _validate_args(args: argparse.Namespace, tool_sha256: str) -> None:
    if args.procedure_id != PROCEDURE_ID:
        raise ToolError("invalid_procedure_id")
    if not re.fullmatch(r"[A-Z0-9][A-Z0-9._-]{5,95}", args.incident_id):
        raise ToolError("invalid_incident_id")
    expected = (
        args.expect_oauth,
        args.expect_consents,
        args.expect_sessions,
        args.expect_idempotency,
    )
    if args.operation == "plan":
        if (
            any(value is not None for value in expected)
            or args.expect_target_sha256 is not None
            or args.expect_tool_sha256 is not None
            or args.confirm is not None
        ):
            raise ToolError("plan_must_not_accept_execute_arguments")
    else:
        if (
            any(value is None for value in expected)
            or not re.fullmatch(r"[0-9a-f]{64}", args.expect_target_sha256 or "")
            or not re.fullmatch(r"[0-9a-f]{64}", args.expect_tool_sha256 or "")
            or args.confirm != CONFIRMATION
        ):
            raise ToolError("execute_confirmation_incomplete")
        if args.expect_tool_sha256 != tool_sha256:
            raise ToolError("tool_sha256_mismatch")


def main(argv: Sequence[str] | None = None) -> int:
    arguments = list(sys.argv[1:] if argv is None else argv)
    operation = (
        arguments[0] if arguments and arguments[0] in {"plan", "execute"} else "unknown"
    )
    incident_id = "UNAVAILABLE"
    tool_sha256 = "unavailable"
    args: argparse.Namespace | None = None
    try:
        tool_sha256 = _sha256(Path(__file__))
        _reject_secret_arguments(arguments)
        parser = _parser()
        args, unknown = parser.parse_known_args(arguments)
        if unknown:
            raise ToolError("unknown_arguments")
        operation = args.operation
        _validate_args(args, tool_sha256)
        incident_id = args.incident_id
        result = _run(args, tool_sha256)
        payload = _safe_output(
            tool_sha256=tool_sha256,
            operation=args.operation,
            incident_id=args.incident_id,
            status="planned" if args.operation == "plan" else "applied",
            counts=result[:4],
            target_sha256=result[4],
        )
        _print_output(payload)
        return 0
    except AppliedButContainmentUnverified as exc:
        _print_output(
            _safe_output(
                tool_sha256=tool_sha256,
                operation=operation,
                incident_id=incident_id,
                status="applied_but_containment_unverified",
                counts=exc.counts,
                target_sha256=exc.target_sha256,
                error=exc.code,
            )
        )
        return 1
    except DatabaseApplyOutcomeUnverified as exc:
        expected_counts = None
        if args is not None:
            expected_counts = (
                args.expect_oauth,
                args.expect_consents,
                args.expect_sessions,
                args.expect_idempotency,
            )
        _print_output(
            _safe_output(
                tool_sha256=tool_sha256,
                operation=operation,
                incident_id=incident_id,
                status="apply_outcome_unverified",
                expected_counts=expected_counts,
                expected_target_sha256=(
                    args.expect_target_sha256 if args is not None else None
                ),
                error=exc.code,
            )
        )
        return 1
    except (
        ToolError,
        OSError,
        UnicodeError,
        subprocess.TimeoutExpired,
        KeyboardInterrupt,
    ) as exc:
        error = exc.code if isinstance(exc, ToolError) else "operation_failed"
        _print_output(
            _safe_output(
                tool_sha256=tool_sha256,
                operation=operation,
                incident_id=incident_id,
                status="failed",
                error=error,
            )
        )
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
