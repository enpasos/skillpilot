
import os
import glob
import sys
# Ensure current directory is in path to import extract_strings
sys.path.append(os.getcwd())
from extract_strings import extract_strings

def main():
    # Specific files to process
    files = [
        "curricula/EU/CEFR/English_From_German/json/EU_EUR_L_CEFR_ENGLISH.de.json",
        "curricula/EU/CEFR/French_From_German/json/EU_EUR_L_CEFR_FRENCH.de.json"
    ]
    output_file = "translated_map.json"
    
    print(f"Found {len(files)} files to process.")

    for i, f in enumerate(files):
        print(f"[{i+1}/{len(files)}] Extracting from {os.path.basename(f)}...")
        if not os.path.exists(f):
            print(f"File not found: {f}")
            continue
            
        try:
            extract_strings(f, output_file)
        except Exception as e:
            print(f"Error processing {f}: {e}")

if __name__ == "__main__":
    main()
