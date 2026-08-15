import shutil
from pathlib import Path

# Setup paths
SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent
SOURCE_DIR = PROJECT_ROOT / "docs" / "quickstart"
DEST_DIR = PROJECT_ROOT / "app" / "public"

PUBLIC_QUICKSTART_PATTERNS = (
    "story.*.md",
    "comic_prompts.*.md",
    "comic*.png",
    "screenshot_*.png",
    "quickstart-*.webp",
)


def is_public_quickstart_asset(path: Path) -> bool:
    return path.is_file() and any(path.match(pattern) for pattern in PUBLIC_QUICKSTART_PATTERNS)


def is_source_asset(path: Path) -> bool:
    return path.is_file() and ":Zone.Identifier" not in path.name

def main():
    print(f"Deploying Story assets from {SOURCE_DIR} to {DEST_DIR}...")

    if not SOURCE_DIR.exists():
        print(f"Error: Source directory {SOURCE_DIR} does not exist.")
        exit(1)

    if not DEST_DIR.exists():
        DEST_DIR.mkdir(parents=True, exist_ok=True)

    removed_count = 0
    for item in DEST_DIR.iterdir():
        if is_public_quickstart_asset(item):
            item.unlink()
            print(f"Removed stale public story asset: {item.name}")
            removed_count += 1

    copied_count = 0
    for item in SOURCE_DIR.iterdir():
        if is_source_asset(item):
            shutil.copy2(item, DEST_DIR / item.name)
            print(f"Copied: {item.name}")
            copied_count += 1

    print(f"Successfully deployed {copied_count} story assets ({removed_count} stale public assets removed).")

if __name__ == "__main__":
    main()
