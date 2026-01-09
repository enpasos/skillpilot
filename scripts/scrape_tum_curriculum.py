import argparse
import logging
import os
import re
import sys
import json
import uuid
import time
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from typing import Dict, List, Optional, Tuple, Generator

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Constants
TIMEOUT = 30  # seconds
API_BASE_URL = "https://academics.nat.tum.de/api/v1/mhb/{code}"

def parse_input_file(filepath: Path) -> Tuple[Optional[str], List[Dict[str, str]]]:
    """
    Parses the input xyz.txt file to extract modules.
    Format:
    line 1: url template with $m
    ...
    line N: $m ... column header
    following lines: CODE Title...
    """
    url_template = None
    modules = []
    
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    start_parsing = False
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if '$m' in line and not start_parsing:
            if line.startswith('http'):
                url_template = line.strip()
            elif 'Beschreibung' in line:
                start_parsing = True
            continue
            
        if start_parsing:
            parts = line.split(maxsplit=1)
            if len(parts) >= 2:
                modules.append({
                    "code": parts[0],
                    "title": parts[1]
                })
            elif len(parts) == 1:
                modules.append({
                    "code": parts[0],
                    "title": ""
                })
    
    return url_template, modules

def clean_text(text: str) -> str:
    """Clean whitespace from text."""
    if not text:
        return ""
    # Remove zero-width spaces and other oddities
    text = text.replace('\u200b', '')
    return re.sub(r'\s+', ' ', text).strip()

def generate_deterministic_uuid(namespace_str: str, name: str) -> str:
    """Generate a stable UUID v5 based on a namespace and name."""
    SKILLPILOT_NAMESPACE = uuid.uuid5(uuid.NAMESPACE_DNS, "skillpilot.io")
    return str(uuid.uuid5(SKILLPILOT_NAMESPACE, f"{namespace_str}/{name}"))

def parse_html_content(html_content: str) -> str:
    """Parses HTML content strings from JSON to plain text (preserving structural breaks)."""
    if not html_content:
        return ""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Simple conversion: replace <br> and <p> with newlines
    for br in soup.find_all("br"):
        br.replace_with("\n")
    for p in soup.find_all("p"):
        p.insert_before("\n\n")
        p.unwrap()
    for li in soup.find_all("li"):
        li.insert_before("\n• ")
        li.unwrap()
        
    return clean_text(soup.get_text())

def parse_html_list(html_content: str) -> List[str]:
    """Parses an HTML list (ul/ol) into a list of strings."""
    if not html_content:
        return []
    soup = BeautifulSoup(html_content, 'html.parser')
    items = []
    for li in soup.find_all('li'):
        text = clean_text(li.get_text())
        if text:
            items.append(text)
            
    # Fallback if no <li> found but content exists (e.g. just p tags)
    if not items and html_content:
        # Split by <p> tags if present
        if soup.find('p'):
             for p in soup.find_all('p'):
                 text = clean_text(p.get_text())
                 if text:
                     items.append(text)
        else:
            text = clean_text(soup.get_text())
            if text:
                items.append(text)
            
    return items

def scrape_module_api(code: str) -> Dict:
    """Fetches module details from the TUM API."""
    url = API_BASE_URL.format(code=code)
    logger.info(f"Fetching {code} from API: {url}")
    
    try:
        response = requests.get(url, timeout=TIMEOUT)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        logger.error(f"Failed to fetch {url}: {e}")
        return {}

def process_module_data(code: str, api_data: Dict) -> Dict:
    """Processes API data into our internal format."""
    if not api_data:
        return {}
        
    data = {}
    
    # 1. Basic Info
    data['title'] = clean_text(api_data.get('module_title', ''))
    data['ects'] = float(api_data.get('module_credits', 0) or 0)
    
    # 2. Description (Inhalt + Voraussetzungen)
    content_html = api_data.get('module_content', '')
    precond_html = api_data.get('module_precondition', '')
    
    description_text = parse_html_content(content_html)
    
    if precond_html:
        precond_text = parse_html_content(precond_html)
        if precond_text and "Keine" not in precond_text and "None" not in precond_text:
             description_text += f"\n\n**Voraussetzungen / Prerequisites:**\n{precond_text}"
             
    data['description'] = description_text
    
    # 3. Outcomes (Lernergebnisse)
    outcome_html = api_data.get('module_outcome', '')
    data['goals'] = parse_html_list(outcome_html)
    
    return data

def generate_json(module_input: Dict, scraped_data: Dict, url_template: str, output_dir: Path):
    """Generates the Skillpilot JSON file."""
    code = module_input['code']
    original_title = module_input['title']
    
    # Prioritize API title, fallback to input file
    final_title = scraped_data.get('title') or original_title or code
        
    module_id = generate_deterministic_uuid("tum-module", code)
    
    goals_list = []
    sub_goal_ids = []
    
    # Sub-goals (Competencies)
    competencies = scraped_data.get('goals', [])
    for i, comp_text in enumerate(competencies):
        if not comp_text: continue
        
        # Create a sub-goal
        sub_id = generate_deterministic_uuid("tum-goal-sub", f"{code}-{i}")
        sub_goal_ids.append(sub_id)
        
        # Heuristic Title
        comp_title = "Lernergebnis"
        if len(comp_text) < 60:
            comp_title = comp_text
        else:
             # Try to find first sentence
             parts = comp_text.split('.', 1)
             if len(parts[0]) < 80:
                 comp_title = parts[0] + "."
        
        sub_goal = {
            "id": sub_id,
            "shortKey": f"tum_{code.lower()}_lo{i+1}",
            "title": comp_title,
            "titleEn": "Learning Outcome",
            "description": comp_text,
            "descriptionEn": comp_text,
            "core": True,
            "weight": 0.0,
            "phase": "Modul",
            "area": "Kompetenz",
            "tags": [ f"module:{code}" ],
            "contains": [],
            "requires": []         
        }
        goals_list.append(sub_goal)
        
    # Root Goal
    source_url = url_template.replace('$m', code) if url_template else f"https://academics.nat.tum.de/org/mh/details/mod/{code}"
    
    root_goal = {
        "id": generate_deterministic_uuid("tum-goal-root", code),
        "shortKey": f"tum_{code.lower()}_module",
        "title": f"{final_title} (Modul {code})",
        "titleEn": f"{final_title} (Module {code})",
        "description": scraped_data.get('description', ''),
        "descriptionEn": scraped_data.get('description', ''),
        "core": True,
        "weight": scraped_data.get('ects', 0.0),
        "phase": "Modul",
        "area": "Gesamtkompetenz",
        "tags": [
            f"module:{code}",
            f"ects:{int(scraped_data.get('ects', 0))}"
        ],
        "contains": sub_goal_ids,
        "requires": [],
        "sourceRef": source_url
    }
    
    goals_list.insert(0, root_goal)
    
    json_output = {
        "title": f"{final_title} (TUM, Modul {code})",
        "titleEn": f"{final_title} (TUM, Module {code})",
        "description": scraped_data.get('description', ''),
        "descriptionEn": scraped_data.get('description', ''),
        "landscapeId": generate_deterministic_uuid("tum-landscape", code),
        "locale": "de-DE",
        "subject": "TUM-Module", 
        "frameworkId": f"tum-{code.lower()}",
        "goals": goals_list
    }
    
    out_filename = f"DE_BAY_U_TUM_{code}.de.json"
    out_path = output_dir / out_filename
    
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(json_output, f, indent=4, ensure_ascii=False)
        
    logger.info(f"Generated {out_path}")


def main():
    if len(sys.argv) < 2:
        print("Usage: python scrape_tum_curriculum.py <path_to_xyz.txt>")
        sys.exit(1)
        
    input_file = Path(sys.argv[1])
    if not input_file.exists():
        logger.error(f"Input file not found: {input_file}")
        sys.exit(1)
        
    logger.info(f"Reading input from {input_file}")
    
    template_url, modules = parse_input_file(input_file)
    # Fallback template if missing
    if not template_url:
        template_url = "https://academics.nat.tum.de/org/mh/details/mod/$m"
        
    logger.info(f"Found {len(modules)} modules to process.")
    
    output_dir = input_file.parent.parent / "json"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    for mod in modules:
        code = mod['code']
        out_filename = f"DE_BAY_U_TUM_{code}.de.json"
        out_path = output_dir / out_filename
        
        if out_path.exists():
            logger.info(f"Skipping {code} (File exists: {out_filename})")
            continue

        api_data = scrape_module_api(code)
        
        if not api_data:
            logger.warning(f"Skipping {code} due to missing data.")
            continue
            
        processed_data = process_module_data(code, api_data)
        generate_json(mod, processed_data, template_url, output_dir)
        
        time.sleep(0.2)
        
    logger.info("Done.")

if __name__ == "__main__":
    main()
