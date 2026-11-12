"""Canonical single-source Markdown + directive AST, parser, and terminology checks.

SPDX-License-Identifier: Apache-2.0
"""

from __future__ import annotations

from dataclasses import dataclass, field
import hashlib
import os
from pathlib import Path
import re
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

FORBIDDEN_RAW_TEX_RE = re.compile(
    r"\\(?:emph|textbf|texttt|code|srcref|glqq|grqq|begin\{(?:itemize|enumerate|description|tabularx|longtable)\})\b"
)


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


def collect_repo_paths(text: str, out: set[str]) -> None:
    for m in re.finditer(r"\]\(repo:([^)#\s]+)", text):
        out.add(m.group(1))


def check_terminology_in_text(text: str, label: str, errors: list[str]) -> None:
    for line_no, line in enumerate(text.splitlines(), 1):
        for rule_id, pat, allow in TERM_RULES:
            scrubbed = allow.sub("", line) if allow else line
            m = pat.search(scrubbed)
            if m:
                errors.append(f"{label}:{line_no}: terminology violation {rule_id}: '{m.group(0)}'")


def scrub_math_and_code(text: str) -> str:
    text = re.sub(r"```[\s\S]*?```", "", text)
    text = re.sub(r"~~~[\s\S]*?~~~", "", text)
    text = re.sub(r"\$\$[\s\S]*?\$\$", "", text)
    text = re.sub(r":::equation[\s\S]*?:::", "", text)
    text = re.sub(r"`[^`\n]+`", "", text)
    return re.sub(r"\$(?:\\.|[^$\\])+\$", "", text)


@dataclass
class RefEntry:
    label: str
    number: str
    web_path: str
    web_anchor: str


@dataclass
class HeadingNode:
    level: int
    title: str
    node_id: str | None = None
    unnumbered: bool = False
    appendix: bool = False
    anchors: list[str] = field(default_factory=list)
    short_mark: str | None = None


@dataclass
class ParagraphNode:
    text: str


@dataclass
class DisplayMathNode:
    latex: str
    node_id: str | None = None


@dataclass
class BoxNode:
    kind: str  # 'titlebox', 'principle', 'note', 'warning'
    title: str
    children: list[Any]


@dataclass
class CodeBlockNode:
    language: str
    code: str


@dataclass
class BlockquoteNode:
    children: list[Any]


@dataclass
class ListItem:
    text: str
    sub_ordered: bool = False
    sub_items: list[str] = field(default_factory=list)


@dataclass
class ListNode:
    ordered: bool
    items: list[str]
    rich_items: list[ListItem] = field(default_factory=list)


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


@dataclass
class ThematicBreakNode:
    pass


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


SUB_UNORDERED_RE = re.compile(r"^(?:  |\t)-\s+(.*)$")
SUB_ORDERED_RE = re.compile(r"^(?:  |\t)\d+\.\s+(.*)$")


def parse_list_items_rich(lines: list[str], start: int, ordered: bool) -> tuple[list[str], list[ListItem], int]:
    marker_re = re.compile(r"^\d+\.\s+(.*)$" if ordered else r"^-\s+(.*)$")
    flat_items: list[str] = []
    rich_items: list[ListItem] = []
    i = start
    while i < len(lines):
        m = marker_re.match(lines[i])
        if not m:
            break
        buf = [m.group(1).strip()]
        sub_items: list[str] = []
        sub_ordered = False
        i += 1
        while i < len(lines) and (lines[i].startswith("  ") or lines[i].startswith("\t")):
            m_su = SUB_UNORDERED_RE.match(lines[i])
            m_so = SUB_ORDERED_RE.match(lines[i])
            if m_su or m_so:
                if not sub_items:
                    sub_ordered = bool(m_so)
                sub_buf = [(m_su or m_so).group(1).strip()]  # type: ignore[union-attr]
                i += 1
                while i < len(lines) and (lines[i].startswith("    ") or lines[i].startswith("\t\t")):
                    sub_buf.append(lines[i].strip())
                    i += 1
                sub_items.append(" ".join(sub_buf))
            else:
                buf.append(lines[i].strip())
                i += 1
        lead_text = " ".join(buf)
        flat_items.append(lead_text)
        rich_items.append(ListItem(text=lead_text, sub_ordered=sub_ordered, sub_items=sub_items))
        if i < len(lines) and lines[i].strip() == "":
            if i + 1 < len(lines) and marker_re.match(lines[i + 1]):
                i += 1
            else:
                break
    return flat_items, rich_items, i


HEADING_RE = re.compile(r"^(#{2,4})\s+(.+?)(?:\s*\{([^}]+)\})?\s*$")
DIRECTIVE_SINGLE_RE = re.compile(r"^::(figure|include)\{([^}]+)\}\s*$")
FENCE_OPEN_RE = re.compile(r"^:::(titlebox|principle|note|warning|equation|table|description|sources)(?:\s*\{([^}]+)\})?\s*$")
CODE_FENCE_RE = re.compile(r"^(?P<fence>`{3,}|~{3,})(?P<lang>[A-Za-z0-9_+-]*)\s*$")
PIPE_SEP_RE = re.compile(r"^\|(?:\s*:?-{3,}:?\s*\|)+(?:\s*:?-{3,}:?\s*)?$|^(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*$")
BLOCK_ATTR_LINE_RE = re.compile(r"^\{([^}]+)\}\s*$")


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
        if stripped == "---":
            nodes.append(ThematicBreakNode())
            i += 1
            continue
        m_code = CODE_FENCE_RE.match(stripped)
        if m_code:
            fence_str = m_code.group("fence")
            code_lang = m_code.group("lang") or ""
            i += 1
            code_lines: list[str] = []
            while i < n and not lines[i].strip().startswith(fence_str):
                code_lines.append(lines[i])
                i += 1
            if i >= n:
                raise ValueError(f"{source_label}: unclosed code fence ({fence_str})")
            i += 1
            nodes.append(CodeBlockNode(language=code_lang, code="\n".join(code_lines)))
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
            if kind in ("titlebox", "principle", "note", "warning"):
                children = parse_blocks(body_lines, f"{source_label}:{kind}")
                nodes.append(BoxNode(kind=kind, title=str(attrs.get("title", "")), children=children))
            elif kind == "equation":
                nodes.append(DisplayMathNode(latex="\n".join(body_lines).strip(), node_id=attrs.get("id")))
            elif kind == "sources":
                nodes.append(SourcesNode(text=" ".join(ln.strip() for ln in body_lines if ln.strip())))
            elif kind == "description":
                trimmed_desc = "\n".join(body_lines).strip().splitlines()
                raw_items, _, _ = parse_list_items_rich(trimmed_desc, 0, ordered=False)
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
        if raw.startswith(">"):
            quote_lines: list[str] = []
            while i < n and lines[i].startswith(">"):
                qline = lines[i][1:]
                if qline.startswith(" "):
                    qline = qline[1:]
                quote_lines.append(qline)
                i += 1
            children = parse_blocks(quote_lines, f"{source_label}:quote")
            nodes.append(BlockquoteNode(children=children))
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
                    short_mark=str(attrs["shortMark"]) if "shortMark" in attrs else None,
                )
            )
            i += 1
            continue
        if stripped.startswith("|") and i + 1 < n and PIPE_SEP_RE.match(lines[i + 1].strip()):
            tbl_lines = [stripped, lines[i + 1].strip()]
            i += 2
            while i < n and lines[i].strip().startswith("|"):
                tbl_lines.append(lines[i].strip())
                i += 1
            attrs = {}
            if i < n:
                m_tbl_attr = BLOCK_ATTR_LINE_RE.match(lines[i].strip())
                if m_tbl_attr:
                    attrs = parse_attrs(m_tbl_attr.group(1))
                    i += 1
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
        if re.match(r"^-\s+", raw):
            flat_items, rich_items, i = parse_list_items_rich(lines, i, ordered=False)
            nodes.append(ListNode(ordered=False, items=flat_items, rich_items=rich_items))
            continue
        if re.match(r"^\d+\.\s+", raw):
            flat_items, rich_items, i = parse_list_items_rich(lines, i, ordered=True)
            nodes.append(ListNode(ordered=True, items=flat_items, rich_items=rich_items))
            continue
        para_lines = [stripped]
        i += 1
        while i < n:
            nxt = lines[i]
            nxt_s = nxt.strip()
            if (
                not nxt_s
                or nxt_s == "---"
                or nxt_s == "$$"
                or nxt_s.startswith("::")
                or CODE_FENCE_RE.match(nxt_s)
                or nxt.startswith(">")
                or HEADING_RE.match(nxt)
                or (nxt_s.startswith("|") and i + 1 < n and PIPE_SEP_RE.match(lines[i + 1].strip()))
                or re.match(r"^(?:-\s+|\d+\.\s+)", nxt)
            ):
                break
            para_lines.append(nxt_s)
            i += 1
        para_text = " ".join(para_lines)
        para_unquoted = re.sub(r"`[^`]*`", "", para_text)
        if re.search(r"\|\s*:?-{3,}:?\s*\|", para_unquoted) or re.search(r"\{cols=", para_unquoted):
            raise ValueError(f"{source_label}: unparsed pipe table or table attributes in paragraph: {para_text[:120]}")
        nodes.append(ParagraphNode(text=para_text))
    return nodes


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
        elif isinstance(node, CodeBlockNode):
            skel.append(("CODE", node.language))
        elif isinstance(node, BlockquoteNode):
            sub_skel, sub_repos = extract_skeleton(node.children)
            skel.append(("QUOTE", tuple(sub_skel)))
            repos.update(sub_repos)
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
            for r_item in node.rich_items:
                collect_repo_paths(r_item.text, repos)
                for sub in r_item.sub_items:
                    collect_repo_paths(sub, repos)
        elif isinstance(node, DescriptionNode):
            for lead, body in node.items:
                collect_repo_paths(lead, repos)
                collect_repo_paths(body, repos)
        elif isinstance(node, SourcesNode):
            skel.append(("SRC",))
            collect_repo_paths(node.text, repos)
        elif isinstance(node, ThematicBreakNode):
            skel.append(("HR",))
    return skel, repos
