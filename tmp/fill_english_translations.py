import csv
import json
import re
from pathlib import Path

BASE = Path("curricula/EU/CEFR/English_From_German/input/vocab_sources")
AUTO_TAG = "auto_no_translation"
AUTO_TRANSLATION_TAG = "auto_translation"


def normalize_key(text: str) -> str:
    return re.sub(r"\s+", " ", text.strip().lower())


def add_mapping(mapping, front, back):
    if not front or not back:
        return
    key = normalize_key(front)
    if not key:
        return
    if normalize_key(back) == key:
        return
    mapping.setdefault(key, back.strip())


def load_translation_map(csv_paths):
    mapping = {}

    for path in csv_paths:
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle, delimiter=";")
            for row in reader:
                add_mapping(mapping, row.get("Front", ""), row.get("Back", ""))

    vocab_400 = Path("curricula/sandbox/vocab_400.json")
    if vocab_400.exists():
        data = json.loads(vocab_400.read_text(encoding="utf-8"))
        for card in data.get("cards", []):
            add_mapping(mapping, card.get("front", ""), card.get("back", ""))

    lexicon_candidates = [
        BASE / "english_german_lexicon.csv",
        BASE / "english_german_lexicon.tsv",
    ]
    for lexicon_path in lexicon_candidates:
        if not lexicon_path.exists():
            continue
        delimiter = "\t" if lexicon_path.suffix == ".tsv" else ";"
        with lexicon_path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle, delimiter=delimiter)
            headers = [h.lower() for h in (reader.fieldnames or [])]
            front_idx = None
            back_idx = None
            for candidate in ["front", "english", "en", "word"]:
                if candidate in headers:
                    front_idx = headers.index(candidate)
                    break
            for candidate in ["back", "german", "de", "translation"]:
                if candidate in headers:
                    back_idx = headers.index(candidate)
                    break
            for row in reader:
                if front_idx is not None and back_idx is not None:
                    front_key = reader.fieldnames[front_idx]
                    back_key = reader.fieldnames[back_idx]
                    add_mapping(mapping, row.get(front_key, ""), row.get(back_key, ""))
                else:
                    values = list(row.values())
                    if len(values) >= 2:
                        add_mapping(mapping, values[0], values[1])

    return mapping


def update_tags(tags):
    tags = [t.strip() for t in tags.split(",") if t.strip()] if tags else []
    if AUTO_TAG in tags:
        tags = [t for t in tags if t != AUTO_TAG]
    if AUTO_TRANSLATION_TAG not in tags:
        tags.append(AUTO_TRANSLATION_TAG)
    return ",".join(tags)


def main():
    csv_paths = sorted(BASE.glob("*_vocab_source.csv"))
    translation_map = load_translation_map(csv_paths)

    total_updated = 0
    total_remaining = 0

    for path in csv_paths:
        with path.open("r", encoding="utf-8", newline="") as handle:
            reader = csv.DictReader(handle, delimiter=";")
            fieldnames = reader.fieldnames or []
            rows = list(reader)

        updated = 0
        remaining = 0

        for row in rows:
            front = row.get("Front", "").strip()
            back = row.get("Back", "").strip()
            tags = row.get("TopicTags", "")

            needs_translation = AUTO_TAG in tags or normalize_key(front) == normalize_key(back)
            if not needs_translation:
                continue

            translation = translation_map.get(normalize_key(front))
            if translation:
                row["Back"] = translation
                row["TopicTags"] = update_tags(tags)
                updated += 1
            else:
                remaining += 1

        with path.open("w", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=fieldnames, delimiter=";")
            writer.writeheader()
            writer.writerows(rows)

        total_updated += updated
        total_remaining += remaining
        print(f"{path}: updated={updated} remaining={remaining}")

    print(f"Total updated={total_updated} remaining={total_remaining}")


if __name__ == "__main__":
    main()
