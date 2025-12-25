import csv
import json
import re
import unicodedata
from pathlib import Path
from PyPDF2 import PdfReader

LEVELS_3000 = ["A1", "A2", "B1", "B2"]
LEVELS_5000 = ["B2", "C1"]

POS_COMBO_REPLACEMENTS = {
    "det./pron.": "det.",
    "pron./det.": "pron.",
    "adj./n.": "adj.",
    "n./adj.": "n.",
    "n./v.": "n.",
    "v./n.": "v.",
    "prep./adv.": "prep.",
    "adv./prep.": "adv.",
    "adj./adv.": "adj.",
    "adv./adj.": "adv.",
}

POS_MARKERS = [
    "auxiliary v.",
    "modal v.",
    "indefinite article.",
    "number.",
    "exclam.",
    "conj.",
    "det.",
    "pron.",
    "prep.",
    "adv.",
    "adj.",
    "v.",
    "n.",
]


def normalize_text(text: str) -> str:
    text = text.replace("\u00a0", " ")
    for combo, replacement in POS_COMBO_REPLACEMENTS.items():
        text = text.replace(combo, replacement)
    text = re.sub(r"\s*,\s*(n|v|adj|adv|prep|pron|det|conj|exclam)\.", "", text)
    text = re.sub(r"\s*,\s*(modal v|auxiliary v)\.", "", text)
    text = re.sub(r"\bnumber\b", "number.", text)
    text = text.replace("indefinite article", "indefinite article.")
    for marker in POS_MARKERS:
        text = re.sub(re.escape(marker) + r"(?!\n)", marker + "\n", text)
    return text


def extract_text(path: Path) -> str:
    reader = PdfReader(str(path))
    chunks = []
    for page in reader.pages:
        extracted = page.extract_text()
        if extracted:
            chunks.append(extracted)
    return "\n".join(chunks)


def slugify(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r"[^a-z0-9]+", "_", ascii_text)
    return ascii_text.strip("_")


def normalize_family_display(value: str) -> str:
    value = re.sub(r"\s*\([^)]*\)", "", value)
    value = value.strip(" ,;\t\n")
    value = re.sub(r"\s+", " ", value)
    return value.lower()


def split_headwords(raw: str):
    raw = re.sub(r"\s*\([^)]*\)", "", raw)
    raw = raw.strip(" ,;\t\n")
    raw = re.sub(r"\s+", " ", raw)
    raw = re.sub(r"\s+\d+$", "", raw)
    raw = re.sub(r"(\w)\d+$", r"\1", raw)
    parts = [p.strip() for p in raw.split(",")]
    results = []
    for part in parts:
        part = re.sub(r"\s+\d+$", "", part)
        part = re.sub(r"(\w)\d+$", r"\1", part)
        part = part.strip()
        if part and re.search(r"[A-Za-z0-9]", part):
            results.append(part)
    return results


def parse_oxford_pdf(path: Path, levels):
    text = normalize_text(extract_text(path))
    lists = {lvl: [] for lvl in levels}
    current = None

    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        if line in levels:
            current = line
            continue
        if current is None:
            continue
        if line.startswith("© Oxford") or line.startswith("The Oxford"):
            continue

        word_part = None
        for marker in POS_MARKERS:
            if line.endswith(marker):
                word_part = line[: -len(marker)].strip()
                break
        if not word_part:
            continue
        for word in split_headwords(word_part):
            lists[current].append(word)

    return lists


def load_google_list(path: Path):
    words = []
    with path.open("r", encoding="utf-8") as handle:
        for line in handle:
            word = line.strip()
            if word:
                words.append(word)
    return words


def order_candidates(words, freq_rank):
    seen = set()
    ordered = []
    for idx, word in enumerate(words):
        family_key = slugify(word)
        if not family_key or family_key in seen:
            continue
        seen.add(family_key)
        rank = freq_rank.get(family_key, 10**9 + idx)
        ordered.append((rank, idx, word))
    ordered.sort(key=lambda item: (item[0], item[1]))
    return [item[2] for item in ordered]


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
    wanted = ["Front", "Back", "LessonID", "TopicTags", "Family"]
    if not fieldnames:
        return wanted
    for name in wanted:
        if name not in fieldnames:
            fieldnames.append(name)
    return fieldnames


def main():
    base = Path("curricula/EU/CEFR/English_From_German/input/vocab_sources")
    oxford_3000 = base / "The_Oxford_3000_by_CEFR_level.pdf"
    oxford_5000 = base / "The_Oxford_5000_by_CEFR_level.pdf"
    google_list_path = base / "google-10000-english.txt"
    targets_path = Path("curricula/EU/CEFR/targets.json")

    targets = json.loads(targets_path.read_text(encoding="utf-8"))
    level_targets = targets["targets"]["English_From_German"]["levels"]

    oxford_3000_lists = parse_oxford_pdf(oxford_3000, LEVELS_3000)
    oxford_5000_lists = parse_oxford_pdf(oxford_5000, LEVELS_5000)

    google_words = load_google_list(google_list_path)
    freq_rank = {slugify(word): idx for idx, word in enumerate(google_words)}

    candidates = {
        "A1": oxford_3000_lists.get("A1", []),
        "A2": oxford_3000_lists.get("A2", []),
        "B1": oxford_3000_lists.get("B1", []),
        "B2": oxford_3000_lists.get("B2", []) + oxford_5000_lists.get("B2", []),
        "C1": oxford_5000_lists.get("C1", []),
        "C2": [],
    }

    used_families = set()
    for level in ["A1", "A2", "B1", "B2", "C1", "C2"]:
        csv_path = base / f"{level.lower()}_vocab_source.csv"
        rows, fieldnames = load_csv(csv_path)
        fieldnames = ensure_fieldnames(fieldnames)

        existing_families = set()
        lesson_counts = {i: 0 for i in range(1, 13)}
        for row in rows:
            family_raw = row.get("Family") or row.get("WordFamily") or row.get("Front") or ""
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

        target = int(level_targets[level]["incrementalFamilies"])
        needed = target - len(existing_families)
        if needed <= 0:
            continue

        ordered_candidates = order_candidates(candidates[level], freq_rank)
        additions = []
        for word in ordered_candidates:
            if len(additions) >= needed:
                break
            family_key = slugify(word)
            if not family_key or family_key in used_families:
                continue
            used_families.add(family_key)
            additions.append((word, "source_oxford"))

        if len(additions) < needed:
            for word in google_words:
                if len(additions) >= needed:
                    break
                family_key = slugify(word)
                if not family_key or family_key in used_families:
                    continue
                used_families.add(family_key)
                additions.append((word, "source_google"))

        for word, source_tag in additions:
            lesson_id = min(lesson_counts, key=lesson_counts.get)
            lesson_counts[lesson_id] += 1
            rows.append({
                "Front": word,
                "Back": word,
                "LessonID": str(lesson_id),
                "TopicTags": f"auto_frequency,{source_tag},auto_no_translation",
                "Family": normalize_family_display(word),
            })

        write_csv(csv_path, rows, fieldnames)


if __name__ == "__main__":
    main()
