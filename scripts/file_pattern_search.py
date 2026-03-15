#!/usr/bin/env python3
"""Portable text-file search helpers for repo validators.

These validators should behave identically on developer machines and CI.
Use `rg` when available for speed, but fall back to a pure-Python scan when
the runner image does not provide ripgrep.
"""

from __future__ import annotations

import re
import shutil
import subprocess
from collections.abc import Iterable, Iterator
from pathlib import Path


def to_relative(root: Path, path_str: str) -> str:
    path = Path(path_str)
    if path.is_absolute():
        return str(path.relative_to(root))
    return path_str


def _iter_files(root: Path, scan_roots: Iterable[str]) -> Iterator[Path]:
    for scan_root in scan_roots:
        resolved = root / scan_root
        if resolved.is_file():
            yield resolved
            continue
        if not resolved.exists():
            continue
        for path in resolved.rglob("*"):
            if "__pycache__" in path.parts:
                continue
            if path.is_file():
                yield path


def _find_matches_with_python(root: Path, pattern: str, scan_roots: Iterable[str]) -> list[str]:
    compiled_pattern = re.compile(pattern)
    matches: list[str] = []
    for path in _iter_files(root, scan_roots):
        try:
            payload = path.read_bytes()
        except OSError:
            continue
        if b"\x00" in payload[:8192]:
            continue
        content = payload.decode("utf-8", errors="ignore")
        if compiled_pattern.search(content):
            matches.append(str(path.relative_to(root)))
    return sorted(set(matches))


def _find_matches_with_git_grep(root: Path, pattern: str, scan_roots: Iterable[str]) -> list[str] | None:
    git = shutil.which("git")
    if not git or not (root / ".git").exists():
        return None
    result = subprocess.run(
        [git, "grep", "-l", "-E", pattern, "--", *scan_roots],
        cwd=root,
        text=True,
        capture_output=True,
        check=False,
    )
    if result.returncode not in (0, 1):
        raise SystemExit(
            result.stderr.strip() or f"`git grep` failed with exit code {result.returncode}"
        )
    return sorted({to_relative(root, line) for line in result.stdout.splitlines() if line})


def find_matching_files(root: Path, pattern: str, scan_roots: Iterable[str]) -> list[str]:
    rg = shutil.which("rg")
    if rg:
        result = subprocess.run(
            [rg, "-l", pattern, *scan_roots],
            cwd=root,
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode not in (0, 1):
            raise SystemExit(
                result.stderr.strip() or f"`rg` failed with exit code {result.returncode}"
            )
        return sorted({to_relative(root, line) for line in result.stdout.splitlines() if line})

    git_grep_matches = _find_matches_with_git_grep(root, pattern, scan_roots)
    if git_grep_matches is not None:
        return git_grep_matches

    return _find_matches_with_python(root, pattern, scan_roots)
