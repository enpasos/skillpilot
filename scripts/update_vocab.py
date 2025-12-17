
import re
import json
import os


base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
md_path = os.path.join(base_dir, "sandbox", "400_most_important_english_vocabs.md")
json_path = os.path.join(base_dir, "app", "src", "assets", "data", "vocab_400.json")

# Regex to find: **word** (translation)
# Also handles variants like **word/variant**
pattern = r"\*\*\s*([a-zA-Z0-9\/\s]+?)\s*\*\*\s*\(([^)]+)\)"

cards = []
count = 0

with open(md_path, "r", encoding="utf-8") as f:
    for line in f:
        matches = re.finditer(pattern, line)
        for match in matches:
            if count >= 400:
                break
            
            english = match.group(1).strip()
            german = match.group(2).strip()
            
            # Simple Category mapping based on line context could be complex.
            # For this script, we'll assign a generic category or try to infer simple ones?
            # Actually, the file has headings "### Category X..."
            # We could track them. But simplicity first: just id and content.
            # The current JSON uses categories like "pronouns", "verbs_top".
            # We'll map them generically or just use "vocab" if we can't parse perfectly.
            # Better: read the current category from the file context.
            
            cards.append({
                "id": f"v_{count+1:03d}",
                "front": english,
                "back": german,
                "category": "general" # Placeholder, maybe refine if needed
            })
            count += 1
        if count >= 400:
            break

# Refine categories by reading file again with state machine logic
cards = []
current_category = "general"
count = 0

with open(md_path, "r", encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if count >= 400:
            break
            
        if line.startswith("### Category"):
            # Extract category name roughly
            # e.g. "### Category 1: Die "Strukturwörter"..." -> "structure"
            # tailored mapping:
            if "Struktur" in line: current_category = "structure"
            elif "Verben" in line: current_category = "verbs"
            elif "Substantive" in line: current_category = "nouns"
            elif "Adjektive" in line: current_category = "adjectives"
            elif "Fragewörter" in line: current_category = "questions_numbers"
            elif "Essen" in line: current_category = "food"
            elif "Kleidung" in line: current_category = "clothing"
            elif "Natur" in line: current_category = "nature"
            elif "Gesellschaft" in line: current_category = "society"
            else: current_category = "mixed"

        matches = re.finditer(pattern, line)
        for match in matches:
            if count >= 400:
                break
            
            english = match.group(1).strip()
            german = match.group(2).strip()
            
            cards.append({
                "id": f"v_{count+1:03d}",
                "front": english,
                "back": german,
                "category": current_category
            })
            count += 1

output = {
    "deckId": "eng_400_foundation",
    "title": "English Foundation 400",
    "cards": cards
}

with open(json_path, "w", encoding="utf-8") as f:
    json.dump(output, f, indent=4, ensure_ascii=False)

print(f"Successfully wrote {len(cards)} cards to {json_path}")
