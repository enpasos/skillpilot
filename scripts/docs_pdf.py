#!/usr/bin/env python3
"""Build the skill-graph PDF from the same Markdown/images as MkDocs.

Also acts as a MkDocs >=1.6 hook. Generated files live under tmp/, never in
source control. Any typesetting error or overflow prevents publication.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import logging
import os
from pathlib import Path
import posixpath
import re
import shutil
import subprocess
import tempfile
from urllib.parse import quote, urlsplit, urlunsplit

SOURCE = "concept/skill-graph/graph-definition.md"
DOWNLOAD = "downloads/SkillPilot_Skill_Graph_Specification.pdf"
SITE_URL = "https://enpasos.github.io/skillpilot/"
HERE = Path(__file__).resolve().parent
LOG = logging.getLogger("mkdocs.plugins.skill_graph_pdf")


def run(args: list[str], *, cwd: Path, text: str | None = None,
        env: dict[str, str] | None = None) -> str:
    result = subprocess.run(args, cwd=cwd, input=text, text=True,
                            stdout=subprocess.PIPE, stderr=subprocess.PIPE,
                            timeout=180, env=env, check=False)
    if result.returncode:
        raise RuntimeError(f"{args[0]} failed ({result.returncode}):\n"
                           f"{result.stdout[-6000:]}\n{result.stderr[-6000:]}")
    return result.stdout


def tex_escape(text: str) -> str:
    table = {"\\": r"\textbackslash{}", "{": r"\{", "}": r"\}",
             "$": r"\$", "&": r"\&", "#": r"\#", "%": r"\%",
             "_": r"\_", "~": r"\textasciitilde{}", "^": r"\textasciicircum{}"}
    return "".join(table.get(c, c) for c in text)


def breakable_code(text: str) -> str:
    # Soft break opportunities do not change the displayed identifier/path.
    return r"\texttt{" + "".join(tex_escape(c) + (r"\allowbreak{}"
        if c in "/_.:-" or len(text) > 50 else "") for c in text) + "}"


def print_math(tex: str) -> str:
    """Presentation-only wrapping of the specification's long expressions."""
    tex = tex.strip()
    if tex.startswith("F_Q(g)=1") and r"\forall d" in tex:
        lhs, rhs = tex.split(r"\iff", 1)
        quantifier, clauses = rhs.strip().split(":", 1)
        alternatives = re.split(r"\\\s*\\lor\\\s*", clauses.strip())
        # Keep all predicates/operators; split before the OR alternatives.
        tex = (r"\begin{gathered}" + lhs + r"\iff\\" + quantifier + ":\\\\"
               + r"\begin{aligned}&" + (r"\\&\lor ").join(alternatives)
               + r"\end{aligned}\end{gathered}")
    elif tex.startswith("Frontier") and r"\left\{" in tex:
        lhs, rhs = tex.split(r"\left\{", 1)
        inside = rhs.rsplit(r"\right\}", 1)[0]
        inside = inside.replace(r"\middle|", r"\mid")
        inside = inside.replace(r"\forall", r"\\\quad\forall", 1)
        tex = (r"\begin{gathered}" + lhs.strip() + r"\\\left\{\begin{array}{l}"
               + inside + r"\end{array}\right\}\end{gathered}")
    elif r"\Rightarrow" in tex and len(tex) > 155:
        left, right = tex.split(r"\Rightarrow", 1)
        tex = r"\begin{gathered}" + left + r"\\\Rightarrow " + right + r"\end{gathered}"
    return r"\FitMath{" + tex + "}"


def resolve_image(target: str, docs: Path) -> Path:
    if urlsplit(target).scheme or "#" in target or "?" in target:
        raise ValueError(f"PDF images must be local source files: {target}")
    path = (docs / Path(SOURCE).parent / target).resolve()
    if not path.is_relative_to(docs.resolve()) or not path.is_file():
        raise ValueError(f"Missing or unsafe PDF image: {target}")
    if any(c in str(path) for c in "{}%\\"):
        raise ValueError(f"Unsupported TeX image path: {path}")
    return path


def online_link(target: str, site_url: str) -> str:
    parsed = urlsplit(target)
    if parsed.scheme or target.startswith(("#", "/")):
        return target
    path = posixpath.normpath(posixpath.join(posixpath.dirname(SOURCE), parsed.path))
    if path == ".." or path.startswith("../"):
        raise ValueError(f"Link leaves the documentation tree: {target}")
    if path.endswith(".md"):
        path = path[:-3] + "/"
        if path.endswith("index/"):
            path = path[:-6]
    return urlunsplit((urlsplit(site_url).scheme, urlsplit(site_url).netloc,
                      urlsplit(site_url).path.rstrip("/") + "/" + quote(path, safe="/"),
                      parsed.query, parsed.fragment))


def transform(node, docs: Path, site_url: str, images: set[Path]):
    if isinstance(node, list):
        return [transform(x, docs, site_url, images) for x in node]
    if not isinstance(node, dict):
        return node
    kind, content = node.get("t"), node.get("c")
    if kind == "Header":
        content[0] = max(1, content[0] - 1)
    if kind == "Math" and content[0]["t"] == "DisplayMath":
        return {"t": "RawInline", "c": ["latex", print_math(content[1])]}
    if kind == "Code":
        return {"t": "RawInline", "c": ["latex", breakable_code(content[1])]}
    if kind == "Image":
        path = resolve_image(content[2][0], docs)
        images.add(path)
        return {"t": "RawInline", "c": ["latex", r"\PrintFigure{" + str(path) + "}"]}
    if kind == "Link":
        content[2][0] = online_link(content[2][0], site_url)
    return {k: transform(v, docs, site_url, images) for k, v in node.items()}


def verify_pdf(path: Path) -> int:
    import pymupdf
    with pymupdf.open(path) as pdf:
        if len(pdf) < 2:
            raise RuntimeError("PDF is empty or incomplete")
        for number, page in enumerate(pdf, 1):
            # TeX logs cover formula boxes too; this check additionally catches
            # clipped body text and misplaced figures in the final PDF itself.
            safe = pymupdf.Rect(24, 20, page.rect.width - 24, page.rect.height - 20)
            for block in page.get_text("dict")["blocks"]:
                if "bbox" in block and not safe.contains(pymupdf.Rect(block["bbox"])):
                    raise RuntimeError(f"PDF page {number}: content outside printable area: {block['bbox']}")
        toc = pdf.get_toc()
        if not toc or any(page < 2 for _, _, page in toc):
            raise RuntimeError("PDF section bookmarks are missing or point to the cover")
        return len(pdf)


def build_pdf(repo: Path, docs: Path, output: Path, site_url: str = SITE_URL) -> dict:
    for tool in ("pandoc", "xelatex", "xdvipdfmx"):
        if not shutil.which(tool):
            raise RuntimeError(f"Missing {tool}; see Documentation Guidelines / PDF download")
    source = docs / SOURCE
    raw = source.read_text(encoding="utf-8")
    revision = os.environ.get("GITHUB_SHA")
    if not revision:
        try:
            revision = run(["git", "rev-parse", "HEAD"], cwd=repo).strip()
        except RuntimeError:
            revision = "unversioned-source"
    try:
        epoch = os.environ.get("SOURCE_DATE_EPOCH") or run(
            ["git", "show", "-s", "--format=%ct", "HEAD"], cwd=repo).strip()
    except RuntimeError:
        epoch = "0"
    if not epoch.isdigit():
        raise ValueError("SOURCE_DATE_EPOCH must be an integer")
    env = dict(os.environ, SOURCE_DATE_EPOCH=epoch, FORCE_SOURCE_DATE="1", TZ="UTC")
    ast = json.loads(run(["pandoc", "--from=markdown+tex_math_dollars-raw_tex-implicit_figures", "--to=json"],
                         cwd=repo, text=raw))
    if not ast["blocks"] or ast["blocks"][0].get("t") != "Header":
        raise ValueError("Specification must start with its title")
    ast["blocks"] = ast["blocks"][1:]
    images: set[Path] = set()
    ast = transform(ast, docs, site_url, images)
    # Keep the source's figure heading beside its image, without introducing
    # Pandoc's implicit image captions or floating the figure away from the text.
    blocks = []
    for block in ast["blocks"]:
        if block.get("t") == "Para" and block.get("c"):
            first = block["c"][0]
            if first.get("t") == "Strong" and first.get("c") and first["c"][0].get("c") == "Figure":
                blocks.append({"t": "RawBlock", "c": ["latex", r"\Needspace{0.64\textheight}"]})
        blocks.append(block)
    ast["blocks"] = blocks
    output.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix="skill-graph-", dir=output.parent) as temp:
        work = Path(temp)
        # JSON metadata keeps values quoted safely; no ad-hoc YAML escaping.
        meta = {"title": "SkillPilot Skill Graph Specification", "lang": "en",
                "revision": revision[:12], "source-url": site_url.rstrip("/") + "/" + SOURCE[:-3] + "/"}
        metadata = work / "metadata.json"
        metadata.write_text(json.dumps(meta), encoding="utf-8")
        latex = run(["pandoc", "--from=json", "--to=latex", "--standalone",
                     "--metadata-file=" + str(metadata), "--template=" + str(HERE / "docs_pdf.tex"),
                     "--top-level-division=section", "--toc", "--toc-depth=1"],
                    cwd=repo, text=json.dumps(ast))
        (work / "spec.tex").write_text(latex, encoding="utf-8")
        for _ in range(3):
            run(["xelatex", "-no-pdf", "-no-shell-escape", "-halt-on-error", "-interaction=nonstopmode", "spec.tex"],
                cwd=work, env=env)
        log = (work / "spec.log").read_text(encoding="utf-8", errors="replace")
        problems = re.findall(r"Overfull \\[hv]box[^\n]*|Missing character:[^\n]*", log)
        if problems:
            raise RuntimeError("PDF typesetting check failed:\n" + "\n".join(problems))
        run(["xdvipdfmx", "-q", "-o", "spec.pdf", "spec.xdv"], cwd=work, env=env)
        pages = verify_pdf(work / "spec.pdf")
        sources = [source, *sorted(images), HERE / "docs_pdf.py", HERE / "docs_pdf.tex"]
        hashes = {p.relative_to(repo).as_posix(): hashlib.sha256(p.read_bytes()).hexdigest() for p in sources}
        report = {"source_revision": revision, "source_date_epoch": int(epoch),
                  "pages": pages, "images": len(images), "sources": hashes,
                  "pdf_sha256": hashlib.sha256((work / "spec.pdf").read_bytes()).hexdigest(),
                  "checks": {"tex_overflow": "pass", "missing_glyphs": "pass", "page_bounds": "pass"}}
        # Failed builds cannot replace a previously verified output.
        os.replace(work / "spec.pdf", output)
        output.with_suffix(".json").write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    LOG.info("Skill graph PDF: %s pages, %s source images (%s)", pages, len(images), revision[:12])
    return report


def on_files(files, *, config):
    from mkdocs.structure.files import File
    repo = Path(config.config_file_path).resolve().parent
    output = repo / "tmp/docs-pdf" / Path(DOWNLOAD).name
    build_pdf(repo, Path(config.docs_dir), output, config.site_url or SITE_URL)
    if files.get_file_from_path(DOWNLOAD):
        raise RuntimeError(f"{DOWNLOAD} is generated; remove its authored duplicate")
    files.append(File.generated(config, DOWNLOAD, abs_src_path=str(output)))
    return files


def on_page_markdown(markdown, *, page, config, files):
    if page.file.src_uri != SOURCE:
        return markdown
    title, separator, body = markdown.partition("\n")
    link = posixpath.relpath(DOWNLOAD, posixpath.dirname(SOURCE))
    return (title + "\n\n" + f"[Download this specification as PDF]({link}){{ .md-button download }}\n\n"
            + body.lstrip("\n"))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo", type=Path, default=HERE.parent)
    parser.add_argument("--output", type=Path)
    args = parser.parse_args()
    root = args.repo.resolve()
    result = build_pdf(root, root / "docs", args.output or root / "tmp/docs-pdf" / Path(DOWNLOAD).name)
    print(json.dumps({k: v for k, v in result.items() if k != "sources"}, indent=2))
