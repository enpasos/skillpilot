
import json
import sys

def apply_translations(target_file, map_file):
    with open(map_file, 'r', encoding='utf-8') as f:
        translation_map = json.load(f)
    
    with open(target_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    count = 0
    
    def process_node(node):
        nonlocal count
        title = node.get('title')
        if title and title in translation_map:
            if node.get('titleEn') != translation_map[title]:
                node['titleEn'] = translation_map[title]
                count += 1
        
        description = node.get('description')
        if description and description in translation_map:
             if node.get('descriptionEn') != translation_map[description]:
                node['descriptionEn'] = translation_map[description]
                count += 1

    # Process root
    process_node(data)
    
    # Process goals
    for goal in data.get('goals', []):
        process_node(goal)
            
    with open(target_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    
    print(f"Applied {count} translations to {target_file}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 apply_translations.py <target_json> <map_json>")
    else:
        apply_translations(sys.argv[1], sys.argv[2])
