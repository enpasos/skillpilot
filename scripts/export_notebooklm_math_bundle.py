#!/usr/bin/env python3

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parent.parent
DEFAULT_OUTPUT_DIR = REPO_ROOT / "tmp/notebooklm_math_bundle"
CANONICAL_MATH_PATH = REPO_ROOT / "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json"
STATUS_DOC_PATH = REPO_ROOT / "docs/dev/canonical-gymnasium-math-bundeslaender-status.md"
INPUT_ROOT = REPO_ROOT / "curricula/DE/Gymnasium/input"
MAPPING_ROOT = REPO_ROOT / "curricula/DE/Gymnasium/mapping"
COMPOSITION_VIEW_ROOT = REPO_ROOT / "curricula/DE/Gymnasium/composition-views/mathematik"
PROVENANCE_ROOT = REPO_ROOT / "curricula/DE/Gymnasium/provenance"
ROLLOUT_TRACKER_PATH = PROVENANCE_ROOT / "math-bundesland-rollout-tracker.json"

TEXT_EXTENSIONS = {".txt", ".md", ".json", ".html", ".snapshot"}
PDF_EXTENSION = ".pdf"
MATH_KEYWORDS = ("mathematik", "mathe", "math")
EXCLUDED_PATH_SEGMENTS = ("/abi/",)
EXCLUDED_BASENAME_PREFIXES = ("hes_math_flashcards_",)
MAX_FLAT_FILENAME_LENGTH = 220


def repo_relative(path: Path) -> str:
    return path.relative_to(REPO_ROOT).as_posix()


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Export a NotebookLM input bundle for canonical German Gymnasium mathematics, "
            "including the canonical landscape, the current status document, and math-related input curricula."
        )
    )
    parser.add_argument(
        "--output-dir",
        type=Path,
        default=DEFAULT_OUTPUT_DIR,
        help=f"Target directory under tmp/ (default: {repo_relative(DEFAULT_OUTPUT_DIR)})",
    )
    return parser.parse_args()


def ensure_clean_directory(path: Path) -> None:
    if path.exists():
        shutil.rmtree(path)
    path.mkdir(parents=True, exist_ok=True)


def write_text(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def copy_binary(path: Path, target: Path) -> None:
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(path, target)


def copy_text_as_txt(source: Path, output_root: Path, base_root: Path) -> Path:
    relative = source.relative_to(base_root)
    target_name = source.name if source.suffix.lower() == ".txt" else f"{source.name}.txt"
    target = output_root / relative.parent / target_name
    content = source.read_text(encoding="utf-8", errors="replace")
    write_text(target, content)
    return target


def build_goal_text() -> str:
    return """NotebookLM goal for canonical Gymnasium mathematics modelling

Purpose

We want to compare the canonical DE Gymnasium mathematics landscape with the state-specific input curricula and identify the smallest defensible modelling corrections.

Current modelling target

- The canonical file is the shared pedagogical target graph.
- Hessen is treated as the current reference lane.
- For learner-facing state views, the number of visible atomic goals should stay in a rough corridor of +/-20% around the Hessen counts for:
  - Sekundarstufe I
  - Sekundarstufe II (GK)
  - Sekundarstufe II (LK)
- Large deviations usually indicate a modelling problem in one of these layers:
  - canonical graph
  - mapping
  - compiled applicability
  - composition view

What NotebookLM should help with

- Find exact curriculum passages that justify whether a canonical subtree or atomic goal should be visible in a given Bundesland.
- Detect where a broad source package maps only to a cluster and therefore does not activate enough learner-facing child visibility.
- Distinguish between:
  - true curricular omission
  - missing or too broad mapping
  - missing applicability reach
  - wrong learner-facing composition scope
  - real canonical gap
- Suggest the smallest credible fix instead of broad rewrites.

Useful answer shape

Please structure findings like this whenever possible:

- Bundesland:
- Stufe / Kursprofil:
- Source file:
- Page / section:
- Exact source wording:
- Relevant canonical goal id(s):
- Proposed relation:
  - exact mapping
  - partial mapping
  - applicability widening
  - composition-view change
  - canonical goal missing
- Why this is the smallest correct change:

How the provided files are organized

- The canonical mathematics landscape is split into two .txt chunks because the source JSON is large.
- The current nationwide status document contains the table with atomic-goal counts per Bundesland and stage.
- The input folder contains the state-specific mathematics source material that may justify or falsify the current modelling.
- The bundesland_mapping folder contains the tracker-referenced mapping JSON files, the mathematics composition views, and the shared provenance/applicability notes and registries that control learner-facing state scope.
"""


def build_canonical_chunks() -> list[tuple[str, str]]:
    landscape = json.loads(CANONICAL_MATH_PATH.read_text(encoding="utf-8"))
    goals = landscape.get("goals", [])
    midpoint = (len(goals) + 1) // 2
    shared_payload = {key: value for key, value in landscape.items() if key != "goals"}

    chunks = [
        ("canonical_math_part_1.txt", json.dumps({**shared_payload, "goals": goals[:midpoint]}, ensure_ascii=False, indent=2) + "\n"),
        ("canonical_math_part_2.txt", json.dumps({**shared_payload, "goals": goals[midpoint:]}, ensure_ascii=False, indent=2) + "\n"),
    ]
    return chunks


def is_math_input_file(path: Path) -> bool:
    relative = path.relative_to(INPUT_ROOT).as_posix().lower()
    if any(segment in relative for segment in EXCLUDED_PATH_SEGMENTS):
        return False
    if path.name.lower().startswith(EXCLUDED_BASENAME_PREFIXES):
        return False
    return any(keyword in relative for keyword in MATH_KEYWORDS)


def collect_math_input_files() -> list[Path]:
    files = []
    for path in sorted(INPUT_ROOT.rglob("*")):
        if not path.is_file():
            continue
        if is_math_input_file(path):
            files.append(path)
    return files


def copy_notebooklm_input_file(source: Path, output_root: Path) -> Path:
    relative = source.relative_to(INPUT_ROOT)
    if source.suffix.lower() == PDF_EXTENSION:
        target = output_root / relative
        copy_binary(source, target)
        return target

    if source.suffix.lower() not in TEXT_EXTENSIONS:
        raise ValueError(f"Unsupported input file extension for NotebookLM export: {repo_relative(source)}")

    return copy_text_as_txt(source, output_root, INPUT_ROOT)


def unique_paths(paths: list[Path]) -> list[Path]:
    return sorted(dict.fromkeys(paths))


def build_flat_filename(relative_path: Path) -> str:
    raw_name = relative_path.as_posix().replace("/", "__")
    if len(raw_name) <= MAX_FLAT_FILENAME_LENGTH:
        return raw_name

    suffix = "".join(relative_path.suffixes)
    base = raw_name[: -len(suffix)] if suffix else raw_name
    digest = hashlib.sha1(relative_path.as_posix().encode("utf-8")).hexdigest()[:12]
    keep_length = MAX_FLAT_FILENAME_LENGTH - len(suffix) - len(digest) - 2
    truncated = base[: max(keep_length, 1)]
    return f"{truncated}__{digest}{suffix}"


def build_flat_bundle(files: list[Path], output_root: Path, bundle_root: Path) -> list[Path]:
    copied_files: list[Path] = []
    for source in files:
        relative = source.relative_to(bundle_root)
        target = output_root / build_flat_filename(relative)
        copy_binary(source, target)
        copied_files.append(target)
    return copied_files


def collect_tracker_mapping_files() -> list[Path]:
    tracker = json.loads(ROLLOUT_TRACKER_PATH.read_text(encoding="utf-8"))
    files = [MAPPING_ROOT / "README.md"]
    for state in tracker.get("states", []):
        for mapping_file in state.get("mappingFiles", []):
            mapping_path = REPO_ROOT / mapping_file
            files.append(mapping_path)
            readme_path = mapping_path.parent / "README.md"
            if readme_path.exists():
                files.append(readme_path)
    return unique_paths(files)


def collect_composition_view_files() -> list[Path]:
    return sorted(COMPOSITION_VIEW_ROOT.glob("*.json"))


def collect_provenance_context_files() -> list[Path]:
    files = [PROVENANCE_ROOT / "README.md"]
    files.extend(sorted(PROVENANCE_ROOT.glob("*.json")))
    files.extend(sorted(PROVENANCE_ROOT.glob("*-math-onboarding.md")))
    return unique_paths([path for path in files if path.exists()])


def main() -> None:
    args = parse_args()
    output_dir = args.output_dir if args.output_dir.is_absolute() else REPO_ROOT / args.output_dir
    ensure_clean_directory(output_dir)

    canonical_output_dir = output_dir / "canonical"
    status_output_dir = output_dir / "status"
    input_output_dir = output_dir / "input_lehrplaene"
    mapping_output_dir = output_dir / "bundesland_mapping"
    flat_output_dir = output_dir / "flat"

    for file_name, content in build_canonical_chunks():
        write_text(canonical_output_dir / file_name, content)

    write_text(status_output_dir / "canonical_gymnasium_math_bundeslaender_status.txt", STATUS_DOC_PATH.read_text(encoding="utf-8"))
    write_text(output_dir / "goal.txt", build_goal_text())

    copied_input_files: list[Path] = []
    for source in collect_math_input_files():
        copied_input_files.append(copy_notebooklm_input_file(source, input_output_dir))

    copied_mapping_files: list[Path] = []
    for source in collect_tracker_mapping_files():
        copied_mapping_files.append(copy_text_as_txt(source, mapping_output_dir / "mapping", MAPPING_ROOT))

    copied_composition_view_files: list[Path] = []
    for source in collect_composition_view_files():
        copied_composition_view_files.append(copy_text_as_txt(source, mapping_output_dir / "composition_views", COMPOSITION_VIEW_ROOT))

    copied_provenance_files: list[Path] = []
    for source in collect_provenance_context_files():
        copied_provenance_files.append(copy_text_as_txt(source, mapping_output_dir / "provenance", PROVENANCE_ROOT))

    bundle_files = [
        canonical_output_dir / "canonical_math_part_1.txt",
        canonical_output_dir / "canonical_math_part_2.txt",
        status_output_dir / "canonical_gymnasium_math_bundeslaender_status.txt",
        output_dir / "goal.txt",
        *copied_input_files,
        *copied_mapping_files,
        *copied_composition_view_files,
        *copied_provenance_files,
    ]
    flat_file_count = len(bundle_files) + 1

    summary_lines = [
        "NotebookLM Math Bundle Export",
        "",
        f"Output directory: {repo_relative(output_dir)}",
        f"Canonical source: {repo_relative(CANONICAL_MATH_PATH)}",
        f"Status source: {repo_relative(STATUS_DOC_PATH)}",
        f"Copied math input files: {len(copied_input_files)}",
        f"Copied mapping files: {len(copied_mapping_files)}",
        f"Copied composition views: {len(copied_composition_view_files)}",
        f"Copied provenance files: {len(copied_provenance_files)}",
        f"Copied flat files: {flat_file_count}",
        "",
        "Canonical chunk files:",
        f"- {repo_relative(canonical_output_dir / 'canonical_math_part_1.txt')}",
        f"- {repo_relative(canonical_output_dir / 'canonical_math_part_2.txt')}",
        "",
        "Status and guidance:",
        f"- {repo_relative(status_output_dir / 'canonical_gymnasium_math_bundeslaender_status.txt')}",
        f"- {repo_relative(output_dir / 'goal.txt')}",
        "",
        "Flat copy-ready directory:",
        f"- {repo_relative(flat_output_dir)}",
        "",
        "Input curriculum files:",
    ]
    summary_lines.extend(f"- {repo_relative(path)}" for path in copied_input_files)
    summary_lines.extend(
        [
            "",
            "Bundesland mapping files:",
        ]
    )
    summary_lines.extend(f"- {repo_relative(path)}" for path in copied_mapping_files)
    summary_lines.extend(
        [
            "",
            "Composition view files:",
        ]
    )
    summary_lines.extend(f"- {repo_relative(path)}" for path in copied_composition_view_files)
    summary_lines.extend(
        [
            "",
            "Provenance and onboarding files:",
        ]
    )
    summary_lines.extend(f"- {repo_relative(path)}" for path in copied_provenance_files)
    write_text(output_dir / "manifest.txt", "\n".join(summary_lines) + "\n")

    copied_flat_files = build_flat_bundle(bundle_files + [output_dir / "manifest.txt"], flat_output_dir, output_dir)

    print(f"Exported NotebookLM math bundle to {repo_relative(output_dir)}")
    print(f"Canonical chunk files: 2")
    print(f"Copied math input files: {len(copied_input_files)}")
    print(f"Copied mapping files: {len(copied_mapping_files)}")
    print(f"Copied composition views: {len(copied_composition_view_files)}")
    print(f"Copied provenance files: {len(copied_provenance_files)}")
    print(f"Copied flat files: {len(copied_flat_files)}")
    print(f"Manifest: {repo_relative(output_dir / 'manifest.txt')}")


if __name__ == "__main__":
    main()
