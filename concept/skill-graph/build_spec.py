#!/usr/bin/env python3
"""Compile the bilingual SkillPilot Graph Definition for Web (MkDocs) and PDF (LuaLaTeX).

SPDX-License-Identifier: Apache-2.0
Canonical single source: docs/concept/skill-graph/source/
Delegates to the shared compendium compiler in scripts/doc_compendium/.
"""

from __future__ import annotations

import argparse
from pathlib import Path
import sys

REPO_ROOT = Path(__file__).resolve().parents[3]
if str(REPO_ROOT / "scripts") not in sys.path:
    sys.path.insert(0, str(REPO_ROOT / "scripts"))

from doc_compendium.engine import run_compendia_pipeline  # noqa: E402


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--verify-sources", action="store_true", help="Verify canonical sources and DE/EN AST parity")
    parser.add_argument("--web-and-tex", action="store_true", help="Emit all Web Markdown and intermediate LaTeX files")
    parser.add_argument("--diagrams", action="store_true", help="Render bilingual Matplotlib PNG diagrams")
    parser.add_argument("--pdfs", action="store_true", help="Compile DE and EN PDFs via LuaLaTeX")
    parser.add_argument("--all", action="store_true", help="Verify, check math model, render diagrams, emit Web+TeX, compile DE+EN PDFs")
    parser.add_argument("--check", action="store_true", help="Verify generated Web Markdown matches disk without writing")
    parser.add_argument("--check-untracked-outputs", action="store_true", help="Fail if generated or retired Skill Graph artifacts are tracked in Git")
    parser.add_argument("--texmf", type=Path, help="Optional unpacked local TeX package tree")
    args = parser.parse_args()
    if not (args.verify_sources or args.web_and_tex or args.diagrams or args.pdfs or args.all or args.check_untracked_outputs):
        args.all = True

    run_compendia_pipeline(
        repo_root=REPO_ROOT,
        compendium_ids=["skill-graph"],
        verify_sources=args.verify_sources,
        web_and_tex=args.web_and_tex,
        diagrams=args.diagrams,
        pdfs=args.pdfs,
        run_all=args.all,
        check_only=args.check,
        check_untracked=args.check_untracked_outputs,
        texmf=args.texmf,
        update_mkdocs_map=False,
    )


if __name__ == "__main__":
    main()
