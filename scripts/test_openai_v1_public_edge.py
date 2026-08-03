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

    def test_nginx_routes_public_v1_endpoints_to_line_scoped_internal_paths(self) -> None:
        coaches = (ROOT / "deploy" / "nginx" / "skillpilot-mcp-coaches.conf").read_text(
            encoding="utf-8"
        )
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
        self.assertNotIn(
            "proxy_pass http://127.0.0.1:8787/.well-known/", coaches
        )
        self.assertIn("server_name mcp-coach-v1.skillpilot.com;", coaches)
        self.assertEqual(coaches.count("mcp-coach-v1.skillpilot.com"), 2)
        for reserved_host in self.RESERVED_HOSTS:
            self.assertEqual(coaches.count(reserved_host), 2)
        self.assertNotIn("mcp-coach-de-v", coaches)
        self.assertNotIn("mcp-coach-en-v", coaches)

    def test_main_origin_denies_every_v1_internal_target(self) -> None:
        deny = (
            ROOT
            / "deploy"
            / "nginx"
            / "skillpilot-main-vhost-openai-deny-locations.conf"
        ).read_text(encoding="utf-8")
        for path in (
            "/internal/openai/v1/mcp",
            "/internal/openai/v1/protected-resource-metadata",
            "/internal/openai/v1/openai-apps-challenge",
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
        self.assertIn("--proto '=https'", script)
        self.assertIn("--max-redirs 0", script)
        self.assertIn("--connect-timeout 5", script)
        self.assertIn("--max-time 15", script)
        self.assertIn('if [[ "${mcp_status}" != "401" ]]', script)
        self.assertIn("resource_metadata=", script)
        self.assertIn("legacy_main_origin_mcp_route", script)
        self.assertIn("abandoned_versioned_main_origin_mcp_route", script)
        self.assertIn("internal_openai_mcp_route", script)
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
        self.assertNotIn("mTLS", script)
        self.assertNotIn("mcp-v1.skillpilot.com", script)

    def test_deploy_runs_public_smoke_unconditionally_after_readiness(self) -> None:
        script = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        readiness_index = script.rindex('wait_for_public_readiness "${SMOKE_BASE_URL}"')
        smoke_index = script.index("verify_openai_v1_public_edge.sh")
        self.assertLess(readiness_index, smoke_index)
        self.assertIn(
            'if [ "${VITE_SKILLPILOT_COACH_VARIANT}" = "openai-mcp" ]; then',
            script,
        )
        self.assertNotIn("SKILLPILOT_OPENAI_DE_V1_PUBLIC_EDGE_SMOKE_ENABLED", script)
        self.assertNotIn("SKILLPILOT_OPENAI_DE_MTLS_EDGE_ENABLED", script)
        self.assertNotIn("verify_openai_mtls_edge.sh", script)

    def test_focused_backend_security_tests_run_before_restart(self) -> None:
        script = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        test_index = script.index("OpenAiDeSecureModeConfigurationTest")
        restart_index = script.index('echo "Starte Service neu..."')
        self.assertLess(test_index, restart_index)
        self.assertIn("OpenAiDeOAuthConfigurationTest", script)
        self.assertIn("OpenAiDeOAuthDiscoveryBootstrapIntegrationTest", script)
        self.assertIn("OpenAiDePublicOAuthContextIntegrationTest", script)
        self.assertNotIn("OpenAiDeMtlsEdgeFilterTest", script)

    def test_ci_has_only_the_non_mtls_public_edge_job(self) -> None:
        workflow = (ROOT / ".github" / "workflows" / "ci.yml").read_text(
            encoding="utf-8"
        )
        self.assertIn("openai-v1-public-edge-ci:", workflow)
        self.assertIn("scripts/test_openai_v1_public_edge.py", workflow)
        self.assertNotIn("openai-mtls-edge-ci:", workflow)
        self.assertNotIn("verify_openai_mtls_edge.sh", workflow)


if __name__ == "__main__":
    unittest.main()
