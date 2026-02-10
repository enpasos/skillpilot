import os
import re
import shutil

def deploy_decks():
    # Root of the project (assuming script is in scripts/)
    project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    curricula_dir = os.path.join(project_root, "curricula")
    target_dirs = [
        os.path.join(project_root, "app", "public", "data"),
        os.path.join(project_root, "backend", "src", "main", "resources", "static", "data"),
    ]
    
    print(f"Deploying decks from {curricula_dir} to {', '.join(target_dirs)}...")
    
    for target_dir in target_dirs:
        if not os.path.exists(target_dir):
            os.makedirs(target_dir, exist_ok=True)
            print(f"Created target directory: {target_dir}")

    count = 0
    deck_pattern = re.compile(r"_deck([._][a-z]{2})?\.json$", re.IGNORECASE)

    for root, dirs, files in os.walk(curricula_dir):
        # We only care about 'json' directories directly under a curriculum folder usually, 
        # but walking everything is safe as long as filename matches.
        # Strict rule: Source of truth = 'json' folder.
        if os.path.basename(root) != 'json':
            continue
            
        for file in files:
            if not deck_pattern.search(file):
                continue

            source_path = os.path.join(root, file)
            for target_dir in target_dirs:
                dest_path = os.path.join(target_dir, file)

                try:
                    shutil.copy2(source_path, dest_path)
                    print(f"Deployed: {file} -> {target_dir}")
                    count += 1
                except Exception as e:
                    print(f"Error deploying {file} to {target_dir}: {e}")

    print(f"Deployment complete. {count} decks deployed.")

if __name__ == "__main__":
    deploy_decks()
