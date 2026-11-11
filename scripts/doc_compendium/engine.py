"""Multi-compendium orchestration, verification, LaTeX PDF compilation, and MkDocs bilingual map.

SPDX-License-Identifier: Apache-2.0
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
from typing import Any

from .ast_and_parser import (
    FORBIDDEN_RAW_TEX_RE,
    atomic_write,
    check_terminology_in_text,
    collect_repo_paths,
    digest_bytes,
    digest_file,
    extract_skeleton,
    parse_blocks,
    scrub_math_and_code,
)
from .extensions import skill_graph as skill_graph_ext
from .render import (
    CompendiumBundle,
    build_ref_map,
    emit_tex_document,
    emit_web_pages,
    log_problems,
    prepare_svg_assets_for_tex,
)


def load_compendia_registry(repo_root: Path) -> dict[str, Any]:
    reg_path = repo_root / "docs/compendia.json"
    return json.loads(reg_path.read_text(encoding="utf-8"))


def build_global_bilingual_doc_map(repo_root: Path, registry: dict[str, Any]) -> dict[str, dict[str, str]]:
    mapping: dict[str, dict[str, str]] = {}
    for entry in registry.get("compendia", []):
        manifest_path = repo_root / entry["manifestPath"]
        if not manifest_path.is_file():
            continue
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        for wp in manifest.get("webPages", []):
            paths = wp.get("paths", {})
            if "de" in paths and "en" in paths:
                pair = {"de": paths["de"], "en": paths["en"]}
                mapping[paths["de"]] = pair
                mapping[paths["en"]] = pair
    for pair_cfg in registry.get("standaloneBilingualPairs", []):
        pair = {"de": pair_cfg["de"], "en": pair_cfg["en"]}
        mapping[pair_cfg["de"]] = pair
        mapping[pair_cfg["en"]] = pair
    return mapping


def render_generic_glossary_include(
    block: str, bundle: CompendiumBundle, lang: str, mode: str, wdoc: str, ref_map: dict[str, Any]
) -> str:
    raise ValueError(f"Unknown ::include block '{block}' in compendium '{bundle.compendium_id}'")


def load_and_verify_compendium(
    repo_root: Path,
    comp_cfg: dict[str, Any],
    bilingual_doc_map: dict[str, dict[str, str]],
) -> tuple[CompendiumBundle, set[str]]:
    comp_id = comp_cfg["id"]
    source_dir = repo_root / comp_cfg["sourceDir"]
    errors: list[str] = []
    cited_repos: set[str] = set()
    ext_name = comp_cfg.get("extension")

    def read_checked_json(name: str) -> dict[str, Any]:
        p = source_dir / name
        raw = p.read_text(encoding="utf-8")
        check_terminology_in_text(raw, str(p.relative_to(repo_root)), errors)
        collect_repo_paths(raw, cited_repos)
        if FORBIDDEN_RAW_TEX_RE.search(scrub_math_and_code(raw)):
            errors.append(f"{p.relative_to(repo_root)}: contains raw LaTeX prose macro outside math")
        return json.loads(raw)

    manifest = json.loads((repo_root / comp_cfg["manifestPath"]).read_text(encoding="utf-8"))
    figures: dict[str, dict[str, Any]] = {}
    if (source_dir / "figures.json").is_file():
        figures_raw = read_checked_json("figures.json")
        figures = {f["id"]: f for f in figures_raw.get("figures", [])}

    extra_json: dict[str, dict[str, Any]] = {}
    if ext_name == "skill_graph":
        for fname in skill_graph_ext.extra_json_files():
            extra_json[fname] = read_checked_json(fname)
        skill_graph_ext.verify_extra_data(extra_json, errors)
    else:
        for fname in manifest.get("extraJsonFiles", []):
            extra_json[fname] = read_checked_json(fname)

    languages = manifest.get("languages", ["de", "en"])
    chapters: dict[str, dict[str, list[Any]]] = {}
    for ch_name in manifest["chapters"]:
        chapters[ch_name] = {}
        skels: dict[str, list[tuple[Any, ...]]] = {}
        ch_repos: dict[str, set[str]] = {}
        for lang in languages:
            md_path = source_dir / "chapters" / f"{ch_name}.{lang}.md"
            if not md_path.is_file():
                errors.append(f"Missing chapter file: {md_path.relative_to(repo_root)}")
                continue
            raw = md_path.read_text(encoding="utf-8")
            rel_label = str(md_path.relative_to(repo_root))
            if not manifest.get("allowRetiredTermsInGlossaryTable", False):
                check_terminology_in_text(raw, rel_label, errors)
            m_raw = FORBIDDEN_RAW_TEX_RE.search(scrub_math_and_code(raw))
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

        if len(languages) == 2 and "de" in skels and "en" in skels:
            if skels["de"] != skels["en"]:
                for idx, (a, b) in enumerate(zip(skels["de"], skels["en"])):
                    if a != b:
                        errors.append(f"{comp_id}:{ch_name}: DE/EN AST mismatch at element #{idx}: DE={a} vs EN={b}")
                        break
                else:
                    errors.append(
                        f"{comp_id}:{ch_name}: DE/EN AST length mismatch: DE={len(skels['de'])} vs EN={len(skels['en'])}"
                    )
            if ch_repos["de"] != ch_repos["en"]:
                diff_de = sorted(ch_repos["de"] - ch_repos["en"])
                diff_en = sorted(ch_repos["en"] - ch_repos["de"])
                errors.append(
                    f"{comp_id}:{ch_name}: DE/EN repo citation mismatch: only-DE={diff_de}, only-EN={diff_en}"
                )

    all_generated_targets: set[str] = set()
    reg = load_compendia_registry(repo_root)
    for c_entry in reg.get("compendia", []):
        m_path = repo_root / c_entry["manifestPath"]
        if m_path.is_file():
            m_data = json.loads(m_path.read_text(encoding="utf-8"))
            for wp in m_data.get("webPages", []):
                all_generated_targets.update(wp.get("paths", {}).values())
            for l_code in ("de", "en"):
                if l_code in m_data.get("pdf", {}):
                    all_generated_targets.update(m_data["pdf"][l_code].get("outputPaths", []))
        if c_entry.get("buildJsonPath"):
            all_generated_targets.add(c_entry["buildJsonPath"])
        if c_entry.get("generatedBy"):
            all_generated_targets.add(c_entry["generatedBy"])

    full_repo_present = (repo_root / "app/package.json").is_file()
    for rpath in sorted(cited_repos):
        clean_rpath = rpath.rstrip("/")
        if clean_rpath in all_generated_targets or rpath in all_generated_targets:
            continue
        if not full_repo_present and not clean_rpath.startswith("docs/"):
            continue
        if not (repo_root / clean_rpath).exists():
            errors.append(f"{comp_id}: Unresolved repo: target '{rpath}'")

    if errors:
        raise SystemExit(f"Single-source verification failed ({comp_id}):\n  - " + "\n  - ".join(errors))

    bundle = CompendiumBundle(
        compendium_id=comp_id,
        config=comp_cfg,
        repo_root=repo_root,
        source_dir=source_dir,
        manifest=manifest,
        figures=figures,
        extra_json=extra_json,
        chapters=chapters,
        bilingual_doc_map=bilingual_doc_map,
        include_renderer=skill_graph_ext.render_include if ext_name == "skill_graph" else render_generic_glossary_include,
        ref_map_hook=skill_graph_ext.ref_map_hook if ext_name == "skill_graph" else None,
        web_custom_source_renderer=skill_graph_ext.web_custom_source_renderer if ext_name == "skill_graph" else None,
        web_post_hook=skill_graph_ext.web_post_hook if ext_name == "skill_graph" else None,
    )
    return bundle, cited_repos


def declared_binaries_for_bundle(bundle: CompendiumBundle) -> list[str]:
    pdf_paths = [
        p
        for lang in bundle.manifest.get("languages", ["de", "en"])
        for p in bundle.manifest["pdf"][lang]["outputPaths"]
    ]
    extra_bins: list[str] = []
    if bundle.compendium_id == "skill-graph":
        extra_bins.extend(skill_graph_ext.generated_diagram_binaries(bundle))
    if bundle.config.get("buildJsonPath"):
        extra_bins.append(bundle.config["buildJsonPath"])
    return sorted(set([*pdf_paths, *extra_bins]))


def write_bundle_declared_binaries(bundle: CompendiumBundle, build_root: Path) -> list[str]:
    bins = declared_binaries_for_bundle(bundle)
    payload = {
        "schemaVersion": 1,
        "generatedBy": bundle.config["generatedBy"],
        "binaries": bins,
    }
    atomic_write(
        build_root / "declared-binaries.json",
        (json.dumps(payload, indent=2, ensure_ascii=False) + "\n").encode("utf-8"),
    )
    return bins


def write_global_declared_binaries(repo_root: Path, all_binaries: list[str]) -> None:
    out_dir = repo_root / "tmp/compendia"
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = {
        "schemaVersion": 1,
        "generatedBy": "scripts/build_compendia.py",
        "binaries": sorted(set(all_binaries)),
    }
    atomic_write(
        out_dir / "declared-binaries.json",
        (json.dumps(payload, indent=2, ensure_ascii=False) + "\n").encode("utf-8"),
    )


def git_tracked_subset(repo_root: Path, candidate_paths: list[str]) -> list[str]:
    if not candidate_paths:
        return []
    unique = sorted(set(candidate_paths))
    git_index = repo_root / ".git/index"
    index_accessible = False
    try:
        index_accessible = git_index.is_file()
    except OSError:
        index_accessible = False

    if index_accessible or os.environ.get("GIT_INDEX_FILE"):
        res = subprocess.run(
            ["git", "ls-files", "--", *unique],
            cwd=repo_root,
            text=True,
            capture_output=True,
            check=True,
        )
        return [line.strip() for line in res.stdout.splitlines() if line.strip()]

    res = subprocess.run(
        ["git", "ls-tree", "--name-only", "HEAD", "--", *unique],
        cwd=repo_root,
        text=True,
        capture_output=True,
        check=False,
    )
    if res.returncode != 0:
        return []
    return [line.strip() for line in res.stdout.splitlines() if line.strip()]


def check_untracked_outputs_for_bundle(bundle: CompendiumBundle) -> None:
    tracking_mode = bundle.config.get("outputTracking", "untracked")
    allowed_tracked = set(bundle.config.get("allowedTrackedOutputs", []))
    forbidden: set[str] = set()
    if tracking_mode == "untracked":
        for wp in bundle.manifest["webPages"]:
            forbidden.update(wp["paths"].values())
    for lang in bundle.manifest.get("languages", ["de", "en"]):
        for p in bundle.manifest["pdf"][lang]["outputPaths"]:
            if p not in allowed_tracked:
                forbidden.add(p)
    if bundle.config.get("buildJsonPath"):
        forbidden.add(bundle.config["buildJsonPath"])
    for extra_p in bundle.config.get("extraUntrackedPaths", []):
        forbidden.add(extra_p)
    for glob_pat in bundle.config.get("extraUntrackedGlobs", []):
        for p in bundle.repo_root.glob(glob_pat):
            forbidden.add(str(p.relative_to(bundle.repo_root)))
    if bundle.compendium_id == "skill-graph":
        forbidden.update(skill_graph_ext.generated_diagram_binaries(bundle))

    tracked = git_tracked_subset(bundle.repo_root, sorted(forbidden - allowed_tracked))
    if tracked:
        raise SystemExit(
            f"Generated or retired files for '{bundle.compendium_id}' must not be tracked in Git:\n  - "
            + "\n  - ".join(tracked)
        )


def compile_pdfs_for_bundle(
    bundle: CompendiumBundle,
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
        fmt_dir = bundle.repo_root / "tmp/skill-graph-tex-format"
        if (fmt_dir / "lualatex.fmt").is_file():
            env["TEXFORMATS"] = f"{fmt_dir}//:" + env.get("TEXFORMATS", "")
    lualatex = shutil.which("lualatex", path=env.get("PATH"))
    if not lualatex:
        raise SystemExit("LuaLaTeX is required for --pdfs / --all.")

    extra_inputs = (
        skill_graph_ext.extra_input_paths(bundle.repo_root)
        if bundle.compendium_id == "skill-graph"
        else []
    )
    inputs = sorted({
        *bundle.source_dir.glob("*.json"),
        *bundle.source_dir.glob("*.md"),
        *bundle.source_dir.glob("chapters/*.md"),
        *extra_inputs,
        Path(__file__).resolve(),
    })
    input_hashes = {str(p.relative_to(bundle.repo_root)): digest_file(p) for p in inputs if p.is_file()}
    source_hashes = {
        p: digest_file(bundle.repo_root / p)
        for p in sorted(cited_repos)
        if (bundle.repo_root / p).is_file()
    }

    langs = bundle.manifest.get("languages", ["de", "en"])

    def build_one_lang(lang: str) -> tuple[str, dict[str, str]]:
        lang_dir = build_root / lang
        lang_env = env.copy()
        if "TEXMFVAR" not in os.environ:
            var_dir = bundle.repo_root / "tmp/compendia" / f"texmf-var-{lang}"
            var_dir.mkdir(parents=True, exist_ok=True)
            lang_env["TEXMFVAR"] = str(var_dir)
        if "TEXMFCACHE" not in os.environ:
            cache_dir = bundle.repo_root / "tmp/compendia" / f"texmf-cache-{lang}"
            cache_dir.mkdir(parents=True, exist_ok=True)
            lang_env["TEXMFCACHE"] = str(cache_dir)
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
            res = subprocess.run(cmd, cwd=lang_dir, env=lang_env, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            (lang_dir / f"pass-{run}.txt").write_text(res.stdout, encoding="utf-8")
            if res.returncode:
                raise RuntimeError(f"LuaLaTeX ({bundle.compendium_id}/{lang}) pass {run} failed:\n{res.stdout[-7000:]}")
        log = (lang_dir / f"{tex_path.stem}.log").read_text(encoding="utf-8", errors="replace")
        probs = log_problems(log)
        if probs:
            raise RuntimeError(
                f"LuaLaTeX ({bundle.compendium_id}/{lang}) log check failed ({lang_dir / (tex_path.stem + '.log')}):\n"
                + "\n".join(probs)
            )
        pdf_bytes = (lang_dir / f"{tex_path.stem}.pdf").read_bytes()
        full_repo_present = (bundle.repo_root / "app/package.json").is_file()
        for out_rel in bundle.manifest["pdf"][lang]["outputPaths"]:
            if not full_repo_present and not out_rel.startswith("docs/"):
                continue
            atomic_write(bundle.repo_root / out_rel, pdf_bytes)
        primary_rel = bundle.manifest["pdf"][lang]["outputPaths"][0]
        return lang, {"path": primary_rel, "sha256": digest_bytes(pdf_bytes)}

    pdf_outputs: dict[str, dict[str, str]] = {}
    lang_errors: list[str] = []
    with ThreadPoolExecutor(max_workers=2) as pool:
        futures = {lang: pool.submit(build_one_lang, lang) for lang in langs}
        for lang in langs:
            try:
                _, info = futures[lang].result()
                pdf_outputs[lang] = info
                print(f"Built {info['path']} ({lang}; 3 passes; 0 overflows/warnings)")
            except Exception as exc:  # noqa: BLE001
                lang_errors.append(str(exc))
    if lang_errors:
        raise SystemExit("\n\n".join(lang_errors))

    if bundle.config.get("buildJsonPath"):
        version = subprocess.check_output([lualatex, "--version"], env=env, text=True).splitlines()[0]
        build_manifest = {
            "compendiumId": bundle.compendium_id,
            "documentDate": bundle.manifest["documentDate"],
            "engine": version,
            "sourceDateEpoch": env["SOURCE_DATE_EPOCH"],
            "pdf": pdf_outputs.get("de") or next(iter(pdf_outputs.values())),
            "pdfs": pdf_outputs,
            "inputs": input_hashes,
            "conceptSources": source_hashes,
            "scope": "Technical single-source documentation build (DE + EN); no runtime, publication or learner validation.",
        }
        atomic_write(
            bundle.repo_root / bundle.config["buildJsonPath"],
            (json.dumps(build_manifest, indent=2, ensure_ascii=False) + "\n").encode("utf-8"),
        )


def strip_docs_prefix(doc_path: str) -> str:
    return doc_path[len("docs/") :] if doc_path.startswith("docs/") else doc_path


def emit_mkdocs_bilingual_map(repo_root: Path, registry: dict[str, Any], check_only: bool = False) -> list[str]:
    pairs: list[dict[str, str]] = []
    seen_de: set[str] = set()

    for entry in registry.get("compendia", []):
        m_path = repo_root / entry["manifestPath"]
        if not m_path.is_file():
            continue
        manifest = json.loads(m_path.read_text(encoding="utf-8"))
        for wp in manifest.get("webPages", []):
            paths = wp.get("paths", {})
            if "de" in paths and "en" in paths:
                de_rel = strip_docs_prefix(paths["de"])
                en_rel = strip_docs_prefix(paths["en"])
                if de_rel not in seen_de:
                    seen_de.add(de_rel)
                    pairs.append({"de": de_rel, "en": en_rel})
        pdf_cfg = manifest.get("pdf", {})
        if "de" in pdf_cfg and "en" in pdf_cfg:
            de_pdfs = pdf_cfg["de"].get("outputPaths", [])
            en_pdfs = pdf_cfg["en"].get("outputPaths", [])
            if de_pdfs and en_pdfs:
                de_rel = strip_docs_prefix(de_pdfs[0])
                en_rel = strip_docs_prefix(en_pdfs[0])
                if de_rel not in seen_de:
                    seen_de.add(de_rel)
                    pairs.append({"de": de_rel, "en": en_rel})

    for st in registry.get("standaloneBilingualPairs", []):
        de_rel = strip_docs_prefix(st["de"])
        en_rel = strip_docs_prefix(st["en"])
        if de_rel not in seen_de:
            seen_de.add(de_rel)
            pairs.append({"de": de_rel, "en": en_rel})

    nav_labels = registry.get("mkdocsNavLabels", {
        "Home": {"de": "Start", "en": "Home"},
        "Quickstart": {"de": "Schnellstart", "en": "Quickstart"},
        "Whitepaper": {"de": "Whitepaper", "en": "Whitepaper"},
        "Concept": {"de": "Konzept", "en": "Concept"},
        "Skill Graph": {"de": "Skill-Graph", "en": "Skill Graph"},
        "Runtime Workflows": {"de": "Laufzeit & Coach", "en": "Runtime & Coach"},
        "Runtime & Coach": {"de": "Laufzeit & Coach", "en": "Runtime & Coach"},
        "Didactic": {"de": "Didaktik & Planung", "en": "Didactics & Planning"},
        "Didactic & Planning": {"de": "Didaktik & Planung", "en": "Didactic & Planning"},
        "Production Pipelines": {"de": "Produktions-Pipelines", "en": "Production Pipelines"},
        "QA & CI": {"de": "QS & CI", "en": "QA & CI"},
        "Curriculum Quality": {"de": "Curriculum-Qualität", "en": "Curriculum Quality"},
        "Review Lanes": {"de": "Review-Pfade", "en": "Review Lanes"},
        "Champions": {"de": "Champions", "en": "Champions"},
        "Deploy": {"de": "Betrieb & Rollout", "en": "Deploy"},
        "Security": {"de": "Sicherheit & Datenschutz", "en": "Security & Privacy"},
        "Legal": {"de": "Rechtliches", "en": "Legal"},
        "Dev": {"de": "Entwicklung", "en": "Dev"},
    })

    payload = {
        "pairs": pairs,
        "navLabels": nav_labels,
    }
    js_content = (
        "/* Generated from docs/compendia.json by scripts/build_compendia.py. Do not edit manually. */\n"
        f"window.SKILLPILOT_DOCS_I18N = {json.dumps(payload, indent=2, ensure_ascii=False)};\n"
    ).encode("utf-8")
    target = repo_root / "docs/javascripts/bilingual-map.js"
    if check_only:
        if not target.is_file() or target.read_bytes() != js_content:
            return ["docs/javascripts/bilingual-map.js"]
        return []
    atomic_write(target, js_content)
    return []


def run_compendia_pipeline(
    repo_root: Path,
    compendium_ids: list[str] | None = None,
    verify_sources: bool = False,
    web_and_tex: bool = False,
    diagrams: bool = False,
    pdfs: bool = False,
    run_all: bool = False,
    check_only: bool = False,
    check_committed_web: bool = False,
    check_untracked: bool = False,
    texmf: Path | None = None,
    update_mkdocs_map: bool = False,
) -> None:
    registry = load_compendia_registry(repo_root)
    bilingual_doc_map = build_global_bilingual_doc_map(repo_root, registry)
    all_entries = registry.get("compendia", [])
    if compendium_ids:
        wanted = set(compendium_ids)
        selected = [e for e in all_entries if e["id"] in wanted]
        missing = wanted - {e["id"] for e in selected}
        if missing:
            raise SystemExit(f"Unknown compendium id(s): {', '.join(sorted(missing))}")
    else:
        selected = all_entries

    all_declared_bins: list[str] = []
    for entry in all_entries:
        if (repo_root / entry["manifestPath"]).is_file():
            b_tmp, _ = load_and_verify_compendium(repo_root, entry, bilingual_doc_map)
            all_declared_bins.extend(declared_binaries_for_bundle(b_tmp))

    stale_files: list[str] = []
    for entry in selected:
        bundle, cited_repos = load_and_verify_compendium(repo_root, entry, bilingual_doc_map)
        comp_id = bundle.compendium_id
        build_root = repo_root / entry.get("buildDir", f"tmp/compendia/{comp_id}")
        build_root.mkdir(parents=True, exist_ok=True)
        print(f"[{comp_id}] Verified canonical single-source schemas, terminology, and DE/EN AST parity.")

        if check_untracked:
            check_untracked_outputs_for_bundle(bundle)
            print(f"[{comp_id}] Verified untracked-output policy.")

        if check_committed_web and entry.get("outputTracking") == "committed-web":
            langs_cw = bundle.manifest.get("languages", ["de", "en"])
            ref_maps_cw = {lang: build_ref_map(bundle, lang) for lang in langs_cw}
            stale_files.extend(emit_web_pages(bundle, ref_maps_cw, check_only=True))

        if comp_id == "skill-graph" and (run_all or diagrams):
            skill_graph_ext.run_pre_pdf_hooks(
                repo_root,
                run_model_check=run_all,
                run_diagrams=(diagrams or run_all),
                check_only=check_only,
            )

        tex_files: dict[str, Path] = {}
        if web_and_tex or pdfs or run_all:
            langs = bundle.manifest.get("languages", ["de", "en"])
            ref_maps = {lang: build_ref_map(bundle, lang) for lang in langs}
            diffs = emit_web_pages(bundle, ref_maps, check_only=check_only)
            stale_files.extend(diffs)
            asset_root = repo_root / entry["assetRoot"]
            svg_pdf_dir = prepare_svg_assets_for_tex(bundle, asset_root, build_root) if (pdfs or run_all) else None
            tex_stem = entry.get("texStem", f"skillpilot-{comp_id}")
            for lang in langs:
                lang_dir = build_root / lang
                lang_dir.mkdir(parents=True, exist_ok=True)
                tex_path = lang_dir / f"{tex_stem}.{lang}.tex"
                tex_str = emit_tex_document(bundle, lang, ref_maps[lang], asset_root, svg_pdf_dir=svg_pdf_dir)
                atomic_write(tex_path, tex_str.encode("utf-8"))
                tex_files[lang] = tex_path
            write_bundle_declared_binaries(bundle, build_root)
            page_count = sum(len(wp["paths"]) for wp in bundle.manifest["webPages"])
            if not check_only:
                print(f"[{comp_id}] Materialized {page_count} Web Markdown pages and {'/'.join(l.upper() for l in langs)} LaTeX sources.")

        if pdfs or run_all:
            compile_pdfs_for_bundle(bundle, cited_repos, tex_files, build_root, texmf)

    if check_committed_web and update_mkdocs_map:
        stale_files.extend(emit_mkdocs_bilingual_map(repo_root, registry, check_only=True))

    if (web_and_tex or pdfs or run_all) and update_mkdocs_map:
        stale_files.extend(emit_mkdocs_bilingual_map(repo_root, registry, check_only=check_only))

    if web_and_tex or pdfs or run_all:
        write_global_declared_binaries(repo_root, all_declared_bins)

    if (check_only or check_committed_web) and stale_files:
        raise SystemExit(
            "Stale generated single-source Web files (run `python3 scripts/build_compendia.py --web-and-tex`):\n  - "
            + "\n  - ".join(stale_files)
        )
