#!/usr/bin/env python3
"""Hermetic tests for the OpenAI Coach V1 mTLS verifier and edge contract."""

from __future__ import annotations

import hashlib
import http.client
import importlib.util
import os
from pathlib import Path
import re
import socket
import subprocess
import sys
import tempfile
import threading
import unittest
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
VERIFIER_PATH = ROOT / "scripts" / "openai_v1_mtls_verifier.py"
NGINX_CONTRACT_PATH = (
    ROOT / "scripts" / "verify_openai_v1_mtls_nginx_contract.py"
)
MTLS_MODE_LIBRARY_PATH = ROOT / "scripts" / "lib" / "openai_v1_mtls_mode.sh"
MTLS_EDGE_VERIFIER_PATH = ROOT / "scripts" / "verify_openai_v1_mtls_edge.sh"
SPEC = importlib.util.spec_from_file_location("openai_v1_mtls_verifier", VERIFIER_PATH)
assert SPEC and SPEC.loader
MODULE = importlib.util.module_from_spec(SPEC)
sys.modules[SPEC.name] = MODULE
SPEC.loader.exec_module(MODULE)


class CertificateFixture(unittest.TestCase):
    def setUp(self) -> None:
        self.temporary = tempfile.TemporaryDirectory()
        self.directory = Path(self.temporary.name)
        self._create_ca("root", None, "CA:TRUE,pathlen:1")
        self._create_ca("intermediate", "root", "CA:TRUE,pathlen:0")
        self.verifier = MODULE.CertificateVerifier(
            self.directory / "root.crt",
            self.directory / "intermediate.crt",
            expected_root_fingerprint=MODULE.CertificateVerifier.certificate_fingerprint(
                self.directory / "root.crt"
            ),
            expected_intermediate_fingerprint=(
                MODULE.CertificateVerifier.certificate_fingerprint(
                    self.directory / "intermediate.crt"
                )
            ),
        )
        self.engine = MODULE.MtlsDecisionEngine(self.verifier)

    def tearDown(self) -> None:
        self.temporary.cleanup()

    def _create_ca(self, name: str, issuer: str | None, constraints: str) -> None:
        key = self.directory / f"{name}.key"
        request = self.directory / f"{name}.csr"
        certificate = self.directory / f"{name}.crt"
        extensions = self.directory / f"{name}.ext"
        self._run("genrsa", "-out", str(key), "2048")
        self._run(
            "req",
            "-new",
            "-key",
            str(key),
            "-out",
            str(request),
            "-subj",
            f"/O=Fixture/CN={name}",
        )
        extensions.write_text(
            f"basicConstraints=critical,{constraints}\n"
            "keyUsage=critical,keyCertSign,cRLSign\n"
            "subjectKeyIdentifier=hash\n",
            encoding="utf-8",
        )
        if issuer is None:
            self._run(
                "x509",
                "-req",
                "-in",
                str(request),
                "-signkey",
                str(key),
                "-out",
                str(certificate),
                "-days",
                "2",
                "-extfile",
                str(extensions),
            )
            return
        self._run(
            "x509",
            "-req",
            "-in",
            str(request),
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
            str(extensions),
        )

    def _create_leaf(
        self,
        name: str,
        issuer: str = "intermediate",
        subject_alt_name: str | None = None,
        extended_key_usage: str | None = "clientAuth",
    ) -> str:
        key = self.directory / f"{name}.key"
        request = self.directory / f"{name}.csr"
        certificate = self.directory / f"{name}.crt"
        extensions = self.directory / f"{name}.ext"
        self._run("genrsa", "-out", str(key), "2048")
        self._run(
            "req",
            "-new",
            "-key",
            str(key),
            "-out",
            str(request),
            "-subj",
            f"/O=Fixture/CN={name}",
        )
        extension_lines = [
            "basicConstraints=critical,CA:FALSE",
            "keyUsage=critical,digitalSignature",
        ]
        if extended_key_usage is not None:
            extension_lines.append(f"extendedKeyUsage={extended_key_usage}")
        if subject_alt_name is not None:
            extension_lines.append(f"subjectAltName={subject_alt_name}")
        else:
            extension_lines.append(f"subjectAltName=DNS:{MODULE.EXPECTED_SAN}")
        extensions.write_text("\n".join(extension_lines) + "\n", encoding="utf-8")
        self._run(
            "x509",
            "-req",
            "-in",
            str(request),
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
            str(extensions),
        )
        return certificate.read_text(encoding="utf-8")

    def _run(self, *arguments: str) -> None:
        subprocess.run(
            ["openssl", *arguments],
            check=True,
            capture_output=True,
            text=True,
            timeout=20,
        )


class CertificateVerifierTest(CertificateFixture):
    def test_accepts_exact_openai_san_and_client_auth_leaf(self) -> None:
        self.assertEqual(self.verifier.verify_leaf(self._create_leaf("valid")), (True, "verified"))

    def test_rejects_wrong_or_additional_dns_subject_alt_names(self) -> None:
        wrong = self._create_leaf("wrong-san", subject_alt_name="DNS:example.com")
        additional = self._create_leaf(
            "additional-san",
            subject_alt_name=f"DNS:{MODULE.EXPECTED_SAN},DNS:example.com",
        )
        self.assertEqual(self.verifier.verify_leaf(wrong), (False, "unexpected_san"))
        self.assertEqual(
            self.verifier.verify_leaf(additional),
            (False, "unexpected_san"),
        )

    def test_tolerates_non_dns_san_entries_when_dns_name_is_exact(self) -> None:
        leaf = self._create_leaf(
            "non-dns-san",
            subject_alt_name=f"DNS:{MODULE.EXPECTED_SAN},IP:127.0.0.1",
        )
        self.assertEqual(self.verifier.verify_leaf(leaf), (True, "verified"))

    def test_rejects_missing_or_wrong_client_auth_eku(self) -> None:
        missing = self._create_leaf("missing-eku", extended_key_usage=None)
        server_only = self._create_leaf(
            "server-eku",
            extended_key_usage="serverAuth",
        )
        self.assertEqual(
            self.verifier.verify_leaf(missing),
            (False, "missing_client_auth_eku"),
        )
        self.assertEqual(
            self.verifier.verify_leaf(server_only),
            (False, "invalid_chain_or_client_purpose"),
        )

    def test_rejects_untrusted_chain(self) -> None:
        self._create_ca("other-root", None, "CA:TRUE,pathlen:1")
        leaf = self._create_leaf("untrusted", issuer="other-root")
        self.assertEqual(
            self.verifier.verify_leaf(leaf),
            (False, "invalid_chain_or_client_purpose"),
        )

    def test_rejects_leaf_signed_directly_by_root(self) -> None:
        leaf = self._create_leaf("direct-root", issuer="root")
        self.assertEqual(
            self.verifier.verify_leaf(leaf),
            (False, "unexpected_intermediate"),
        )

    def test_rejects_multiple_pem_certificates(self) -> None:
        leaf = self._create_leaf("multiple")
        self.assertEqual(
            self.verifier.verify_leaf(leaf + leaf),
            (False, "missing_or_malformed_leaf"),
        )

    def test_rejects_unexpected_pinned_fingerprint_at_startup(self) -> None:
        with self.assertRaisesRegex(ValueError, "unexpected certificate fingerprint"):
            MODULE.CertificateVerifier(
                self.directory / "root.crt",
                self.directory / "intermediate.crt",
                expected_root_fingerprint="0" * 64,
                expected_intermediate_fingerprint=(
                    MODULE.CertificateVerifier.certificate_fingerprint(
                        self.directory / "intermediate.crt"
                    )
                ),
            )


class DecisionEngineTest(CertificateFixture):
    def test_observe_accepts_no_certificate_with_bounded_classification(self) -> None:
        decision = self.engine.decide("observe", "203.0.113.8", "NONE", "")
        self.assertEqual(
            decision,
            MODULE.Decision(True, MODULE.CLASSIFICATION_OBSERVE_NO_CERT, "observe_without_certificate"),
        )

    def test_observe_and_enforce_reject_nginx_failed_certificate(self) -> None:
        for mode in ("observe", "enforce"):
            with self.subTest(mode=mode):
                self.assertFalse(
                    self.engine.decide(
                        mode,
                        "203.0.113.8",
                        "FAILED:certificate verify failed",
                        "not-logged",
                    ).accepted
                )

    def test_enforce_rejects_external_no_certificate(self) -> None:
        decision = self.engine.decide("enforce", "203.0.113.8", "NONE", "")
        self.assertEqual(decision, MODULE.Decision(False, None, "certificate_required"))

    def test_enforce_accepts_no_certificate_only_for_loopback_operator(self) -> None:
        for address in ("127.0.0.1", "::1"):
            with self.subTest(address=address):
                decision = self.engine.decide("enforce", address, "NONE", "")
                self.assertEqual(
                    decision.classification,
                    MODULE.CLASSIFICATION_LOCAL_OPERATOR,
                )
                self.assertTrue(decision.accepted)

    def test_verified_certificate_is_mode_independent(self) -> None:
        certificate = quote(self._create_leaf("verified"), safe="")
        for mode in ("observe", "enforce"):
            with self.subTest(mode=mode):
                decision = self.engine.decide(
                    mode,
                    "203.0.113.8",
                    "SUCCESS",
                    certificate,
                )
                self.assertEqual(
                    decision,
                    MODULE.Decision(True, MODULE.CLASSIFICATION_VERIFIED, "verified"),
                )

    def test_invalid_mode_remote_or_tls_state_fails_closed(self) -> None:
        cases = (
            ("disabled", "127.0.0.1", "NONE", ""),
            ("observe", "not-an-ip", "NONE", ""),
            ("observe", "127.0.0.1", "UNKNOWN", ""),
            ("observe", "127.0.0.1", "NONE", "unexpected"),
            ("observe", "127.0.0.1", "SUCCESS", ""),
        )
        for arguments in cases:
            with self.subTest(arguments=arguments):
                self.assertFalse(self.engine.decide(*arguments).accepted)


class VerifierHttpContractTest(CertificateFixture):
    def setUp(self) -> None:
        super().setUp()
        MODULE.VerificationHandler.engine = self.engine
        self.server = MODULE.LoopbackThreadingHTTPServer(
            ("127.0.0.1", 0),
            MODULE.VerificationHandler,
        )
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def tearDown(self) -> None:
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        super().tearDown()

    def test_response_contract_for_all_accepted_classifications(self) -> None:
        cases = (
            ("observe", "203.0.113.8", "NONE", "", MODULE.CLASSIFICATION_OBSERVE_NO_CERT),
            ("enforce", "127.0.0.1", "NONE", "", MODULE.CLASSIFICATION_LOCAL_OPERATOR),
            (
                "enforce",
                "203.0.113.8",
                "SUCCESS",
                quote(self._create_leaf("http-valid"), safe=""),
                MODULE.CLASSIFICATION_VERIFIED,
            ),
        )
        for mode, remote, verify, certificate, classification in cases:
            with self.subTest(classification=classification):
                status, headers = self._request(mode, remote, verify, certificate)
                self.assertEqual(status, 204)
                self.assertEqual(headers.get(MODULE.CLASSIFICATION_HEADER), classification)
                expected_san = (
                    MODULE.EXPECTED_SAN
                    if classification == MODULE.CLASSIFICATION_VERIFIED
                    else None
                )
                self.assertEqual(headers.get(MODULE.SAN_HEADER), expected_san)
                self.assertEqual(headers.get("Cache-Control"), "no-store")

    def test_rejected_request_exposes_no_classification_or_certificate(self) -> None:
        status, headers = self._request("enforce", "203.0.113.8", "NONE", "")
        self.assertEqual(status, 403)
        self.assertNotIn(MODULE.CLASSIFICATION_HEADER, headers)
        self.assertNotIn(MODULE.SAN_HEADER, headers)
        self.assertFalse(any("Cert" in name for name in headers))

    def test_missing_or_duplicate_contract_header_fails_closed(self) -> None:
        connection = self._connection()
        connection.putrequest("GET", "/verify")
        connection.putheader(MODULE.MODE_HEADER, "observe")
        connection.putheader(MODULE.MODE_HEADER, "enforce")
        connection.putheader(MODULE.REMOTE_ADDRESS_HEADER, "127.0.0.1")
        connection.putheader(MODULE.CLIENT_VERIFY_HEADER, "NONE")
        connection.endheaders()
        response = connection.getresponse()
        self.assertEqual(response.status, 403)
        response.read()
        connection.close()

    def test_other_path_and_method_are_not_accepted(self) -> None:
        connection = self._connection()
        connection.request("GET", "/health")
        response = connection.getresponse()
        self.assertEqual(response.status, 404)
        response.read()
        connection.close()

    def test_saturation_fails_closed_and_recovers_without_spawning_work(self) -> None:
        acquired = 0
        try:
            for _ in range(MODULE.MAX_CONCURRENT_REQUESTS):
                self.assertTrue(self.server._request_slots.acquire(blocking=False))
                acquired += 1

            connection = self._connection()
            with self.assertRaises((ConnectionError, http.client.HTTPException, OSError)):
                connection.request("GET", "/verify")
                connection.getresponse()
            connection.close()
        finally:
            for _ in range(acquired):
                self.server._request_slots.release()

        status, headers = self._request("observe", "203.0.113.8", "NONE", "")
        self.assertEqual(status, 204)
        self.assertEqual(
            headers.get(MODULE.CLASSIFICATION_HEADER),
            MODULE.CLASSIFICATION_OBSERVE_NO_CERT,
        )

    def test_incomplete_headers_time_out_and_capacity_recovers(self) -> None:
        connection = socket.create_connection(self.server.server_address, timeout=2)
        connection.settimeout(MODULE.CLIENT_READ_TIMEOUT_SECONDS + 2)
        connection.sendall(b"GET /verify HTTP/1.1\r\nHost: 127.0.0.1\r\n")
        self.assertEqual(connection.recv(1), b"")
        connection.close()

        status, headers = self._request("observe", "203.0.113.8", "NONE", "")
        self.assertEqual(status, 204)
        self.assertEqual(
            headers.get(MODULE.CLASSIFICATION_HEADER),
            MODULE.CLASSIFICATION_OBSERVE_NO_CERT,
        )

        connection = self._connection()
        connection.request("POST", "/verify")
        response = connection.getresponse()
        self.assertEqual(response.status, 405)
        response.read()
        connection.close()

    def test_openssl_timeout_fails_closed_cleans_up_and_capacity_recovers(self) -> None:
        fake_openssl = self.directory / "openssl-timeout"
        fake_openssl.write_text(
            "#!/usr/bin/env python3\n"
            "import time\n"
            f"time.sleep({MODULE.OPENSSL_TIMEOUT_SECONDS + 2})\n",
            encoding="utf-8",
        )
        fake_openssl.chmod(0o755)
        temporary_leaf_directory = self.directory / "timed-out-leaves"
        temporary_leaf_directory.mkdir()
        certificate = quote(self._create_leaf("openssl-timeout"), safe="")

        original_openssl = self.verifier.openssl
        original_tempdir = tempfile.tempdir
        try:
            self.verifier.openssl = str(fake_openssl)
            tempfile.tempdir = str(temporary_leaf_directory)
            status, headers = self._request(
                "enforce",
                "203.0.113.8",
                "SUCCESS",
                certificate,
            )
            self.assertEqual(status, 403)
            self.assertNotIn(MODULE.CLASSIFICATION_HEADER, headers)
            self.assertEqual(list(temporary_leaf_directory.iterdir()), [])
        finally:
            self.verifier.openssl = original_openssl
            tempfile.tempdir = original_tempdir

        status, headers = self._request(
            "enforce",
            "203.0.113.8",
            "SUCCESS",
            certificate,
        )
        self.assertEqual(status, 204)
        self.assertEqual(
            headers.get(MODULE.CLASSIFICATION_HEADER),
            MODULE.CLASSIFICATION_VERIFIED,
        )

    def _connection(self) -> http.client.HTTPConnection:
        return http.client.HTTPConnection(
            "127.0.0.1",
            self.server.server_address[1],
            timeout=5,
        )

    def _request(
        self,
        mode: str,
        remote: str,
        client_verify: str,
        certificate: str,
    ) -> tuple[int, dict[str, str]]:
        headers = {
            MODULE.MODE_HEADER: mode,
            MODULE.REMOTE_ADDRESS_HEADER: remote,
            MODULE.CLIENT_VERIFY_HEADER: client_verify,
        }
        if certificate:
            headers[MODULE.CLIENT_CERTIFICATE_HEADER] = certificate
        connection = self._connection()
        connection.request("GET", "/verify", headers=headers)
        response = connection.getresponse()
        status = response.status
        response_headers = dict(response.getheaders())
        response.read()
        connection.close()
        return status, response_headers


class NginxActiveBindingContractTest(unittest.TestCase):
    EXPECTED_FILE = "/etc/nginx/skillpilot-mcp-coaches.conf"
    OTHER_FILE = "/etc/nginx/conf.d/other.conf"
    HOST = "mcp-coach-v1.skillpilot.com"
    MAIN_DENY_FILE = "/etc/nginx/skillpilot-main-vhost-openai-deny-locations.conf"
    MAIN_VHOST_FILE = "/etc/nginx/sites-enabled/skillpilot.conf"
    MAIN_HOST = "skillpilot.com"

    @classmethod
    def active_server(cls, *, host: str | None = None) -> str:
        server_name = host or cls.HOST
        return f"""
server {{
    listen
        0.0.0.0:443
        ssl;
    listen [::]:443 ssl;
    server_name
        {server_name};
    ssl_verify_client optional;
    include /etc/skillpilot/openai-mtls/mode.conf;
    location = /_skillpilot_openai_mtls_verify {{
        proxy_pass http://127.0.0.1:8792/verify;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Mode
            $skillpilot_openai_mtls_mode;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Remote-Addr
            $realip_remote_addr;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Client-Verify
            $ssl_client_verify;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Client-Cert
            $ssl_client_escaped_cert;
    }}
    location = /mcp {{
        auth_request /_skillpilot_openai_mtls_verify;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Classification
            $skillpilot_openai_mtls_classification;
    }}
}}
"""

    @staticmethod
    def section(path: str, content: str) -> str:
        return f"# configuration file {path}:\n{content.strip()}\n"

    @classmethod
    def main_server(
        cls,
        *,
        host: str | None = None,
        include_deny: bool = True,
    ) -> str:
        include = f"include {cls.MAIN_DENY_FILE};" if include_deny else ""
        return f"""
server {{
    listen [::]:443 ssl;
    server_name
        {host or cls.MAIN_HOST};
    {include}
}}
"""

    @classmethod
    def valid_main_binding(cls) -> str:
        return cls.section(cls.MAIN_VHOST_FILE, cls.main_server()) + cls.section(
            cls.MAIN_DENY_FILE,
            "location ^~ /internal/openai/v1/ { return 404; }",
        )

    @classmethod
    def with_valid_main_binding(cls, configuration: str) -> str:
        return configuration + cls.valid_main_binding()

    def run_contract(self, configuration: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [
                sys.executable,
                "-B",
                str(NGINX_CONTRACT_PATH),
                "--expected-file",
                self.EXPECTED_FILE,
                "--host",
                self.HOST,
                "--main-deny-file",
                self.MAIN_DENY_FILE,
                "--main-host",
                self.MAIN_HOST,
            ],
            input=configuration,
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )

    def test_accepts_one_multiline_tls_vhost_from_expected_file(self) -> None:
        configuration = self.with_valid_main_binding(self.section(
            "/etc/nginx/nginx.conf",
            "events {}\nhttp {}",
        ) + self.section(self.EXPECTED_FILE, self.active_server()))
        result = self.run_contract(configuration)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("uniquely bound", result.stdout)

    def test_rejects_missing_or_duplicate_expected_file_marker(self) -> None:
        missing = self.with_valid_main_binding(
            self.section(self.OTHER_FILE, self.active_server())
        )
        duplicate = self.with_valid_main_binding(
            self.section(self.EXPECTED_FILE, self.active_server())
            + self.section(self.EXPECTED_FILE, "# repeated include")
        )
        for configuration, expected_count in ((missing, "found 0"), (duplicate, "found 2")):
            with self.subTest(expected_count=expected_count):
                result = self.run_contract(configuration)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(expected_count, result.stderr)

    def test_rejects_target_vhost_from_foreign_file(self) -> None:
        configuration = self.with_valid_main_binding(self.section(
            self.EXPECTED_FILE,
            self.active_server(host="unrelated.example.com"),
        ) + self.section(self.OTHER_FILE, self.active_server()))
        result = self.run_contract(configuration)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn(self.OTHER_FILE, result.stderr)
        self.assertIn(f"not {self.EXPECTED_FILE}", result.stderr)

    def test_rejects_second_tls_vhost_for_same_host(self) -> None:
        configuration = self.with_valid_main_binding(self.section(
            self.EXPECTED_FILE,
            self.active_server(),
        ) + self.section(self.OTHER_FILE, self.active_server()))
        result = self.run_contract(configuration)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("found 2", result.stderr)

    def test_rejects_required_fragments_only_outside_active_vhost(self) -> None:
        incomplete = """
server {
    listen 443 ssl;
    server_name mcp-coach-v1.skillpilot.com;
    ssl_verify_client optional;
}
"""
        fragments_elsewhere = """
server {
    listen 127.0.0.1:9443 ssl;
    server_name unrelated.example.com;
    include /etc/skillpilot/openai-mtls/mode.conf;
    location / {
        proxy_pass http://127.0.0.1:8792/verify;
        auth_request /_skillpilot_openai_mtls_verify;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Mode $skillpilot_openai_mtls_mode;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Remote-Addr $realip_remote_addr;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Client-Verify $ssl_client_verify;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Client-Cert $ssl_client_escaped_cert;
        proxy_set_header X-SkillPilot-OpenAI-mTLS-Classification $skillpilot_openai_mtls_classification;
    }
}
"""
        configuration = self.with_valid_main_binding(self.section(
            self.EXPECTED_FILE,
            incomplete,
        ) + self.section(self.OTHER_FILE, fragments_elsewhere))
        result = self.run_contract(configuration)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("missing required directives", result.stderr)

    def test_rejects_missing_or_duplicate_main_deny_marker(self) -> None:
        plugin = self.section(self.EXPECTED_FILE, self.active_server())
        main_vhost = self.section(self.MAIN_VHOST_FILE, self.main_server())
        missing = plugin + main_vhost
        duplicate = (
            plugin
            + main_vhost
            + self.section(self.MAIN_DENY_FILE, "location /one { return 404; }")
            + self.section(self.MAIN_DENY_FILE, "location /two { return 404; }")
        )
        for configuration, expected_count in ((missing, "found 0"), (duplicate, "found 2")):
            with self.subTest(expected_count=expected_count):
                result = self.run_contract(configuration)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(self.MAIN_DENY_FILE, result.stderr)
                self.assertIn(expected_count, result.stderr)

    def test_rejects_missing_or_second_main_tls_vhost(self) -> None:
        plugin = self.section(self.EXPECTED_FILE, self.active_server())
        deny = self.section(self.MAIN_DENY_FILE, "location / { return 404; }")
        missing = (
            plugin
            + self.section(
                self.MAIN_VHOST_FILE,
                self.main_server(host="www.skillpilot.com"),
            )
            + deny
        )
        duplicate = (
            plugin
            + self.section(self.MAIN_VHOST_FILE, self.main_server())
            + self.section(self.OTHER_FILE, self.main_server())
            + deny
        )
        for configuration, expected_count in ((missing, "found 0"), (duplicate, "found 2")):
            with self.subTest(expected_count=expected_count):
                result = self.run_contract(configuration)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(self.MAIN_HOST, result.stderr)
                self.assertIn(expected_count, result.stderr)

    def test_rejects_main_deny_include_only_in_foreign_vhost(self) -> None:
        configuration = (
            self.section(self.EXPECTED_FILE, self.active_server())
            + self.section(
                self.MAIN_VHOST_FILE,
                self.main_server(include_deny=False),
            )
            + self.section(
                self.OTHER_FILE,
                self.main_server(host="unrelated.example.com"),
            )
            + self.section(self.MAIN_DENY_FILE, "location / { return 404; }")
        )
        result = self.run_contract(configuration)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("does not directly include", result.stderr)


class ShellSecurityContractTest(unittest.TestCase):
    def test_listener_classifier_accepts_only_numeric_loopback_forms(self) -> None:
        accepted = (
            "127.0.0.1:8787",
            "[::1]:8787",
            "::1:8787",
            "[::ffff:127.0.0.1]:8787",
            "::ffff:127.0.0.1:8787",
        )
        rejected = (
            "*:8787",
            "0.0.0.0:8787",
            "[::]:8787",
            "192.0.2.1:8787",
            "[::ffff:192.0.2.1]:8787",
            "127.0.0.1:9999",
        )
        script = (
            'source "$1"; shift; expected="$1"; shift; '
            'for address in "$@"; do '
            '  if is_openai_v1_mtls_loopback_listener "$address" 8787; then actual=accept; '
            '  else actual=reject; fi; '
            '  [[ "$actual" == "$expected" ]] || exit 1; '
            'done'
        )
        for expected, addresses in (("accept", accepted), ("reject", rejected)):
            with self.subTest(expected=expected):
                result = subprocess.run(
                    [
                        "bash",
                        "-c",
                        script,
                        "listener-classifier-test",
                        str(MTLS_MODE_LIBRARY_PATH),
                        expected,
                        *addresses,
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                    timeout=10,
                )
                self.assertEqual(result.returncode, 0, result.stderr)

    def test_secure_path_rejects_symlink_wrong_kind_owner_and_write_bits(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            regular = directory / "mode.conf"
            regular.write_text("set $skillpilot_openai_mtls_mode observe;\n", encoding="utf-8")
            symlink = directory / "mode-link.conf"
            symlink.symlink_to(regular)
            fake_bin = directory / "bin"
            fake_bin.mkdir()
            fake_stat = fake_bin / "stat"
            fake_stat.write_text(
                """#!/usr/bin/env bash
case \"${1:-}\" in
  -c) format=$2; path=$4 ;;
  *) exit 64 ;;
esac
case \"$format\" in
  %u:%g) printf '%s\\n' \"${FAKE_STAT_OWNER:-0:0}\" ;;
  %a) printf '%s\\n' \"${FAKE_STAT_MODE:-0644}\" ;;
  *) exit 65 ;;
esac
""",
                encoding="utf-8",
            )
            fake_stat.chmod(0o755)

            def secure_path(
                path: Path,
                kind: str,
                *,
                owner: str = "0:0",
                mode: str = "0644",
            ) -> subprocess.CompletedProcess[str]:
                environment = os.environ.copy()
                environment.update(
                    {
                        "PATH": f"{fake_bin}:{environment['PATH']}",
                        "FAKE_STAT_OWNER": owner,
                        "FAKE_STAT_MODE": mode,
                    }
                )
                return subprocess.run(
                    [
                        "bash",
                        "-c",
                        'source "$1"; assert_openai_v1_mtls_secure_path "$2" "$3" fixture',
                        "secure-path-test",
                        str(MTLS_MODE_LIBRARY_PATH),
                        str(path),
                        kind,
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                    timeout=10,
                    env=environment,
                )

            self.assertEqual(secure_path(regular, "file").returncode, 0)
            self.assertNotEqual(secure_path(symlink, "file").returncode, 0)
            self.assertNotEqual(secure_path(regular, "directory").returncode, 0)
            self.assertNotEqual(
                secure_path(regular, "file", owner="1000:1000").returncode,
                0,
            )
            for insecure_mode in ("0664", "0646"):
                with self.subTest(mode=insecure_mode):
                    self.assertNotEqual(
                        secure_path(regular, "file", mode=insecure_mode).returncode,
                        0,
                    )

    def test_installed_mode_requires_exactly_one_directive(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            fake_bin = directory / "bin"
            fake_bin.mkdir()
            fake_stat = fake_bin / "stat"
            fake_stat.write_text(
                """#!/usr/bin/env bash
case \"$2\" in
  %u:%g) printf '0:0\\n' ;;
  %a) printf '0644\\n' ;;
  *) exit 65 ;;
esac
""",
                encoding="utf-8",
            )
            fake_stat.chmod(0o755)
            environment = os.environ.copy()
            environment["PATH"] = f"{fake_bin}:{environment['PATH']}"

            def read_mode(payload: str) -> subprocess.CompletedProcess[str]:
                mode_file = directory / "mode.conf"
                mode_file.write_text(payload, encoding="utf-8")
                return subprocess.run(
                    [
                        "bash",
                        "-c",
                        'source "$1"; read_openai_v1_mtls_installed_mode "$2"',
                        "installed-mode-test",
                        str(MTLS_MODE_LIBRARY_PATH),
                        str(mode_file),
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                    timeout=10,
                    env=environment,
                )

            self.assertNotEqual(read_mode("# no mode\n").returncode, 0)
            self.assertNotEqual(
                read_mode(
                    "set $skillpilot_openai_mtls_mode observe;\n"
                    "set $skillpilot_openai_mtls_mode enforce;\n"
                ).returncode,
                0,
            )

    def test_secret_environment_file_requires_exact_root_owned_0600(self) -> None:
        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            secret = directory / "skillpilot.env"
            secret.write_text("SECRET=not-printed\n", encoding="utf-8")
            symlink = directory / "skillpilot-link.env"
            symlink.symlink_to(secret)
            fake_bin = directory / "bin"
            fake_bin.mkdir()
            fake_stat = fake_bin / "stat"
            fake_stat.write_text(
                """#!/usr/bin/env bash
case \"$2\" in
  %u:%g) printf '%s\\n' \"${FAKE_STAT_OWNER:-0:0}\" ;;
  %a) printf '%s\\n' \"${FAKE_STAT_MODE:-600}\" ;;
  *) exit 65 ;;
esac
""",
                encoding="utf-8",
            )
            fake_stat.chmod(0o755)

            def validate(
                path: Path,
                *,
                owner: str = "0:0",
                mode: str = "600",
            ) -> subprocess.CompletedProcess[str]:
                environment = os.environ.copy()
                environment.update(
                    {
                        "PATH": f"{fake_bin}:{environment['PATH']}",
                        "FAKE_STAT_OWNER": owner,
                        "FAKE_STAT_MODE": mode,
                    }
                )
                return subprocess.run(
                    [
                        "bash",
                        "-c",
                        'source "$1"; assert_openai_v1_mtls_secret_file "$2" fixture',
                        "secret-file-test",
                        str(MTLS_MODE_LIBRARY_PATH),
                        str(path),
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                    timeout=10,
                    env=environment,
                )

            self.assertEqual(validate(secret).returncode, 0)
            for mode in ("644", "400"):
                with self.subTest(mode=mode):
                    self.assertNotEqual(validate(secret, mode=mode).returncode, 0)
            self.assertNotEqual(validate(secret, owner="1000:1000").returncode, 0)
            self.assertNotEqual(validate(symlink).returncode, 0)

    def test_ca_cutover_threshold_is_exact_and_bracketed_by_89_91_days(self) -> None:
        verifier = MTLS_EDGE_VERIFIER_PATH.read_text(encoding="utf-8")
        installer = (
            ROOT / "scripts" / "install_openai_v1_mtls_edge.sh"
        ).read_text(encoding="utf-8")
        for script in (verifier, installer):
            self.assertEqual(
                re.findall(
                    r'^CA_MINIMUM_REMAINING_SECONDS="([0-9]+)"$',
                    script,
                    flags=re.MULTILINE,
                ),
                ["7776000"],
            )
            self.assertIn('-checkend "${CA_MINIMUM_REMAINING_SECONDS}"', script)

        with tempfile.TemporaryDirectory() as temporary:
            directory = Path(temporary)
            key = directory / "fixture.key"
            request = directory / "fixture.csr"
            subprocess.run(
                ["openssl", "genrsa", "-out", str(key), "2048"],
                check=True,
                capture_output=True,
                text=True,
                timeout=20,
            )
            subprocess.run(
                [
                    "openssl",
                    "req",
                    "-new",
                    "-key",
                    str(key),
                    "-out",
                    str(request),
                    "-subj",
                    "/CN=cutover-fixture",
                ],
                check=True,
                capture_output=True,
                text=True,
                timeout=20,
            )
            for days, expected in ((89, 1), (91, 0)):
                certificate = directory / f"fixture-{days}.crt"
                subprocess.run(
                    [
                        "openssl",
                        "x509",
                        "-req",
                        "-in",
                        str(request),
                        "-signkey",
                        str(key),
                        "-out",
                        str(certificate),
                        "-days",
                        str(days),
                    ],
                    check=True,
                    capture_output=True,
                    text=True,
                    timeout=20,
                )
                result = subprocess.run(
                    [
                        "openssl",
                        "x509",
                        "-checkend",
                        "7776000",
                        "-noout",
                        "-in",
                        str(certificate),
                    ],
                    check=False,
                    capture_output=True,
                    text=True,
                    timeout=20,
                )
                self.assertEqual(
                    result.returncode,
                    expected,
                    f"{days}-day fixture: {result.stdout}{result.stderr}",
                )


class RepositoryContractTest(unittest.TestCase):
    def test_published_ca_files_match_reviewed_hashes(self) -> None:
        expected = {
            "openai-root-ca.pem": "3a565b5c83c83ba2de085de28733e3c6af01af9b347322b93caf3a03d42c5cbe",
            "openai-connectors-mtls-ca.pem": "7485f98dfbb7db119ca99d5748ac7a86baa73ddede878d3263a50cba2c4f6dd8",
        }
        for name, digest in expected.items():
            with self.subTest(name=name):
                payload = (ROOT / "deploy" / "openai-mtls" / name).read_bytes()
                self.assertEqual(hashlib.sha256(payload).hexdigest(), digest)

    def test_service_is_loopback_only_and_hardened(self) -> None:
        unit = (
            ROOT
            / "deploy"
            / "openai-mtls"
            / "skillpilot-openai-v1-mtls-verifier.service"
        ).read_text(encoding="utf-8")
        self.assertIn("--listen 127.0.0.1 --port 8792", unit)
        self.assertIn("DynamicUser=yes", unit)
        self.assertIn(
            "LoadCredential=openai-root-ca.pem:/etc/skillpilot/openai-mtls/openai-root-ca.pem",
            unit,
        )
        self.assertIn(
            "LoadCredential=openai-connectors-mtls-ca.pem:/etc/skillpilot/openai-mtls/openai-connectors-mtls-ca.pem",
            unit,
        )
        self.assertIn(
            "--root-ca ${CREDENTIALS_DIRECTORY}/openai-root-ca.pem",
            unit,
        )
        self.assertIn(
            "--intermediate-ca ${CREDENTIALS_DIRECTORY}/openai-connectors-mtls-ca.pem",
            unit,
        )
        exec_start = next(
            line for line in unit.splitlines() if line.startswith("ExecStart=")
        )
        self.assertNotIn("--root-ca /etc/skillpilot/", exec_start)
        self.assertNotIn("--intermediate-ca /etc/skillpilot/", exec_start)
        self.assertIn("ProtectSystem=strict", unit)
        self.assertIn("NoNewPrivileges=yes", unit)
        self.assertIn("CapabilityBoundingSet=", unit)
        self.assertIn("MemoryMax=256M", unit)
        self.assertIn("LimitNOFILE=256", unit)
        self.assertIn("IPAddressDeny=any", unit)
        self.assertIn("IPAddressAllow=localhost", unit)
        self.assertIn("LogRateLimitIntervalSec=30s", unit)
        self.assertIn("LogRateLimitBurst=200", unit)
        tasks_max = int(re.search(r"(?m)^TasksMax=(\d+)$", unit).group(1))
        self.assertGreaterEqual(
            tasks_max,
            2 * MODULE.MAX_CONCURRENT_REQUESTS + 4,
        )
        self.assertLessEqual(MODULE.OPENSSL_TIMEOUT_SECONDS * 4, 12)

    def test_openssl_chain_validation_uses_only_the_pinned_store(self) -> None:
        combined = "\n".join(
            path.read_text(encoding="utf-8")
            for path in (
                VERIFIER_PATH,
                ROOT / "scripts" / "install_openai_v1_mtls_edge.sh",
                MTLS_EDGE_VERIFIER_PATH,
            )
        )
        self.assertNotIn('"-CAfile"', combined)
        self.assertNotIn("-CAfile ", combined)
        self.assertGreaterEqual(combined.count("-no-CApath"), 5)
        self.assertGreaterEqual(combined.count("-no-CAstore"), 5)
        self.assertGreaterEqual(combined.count("-x509_strict"), 5)

    def test_neutral_v1_names_and_exact_public_resource_are_used(self) -> None:
        files = (
            ROOT / "scripts" / "openai_v1_mtls_verifier.py",
            ROOT / "scripts" / "install_openai_v1_mtls_edge.sh",
            ROOT / "scripts" / "verify_openai_v1_mtls_edge.sh",
            ROOT
            / "deploy"
            / "openai-mtls"
            / "skillpilot-openai-v1-mtls-verifier.service",
        )
        combined = "\n".join(
            path.read_text(encoding="utf-8") for path in files if path.exists()
        )
        self.assertNotIn("OPENAI_DE", combined)
        self.assertNotIn("/api/openai/de/mcp", combined)
        self.assertIn("mcp-coach-v1.skillpilot.com", combined)
        self.assertIn("/mcp", combined)

    def test_installer_never_edits_or_reloads_nginx(self) -> None:
        installer = (
            ROOT / "scripts" / "install_openai_v1_mtls_edge.sh"
        ).read_text(encoding="utf-8")
        self.assertNotIn("systemctl reload nginx", installer)
        self.assertNotIn("systemctl restart nginx", installer)
        self.assertNotIn("/etc/nginx/", installer)
        self.assertNotIn("nginx -t", installer)
        self.assertIn("No active Nginx file was edited or reloaded", installer)
        self.assertIn("--staged", installer)
        self.assertIn("systemd-analyze verify", installer)
        invocation = installer[installer.index(
            '"${ROOT_DIR}/scripts/verify_openai_v1_mtls_edge.sh"'
        ):]
        self.assertNotIn("--preflight", invocation.split("cat <<EOF", 1)[0])

    def test_static_gate_validates_the_systemd_unit(self) -> None:
        verifier = MTLS_EDGE_VERIFIER_PATH.read_text(encoding="utf-8")
        static_checks = verifier.split("run_static_checks() {", 1)[1].split(
            "\n}\n", 1
        )[0]
        self.assertIn("systemd-analyze verify", static_checks)
        self.assertIn("CHECK mtls_systemd_unit PASS", static_checks)

    def test_staged_gate_waits_boundedly_for_verifier_readiness(self) -> None:
        verifier = MTLS_EDGE_VERIFIER_PATH.read_text(encoding="utf-8")
        self.assertIn('VERIFIER_READY_TIMEOUT_SECONDS="20"', verifier)
        service_check = verifier.split("assert_verifier_service() {", 1)[1].split(
            "\n}\n", 1
        )[0]
        self.assertIn("SECONDS + VERIFIER_READY_TIMEOUT_SECONDS", service_check)
        self.assertIn('service_state}" == "active"', service_check)
        self.assertIn('-n "${listeners}"', service_check)
        self.assertIn("sleep 1", service_check)

    def test_runtime_smokes_invalid_client_cert_and_deploy_confirms_disabled(self) -> None:
        verifier = MTLS_EDGE_VERIFIER_PATH.read_text(encoding="utf-8")
        runtime_case = verifier.split('case "${ACTION}" in', 1)[1]
        self.assertRegex(
            runtime_case,
            r"(?s)--runtime\).*?assert_invalid_public_client_certificate_rejected",
        )
        disabled_case = verifier.split(
            'if [[ "${ACTION}" == "--runtime"', 1
        )[1].split("resolve_live_mode", 1)[0]
        self.assertIn(
            "assert_invalid_public_client_certificate_accepted_by_legacy_edge",
            disabled_case,
        )
        self.assertIn("assert_backend_loopback_listener", verifier)
        deploy = (ROOT / "scripts" / "deploy.sh").read_text(encoding="utf-8")
        self.assertIn("--runtime --expected-mode disabled", deploy)

    def test_shell_invokes_nginx_parser_with_both_vhost_contracts(self) -> None:
        verifier = MTLS_EDGE_VERIFIER_PATH.read_text(encoding="utf-8")
        invocation = verifier.rsplit(
            '"${ROOT_DIR}/scripts/verify_openai_v1_mtls_nginx_contract.py"',
            1,
        )[1].split("; then", 1)[0]
        for argument in (
            '--expected-file "${ACTIVE_NGINX_CONFIG}"',
            '--host "${MCP_HOST}"',
            '--main-deny-file "${ACTIVE_MAIN_NGINX_DENY_CONFIG}"',
            '--main-host "${MAIN_HOST}"',
        ):
            self.assertIn(argument, invocation)
        self.assertNotIn("--active-file", invocation)

    def test_mode_reader_does_not_source_environment_and_rejects_drift(self) -> None:
        library = ROOT / "scripts" / "lib" / "openai_v1_mtls_mode.sh"
        with tempfile.TemporaryDirectory() as temporary:
            environment = Path(temporary) / "skillpilot.env"
            environment.write_text(
                "DATABASE_PASSWORD=do-not-print-me\n"
                'SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE="observe"\n',
                encoding="utf-8",
            )
            result = subprocess.run(
                [
                    "bash",
                    "-c",
                    'source "$1"; read_openai_v1_mtls_backend_mode "$2"',
                    "mode-reader-test",
                    str(library),
                    str(environment),
                ],
                check=True,
                capture_output=True,
                text=True,
                timeout=10,
            )
            self.assertEqual(result.stdout, "observe\n")
            self.assertNotIn("do-not-print-me", result.stdout + result.stderr)

            environment.write_text(
                "SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=observe\n"
                "SKILLPILOT_OPENAI_COACH_V1_MTLS_EDGE_MODE=enforce\n",
                encoding="utf-8",
            )
            duplicate = subprocess.run(
                [
                    "bash",
                    "-c",
                    'source "$1"; read_openai_v1_mtls_backend_mode "$2"',
                    "mode-reader-test",
                    str(library),
                    str(environment),
                ],
                check=False,
                capture_output=True,
                text=True,
                timeout=10,
            )
            self.assertNotEqual(duplicate.returncode, 0)
            self.assertNotIn("do-not-print-me", duplicate.stdout + duplicate.stderr)


if __name__ == "__main__":
    unittest.main()
