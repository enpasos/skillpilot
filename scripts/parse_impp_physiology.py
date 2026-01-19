import re
import json
import sys
from pathlib import Path

def parse_impp_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    entries = []
    current_entry = None
    
    # Heuristic column boundaries based on visual inspection
    # These might need tuning.
    # Col 1 (ID): 0-8
    # Col 2 (Topic): 8-27
    # Col 3 (Details): 27-74
    # Col 4 (Examples): 74+
    
    COL1_END = 8
    COL2_END = 23
    COL3_END = 72

    # Regex for ID (e.g., "1", "1.1", "1.3.1")
    id_pattern = re.compile(r'^\s*(\d+(\.\d+)*)\s+')

    for line in lines:
        # Skip page headers/footers
        if "IMPP-GK 1" in line or "„Physiologie“" in line or "\f" in line:
            continue
        if line.strip() == "":
            continue

        # Check for new entry start
        match = id_pattern.match(line[:COL1_END])
        if match:
            # Save previous entry
            if current_entry:
                entries.append(current_entry)
            
            # Start new entry
            impp_id = match.group(1)
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
                
                if raw_topic: current_entry["topic"].append(raw_topic)
                if raw_details: current_entry["details"].append(raw_details)
                if raw_examples: current_entry["examples"].append(raw_examples)

    # Append last entry
    if current_entry:
        entries.append(current_entry)

    # Clean up fields
    final_entries = []
    for e in entries:
        topic_str = " ".join(e["topic"]).replace("- ", "")
        details_str = " ".join(e["details"]).replace("- ", "")
        examples_str = " ".join(e["examples"]).replace("- ", "")
        
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

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python parse_impp.py <input_txt> <output_json>")
        sys.exit(1)
        
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    data = parse_impp_text(input_file)
    
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Parsed {len(data)} entries to {output_file}")
