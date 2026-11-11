#!/usr/bin/env python3
"""Compile the bilingual SkillPilot Graph Definition for Web (MkDocs) and PDF (LuaLaTeX).

SPDX-License-Identifier: Apache-2.0
Canonical single source: docs/concept/skill-graph/source/
Pure Python 3 standard library for --verify-sources and --web-and-tex.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass, field
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
from typing import Any

REPO_BLOB_PREFIX = "https://github.com/enpasos/skillpilot/blob/main/"
REPO_TREE_PREFIX = "https://github.com/enpasos/skillpilot/tree/main/"

TERM_RULES: list[tuple[str, re.Pattern[str], re.Pattern[str] | None]] = [
    ("TRM-001", re.compile(r"learning[ -]" r"landscapes?|lern" r"landschaft(en)?|wissens" r"landschaft(en)?", re.I), None),
    ("TRM-002", re.compile(r"Learning" r"Landscape"), None),
    ("TRM-003", re.compile(r"competenc[ey][ -]" r"graphs?|kompetenz-?" r"graph(en)?", re.I), None),
    ("TRM-004", re.compile(r"curriculum[ -]" r"graphs?", re.I), None),
    ("TRM-005", re.compile(r"goal " r"graphs?", re.I), re.compile(r"learning-goal " r"graphs?", re.I)),
]


def digest_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def digest_file(path: Path) -> str:
    return digest_bytes(path.read_bytes())


def atomic_write(path: Path, data: bytes) -> None:
    """Replace an output file atomically without mutating hardlinked snapshots."""
    if path.is_symlink() or (path.exists() and not path.is_file()):
        raise ValueError(f"Refusing non-regular output: {path}")
    path.parent.mkdir(parents=True, exist_ok=True)
    mode = path.stat().st_mode & 0o777 if path.exists() else 0o644
    descriptor, name = tempfile.mkstemp(prefix=f".{path.name}.", dir=path.parent)
    temporary = Path(name)
    try:
        with os.fdopen(descriptor, "wb") as stream:
            os.fchmod(stream.fileno(), mode)
            stream.write(data)
            stream.flush()
            os.fsync(stream.fileno())
        os.replace(temporary, path)
    finally:
        if temporary.exists():
            temporary.unlink()


def slugify_id(raw_id: str) -> str:
    return re.sub(r"[^a-zA-Z0-9_-]+", "-", raw_id.replace(":", "-")).strip("-").lower()
def tex_escape_code(text: str) -> str:
    replacements = {
        "\\": r"\textbackslash{}",
        "{": r"\{\allowbreak{}",
        "}": r"\}",
        "_": r"\_\allowbreak{}",
        "%": r"\%",
        "#": r"\#",
        "&": r"\&",
        "$": r"\$",
        "^": r"\textasciicircum{}",
        "~": r"\textasciitilde{}",
        "/": r"/\allowbreak{}",
        "-": r"-\allowbreak{}",
        ".": r".\allowbreak{}",
        ":": r":\allowbreak{}",
        ",": r",\allowbreak{}",
    }
    out: list[str] = []
    for idx, ch in enumerate(text):
        if idx > 0 and text[idx - 1].islower() and ch.isupper():
            out.append(r"\allowbreak{}")
        out.append(replacements.get(ch, ch))
    return "".join(out)


def tex_escape_plain(text: str, lang: str, allow_breaks: bool = True) -> str:
    out: list[str] = []
    n = len(text)
    for idx, ch in enumerate(text):
        if allow_breaks and idx > 0 and text[idx - 1].islower() and ch.isupper():
            out.append(r"\allowbreak{}")
        if ch == "\\":
            out.append(r"\textbackslash{}")
        elif ch == "/" and allow_breaks:
            out.append(r"/\hspace{0pt}")
        elif ch == "-" and allow_breaks and 0 < idx < n - 1 and text[idx - 1].isalpha() and text[idx + 1].isalpha():
            out.append(r"\babelhyphen{hard}")
        elif ch == "-" and allow_breaks and idx + 1 < n and text[idx + 1] in ",;.)]":
            out.append(r"\mbox{-}")
        elif ch in "&%#_":
            out.append("\\" + ch)
        elif ch in "{}":
            out.append("\\" + ch)
        elif ch == "^":
            out.append(r"\textasciicircum{}")
        elif ch == "\u201e":
            out.append(r"\glqq ")
        elif ch == "\u201c":
            out.append(r"\grqq{}" if lang == "de" else "``")
        elif ch == "\u201d":
            out.append(r"\grqq{}" if lang == "de" else "''")
        elif ch == "\u2013":
            out.append("--")
        elif ch == "\u2192":
            out.append(r"\ensuremath{\to}")
        elif ch == "\u2194":
            out.append(r"\ensuremath{\leftrightarrow}")
        elif ch == "\u2264":
            out.append(r"\ensuremath{\le}")
        elif ch == "\u2265":
            out.append(r"\ensuremath{\ge}")
        elif ch == "\u2260":
            out.append(r"\ensuremath{\ne}")
        elif ch == "\u00d7":
            out.append(r"\ensuremath{\times}")
        else:
            out.append(ch)
    return "".join(out)


def web_plain(text: str) -> str:
    return text.replace("--", "–").replace("~", " ")


@dataclass
class RefEntry:
    label: str
    number: str
    web_path: str
    web_anchor: str
INLINE_TOKEN_RE = re.compile(
    r"`(?P<code>[^`]+)`"
    r"|\$(?P<math>(?:\\.|[^$\\])+)\$"
    r"|\[(?P<rlabel>[^\]]+)\]\(@rule\{(?P<rid>GD-[A-Z]\d+)\}\)"
    r"|\[(?P<llabel>[^\]]+)\]\(repo:(?P<rpath>[^)#\s]+)(?:#(?P<rfrag>[^)\s]+))?\)"
    r"|\[(?P<ulabel>[^\]]+)\]\((?P<url>https?://[^)\s]+)\)"
    r"|(?P<tilde>~)?@(?P<rk>ref|eqref)\{(?P<rtarget>[^}]+)\}"
    r"|\*\*(?P<bold>(?:`[^`]+`|\$(?:\\.|[^$\\])+\$|[^*])+)\*\*"
    r"|\*(?P<italic>(?:`[^`]+`|\$(?:\\.|[^$\\])+\$|[^*])+)\*"
)

BILINGUAL_DOC_MAP: dict[str, dict[str, str]] = {
    "docs/concept/skill-graph/graph-definition.md": {
        "en": "docs/concept/skill-graph/graph-definition.md",
        "de": "docs/concept/skill-graph/graph-definition.de.md",
    },
    "docs/concept/skill-graph/learning-units.md": {
        "en": "docs/concept/skill-graph/learning-units.md",
        "de": "docs/concept/skill-graph/learning-units.de.md",
    },
    "docs/concept/skill-graph/learning-unit-progression.md": {
        "en": "docs/concept/skill-graph/learning-unit-progression.md",
        "de": "docs/concept/skill-graph/learning-unit-progression.de.md",
    },
    "docs/concept/skill-graph/assessment-gated-completion.md": {
        "en": "docs/concept/skill-graph/assessment-gated-completion.md",
        "de": "docs/concept/skill-graph/assessment-gated-completion.de.md",
    },
    "docs/qa-ci/graph-definition-rule-milestone-matrix.md": {
        "de": "docs/qa-ci/graph-definition-rule-milestone-matrix.md",
        "en": "docs/qa-ci/graph-definition-rule-milestone-matrix.en.md",
    },
}


def relative_web_link(from_doc: str, to_doc: str, anchor: str = "") -> str:
    if from_doc == to_doc:
        return f"#{anchor}" if anchor else Path(to_doc).name
    rel = os.path.relpath(to_doc, Path(from_doc).parent).replace(os.sep, "/")
    return f"{rel}#{anchor}" if anchor else rel


def collect_repo_paths(text: str, out: set[str]) -> None:
    for m in re.finditer(r"\]\(repo:([^)#\s]+)", text):
        out.add(m.group(1))
def render_inline(
    text: str,
    lang: str,
    mode: str,
    current_web_doc: str,
    ref_map: dict[str, RefEntry],
    repo_root: Path,
) -> str:
    """Render canonical inline Markdown + math + @ref + repo: links to 'tex' or 'web'."""
    parts: list[str] = []
    pos = 0
    for m in INLINE_TOKEN_RE.finditer(text):
        if m.start() > pos:
            plain = text[pos : m.start()]
            parts.append(tex_escape_plain(plain, lang) if mode == "tex" else web_plain(plain))
        pos = m.end()
        if m.group("code") is not None:
            code = m.group("code")
            parts.append(rf"\code{{{tex_escape_code(code)}}}" if mode == "tex" else f"`{code}`")
        elif m.group("math") is not None:
            parts.append(f"${m.group('math')}$")
        elif m.group("rid") is not None:
            rid = m.group("rid")
            rlabel = m.group("rlabel")
            if mode == "tex":
                parts.append(rf"\hyperref[rule:{rid}]{{\code{{{tex_escape_code(rlabel)}}}}}")
            else:
                matrix_doc = BILINGUAL_DOC_MAP["docs/qa-ci/graph-definition-rule-milestone-matrix.md"][lang]
                href = relative_web_link(current_web_doc, matrix_doc, rid.lower())
                parts.append(f"[`{rlabel}`]({href})")
        elif m.group("rpath") is not None:
            llabel = render_inline(m.group("llabel"), lang, mode, current_web_doc, ref_map, repo_root)
            rpath = m.group("rpath")
            rfrag = m.group("rfrag") or ""
            clean_rpath = rpath.rstrip("/")
            abs_target = repo_root / clean_rpath
            is_dir = rpath.endswith("/") or abs_target.is_dir()
            if mode == "tex":
                if is_dir:
                    url = f"{REPO_TREE_PREFIX}{clean_rpath}"
                    parts.append(rf"\href{{{url}}}{{{llabel}}}")
                else:
                    frag_suffix = f"#{rfrag}" if rfrag else ""
                    parts.append(rf"\srcref{{{clean_rpath}{frag_suffix}}}{{{llabel}}}")
            else:
                mapped = BILINGUAL_DOC_MAP.get(clean_rpath, {}).get(lang, clean_rpath)
                if mapped.startswith("docs/") and not is_dir:
                    href = relative_web_link(current_web_doc, mapped, rfrag)
                    parts.append(f"[{llabel}]({href})")
                else:
                    prefix = REPO_TREE_PREFIX if is_dir else REPO_BLOB_PREFIX
                    frag_suffix = f"#{rfrag}" if rfrag else ""
                    parts.append(f"[{llabel}]({prefix}{clean_rpath}{frag_suffix})")
        elif m.group("url") is not None:
            ulabel = render_inline(m.group("ulabel"), lang, mode, current_web_doc, ref_map, repo_root)
            url = m.group("url")
            parts.append(rf"\href{{{url}}}{{{ulabel}}}" if mode == "tex" else f"[{ulabel}]({url})")
        elif m.group("rk") is not None:
            tilde = m.group("tilde") or ""
            rk = m.group("rk")
            rtarget = m.group("rtarget")
            if mode == "tex":
                prefix = "~" if tilde else ""
                parts.append(rf"{prefix}\{rk}{{{rtarget}}}")
            else:
                space = " " if tilde else ""
                entry = ref_map.get(rtarget)
                if entry is None:
                    raise ValueError(f"Unresolved @{rk}{{{rtarget}}} in {current_web_doc} ({lang})")
                href = relative_web_link(current_web_doc, entry.web_path, entry.web_anchor)
                disp = f"({entry.number})" if rk == "eqref" else entry.number
                parts.append(f"{space}[{disp}]({href})")
        elif m.group("bold") is not None:
            inner = render_inline(m.group("bold"), lang, mode, current_web_doc, ref_map, repo_root)
            parts.append(rf"\textbf{{{inner}}}" if mode == "tex" else f"**{inner}**")
        elif m.group("italic") is not None:
            inner = render_inline(m.group("italic"), lang, mode, current_web_doc, ref_map, repo_root)
            parts.append(rf"\emph{{{inner}}}" if mode == "tex" else f"*{inner}*")
    if pos < len(text):
        plain = text[pos:]
        parts.append(tex_escape_plain(plain, lang) if mode == "tex" else web_plain(plain))
    return "".join(parts)
@dataclass
class HeadingNode:
    level: int
    title: str
    node_id: str | None = None
    unnumbered: bool = False
    appendix: bool = False
    anchors: list[str] = field(default_factory=list)


@dataclass
class ParagraphNode:
    text: str


@dataclass
class DisplayMathNode:
    latex: str
    node_id: str | None = None


@dataclass
class BoxNode:
    kind: str  # 'titlebox' or 'principle'
    title: str
    children: list[Any]


@dataclass
class ListNode:
    ordered: bool
    items: list[str]


@dataclass
class DescriptionNode:
    items: list[tuple[str, str]]


@dataclass
class TableNode:
    headers: list[str]
    rows: list[list[str]]
    node_id: str | None = None
    caption: str | None = None
    cols: str | None = None
    longtable: bool = False


@dataclass
class FigureNode:
    fig_id: str


@dataclass
class IncludeNode:
    block: str


@dataclass
class SourcesNode:
    text: str
ATTR_TOKEN_RE = re.compile(r'#(?P<id>[A-Za-z0-9:._-]+)|(?P<k>[A-Za-z0-9_]+)=(?:"(?P<vq>[^"]*)"|(?P<vb>[^\s}]+))')


def parse_attrs(raw: str | None) -> dict[str, Any]:
    result: dict[str, Any] = {}
    if not raw:
        return result
    for m in ATTR_TOKEN_RE.finditer(raw):
        if m.group("id"):
            result["id"] = m.group("id")
        else:
            val = m.group("vq") if m.group("vq") is not None else m.group("vb")
            if val == "true":
                result[m.group("k")] = True
            elif val == "false":
                result[m.group("k")] = False
            else:
                result[m.group("k")] = val
    return result


def split_pipe_row(line: str) -> list[str]:
    """Split a GFM pipe row while ignoring escaped \\| and | inside `...` or $...$."""
    s = line.strip()
    if s.startswith("|"):
        s = s[1:]
    if s.endswith("|") and not s.endswith(r"\|"):
        s = s[:-1]
    cells: list[str] = []
    cur: list[str] = []
    in_code = False
    in_math = False
    i = 0
    while i < len(s):
        ch = s[i]
        if ch == "\\" and i + 1 < len(s):
            cur.append(s[i : i + 2])
            i += 2
            continue
        if ch == "`" and not in_math:
            in_code = not in_code
            cur.append(ch)
        elif ch == "$" and not in_code:
            in_math = not in_math
            cur.append(ch)
        elif ch == "|" and not in_code and not in_math:
            cells.append("".join(cur).strip())
            cur = []
        else:
            cur.append(ch)
        i += 1
    cells.append("".join(cur).strip())
    return cells


def parse_list_items(lines: list[str], start: int, ordered: bool) -> tuple[list[str], int]:
    marker_re = re.compile(r"^\d+\.\s+(.*)$" if ordered else r"^-\s+(.*)$")
    items: list[str] = []
    i = start
    while i < len(lines):
        m = marker_re.match(lines[i])
        if not m:
            break
        buf = [m.group(1).strip()]
        i += 1
        while i < len(lines) and (lines[i].startswith("  ") or lines[i].startswith("\t")):
            buf.append(lines[i].strip())
            i += 1
        items.append(" ".join(buf))
        if i < len(lines) and lines[i].strip() == "":
            if i + 1 < len(lines) and marker_re.match(lines[i + 1]):
                i += 1
            else:
                break
    return items, i
HEADING_RE = re.compile(r"^(#{2,4})\s+(.+?)(?:\s*\{([^}]+)\})?\s*$")
DIRECTIVE_SINGLE_RE = re.compile(r"^::(figure|include)\{([^}]+)\}\s*$")
FENCE_OPEN_RE = re.compile(r"^:::(titlebox|principle|equation|table|description|sources)(?:\s*\{([^}]+)\})?\s*$")


def parse_blocks(lines: list[str], source_label: str) -> list[Any]:
    nodes: list[Any] = []
    i = 0
    n = len(lines)
    while i < n:
        raw = lines[i]
        stripped = raw.strip()
        if not stripped:
            i += 1
            continue
        m_single = DIRECTIVE_SINGLE_RE.match(stripped)
        if m_single:
            kind, attr_str = m_single.group(1), m_single.group(2)
            attrs = parse_attrs(attr_str)
            if kind == "figure":
                nodes.append(FigureNode(fig_id=str(attrs["id"])))
            else:
                nodes.append(IncludeNode(block=str(attrs["block"])))
            i += 1
            continue
        m_fence = FENCE_OPEN_RE.match(stripped)
        if m_fence:
            kind, attr_str = m_fence.group(1), m_fence.group(2)
            attrs = parse_attrs(attr_str)
            i += 1
            body_lines: list[str] = []
            while i < n and lines[i].strip() != ":::":
                body_lines.append(lines[i])
                i += 1
            if i >= n:
                raise ValueError(f"{source_label}: unclosed :::{kind} block")
            i += 1
            if kind in ("titlebox", "principle"):
                children = parse_blocks(body_lines, f"{source_label}:{kind}")
                nodes.append(BoxNode(kind=kind, title=str(attrs.get("title", "")), children=children))
            elif kind == "equation":
                nodes.append(DisplayMathNode(latex="\n".join(body_lines).strip(), node_id=attrs.get("id")))
            elif kind == "sources":
                nodes.append(SourcesNode(text=" ".join(ln.strip() for ln in body_lines if ln.strip())))
            elif kind == "description":
                trimmed_desc = "\n".join(body_lines).strip().splitlines()
                raw_items, _ = parse_list_items(trimmed_desc, 0, ordered=False)
                desc_items: list[tuple[str, str]] = []
                for item in raw_items:
                    m_lead = re.match(r"^\*\*([^*]+)\*\*\s*(.*)$", item)
                    if not m_lead:
                        raise ValueError(f"{source_label}: description item must start with **Lead.** Got: {item}")
                    desc_items.append((m_lead.group(1).strip(), m_lead.group(2).strip()))
                nodes.append(DescriptionNode(items=desc_items))
            elif kind == "table":
                tbl_lines = [ln.strip() for ln in body_lines if ln.strip()]
                if len(tbl_lines) < 2:
                    raise ValueError(f"{source_label}: table needs header and separator rows")
                headers = split_pipe_row(tbl_lines[0])
                rows = [split_pipe_row(r) for r in tbl_lines[2:]]
                for r in rows:
                    if len(r) != len(headers):
                        raise ValueError(f"{source_label}: table row column mismatch ({len(r)} != {len(headers)}): {r}")
                nodes.append(
                    TableNode(
                        headers=headers,
                        rows=rows,
                        node_id=attrs.get("id"),
                        caption=attrs.get("caption"),
                        cols=attrs.get("cols"),
                        longtable=bool(attrs.get("longtable", False)),
                    )
                )
            continue
        if stripped == "$$":
            i += 1
            math_lines: list[str] = []
            while i < n and lines[i].strip() != "$$":
                math_lines.append(lines[i])
                i += 1
            if i >= n:
                raise ValueError(f"{source_label}: unclosed $$ display math block")
            i += 1
            nodes.append(DisplayMathNode(latex="\n".join(math_lines).strip(), node_id=None))
            continue
        m_head = HEADING_RE.match(raw)
        if m_head:
            level = len(m_head.group(1))
            title = m_head.group(2).strip()
            attrs = parse_attrs(m_head.group(3))
            anchors = [a.strip() for a in str(attrs.get("anchors", "")).split(",") if a.strip()]
            nodes.append(
                HeadingNode(
                    level=level,
                    title=title,
                    node_id=attrs.get("id"),
                    unnumbered=bool(attrs.get("unnumbered", False)),
                    appendix=bool(attrs.get("appendix", False)),
                    anchors=anchors,
                )
            )
            i += 1
            continue
        if re.match(r"^-\s+", raw):
            items, i = parse_list_items(lines, i, ordered=False)
            nodes.append(ListNode(ordered=False, items=items))
            continue
        if re.match(r"^\d+\.\s+", raw):
            items, i = parse_list_items(lines, i, ordered=True)
            nodes.append(ListNode(ordered=True, items=items))
            continue
        para_lines = [stripped]
        i += 1
        while i < n:
            nxt = lines[i]
            nxt_s = nxt.strip()
            if (
                not nxt_s
                or nxt_s == "$$"
                or nxt_s.startswith("::")
                or HEADING_RE.match(nxt)
                or re.match(r"^(?:-\s+|\d+\.\s+)", nxt)
            ):
                break
            para_lines.append(nxt_s)
            i += 1
        nodes.append(ParagraphNode(text=" ".join(para_lines)))
    return nodes
@dataclass
class SpecBundle:
    repo_root: Path
    source_dir: Path
    manifest: dict[str, Any]
    figures: dict[str, dict[str, Any]]
    rules_data: dict[str, Any]
    glossary_data: dict[str, Any]
    impl_data: dict[str, Any]
    chapters: dict[str, dict[str, list[Any]]]


def check_terminology_in_text(text: str, label: str, errors: list[str]) -> None:
    for line_no, line in enumerate(text.splitlines(), 1):
        for rule_id, pat, allow in TERM_RULES:
            scrubbed = allow.sub("", line) if allow else line
            m = pat.search(scrubbed)
            if m:
                errors.append(f"{label}:{line_no}: terminology violation {rule_id}: '{m.group(0)}'")


FORBIDDEN_RAW_TEX_RE = re.compile(r"\\(?:emph|textbf|texttt|code|srcref|glqq|grqq|begin\{(?:itemize|enumerate|description|tabularx|longtable)\})\b")


def scrub_math(text: str) -> str:
    text = re.sub(r"\$\$[\s\S]*?\$\$", "", text)
    text = re.sub(r":::equation[\s\S]*?:::", "", text)
    return re.sub(r"\$(?:\\.|[^$\\])+\$", "", text)


def extract_skeleton(nodes: list[Any]) -> tuple[list[tuple[Any, ...]], set[str]]:
    skel: list[tuple[Any, ...]] = []
    repos: set[str] = set()
    for node in nodes:
        if isinstance(node, HeadingNode):
            if node.level in (2, 3) or node.node_id:
                skel.append(("H", node.level, node.node_id, node.unnumbered, node.appendix, tuple(node.anchors)))
            collect_repo_paths(node.title, repos)
        elif isinstance(node, DisplayMathNode):
            if node.node_id:
                skel.append(("EQ", node.node_id))
        elif isinstance(node, FigureNode):
            skel.append(("FIG", node.fig_id))
        elif isinstance(node, IncludeNode):
            skel.append(("INC", node.block))
        elif isinstance(node, TableNode):
            skel.append(("TBL", node.node_id, len(node.headers), len(node.rows)))
            for cell in [*node.headers, *(c for r in node.rows for c in r)]:
                collect_repo_paths(cell, repos)
        elif isinstance(node, BoxNode):
            sub_skel, sub_repos = extract_skeleton(node.children)
            skel.append(("BOX", node.kind, tuple(sub_skel)))
            repos.update(sub_repos)
        elif isinstance(node, ParagraphNode):
            collect_repo_paths(node.text, repos)
        elif isinstance(node, ListNode):
            for it in node.items:
                collect_repo_paths(it, repos)
        elif isinstance(node, DescriptionNode):
            for lead, body in node.items:
                collect_repo_paths(lead, repos)
                collect_repo_paths(body, repos)
        elif isinstance(node, SourcesNode):
            skel.append(("SRC",))
            collect_repo_paths(node.text, repos)
    return skel, repos
def load_and_verify_bundle(repo_root: Path) -> tuple[SpecBundle, set[str]]:
    source_dir = repo_root / "docs/concept/skill-graph/source"
    errors: list[str] = []
    cited_repos: set[str] = set()

    def read_json(name: str) -> dict[str, Any]:
        p = source_dir / name
        raw = p.read_text(encoding="utf-8")
        check_terminology_in_text(raw, str(p.relative_to(repo_root)), errors)
        collect_repo_paths(raw, cited_repos)
        if FORBIDDEN_RAW_TEX_RE.search(scrub_math(raw)):
            errors.append(f"{p.relative_to(repo_root)}: contains raw LaTeX prose macro outside math")
        return json.loads(raw)

    manifest = json.loads((source_dir / "spec-manifest.json").read_text(encoding="utf-8"))
    figures_raw = read_json("figures.json")
    figures = {f["id"]: f for f in figures_raw["figures"]}
    rules_data = read_json("rules-and-gates.json")
    glossary_data = read_json("glossary-and-symbols.json")
    impl_data = read_json("implementation-status.json")

    rules = rules_data.get("rules", [])
    if len(rules) != 143:
        errors.append(f"rules-and-gates.json: expected 143 rules, got {len(rules)}")
    counts = {"hart": 0, "teil": 0, "offen": 0, "opt": 0}
    for r in rules:
        counts[r["ampel"]] = counts.get(r["ampel"], 0) + 1
    if counts != {"hart": 3, "teil": 49, "offen": 63, "opt": 28}:
        errors.append(f"rules-and-gates.json: unexpected Ampel distribution: {counts}")

    chapters: dict[str, dict[str, list[Any]]] = {}
    for ch_name in manifest["chapters"]:
        chapters[ch_name] = {}
        skels: dict[str, list[tuple[Any, ...]]] = {}
        ch_repos: dict[str, set[str]] = {}
        for lang in ("de", "en"):
            md_path = source_dir / "chapters" / f"{ch_name}.{lang}.md"
            raw = md_path.read_text(encoding="utf-8")
            rel_label = str(md_path.relative_to(repo_root))
            check_terminology_in_text(raw, rel_label, errors)
            m_raw = FORBIDDEN_RAW_TEX_RE.search(scrub_math(raw))
            if m_raw:
                errors.append(f"{rel_label}: forbidden raw LaTeX macro '{m_raw.group(0)}'")
            ast = parse_blocks(raw.splitlines(), rel_label)
            chapters[ch_name][lang] = ast
            sk, rp = extract_skeleton(ast)
            skels[lang] = sk
            ch_repos[lang] = rp
            cited_repos.update(rp)
            for item in sk:
                if item[0] == "FIG" and item[1] not in figures:
                    errors.append(f"{rel_label}: unknown figure id '{item[1]}'")
        if skels["de"] != skels["en"]:
            for idx, (a, b) in enumerate(zip(skels["de"], skels["en"])):
                if a != b:
                    errors.append(f"{ch_name}: DE/EN AST mismatch at element #{idx}: DE={a} vs EN={b}")
                    break
            else:
                errors.append(f"{ch_name}: DE/EN AST length mismatch: DE={len(skels['de'])} vs EN={len(skels['en'])}")
        if ch_repos["de"] != ch_repos["en"]:
            diff_de = sorted(ch_repos["de"] - ch_repos["en"])
            diff_en = sorted(ch_repos["en"] - ch_repos["de"])
            errors.append(f"{ch_name}: DE/EN repo citation mismatch: only-DE={diff_de}, only-EN={diff_en}")

    generated_targets = {
        *(p_path for wp in manifest["webPages"] for p_path in wp["paths"].values()),
        *(p_path for lang in ("de", "en") for p_path in manifest["pdf"][lang]["outputPaths"]),
        "docs/concept/skill-graph/skillpilot-graph-definition.build.json",
        "docs/concept/skill-graph/build_spec.py",
    }
    full_repo_present = (repo_root / "app/package.json").is_file()
    for rpath in sorted(cited_repos):
        clean_rpath = rpath.rstrip("/")
        if clean_rpath in generated_targets or rpath in generated_targets:
            continue
        if not full_repo_present and not clean_rpath.startswith("docs/"):
            continue
        if not (repo_root / clean_rpath).exists():
            errors.append(f"Unresolved repo: target '{rpath}'")

    if errors:
        raise SystemExit("Single-source verification failed:\n  - " + "\n  - ".join(errors))

    bundle = SpecBundle(
        repo_root=repo_root,
        source_dir=source_dir,
        manifest=manifest,
        figures=figures,
        rules_data=rules_data,
        glossary_data=glossary_data,
        impl_data=impl_data,
        chapters=chapters,
    )
    return bundle, cited_repos
def web_doc_for_chapter(bundle: SpecBundle, ch_name: str, sub_idx: int, is_appendix_a: bool, lang: str) -> str:
    if is_appendix_a:
        return BILINGUAL_DOC_MAP["docs/qa-ci/graph-definition-rule-milestone-matrix.md"][lang]
    for wp in bundle.manifest["webPages"]:
        if ch_name not in wp["sources"]:
            continue
        sl = wp.get("subsectionSlice")
        if sl is not None:
            if sl[0] <= max(sub_idx, 0) < sl[1]:
                return wp["paths"][lang]
            continue
        return wp["paths"][lang]
    raise ValueError(f"No web page configured for {ch_name} (sub_idx={sub_idx})")


def build_ref_map(bundle: SpecBundle, lang: str) -> dict[str, RefEntry]:
    ref_map: dict[str, RefEntry] = {}
    sec_num = 0
    app_num = 0
    sub_num = 0
    sub_idx_in_ch = -1
    fig_num = 0
    eq_num = 0
    tab_num = 0
    cur_sec_str = ""
    cur_sub_str = ""

    def walk(nodes: list[Any], ch_name: str, in_appendix_a: bool) -> None:
        nonlocal sec_num, app_num, sub_num, sub_idx_in_ch, fig_num, eq_num, tab_num, cur_sec_str, cur_sub_str
        for node in nodes:
            if isinstance(node, HeadingNode):
                if node.level == 2:
                    sub_num = 0
                    sub_idx_in_ch = -1
                    if node.unnumbered:
                        cur_sec_str = node.title
                    elif node.appendix:
                        app_num += 1
                        cur_sec_str = chr(ord("A") + app_num - 1)
                    else:
                        sec_num += 1
                        cur_sec_str = str(sec_num)
                    cur_sub_str = cur_sec_str
                    is_app_a = node.node_id == "sec:rule-milestones"
                    wdoc = web_doc_for_chapter(bundle, ch_name, 0, is_app_a, lang)
                    if node.node_id:
                        anchor = "" if is_app_a else slugify_id(node.node_id)
                        ref_map[node.node_id] = RefEntry(node.node_id, cur_sec_str, wdoc, anchor)
                elif node.level == 3:
                    sub_idx_in_ch += 1
                    if not node.unnumbered:
                        sub_num += 1
                        cur_sub_str = f"{cur_sec_str}.{sub_num}"
                    else:
                        cur_sub_str = node.title
                    wdoc = web_doc_for_chapter(bundle, ch_name, sub_idx_in_ch, in_appendix_a, lang)
                    if node.node_id:
                        ref_map[node.node_id] = RefEntry(node.node_id, cur_sub_str, wdoc, slugify_id(node.node_id))
                elif node.level == 4 and node.node_id:
                    wdoc = web_doc_for_chapter(bundle, ch_name, max(sub_idx_in_ch, 0), in_appendix_a, lang)
                    ref_map[node.node_id] = RefEntry(node.node_id, cur_sub_str, wdoc, slugify_id(node.node_id))
            elif isinstance(node, DisplayMathNode) and node.node_id:
                eq_num += 1
                wdoc = web_doc_for_chapter(bundle, ch_name, max(sub_idx_in_ch, 0), in_appendix_a, lang)
                ref_map[node.node_id] = RefEntry(node.node_id, str(eq_num), wdoc, slugify_id(node.node_id))
            elif isinstance(node, FigureNode):
                fig_num += 1
                wdoc = web_doc_for_chapter(bundle, ch_name, max(sub_idx_in_ch, 0), in_appendix_a, lang)
                ref_map[node.fig_id] = RefEntry(node.fig_id, str(fig_num), wdoc, slugify_id(node.fig_id))
            elif isinstance(node, TableNode) and node.caption:
                tab_num += 1
                if node.node_id:
                    wdoc = web_doc_for_chapter(bundle, ch_name, max(sub_idx_in_ch, 0), in_appendix_a, lang)
                    ref_map[node.node_id] = RefEntry(node.node_id, str(tab_num), wdoc, slugify_id(node.node_id))
            elif isinstance(node, BoxNode):
                walk(node.children, ch_name, in_appendix_a)
            elif isinstance(node, IncludeNode) and node.block == "rule-milestones-appendix":
                matrix_doc = BILINGUAL_DOC_MAP["docs/qa-ci/graph-definition-rule-milestone-matrix.md"][lang]
                ref_map["sec:rule-ampel"] = RefEntry("sec:rule-ampel", "A.1", matrix_doc, "sec-rule-ampel")
                ref_map["sec:rule-code-legend"] = RefEntry("sec:rule-code-legend", "A.2", matrix_doc, "sec-rule-code-legend")

    for ch_name in bundle.manifest["chapters"]:
        walk(bundle.chapters[ch_name][lang], ch_name, False)
    return ref_map
def slice_chapter_for_web(nodes: list[Any], sub_slice: list[int] | None, skip_appendix_a: bool) -> list[Any]:
    if skip_appendix_a:
        out: list[Any] = []
        skipping = False
        for node in nodes:
            if isinstance(node, HeadingNode) and node.level == 2:
                skipping = node.node_id == "sec:rule-milestones"
            if not skipping:
                out.append(node)
        return out
    if sub_slice is None:
        return nodes
    start_sub, end_sub = sub_slice
    out = []
    cur_sub = -1
    for node in nodes:
        if isinstance(node, HeadingNode) and node.level == 3:
            cur_sub += 1
        if cur_sub == -1:
            if start_sub == 0:
                out.append(node)
        elif start_sub <= cur_sub < end_sub:
            out.append(node)
    return out


def render_frontmatter_distinctions(bundle: SpecBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    rows = bundle.glossary_data["frontmatterDistinctions"]
    h_term = "Begriffe" if lang == "de" else "Terms"
    h_mean = "Bedeutung in diesem Dokument" if lang == "de" else "Meaning in this specification"
    if mode == "tex":
        lines = [
            r"\begingroup\small",
            r"\begin{longtable}{@{}P{38mm}P{110mm}@{}}",
            r"\toprule",
            f"{h_term} & {h_mean} \\\\",
            r"\midrule\endhead",
        ]
        for r in rows:
            t_str = render_inline(r["term"][lang], lang, "tex", wdoc, ref_map, bundle.repo_root)
            m_str = render_inline(r["meaning"][lang], lang, "tex", wdoc, ref_map, bundle.repo_root)
            lines.append(f"{t_str} & {m_str}\\\\")
        lines.extend([
            r"\bottomrule",
            r"\end{longtable}",
            r"\addtocounter{table}{-1}",
            r"\endgroup",
        ])
        return "\n".join(lines)
    lines = [f"| {h_term} | {h_mean} |", "| --- | --- |"]
    for r in rows:
        t_str = render_inline(r["term"][lang], lang, "web", wdoc, ref_map, bundle.repo_root)
        m_str = render_inline(r["meaning"][lang], lang, "web", wdoc, ref_map, bundle.repo_root)
        lines.append(f"| {t_str} | {m_str} |")
    return "\n".join(lines)
def render_glossary_appendix(bundle: SpecBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    gd = bundle.glossary_data
    ri = lambda s: render_inline(s, lang, mode, wdoc, ref_map, bundle.repo_root)
    h_terms = "Begriffe" if lang == "de" else "Terms"
    h_syms = "Symbole" if lang == "de" else "Symbols"
    col_term = "Begriff" if lang == "de" else "Term"
    col_sym = "Symbol"
    col_mean = "Bedeutung" if lang == "de" else "Meaning"
    if mode == "tex":
        out = [
            rf"\subsection{{{h_terms}}}",
            ri(gd["glossaryIntro"][lang]),
            "",
            r"\begingroup\small",
            r"\begin{longtable}{@{}P{40mm}P{108mm}@{}}",
            r"\toprule",
            f"{col_term} & {col_mean} \\\\",
            r"\midrule\endhead",
        ]
        for row in gd["glossary"]:
            out.append(f"{ri(row['term'][lang])} & {ri(row['meaning'][lang])}\\\\")
        out.extend([
            r"\bottomrule",
            r"\end{longtable}",
            r"\addtocounter{table}{-1}",
            r"\endgroup",
            "",
            rf"\subsection{{{h_syms}}}",
            ri(gd["symbolsIntro"][lang]),
            "",
            ri(gd["notationCleanupNote"][lang]),
            "",
            r"\begingroup\small",
            r"\begin{longtable}{@{}P{40mm}P{108mm}@{}}",
            r"\toprule",
            f"{col_sym} & {col_mean} \\\\",
            r"\midrule\endhead",
        ])
        for row in gd["symbols"]:
            out.append(f"{ri(row['symbol'])} & {ri(row['meaning'][lang])}\\\\")
        out.extend([
            r"\bottomrule",
            r"\end{longtable}",
            r"\addtocounter{table}{-1}",
            r"\endgroup",
        ])
        return "\n".join(out)
    out = [
        f"### D.1 {h_terms}",
        "",
        ri(gd["glossaryIntro"][lang]),
        "",
        f"| {col_term} | {col_mean} |",
        "| --- | --- |",
    ]
    for row in gd["glossary"]:
        out.append(f"| {ri(row['term'][lang])} | {ri(row['meaning'][lang])} |")
    out.extend([
        "",
        f"### D.2 {h_syms}",
        "",
        ri(gd["symbolsIntro"][lang]),
        "",
        ri(gd["notationCleanupNote"][lang]),
        "",
        f"| {col_sym} | {col_mean} |",
        "| --- | --- |",
    ])
    for row in gd["symbols"]:
        out.append(f"| {ri(row['symbol'])} | {ri(row['meaning'][lang])} |")
    return "\n".join(out)
def render_implementation_appendix(bundle: SpecBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    im = bundle.impl_data
    ri = lambda s: render_inline(s, lang, mode, wdoc, ref_map, bundle.repo_root)
    c1 = "Bereich" if lang == "de" else "Area"
    c2 = "Verbindliche Darstellung hier" if lang == "de" else "Binding specification here"
    c3 = "Geprüfter Repository-Stand" if lang == "de" else "Audited repository status"
    if mode == "tex":
        out = [
            rf"\paragraph{{{ri(im['stand']['lead'][lang])}}} {ri(im['stand']['body'][lang])}",
            "",
            rf"\paragraph{{{ri(im['poDecisionsLead'][lang])}}}",
            r"\begin{itemize}",
            *[rf"\item {ri(it[lang])}" for it in im["poDecisions"]],
            r"\end{itemize}",
            "",
            rf"\paragraph{{{ri(im['auditedCommitsLead'][lang])}}} {ri(im['auditedCommitsIntro'][lang])}",
            r"\begin{itemize}",
            *[rf"\item {ri(it[lang])}" for it in im["auditedCommits"]],
            r"\end{itemize}",
            "",
            rf"\paragraph{{{ri(im['nov9Finding']['lead'][lang])}}} {ri(im['nov9Finding']['body'][lang])}",
            "",
            r"\begingroup\small",
            r"\begin{longtable}{@{}P{31mm}P{55mm}P{58mm}@{}}",
            r"\toprule",
            f"{c1} & {c2} & {c3} \\\\",
            r"\midrule\endhead",
            *[f"{ri(r['area'][lang])} & {ri(r['spec'][lang])} & {ri(r['repoStatus'][lang])}\\\\" for r in im["boundaryTable"]],
            r"\bottomrule",
            r"\end{longtable}",
            r"\addtocounter{table}{-1}",
            r"\endgroup",
            "",
            rf"\paragraph{{{ri(im['codeAnchors']['lead'][lang])}}} {ri(im['codeAnchors']['body'][lang])}",
            rf"\sources{{{ri(im['sources'][lang])}}}",
        ]
        return "\n".join(out)
    src_lbl = "Quellen" if lang == "de" else "Sources"
    out = [
        f"**{ri(im['stand']['lead'][lang])}** {ri(im['stand']['body'][lang])}",
        "",
        f"**{ri(im['poDecisionsLead'][lang])}**",
        "",
        *[f"- {ri(it[lang])}" for it in im["poDecisions"]],
        "",
        f"**{ri(im['auditedCommitsLead'][lang])}** {ri(im['auditedCommitsIntro'][lang])}",
        "",
        *[f"- {ri(it[lang])}" for it in im["auditedCommits"]],
        "",
        f"**{ri(im['nov9Finding']['lead'][lang])}** {ri(im['nov9Finding']['body'][lang])}",
        "",
        f"| {c1} | {c2} | {c3} |",
        "| --- | --- | --- |",
        *[f"| {ri(r['area'][lang])} | {ri(r['spec'][lang])} | {ri(r['repoStatus'][lang])} |" for r in im["boundaryTable"]],
        "",
        f"**{ri(im['codeAnchors']['lead'][lang])}** {ri(im['codeAnchors']['body'][lang])}",
        "",
        f"*{src_lbl}:* {ri(im['sources'][lang])}",
    ]
    return "\n".join(out)


def render_sources_appendix(bundle: SpecBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    im = bundle.impl_data
    ri = lambda s: render_inline(s, lang, mode, wdoc, ref_map, bundle.repo_root)
    c1 = "Teil" if lang == "de" else "Part"
    c2 = "Maßgebliche Quellen" if lang == "de" else "Normative sources"
    c3 = "Rolle" if lang == "de" else "Role"
    if mode == "tex":
        out = [
            ri(im["sourceMappingIntro"][lang]),
            "",
            r"\begingroup\small",
            r"\begin{longtable}{@{}P{33mm}P{66mm}P{47mm}@{}}",
            r"\toprule",
            f"{c1} & {c2} & {c3} \\\\",
            r"\midrule\endhead",
            *[f"{ri(r['part'][lang])} & {ri(r['sources'][lang])} & {ri(r['role'][lang])}\\\\" for r in im["sourceMappingTable"]],
            r"\bottomrule",
            r"\end{longtable}",
            r"\addtocounter{table}{-1}",
            r"\endgroup",
            "",
            ri(im["figuresAttribution"][lang]),
        ]
        return "\n".join(out)
    out = [
        ri(im["sourceMappingIntro"][lang]),
        "",
        f"| {c1} | {c2} | {c3} |",
        "| --- | --- | --- |",
        *[f"| {ri(r['part'][lang])} | {ri(r['sources'][lang])} | {ri(r['role'][lang])} |" for r in im["sourceMappingTable"]],
        "",
        ri(im["figuresAttribution"][lang]),
    ]
    return "\n".join(out)
AMPEL_TEX_CMD = {"hart": r"\ampelhart", "teil": r"\ampelteil", "offen": r"\ampeloffen", "opt": r"\ampelopt"}


def render_rules_and_gates_tex(bundle: SpecBundle, lang: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    rd = bundle.rules_data
    ri = lambda s: render_inline(s, lang, "tex", wdoc, ref_map, bundle.repo_root)
    amp = rd["ampelSection"]
    ms = rd["milestoneOverview"]
    gt = rd["gatesOverview"]
    out: list[str] = [ri(rd["intro"][lang]), ""]
    for item in rd["readingGuide"]:
        out.append(rf"\paragraph{{{ri(item['lead'][lang])}}} {ri(item['body'][lang])}")
    out.extend([
        "",
        rf"\subsection{{{ri(amp['title'][lang])}}}\label{{sec:rule-ampel}}",
        ri(amp["intro"][lang]),
        "",
        r"\begingroup\small",
        r"\begin{longtable}{@{}P{24mm}P{124mm}@{}}",
        r"\toprule",
        ("Ampel & Bedeutung für Durchsetzung und CI \\\\" if lang == "de" else "Traffic light & Meaning for enforcement and CI \\\\"),
        r"\midrule\endhead",
    ])
    for st in amp["states"]:
        cmd = AMPEL_TEX_CMD[st["key"]]
        note = f" {ri(st['ruleIdsNote'][lang])}" if st.get("ruleIdsNote", {}).get(lang) else ""
        out.append(f"{cmd} & {ri(st['meaning'][lang])}{note}\\\\")
    out.extend([
        r"\bottomrule",
        r"\end{longtable}",
        r"\addtocounter{table}{-1}",
        r"\endgroup",
        "",
        ri(amp["summary"][lang]),
        "",
        r"\needspace{35mm}",
        rf"\subsection{{{ri(ms['title'][lang])}}}\label{{sec:rule-code-legend}}",
        r"\begingroup\small",
        r"\begin{longtable}{@{}P{28mm}P{24mm}P{96mm}@{}}",
        r"\toprule",
        ("Kürzel & Ampel & Bedeutung \\\\" if lang == "de" else "Code & Status & Meaning \\\\"),
        r"\midrule\endhead",
    ])
    for row in ms["rows"]:
        lbl = row.get("label", {}).get(lang, row["code"])
        cell_lbl = rf"\code{{{tex_escape_code(lbl)}}}" if re.fullmatch(r"M\d", lbl) else rf"\textbf{{{tex_escape_plain(lbl, lang)}}}"
        amp_cell = r"\newline ".join(AMPEL_TEX_CMD[a] for a in row.get("ampels", []))
        out.append(f"{cell_lbl} & {amp_cell} & {ri(row['meaning'][lang])}\\\\")
    out.extend([
        r"\bottomrule",
        r"\end{longtable}",
        r"\addtocounter{table}{-1}",
        r"\endgroup",
        "",
        r"\needspace{35mm}",
        rf"\subsection{{{ri(gt['title'][lang])}}}",
        ri(gt["intro"][lang]),
        "",
        r"\begingroup\small",
        r"\begin{longtable}{@{}P{23mm}P{23mm}P{102mm}@{}}",
        r"\toprule",
        ("Gate & Ampel & Tatsächliche Reichweite \\\\" if lang == "de" else "Gate & Status & Actual scope \\\\"),
        r"\midrule\endhead",
        *[f"{ri(row['gate'])} & {AMPEL_TEX_CMD[row['ampel']]} & {ri(row['scope'][lang])}\\\\" for row in gt["rows"]],
        r"\bottomrule",
        r"\end{longtable}",
        r"\addtocounter{table}{-1}",
        r"\endgroup",
        "",
    ])
    if gt.get("areaNotesTitle"):
        out.extend([rf"\subsection{{{ri(gt['areaNotesTitle'][lang])}}}", ri(gt["areaNotesIntro"][lang]), ""])
    for an in gt["areaNotes"]:
        lbl = an.get("label", {}).get(lang, an["code"])
        out.append(rf"\paragraph{{{tex_escape_plain(lbl, lang)}.}} {ri(an['body'][lang])}")
    pc = gt["promotionChain"]
    out.extend([
        "",
        rf"\subsection{{{ri(pc['title'][lang])}}}" if pc.get("title") else "",
        ri(pc["lead"][lang]),
        "",
        r"\begin{itemize}",
        *[rf"\item \textbf{{{ri(st['transition'][lang])}:}} {ri(st['requirement'][lang])}" for st in pc.get("steps", [])],
        *[rf"\item {ri(it[lang])}" for it in pc["items"]],
        r"\end{itemize}",
        "",
        ri(pc["outro"][lang]),
        "",
    ])
    col_hdr = (
        r"Kennung / Ampel & Regel (Telegrammstil) & Prüfgebiet & Durchsetzung und Grenze \\"
        if lang == "de"
        else r"ID / Status & Rule (concise summary) & Area & Enforcement and boundary \\"
    )
    rules_by_part: dict[str, list[dict[str, Any]]] = {}
    for r in rd["rules"]:
        rules_by_part.setdefault(r["part"], []).append(r)
    for part in rd["parts"]:
        out.extend([
            r"\needspace{35mm}",
            rf"\subsection{{{ri(part['title'][lang])}}}",
            r"\begingroup\footnotesize\setlength{\tabcolsep}{3.5pt}\renewcommand{\arraystretch}{1.14}",
            r"\begin{longtable}{@{}P{22mm}P{52mm}P{25mm}P{49mm}@{}}",
            r"\toprule",
            col_hdr,
            r"\midrule\endhead",
        ])
        for r in rules_by_part.get(part["key"], []):
            rid = r["id"]
            cmd = AMPEL_TEX_CMD[r["ampel"]]
            sref = ri(r["sectionRef"][lang])
            cell1 = rf"\phantomsection\label{{rule:{rid}}}\code{{{rid}}}\newline {cmd}\newline {sref}"
            out.append(f"{cell1} & {ri(r['rule'][lang])} & {ri(r['milestone'][lang])} & {ri(r['enforcement'][lang])}\\\\")
        out.extend([
            r"\bottomrule",
            r"\end{longtable}",
            r"\addtocounter{table}{-1}",
            r"\endgroup",
            "",
        ])
    cn = rd["completenessNote"]
    out.append(rf"\paragraph{{{ri(cn['lead'][lang])}}} {ri(cn['body'][lang])}")
    out.append(rf"\sources{{{ri(rd['sources'][lang])}}}")
    return "\n".join(out)
def render_rules_and_gates_web(bundle: SpecBundle, lang: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    rd = bundle.rules_data
    ri = lambda s: render_inline(s, lang, "web", wdoc, ref_map, bundle.repo_root)
    amp = rd["ampelSection"]
    ms = rd["milestoneOverview"]
    gt = rd["gatesOverview"]
    state_by_key = {st["key"]: st for st in amp["states"]}
    out: list[str] = [ri(rd["intro"][lang]), ""]
    for item in rd["readingGuide"]:
        out.append(f"- **{ri(item['lead'][lang])}** {ri(item['body'][lang])}")
    out.extend([
        "",
        '<a id="sec-rule-ampel"></a>',
        f"## {ri(amp['title'][lang])}",
        "",
        ri(amp["intro"][lang]),
        "",
        ("| Ampel | Bedeutung für Durchsetzung und CI | Anzahl |" if lang == "de"
         else "| Traffic Light | Meaning for Enforcement and CI | Count |"),
        "| --- | --- | ---: |",
    ])
    for st in amp["states"]:
        note = f" {ri(st['ruleIdsNote'][lang])}" if st.get("ruleIdsNote", {}).get(lang) else ""
        out.append(f"| {st['emoji']} **{st['badge'][lang]}** | {ri(st['meaning'][lang])}{note} | {st['count']} |")
    out.extend([
        "",
        ri(amp["summary"][lang]),
        "",
        '<a id="sec-rule-code-legend"></a>',
        f"## {ri(ms['title'][lang])}",
        "",
        ("| Kürzel | Ampel | Bedeutung |" if lang == "de" else "| Code | Status | Meaning |"),
        "| --- | --- | --- |",
    ])
    for row in ms["rows"]:
        lbl = row.get("label", {}).get(lang, row["code"])
        amp_web = " / ".join(f"{state_by_key[a]['emoji']} **{state_by_key[a]['badge'][lang]}**" for a in row.get("ampels", []))
        out.append(f"| `{lbl}` | {amp_web} | {ri(row['meaning'][lang])} |")
    out.extend([
        "",
        f"## {ri(gt['title'][lang])}",
        "",
        ri(gt["intro"][lang]),
        "",
        ("| Gate | Ampel | Tatsächliche Reichweite |" if lang == "de" else "| Gate | Status | Actual Scope |"),
        "| --- | --- | --- |",
        *[
            f"| {ri(row['gate'])} | {state_by_key[row['ampel']]['emoji']} **{state_by_key[row['ampel']]['badge'][lang]}** | {ri(row['scope'][lang])} |"
            for row in gt["rows"]
        ],
        "",
    ])
    if gt.get("areaNotesTitle"):
        out.extend([f"### {ri(gt['areaNotesTitle'][lang])}", "", ri(gt["areaNotesIntro"][lang]), ""])
    for an in gt["areaNotes"]:
        lbl = an.get("label", {}).get(lang, an["code"])
        out.append(f"- **`{lbl}`.** {ri(an['body'][lang])}")
    pc = gt["promotionChain"]
    out.extend([
        "",
        f"### {ri(pc['title'][lang])}" if pc.get("title") else "",
        "",
        ri(pc["lead"][lang]),
        "",
        *[f"- **{ri(st['transition'][lang])}:** {ri(st['requirement'][lang])}" for st in pc.get("steps", [])],
        *[f"- {ri(it[lang])}" for it in pc["items"]],
        "",
        ri(pc["outro"][lang]),
        "",
    ])
    rules_by_part: dict[str, list[dict[str, Any]]] = {}
    for r in rd["rules"]:
        rules_by_part.setdefault(r["part"], []).append(r)
    hdr = (
        "| Kennung | Ampel | Fundstelle | Regel (Telegrammstil) | Prüfgebiet | Durchsetzung und Grenze |"
        if lang == "de"
        else "| ID | Status | Section | Rule (concise summary) | Area | Enforcement and boundary |"
    )
    for part in rd["parts"]:
        p_rules = rules_by_part.get(part["key"], [])
        out.extend([
            f"## {ri(part['title'][lang])}",
            "",
            ri(part["webSourceNote"][lang]),
            "",
            hdr,
            "| --- | --- | --- | --- | --- | --- |",
        ])
        for r in p_rules:
            rid = r["id"]
            st = state_by_key[r["ampel"]]
            amp_cell = f"{st['emoji']} **{st['badge'][lang]}**"
            out.append(
                f'| <a id="{rid.lower()}"></a>`{rid}` | {amp_cell} | {ri(r["sectionRef"][lang])} '
                f'| {ri(r["rule"][lang])} | {ri(r["milestone"][lang])} | {ri(r["enforcement"][lang])} |'
            )
        out.append("")
    sum_hdr = "## Vollständigkeitsübersicht" if lang == "de" else "## Completeness Summary"
    sum_cols = ("| Teil | Kennungen | Anzahl |" if lang == "de" else "| Part | Identifiers | Count |")
    out.extend([sum_hdr, "", sum_cols, "| --- | --- | ---: |"])
    for part in rd["parts"]:
        p_rules = rules_by_part.get(part["key"], [])
        first_id, last_id = p_rules[0]["id"], p_rules[-1]["id"]
        out.append(
            f"| {ri(part['title'][lang])} | [`{first_id}`](#{first_id.lower()})–[`{last_id}`](#{last_id.lower()}) | {len(p_rules)} |"
        )
    cn = rd["completenessNote"]
    src_lbl = "Quellen" if lang == "de" else "Sources"
    out.extend([
        "",
        f"**{ri(cn['lead'][lang])}** {ri(cn['body'][lang])}",
        "",
        f"*{src_lbl}:* {ri(rd['sources'][lang])}",
    ])
    return "\n".join(out)
def parse_tex_colspec(cols: str | None, ncols: int) -> str:
    if not cols:
        return "@{}" + ("X" * ncols) + "@{}"
    parts = [p.strip() for p in cols.split(",") if p.strip()]
    mapped = ["X" if p == "X" else f"P{{{p}}}" for p in parts]
    return "@{}" + "".join(mapped) + "@{}"


def render_include(block: str, bundle: SpecBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    if block == "frontmatter-distinctions":
        return render_frontmatter_distinctions(bundle, lang, mode, wdoc, ref_map)
    if block == "rule-milestones-appendix":
        return render_rules_and_gates_tex(bundle, lang, wdoc, ref_map) if mode == "tex" else render_rules_and_gates_web(bundle, lang, wdoc, ref_map)
    if block == "implementation-appendix":
        return render_implementation_appendix(bundle, lang, mode, wdoc, ref_map)
    if block == "glossary-appendix":
        return render_glossary_appendix(bundle, lang, mode, wdoc, ref_map)
    if block == "sources-appendix":
        return render_sources_appendix(bundle, lang, mode, wdoc, ref_map)
    raise ValueError(f"Unknown ::include block '{block}'")


def render_ast_tex(nodes: list[Any], bundle: SpecBundle, lang: str, ref_map: dict[str, RefEntry]) -> str:
    ri = lambda s: render_inline(s, lang, "tex", "", ref_map, bundle.repo_root)
    out: list[str] = []
    for node in nodes:
        if isinstance(node, BoxNode) and node.kind == "titlebox":
            continue
        if isinstance(node, HeadingNode):
            t_str = ri(node.title)
            lbl = rf"\label{{{node.node_id}}}" if (node.node_id and not node.unnumbered) else ""
            if node.level == 2:
                if node.unnumbered:
                    short_mark = "Leserführung" if lang == "de" else "Reader's Guide"
                    out.extend([
                        rf"\section*{{{t_str}}}",
                        rf"\markboth{{{short_mark}}}{{{short_mark}}}",
                        rf"\addcontentsline{{toc}}{{section}}{{{t_str}}}",
                    ])
                else:
                    out.append(rf"\section{{{t_str}}}{lbl}")
            elif node.level == 3:
                cmd = "subsection*" if node.unnumbered else "subsection"
                out.append(rf"\{cmd}{{{t_str}}}{lbl}")
            elif node.level == 4:
                p_lbl = rf"\label{{{node.node_id}}}" if node.node_id else ""
                out.append(rf"\paragraph{{{t_str}}}{p_lbl}")
            out.append("")
        elif isinstance(node, ParagraphNode):
            out.extend([ri(node.text), ""])
        elif isinstance(node, DisplayMathNode):
            if node.node_id:
                out.extend([rf"\begin{{equation}}\label{{{node.node_id}}}", node.latex, r"\end{equation}", ""])
            else:
                out.extend([r"\[", node.latex, r"\]", ""])
        elif isinstance(node, BoxNode) and node.kind == "principle":
            body = render_ast_tex(node.children, bundle, lang, ref_map).strip()
            out.extend([rf"\begin{{principle}}{{{ri(node.title)}}}", body, r"\end{principle}", ""])
        elif isinstance(node, ListNode):
            env = "enumerate" if node.ordered else "itemize"
            out.append(rf"\begin{{{env}}}")
            for it in node.items:
                out.append(rf"\item {ri(it)}")
            out.extend([rf"\end{{{env}}}", ""])
        elif isinstance(node, DescriptionNode):
            out.append(r"\begin{description}")
            for lead, body in node.items:
                out.append(rf"\item[{ri(lead)}] {ri(body)}")
            out.extend([r"\end{description}", ""])
        elif isinstance(node, FigureNode):
            fig = bundle.figures[node.fig_id]
            asset = fig["asset"][lang]
            cap = ri(fig["caption"][lang])
            w = fig.get("texWidth") or r"\linewidth"
            h = fig.get("texHeight")
            opts = f"width={w},height={h},keepaspectratio" if h else f"width={w}"
            out.extend([
                r"\begin{figure}[htbp]\centering",
                rf"\includegraphics[{opts}]{{assets/graph-definition/{asset}}}",
                rf"\caption[\csname title{node.fig_id}\endcsname]{{{cap}}}\label{{{node.fig_id}}}",
                r"\end{figure}",
                "",
            ])
        elif isinstance(node, TableNode):
            colspec = parse_tex_colspec(node.cols, len(node.headers))
            hdr_line = " & ".join(ri(h) for h in node.headers) + r" \\"
            row_lines = [" & ".join(ri(c) for c in r) + r"\\" for r in node.rows]
            if node.longtable:
                out.extend([
                    r"\begingroup\small",
                    rf"\begin{{longtable}}{{{colspec}}}",
                    r"\toprule",
                    hdr_line,
                    r"\midrule\endhead",
                    *row_lines,
                    r"\bottomrule",
                    r"\end{longtable}",
                    r"\addtocounter{table}{-1}",
                    r"\endgroup",
                    "",
                ])
            elif node.caption:
                lbl = rf"\label{{{node.node_id}}}" if node.node_id else ""
                out.extend([
                    r"\begin{table}[htbp]\small",
                    rf"\caption{{{ri(node.caption)}}}{lbl}",
                    rf"\begin{{tabularx}}{{\linewidth}}{{{colspec}}}",
                    r"\toprule",
                    hdr_line,
                    r"\midrule",
                    *row_lines,
                    r"\bottomrule",
                    r"\end{tabularx}",
                    r"\end{table}",
                    "",
                ])
            else:
                out.extend([
                    r"\begin{center}\small",
                    rf"\begin{{tabularx}}{{\linewidth}}{{{colspec}}}",
                    r"\toprule",
                    hdr_line,
                    r"\midrule",
                    *row_lines,
                    r"\bottomrule",
                    r"\end{tabularx}\end{center}",
                    "",
                ])
        elif isinstance(node, IncludeNode):
            out.extend([render_include(node.block, bundle, lang, "tex", "", ref_map), ""])
        elif isinstance(node, SourcesNode):
            out.extend([rf"\sources{{{ri(node.text)}}}", ""])
    return "\n".join(out)
def emit_tex_document(bundle: SpecBundle, lang: str, ref_map: dict[str, RefEntry], asset_root: Path) -> str:
    pdf_cfg = bundle.manifest["pdf"][lang]
    badges = pdf_cfg["ampelBadges"]
    ri = lambda s: render_inline(s, lang, "tex", "", ref_map, bundle.repo_root)
    fm_nodes = bundle.chapters["00-frontmatter"][lang]
    titlebox = next((n for n in fm_nodes if isinstance(n, BoxNode) and n.kind == "titlebox"), None)
    if titlebox is None:
        raise ValueError(f"00-frontmatter.{lang}.md missing :::titlebox")
    titlebox_tex = render_ast_tex(titlebox.children, bundle, lang, ref_map).strip()
    title_fig_asset = bundle.figures["fig:title"]["asset"][lang]
    gfx_dir = asset_root.as_posix().rstrip("/") + "/"
    fig_titles = [
        rf"\expandafter\def\csname title{fid}\endcsname{{{ri(f['shortTitle'][lang])}}}"
        for fid, f in bundle.figures.items()
        if fid != "fig:title"
    ]
    title_lines = r"\par ".join(tex_escape_plain(ln, lang) for ln in pdf_cfg["title"].splitlines()) + r"\par"
    sub_lines = r"\par ".join(tex_escape_plain(ln, lang) for ln in pdf_cfg["subtitle"].splitlines()) + r"\par"
    foot_lines = r"\par ".join(tex_escape_plain(ln, lang) for ln in pdf_cfg["copyrightFooter"])

    lines = [
        "% SPDX-License-Identifier: Apache-2.0",
        "% Generated artifact from docs/concept/skill-graph/source/. Do not edit manually.",
        r"\documentclass[11pt,a4paper,parskip=half,headings=normal,numbers=noenddot]{scrartcl}",
        r"\usepackage{fontspec}",
        r"\setmainfont{lmroman10-regular.otf}[BoldFont=lmroman10-bold.otf,ItalicFont=lmroman10-italic.otf,BoldItalicFont=lmroman10-bolditalic.otf]",
        r"\setsansfont{lmsans10-regular.otf}[BoldFont=lmsans10-bold.otf,ItalicFont=lmsans10-oblique.otf,BoldItalicFont=lmsans10-boldoblique.otf]",
        r"\setmonofont{lmmono10-regular.otf}[BoldFont=lmmonolt10-bold.otf,ItalicFont=lmmono10-italic.otf,BoldItalicFont=lmmonolt10-boldoblique.otf]",
        rf"\usepackage[{pdf_cfg['babel']}]{{babel}}",
        r"\usepackage{microtype}",
        r"\usepackage[a4paper,top=24mm,bottom=25mm,left=25mm,right=25mm]{geometry}",
        r"\usepackage{amsmath,amssymb,mathtools}",
        r"\usepackage{graphicx,xcolor,booktabs,longtable,tabularx,array}",
        rf"\graphicspath{{{{{gfx_dir}}}}}",
        r"\usepackage{enumitem,caption,float,placeins,needspace}",
        r"\usepackage[most]{tcolorbox}",
        r"\usepackage{scrlayer-scrpage}",
        r"\usepackage{hyperref,bookmark}",
        r"\definecolor{ink}{HTML}{193349}",
        r"\definecolor{teal}{HTML}{087F8C}",
        r"\definecolor{lightteal}{HTML}{EDF7F7}",
        r"\definecolor{warm}{HTML}{A55F16}",
        r"\definecolor{muted}{HTML}{536575}",
        r"\definecolor{ampelgreen}{HTML}{1B6E3D}",
        r"\definecolor{ampelgreenbg}{HTML}{E7F6EC}",
        r"\definecolor{ampelamber}{HTML}{8A5200}",
        r"\definecolor{ampelamberbg}{HTML}{FFF4DB}",
        r"\definecolor{ampelred}{HTML}{9E2A2B}",
        r"\definecolor{ampelredbg}{HTML}{FDECEC}",
        r"\definecolor{ampelgray}{HTML}{4A5B68}",
        r"\definecolor{ampelgraybg}{HTML}{F1F4F6}",
        r"\definecolor{ampeloff}{HTML}{CFD7DF}",
        rf"\hypersetup{{colorlinks=true,linkcolor=ink,urlcolor=teal,citecolor=teal,"
        rf"pdftitle={{{tex_escape_plain(pdf_cfg['pdfTitle'], lang, allow_breaks=False)}}},"
        rf"pdfauthor={{SkillPilot / enpasos}},"
        rf"pdfsubject={{{tex_escape_plain(pdf_cfg['pdfSubject'], lang, allow_breaks=False)}}},"
        rf"pdfkeywords={{{tex_escape_plain(pdf_cfg['pdfKeywords'], lang, allow_breaks=False)}}}}}",
        r"\setkomafont{disposition}{\normalfont\sffamily\bfseries\color{ink}}",
        r"\setkomafont{pageheadfoot}{\normalfont\sffamily\small\color{muted}}",
        r"\clearpairofpagestyles",
        rf"\ihead{{{tex_escape_plain(pdf_cfg['runningHeadLeft'], lang)}}}",
        r"\ohead{\headmark}",
        r"\automark{section}",
        r"\cfoot{\pagemark}",
        r"\setlength{\headheight}{17pt}",
        r"\setcounter{tocdepth}{2}",
        r"\setcounter{secnumdepth}{2}",
        r"\setlist{nosep,leftmargin=*,topsep=4pt}",
        r"\setlist[description]{style=nextline,leftmargin=0pt,labelwidth=0pt,labelindent=0pt}",
        r"\captionsetup{font=small,labelfont=bf,skip=7pt}",
        r"\renewcommand{\topfraction}{.85}",
        r"\renewcommand{\bottomfraction}{.7}",
        r"\renewcommand{\textfraction}{.1}",
        r"\renewcommand{\floatpagefraction}{.8}",
        r"\renewcommand{\arraystretch}{1.18}",
        r"\newcolumntype{P}[1]{>{\raggedright\arraybackslash\hspace{0pt}}p{#1}}",
        r"\renewcommand{\tabularxcolumn}[1]{>{\raggedright\arraybackslash\hspace{0pt}}p{#1}}",
        r"\setlength{\emergencystretch}{3em}",
        r"\newcommand{\code}[1]{\texttt{#1}}",
        r"\newcommand{\nd}[1]{\ensuremath{\mathsf{#1}}}",
        r"\newcommand{\R}{\mathbb{R}}",
        r"\newcommand{\N}{\mathbb{N}}",
        r"\newcommand{\Pow}{\mathcal{P}}",
        r"\DeclareMathOperator{\Atoms}{Atoms}",
        r"\DeclareMathOperator{\Sat}{Sat}",
        r"\DeclareMathOperator{\Frontier}{Frontier}",
        r"\DeclareMathOperator{\Anc}{Anc}",
        r"\DeclareMathOperator{\Desc}{Desc}",
        r"\DeclareMathOperator{\ReqAtoms}{RequiredAtoms}",
        r"\DeclareMathOperator{\Closure}{Closure}",
        r"\DeclareMathOperator{\Pre}{Pre}",
        r"\DeclareMathOperator{\Missing}{Missing}",
        r"\DeclareMathOperator{\MissingAtoms}{MissingAtoms}",
        r"\DeclareMathOperator{\Complete}{Complete}",
        r"\DeclareMathOperator{\Own}{Own}",
        r"\DeclareMathOperator{\Children}{Children}",
        r"\DeclareMathOperator{\Id}{Id}",
        r"\DeclareMathOperator{\Title}{Title}",
        r"\DeclareMathOperator{\Weight}{Weight}",
        r"\DeclareMathOperator{\ShortKey}{ShortKey}",
        r"\DeclareMathOperator{\PhaseCompat}{PhaseCompat}",
        r"\DeclareMathOperator{\Applicability}{Applicability}",
        r"\DeclareMathOperator{\Work}{Work}",
        r"\DeclareMathOperator{\Reserve}{Reserve}",
        r"\DeclareMathOperator{\Budget}{Budget}",
        r"\newcommand{\Score}{\mathit{score}}",
        r"\newcommand{\Passed}{\mathit{passed}}",
        r"\newcommand{\MaxPoints}{\mathit{maxPoints}}",
        r"\newcommand{\PassingPoints}{\mathit{passingPoints}}",
        r"\newcommand{\Reff}{R_{\mathrm{eff}}}",
        r"\newcommand{\Rat}{R_{\mathrm{at}}}",
        r"\newcommand{\Meff}{M_{\mathrm{eff}}}",
        rf"\newcommand{{\srcref}}[2]{{\href{{{REPO_BLOB_PREFIX}#1}}{{#2}}}}",
        rf"\newcommand{{\sources}}[1]{{\par\medskip{{\small\noindent\textbf{{{tex_escape_plain(pdf_cfg['sourcesLabel'], lang)}}}~#1\par}}}}",
        r"\newtcolorbox{principle}[1]{breakable,colback=lightteal,colframe=teal,boxrule=.5pt,arc=1mm,left=3mm,right=3mm,top=2mm,bottom=2mm,title={#1},fonttitle=\sffamily\bfseries}",
        r"\newcommand{\makeampelbadge}[6]{{\setlength{\fboxsep}{1.6pt}\setlength{\fboxrule}{0.45pt}\fcolorbox{#1}{#2}{\tikz[baseline=-2.35pt]{\filldraw[draw=ink!45,fill=#3,line width=0.28pt] (0,0) circle (1.75pt);\filldraw[draw=ink!45,fill=#4,line width=0.28pt] (4.3pt,0) circle (1.75pt);\filldraw[draw=ink!45,fill=#5,line width=0.28pt] (8.6pt,0) circle (1.75pt);}\hspace{2.3pt}{\sffamily\bfseries\fontsize{6.8}{8}\selectfont\color{#1}\strut#6}}}}",
        r"\newsavebox{\boxampelhart}\newsavebox{\boxampelteil}\newsavebox{\boxampeloffen}\newsavebox{\boxampelopt}",
        r"\AtBeginDocument{%",
        rf" \sbox{{\boxampelhart}}{{\makeampelbadge{{ampelgreen}}{{ampelgreenbg}}{{ampeloff}}{{ampeloff}}{{ampelgreen}}{{{badges['hart']}}}}}%",
        rf" \sbox{{\boxampelteil}}{{\makeampelbadge{{ampelamber}}{{ampelamberbg}}{{ampeloff}}{{ampelamber}}{{ampeloff}}{{{badges['teil']}}}}}%",
        rf" \sbox{{\boxampeloffen}}{{\makeampelbadge{{ampelred}}{{ampelredbg}}{{ampelred}}{{ampeloff}}{{ampeloff}}{{{badges['offen']}}}}}%",
        rf" \sbox{{\boxampelopt}}{{\makeampelbadge{{ampelgray}}{{ampelgraybg}}{{ampeloff}}{{ampeloff}}{{ampeloff}}{{{badges['opt']}}}}}%",
        r"}",
        r"\newcommand{\ampelhart}{\usebox{\boxampelhart}}",
        r"\newcommand{\ampelteil}{\usebox{\boxampelteil}}",
        r"\newcommand{\ampeloffen}{\usebox{\boxampeloffen}}",
        r"\newcommand{\ampelopt}{\usebox{\boxampelopt}}",
        *fig_titles,
        r"\begin{document}",
        r"\begin{titlepage}",
        r"\vspace*{6mm}",
        rf"{{\sffamily\large\color{{teal}} {tex_escape_plain(pdf_cfg['kicker'], lang)}\par}}",
        r"\vspace{7mm}",
        rf"{{\sffamily\bfseries\fontsize{{32}}{{37}}\selectfont\color{{ink}} {title_lines}}}",
        r"\vspace{7mm}",
        rf"{{\Large {sub_lines}}}",
        r"\vspace{6mm}",
        rf"\begin{{center}}\includegraphics[width=\linewidth,height=.16\textheight,keepaspectratio]{{assets/graph-definition/{title_fig_asset}}}\end{{center}}",
        r"\vfill",
        rf"\begin{{principle}}{{{ri(titlebox.title)}}}",
        titlebox_tex,
        r"\end{principle}",
        r"\vspace{6mm}",
        rf"{{\small {foot_lines}}}",
        r"\end{titlepage}",
        render_ast_tex(fm_nodes, bundle, lang, ref_map),
        r"\clearpage",
        rf"\ohead{{{tex_escape_plain(pdf_cfg['tocHeader'], lang)}}}",
        r"\tableofcontents",
        r"\bigskip",
        r"\listoffigures",
    ]
    for ch_name in bundle.manifest["chapters"][1:]:
        p_head = pdf_cfg["partHeaders"][ch_name]
        lines.append(r"\clearpage")
        if ch_name == "06-appendices":
            lines.append(r"\appendix")
        lines.append(rf"\ohead{{{tex_escape_plain(p_head, lang)}}}")
        lines.append(render_ast_tex(bundle.chapters[ch_name][lang], bundle, lang, ref_map))
    lines.append(r"\end{document}")
    return "\n".join(lines) + "\n"
def render_ast_web(nodes: list[Any], bundle: SpecBundle, lang: str, wdoc: str, ref_map: dict[str, RefEntry]) -> str:
    ri = lambda s: render_inline(s, lang, "web", wdoc, ref_map, bundle.repo_root)
    out: list[str] = []
    for node in nodes:
        if isinstance(node, BoxNode) and node.kind in ("titlebox", "principle"):
            body = render_ast_web(node.children, bundle, lang, wdoc, ref_map).strip()
            indented = "\n".join(f"    {ln}" if ln else "" for ln in body.splitlines())
            out.extend([f'!!! abstract "{ri(node.title)}"', indented, ""])
        elif isinstance(node, HeadingNode):
            for anc in node.anchors:
                out.append(f'<a id="{anc}"></a>')
            if node.node_id:
                out.append(f'<a id="{slugify_id(node.node_id)}"></a>')
            prefix = ""
            if node.node_id and not node.unnumbered and node.node_id in ref_map:
                num = ref_map[node.node_id].number
                prefix = f"Anhang {num} — " if (node.appendix and lang == "de") else (f"Appendix {num} — " if node.appendix else f"{num}. ")
            if node.level == 4:
                out.extend([f"**{ri(node.title)}**", ""])
            else:
                hashes = "#" * node.level
                out.extend([f"{hashes} {prefix}{ri(node.title)}", ""])
        elif isinstance(node, ParagraphNode):
            out.extend([ri(node.text), ""])
        elif isinstance(node, DisplayMathNode):
            if node.node_id:
                num = ref_map[node.node_id].number
                out.extend([f'<a id="{slugify_id(node.node_id)}"></a>', "", "$$", f"{node.latex} \\tag{{{num}}}", "$$", ""])
            else:
                out.extend(["$$", node.latex, "$$", ""])
        elif isinstance(node, ListNode):
            for idx, it in enumerate(node.items, 1):
                bullet = f"{idx}." if node.ordered else "-"
                out.append(f"{bullet} {ri(it)}")
            out.append("")
        elif isinstance(node, DescriptionNode):
            for lead, body in node.items:
                out.append(f"- **{ri(lead)}** {ri(body)}")
            out.append("")
        elif isinstance(node, FigureNode):
            fig = bundle.figures[node.fig_id]
            asset = fig["asset"][lang]
            asset_doc = f"docs/concept/skill-graph/assets/graph-definition/{asset}"
            img_href = relative_web_link(wdoc, asset_doc)
            num = ref_map[node.fig_id].number
            fig_lbl = f"Abbildung {num}" if lang == "de" else f"Figure {num}"
            short_t = ri(fig["shortTitle"][lang])
            cap = ri(fig["caption"][lang])
            alt = web_plain(fig["alt"][lang])
            out.extend([
                f'<a id="{slugify_id(node.fig_id)}"></a>',
                "",
                f"![{alt}]({img_href})",
                "",
                f"*{fig_lbl} — {short_t}:* {cap}",
                "",
            ])
        elif isinstance(node, TableNode):
            if node.node_id:
                out.append(f'<a id="{slugify_id(node.node_id)}"></a>')
                out.append("")
            if node.caption:
                num = ref_map[node.node_id].number if (node.node_id and node.node_id in ref_map) else ""
                t_lbl = (f"Tabelle {num}: " if lang == "de" else f"Table {num}: ") if num else ""
                out.extend([f"*{t_lbl}{ri(node.caption)}*", ""])
            out.append("| " + " | ".join(ri(h) for h in node.headers) + " |")
            out.append("| " + " | ".join("---" for _ in node.headers) + " |")
            for r in node.rows:
                out.append("| " + " | ".join(ri(c) for c in r) + " |")
            out.append("")
        elif isinstance(node, IncludeNode):
            out.extend([render_include(node.block, bundle, lang, "web", wdoc, ref_map), ""])
        elif isinstance(node, SourcesNode):
            src_lbl = "Quellen" if lang == "de" else "Sources"
            out.extend([f"*{src_lbl}:* {ri(node.text)}", ""])
    return "\n".join(out)
def render_planning_crossref_stub(lang: str, wdoc: str) -> str:
    lu_doc = "docs/concept/skill-graph/learning-units.de.md" if lang == "de" else "docs/concept/skill-graph/learning-units.md"
    lup_doc = "docs/concept/skill-graph/learning-unit-progression.de.md" if lang == "de" else "docs/concept/skill-graph/learning-unit-progression.md"
    pl_doc = f"docs/concept/skill-graph/planning-and-budget.{lang}.md"
    lu_href = relative_web_link(wdoc, lu_doc)
    lup_href = relative_web_link(wdoc, lup_doc)
    pl_href = relative_web_link(wdoc, pl_doc)
    anchors = [
        "12-learning-units-and-optional-planning-profiles",
        "12-optional-curriculum-level-assignments",
        "121-plan-scope-and-entry-basis",
        "122-structural-feasibility",
        "123-workload-feasibility",
        "124-validity-and-progression-boundaries",
    ]
    anc_lines = "\n".join(f'<a id="{a}"></a>' for a in anchors)
    if lang == "de":
        return (
            f"{anc_lines}\n"
            "## Weiterführende Teile des Kompendiums (§§11–12)\n\n"
            f"Rekursive Lerneinheiten, Einheitsfolge sowie optionale Erwerbs- und Zeitplanung sind als eigene Web-Kapitel aufbereitet: "
            f"[Rekursive Lerneinheiten (§§11.1–11.4)]({lu_href}), "
            f"[Einheitsfolge (§11.5)]({lup_href}) und "
            f"[Optionale Erwerbs- und Zeitplanung (§12)]({pl_href}).\n"
        )
    return (
        f"{anc_lines}\n"
        "## Continuation in Companion Chapters (§§11–12)\n\n"
        f"Recursive learning units, whole-unit progression, and optional acquisition/time planning profiles live in their dedicated compendium chapters: "
        f"[Learning Units (§§11.1–11.4)]({lu_href}), "
        f"[Learning-Unit Progression (§11.5)]({lup_href}), and "
        f"[Optional Acquisition and Time Planning (§12)]({pl_href}).\n"
    )


def emit_web_pages(bundle: SpecBundle, ref_maps: dict[str, dict[str, RefEntry]], check_only: bool) -> list[str]:
    diffs: list[str] = []
    nav_labels = {
        "graph-definition": {"en": "§§1–5 Core", "de": "§§1–5 Kern"},
        "context-and-views": {"en": "§§6–10 Context", "de": "§§6–10 Kontext"},
        "learning-units": {"en": "§§11.1–11.4 Units", "de": "§§11.1–11.4 Lerneinheiten"},
        "learning-unit-progression": {"en": "§11.5 Progression", "de": "§11.5 Einheitsfolge"},
        "planning-and-budget": {"en": "§12 Planning", "de": "§12 Planung"},
        "assessment-gated-completion": {"en": "§13 Implicit Mastery", "de": "§13 Implizite Beherrschung"},
        "compendium-appendix": {"en": "Appendices B–F", "de": "Anhänge B–F"},
        "rule-milestone-matrix": {"en": "Appendix A (Rules & Ampel)", "de": "Anhang A (Regeln & Ampel)"},
    }
    for wp in bundle.manifest["webPages"]:
        wp_id = wp["id"]
        sources_list = (
            ["docs/concept/skill-graph/source/rules-and-gates.json"]
            if wp["sources"] == ["rules-and-gates"]
            else ["docs/concept/skill-graph/source/"]
        )
        for lang in ("en", "de"):
            wdoc = wp["paths"][lang]
            other_lang = "de" if lang == "en" else "en"
            other_href = relative_web_link(wdoc, wp["paths"][other_lang])
            pdf_de_href = relative_web_link(wdoc, "docs/concept/skill-graph/skillpilot-graph-definition.pdf")
            pdf_en_href = relative_web_link(wdoc, "docs/concept/skill-graph/skillpilot-graph-definition.en.pdf")
            lang_bar = (
                f"**Language / Sprache:** **English (EN)** · [Deutsch (DE)]({other_href}) "
                f"| **PDF:** [English PDF]({pdf_en_href}) · [Deutsches PDF]({pdf_de_href})"
                if lang == "en"
                else f"**Sprache / Language:** **Deutsch (DE)** · [English (EN)]({other_href}) "
                f"| **PDF:** [Deutsches PDF]({pdf_de_href}) · [English PDF]({pdf_en_href})"
            )
            part_links: list[str] = []
            for nav_wp in bundle.manifest["webPages"]:
                lbl = nav_labels[nav_wp["id"]][lang]
                if nav_wp["id"] == wp_id:
                    part_links.append(f"**{lbl}**")
                else:
                    part_links.append(f"[{lbl}]({relative_web_link(wdoc, nav_wp['paths'][lang])})")
            nav_bar = ("**Kompendium:** " if lang == "de" else "**Compendium:** ") + " · ".join(part_links)

            notice_lines = [
                f"# {wp['titles'][lang]}",
                "",
                "> Generated artifact. Do not edit manually.",
                ">",
                "> Generated by: `docs/concept/skill-graph/build_spec.py`",
                "> Regenerate with: `cd app && npm run docs:skill-graph:web`",
                *[f"> Source of truth: `{s}`" for s in sources_list],
                "",
                lang_bar,
                "",
                nav_bar,
                "",
                "---",
                "",
            ]
            if wp["sources"] == ["rules-and-gates"]:
                body = render_rules_and_gates_web(bundle, lang, wdoc, ref_maps[lang])
            else:
                chunks: list[str] = []
                for ch_name in wp["sources"]:
                    sliced = slice_chapter_for_web(
                        bundle.chapters[ch_name][lang],
                        wp.get("subsectionSlice"),
                        bool(wp.get("skipAppendixAInWebBody", False)),
                    )
                    if ch_name == "00-frontmatter":
                        tfig = FigureNode(fig_id="fig:title")
                        ref_maps[lang]["fig:title"] = RefEntry("fig:title", "0", wdoc, "fig-title")
                        title_img = relative_web_link(
                            wdoc, f"docs/concept/skill-graph/assets/graph-definition/{bundle.figures['fig:title']['asset'][lang]}"
                        )
                        title_alt = web_plain(bundle.figures["fig:title"]["alt"][lang])
                        chunks.append(f"![{title_alt}]({title_img})\n")
                    chunks.append(render_ast_web(sliced, bundle, lang, wdoc, ref_maps[lang]).strip())
                if wp.get("includePlanningCrossRefStub"):
                    chunks.append(render_planning_crossref_stub(lang, wdoc).strip())
                body = "\n\n".join(c for c in chunks if c)
            content = ("\n".join(notice_lines) + body.strip() + "\n").encode("utf-8")
            abs_path = bundle.repo_root / wdoc
            if check_only:
                if not abs_path.is_file() or abs_path.read_bytes() != content:
                    diffs.append(wdoc)
            else:
                atomic_write(abs_path, content)
    return diffs
def log_problems(log: str) -> list[str]:
    """Reject overflows, unresolved references, missing glyphs, and missing hyphenation."""
    problems = re.findall(
        r"^.*(?:Overfull \\[hv]box|undefined references|undefined citations|"
        r"Rerun to get cross-references|Missing character:|No hyphenation patterns).*$",
        log,
        re.MULTILINE | re.IGNORECASE,
    )
    for paragraph in re.split(r"\n[ \t]*\n", log):
        warning = re.search(r"^LaTeX Warning:[\s\S]*", paragraph, re.MULTILINE | re.IGNORECASE)
        if warning and re.search(r"undefined|may have changed|multiply[- ]defined", warning[0], re.IGNORECASE):
            problems.append(" ".join(warning[0].split()))
    return list(dict.fromkeys(problems))


def write_declared_binaries_manifest(bundle: SpecBundle, build_root: Path) -> None:
    pdf_paths = [
        p for lang in ("de", "en") for p in bundle.manifest["pdf"][lang]["outputPaths"]
    ]
    generated_pngs: list[str] = []
    for fid, f in bundle.figures.items():
        for lang in ("de", "en"):
            asset = f["asset"][lang]
            if asset.endswith(f".{lang}.png"):
                rel = f"docs/concept/skill-graph/assets/graph-definition/{asset}"
                if rel not in generated_pngs:
                    generated_pngs.append(rel)
                stem_alias = f"docs/concept/skill-graph/assets/graph-definition/{asset[: -len(f'.{lang}.png')]}.png"
                if stem_alias not in generated_pngs:
                    generated_pngs.append(stem_alias)
    payload = {
        "schemaVersion": 1,
        "generatedBy": "docs/concept/skill-graph/build_spec.py",
        "binaries": sorted(set([
            *pdf_paths,
            "docs/concept/skill-graph/skillpilot-graph-definition.build.json",
            *generated_pngs,
        ])),
    }
    atomic_write(
        build_root / "declared-binaries.json",
        (json.dumps(payload, indent=2, ensure_ascii=False) + "\n").encode("utf-8"),
    )


def check_untracked_outputs(bundle: SpecBundle) -> None:
    forbidden = sorted({
        *(p for wp in bundle.manifest["webPages"] for p in wp["paths"].values()),
        *(p for lang in ("de", "en") for p in bundle.manifest["pdf"][lang]["outputPaths"]),
        "docs/concept/skill-graph/skillpilot-graph-definition.build.json",
        "docs/concept/skill-graph/skillpilot-graph-definition.tex",
        *(str(p.relative_to(bundle.repo_root)) for p in (bundle.repo_root / "docs/concept/skill-graph/latex").glob("*.tex")),
    })
    for f in bundle.figures.values():
        for lang in ("de", "en"):
            asset = f["asset"][lang]
            if asset.endswith(f".{lang}.png"):
                stem = asset[: -len(f".{lang}.png")]
                forbidden.append(f"docs/concept/skill-graph/assets/graph-definition/{asset}")
                forbidden.append(f"docs/concept/skill-graph/assets/graph-definition/{stem}.png")
    res = subprocess.run(["git", "ls-files", "--", *sorted(set(forbidden))], cwd=bundle.repo_root, text=True, capture_output=True, check=True)
    tracked = [line.strip() for line in res.stdout.splitlines() if line.strip()]
    if tracked:
        raise SystemExit("Generated or retired Skill Graph files must not be tracked in Git:\n  - " + "\n  - ".join(tracked))


def compile_pdfs(
    bundle: SpecBundle,
    cited_repos: set[str],
    tex_files: dict[str, Path],
    build_root: Path,
    texmf: Path | None,
) -> None:
    env = os.environ.copy()
    env["SOURCE_DATE_EPOCH"] = bundle.manifest["sourceDateEpoch"]
    env["FORCE_SOURCE_DATE"] = "1"
    if texmf is not None:
        tree = texmf.resolve()
        if not tree.is_dir():
            raise SystemExit(f"TeX tree does not exist: {tree}")
        config_dir = build_root / "texconfig"
        config_dir.mkdir(parents=True, exist_ok=True)
        kpse = shutil.which("kpsewhich", path=env.get("PATH"))
        if kpse:
            language_file = subprocess.check_output([kpse, "language.dat"], env=env, text=True).strip()
            if language_file and Path(language_file).is_file():
                languages = Path(language_file).read_text(encoding="utf-8")
                if not re.search(r"^ngerman\s", languages, re.MULTILINE):
                    languages += "\nngerman loadhyph-de-1996.tex\n=naustrian\n=nswissgerman\n"
                (config_dir / "language.dat").write_text(languages, encoding="utf-8")
        env["TEXINPUTS"] = f"{config_dir}//:{tree}/tex//:" + env.get("TEXINPUTS", "")
        env["LUAINPUTS"] = f"{tree}//:" + env.get("LUAINPUTS", "")
    lualatex = shutil.which("lualatex", path=env.get("PATH"))
    if not lualatex:
        raise SystemExit("LuaLaTeX is required for --pdfs / --all.")
    inputs = sorted({
        *bundle.source_dir.glob("*.json"),
        *bundle.source_dir.glob("*.md"),
        *bundle.source_dir.glob("chapters/*.md"),
        *(bundle.repo_root / "docs/concept/skill-graph/assets/graph-definition").glob("*.png"),
        Path(__file__).resolve(),
        bundle.repo_root / "docs/concept/skill-graph/latex/check-assessment-model.py",
        bundle.repo_root / "docs/concept/skill-graph/latex/generate-completion-diagrams.py",
    })
    input_hashes = {str(p.relative_to(bundle.repo_root)): digest_file(p) for p in inputs if p.is_file()}
    source_hashes = {
        p: digest_file(bundle.repo_root / p)
        for p in sorted(cited_repos)
        if (bundle.repo_root / p).is_file()
    }
    from concurrent.futures import ThreadPoolExecutor

    def build_one_lang(lang: str) -> tuple[str, dict[str, str]]:
        lang_dir = build_root / lang
        tex_path = tex_files[lang]
        cmd = [
            lualatex,
            "-halt-on-error",
            "-interaction=nonstopmode",
            "-file-line-error",
            "-recorder",
            f"-output-directory={lang_dir}",
            tex_path.name,
        ]
        for run in range(1, 4):
            res = subprocess.run(cmd, cwd=lang_dir, env=env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            (lang_dir / f"pass-{run}.txt").write_text(res.stdout, encoding="utf-8")
            if res.returncode:
                raise RuntimeError(f"LuaLaTeX ({lang}) pass {run} failed:\n{res.stdout[-7000:]}")
        log = (lang_dir / f"{tex_path.stem}.log").read_text(encoding="utf-8", errors="replace")
        probs = log_problems(log)
        if probs:
            raise RuntimeError(
                f"LuaLaTeX ({lang}) log check failed ({lang_dir / (tex_path.stem + '.log')}):\n" + "\n".join(probs)
            )
        pdf_bytes = (lang_dir / f"{tex_path.stem}.pdf").read_bytes()
        for out_rel in bundle.manifest["pdf"][lang]["outputPaths"]:
            atomic_write(bundle.repo_root / out_rel, pdf_bytes)
        primary_rel = bundle.manifest["pdf"][lang]["outputPaths"][0]
        return lang, {"path": primary_rel, "sha256": digest_bytes(pdf_bytes)}

    pdf_outputs: dict[str, dict[str, str]] = {}
    lang_errors: list[str] = []
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = {lang: pool.submit(build_one_lang, lang) for lang in ("de", "en")}
        for lang in ("de", "en"):
            try:
                _, info = futures[lang].result()
                pdf_outputs[lang] = info
                print(f"Built {info['path']} ({lang}; 3 passes; 0 overflows/warnings)")
            except Exception as exc:  # noqa: BLE001
                lang_errors.append(str(exc))
    if lang_errors:
        raise SystemExit("\n\n".join(lang_errors))

    version = subprocess.check_output([lualatex, "--version"], env=env, text=True).splitlines()[0]
    build_manifest = {
        "documentDate": bundle.manifest["documentDate"],
        "engine": version,
        "sourceDateEpoch": env["SOURCE_DATE_EPOCH"],
        "pdf": pdf_outputs["de"],
        "pdfs": pdf_outputs,
        "inputs": input_hashes,
        "conceptSources": source_hashes,
        "scope": "Technical single-source documentation build (DE + EN); no runtime, publication or learner validation.",
    }
    atomic_write(
        bundle.repo_root / "docs/concept/skill-graph/skillpilot-graph-definition.build.json",
        (json.dumps(build_manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8"),
    )
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

    repo_root = Path(__file__).resolve().parents[3]
    build_root = repo_root / "tmp/skill-graph-document"
    build_root.mkdir(parents=True, exist_ok=True)

    bundle, cited_repos = load_and_verify_bundle(repo_root)
    print("Verified canonical single-source schemas, 143 rules, terminology, and DE/EN AST parity.")

    if args.check_untracked_outputs:
        check_untracked_outputs(bundle)
        print("Verified no generated or retired Skill Graph files are tracked in Git.")

    if args.all:
        subprocess.run(
            [sys.executable, str(repo_root / "docs/concept/skill-graph/latex/check-assessment-model.py")],
            check=True,
        )

    if args.diagrams or args.all:
        diag_cmd = [sys.executable, str(repo_root / "docs/concept/skill-graph/latex/generate-completion-diagrams.py"), "--lang", "all"]
        if args.check:
            diag_cmd.append("--check")
        subprocess.run(diag_cmd, check=True)

    tex_files: dict[str, Path] = {}
    if args.web_and_tex or args.pdfs or args.all:
        ref_maps = {lang: build_ref_map(bundle, lang) for lang in ("de", "en")}
        diffs = emit_web_pages(bundle, ref_maps, check_only=args.check)
        if args.check and diffs:
            raise SystemExit("Stale generated Web Markdown files (run `npm --prefix app run docs:skill-graph:web`):\n  - " + "\n  - ".join(diffs))
        asset_root = repo_root / "docs/concept/skill-graph"
        for lang in ("de", "en"):
            lang_dir = build_root / lang
            lang_dir.mkdir(parents=True, exist_ok=True)
            tex_path = lang_dir / f"skillpilot-graph-definition.{lang}.tex"
            tex_str = emit_tex_document(bundle, lang, ref_maps[lang], asset_root)
            atomic_write(tex_path, tex_str.encode("utf-8"))
            tex_files[lang] = tex_path
        write_declared_binaries_manifest(bundle, build_root)
        print("Materialized 16 bilingual Web Markdown pages and DE/EN LaTeX sources.")

    if args.pdfs or args.all:
        compile_pdfs(bundle, cited_repos, tex_files, build_root, args.texmf)


if __name__ == "__main__":
    main()
