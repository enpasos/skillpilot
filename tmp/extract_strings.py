
import json
import sys

def extract_strings(filepath, output_path):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    unique_strings = {}
    try:
        with open(output_path, 'r', encoding='utf-8') as f:
            unique_strings = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        pass

    def process_node(node):
        # check title
        title = node.get('title')
        titleEn = node.get('titleEn')
        if title and (not titleEn or title == titleEn):
            unique_strings[title] = title
        
        # check description
        desc = node.get('description')
        descEn = node.get('descriptionEn')
        if desc and (not descEn or desc == descEn):
            unique_strings[desc] = desc

    # Process root
    process_node(data)
    
    # Process goals
    for goal in data.get('goals', []):
        process_node(goal)
            
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(unique_strings, f, indent=2, ensure_ascii=False)
    
    print(f"Extracted {len(unique_strings)} unique strings to {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 extract_strings.py <input_json> <output_json>")
    else:
        extract_strings(sys.argv[1], sys.argv[2])
