#!/usr/bin/env python3
"""Local SAN/EKU verifier for the SkillPilot OpenAI MCP nginx auth_request."""

from __future__ import annotations

import argparse
import hashlib
import http.server
import os
from pathlib import Path
import re
import ssl
import subprocess
import tempfile
from urllib.parse import unquote

EXPECTED_SAN = "mtls.prod.connectors.openai.com"
EXPECTED_ROOT_CERT_SHA256 = (
    "493d9a1edc48d558f5a28764b20605205a50e1df4840231e342f2e0e8cdd5be9"
)
EXPECTED_INTERMEDIATE_CERT_SHA256 = (
    "da3d8e2e32ee4981ea1152c1456f866c863dbde2fbf4f8eba8850df74b656816"
)
MAX_CERTIFICATE_HEADER_BYTES = 32 * 1024


class CertificateVerifier:
    def __init__(
        self,
        root_ca: Path,
        intermediate_ca: Path,
        openssl: str = "openssl",
        expected_root_fingerprint: str = EXPECTED_ROOT_CERT_SHA256,
        expected_intermediate_fingerprint: str = EXPECTED_INTERMEDIATE_CERT_SHA256,
    ) -> None:
        self.root_ca = root_ca
        self.intermediate_ca = intermediate_ca
        self.openssl = openssl
        self._require_fingerprint(root_ca, expected_root_fingerprint)
        self._require_fingerprint(intermediate_ca, expected_intermediate_fingerprint)
        self.intermediate_subject = self._certificate_name(
            intermediate_ca, "-subject"
        )

    def verify(self, certificate_pem: str) -> tuple[bool, str]:
        if (
            not certificate_pem
            or len(certificate_pem.encode("utf-8")) > MAX_CERTIFICATE_HEADER_BYTES
            or "-----BEGIN CERTIFICATE-----" not in certificate_pem
            or "-----END CERTIFICATE-----" not in certificate_pem
        ):
            return False, "missing_or_malformed_leaf"

        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", suffix=".pem", delete=False
        ) as handle:
            handle.write(certificate_pem)
            leaf_path = Path(handle.name)
        os.chmod(leaf_path, 0o600)
        try:
            chain = self._run(
                "verify",
                "-purpose",
                "sslclient",
                "-CAfile",
                str(self.root_ca),
                "-untrusted",
                str(self.intermediate_ca),
                "-show_chain",
                str(leaf_path),
            )
            if chain.returncode != 0:
                return False, "invalid_chain_or_client_eku"

            if self._certificate_name(leaf_path, "-issuer") != self.intermediate_subject:
                return False, "unexpected_intermediate"

            san = self._run(
                "x509",
                "-in",
                str(leaf_path),
                "-noout",
                "-ext",
                "subjectAltName",
            )
            if san.returncode != 0:
                return False, "missing_san"
            dns_names = set(re.findall(r"DNS:([^,\s]+)", san.stdout))
            if dns_names != {EXPECTED_SAN}:
                return False, "unexpected_san"
            return True, hashlib.sha256(certificate_pem.encode("utf-8")).hexdigest()[:16]
        finally:
            leaf_path.unlink(missing_ok=True)

    @staticmethod
    def certificate_fingerprint(certificate: Path) -> str:
        pem = certificate.read_text(encoding="utf-8")
        der = ssl.PEM_cert_to_DER_cert(pem)
        return hashlib.sha256(der).hexdigest()

    def _require_fingerprint(self, certificate: Path, expected: str) -> None:
        actual = self.certificate_fingerprint(certificate)
        if actual != expected.lower().replace(":", ""):
            raise ValueError(
                f"unexpected certificate fingerprint for {certificate}: {actual}"
            )

    def _certificate_name(self, certificate: Path, selector: str) -> str:
        result = self._run(
            "x509",
            "-in",
            str(certificate),
            "-noout",
            selector,
            "-nameopt",
            "RFC2253",
        )
        if result.returncode != 0 or "=" not in result.stdout:
            return ""
        return result.stdout.strip().split("=", 1)[1]

    def _run(self, *arguments: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [self.openssl, *arguments],
            check=False,
            capture_output=True,
            text=True,
            timeout=10,
        )


class VerificationHandler(http.server.BaseHTTPRequestHandler):
    verifier: CertificateVerifier

    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        if self.path != "/verify":
            self.send_error(404)
            return
        nginx_result = self.headers.get("X-OpenAI-Client-Verify", "")
        encoded_certificate = self.headers.get("X-OpenAI-Client-Cert", "")
        certificate = unquote(encoded_certificate)
        accepted, reason = (
            self.verifier.verify(certificate)
            if nginx_result == "SUCCESS"
            else (False, "nginx_chain_verification_failed")
        )
        self.send_response(204 if accepted else 403)
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-SkillPilot-mTLS-Check", reason)
        self.end_headers()

    def log_message(self, format_string: str, *args: object) -> None:
        # Never log the certificate header. The result is sufficient.
        print(
            "%s - %s" % (self.address_string(), format_string % args),
            flush=True,
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--listen", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8792)
    parser.add_argument("--root-ca", required=True, type=Path)
    parser.add_argument("--intermediate-ca", required=True, type=Path)
    parser.add_argument("--openssl", default="openssl")
    args = parser.parse_args()

    if args.listen not in {"127.0.0.1", "::1"}:
        parser.error("the verifier may bind only to loopback")
    if not args.root_ca.is_file():
        parser.error(f"root CA not found: {args.root_ca}")
    if not args.intermediate_ca.is_file():
        parser.error(f"intermediate CA not found: {args.intermediate_ca}")

    try:
        VerificationHandler.verifier = CertificateVerifier(
            args.root_ca,
            args.intermediate_ca,
            args.openssl,
        )
    except ValueError as exception:
        parser.error(str(exception))
    server = http.server.ThreadingHTTPServer(
        (args.listen, args.port), VerificationHandler
    )
    server.serve_forever()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
