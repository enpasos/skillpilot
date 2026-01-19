import re
import json
import sys
import argparse
from pathlib import Path

def parse_impp_text(file_path, col_boundaries=None, subject_name="Unknown"):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    entries = []
    current_entry = None
    
    # Default boundaries based on Physiology tuning (approximate for others)
    # Col 1 (ID): 0-8
    # Col 2 (Topic): 8-27 or 8-23
    # Col 3 (Details): 27-74 or 23-72
    # Col 4 (Examples): 74+ or 72+
    
    if col_boundaries:
        b = col_boundaries
    else:
        # Default fallback
        b = [8, 27, 74]

    COL1_END = b[0]
    COL2_END = b[1]
    COL3_END = b[2]

    # Regex for ID (e.g., "1", "1.1", "1.3.1")
    id_pattern = re.compile(r'^\s*(\d+(\.\d+)*)\s+$') # Strict end of ID col
    # Relaxed ID pattern to catch IDs that might have touching text or slight misalignment
    id_pattern_relaxed = re.compile(r'^\s*(\d+(\.\d+)*)') 

    for line in lines:
        # Skip likely headers/footers
        if "IMPP-GK" in line or "Gegenstandskatalog" in line or "\f" in line or "Seite" in line:
            continue
        if len(line.strip()) < 3: # Skip empty or very short lines
            continue

        # Check for new entry start in the first column
        col1_text = line[:COL1_END]
        match = id_pattern_relaxed.match(col1_text)
        
        # Heuristic: It's a new entry if we find an ID at the start
        if match:
            # Save previous entry
            if current_entry:
                entries.append(current_entry)
            
            # Start new entry
            impp_id = match.group(1)
            
            # Extract columns
            raw_topic = line[COL1_END:COL2_END].strip()
            raw_details = line[COL2_END:COL3_END].strip()
            raw_examples = line[COL3_END:].strip()
            
            current_entry = {
                "id": impp_id,
                "topic": [raw_topic] if raw_topic else [],
                "details": [raw_details] if raw_details else [],
                "examples": [raw_examples] if raw_examples else []
            }
        else:
            # Continuation line
            if current_entry:
                raw_topic = line[COL1_END:COL2_END].strip()
                raw_details = line[COL2_END:COL3_END].strip()
                raw_examples = line[COL3_END:].strip()
                
                # Append to lists if not empty, preserving structure loosely
                if raw_topic: current_entry["topic"].append(raw_topic)
                if raw_details: current_entry["details"].append(raw_details)
                if raw_examples: current_entry["examples"].append(raw_examples)

    # Append last entry
    if current_entry:
        entries.append(current_entry)

    # Clean up fields
    final_entries = []
    for e in entries:
        # Removing hyphenation artifacts explicitly
        topic_str = clean_text(" ".join(e["topic"]))
        details_str = clean_text(" ".join(e["details"]))
        examples_str = clean_text(" ".join(e["examples"]))
        
        # Determine level
        level = e["id"].count('.') + 1
        
        final_entries.append({
            "impp_id": e["id"],
            "level": level,
            "topic": topic_str,
            "description": details_str,
            "clinical_examples": examples_str
        })
        
    return final_entries

def clean_text(text):
    # Basic cleanup: remove hyphens at end of words if they look like line breaks
    # This is a simple heuristic. 
    # "Verhaltens- analyse" -> "Verhaltensanalyse"
    # "und -bewertung" -> "und -bewertung" (keep)
    
    # 1. Join split words (hyphen followed by space)
    # Be careful not to join "und -" or list items.
    # Regex: letter, hyphen, space, letter -> join
    text = re.sub(r'(\w)-\s+(\w)', r'\1\2', text)
    
    # 2. Collapse multiple spaces
    text = re.sub(r'\s+', ' ', text).strip()
    
    return text

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Parse IMPP Text Catalogs')
    parser.add_argument('input_file', help='Path to raw text file')
    parser.add_argument('output_file', help='Path to output JSON file')
    parser.add_argument('--boundaries', nargs=3, type=int, help='Column boundaries (e.g., 8 23 72)', default=None)
    parser.add_argument('--subject', help='Subject name', default='Unknown')

    args = parser.parse_args()
    
    data = parse_impp_text(args.input_file, args.boundaries, args.subject)
    
    with open(args.output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Parsed {len(data)} entries for {args.subject} to {args.output_file}")
