import pandas as pd
import json
import os
import re

excel_path = "curricula/EU/CEFR/CEFR Descriptors (2020).xlsx"
target_files = [
    "curricula/EU/CEFR/English_From_German/json/EU_EUR_L_CEFR_ENGLISH.de.json",
    "curricula/EU/CEFR/French_From_German/json/EU_EUR_L_CEFR_FRENCH.de.json"
]

def load_mapping(path):
    print(f"Loading Excel mapping from {path}...")
    try:
        # Load sheets
        df_de = pd.read_excel(path, sheet_name="Deutsch")
        df_en = pd.read_excel(path, sheet_name="English")
        
        # Normalize column names (strip whitespace)
        df_de.columns = df_de.columns.str.strip()
        df_en.columns = df_en.columns.str.strip()
        
        # Create map: German Text -> English Text
        # We assume 'No' column matches between sheets or we can just map row-by-row if sorted
        # Ideally join on 'No'
        
        # Check if 'No' exists
        if 'No' not in df_de.columns or 'No' not in df_en.columns:
            print("Error: 'No' column missing in sheets.")
            return {}

        # Merge on 'No'
        merged = pd.merge(df_de, df_en, on="No", suffixes=('_de', '_en'))
        
        # Map Deskriptoren -> Descriptor
        # Column names might have newlines, so we use fuzzy matching or exact known names
        col_de = 'Deskriptoren'
        col_en = 'Descriptor'
        
        if col_de not in merged.columns or col_en not in merged.columns:
            print(f"Columns in merged: {merged.columns}")
            # Fallback to finding columns containing 'Desc...'
            col_de = [c for c in merged.columns if 'Deskriptoren' in c][0]
            col_en = [c for c in merged.columns if 'Descriptor' in c][0]
            
        mapping = dict(zip(merged[col_de], merged[col_en]))
        print(f"Loaded {len(mapping)} translation pairs.")
        return mapping
        
    except Exception as e:
        print(f"Failed to load Excel: {e}")
        return {}

def humanize_topic_code(code):
    if not code:
        return ""
    # Replace underscores with spaces
    text = code.replace("_", " ")
    # Capitalize first letter
    return text.capitalize()

def process_file(file_path, mapping):
    print(f"Processing {file_path}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        updates = 0
        
        def process_goals(goals):
            nonlocal updates
            for goal in goals:
                # Update Description
                de_desc = goal.get('description', '')
                if de_desc in mapping:
                    goal['descriptionEn'] = mapping[de_desc]
                    # print(f"Translated description for {goal.get('id')}")
                    updates += 1
                
                # Update Title
                # If leaf node (has dimensionTags with topicCode)
                dims = goal.get('dimensionTags', {})
                topic_code = dims.get('topicCode') if dims else None
                
                if topic_code:
                    humanized = humanize_topic_code(topic_code)
                    
                    # Try to find level from tags or title
                    level = ""
                    current_title = goal.get('title', '')
                    match = re.search(r'\[([A-Z0-9]+)\]', current_title)
                    if match:
                        level = match.group(1)
                    else:
                        # try tags
                        tags = goal.get('tags', [])
                        for t in tags:
                            if t.startswith('cefr:'):
                                level = t.replace('cefr:', '')
                                break
                    
                    new_title_en = f"[{level}] {humanized}" if level else humanized
                    goal['titleEn'] = new_title_en
                    # print(f"Generated title: {new_title_en}")
                
        # Recursively process? The content seems flat in the 'goals' array from previous view matches
        # The file structure is: { ..., goals: [ ... ] }
        # And goals have 'contains' lists, but the goal definitions are all flat in the main 'goals' list.
        
        if 'goals' in data:
            process_goals(data['goals'])
            
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
            
        print(f"Updated {updates} descriptions in {file_path}")
        
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    mapping = load_mapping(excel_path)
    if not mapping:
        print("No mapping available, aborting.")
        return
        
    for fp in target_files:
        if os.path.exists(fp):
            process_file(fp, mapping)
        else:
            print(f"File not found: {fp}")

if __name__ == "__main__":
    main()
