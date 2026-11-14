"""Extension hooks for the SkillPilot Graph Definition compendium (145 rules, Ampel, appendices).

SPDX-License-Identifier: Apache-2.0
"""

from __future__ import annotations

from pathlib import Path
import re
import subprocess
import sys
from typing import Any

from ..ast_and_parser import IncludeNode, RefEntry
from ..render import CompendiumBundle, relative_web_link, render_inline, tex_escape_code, tex_escape_plain

AMPEL_TEX_CMD = {"hart": r"\ampelhart", "teil": r"\ampelteil", "offen": r"\ampeloffen", "opt": r"\ampelopt"}


def extra_json_files() -> list[str]:
    return ["rules-and-gates.json", "glossary-and-symbols.json", "implementation-status.json"]


def verify_extra_data(extra_json: dict[str, dict[str, Any]], errors: list[str]) -> None:
    rules_data = extra_json["rules-and-gates.json"]
    rules = rules_data.get("rules", [])
    if len(rules) != 145:
        errors.append(f"rules-and-gates.json: expected 145 rules, got {len(rules)}")
    counts = {"hart": 0, "teil": 0, "offen": 0, "opt": 0}
    for r in rules:
        counts[r["ampel"]] = counts.get(r["ampel"], 0) + 1
    if counts != {"hart": 12, "teil": 50, "offen": 55, "opt": 28}:
        errors.append(f"rules-and-gates.json: unexpected Ampel distribution: {counts}")
    states = rules_data.get("ampelSection", {}).get("states", [])
    state_counts = {state["key"]: state["count"] for state in states}
    if len(states) != len(counts) or state_counts != counts:
        errors.append("rules-and-gates.json: Ampel state counts do not match the rule rows")
    for lang in ("de", "en"):
        declared_summary = rules_data.get("ampelSection", {}).get("summary", {}).get(lang, "")
        summary_counts = {badge: int(count) for count, badge in re.findall(r"(\d+) `([^`]+)`", declared_summary)}
        expected_summary = {state["badge"][lang]: counts.get(state["key"]) for state in states}
        if summary_counts != expected_summary:
            errors.append(f"rules-and-gates.json: {lang} Ampel summary does not match the rule rows")


def ref_map_hook(bundle: CompendiumBundle, lang: str, ref_map: dict[str, RefEntry]) -> None:
    for ch_name in bundle.manifest["chapters"]:
        for node in bundle.chapters[ch_name][lang]:
            if isinstance(node, IncludeNode) and node.block == "rule-milestones-appendix":
                matrix_doc = bundle.bilingual_doc_map["docs/qa-ci/graph-definition-rule-milestone-matrix.md"][lang]
                ref_map["sec:rule-ampel"] = RefEntry("sec:rule-ampel", "A.1", matrix_doc, "sec-rule-ampel")
                ref_map["sec:rule-code-legend"] = RefEntry("sec:rule-code-legend", "A.2", matrix_doc, "sec-rule-code-legend")


def render_frontmatter_distinctions(
    bundle: CompendiumBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str:
    glossary_data = bundle.extra_json["glossary-and-symbols.json"]
    rows = glossary_data["frontmatterDistinctions"]
    ri = lambda s, m=mode: render_inline(s, lang, m, wdoc, ref_map, bundle.repo_root, bundle.bilingual_doc_map)
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
            lines.append(f"{ri(r['term'][lang], 'tex')} & {ri(r['meaning'][lang], 'tex')}\\\\")
        lines.extend([
            r"\bottomrule",
            r"\end{longtable}",
            r"\addtocounter{table}{-1}",
            r"\endgroup",
        ])
        return "\n".join(lines)
    lines = [f"| {h_term} | {h_mean} |", "| --- | --- |"]
    for r in rows:
        lines.append(f"| {ri(r['term'][lang], 'web')} | {ri(r['meaning'][lang], 'web')} |")
    return "\n".join(lines)


def render_glossary_appendix(
    bundle: CompendiumBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str:
    gd = bundle.extra_json["glossary-and-symbols.json"]
    ri = lambda s: render_inline(s, lang, mode, wdoc, ref_map, bundle.repo_root, bundle.bilingual_doc_map)
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


def render_implementation_appendix(
    bundle: CompendiumBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str:
    im = bundle.extra_json["implementation-status.json"]
    ri = lambda s: render_inline(s, lang, mode, wdoc, ref_map, bundle.repo_root, bundle.bilingual_doc_map)
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


def render_sources_appendix(
    bundle: CompendiumBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str:
    im = bundle.extra_json["implementation-status.json"]
    ri = lambda s: render_inline(s, lang, mode, wdoc, ref_map, bundle.repo_root, bundle.bilingual_doc_map)
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


def render_rules_and_gates_tex(
    bundle: CompendiumBundle, lang: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str:
    rd = bundle.extra_json["rules-and-gates.json"]
    ri = lambda s: render_inline(s, lang, "tex", wdoc, ref_map, bundle.repo_root, bundle.bilingual_doc_map)
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
        r"\begin{longtable}{@{}P{28mm}P{24mm}@{ }P{96mm}@{}}".replace("@{ }", ""),
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


def render_rules_and_gates_web(
    bundle: CompendiumBundle, lang: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str:
    rd = bundle.extra_json["rules-and-gates.json"]
    ri = lambda s: render_inline(s, lang, "web", wdoc, ref_map, bundle.repo_root, bundle.bilingual_doc_map)
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


def render_include(
    block: str, bundle: CompendiumBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str:
    if block == "frontmatter-distinctions":
        return render_frontmatter_distinctions(bundle, lang, mode, wdoc, ref_map)
    if block == "rule-milestones-appendix":
        return (
            render_rules_and_gates_tex(bundle, lang, wdoc, ref_map)
            if mode == "tex"
            else render_rules_and_gates_web(bundle, lang, wdoc, ref_map)
        )
    if block == "implementation-appendix":
        return render_implementation_appendix(bundle, lang, mode, wdoc, ref_map)
    if block == "glossary-appendix":
        return render_glossary_appendix(bundle, lang, mode, wdoc, ref_map)
    if block == "sources-appendix":
        return render_sources_appendix(bundle, lang, mode, wdoc, ref_map)
    raise ValueError(f"Unknown ::include block '{block}' in skill-graph")


def web_custom_source_renderer(
    sources: list[str], bundle: CompendiumBundle, lang: str, wdoc: str, ref_map: dict[str, RefEntry]
) -> str | None:
    if sources == ["rules-and-gates"]:
        return render_rules_and_gates_web(bundle, lang, wdoc, ref_map)
    return None


def web_post_hook(wp: dict[str, Any], bundle: CompendiumBundle, lang: str, wdoc: str) -> str | None:
    if not wp.get("includePlanningCrossRefStub"):
        return None
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


def run_pre_pdf_hooks(repo_root: Path, run_model_check: bool, run_diagrams: bool, check_only: bool) -> None:
    if run_model_check:
        subprocess.run(
            [sys.executable, str(repo_root / "docs/concept/skill-graph/latex/check-assessment-model.py")],
            check=True,
        )
    if run_diagrams:
        diag_cmd = [
            sys.executable,
            str(repo_root / "docs/concept/skill-graph/latex/generate-completion-diagrams.py"),
            "--lang",
            "all",
        ]
        if check_only:
            diag_cmd.append("--check")
        subprocess.run(diag_cmd, check=True)


def extra_input_paths(repo_root: Path) -> list[Path]:
    return [
        *(repo_root / "docs/concept/skill-graph/assets/graph-definition").glob("*.png"),
        repo_root / "docs/concept/skill-graph/build_spec.py",
        repo_root / "docs/concept/skill-graph/latex/check-assessment-model.py",
        repo_root / "docs/concept/skill-graph/latex/generate-completion-diagrams.py",
    ]


def generated_diagram_binaries(bundle: CompendiumBundle) -> list[str]:
    generated_pngs: list[str] = []
    for f in bundle.figures.values():
        for lang in ("de", "en"):
            asset = f["asset"][lang]
            if asset.endswith(f".{lang}.png"):
                rel = f"docs/concept/skill-graph/assets/graph-definition/{asset}"
                if rel not in generated_pngs:
                    generated_pngs.append(rel)
                stem_alias = f"docs/concept/skill-graph/assets/graph-definition/{asset[: -len(f'.{lang}.png')]}.png"
                if stem_alias not in generated_pngs:
                    generated_pngs.append(stem_alias)
    return generated_pngs
