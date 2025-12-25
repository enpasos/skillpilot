import csv
import json
import re
import unicodedata
from pathlib import Path

LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
AUTO_TAGS = "auto_frequency,source_frequency_txt,auto_no_translation"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "_", ascii_text)
    return ascii_text.strip("_")


def normalize_word(value: str) -> str:
    value = re.sub(r"\s+", " ", value.strip())
    return value


def load_targets():
    targets_path = Path("curricula/EU/CEFR/targets.json")
    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    levels = targets["targets"]["French_From_German"]["levels"]
    cumulative = {level: levels[level]["cumulativeFamilies"] for level in LEVELS}
    return cumulative


def level_from_rank(rank, cumulative_targets):
    for level in LEVELS:
        if rank <= cumulative_targets[level]:
            return level
    return None


def load_csv(path: Path):
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle, delimiter=";")
        rows = list(reader)
        fieldnames = reader.fieldnames or []
    return rows, fieldnames


def write_csv(path: Path, rows, fieldnames):
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames, delimiter=";")
        writer.writeheader()
        writer.writerows(rows)


def ensure_fieldnames(fieldnames):
    wanted = ["Front", "Back", "LessonID", "TopicTags", "Family", "Category"]
    if not fieldnames:
        return wanted
    for name in wanted:
        if name not in fieldnames:
            fieldnames.append(name)
    return fieldnames


def parse_frequency_list(path: Path):
    entries = []
    if not path.exists():
        return entries

    seen = set()
    with path.open("r", encoding="utf-8") as handle:
        for idx, line in enumerate(handle, 1):
            word = normalize_word(line)
            if not word:
                continue
            key = slugify(word)
            if not key or key in seen:
                continue
            seen.add(key)
            entries.append({"rank": idx, "word": word, "key": key})
    return entries


def main():
    base = Path("curricula/EU/CEFR/French_From_German/input/vocab_sources")
    freq_path = base / "frequency.txt"

    entries = parse_frequency_list(freq_path)
    if not entries:
        print("No entries parsed from frequency.txt")
        return

    cumulative_targets = load_targets()

    csv_paths = {level: base / f"{level.lower()}_vocab_source.csv" for level in LEVELS}

    rows_by_level = {}
    fieldnames_by_level = {}
    lesson_counts = {}
    used_families = set()

    for level, path in csv_paths.items():
        rows, fieldnames = load_csv(path)
        fieldnames = ensure_fieldnames(fieldnames)
        rows_by_level[level] = rows
        fieldnames_by_level[level] = fieldnames

        counts = {i: 0 for i in range(1, 13)}
        for row in rows:
            family_raw = (row.get("Family") or row.get("WordFamily") or row.get("Front") or "").strip()
            key = slugify(family_raw)
            if key:
                used_families.add(key)
            try:
                lesson_id = int((row.get("LessonID") or "").strip())
            except ValueError:
                continue
            if 1 <= lesson_id <= 12:
                counts[lesson_id] += 1
        lesson_counts[level] = counts

    added_counts = {level: 0 for level in LEVELS}
    skipped_existing = 0

    for entry in entries:
        level = level_from_rank(entry["rank"], cumulative_targets)
        if not level:
            continue
        if entry["key"] in used_families:
            skipped_existing += 1
            continue

        used_families.add(entry["key"])
        counts = lesson_counts[level]
        lesson_id = min(counts, key=counts.get)
        counts[lesson_id] += 1

        rows_by_level[level].append({
            "Front": entry["word"],
            "Back": entry["word"],
            "LessonID": str(lesson_id),
            "TopicTags": AUTO_TAGS,
            "Family": entry["word"],
            "Category": f"Lesson {lesson_id}",
        })
        added_counts[level] += 1

    for level in LEVELS:
        write_csv(csv_paths[level], rows_by_level[level], fieldnames_by_level[level])
        print(f"{csv_paths[level]}: added={added_counts[level]}")

    print(f"Skipped existing families: {skipped_existing}")


if __name__ == "__main__":
    main()
