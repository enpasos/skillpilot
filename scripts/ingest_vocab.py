import csv
import json
import os
import argparse
import re
import unicodedata


def slugify(value):
    normalized = unicodedata.normalize('NFKD', value)
    ascii_text = normalized.encode('ascii', 'ignore').decode('ascii')
    ascii_text = ascii_text.lower()
    ascii_text = re.sub(r'[^a-z0-9]+', '_', ascii_text)
    return ascii_text.strip('_')

def ingest_vocab(level, language, source_csv, output_json, deck_title):
    deck_id = f"cefr_{level.lower()}_{language.lower()}_vocabulary"
    
    cards = []
    families = set()
    missing_family = 0
    
    try:
        with open(source_csv, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f, delimiter=';')
            
            # Grouping counters
            lesson_counters = {}
            
            for row in reader:
                front = row.get('Front', '').strip()
                back = row.get('Back', '').strip()
                lesson_id = row.get('LessonID', '').strip() # Expecting "1", "2", ... "12"
                tags_raw = row.get('TopicTags', '').strip()
                family_raw = row.get('Family') or row.get('WordFamily') or ''
                family_raw = family_raw.strip()
                
                if not front or not back or not lesson_id:
                    continue
                
                # Ensure LessonID is valid (1-12)
                try:
                    l_num = int(lesson_id)
                    if l_num < 1 or l_num > 12:
                        print(f"Warning: Invalid LessonID {lesson_id} for word '{front}'. Skipping.")
                        continue
                except ValueError:
                    print(f"Warning: Non-numeric LessonID {lesson_id} for word '{front}'. Skipping.")
                    continue

                # Generate ID
                if l_num not in lesson_counters:
                    lesson_counters[l_num] = 0
                lesson_counters[l_num] += 1
                
                # ID format: {lang_code}_{level}_l{lesson}_c{count}
                lang_code = language.lower()[:2] # en, fr
                
                # Selector Tags (for separate goal filtering)
                tag_fwd = f"select:l{l_num}_fwd"
                tag_rev = f"select:l{l_num}_rev"
                
                # Common Tags
                common_tags = [f"lesson_{l_num}", level.lower()]
                if family_raw:
                    family_slug = slugify(family_raw)
                    if family_slug:
                        common_tags.append(f"family:{family_slug}")
                        families.add(family_slug)
                    else:
                        missing_family += 1
                else:
                    missing_family += 1
                
                if tags_raw:
                    common_tags.extend([t.strip() for t in tags_raw.split(',') if t.strip()])
                
                # Category
                category = row.get('Category', '').strip()
                if not category:
                    category = f"Lesson {l_num}"
                
                # 1. Forward Card (Foreign -> Native)
                # No suffix for ID to maintain compatibility with existing progress if mapped
                id_fwd = f"{lang_code}_{level.lower()}_l{l_num}_c{lesson_counters[l_num]}"
                
                card_fwd = {
                    "id": id_fwd,
                    "front": front,
                    "back": back,
                    "category": category,
                    "tags": common_tags + [tag_fwd]
                }
                if family_raw: card_fwd["family"] = family_raw
                cards.append(card_fwd)
                
                # 2. Reverse Card (Native -> Foreign)
                id_rev = f"{id_fwd}_rev"
                
                card_rev = {
                    "id": id_rev,
                    "front": back, # Swap
                    "back": front,
                    "category": f"{category} (Rev)",
                    "tags": common_tags + [tag_rev, "reverse"]
                }
                if family_raw: card_rev["family"] = family_raw
                cards.append(card_rev)
                
    except FileNotFoundError:
        print(f"Error: Source file {source_csv} not found.")
        return

    deck = {
        "deckId": deck_id,
        "title": deck_title,
        "cards": cards
    }
    
    # Write to JSON
    with open(output_json, 'w', encoding='utf-8') as f:
        json.dump(deck, f, indent=4, ensure_ascii=False)
    
    print(f"Successfully generated {output_json} with {len(cards)} cards (Original+Reverse).")
    if families:
        print(f"Unique families: {len(families)}")
    if missing_family:
        print(f"Cards without family tag: {missing_family}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest CSV vocabulary to JSON deck")
    parser.add_argument("--level", required=True, help="CEFR Level (A1, A2, B1, B2, C1, C2)")
    parser.add_argument("--src", required=True, help="Path to source CSV")
    parser.add_argument("--out", required=False, help="Path to output JSON (optional, auto-derived if omitted)")
    parser.add_argument("--title", required=True, help="Title of the deck")
    parser.add_argument("--language", default="English", help="Language (English, French, etc.)")
    
    args = parser.parse_args()
    
    # Auto-derive output path if not specified
    output_path = args.out
    if not output_path:
        # Expected structure: curricula/EU/CEFR/.../input/vocab_sources/file.csv
        # We want to go to:   curricula/EU/CEFR/.../json/cefr_{level}_{lang}_deck.json
        
        abs_src = os.path.abspath(args.src)
        dir_name = os.path.dirname(abs_src)
        
        if 'vocab_sources' in dir_name:
             # Assume standard structure
             curriculum_root = os.path.dirname(os.path.dirname(dir_name))
             target_dir = os.path.join(curriculum_root, "json")
        else:
             # Fallback: same dir as src
             target_dir = dir_name

        if not os.path.exists(target_dir):
            try:
                os.makedirs(target_dir, exist_ok=True)
            except:
                pass
            
        filename = f"cefr_{args.level.lower()}_{args.language.lower()}_deck.json"
        output_path = os.path.join(target_dir, filename)
        print(f"Auto-derived output path: {output_path}")

    ingest_vocab(args.level, args.language, args.src, output_path, args.title)
