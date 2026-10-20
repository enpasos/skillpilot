#!/usr/bin/env python3
"""Verify that an nginx -T dump binds the reviewed OpenAI V1 mTLS vHost."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import re
import sys


CONFIGURATION_MARKER = re.compile(r"^# configuration file (.+):[ \t]*$")
HOST_NAME = re.compile(
    r"^(?=.{1,253}\Z)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+"
    r"[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$"
)

REQUIRED_DIRECTIVES = (
    ("ssl_verify_client", "optional"),
    ("include", "/etc/skillpilot/openai-mtls/mode.conf"),
    ("proxy_pass", "http://127.0.0.1:8792/verify"),
    ("auth_request", "/_skillpilot_openai_mtls_verify"),
    (
        "proxy_set_header",
        "X-SkillPilot-OpenAI-mTLS-Mode",
        "$skillpilot_openai_mtls_mode",
    ),
    (
        "proxy_set_header",
        "X-SkillPilot-OpenAI-mTLS-Remote-Addr",
        "$realip_remote_addr",
    ),
    (
        "proxy_set_header",
        "X-SkillPilot-OpenAI-mTLS-Client-Verify",
        "$ssl_client_verify",
    ),
    (
        "proxy_set_header",
        "X-SkillPilot-OpenAI-mTLS-Client-Cert",
        "$ssl_client_escaped_cert",
    ),
    (
        "proxy_set_header",
        "X-SkillPilot-OpenAI-mTLS-Classification",
        "$skillpilot_openai_mtls_classification",
    ),
)


class ContractError(ValueError):
    """Raised when the effective nginx configuration violates the contract."""


@dataclass(frozen=True)
class ServerBlock:
    source_file: str
    tokens: tuple[str, ...]


def configuration_sections(configuration: str) -> list[tuple[str, str]]:
    """Split nginx -T output into source-labelled configuration sections."""
    sections: list[tuple[str, list[str]]] = []
    for line in configuration.splitlines():
        marker = CONFIGURATION_MARKER.fullmatch(line)
        if marker is not None:
            sections.append((marker.group(1), []))
        elif sections:
            sections[-1][1].append(line)
    return [(path, "\n".join(lines)) for path, lines in sections]


def tokenize_nginx(configuration: str) -> list[str]:
    """Tokenize the nginx subset needed for server/directive inspection."""
    tokens: list[str] = []
    index = 0
    while index < len(configuration):
        character = configuration[index]
        if character.isspace():
            index += 1
            continue
        if character == "#":
            newline = configuration.find("\n", index)
            index = len(configuration) if newline < 0 else newline + 1
            continue
        if character in "{};":
            tokens.append(character)
            index += 1
            continue
        if character in "\"'":
            quote = character
            index += 1
            value: list[str] = []
            while index < len(configuration):
                character = configuration[index]
                if character == "\\" and index + 1 < len(configuration):
                    value.append(configuration[index + 1])
                    index += 2
                    continue
                if character == quote:
                    index += 1
                    break
                value.append(character)
                index += 1
            else:
                raise ContractError("unterminated quoted nginx token")
            tokens.append("".join(value))
            continue

        start = index
        while (
            index < len(configuration)
            and not configuration[index].isspace()
            and configuration[index] not in "{};#\"'"
        ):
            index += 1
        if start == index:
            raise ContractError("unsupported nginx token")
        tokens.append(configuration[start:index])
    return tokens


def server_blocks(source_file: str, configuration: str) -> list[ServerBlock]:
    tokens = tokenize_nginx(configuration)
    blocks: list[ServerBlock] = []
    index = 0
    while index + 1 < len(tokens):
        if tokens[index] != "server" or tokens[index + 1] != "{":
            index += 1
            continue
        depth = 1
        end = index + 2
        while end < len(tokens) and depth:
            if tokens[end] == "{":
                depth += 1
            elif tokens[end] == "}":
                depth -= 1
            end += 1
        if depth:
            raise ContractError(f"unterminated server block in {source_file}")
        blocks.append(ServerBlock(source_file, tuple(tokens[index + 2 : end - 1])))
        index = end
    return blocks


def directives(tokens: tuple[str, ...], *, direct_only: bool) -> list[tuple[str, ...]]:
    result: list[tuple[str, ...]] = []
    pending: list[str] = []
    depth = 0
    for token in tokens:
        if token == "{":
            depth += 1
            pending.clear()
        elif token == "}":
            if depth == 0:
                raise ContractError("unexpected closing brace in server block")
            depth -= 1
            pending.clear()
        elif token == ";":
            if pending and (not direct_only or depth == 0):
                result.append(tuple(pending))
            pending.clear()
        elif not direct_only or depth == 0:
            pending.append(token)
    if depth:
        raise ContractError("unterminated nested nginx block")
    return result


def is_tls_443_listener(arguments: tuple[str, ...]) -> bool:
    normalized = tuple(argument.lower() for argument in arguments)
    has_tls = "ssl" in normalized
    has_port = any(
        argument == "443" or re.search(r":443\Z", argument) is not None
        for argument in normalized
    )
    return has_tls and has_port


def is_http_80_listener(arguments: tuple[str, ...]) -> bool:
    return "ssl" not in arguments and any(
        argument == "80" or re.search(r":80\Z", argument) is not None
        for argument in arguments
    )


def binds_host_on_tls_443(block: ServerBlock, host: str) -> bool:
    direct = directives(block.tokens, direct_only=True)
    names = {
        name.rstrip(".").lower()
        for directive in direct
        if directive and directive[0] == "server_name"
        for name in directive[1:]
    }
    listens_on_tls_443 = any(
        is_tls_443_listener(directive[1:])
        for directive in direct
        if directive and directive[0] == "listen"
    )
    return host in names and listens_on_tls_443


def require_exact_marker(configuration: str, path: str) -> None:
    expected_marker = f"# configuration file {path}:"
    marker_count = sum(
        line == expected_marker for line in configuration.splitlines()
    )
    if marker_count != 1:
        raise ContractError(
            f"expected exactly one configuration marker for {path}, "
            f"found {marker_count}"
        )


def verify_contract(
    configuration: str,
    expected_file: str,
    host: str,
    main_deny_file: str,
    main_host: str,
    retired_hosts: tuple[str, ...] = (),
) -> None:
    require_exact_marker(configuration, expected_file)
    require_exact_marker(configuration, main_deny_file)

    blocks = [
        block
        for source_file, section in configuration_sections(configuration)
        for block in server_blocks(source_file, section)
    ]
    candidates = [
        block for block in blocks if binds_host_on_tls_443(block, host)
    ]
    if len(candidates) != 1:
        origins = ", ".join(block.source_file for block in candidates) or "none"
        raise ContractError(
            f"expected exactly one TLS-443 server block for {host}, "
            f"found {len(candidates)} ({origins})"
        )

    active = candidates[0]
    if active.source_file != expected_file:
        raise ContractError(
            f"TLS-443 server block for {host} originates from "
            f"{active.source_file}, not {expected_file}"
        )

    active_directives = set(directives(active.tokens, direct_only=False))
    missing = [
        " ".join(required) + ";"
        for required in REQUIRED_DIRECTIVES
        if required not in active_directives
    ]
    if missing:
        raise ContractError(
            "active TLS-443 server block is missing required directives: "
            + ", ".join(missing)
        )

    for retired_host in retired_hosts:
        retired = [block for block in blocks if binds_host_on_tls_443(block, retired_host)]
        if len(retired) != 1 or retired[0].source_file != expected_file:
            raise ContractError(
                f"retired host {retired_host} must have exactly one TLS-443 "
                f"binding in {expected_file}"
            )
        retired_directives = directives(retired[0].tokens, direct_only=False)
        if any(item[0] == "proxy_pass" for item in retired_directives) or [
            item for item in retired_directives if item[0] == "return"
        ] != [("return", "404")]:
            raise ContractError(
                f"retired host {retired_host} must return only 404 without proxying or redirecting"
            )

    main_candidates = [
        block for block in blocks if binds_host_on_tls_443(block, main_host)
    ]
    if len(main_candidates) != 1:
        origins = ", ".join(block.source_file for block in main_candidates) or "none"
        raise ContractError(
            f"expected exactly one TLS-443 server block for {main_host}, "
            f"found {len(main_candidates)} ({origins})"
        )
    main_directives = set(directives(main_candidates[0].tokens, direct_only=True))
    if ("include", main_deny_file) not in main_directives:
        raise ContractError(
            f"TLS-443 server block for {main_host} does not directly include "
            f"{main_deny_file}"
        )


def verify_bootstrap_contract(configuration: str, expected_file: str, host: str) -> None:
    require_exact_marker(configuration, expected_file)
    candidates = []
    for source_file, section in configuration_sections(configuration):
        for block in server_blocks(source_file, section):
            direct = directives(block.tokens, direct_only=True)
            names = {name for item in direct if item[0] == "server_name" for name in item[1:]}
            if host in names and any(
                item[0] == "listen" and is_http_80_listener(item[1:])
                for item in direct
            ):
                candidates.append(block)
    if len(candidates) != 1 or candidates[0].source_file != expected_file:
        raise ContractError(f"expected one HTTP-80 bootstrap binding for {host} in {expected_file}")
    block = candidates[0]
    all_directives = directives(block.tokens, direct_only=False)
    if any(item[0] == "proxy_pass" for item in all_directives):
        raise ContractError("HTTP bootstrap must never proxy application traffic")
    for required in (
        ("root", "/var/lib/skillpilot-openai-acme"),
        ("try_files", "$uri", "=404"),
        ("return", "404"),
    ):
        if required not in all_directives:
            raise ContractError("HTTP bootstrap is missing " + " ".join(required))


def parse_args(arguments: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--expected-file", required=True)
    parser.add_argument("--host", required=True)
    parser.add_argument("--main-deny-file")
    parser.add_argument("--main-host")
    parser.add_argument("--retired-host", action="append", default=[])
    parser.add_argument("--bootstrap-only", action="store_true")
    args = parser.parse_args(arguments)
    if not args.bootstrap_only and (not args.main_deny_file or not args.main_host):
        parser.error("--main-deny-file and --main-host are required for the TLS contract")
    for option, value in (
        ("--expected-file", args.expected_file),
        ("--main-deny-file", args.main_deny_file),
    ):
        if value is not None and not value.startswith("/"):
            parser.error(f"{option} must be an absolute path")
    for attribute, option in (("host", "--host"), ("main_host", "--main-host")):
        if getattr(args, attribute) is None:
            continue
        value = getattr(args, attribute).rstrip(".").lower()
        if HOST_NAME.fullmatch(value) is None:
            parser.error(f"{option} must be an exact DNS host name")
        setattr(args, attribute, value)
    for value in args.retired_host:
        if HOST_NAME.fullmatch(value) is None:
            parser.error("--retired-host must be an exact DNS host name")
    return args


def main(arguments: list[str] | None = None) -> int:
    args = parse_args(arguments)
    try:
        configuration = sys.stdin.read()
        if args.bootstrap_only:
            verify_bootstrap_contract(configuration, args.expected_file, args.host)
        else:
            verify_contract(
                configuration,
                args.expected_file,
                args.host,
                args.main_deny_file,
                args.main_host,
                tuple(args.retired_host),
            )
    except ContractError as exception:
        print(f"CHECK mtls_nginx_active_binding FAIL {exception}", file=sys.stderr)
        return 1
    print(
        "CHECK mtls_nginx_active_binding PASS "
        f"{args.host} is uniquely bound by {args.expected_file}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
