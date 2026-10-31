#!/usr/bin/env python3
"""Build the German graph reference locally; never publish it.

SPDX-License-Identifier: Apache-2.0
Requires LuaLaTeX and the packages declared in the document preamble.
Optional --texmf supplies an unpacked TeX tree without system installation.
"""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def log_problems(log):
    """Reject unresolved references, pending reruns and damaged output."""
    problems = re.findall(
        r"^.*(?:Overfull \\[hv]box|undefined references|undefined citations|"
        r"Rerun to get cross-references|Missing character:|No hyphenation patterns).*$",
        log, re.MULTILINE | re.IGNORECASE)
    # TeX wraps individual warnings, sometimes before 'undefined'. Consider
    # the complete warning paragraph instead of relying on the summary line.
    for paragraph in re.split(r"\n[ \t]*\n", log):
        warning = re.search(r"^LaTeX Warning:[\s\S]*", paragraph,
                            re.MULTILINE | re.IGNORECASE)
        if warning and re.search(r"undefined|may have changed|multiply[- ]defined",
                                 warning[0], re.IGNORECASE):
            problems.append(" ".join(warning[0].split()))
    return list(dict.fromkeys(problems))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--texmf", type=Path, help="Additional local TeX package tree")
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[4]
    source_dir = root / "docs/concept/skill-graph"
    name = "skillpilot-graph-definition"
    build_dir = root / "tmp/skill-graph-document"
    build_dir.mkdir(parents=True, exist_ok=True)
    env = os.environ.copy()
    # A fixed document timestamp makes same-toolchain rebuilds comparable.
    env["SOURCE_DATE_EPOCH"] = "1793404800"  # 2026-10-31 00:00:00 UTC
    env["FORCE_SOURCE_DATE"] = "1"
    if args.texmf:
        tree = args.texmf.resolve()
        if not tree.is_dir():
            parser.error(f"TeX tree does not exist: {tree}")
        # LuaBabel reads language.dat at runtime. Register German locally when
        # an extracted language package is used; leave system TeX untouched.
        config_dir = build_dir / "texconfig"
        config_dir.mkdir(exist_ok=True)
        language_file = subprocess.check_output(
            ["kpsewhich", "language.dat"], text=True).strip()
        languages = Path(language_file).read_text()
        if not re.search(r"^ngerman\s", languages, re.MULTILINE):
            languages += "\nngerman loadhyph-de-1996.tex\n=naustrian\n=nswissgerman\n"
        (config_dir / "language.dat").write_text(languages)
        env["TEXINPUTS"] = f"{config_dir}//:{tree}/tex//:" + env.get("TEXINPUTS", "")
        env["LUAINPUTS"] = f"{tree}//:" + env.get("LUAINPUTS", "")
    if not shutil.which("lualatex"):
        parser.error("LuaLaTeX is required (TeX Live with German language support).")
    command = ["lualatex", "-halt-on-error", "-interaction=nonstopmode",
               "-file-line-error", "-recorder", f"-output-directory={build_dir}",
               f"{name}.tex"]
    for run in range(1, 4):
        result = subprocess.run(command, cwd=source_dir, env=env, text=True,
                                stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
        (build_dir / f"pass-{run}.txt").write_text(result.stdout)
        if result.returncode:
            print(result.stdout[-7000:], file=sys.stderr)
            raise SystemExit(f"LaTeX pass {run} failed; see {build_dir}.")
    log = (build_dir / f"{name}.log").read_text(errors="replace")
    problems = log_problems(log)
    if problems:
        print("\n".join(problems), file=sys.stderr)
        raise SystemExit(f"Document needs review; see {build_dir / (name + '.log')}")
    target = source_dir / f"{name}.pdf"
    shutil.copy2(build_dir / target.name, target)
    inputs = sorted({source_dir / f"{name}.tex",
                     *source_dir.glob("latex/*.tex"),
                     *source_dir.glob("assets/graph-definition/*.png"),
                     Path(__file__).resolve(),
                     source_dir / "latex/check-assessment-model.py"})
    sources = [
        "AGENTS.md", "LICENSING.md",
        "docs/concept/skill-graph/assessment-gated-completion.md",
        "docs/concept/skill-graph/graph-definition.md",
        "docs/concept/skill-graph/node-types.md",
        "docs/concept/skill-graph/general-goal-system-and-migration.md",
        "docs/concept/skill-graph/view-projection-and-goal-placement.md",
        "docs/concept/skill-graph/curriculum-levels.md",
        "docs/concept/levels-of-personalization.md",
        "docs/concept/didactic/curriculum-time-axis-and-pacing.md",
        "docs/concept/skill-graph/source-and-resource-links.md",
        "docs/concept/skill-graph/human-readable-source-rationales.md",
        "docs/concept/skill-graph/dual-curriculum-package-releases.md",
        "docs/qa-ci/graph-validation-rules.md",
        "docs/qa-ci/curriculum-quality-maturity-and-routes.md",
    ]
    # Bind every local source cited by the prose, including code used for the
    # explicit specification/implementation comparison.
    for tex in [source_dir / f"{name}.tex", *source_dir.glob("latex/*.tex")]:
        sources.extend(re.findall(r"\\srcref\{([^}]+)\}", tex.read_text()))
    sources = sorted(set(sources))
    missing = [p for p in sources if not (root / p).is_file()]
    if missing:
        raise SystemExit(f"Unresolved cited sources: {missing}")
    version = subprocess.check_output(["lualatex", "--version"], text=True).splitlines()[0]
    manifest = {
        "documentDate": "2026-10-31",
        "engine": version,
        "sourceDateEpoch": env["SOURCE_DATE_EPOCH"],
        "pdf": {"path": str(target.relative_to(root)), "sha256": digest(target)},
        "inputs": {str(p.relative_to(root)): digest(p) for p in inputs},
        "conceptSources": {p: digest(root / p) for p in sources},
        "scope": "Technical documentation build; no runtime, publication or learner validation.",
    }
    (source_dir / f"{name}.build.json").write_text(
        json.dumps(manifest, indent=2, ensure_ascii=False) + "\n")
    print(f"Built {target.relative_to(root)}")
    print("Three LaTeX passes; no overflow, missing glyphs or unresolved references.")
    print(f"Build logs: {build_dir.relative_to(root)}")


if __name__ == "__main__":
    main()
