
import os
import glob
import sys
# Ensure current directory is in path to import extract_strings
sys.path.append(os.getcwd())
from extract_strings import extract_strings

def main():
    target_dir = "curricula/DE/BW/Uni_Mannheim/Master_Jura/json"
    output_file = "translated_map.json"
    
    # Check if directory exists
    if not os.path.exists(target_dir):
        print(f"Directory not found: {target_dir}")
        return

    # Get all .json files (both .de.json and .en.json, filtering handled by logic or just verify all)
    # User asked for specific files but implied the whole directory. 
    # We will process all .json files.
    files = glob.glob(os.path.join(target_dir, "*.json"))
    print(f"Found {len(files)} files to process.")

    for i, f in enumerate(files):
        print(f"[{i+1}/{len(files)}] Extracting from {os.path.basename(f)}...")
        try:
            extract_strings(f, output_file)
        except Exception as e:
            print(f"Error processing {f}: {e}")

if __name__ == "__main__":
    main()
