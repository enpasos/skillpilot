import json
import os
from typing import Any, Dict, List

"""
Scan all *.de.json curricula under this directory and collect cases where
`titleEn` or `descriptionEn` is still identical to the German field (and not a
`[TODO]` placeholder). The result is written to `pending_translations.json`:

[
  {"text": "<German string>", "type": "title|description", "count": <int>},
  ...
]

This is intended as input for an external translation step (e.g. MT API or
offline workflow) which can then be merged into the TRANSLATIONS map used by
`apply_translations_batch.py`.
"""

OUTPUT_FILE = "pending_translations.json"


def collect_from_node(
    node: Dict[str, Any],
    title_counts: Dict[str, int],
    desc_counts: Dict[str, int],
) -> None:
    title = node.get("title", "")
    title_en = node.get("titleEn", "")
    if title and title_en and title == title_en and not title_en.startswith("[TODO]"):
        title_counts[title] = title_counts.get(title, 0) + 1

    desc = node.get("description", "")
    desc_en = node.get("descriptionEn", "")
    if desc and desc_en and desc == desc_en and not desc_en.startswith("[TODO]"):
        desc_counts[desc] = desc_counts.get(desc, 0) + 1

    for key in ("contains", "goals"):
        children = node.get(key)
        if isinstance(children, list):
            for child in children:
                if isinstance(child, dict):
                    collect_from_node(child, title_counts, desc_counts)


def main() -> None:
    base_dir = "."
    title_counts: Dict[str, int] = {}
    desc_counts: Dict[str, int] = {}

    files_seen = 0
    files_with_issues = 0

    for root, _, files in os.walk(base_dir):
        for name in files:
            if not name.endswith(".de.json"):
                continue
            path = os.path.join(root, name)
            files_seen += 1
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                before_titles = len(title_counts)
                before_desc = len(desc_counts)
                collect_from_node(data, title_counts, desc_counts)
                if len(title_counts) > before_titles or len(desc_counts) > before_desc:
                    files_with_issues += 1
            except Exception as exc:  # pragma: no cover - defensive
                print(f"Error reading {path}: {exc}")

    entries: List[Dict[str, Any]] = []
    for text, count in sorted(title_counts.items(), key=lambda x: -x[1]):
        entries.append({"text": text, "type": "title", "count": count})
    for text, count in sorted(desc_counts.items(), key=lambda x: -x[1]):
        entries.append({"text": text, "type": "description", "count": count})

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)

    print(f"Scanned {files_seen} *.de.json files.")
    print(f"Files with untranslated fields: {files_with_issues}")
    print(f"Wrote {len(entries)} unique untranslated strings to {OUTPUT_FILE}")


if __name__ == "__main__":
    main()

