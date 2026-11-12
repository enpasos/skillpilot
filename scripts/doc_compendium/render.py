"""Renderers for Web Markdown (MkDocs / ReactMarkdown) and LuaLaTeX PDFs.

SPDX-License-Identifier: Apache-2.0
"""

from __future__ import annotations

from dataclasses import dataclass, field
import os
from pathlib import Path
import re
import shutil
import subprocess
from typing import Any, Callable

from .ast_and_parser import (
    REPO_BLOB_PREFIX,
    REPO_TREE_PREFIX,
    BlockquoteNode,
    BoxNode,
    CodeBlockNode,
    DescriptionNode,
    DisplayMathNode,
    FigureNode,
    HeadingNode,
    IncludeNode,
    ListNode,
    ParagraphNode,
    RefEntry,
    SourcesNode,
    TableNode,
    ThematicBreakNode,
    atomic_write,
    slugify_id,
)


@dataclass
class CompendiumBundle:
    compendium_id: str
    config: dict[str, Any]
    repo_root: Path
    source_dir: Path
    manifest: dict[str, Any]
    figures: dict[str, dict[str, Any]]
    extra_json: dict[str, dict[str, Any]]
    chapters: dict[str, dict[str, list[Any]]]
    bilingual_doc_map: dict[str, dict[str, str]]
    include_renderer: Callable[[str, "CompendiumBundle", str, str, str, dict[str, RefEntry]], str] | None = None
    ref_map_hook: Callable[["CompendiumBundle", str, dict[str, RefEntry]], None] | None = None
    web_custom_source_renderer: Callable[[list[str], "CompendiumBundle", str, str, dict[str, RefEntry]], str | None] | None = None
    web_post_hook: Callable[[dict[str, Any], "CompendiumBundle", str, str], str | None] | None = None
    svg_pdf_cache: dict[str, str] = field(default_factory=dict)


INLINE_TOKEN_RE = re.compile(
    r"`(?P<code>[^`]+)`"
    r"|\$(?P<math>(?:\\.|[^$\\])+)\$"
    r"|\[(?P<rlabel>[^\]]+)\]\(@rule\{(?P<rid>[A-Z]+-[A-Z0-9-]+)\}\)"
    r"|\[(?P<llabel>[^\]]+)\]\(repo:(?P<rpath>[^)#\s]+)(?:#(?P<rfrag>[^)\s]+))?\)"
    r"|\[(?P<alabel>[^\]]+)\]\(#(?P<afrag>[A-Za-z0-9:._-]+)\)"
    r"|\[(?P<ulabel>[^\]]+)\]\((?P<url>https?://[^)\s]+)\)"
    r"|(?P<tilde>~)?@(?P<rk>ref|eqref)\{(?P<rtarget>[^}]+)\}"
    r"|\*\*(?P<bold>(?:`[^`]+`|\$(?:\\.|[^$\\])+\$|[^*])+)\*\*"
    r"|\*(?P<italic>(?:`[^`]+`|\$(?:\\.|[^$\\])+\$|[^*])+)\*"
)


def tex_escape_code(text: str) -> str:
    if len(text) >= 40 and re.fullmatch(r"[0-9a-fA-F]+", text):
        return r"\allowbreak{}".join(text[i : i + 8] for i in range(0, len(text), 8))
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
        "=": r"=\allowbreak{}",
        "?": r"?\allowbreak{}",
    }
    out: list[str] = []
    for idx, ch in enumerate(text):
        if idx > 0 and text[idx - 1].islower() and ch.isupper():
            out.append(r"\allowbreak{}")
        out.append(replacements.get(ch, ch))
    escaped = "".join(out)
    return re.sub(
        r"[0-9a-fA-F]{40,}",
        lambda m: r"\allowbreak{}".join(m.group(0)[i : i + 8] for i in range(0, len(m.group(0)), 8)),
        escaped,
    )


UNICODE_BOX_TO_ASCII = str.maketrans({
    "┌": "+", "┐": "+", "└": "+", "┘": "+", "├": "+", "┤": "+", "┬": "+", "┴": "+", "┼": "+",
    "─": "-", "━": "=", "│": "|", "┃": "|", "►": ">", "◄": "<", "▼": "v", "▲": "^",
    "→": "->", "←": "<-", "↔": "<->", "⇒": "=>", "•": "*", "…": "...",
})


def tex_escape_codeblock_line(line: str) -> str:
    normalized = line.expandtabs(2).translate(UNICODE_BOX_TO_ASCII)
    stripped = normalized.lstrip(" ")
    indent_spaces = len(normalized) - len(stripped)
    if not stripped:
        return r"\strut{}"
    indent_tex = rf"\hspace*{{{indent_spaces * 0.52:.2f}em}}" if indent_spaces > 0 else ""
    escaped = tex_escape_code(stripped)
    escaped = escaped.replace(" ", r"\allowbreak\ ")
    return f"{indent_tex}{escaped}"


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
        elif ch == "$":
            out.append(r"\$")
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
        elif ch == "\u2011":
            out.append(r"\mbox{-}")
        elif ch == "\u2192":
            out.append(r"\ensuremath{\to}")
        elif ch == "\u2190":
            out.append(r"\ensuremath{\leftarrow}")
        elif ch == "\u2194":
            out.append(r"\ensuremath{\leftrightarrow}")
        elif ch == "\u21d2":
            out.append(r"\ensuremath{\Rightarrow}")
        elif ch == "\u21a6":
            out.append(r"\ensuremath{\mapsto}")
        elif ch == "\u2264":
            out.append(r"\ensuremath{\le}")
        elif ch == "\u2265":
            out.append(r"\ensuremath{\ge}")
        elif ch == "\u2260":
            out.append(r"\ensuremath{\ne}")
        elif ch == "\u2248":
            out.append(r"\ensuremath{\approx}")
        elif ch == "\u2208":
            out.append(r"\ensuremath{\in}")
        elif ch == "\u2209":
            out.append(r"\ensuremath{\notin}")
        elif ch == "\u2286":
            out.append(r"\ensuremath{\subseteq}")
        elif ch == "\u00b1":
            out.append(r"\ensuremath{\pm}")
        elif ch == "\u00d7":
            out.append(r"\ensuremath{\times}")
        elif ch in ("\u2713", "\u2714"):
            out.append(r"\ensuremath{\checkmark}")
        else:
            out.append(ch)
    return "".join(out)


def web_plain(text: str) -> str:
    return text.replace("--", "–").replace("~", " ")


def relative_web_link(from_doc: str, to_doc: str, anchor: str = "") -> str:
    if from_doc == to_doc:
        return f"#{anchor}" if anchor else Path(to_doc).name
    rel = os.path.relpath(to_doc, Path(from_doc).parent).replace(os.sep, "/")
    return f"{rel}#{anchor}" if anchor else rel


def is_excluded_docs_source_path(rel_path: str) -> bool:
    parts = Path(rel_path).parts
    return any(seg == "source" or seg.endswith("-source") for seg in parts)


def render_inline(
    text: str,
    lang: str,
    mode: str,
    current_web_doc: str,
    ref_map: dict[str, RefEntry],
    repo_root: Path,
    bilingual_doc_map: dict[str, dict[str, str]],
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
                if f"rule:{rid}" in ref_map or rid.startswith("GD-"):
                    parts.append(rf"\hyperref[rule:{rid}]{{\code{{{tex_escape_code(rlabel)}}}}}")
                else:
                    parts.append(rf"\code{{{tex_escape_code(rlabel)}}}")
            else:
                matrix_doc = bilingual_doc_map.get(
                    "docs/qa-ci/graph-definition-rule-milestone-matrix.md", {}
                ).get(lang, "docs/qa-ci/graph-definition-rule-milestone-matrix.md")
                href = relative_web_link(current_web_doc, matrix_doc, rid.lower())
                parts.append(f"[`{rlabel}`]({href})")
        elif m.group("rpath") is not None:
            llabel = render_inline(
                m.group("llabel"), lang, mode, current_web_doc, ref_map, repo_root, bilingual_doc_map
            )
            rpath = m.group("rpath")
            rfrag = m.group("rfrag") or ""
            clean_rpath = rpath.rstrip("/")
            abs_target = repo_root / clean_rpath
            is_dir = rpath.endswith("/") or abs_target.is_dir()
            if mode == "tex":
                if is_dir:
                    url = f"{REPO_TREE_PREFIX}{clean_rpath}".replace("%", r"\%").replace("#", r"\#")
                    parts.append(rf"\href{{{url}}}{{{llabel}}}")
                else:
                    frag_suffix = rf"\#{rfrag}" if rfrag else ""
                    tex_rpath = clean_rpath.replace("%", r"\%").replace("#", r"\#")
                    parts.append(rf"\srcref{{{tex_rpath}{frag_suffix}}}{{{llabel}}}")
            else:
                mapped = bilingual_doc_map.get(clean_rpath, {}).get(lang, clean_rpath)
                if mapped.startswith("docs/") and not is_dir and not is_excluded_docs_source_path(mapped):
                    href = relative_web_link(current_web_doc, mapped, rfrag)
                    parts.append(f"[{llabel}]({href})")
                else:
                    prefix = REPO_TREE_PREFIX if is_dir else REPO_BLOB_PREFIX
                    frag_suffix = f"#{rfrag}" if rfrag else ""
                    parts.append(f"[{llabel}]({prefix}{clean_rpath}{frag_suffix})")
        elif m.group("afrag") is not None:
            alabel = render_inline(
                m.group("alabel"), lang, mode, current_web_doc, ref_map, repo_root, bilingual_doc_map
            )
            afrag = m.group("afrag")
            if mode == "tex":
                if afrag in ref_map:
                    parts.append(rf"\hyperref[{afrag}]{{{alabel}}}")
                else:
                    parts.append(alabel)
            else:
                parts.append(f"[{alabel}](#{slugify_id(afrag)})")
        elif m.group("url") is not None:
            ulabel = render_inline(
                m.group("ulabel"), lang, mode, current_web_doc, ref_map, repo_root, bilingual_doc_map
            )
            url = m.group("url")
            tex_url = url.replace("%", r"\%").replace("#", r"\#")
            parts.append(rf"\href{{{tex_url}}}{{{ulabel}}}" if mode == "tex" else f"[{ulabel}]({url})")
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
            inner = render_inline(
                m.group("bold"), lang, mode, current_web_doc, ref_map, repo_root, bilingual_doc_map
            )
            parts.append(rf"\textbf{{{inner}}}" if mode == "tex" else f"**{inner}**")
        elif m.group("italic") is not None:
            inner = render_inline(
                m.group("italic"), lang, mode, current_web_doc, ref_map, repo_root, bilingual_doc_map
            )
            parts.append(rf"\emph{{{inner}}}" if mode == "tex" else f"*{inner}*")
    if pos < len(text):
        plain = text[pos:]
        parts.append(tex_escape_plain(plain, lang) if mode == "tex" else web_plain(plain))
    return "".join(parts)


def resolve_figure_asset_rel(bundle: CompendiumBundle, fig: dict[str, Any], lang: str, for_tex: bool = False) -> str:
    raw_asset_obj = fig.get("texAsset", fig["asset"]) if for_tex else fig["asset"]
    asset_name = raw_asset_obj[lang] if isinstance(raw_asset_obj, dict) else str(raw_asset_obj)
    prefix = bundle.config.get("figureAssetPrefix", "").strip("/")
    return f"{prefix}/{asset_name}" if prefix else asset_name


def is_numbered_figure(fig: dict[str, Any]) -> bool:
    if "numbered" in fig:
        return bool(fig["numbered"])
    return bool(fig.get("caption"))


def web_doc_for_chapter(bundle: CompendiumBundle, ch_name: str, sub_idx: int, is_appendix_a: bool, lang: str) -> str:
    if is_appendix_a and bundle.compendium_id == "skill-graph":
        return bundle.bilingual_doc_map["docs/qa-ci/graph-definition-rule-milestone-matrix.md"][lang]
    for wp in bundle.manifest["webPages"]:
        if ch_name not in wp["sources"]:
            continue
        sl = wp.get("subsectionSlice")
        if sl is not None:
            if sl[0] <= max(sub_idx, 0) < sl[1]:
                return wp["paths"][lang]
            continue
        return wp["paths"][lang]
    raise ValueError(f"No web page configured for {ch_name} (sub_idx={sub_idx}) in {bundle.compendium_id}")


def build_ref_map(bundle: CompendiumBundle, lang: str) -> dict[str, RefEntry]:
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
                    is_app_a = bundle.compendium_id == "skill-graph" and node.node_id == "sec:rule-milestones"
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
                fig = bundle.figures[node.fig_id]
                wdoc = web_doc_for_chapter(bundle, ch_name, max(sub_idx_in_ch, 0), in_appendix_a, lang)
                if is_numbered_figure(fig):
                    fig_num += 1
                    ref_map[node.fig_id] = RefEntry(node.fig_id, str(fig_num), wdoc, slugify_id(node.fig_id))
                else:
                    ref_map[node.fig_id] = RefEntry(node.fig_id, "", wdoc, slugify_id(node.fig_id))
            elif isinstance(node, TableNode) and node.caption:
                tab_num += 1
                if node.node_id:
                    wdoc = web_doc_for_chapter(bundle, ch_name, max(sub_idx_in_ch, 0), in_appendix_a, lang)
                    ref_map[node.node_id] = RefEntry(node.node_id, str(tab_num), wdoc, slugify_id(node.node_id))
            elif isinstance(node, (BoxNode, BlockquoteNode)):
                walk(node.children, ch_name, in_appendix_a)

    for ch_name in bundle.manifest["chapters"]:
        walk(bundle.chapters[ch_name][lang], ch_name, False)
    if bundle.ref_map_hook is not None:
        bundle.ref_map_hook(bundle, lang, ref_map)
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


def parse_tex_colspec(cols: str | None, ncols: int, longtable: bool = False) -> str:
    if not cols:
        parts = ["X"] * ncols
    else:
        raw_parts = [p.strip() for p in cols.split(",") if p.strip()]
        usable_mm = max(60.0, 154.0 - 4.3 * max(0, len(raw_parts) - 1))
        if raw_parts and all(p.endswith("%") for p in raw_parts):
            pcts = [float(p[:-1].strip()) for p in raw_parts]
            total_pct = sum(pcts) or 100.0
            parts = [f"{usable_mm * (pct / total_pct):.1f}mm" for pct in pcts[:-1]] + ["X"]
        else:
            parts = [
                f"{usable_mm * (float(p[:-1].strip()) / 100.0):.1f}mm" if p.endswith("%") else p
                for p in raw_parts
            ]
    if not longtable or "X" not in parts:
        mapped = ["X" if p == "X" else f"P{{{p}}}" for p in parts]
        return "@{}" + "".join(mapped) + "@{}"
    x_count = parts.count("X")
    fixed_terms = "".join(f"-{p}" for p in parts if p != "X")
    gap_count = 2 * max(0, len(parts) - 1)
    gap_term = f"-{gap_count}\\tabcolsep" if gap_count > 0 else ""
    if x_count == 1:
        x_spec = rf"P{{\dimexpr\linewidth{fixed_terms}{gap_term}\relax}}"
    else:
        x_spec = rf"P{{\dimexpr(\linewidth{fixed_terms}{gap_term})/{x_count}\relax}}"
    mapped = [x_spec if p == "X" else f"P{{{p}}}" for p in parts]
    return "@{}" + "".join(mapped) + "@{}"


def has_extended_tex_nodes(bundle: CompendiumBundle) -> bool:
    def check(nodes: list[Any]) -> bool:
        for n in nodes:
            if isinstance(n, (CodeBlockNode, BlockquoteNode)):
                return True
            if isinstance(n, BoxNode):
                if n.kind in ("note", "warning") or check(n.children):
                    return True
        return False

    return any(
        check(bundle.chapters[ch][lang])
        for ch in bundle.manifest["chapters"]
        for lang in bundle.manifest.get("languages", ["de", "en"])
    )


def prepare_svg_assets_for_tex(bundle: CompendiumBundle, asset_root: Path, build_root: Path) -> Path | None:
    svg_out_dir = build_root / "svg-pdf"
    rsvg: str | None = None
    needed = False
    for fid, fig in bundle.figures.items():
        for lang in bundle.manifest.get("languages", ["de", "en"]):
            rel = resolve_figure_asset_rel(bundle, fig, lang, for_tex=True)
            if not rel.lower().endswith(".svg"):
                continue
            needed = True
            src_svg = asset_root / rel
            if not src_svg.is_file():
                raise FileNotFoundError(f"Missing SVG figure asset for {fid} ({lang}): {src_svg}")
            if rsvg is None:
                rsvg = shutil.which("rsvg-convert")
                if not rsvg:
                    raise SystemExit(f"rsvg-convert is required to render SVG figure {rel} for LuaLaTeX.")
            svg_out_dir.mkdir(parents=True, exist_ok=True)
            safe_stem = re.sub(r"[^A-Za-z0-9._-]+", "_", rel[: -len(".svg")])
            out_name = f"{safe_stem}.pdf"
            out_pdf = svg_out_dir / out_name
            if not out_pdf.is_file() or out_pdf.stat().st_mtime < src_svg.stat().st_mtime:
                subprocess.run([rsvg, "-f", "pdf", "-o", str(out_pdf), str(src_svg)], check=True)
            bundle.svg_pdf_cache[f"{fid}:{lang}"] = out_name
    return svg_out_dir if needed else None


def render_ast_tex(nodes: list[Any], bundle: CompendiumBundle, lang: str, ref_map: dict[str, RefEntry]) -> str:
    ri = lambda s: render_inline(s, lang, "tex", "", ref_map, bundle.repo_root, bundle.bilingual_doc_map)
    out: list[str] = []
    for idx, node in enumerate(nodes):
        if isinstance(node, BoxNode) and node.kind == "titlebox":
            continue
        if isinstance(node, HeadingNode):
            t_str = ri(node.title)
            lbl = rf"\label{{{node.node_id}}}" if (node.node_id and not node.unnumbered) else ""
            if node.level == 2:
                if node.unnumbered:
                    if bundle.compendium_id == "skill-graph" and not node.short_mark:
                        short_mark = "Leserführung" if lang == "de" else "Reader's Guide"
                    else:
                        short_mark = tex_escape_plain(node.short_mark or node.title, lang)
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
        elif isinstance(node, BoxNode) and node.kind in ("principle", "note", "warning"):
            body = render_ast_tex(node.children, bundle, lang, ref_map).strip()
            env_name = {
                "principle": "principle",
                "note": "notecallout",
                "warning": "warningcallout",
            }[node.kind]
            title_str = ri(node.title) if node.title else (
                {"note": "Hinweis", "warning": "Wichtig"}.get(node.kind, "")
                if lang == "de"
                else {"note": "Note", "warning": "Important"}.get(node.kind, "")
            )
            out.extend([rf"\begin{{{env_name}}}{{{title_str}}}", body, rf"\end{{{env_name}}}", ""])
        elif isinstance(node, CodeBlockNode):
            escaped_lines = [tex_escape_codeblock_line(ln) for ln in node.code.splitlines()]
            body_tex = "\\\\\n".join(escaped_lines) if escaped_lines else r"\strut{}"
            out.extend([
                r"\begin{codebox}",
                r"{\footnotesize\ttfamily\raggedright",
                body_tex,
                r"\par}",
                r"\end{codebox}",
                "",
            ])
        elif isinstance(node, BlockquoteNode):
            body = render_ast_tex(node.children, bundle, lang, ref_map).strip()
            out.extend([r"\begin{quote}", body, r"\end{quote}", ""])
        elif isinstance(node, ListNode):
            env = "enumerate" if node.ordered else "itemize"
            out.append(rf"\begin{{{env}}}")
            for r_item in node.rich_items:
                if r_item.sub_items:
                    sub_env = "enumerate" if r_item.sub_ordered else "itemize"
                    out.append(rf"\item {ri(r_item.text)}")
                    out.append(rf"  \begin{{{sub_env}}}")
                    for sub in r_item.sub_items:
                        out.append(rf"  \item {ri(sub)}")
                    out.append(rf"  \end{{{sub_env}}}")
                else:
                    out.append(rf"\item {ri(r_item.text)}")
            out.extend([rf"\end{{{env}}}", ""])
        elif isinstance(node, DescriptionNode):
            out.append(r"\begin{description}")
            for lead, body in node.items:
                out.append(rf"\item[{ri(lead)}] {ri(body)}")
            out.extend([r"\end{description}", ""])
        elif isinstance(node, FigureNode):
            fig = bundle.figures[node.fig_id]
            tex_asset = bundle.svg_pdf_cache.get(f"{node.fig_id}:{lang}") or resolve_figure_asset_rel(
                bundle, fig, lang, for_tex=True
            )
            w = fig.get("texWidth") or r"\linewidth"
            h = fig.get("texHeight")
            opts = f"width={w},height={h},keepaspectratio" if h else f"width={w}"
            if is_numbered_figure(fig):
                cap = ri(fig["caption"][lang])
                out.extend([
                    r"\begin{figure}[htbp]\centering",
                    rf"\includegraphics[{opts}]{{{tex_asset}}}",
                    rf"\caption[\csname title{node.fig_id}\endcsname]{{{cap}}}\label{{{node.fig_id}}}",
                    r"\end{figure}",
                    "",
                ])
            else:
                cap_raw = fig.get("caption", {}).get(lang, "") if isinstance(fig.get("caption"), dict) else ""
                cap_line = rf"\par\smallskip{{\small\itshape {ri(cap_raw)}\par}}" if cap_raw else ""
                out.extend([
                    r"\begin{center}",
                    rf"\includegraphics[{opts}]{{{tex_asset}}}{cap_line}",
                    r"\end{center}",
                    "",
                ])
        elif isinstance(node, TableNode):
            colspec = parse_tex_colspec(node.cols, len(node.headers), longtable=node.longtable)
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
            if bundle.include_renderer is None:
                raise ValueError(f"No include_renderer configured for ::include{{block=\"{node.block}\"}}")
            out.extend([bundle.include_renderer(node.block, bundle, lang, "tex", "", ref_map), ""])
        elif isinstance(node, SourcesNode):
            out.extend([rf"\sources{{{ri(node.text)}}}", ""])
        elif isinstance(node, ThematicBreakNode):
            if idx < len(nodes) - 1 and not (isinstance(nodes[idx + 1], HeadingNode) and nodes[idx + 1].level == 2):
                out.extend([r"\par\medskip{\color{muted!35}\hrule height 0.4pt}\medskip", ""])
    return "\n".join(out)


SKILL_GRAPH_MATH_PREAMBLE = [
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
]


def render_math_macros_preamble(bundle: CompendiumBundle) -> list[str]:
    if bundle.compendium_id == "skill-graph":
        return list(SKILL_GRAPH_MATH_PREAMBLE)
    macros = bundle.manifest.get("mathMacros", {})
    lines: list[str] = []
    for name, spec in macros.items():
        if isinstance(spec, list) and len(spec) == 2:
            lines.append(rf"\newcommand{{\{name}}}[{spec[1]}]{{{spec[0]}}}")
        else:
            lines.append(rf"\newcommand{{\{name}}}{{{spec}}}")
    return lines


def emit_tex_document(
    bundle: CompendiumBundle,
    lang: str,
    ref_map: dict[str, RefEntry],
    asset_root: Path,
    svg_pdf_dir: Path | None = None,
) -> str:
    pdf_cfg = bundle.manifest["pdf"][lang]
    badges = pdf_cfg.get("ampelBadges")
    ri = lambda s: render_inline(s, lang, "tex", "", ref_map, bundle.repo_root, bundle.bilingual_doc_map)
    first_ch = bundle.manifest["chapters"][0]
    has_dedicated_frontmatter = first_ch == "00-frontmatter"
    fm_nodes = bundle.chapters[first_ch][lang] if has_dedicated_frontmatter else []
    titlebox = next((n for n in fm_nodes if isinstance(n, BoxNode) and n.kind == "titlebox"), None)
    if has_dedicated_frontmatter and titlebox is None and bundle.compendium_id == "skill-graph":
        raise ValueError(f"00-frontmatter.{lang}.md missing :::titlebox")

    gfx_dirs = [asset_root.as_posix().rstrip("/") + "/"]
    if svg_pdf_dir is not None:
        gfx_dirs.append(svg_pdf_dir.as_posix().rstrip("/") + "/")
    gfx_spec = "".join(f"{{{d}}}" for d in gfx_dirs)

    numbered_figs = {
        fid: f for fid, f in bundle.figures.items() if fid != "fig:title" and is_numbered_figure(f)
    }
    fig_titles = [
        rf"\expandafter\def\csname title{fid}\endcsname{{{ri(f['shortTitle'][lang])}}}"
        for fid, f in numbered_figs.items()
    ]
    title_lines = r"\par ".join(tex_escape_plain(ln, lang) for ln in pdf_cfg["title"].splitlines()) + r"\par"
    sub_lines = r"\par ".join(tex_escape_plain(ln, lang) for ln in pdf_cfg["subtitle"].splitlines()) + r"\par"
    foot_lines = r"\par ".join(tex_escape_plain(ln, lang) for ln in pdf_cfg["copyrightFooter"])

    source_rel = bundle.config["sourceDir"].rstrip("/") + "/"
    extended_boxes: list[str] = []
    if has_extended_tex_nodes(bundle):
        extended_boxes = [
            r"\definecolor{notebg}{HTML}{EEF4FF}",
            r"\definecolor{noteborder}{HTML}{3B6EC2}",
            r"\definecolor{codebg}{HTML}{F6F8FA}",
            r"\definecolor{codeframe}{HTML}{D0D7DE}",
            r"\newtcolorbox{notecallout}[1]{breakable,colback=notebg,colframe=noteborder,boxrule=.5pt,arc=1mm,left=3mm,right=3mm,top=2mm,bottom=2mm,title={#1},fonttitle=\sffamily\bfseries}",
            r"\newtcolorbox{warningcallout}[1]{breakable,colback=ampelamberbg,colframe=ampelamber,boxrule=.5pt,arc=1mm,left=3mm,right=3mm,top=2mm,bottom=2mm,title={#1},fonttitle=\sffamily\bfseries}",
            r"\newtcolorbox{codebox}{breakable,colback=codebg,colframe=codeframe,boxrule=.45pt,arc=1mm,left=3mm,right=3mm,top=2mm,bottom=2mm}",
        ]

    ampel_lines: list[str] = []
    if badges:
        ampel_lines = [
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
        ]

    title_fig_lines: list[str] = []
    if "fig:title" in bundle.figures:
        t_fig = bundle.figures["fig:title"]
        t_asset = bundle.svg_pdf_cache.get(f"fig:title:{lang}") or resolve_figure_asset_rel(
            bundle, t_fig, lang, for_tex=True
        )
        t_h = t_fig.get("texHeight") or r".16\textheight"
        title_fig_lines = [
            r"\vspace{6mm}",
            rf"\begin{{center}}\includegraphics[width=\linewidth,height={t_h},keepaspectratio]{{{t_asset}}}\end{{center}}",
        ]

    titlebox_lines: list[str] = []
    if titlebox is not None:
        titlebox_tex = render_ast_tex(titlebox.children, bundle, lang, ref_map).strip()
        titlebox_lines = [
            rf"\begin{{principle}}{{{ri(titlebox.title)}}}",
            titlebox_tex,
            r"\end{principle}",
            r"\vspace{6mm}",
        ]
    elif pdf_cfg.get("abstractBox"):
        ab = pdf_cfg["abstractBox"]
        titlebox_lines = [
            rf"\begin{{principle}}{{{ri(ab['title'])}}}",
            ri(ab["body"]),
            r"\end{principle}",
            r"\vspace{6mm}",
        ]

    toc_lines = [
        r"\clearpage",
        rf"\ohead{{{tex_escape_plain(pdf_cfg['tocHeader'], lang)}}}",
        r"\tableofcontents",
    ]
    if numbered_figs:
        toc_lines.extend([r"\bigskip", r"\listoffigures"])

    spdx_id = bundle.manifest.get("license", {}).get("spdxHeader", "Apache-2.0")
    lines = [
        f"% SPDX-License-Identifier: {spdx_id}",
        f"% Generated artifact from {source_rel}. Do not edit manually.",
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
        rf"\graphicspath{{{gfx_spec}}}",
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
        # A bold three-digit page number is wider than the default 1.55em box of a
        # contents entry; 2em still lies inside the right margin (\@tocrmarg, 2.55em).
        r"\makeatletter\renewcommand*{\@pnumwidth}{2em}\makeatother",
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
        *render_math_macros_preamble(bundle),
        rf"\newcommand{{\srcref}}[2]{{\href{{{REPO_BLOB_PREFIX}#1}}{{#2}}}}",
        rf"\newcommand{{\sources}}[1]{{\par\medskip{{\small\noindent\textbf{{{tex_escape_plain(pdf_cfg.get('sourcesLabel', 'Quellen.' if lang == 'de' else 'Sources.'), lang)}}}~#1\par}}}}",
        r"\newtcolorbox{principle}[1]{breakable,colback=lightteal,colframe=teal,boxrule=.5pt,arc=1mm,left=3mm,right=3mm,top=2mm,bottom=2mm,title={#1},fonttitle=\sffamily\bfseries}",
        *extended_boxes,
        *ampel_lines,
        *fig_titles,
        r"\begin{document}",
        r"\begin{titlepage}",
        r"\vspace*{6mm}",
        rf"{{\sffamily\large\color{{teal}} {tex_escape_plain(pdf_cfg['kicker'], lang)}\par}}",
        r"\vspace{7mm}",
        rf"{{\sffamily\bfseries\fontsize{{32}}{{37}}\selectfont\color{{ink}} {title_lines}}}",
        r"\vspace{7mm}",
        rf"{{\Large {sub_lines}}}",
        *title_fig_lines,
        r"\vfill",
        *titlebox_lines,
        rf"{{\small {foot_lines}}}",
        r"\end{titlepage}",
    ]
    if has_dedicated_frontmatter:
        fm_rendered = render_ast_tex(fm_nodes, bundle, lang, ref_map)
        if fm_rendered.strip():
            lines.append(fm_rendered)
        body_chapters = bundle.manifest["chapters"][1:]
    else:
        body_chapters = bundle.manifest["chapters"]

    lines.extend(toc_lines)
    appendix_chapters = set(bundle.manifest.get("appendixChapters", ["06-appendices"]))
    appendix_emitted = False
    for ch_name in body_chapters:
        p_head = pdf_cfg.get("partHeaders", {}).get(ch_name, "")
        lines.append(r"\clearpage")
        if ch_name in appendix_chapters and not appendix_emitted:
            lines.append(r"\appendix")
            appendix_emitted = True
        if p_head:
            lines.append(rf"\ohead{{{tex_escape_plain(p_head, lang)}}}")
        lines.append(render_ast_tex(bundle.chapters[ch_name][lang], bundle, lang, ref_map))
    lines.append(r"\end{document}")
    return "\n".join(lines) + "\n"


def render_ast_web(
    nodes: list[Any],
    bundle: CompendiumBundle,
    lang: str,
    wdoc: str,
    ref_map: dict[str, RefEntry],
    public_doc_style: bool = False,
    number_headings: bool = True,
) -> str:
    ri = lambda s: render_inline(s, lang, "web", wdoc, ref_map, bundle.repo_root, bundle.bilingual_doc_map)
    out: list[str] = []
    for node in nodes:
        if isinstance(node, BoxNode) and node.kind in ("titlebox", "principle", "note", "warning"):
            body = render_ast_web(
                node.children, bundle, lang, wdoc, ref_map, public_doc_style=public_doc_style, number_headings=number_headings
            ).strip()
            if public_doc_style:
                title_prefix = f"**{ri(node.title)}**\n>\n" if node.title else ""
                q_lines = "\n".join(f"> {ln}" if ln else ">" for ln in body.splitlines())
                out.extend([f"> {title_prefix}{q_lines[2:]}" if title_prefix else q_lines, ""])
            else:
                adm_kind = {
                    "titlebox": "abstract",
                    "principle": "abstract",
                    "note": "info",
                    "warning": "warning",
                }[node.kind]
                t_str = ri(node.title) if node.title else (
                    {"note": "Hinweis", "warning": "Wichtig"}.get(node.kind, "")
                    if lang == "de"
                    else {"note": "Note", "warning": "Important"}.get(node.kind, "")
                )
                indented = "\n".join(f"    {ln}" if ln else "" for ln in body.splitlines())
                out.extend([f'!!! {adm_kind} "{t_str}"', indented, ""])
        elif isinstance(node, HeadingNode):
            if not public_doc_style:
                for anc in node.anchors:
                    out.append(f'<a id="{anc}"></a>')
                if node.node_id:
                    out.append(f'<a id="{slugify_id(node.node_id)}"></a>')
            prefix = ""
            if number_headings and node.node_id and not node.unnumbered and node.node_id in ref_map:
                num = ref_map[node.node_id].number
                if public_doc_style:
                    if node.appendix:
                        prefix = "Anhang: " if lang == "de" else "Appendix: "
                    elif "." in num:
                        prefix = f"{num} "
                    else:
                        prefix = f"{num}. "
                else:
                    prefix = (
                        f"Anhang {num} — "
                        if (node.appendix and lang == "de")
                        else (f"Appendix {num} — " if node.appendix else f"{num}. ")
                    )
            if node.level == 4 and bundle.compendium_id == "skill-graph":
                out.extend([f"**{ri(node.title)}**", ""])
            elif node.level == 4 and not public_doc_style and not bundle.manifest.get("useMarkdownH4", True):
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
        elif isinstance(node, CodeBlockNode):
            fence = "````" if "```" in node.code else "```"
            out.extend([f"{fence}{node.language}", node.code, fence, ""])
        elif isinstance(node, BlockquoteNode):
            body = render_ast_web(
                node.children, bundle, lang, wdoc, ref_map, public_doc_style=public_doc_style, number_headings=number_headings
            ).strip()
            q_lines = [f"> {ln}" if ln else ">" for ln in body.splitlines()]
            out.extend([*q_lines, ""])
        elif isinstance(node, ListNode):
            for idx, r_item in enumerate(node.rich_items, 1):
                bullet = f"{idx}." if node.ordered else "-"
                out.append(f"{bullet} {ri(r_item.text)}")
                for s_idx, sub in enumerate(r_item.sub_items, 1):
                    s_bullet = f"{s_idx}." if r_item.sub_ordered else "-"
                    out.append(f"  {s_bullet} {ri(sub)}")
            out.append("")
        elif isinstance(node, DescriptionNode):
            for lead, body in node.items:
                out.append(f"- **{ri(lead)}** {ri(body)}")
            out.append("")
        elif isinstance(node, FigureNode):
            fig = bundle.figures[node.fig_id]
            asset_rel = resolve_figure_asset_rel(bundle, fig, lang, for_tex=False)
            asset_doc = f"{bundle.config['assetRoot'].rstrip('/')}/{asset_rel}"
            img_href = relative_web_link(wdoc, asset_doc)
            alt_obj = fig["alt"]
            alt = web_plain(alt_obj[lang] if isinstance(alt_obj, dict) else str(alt_obj))
            web_w = fig.get("webWidth")
            title_attr = f' "width={web_w}"' if web_w else ""
            if is_numbered_figure(fig):
                num = ref_map[node.fig_id].number
                fig_lbl = f"Abbildung {num}" if lang == "de" else f"Figure {num}"
                short_t = ri(fig["shortTitle"][lang])
                cap = ri(fig["caption"][lang])
                if not public_doc_style:
                    out.extend([f'<a id="{slugify_id(node.fig_id)}"></a>', ""])
                out.extend([
                    f"![{alt}]({img_href}{title_attr})",
                    "",
                    f"*{fig_lbl} — {short_t}:* {cap}",
                    "",
                ])
            else:
                cap_raw = fig.get("caption", {}).get(lang, "") if isinstance(fig.get("caption"), dict) else ""
                if cap_raw:
                    out.extend([f"![{alt}]({img_href}{title_attr})", "", f"*{ri(cap_raw)}*", ""])
                else:
                    out.extend([f"![{alt}]({img_href}{title_attr})", ""])
        elif isinstance(node, TableNode):
            if node.node_id and not public_doc_style:
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
            if bundle.include_renderer is None:
                raise ValueError(f"No include_renderer configured for ::include{{block=\"{node.block}\"}}")
            out.extend([bundle.include_renderer(node.block, bundle, lang, "web", wdoc, ref_map), ""])
        elif isinstance(node, SourcesNode):
            src_lbl = "Quellen" if lang == "de" else "Sources"
            out.extend([f"*{src_lbl}:* {ri(node.text)}", ""])
        elif isinstance(node, ThematicBreakNode):
            out.extend(["---", ""])
    return "\n".join(out)


SKILL_GRAPH_NAV_LABELS = {
    "graph-definition": {"en": "§§1–5 Core", "de": "§§1–5 Kern"},
    "context-and-views": {"en": "§§6–10 Context", "de": "§§6–10 Kontext"},
    "learning-units": {"en": "§§11.1–11.4 Units", "de": "§§11.1–11.4 Lerneinheiten"},
    "learning-unit-progression": {"en": "§11.5 Progression", "de": "§11.5 Einheitsfolge"},
    "planning-and-budget": {"en": "§12 Planning", "de": "§12 Planung"},
    "assessment-gated-completion": {"en": "§13 Implicit Mastery", "de": "§13 Implizite Beherrschung"},
    "compendium-appendix": {"en": "Appendices B–F", "de": "Anhänge B–F"},
    "rule-milestone-matrix": {"en": "Appendix A (Rules & Ampel)", "de": "Anhang A (Regeln & Ampel)"},
}


def emit_web_pages(bundle: CompendiumBundle, ref_maps: dict[str, dict[str, RefEntry]], check_only: bool) -> list[str]:
    diffs: list[str] = []
    web_header_style = bundle.manifest.get("webHeaderStyle", "compendium")
    public_doc_style = web_header_style == "public-document"
    number_headings = bool(bundle.manifest.get("numberedSectionsInWeb", not public_doc_style))
    generated_by = bundle.config["generatedBy"]
    regen_cmd = bundle.config["regenerateWebCommand"]
    default_source_of_truth = bundle.config["sourceDir"].rstrip("/") + "/"
    pdf_de_primary = bundle.manifest["pdf"]["de"]["outputPaths"][0]
    pdf_en_primary = bundle.manifest["pdf"]["en"]["outputPaths"][0]

    for wp in bundle.manifest["webPages"]:
        wp_id = wp["id"]
        sources_list = wp.get("sourceOfTruth") or (
            ["docs/concept/skill-graph/source/rules-and-gates.json"]
            if bundle.compendium_id == "skill-graph" and wp["sources"] == ["rules-and-gates"]
            else [default_source_of_truth]
        )
        for lang in ("en", "de"):
            if lang not in wp["paths"]:
                continue
            wdoc = wp["paths"][lang]
            if public_doc_style:
                header_lines = [f"# {wp['titles'][lang]}", ""]
            else:
                other_lang = "de" if lang == "en" else "en"
                other_href = relative_web_link(wdoc, wp["paths"][other_lang])
                pdf_de_href = relative_web_link(wdoc, pdf_de_primary)
                pdf_en_href = relative_web_link(wdoc, pdf_en_primary)
                lang_bar = (
                    f"**Language / Sprache:** **English (EN)** · [Deutsch (DE)]({other_href}) "
                    f"| **PDF:** [English PDF]({pdf_en_href}) · [Deutsches PDF]({pdf_de_href})"
                    if lang == "en"
                    else f"**Sprache / Language:** **Deutsch (DE)** · [English (EN)]({other_href}) "
                    f"| **PDF:** [Deutsches PDF]({pdf_de_href}) · [English PDF]({pdf_en_href})"
                )
                part_links: list[str] = []
                if len(bundle.manifest["webPages"]) > 1:
                    for nav_wp in bundle.manifest["webPages"]:
                        nav_lbl_map = nav_wp.get("navLabels") or SKILL_GRAPH_NAV_LABELS.get(nav_wp["id"])
                        lbl = nav_lbl_map[lang] if nav_lbl_map else nav_wp["titles"][lang]
                        if nav_wp["id"] == wp_id:
                            part_links.append(f"**{lbl}**")
                        else:
                            part_links.append(f"[{lbl}]({relative_web_link(wdoc, nav_wp['paths'][lang])})")
                nav_lines: list[str] = []
                if part_links:
                    nav_bar = ("**Kompendium:** " if lang == "de" else "**Compendium:** ") + " · ".join(part_links)
                    nav_lines = [nav_bar, ""]

                header_lines = [
                    f"# {wp['titles'][lang]}",
                    "",
                    "> Generated artifact. Do not edit manually.",
                    ">",
                    f"> Generated by: `{generated_by}`",
                    f"> Regenerate with: `{regen_cmd}`",
                    *[f"> Source of truth: `{s}`" for s in sources_list],
                    "",
                    lang_bar,
                    "",
                    *nav_lines,
                    "---",
                    "",
                ]

            custom_body = (
                bundle.web_custom_source_renderer(wp["sources"], bundle, lang, wdoc, ref_maps[lang])
                if bundle.web_custom_source_renderer is not None
                else None
            )
            if custom_body is not None:
                body = custom_body
            else:
                chunks: list[str] = []
                for ch_name in wp["sources"]:
                    sliced = slice_chapter_for_web(
                        bundle.chapters[ch_name][lang],
                        wp.get("subsectionSlice"),
                        bool(wp.get("skipAppendixAInWebBody", False)),
                    )
                    if ch_name == "00-frontmatter" and "fig:title" in bundle.figures:
                        ref_maps[lang]["fig:title"] = RefEntry("fig:title", "0", wdoc, "fig-title")
                        t_rel = resolve_figure_asset_rel(bundle, bundle.figures["fig:title"], lang, for_tex=False)
                        title_img = relative_web_link(
                            wdoc, f"{bundle.config['assetRoot'].rstrip('/')}/{t_rel}"
                        )
                        title_alt = web_plain(bundle.figures["fig:title"]["alt"][lang])
                        chunks.append(f"![{title_alt}]({title_img})\n")
                    chunks.append(
                        render_ast_web(
                            sliced,
                            bundle,
                            lang,
                            wdoc,
                            ref_maps[lang],
                            public_doc_style=public_doc_style,
                            number_headings=number_headings,
                        ).strip()
                    )
                if bundle.web_post_hook is not None:
                    extra_chunk = bundle.web_post_hook(wp, bundle, lang, wdoc)
                    if extra_chunk:
                        chunks.append(extra_chunk.strip())
                body = "\n\n".join(c for c in chunks if c)

            content = ("\n".join(header_lines) + body.strip() + "\n").encode("utf-8")
            full_repo_present = (bundle.repo_root / "app/package.json").is_file()
            target_paths = [wdoc, *wp.get("mirrorPaths", {}).get(lang, [])]
            for target_rel in target_paths:
                if not full_repo_present and not target_rel.startswith("docs/"):
                    continue
                abs_path = bundle.repo_root / target_rel
                if check_only:
                    if not abs_path.is_file() or abs_path.read_bytes() != content:
                        diffs.append(target_rel)
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
