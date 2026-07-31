#!/usr/bin/env python3
"""Self-contained certificate and edge-contract tests for OpenAI MCP mTLS."""

from __future__ import annotations

import importlib.util
import os
from pathlib import Path
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
VERIFIER_PATH = ROOT / "scripts" / "openai_mtls_verifier.py"
SPEC = importlib.util.spec_from_file_location("openai_mtls_verifier", VERIFIER_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
CertificateVerifier = MODULE.CertificateVerifier
METADATA_VALIDATOR_PATH = (
    ROOT / "scripts" / "validate_openai_oauth_metadata.py"
)
METADATA_SPEC = importlib.util.spec_from_file_location(
    "validate_openai_oauth_metadata", METADATA_VALIDATOR_PATH
)
assert METADATA_SPEC and METADATA_SPEC.loader
METADATA_MODULE = importlib.util.module_from_spec(METADATA_SPEC)
METADATA_SPEC.loader.exec_module(METADATA_MODULE)
MetadataValidationError = METADATA_MODULE.MetadataValidationError


class OpenAiMtlsVerifierTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.directory = Path(self.temporary.name)
        self._create_ca("root", None, "CA:TRUE,pathlen:1")
        self._create_ca("intermediate", "root", "CA:TRUE,pathlen:0")
        self.bundle = self.directory / "bundle.pem"
        self.bundle.write_text(
            (self.directory / "intermediate.crt").read_text()
            + (self.directory / "root.crt").read_text(),
            encoding="utf-8",
        )
        self.verifier = CertificateVerifier(
            self.directory / "root.crt",
            self.directory / "intermediate.crt",
            expected_root_fingerprint=CertificateVerifier.certificate_fingerprint(
                self.directory / "root.crt"
            ),
            expected_intermediate_fingerprint=CertificateVerifier.certificate_fingerprint(
                self.directory / "intermediate.crt"
            ),
        )

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def test_accepts_openai_san_and_client_auth_leaf(self) -> None:
        leaf = self._create_leaf(
            "valid", "intermediate", MODULE.EXPECTED_SAN, "clientAuth"
        )
        self.assertTrue(self.verifier.verify(leaf)[0])

    def test_rejects_wrong_san(self) -> None:
        leaf = self._create_leaf(
            "wrong-san", "intermediate", "example.com", "clientAuth"
        )
        self.assertEqual(self.verifier.verify(leaf), (False, "unexpected_san"))

    def test_rejects_additional_dns_san(self) -> None:
        leaf = self._create_leaf(
            "additional-san",
            "intermediate",
            f"{MODULE.EXPECTED_SAN},DNS:example.com",
            "clientAuth",
        )
        self.assertEqual(self.verifier.verify(leaf), (False, "unexpected_san"))

    def test_rejects_leaf_without_client_auth_eku(self) -> None:
        leaf = self._create_leaf(
            "wrong-eku", "intermediate", MODULE.EXPECTED_SAN, "serverAuth"
        )
        self.assertEqual(
            self.verifier.verify(leaf),
            (False, "invalid_chain_or_client_eku"),
        )

    def test_rejects_untrusted_chain(self) -> None:
        self._create_ca("other-root", None, "CA:TRUE,pathlen:1")
        leaf = self._create_leaf(
            "other-leaf", "other-root", MODULE.EXPECTED_SAN, "clientAuth"
        )
        self.assertEqual(
            self.verifier.verify(leaf),
            (False, "invalid_chain_or_client_eku"),
        )

    def test_rejects_leaf_that_does_not_chain_through_expected_intermediate(self) -> None:
        leaf = self._create_leaf(
            "root-leaf", "root", MODULE.EXPECTED_SAN, "clientAuth"
        )
        self.assertEqual(
            self.verifier.verify(leaf),
            (False, "unexpected_intermediate"),
        )

    def test_rejects_an_unexpected_intermediate_at_startup(self) -> None:
        self._create_ca("other-root", None, "CA:TRUE,pathlen:1")
        self._create_ca("other-intermediate", "other-root", "CA:TRUE,pathlen:0")

        with self.assertRaisesRegex(ValueError, "unexpected certificate fingerprint"):
            CertificateVerifier(
                self.directory / "root.crt",
                self.directory / "other-intermediate.crt",
                expected_root_fingerprint=CertificateVerifier.certificate_fingerprint(
                    self.directory / "root.crt"
                ),
                expected_intermediate_fingerprint=CertificateVerifier.certificate_fingerprint(
                    self.directory / "intermediate.crt"
                ),
            )

    def _create_ca(self, name: str, issuer: str | None, constraints: str) -> None:
        key = self.directory / f"{name}.key"
        csr = self.directory / f"{name}.csr"
        certificate = self.directory / f"{name}.crt"
        self._run("genrsa", "-out", str(key), "2048")
        self._run(
            "req",
            "-new",
            "-key",
            str(key),
            "-out",
            str(csr),
            "-subj",
            f"/CN={name}",
        )
        extension = self.directory / f"{name}.ext"
        extension.write_text(
            f"basicConstraints=critical,{constraints}\n"
            "keyUsage=critical,keyCertSign,cRLSign\n",
            encoding="utf-8",
        )
        if issuer is None:
            self._run(
                "x509",
                "-req",
                "-in",
                str(csr),
                "-signkey",
                str(key),
                "-out",
                str(certificate),
                "-days",
                "2",
                "-extfile",
                str(extension),
            )
        else:
            self._run(
                "x509",
                "-req",
                "-in",
                str(csr),
                "-CA",
                str(self.directory / f"{issuer}.crt"),
                "-CAkey",
                str(self.directory / f"{issuer}.key"),
                "-CAcreateserial",
                "-out",
                str(certificate),
                "-days",
                "2",
                "-extfile",
                str(extension),
            )

    def _create_leaf(
        self, name: str, issuer: str, san: str, extended_key_usage: str
    ) -> str:
        key = self.directory / f"{name}.key"
        csr = self.directory / f"{name}.csr"
        certificate = self.directory / f"{name}.crt"
        extension = self.directory / f"{name}.ext"
        self._run("genrsa", "-out", str(key), "2048")
        self._run(
            "req",
            "-new",
            "-key",
            str(key),
            "-out",
            str(csr),
            "-subj",
            f"/CN={name}",
        )
        extension.write_text(
            "basicConstraints=critical,CA:FALSE\n"
            "keyUsage=critical,digitalSignature\n"
            f"extendedKeyUsage={extended_key_usage}\n"
            f"subjectAltName=DNS:{san}\n",
            encoding="utf-8",
        )
        self._run(
            "x509",
            "-req",
            "-in",
            str(csr),
            "-CA",
            str(self.directory / f"{issuer}.crt"),
            "-CAkey",
            str(self.directory / f"{issuer}.key"),
            "-CAcreateserial",
            "-out",
            str(certificate),
            "-days",
            "1",
            "-extfile",
            str(extension),
        )
        return certificate.read_text(encoding="utf-8")

    def _run(self, *args: str) -> None:
        subprocess.run(
            ["openssl", *args],
            check=True,
            capture_output=True,
            text=True,
        )


class NginxContractTest(unittest.TestCase):
    def test_v1_edge_routes_public_contract_without_redirect(self) -> None:
        text = (
            ROOT
            / "deploy"
            / "openai-mtls"
            / "skillpilot-openai-de-v1-edge.nginx.conf"
        ).read_text(encoding="utf-8")
        self.assertIn("mcp-v1.skillpilot.com", text)
        self.assertIn("ssl_verify_client optional;", text)
        self.assertIn("location = /mcp", text)
        self.assertIn("location ^~ /mcp/", text)
        self.assertIn(
            "proxy_pass http://127.0.0.1:8787/internal/openai/de/v1/mcp;",
            text,
        )
        self.assertIn(
            "proxy_pass http://127.0.0.1:8787/internal/openai/de/v1/mcp/;",
            text,
        )
        self.assertNotIn("return 30", text)
        self.assertIn(
            "location = /.well-known/oauth-protected-resource",
            text,
        )
        self.assertIn(
            "location = /.well-known/openai-apps-challenge",
            text,
        )
        self.assertIn(
            "auth_request /_skillpilot/openai-mtls/verify-v1;",
            text,
        )
        self.assertIn('X-Forwarded-For ""', text)
        self.assertIn('Forwarded ""', text)
        self.assertIn('X-OpenAI-Client-Cert ""', text)
        self.assertIn('X-SSL-Client-Cert ""', text)
        self.assertIn('X-SkillPilot-OpenAI-mTLS-Verified "SUCCESS"', text)
        self.assertIn(
            'X-SkillPilot-OpenAI-mTLS-SAN "mtls.prod.connectors.openai.com"',
            text,
        )

    def test_verifier_service_pins_both_ca_levels(self) -> None:
        unit = (
            ROOT
            / "deploy"
            / "openai-mtls"
            / "skillpilot-openai-mtls-verifier.service"
        ).read_text(encoding="utf-8")
        self.assertIn("--root-ca", unit)
        self.assertIn("--intermediate-ca", unit)
        self.assertNotIn("--ca-bundle", unit)


class OAuthMetadataContractTest(unittest.TestCase):
    BASE_URL = "https://skillpilot.com"
    V1_RESOURCE = "https://mcp-v1.skillpilot.com"

    def test_accepts_v1_origin_as_default_protected_resource(self) -> None:
        METADATA_MODULE.validate_protected_resource(
            {
                "resource": self.V1_RESOURCE,
                "authorization_servers": [
                    f"{self.BASE_URL}/api/openai/de"
                ],
                "scopes_supported": [
                    METADATA_MODULE.READ_SCOPE,
                    METADATA_MODULE.WRITE_SCOPE,
                ],
                "bearer_methods_supported": ["header"],
            },
            self.V1_RESOURCE,
            authorization_base_url=self.BASE_URL,
        )

    def test_rejects_http_200_json_with_wrong_resource(self) -> None:
        with self.assertRaisesRegex(MetadataValidationError, "resource"):
            METADATA_MODULE.validate_protected_resource(
                {
                    "resource": f"{self.BASE_URL}/api/other/mcp",
                    "authorization_servers": [
                        f"{self.BASE_URL}/api/openai/de"
                    ],
                    "scopes_supported": [
                        METADATA_MODULE.READ_SCOPE,
                        METADATA_MODULE.WRITE_SCOPE,
                    ],
                    "bearer_methods_supported": ["header"],
                },
                self.BASE_URL,
            )

    def test_accepts_v1_resource_with_shared_authorization_server(self) -> None:
        METADATA_MODULE.validate_protected_resource(
            {
                "resource": self.V1_RESOURCE,
                "authorization_servers": [
                    f"{self.BASE_URL}/api/openai/de"
                ],
                "scopes_supported": [
                    METADATA_MODULE.READ_SCOPE,
                    METADATA_MODULE.WRITE_SCOPE,
                ],
                "bearer_methods_supported": ["header"],
            },
            self.V1_RESOURCE,
            self.V1_RESOURCE,
            self.BASE_URL,
        )

    def test_rejects_v1_metadata_bound_to_another_resource(self) -> None:
        with self.assertRaisesRegex(MetadataValidationError, "resource"):
            METADATA_MODULE.validate_protected_resource(
                {
                    "resource": f"{self.BASE_URL}/api/other/mcp",
                    "authorization_servers": [
                        f"{self.BASE_URL}/api/openai/de"
                    ],
                    "scopes_supported": [
                        METADATA_MODULE.READ_SCOPE,
                        METADATA_MODULE.WRITE_SCOPE,
                    ],
                    "bearer_methods_supported": ["header"],
                },
                self.V1_RESOURCE,
                self.V1_RESOURCE,
                self.BASE_URL,
            )

    def test_accepts_private_key_jwt_authorization_contract(self) -> None:
        METADATA_MODULE.validate_authorization_server(
            self._authorization_metadata("private_key_jwt"),
            self.BASE_URL,
            "private_key_jwt",
        )

    def test_accepts_public_client_authorization_contract(self) -> None:
        METADATA_MODULE.validate_authorization_server(
            self._authorization_metadata("none"),
            self.BASE_URL,
            "none",
        )

    def test_rejects_public_client_when_private_key_jwt_is_required(self) -> None:
        with self.assertRaisesRegex(
            MetadataValidationError, "private_key_jwt"
        ):
            METADATA_MODULE.validate_authorization_server(
                self._authorization_metadata("none"),
                self.BASE_URL,
                "private_key_jwt",
            )

    def test_rejects_public_client_with_null_cimd_advertisement(self) -> None:
        metadata = self._authorization_metadata("none")
        metadata["client_id_metadata_document_supported"] = None
        with self.assertRaisesRegex(MetadataValidationError, "CIMD"):
            METADATA_MODULE.validate_authorization_server(
                metadata,
                self.BASE_URL,
                "none",
            )

    def test_rejects_open_dynamic_client_registration(self) -> None:
        metadata = self._authorization_metadata("private_key_jwt")
        metadata["registration_endpoint"] = (
            f"{self.BASE_URL}/api/openai/de/oauth2/register"
        )
        with self.assertRaisesRegex(
            MetadataValidationError, "registration_endpoint"
        ):
            METADATA_MODULE.validate_authorization_server(
                metadata,
                self.BASE_URL,
                "private_key_jwt",
            )

    def test_rejects_missing_s256_pkce(self) -> None:
        metadata = self._authorization_metadata("private_key_jwt")
        metadata["code_challenge_methods_supported"] = ["plain"]
        with self.assertRaisesRegex(
            MetadataValidationError, "code_challenge_methods_supported"
        ):
            METADATA_MODULE.validate_authorization_server(
                metadata,
                self.BASE_URL,
                "private_key_jwt",
            )

    def _authorization_metadata(
        self, authentication_method: str
    ) -> dict[str, object]:
        issuer = f"{self.BASE_URL}/api/openai/de"
        metadata: dict[str, object] = {
            "issuer": issuer,
            "authorization_endpoint": f"{issuer}/oauth2/authorize",
            "token_endpoint": f"{issuer}/oauth2/token",
            "revocation_endpoint": f"{issuer}/oauth2/revoke",
            "introspection_endpoint": f"{issuer}/oauth2/introspect",
            "response_types_supported": ["code"],
            "grant_types_supported": [
                "authorization_code",
                "refresh_token",
            ],
            "token_endpoint_auth_methods_supported": [
                authentication_method
            ],
            "revocation_endpoint_auth_methods_supported": [
                authentication_method
            ],
            "code_challenge_methods_supported": ["S256"],
            "scopes_supported": [
                METADATA_MODULE.READ_SCOPE,
                METADATA_MODULE.WRITE_SCOPE,
                METADATA_MODULE.OFFLINE_SCOPE,
            ],
        }
        if authentication_method == "private_key_jwt":
            metadata["client_id_metadata_document_supported"] = True
            metadata[
                "token_endpoint_auth_signing_alg_values_supported"
            ] = ["RS256"]
        return metadata


class DeploymentSecurityGateContractTest(unittest.TestCase):
    def test_all_public_http_checks_have_bounded_network_timeouts(self) -> None:
        script = (
            ROOT / "scripts" / "verify_openai_mtls_edge.sh"
        ).read_text(encoding="utf-8")
        self.assertEqual(script.count("--connect-timeout 5"), 2)
        self.assertEqual(script.count("--max-time 15"), 2)

    def test_installed_artifacts_are_verified_before_pre_restart_passes(self) -> None:
        script = (
            ROOT / "scripts" / "verify_openai_mtls_edge.sh"
        ).read_text(encoding="utf-8")
        parity_index = script.index("assert_installed_artifacts")
        pre_restart_pass_index = script.index(
            'echo "CHECK pre-restart_edge PASS"'
        )
        self.assertLess(parity_index, pre_restart_pass_index)
        self.assertIn("openai-client-ca-bundle.pem", script)
        self.assertIn("skillpilot-openai-mtls-verifier.py", script)
        self.assertIn("skillpilot-openai-mtls-verifier.service", script)
        self.assertIn("skillpilot-openai-de-v1-edge.conf", script)
        self.assertIn("obsolete_nginx_snippet PASS absent", script)
        self.assertIn("obsolete_public_mcp_route PASS absent", script)

    def test_installer_removes_only_an_inactive_obsolete_edge_snippet(self) -> None:
        script = (
            ROOT / "scripts" / "install_openai_mtls_edge.sh"
        ).read_text(encoding="utf-8")
        guard_index = script.index('nginx -T 2>&1 | grep -Fq "${OBSOLETE_NGINX_SNIPPET}"')
        remove_index = script.index('rm -f -- "${OBSOLETE_NGINX_SNIPPET}"')
        self.assertLess(guard_index, remove_index)
        self.assertIn("Remove the obsolete include", script)

    def test_deploy_checks_v1_snapshot_before_build_and_gates_public_smoke(self) -> None:
        script = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        version_index = script.index("check_openai_plugin_versioning.mjs")
        snapshot_index = script.index("openai_plugin_release.mjs verify")
        build_index = script.index('echo "Baue Anwendung..."')
        self.assertLess(version_index, snapshot_index)
        self.assertLess(snapshot_index, build_index)
        self.assertIn(
            "SKILLPILOT_OPENAI_DE_V1_PUBLIC_EDGE_SMOKE_ENABLED",
            script,
        )
        self.assertIn("verify_openai_v1_public_edge.sh", script)

    def test_public_edge_smoke_is_https_only_and_checks_exact_contract(self) -> None:
        script = (
            ROOT / "scripts" / "verify_openai_v1_public_edge.sh"
        ).read_text(encoding="utf-8")
        self.assertIn("--proto '=https'", script)
        self.assertIn("--max-redirs 0", script)
        self.assertIn("--connect-timeout 5", script)
        self.assertIn("--max-time 15", script)
        self.assertIn("/.well-known/openai-apps-challenge", script)
        self.assertIn("/.well-known/oauth-protected-resource", script)
        self.assertIn("resource_metadata=", script)

    def test_focused_backend_security_tests_run_before_restart(self) -> None:
        script = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        test_index = script.index("OpenAiDeSecureModeConfigurationTest")
        restart_index = script.index('echo "Starte Service neu..."')
        self.assertLess(test_index, restart_index)
        self.assertIn("OpenAiDeOAuthConfigurationTest", script)
        self.assertIn("OpenAiDeMtlsEdgeFilterTest", script)
        self.assertIn("OpenAiDeOAuthDiscoveryBootstrapIntegrationTest", script)
        self.assertIn("OpenAiDePublicOAuthContextIntegrationTest", script)

    def test_client_secret_basic_profile_reaches_runtime_checks(self) -> None:
        environment = os.environ.copy()
        environment[
            "SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_AUTHENTICATION_METHOD"
        ] = "client_secret_basic"
        completed = subprocess.run(
            [
                str(ROOT / "scripts" / "verify_openai_mtls_edge.sh"),
                "--runtime",
            ],
            check=False,
            capture_output=True,
            text=True,
            env=environment,
        )
        self.assertNotEqual(completed.returncode, 2)
        self.assertNotIn("CHECK oauth_profile FAIL", completed.stderr)

    def test_unknown_oauth_profile_is_rejected_before_runtime_checks(self) -> None:
        environment = os.environ.copy()
        environment[
            "SKILLPILOT_OPENAI_DE_OAUTH_CLIENT_AUTHENTICATION_METHOD"
        ] = "unsupported"
        completed = subprocess.run(
            [
                str(ROOT / "scripts" / "verify_openai_mtls_edge.sh"),
                "--runtime",
            ],
            check=False,
            capture_output=True,
            text=True,
            env=environment,
        )
        self.assertEqual(completed.returncode, 2)
        self.assertIn("CHECK oauth_profile FAIL", completed.stderr)


if __name__ == "__main__":
    unittest.main()
