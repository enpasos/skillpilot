import csv
import json
import re
import unicodedata
from pathlib import Path

LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"]
AUTO_TAGS = "auto_frequency,source_words_txt,auto_no_translation"


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "_", ascii_text)
    return ascii_text.strip("_")


def normalize_word(value: str) -> str:
    value = re.sub(r"\s+", " ", value.strip())
    return value


def parse_words_txt(path: Path):
    entries = []
    if not path.exists():
        return entries

    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            if '"word"' not in line:
                continue
            raw = line.strip()
            if raw.startswith('+'):
                raw = raw[1:].strip()
            if raw.endswith(','):
                raw = raw[:-1]
            if not raw.startswith('{') or not raw.endswith('}'):
                continue
            try:
                entry = json.loads(raw)
            except json.JSONDecodeError:
                continue
            word = normalize_word(str(entry.get("word", "")))
            if not word:
                continue
            level = str(entry.get("level", "")).strip().upper()
            rank = entry.get("rank")
            translation = str(entry.get("translation", "")).strip()
            pos = str(entry.get("pos", "")).strip()
            entries.append({
                "word": word,
                "level": level,
                "rank": rank,
                "translation": translation,
                "pos": pos,
            })
    return entries


def level_from_rank(rank, cumulative_targets):
    if rank is None:
        return None
    for level in LEVELS:
        if rank <= cumulative_targets[level]:
            return level
    return None


def load_targets():
    targets_path = Path("curricula/EU/CEFR/targets.json")
    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    levels = targets["targets"]["French_From_German"]["levels"]
    cumulative = {level: levels[level]["cumulativeFamilies"] for level in LEVELS}
    incremental = {level: levels[level]["incrementalFamilies"] for level in LEVELS}
    return cumulative, incremental


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


def main():
    base = Path("curricula/EU/CEFR/French_From_German/input/vocab_sources")
    words_path = base / "words.txt"

    entries = parse_words_txt(words_path)
    if not entries:
        print("No entries parsed from words.txt")
        return

    cumulative_targets, incremental_targets = load_targets()

    deduped = {}
    for entry in entries:
        key = slugify(entry["word"])
        if not key:
            continue
        current = deduped.get(key)
        if current is None:
            deduped[key] = entry
            continue
        if entry.get("rank") and current.get("rank"):
            if entry["rank"] < current["rank"]:
                deduped[key] = entry
        elif entry.get("rank") and not current.get("rank"):
            deduped[key] = entry

    entries = list(deduped.values())
    entries.sort(key=lambda item: item.get("rank") or 10**9)

    used_families = set()

    for level in LEVELS:
        csv_path = base / f"{level.lower()}_vocab_source.csv"
        rows, fieldnames = load_csv(csv_path)
        fieldnames = ensure_fieldnames(fieldnames)

        existing_families = set()
        lesson_counts = {i: 0 for i in range(1, 13)}

        for row in rows:
            family_raw = (row.get("Family") or row.get("WordFamily") or row.get("Front") or "").strip()
            family_key = slugify(family_raw)
            if family_key:
                existing_families.add(family_key)
                used_families.add(family_key)
            try:
                lesson_id = int((row.get("LessonID") or "").strip())
            except ValueError:
                continue
            if 1 <= lesson_id <= 12:
                lesson_counts[lesson_id] += 1

        target = int(incremental_targets[level])
        needed = target - len(existing_families)
        if needed <= 0:
            continue

        additions = 0
        for entry in entries:
            if additions >= needed:
                break
            entry_level = entry.get("level")
            if entry_level not in LEVELS:
                entry_level = level_from_rank(entry.get("rank"), cumulative_targets)
            if entry_level != level:
                continue

            family_key = slugify(entry["word"])
            if not family_key or family_key in used_families:
                continue

            used_families.add(family_key)
            lesson_id = min(lesson_counts, key=lesson_counts.get)
            lesson_counts[lesson_id] += 1

            rows.append({
                "Front": entry["word"],
                "Back": entry["word"],
                "LessonID": str(lesson_id),
                "TopicTags": AUTO_TAGS,
                "Family": entry["word"],
                "Category": f"Lesson {lesson_id}",
            })
            additions += 1

        write_csv(csv_path, rows, fieldnames)
        print(f"{csv_path}: added={additions} remaining={max(0, needed - additions)}")


if __name__ == "__main__":
    main()
