#!/usr/bin/env python3
"""Hermetic contract tests for the language-neutral OpenAI V1 public edge."""

from __future__ import annotations

import importlib.util
from pathlib import Path
import subprocess
import unittest


ROOT = Path(__file__).resolve().parents[1]
METADATA_VALIDATOR_PATH = ROOT / "scripts" / "validate_openai_oauth_metadata.py"
SPEC = importlib.util.spec_from_file_location(
    "validate_openai_oauth_metadata", METADATA_VALIDATOR_PATH
)
assert SPEC is not None and SPEC.loader is not None
METADATA_MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(METADATA_MODULE)
MetadataValidationError = METADATA_MODULE.MetadataValidationError


def nginx_location(config: str, declaration: str) -> str:
    """Return one complete nginx location block, including nested braces."""
    start = config.index(declaration)
    opening = config.index("{", start)
    depth = 0
    for index in range(opening, len(config)):
        if config[index] == "{":
            depth += 1
        elif config[index] == "}":
            depth -= 1
            if depth == 0:
                return config[start : index + 1]
    raise AssertionError(f"unterminated nginx block: {declaration}")


def effective_nginx_lines(config: str) -> list[str]:
    """Return directives without comments or blank lines."""
    return [
        line.strip()
        for line in config.splitlines()
        if line.strip() and not line.lstrip().startswith("#")
    ]


class OAuthMetadataContractTest(unittest.TestCase):
    MCP_ORIGIN = "https://mcp-coach-v1.skillpilot.com"
    AUTHORIZATION_ORIGIN = "https://skillpilot.com"
    V1_RESOURCE = f"{MCP_ORIGIN}/mcp"

    def metadata(self, resource: str) -> dict[str, object]:
        return {
            "resource": resource,
            "authorization_servers": [
                f"{self.AUTHORIZATION_ORIGIN}/api/openai/v1"
            ],
            "scopes_supported": [
                METADATA_MODULE.READ_SCOPE,
                METADATA_MODULE.WRITE_SCOPE,
            ],
            "bearer_methods_supported": ["header"],
        }

    def test_accepts_exact_path_scoped_v1_resource(self) -> None:
        METADATA_MODULE.validate_protected_resource(
            self.metadata(self.V1_RESOURCE),
            self.MCP_ORIGIN,
            self.V1_RESOURCE,
            self.AUTHORIZATION_ORIGIN,
        )

    def test_rejects_metadata_bound_to_another_resource(self) -> None:
        with self.assertRaisesRegex(MetadataValidationError, "resource"):
            METADATA_MODULE.validate_protected_resource(
                self.metadata(f"{self.AUTHORIZATION_ORIGIN}/api/openai/v1/mcp"),
                self.MCP_ORIGIN,
                self.V1_RESOURCE,
                self.AUTHORIZATION_ORIGIN,
            )


class PublicEdgeDeploymentContractTest(unittest.TestCase):
    RESERVED_HOSTS = tuple(
        f"mcp-coach-v{major}.skillpilot.com" for major in range(2, 10)
    )

    @staticmethod
    def coaches_config() -> str:
        return (
            ROOT / "deploy" / "nginx" / "skillpilot-mcp-coaches.conf"
        ).read_text(encoding="utf-8")

    @classmethod
    def active_v1_server(cls) -> str:
        coaches = cls.coaches_config()
        start = coaches.index("# The only currently active public plugin contract.")
        end = coaches.index("# Reserved future major versions.")
        return coaches[start:end]

    def test_nginx_routes_public_v1_endpoints_to_line_scoped_internal_paths(self) -> None:
        coaches = self.coaches_config()
        self.assertIn(
            "proxy_pass http://127.0.0.1:8787/internal/openai/v1/mcp;",
            coaches,
        )
        self.assertIn(
            "proxy_pass http://127.0.0.1:8787/internal/openai/v1/"
            "protected-resource-metadata;",
            coaches,
        )
        self.assertIn(
            "proxy_pass http://127.0.0.1:8787/internal/openai/v1/"
            "openai-apps-challenge;",
            coaches,
        )
        self.assertNotIn("/bootstrap/v1/launch", coaches)
        self.assertNotIn(
            "proxy_pass http://127.0.0.1:8787/.well-known/", coaches
        )
        self.assertEqual(
            coaches.count("server_name mcp-coach-v1.skillpilot.com;"),
            1,
        )
        http_redirect = coaches.split(
            "# The only currently active public plugin contract.", 1
        )[0]
        self.assertIn("mcp-coach-v1.skillpilot.com", http_redirect)
        for reserved_host in self.RESERVED_HOSTS:
            self.assertEqual(coaches.count(reserved_host), 2)
        self.assertNotIn("mcp-coach-de-v", coaches)
        self.assertNotIn("mcp-coach-en-v", coaches)

    def test_v1_vhost_requests_and_verifies_the_openai_client_certificate(self) -> None:
        active = self.active_v1_server()
        self.assertIn(
            "ssl_client_certificate "
            "/etc/skillpilot/openai-mtls/openai-client-ca-bundle.pem;",
            active,
        )
        self.assertIn(
            "ssl_trusted_certificate "
            "/etc/skillpilot/openai-mtls/openai-client-ca-bundle.pem;",
            active,
        )
        self.assertIn("ssl_verify_client optional;", active)
        self.assertIn("ssl_verify_depth 2;", active)
        self.assertIn(
            "include /etc/skillpilot/openai-mtls/mode.conf;",
            active,
        )
        self.assertIn(
            "error_page 495 496 =403 @skillpilot_openai_mtls_rejected;",
            active,
        )
        rejected = nginx_location(
            active, "location @skillpilot_openai_mtls_rejected {"
        )
        self.assertIn("return 403;", rejected)

        reserved = self.coaches_config().split(
            "# Reserved future major versions.", 1
        )[1]
        self.assertNotIn("ssl_verify_client", reserved)
        self.assertNotIn("openai-client-ca-bundle.pem", reserved)

    def test_root_owned_mode_sources_are_fixed_observe_or_enforce_literals(self) -> None:
        nginx_dir = ROOT / "deploy" / "nginx"
        observe = (nginx_dir / "skillpilot-openai-mtls-mode-observe.conf").read_text(
            encoding="utf-8"
        )
        enforce = (nginx_dir / "skillpilot-openai-mtls-mode-enforce.conf").read_text(
            encoding="utf-8"
        )
        self.assertEqual(
            effective_nginx_lines(observe),
            ["set $skillpilot_openai_mtls_mode observe;"],
        )
        self.assertEqual(
            effective_nginx_lines(enforce),
            ["set $skillpilot_openai_mtls_mode enforce;"],
        )
        for source in (observe, enforce):
            self.assertNotIn("$http_", source)
            self.assertNotIn("$arg_", source)

    def test_every_mcp_request_uses_only_the_loopback_verifier_classification(self) -> None:
        active = self.active_v1_server()
        verifier = nginx_location(
            active, "location = /_skillpilot_openai_mtls_verify {"
        )
        self.assertIn("internal;", verifier)
        self.assertIn("proxy_pass http://127.0.0.1:8792/verify;", verifier)
        self.assertIn("proxy_method GET;", verifier)
        self.assertIn("proxy_pass_request_body off;", verifier)
        self.assertIn("proxy_pass_request_headers off;", verifier)
        self.assertIn("proxy_connect_timeout 2s;", verifier)
        self.assertIn("proxy_send_timeout 2s;", verifier)
        self.assertIn("proxy_read_timeout 15s;", verifier)
        self.assertIn(
            "proxy_set_header X-SkillPilot-OpenAI-mTLS-Mode "
            "$skillpilot_openai_mtls_mode;",
            verifier,
        )
        self.assertIn(
            "proxy_set_header X-SkillPilot-OpenAI-mTLS-Remote-Addr "
            "$realip_remote_addr;",
            verifier,
        )
        self.assertIn(
            "proxy_set_header X-SkillPilot-OpenAI-mTLS-Client-Verify "
            "$ssl_client_verify;",
            verifier,
        )
        self.assertIn(
            "proxy_set_header X-SkillPilot-OpenAI-mTLS-Client-Cert "
            "$ssl_client_escaped_cert;",
            verifier,
        )
        self.assertIn('proxy_set_header Authorization "";', verifier)
        self.assertIn('proxy_set_header Cookie "";', verifier)
        self.assertIn('proxy_set_header X-Forwarded-For "";', verifier)
        self.assertIn('proxy_set_header Forwarded "";', verifier)
        for header in (
            "X-SkillPilot-OpenAI-mTLS-Classification",
            "X-SkillPilot-OpenAI-mTLS-SAN",
            "X-SkillPilot-OpenAI-mTLS-Status",
            "X-SkillPilot-OpenAI-mTLS-Verified",
            "X-OpenAI-Client-Verify",
            "X-OpenAI-Client-Cert",
            "X-SSL-Client-Verify",
            "X-SSL-Client-Cert",
            "X-SSL-Cert",
            "SSL-Client-Verify",
            "SSL-Client-Cert",
            "X-Client-Cert",
            "X-Client-Certificate",
            "X-TLS-Client-Cert",
            "X-Verified-Client-Cert",
            "X-Forwarded-Client-Cert",
            "X-Forwarded-TLS-Client-Cert",
        ):
            self.assertIn(f'proxy_set_header {header} "";', verifier)
        self.assertNotIn("$http_", verifier)
        self.assertNotIn("$proxy_add_x_forwarded_for", verifier)

        mcp = nginx_location(active, "location = /mcp {")
        self.assertIn("auth_request /_skillpilot_openai_mtls_verify;", mcp)
        self.assertEqual(
            active.count("auth_request /_skillpilot_openai_mtls_verify;"),
            1,
        )
        self.assertIn(
            "auth_request_set $skillpilot_openai_mtls_classification\n"
            "            $upstream_http_x_skillpilot_openai_mtls_classification;",
            mcp,
        )
        self.assertIn(
            "auth_request_set $skillpilot_openai_mtls_san\n"
            "            $upstream_http_x_skillpilot_openai_mtls_san;",
            mcp,
        )
        self.assertIn(
            "proxy_set_header X-SkillPilot-OpenAI-mTLS-Mode "
            "$skillpilot_openai_mtls_mode;",
            mcp,
        )
        self.assertIn(
            "proxy_set_header X-SkillPilot-OpenAI-mTLS-Classification\n"
            "            $skillpilot_openai_mtls_classification;",
            mcp,
        )
        self.assertIn(
            "proxy_set_header X-SkillPilot-OpenAI-mTLS-SAN "
            "$skillpilot_openai_mtls_san;",
            mcp,
        )
        self.assertNotIn("$http_", mcp)
        self.assertNotIn("$arg_", mcp)
        self.assertNotIn("if (", mcp)

        # There is no public header, query-string, or URL lane which can claim
        # LOCAL_OPERATOR. Only the verifier receives nginx's original socket peer.
        self.assertEqual(
            active.count(
                "X-SkillPilot-OpenAI-mTLS-Remote-Addr $realip_remote_addr;"
            ),
            1,
        )
        self.assertNotIn("location = /operator", active)
        self.assertNotIn("location = /mcp-test", active)

    def test_mcp_overwrites_forwarding_and_certificate_aliases(self) -> None:
        mcp = nginx_location(self.active_v1_server(), "location = /mcp {")
        self.assertIn(
            "proxy_set_header Host mcp-coach-v1.skillpilot.com;",
            mcp,
        )
        self.assertIn("proxy_set_header X-Forwarded-For $remote_addr;", mcp)
        self.assertIn('proxy_set_header Forwarded "";', mcp)
        self.assertIn('proxy_set_header X-Forwarded-Prefix "";', mcp)
        self.assertNotIn("$proxy_add_x_forwarded_for", mcp)

        for header in (
            "X-Forwarded-Server",
            "X-Forwarded-Ssl",
            "X-Forwarded-Protocol",
            "X-Forwarded-Scheme",
            "X-Original-Forwarded-For",
            "Front-End-Https",
            "X-Url-Scheme",
            "X-SkillPilot-OpenAI-mTLS-Status",
            "X-SkillPilot-OpenAI-mTLS-Verified",
            "X-SkillPilot-OpenAI-mTLS-Remote-Addr",
            "X-SkillPilot-OpenAI-mTLS-Client-Verify",
            "X-SkillPilot-OpenAI-mTLS-Client-Cert",
            "X-OpenAI-Client-Verify",
            "X-OpenAI-Client-Cert",
            "X-SSL-Client-Verify",
            "X-SSL-Client-Cert",
            "X-SSL-Cert",
            "SSL-Client-Verify",
            "SSL-Client-Cert",
            "X-Client-Cert",
            "X-Client-Certificate",
            "X-TLS-Client-Cert",
            "X-Verified-Client-Cert",
            "X-Forwarded-Client-Cert",
            "X-Forwarded-TLS-Client-Cert",
        ):
            self.assertIn(f'proxy_set_header {header} "";', mcp)

    def test_metadata_and_challenge_remain_public_and_strip_mtls_identity(self) -> None:
        active = self.active_v1_server()
        for declaration in (
            "location = /.well-known/oauth-protected-resource/mcp {",
            "location = /.well-known/openai-apps-challenge {",
        ):
            public = nginx_location(active, declaration)
            self.assertNotIn("auth_request", public)
            self.assertIn("proxy_set_header X-Forwarded-For $remote_addr;", public)
            self.assertIn('proxy_set_header Forwarded "";', public)
            self.assertIn('proxy_set_header X-Forwarded-Prefix "";', public)
            for header in (
                "X-Forwarded-Server",
                "X-Forwarded-Ssl",
                "X-Forwarded-Protocol",
                "X-Forwarded-Scheme",
                "X-Original-Forwarded-For",
                "Front-End-Https",
                "X-Url-Scheme",
                "X-SkillPilot-OpenAI-mTLS-Mode",
                "X-SkillPilot-OpenAI-mTLS-Classification",
                "X-SkillPilot-OpenAI-mTLS-SAN",
                "X-SkillPilot-OpenAI-mTLS-Status",
                "X-SkillPilot-OpenAI-mTLS-Verified",
                "X-SkillPilot-OpenAI-mTLS-Remote-Addr",
                "X-SkillPilot-OpenAI-mTLS-Client-Verify",
                "X-SkillPilot-OpenAI-mTLS-Client-Cert",
                "X-OpenAI-Client-Verify",
                "X-OpenAI-Client-Cert",
                "X-SSL-Client-Verify",
                "X-SSL-Client-Cert",
                "X-SSL-Cert",
                "SSL-Client-Verify",
                "SSL-Client-Cert",
                "X-Client-Cert",
                "X-Client-Certificate",
                "X-TLS-Client-Cert",
                "X-Verified-Client-Cert",
                "X-Forwarded-Client-Cert",
                "X-Forwarded-TLS-Client-Cert",
            ):
                self.assertIn(f'proxy_set_header {header} "";', public)

    def test_main_origin_denies_every_v1_internal_target(self) -> None:
        deny = (
            ROOT
            / "deploy"
            / "nginx"
            / "skillpilot-main-vhost-openai-deny-locations.conf"
        ).read_text(encoding="utf-8")
        self.assertIn("location ^~ /internal/openai/v1/ {", deny)
        self.assertIn("location ^~ /api/openai/de/v1/mcp {", deny)
        self.assertIn("location ^~ /api/openai/de/mcp {", deny)
        for path in (
            "/.well-known/oauth-protected-resource",
            "/.well-known/openai-apps-challenge",
        ):
            self.assertIn(f"location = {path} {{", deny)

    def test_public_edge_script_is_valid_shell(self) -> None:
        completed = subprocess.run(
            ["bash", "-n", str(ROOT / "scripts" / "verify_openai_v1_public_edge.sh")],
            check=False,
            capture_output=True,
            text=True,
        )
        self.assertEqual(completed.returncode, 0, completed.stderr)

    def test_public_edge_smoke_checks_exact_dedicated_origin_contract(self) -> None:
        script = (ROOT / "scripts" / "verify_openai_v1_public_edge.sh").read_text(
            encoding="utf-8"
        )
        self.assertIn(
            'MCP_ORIGIN="https://mcp-coach-v1.skillpilot.com"', script
        )
        self.assertIn(
            'MCP_URL="${MCP_ORIGIN}/mcp"', script
        )
        self.assertIn(
            'METADATA_URL="${MCP_ORIGIN}/.well-known/'
            'oauth-protected-resource/mcp"',
            script,
        )
        self.assertIn(
            'CHALLENGE_URL="${MCP_ORIGIN}/.well-known/openai-apps-challenge"',
            script,
        )
        self.assertNotIn("/bootstrap/v1/launch", script)
        self.assertIn(
            'AUTHORIZATION_METADATA_URL="${AUTHORIZATION_ORIGIN}/.well-known/'
            'oauth-authorization-server/api/openai/v1"',
            script,
        )
        self.assertIn(
            'ISSUER_DISCOVERY_URL="${AUTHORIZATION_ORIGIN}/api/openai/v1/'
            '.well-known/openid-configuration"',
            script,
        )
        self.assertIn("canonical_oauth_discovery", script)
        self.assertIn("issuer_relative_oauth_discovery", script)
        self.assertIn("oauth_discovery_alias_parity", script)
        self.assertIn("cmp -s", script)
        self.assertIn("--proto '=https'", script)
        self.assertIn("--max-redirs 0", script)
        self.assertIn("--connect-timeout 5", script)
        self.assertIn("--max-time 15", script)
        self.assertIn('if [[ "${mcp_status}" != "401" ]]', script)
        self.assertIn("resource_metadata=", script)
        self.assertIn("public_mcp_mtls_spoofing", script)
        self.assertIn("X-SkillPilot-OpenAI-mTLS-Classification: VERIFIED", script)
        self.assertIn("X-Forwarded-For: 127.0.0.1", script)
        self.assertIn("skillpilot_mtls_classification=LOCAL_OPERATOR", script)
        self.assertIn("legacy_main_origin_mcp_route", script)
        self.assertIn("abandoned_versioned_main_origin_mcp_route", script)
        self.assertIn("internal_openai_mcp_route", script)
        self.assertIn("trailing_slash_mcp_route", script)
        self.assertIn("assert_removed_get_route", script)
        self.assertIn("internal_protected_resource_metadata_route", script)
        self.assertIn(
            'INTERNAL_METADATA_URL="${AUTHORIZATION_ORIGIN}/internal/openai/'
            'v1/protected-resource-metadata"',
            script,
        )
        self.assertIn(
            'INTERNAL_CHALLENGE_URL="${AUTHORIZATION_ORIGIN}/internal/openai/'
            'v1/openai-apps-challenge"',
            script,
        )
        self.assertIn("internal_openai_apps_challenge_route", script)
        self.assertIn("removed_common_protected_resource_metadata_route", script)
        self.assertIn("removed_common_openai_apps_challenge_route", script)
        self.assertIn("expected direct GET HTTP 404", script)
        self.assertIn("web-sandbox.oaiusercontent.com", script)
        self.assertIn("--header 'Origin: null'", script)
        self.assertIn("expected Access-Control-Allow-Origin *", script)
        self.assertIn("public image response must not allow credentials", script)
        for reserved_host in self.RESERVED_HOSTS:
            self.assertIn(f'"https://{reserved_host}"', script)
        self.assertIn("assert_reserved_origin", script)
        self.assertIn("reserved_origin_tls", script)
        self.assertIn("reserved_origin_fail_closed", script)
        self.assertIn("%{ssl_verify_result}", script)
        self.assertIn('if [[ "${status}" != "404"', script)
        self.assertNotIn("mcp-v1.skillpilot.com", script)

    def test_deploy_runs_public_smoke_unconditionally_after_readiness(self) -> None:
        script = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        readiness_index = script.rindex('wait_for_public_readiness "${SMOKE_BASE_URL}"')
        smoke_index = script.rindex("verify_openai_v1_mtls_edge.sh --runtime")
        self.assertLess(readiness_index, smoke_index)
        self.assertIn(
            'if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then',
            script,
        )
        self.assertNotIn("SKILLPILOT_OPENAI_DE_V1_PUBLIC_EDGE_SMOKE_ENABLED", script)
        self.assertNotIn("SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED", script)
        mtls_verifier = (
            ROOT / "scripts" / "verify_openai_v1_mtls_edge.sh"
        ).read_text(encoding="utf-8")
        self.assertIn('"${ROOT_DIR}/scripts/verify_openai_v1_public_edge.sh"', mtls_verifier)

    def test_focused_backend_security_tests_run_before_restart(self) -> None:
        script = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        test_index = script.index("OpenAiDeSecureModeConfigurationTest")
        restart_index = script.index('echo "Starte Service neu..."')
        self.assertLess(test_index, restart_index)
        self.assertIn("OpenAiDeOAuthConfigurationTest", script)
        self.assertIn("OpenAiDeOAuthDiscoveryBootstrapIntegrationTest", script)
        self.assertIn("OpenAiDePublicOAuthContextIntegrationTest", script)

    def test_ci_keeps_the_public_edge_contract_job(self) -> None:
        workflow = (ROOT / ".github" / "workflows" / "ci.yml").read_text(
            encoding="utf-8"
        )
        self.assertIn("openai-v1-public-edge-ci:", workflow)
        self.assertIn("scripts/test_openai_v1_public_edge.py", workflow)


if __name__ == "__main__":
    unittest.main()
