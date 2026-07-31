#!/usr/bin/env python3
"""Validate the security-relevant semantics of OpenAI-DE OAuth discovery."""

from __future__ import annotations

import argparse
import json
import sys
from typing import Any
from urllib.parse import urlsplit

READ_SCOPE = "skillpilot.openai.de.read"
WRITE_SCOPE = "skillpilot.openai.de.write"
OFFLINE_SCOPE = "offline_access"
ASYMMETRIC_ASSERTION_ALGORITHMS = {
    "RS256",
    "RS384",
    "RS512",
    "PS256",
    "PS384",
    "PS512",
    "ES256",
    "ES384",
    "ES512",
    "EdDSA",
}


class MetadataValidationError(ValueError):
    """Raised when a discovery document violates the expected contract."""


def _require_object(document: Any) -> dict[str, Any]:
    if not isinstance(document, dict):
        raise MetadataValidationError("document must be a JSON object")
    return document


def _require_exact_value(
    document: dict[str, Any], field: str, expected: Any
) -> None:
    actual = document.get(field)
    if actual != expected:
        raise MetadataValidationError(
            f"{field} must equal {expected!r}, got {actual!r}"
        )


def _require_exact_unique_values(
    document: dict[str, Any], field: str, expected: set[str]
) -> list[str]:
    actual = document.get(field)
    if (
        not isinstance(actual, list)
        or any(not isinstance(item, str) or not item for item in actual)
        or len(actual) != len(set(actual))
        or set(actual) != expected
    ):
        raise MetadataValidationError(
            f"{field} must contain exactly {sorted(expected)!r}, got {actual!r}"
        )
    return actual


def _require_unique_nonempty_strings(
    document: dict[str, Any], field: str
) -> list[str]:
    actual = document.get(field)
    if (
        not isinstance(actual, list)
        or not actual
        or any(not isinstance(item, str) or not item for item in actual)
        or len(actual) != len(set(actual))
    ):
        raise MetadataValidationError(
            f"{field} must be a non-empty list of unique strings, got {actual!r}"
        )
    return actual


def _normalized_https_base_url(base_url: str) -> str:
    normalized = base_url.rstrip("/")
    parsed = urlsplit(normalized)
    if (
        parsed.scheme != "https"
        or not parsed.netloc
        or parsed.path
        or parsed.query
        or parsed.fragment
    ):
        raise MetadataValidationError(
            "base URL must be an HTTPS origin without path, query, or fragment"
        )
    return normalized


def validate_protected_resource(
    document: Any,
    base_url: str,
    expected_resource: str | None = None,
    authorization_base_url: str | None = None,
) -> None:
    metadata = _require_object(document)
    base = _normalized_https_base_url(base_url)
    authorization_base = _normalized_https_base_url(
        authorization_base_url or base
    )
    resource = expected_resource or base
    parsed_resource = urlsplit(resource)
    if (
        parsed_resource.scheme != "https"
        or not parsed_resource.netloc
        or parsed_resource.username
        or parsed_resource.password
        or parsed_resource.query
        or parsed_resource.fragment
    ):
        raise MetadataValidationError(
            "expected resource must be an HTTPS URL without credentials, "
            "query, or fragment"
        )
    _require_exact_value(
        metadata, "resource", resource
    )
    _require_exact_value(
        metadata,
        "authorization_servers",
        [f"{authorization_base}/api/openai/de"],
    )
    _require_exact_unique_values(
        metadata, "scopes_supported", {READ_SCOPE, WRITE_SCOPE}
    )
    _require_exact_value(metadata, "bearer_methods_supported", ["header"])


def validate_authorization_server(
    document: Any,
    base_url: str,
    required_client_authentication_method: str | None = None,
) -> None:
    metadata = _require_object(document)
    base = _normalized_https_base_url(base_url)
    issuer = f"{base}/api/openai/de"

    _require_exact_value(metadata, "issuer", issuer)
    _require_exact_value(
        metadata, "authorization_endpoint", f"{issuer}/oauth2/authorize"
    )
    _require_exact_value(metadata, "token_endpoint", f"{issuer}/oauth2/token")
    _require_exact_value(
        metadata, "revocation_endpoint", f"{issuer}/oauth2/revoke"
    )
    _require_exact_value(
        metadata, "introspection_endpoint", f"{issuer}/oauth2/introspect"
    )
    _require_exact_value(metadata, "response_types_supported", ["code"])
    _require_exact_unique_values(
        metadata,
        "grant_types_supported",
        {"authorization_code", "refresh_token"},
    )
    _require_exact_value(metadata, "code_challenge_methods_supported", ["S256"])
    _require_exact_unique_values(
        metadata,
        "scopes_supported",
        {READ_SCOPE, WRITE_SCOPE, OFFLINE_SCOPE},
    )

    token_authentication_methods = metadata.get(
        "token_endpoint_auth_methods_supported"
    )
    if token_authentication_methods not in (
        ["client_secret_basic"],
        ["none"],
        ["private_key_jwt"],
    ):
        raise MetadataValidationError(
            "token_endpoint_auth_methods_supported must be exactly "
            "['client_secret_basic'], ['none'] or ['private_key_jwt']"
        )
    _require_exact_value(
        metadata,
        "revocation_endpoint_auth_methods_supported",
        token_authentication_methods,
    )
    authentication_method = token_authentication_methods[0]
    if (
        required_client_authentication_method is not None
        and authentication_method != required_client_authentication_method
    ):
        raise MetadataValidationError(
            "token endpoint client authentication must be "
            f"{required_client_authentication_method!r}, "
            f"got {authentication_method!r}"
        )

    if "registration_endpoint" in metadata:
        raise MetadataValidationError(
            "registration_endpoint must be absent; open DCR is not supported"
        )

    if authentication_method == "private_key_jwt":
        _require_exact_value(
            metadata, "client_id_metadata_document_supported", True
        )
        algorithms = _require_unique_nonempty_strings(
            metadata,
            "token_endpoint_auth_signing_alg_values_supported",
        )
        if any(
            algorithm not in ASYMMETRIC_ASSERTION_ALGORITHMS
            for algorithm in algorithms
        ):
            raise MetadataValidationError(
                "private_key_jwt requires supported asymmetric signing algorithms"
            )
    else:
        if "client_id_metadata_document_supported" in metadata:
            raise MetadataValidationError(
                "non-CIMD client metadata must not advertise CIMD support"
            )
        if "token_endpoint_auth_signing_alg_values_supported" in metadata:
            raise MetadataValidationError(
                "non-assertion client metadata must not advertise assertion algorithms"
            )


def _parse_arguments() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--kind",
        required=True,
        choices=("protected-resource", "authorization-server"),
    )
    parser.add_argument("--base-url", required=True)
    parser.add_argument(
        "--expected-resource",
        help=(
            "Exact protected-resource identifier. Defaults to the V1 "
            "<base-url> origin."
        ),
    )
    parser.add_argument(
        "--authorization-base-url",
        help=(
            "HTTPS origin hosting the authorization server. Defaults to "
            "--base-url."
        ),
    )
    parser.add_argument(
        "--required-client-authentication-method",
        choices=("client_secret_basic", "none", "private_key_jwt"),
    )
    return parser.parse_args()


def main() -> int:
    arguments = _parse_arguments()
    try:
        document = json.load(sys.stdin)
        if arguments.kind == "protected-resource":
            if arguments.required_client_authentication_method is not None:
                raise MetadataValidationError(
                    "client authentication applies only to authorization metadata"
                )
            validate_protected_resource(
                document,
                arguments.base_url,
                arguments.expected_resource,
                arguments.authorization_base_url,
            )
        else:
            if (
                arguments.expected_resource is not None
                or arguments.authorization_base_url is not None
            ):
                raise MetadataValidationError(
                    "protected-resource overrides apply only to protected "
                    "resource metadata"
                )
            validate_authorization_server(
                document,
                arguments.base_url,
                arguments.required_client_authentication_method,
            )
    except (json.JSONDecodeError, MetadataValidationError) as error:
        print(f"OAuth metadata validation failed: {error}", file=sys.stderr)
        return 1

    print(f"OAuth metadata validation passed: {arguments.kind}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
