#!/usr/bin/env python3
"""Self-contained certificate and edge-contract tests for OpenAI MCP mTLS."""

from __future__ import annotations

import importlib.util
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
    def test_mtls_is_scoped_to_mcp_resource(self) -> None:
        text = (
            ROOT
            / "deploy"
            / "openai-mtls"
            / "skillpilot-openai-de-mtls.nginx.conf"
        ).read_text(encoding="utf-8")
        self.assertIn("ssl_verify_client optional;", text)
        self.assertIn("location = /api/openai/de/mcp", text)
        self.assertIn("location ^~ /api/openai/de/mcp/", text)
        self.assertNotIn("location /api/openai/de/oauth", text)
        self.assertIn("auth_request /_skillpilot/openai-mtls/verify;", text)
        self.assertIn('X-Forwarded-For ""', text)
        self.assertIn('Forwarded ""', text)
        self.assertIn('X-OpenAI-Client-Cert ""', text)
        self.assertIn('X-SSL-Client-Cert ""', text)
        self.assertIn('X-SkillPilot-OpenAI-mTLS-Verified "SUCCESS"', text)
        self.assertIn(
            'X-SkillPilot-OpenAI-mTLS-SAN "mtls.prod.connectors.openai.com"',
            text,
        )

        unit = (
            ROOT
            / "deploy"
            / "openai-mtls"
            / "skillpilot-openai-mtls-verifier.service"
        ).read_text(encoding="utf-8")
        self.assertIn("--root-ca", unit)
        self.assertIn("--intermediate-ca", unit)
        self.assertNotIn("--ca-bundle", unit)


if __name__ == "__main__":
    unittest.main()
