import csv
import json
import os
import argparse

def ingest_vocab(level, source_csv, output_json, deck_title):
    deck_id = f"cefr_{level.lower()}_english_vocabulary"
    
    cards = []
    
    # Map lesson ID to lesson titles (simplified for now, or read from curriculum? 
    # For now we just use generic titles or read from CSV if provided, 
    # but the user asked for mapping to lessons 1-12)
    
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
                
                card_id = f"{level.lower()}_l{l_num}_c{lesson_counters[l_num]}"
                
                # Tags
                tags = [f"lesson_{l_num}", level.lower()]
                if tags_raw:
                    tags.extend([t.strip() for t in tags_raw.split(',') if t.strip()])
                
                # Category
                # We can fetch specific lesson themes if we want, but for now generic is safe
                category = f"Lesson {l_num}"
                
                card = {
                    "id": card_id,
                    "front": front,
                    "back": back,
                    "category": category,
                    "tags": tags
                }
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Ingest CSV vocabulary to JSON deck")
    parser.add_argument("--level", required=True, help="CEFR Level (A1, A2, B1, B2, C1, C2)")
    parser.add_argument("--src", required=True, help="Path to source CSV")
    parser.add_argument("--out", required=True, help="Path to output JSON")
    parser.add_argument("--title", required=True, help="Title of the deck")
    
    args = parser.parse_args()
    
    ingest_vocab(args.level, args.src, args.out, args.title)
