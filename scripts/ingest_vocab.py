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
                
                # ID format: {lang_code}_{level}_l{lesson}_c{count} to be unique globally implies we should include language
                # Previous ID was: f"{level.lower()}_l{l_num}_c{lesson_counters[l_num]}" (e.g. c2_l1_c1)
                # This might collide if we mix languages in the same app context without deck separation.
                # But decks are separate files. However, globally unique IDs are better.
                # Let's add lang prefix: fr_a1_l1_c1
                
                lang_code = language.lower()[:2] # en, fr
                card_id = f"{lang_code}_{level.lower()}_l{l_num}_c{lesson_counters[l_num]}"
                
                # Tags
                tags = [f"lesson_{l_num}", level.lower()]
                if family_raw:
                    family_slug = slugify(family_raw)
                    if family_slug:
                        tags.append(f"family:{family_slug}")
                        families.add(family_slug)
                    else:
                        missing_family += 1
                else:
                    missing_family += 1

                if tags_raw:
                    tags.extend([t.strip() for t in tags_raw.split(',') if t.strip()])
                
                # Category
                category = row.get('Category', '').strip()
                if not category:
                    category = f"Lesson {l_num}"
                
                card = {
                    "id": card_id,
                    "front": front,
                    "back": back,
                    "category": category,
                    "tags": tags
                }
                if family_raw:
                    card["family"] = family_raw
                cards.append(card)
                
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
    
    print(f"Successfully generated {output_json} with {len(cards)} cards.")
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
        
        # Traverse up until we find 'input', then go to sibling 'json'
        # Simple heuristic: go up 2 levels from vocab_sources to 'input', then 1 more to curriculum root
        
        # Example: X/input/vocab_sources/ -> X/input/ -> X/
        
        potential_root = os.path.dirname(os.path.dirname(dir_name))
        if os.path.basename(os.path.dirname(dir_name)) == 'input':
             potential_root = os.path.dirname(os.path.dirname(dir_name))
        
        # Actually proper way:
        # If we are in `vocab_sources`, parent is `input`, parent is `Language_From_German`.
        # We want `Language_From_German/json`.
        
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
