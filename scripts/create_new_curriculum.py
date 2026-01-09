import argparse
import logging
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def create_curriculum_structure(subject: str, degree: str, base_dir: Path):
    """Creates the folder structure and input file for a new curriculum."""
    
    # Path: curricula/DE/BY/TUM/{Subject}/{Degree}
    target_dir = base_dir / "curricula" / "DE" / "BY" / "TUM" / subject / degree
    input_dir = target_dir / "input"
    json_dir = target_dir / "json"
    
    # 1. Create Directories
    if target_dir.exists():
        logger.warning(f"Target directory already exists: {target_dir}")
        # We don't exit, just continue to ensure input dir exists
    
    input_dir.mkdir(parents=True, exist_ok=True)
    json_dir.mkdir(parents=True, exist_ok=True)
    logger.info(f"Created directories at {target_dir}")
    
    # 2. Create Template Input File
    input_file = input_dir / "DE_BAY_U_TUM_xyz.txt"
    if input_file.exists():
        logger.info(f"Input file already exists: {input_file}")
    else:
        template_content = f"""https://academics.nat.tum.de/org/mh/details/mod/$m

$m          Beschreibung
# Example:
# IN0001      Einführung in die Informatik
"""
        with open(input_file, 'w', encoding='utf-8') as f:
            f.write(template_content)
        logger.info(f"Created template input file: {input_file}")
        
    print(f"\nSuccess! Setup complete for {subject} / {degree}")
    print(f"1. Open {input_file}")
    print(f"2. Add module codes (one per line, e.g. 'IN0001 Title')")
    print(f"3. Run: python3 scripts/scrape_tum_curriculum.py {input_file}")

def main():
    parser = argparse.ArgumentParser(description="Setup a new TUM curriculum structure.")
    parser.add_argument("subject", help="Subject name (e.g. Informatics, Chemistry)")
    parser.add_argument("degree", help="Degree program name (e.g. BSc_Informatics)")
    
    args = parser.parse_args()
    
    # Assume script is run from project root, or try to find it
    cwd = Path.cwd()
    if (cwd / "curricula").exists():
        base_dir = cwd
    elif (cwd.parent / "curricula").exists():
        base_dir = cwd.parent
    else:
        logger.error("Could not find 'curricula' directory. Please run from project root.")
        sys.exit(1)
        
    create_curriculum_structure(args.subject, args.degree, base_dir)

if __name__ == "__main__":
    main()
