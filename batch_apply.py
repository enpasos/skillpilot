
import os
import glob
import sys
# Ensure current directory is in path to import apply_translations
sys.path.append(os.getcwd())
try:
    from apply_translations import apply_translations
except ImportError:
    print("Could not import apply_translations")
    sys.exit(1)

def main():
    target_dir = "curricula/DE/BW/Uni_Mannheim/Master_Jura/json"
    map_file = "translated_map.json"
    
    if not os.path.exists(target_dir):
        print(f"Directory not found: {target_dir}")
        return

    files = glob.glob(os.path.join(target_dir, "*.json"))
    print(f"Found {len(files)} files to process.")

    for i, f in enumerate(files):
        print(f"[{i+1}/{len(files)}] Applying translations to {os.path.basename(f)}...")
        try:
            apply_translations(f, map_file)
        except Exception as e:
            print(f"Error processing {f}: {e}")

if __name__ == "__main__":
    main()
