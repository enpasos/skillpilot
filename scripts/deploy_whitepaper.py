import os
import re
import shutil


PAGE_BREAK_DIV_PATTERN = re.compile(
    r'^[ \t]*<div\s+style=["\']page-break-after:\s*always;?["\']\s*>\s*</div>\s*\r?\n?',
    re.IGNORECASE | re.MULTILINE
)


def sanitize_markdown_for_web_gui(content):
    return PAGE_BREAK_DIV_PATTERN.sub("", content)


def copy_assets(source_dir, target_dir, allowed_extensions):
    if not os.path.isdir(source_dir):
        print(f"Source directory not found: {source_dir}")
        return 0

    if os.path.exists(target_dir):
        shutil.rmtree(target_dir)
    os.makedirs(target_dir, exist_ok=True)

    count = 0
    for name in os.listdir(source_dir):
        source_path = os.path.join(source_dir, name)
        if not os.path.isfile(source_path):
            continue
        ext = os.path.splitext(name)[1].lower()
        if ext not in allowed_extensions:
            continue
        target_path = os.path.join(target_dir, name)
        if ext == ".md":
            with open(source_path, "r", encoding="utf-8") as source_file:
                source_content = source_file.read()
            with open(target_path, "w", encoding="utf-8") as target_file:
                target_file.write(sanitize_markdown_for_web_gui(source_content))
        else:
            shutil.copy2(source_path, target_path)
        count += 1

    print(f"Deployed {count} assets to {target_dir}")
    return count


def deploy_whitepaper():
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    whitepaper_src = os.path.join(project_root, "docs", "whitepaper")
    whitepaper_dest = os.path.join(project_root, "app", "public", "whitepaper")
    comic1_src = os.path.join(project_root, "docs", "comic1")
    comic1_dest = os.path.join(project_root, "app", "public", "comic1")
    comic2_src = os.path.join(project_root, "docs", "comic2")
    comic2_dest = os.path.join(project_root, "app", "public", "comic2")
    comic3_src = os.path.join(project_root, "docs", "comic3")
    comic3_dest = os.path.join(project_root, "app", "public", "comic3")

    total = 0
    total += copy_assets(whitepaper_src, whitepaper_dest, {".md", ".png", ".jpg", ".jpeg", ".svg", ".pdf", ".mp4"})
    total += copy_assets(comic1_src, comic1_dest, {".png", ".jpg", ".jpeg"})
    total += copy_assets(comic2_src, comic2_dest, {".png", ".jpg", ".jpeg"})
    total += copy_assets(comic3_src, comic3_dest, {".png", ".jpg", ".jpeg"})

    print(f"Deployment complete. {total} whitepaper assets deployed.")


if __name__ == "__main__":
    deploy_whitepaper()
