import shutil
import os
from pathlib import Path

# Setup paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
SOURCE_DIR = PROJECT_ROOT / "docs" / "quickstart"
DEST_DIR = PROJECT_ROOT / "app" / "public"

def main():
    print(f"Deploying Story assets from {SOURCE_DIR} to {DEST_DIR}...")

    if not SOURCE_DIR.exists():
        print(f"Error: Source directory {SOURCE_DIR} does not exist.")
        exit(1)

    if not DEST_DIR.exists():
        DEST_DIR.mkdir(parents=True, exist_ok=True)

    copied_count = 0
    for item in SOURCE_DIR.iterdir():
        if item.is_file():
            shutil.copy2(item, DEST_DIR / item.name)
            print(f"Copied: {item.name}")
            copied_count += 1

    print(f"Successfully deployed {copied_count} story assets.")

if __name__ == "__main__":
    main()
