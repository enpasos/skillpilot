#!/usr/bin/env python3
"""Build and verify all registered SkillPilot single-source documentation compendia.

SPDX-License-Identifier: Apache-2.0
Registry: docs/compendia.json
Pure Python 3 standard library for --verify-sources, --web-and-tex, --check, and --check-untracked-outputs.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[1]
if str(REPO_ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(REPO_ROOT / "scripts"))

from doc_compendium.engine import run_compendia_pipeline  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--compendium",
        action="append",
        dest="compendia",
        help="Optional compendium id(s) from docs/compendia.json (defaults to all)",
    )
    parser.add_argument("--verify-sources", action="store_true", help="Verify canonical sources and DE/EN AST parity")
    parser.add_argument("--web-and-tex", action="store_true", help="Emit Web Markdown, bilingual map, and LaTeX files")
    parser.add_argument("--diagrams", action="store_true", help="Render compendium diagrams where applicable")
    parser.add_argument("--pdfs", action="store_true", help="Compile DE and EN PDFs via LuaLaTeX")
    parser.add_argument("--all", action="store_true", help="Verify, render diagrams, emit Web+TeX, and compile PDFs")
    parser.add_argument("--check", action="store_true", help="Verify generated Web Markdown matches disk without writing")
    parser.add_argument("--check-committed-web", action="store_true", help="Verify committed-web Markdown outputs and bilingual-map.js match canonical sources")
    parser.add_argument("--check-untracked-outputs", action="store_true", help="Fail if untracked-policy outputs are tracked in Git")
    parser.add_argument("--texmf", type=Path, help="Optional unpacked local TeX package tree")
    args = parser.parse_args()

    if not (
        args.verify_sources
        or args.web_and_tex
        or args.diagrams
        or args.pdfs
        or args.all
        or args.check_committed_web
        or args.check_untracked_outputs
    ):
        args.all = True

    run_compendia_pipeline(
        repo_root=REPO_ROOT,
        compendium_ids=args.compendia,
        verify_sources=args.verify_sources,
        web_and_tex=args.web_and_tex,
        diagrams=args.diagrams,
        pdfs=args.pdfs,
        run_all=args.all,
        check_only=args.check,
        check_committed_web=args.check_committed_web,
        check_untracked=args.check_untracked_outputs,
        texmf=args.texmf,
        update_mkdocs_map=(args.compendia is None),
    )


if __name__ == "__main__":
    main()
