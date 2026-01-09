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
        if line.startswith("#"):
            continue
            
        if '$m' in line and not start_parsing:
            if line.startswith('http'):
                url_template = line.strip()
            elif 'Beschreibung' in line:
                start_parsing = True
            continue
            
        if start_parsing:
            code = ""
            title = ""
            credits = ""
            semester = ""

            if '\t' in line:
                parts = [p.strip() for p in line.split('\t') if p.strip()]
                if len(parts) >= 2:
                    code = parts[0]
                    title = parts[1]
                    if len(parts) >= 3:
                        credits = parts[2]
                    if len(parts) >= 4:
                        semester = parts[3]
            else:
                # Try to parse trailing credits and semester if present
                match = re.match(r'^(\S+)\s+(.*?)\s+(\d+(?:\.\d+)?)\s+(\d+)$', line)
                if match:
                    code, title, credits, semester = match.group(1), match.group(2), match.group(3), match.group(4)
                else:
                    parts = line.split(maxsplit=1)
                    if len(parts) >= 2:
                        code, title = parts[0], parts[1]
                    elif len(parts) == 1:
                        code = parts[0]

            if not code:
                continue

            # Skip rows that are not real module codes (e.g., "Wahlmodule")
            if not re.search(r'\d', code):
                logger.warning(f"Skipping non-module entry: {code} {title}".strip())
                continue

            modules.append({
                "code": code,
                "title": title,
                "credits": credits,
                "semester": semester
            })
    
    return url_template, modules

def clean_text(text: str) -> str:
    """Clean whitespace from text."""
    if not text:
        return ""
    # Remove zero-width spaces and other oddities
    text = text.replace('\u200b', '')
    return re.sub(r'\s+', ' ', text).strip()

def clean_text_line(text: str) -> str:
    """Clean whitespace within a single line but keep line structure external."""
    if not text:
        return ""
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

def parse_html_lines(html_content: str) -> List[str]:
    """Parses HTML content into a list of lines, keeping line breaks intact."""
    if not html_content:
        return []
    soup = BeautifulSoup(html_content, 'html.parser')

    for br in soup.find_all("br"):
        br.replace_with("\n")
    for p in soup.find_all("p"):
        p.insert_before("\n\n")
        p.unwrap()
    for li in soup.find_all("li"):
        li.insert_before("\n- ")
        li.unwrap()

    text = soup.get_text()
    lines = [clean_text_line(line) for line in text.splitlines()]
    return [line for line in lines if line]

def split_numbered_list(text: str) -> List[str]:
    """Splits text containing numbered lists (1. ... 2. ... or 1) ... 2) ...) into items."""
    if not text:
        return []
    # Loop for digit followed by dot, closing paren, OR just space + uppercase letter (e.g. "1 Title")
    # Regex: space, lookahead for (optional paren, digit, (dot/paren OR space), space, upercase)
    split_items = re.split(r'\s+(?=\(?\d+(?:[\.\)]|\s)\s*[A-ZÄÖÜ])', text)
    results = []
    if len(split_items) > 1:
        for it in split_items:
            it = it.strip()
            if it:
                 results.append(it)
    else:
        results.append(text)
    return results

def split_content_topics(text: str) -> List[str]:
    """Splits content text into topics (comma/newline separated), respecting structure."""
    if not text:
        return []

    # 1a. Check for dash bullets (- ) common in QST modules
    if re.search(r'\n\s*-\s+\w', text):
        parts = re.split(r'\n\s*-\s+', text)
        dash_results = []
        for p in parts:
            p = clean_text(p)
            if p and len(p) > 3:
                dash_results.append(p)
        if len(dash_results) > 3:
            return dash_results

    # 1b. Check for bullet points (•)
    if '•' in text:
        parts = text.split('•')
        bullet_results = []
        for p in parts:
            p = clean_text(p)
            if p:
                bullet_results.append(p)
        if len(bullet_results) > 1:
            return bullet_results

    # 2. Check for numbered list structure
    numbered_items = split_numbered_list(text)
    if len(numbered_items) > 1:
         if len(numbered_items) > 5 or (len(numbered_items) > 1 and "1" in text[:10]):
             return numbered_items

    # 3. Fallback: Split by newline first
    lines = text.split('\n')
    results = []
    
    for line in lines:
        clean_line = clean_text(line)
        if not clean_line: continue
        
        # 4. Check if line itself is a numbered list
        sub_items = split_numbered_list(clean_line)
        if len(sub_items) > 1:
             results.extend(sub_items)
             continue

        # 5. Fallback: Split by comma/semicolon
        clean_line = clean_line.replace(';', ',')
        parts = clean_line.split(',')
        
        for p in parts:
             p = clean_text(p)
             if p:
                 results.append(p)
                 
    return results

def parse_html_list(html_content: str) -> List[str]:
    """Parses an HTML list (ul/ol) into a list of strings."""
    if not html_content:
        return []
    soup = BeautifulSoup(html_content, 'html.parser')
    items = []
    for li in soup.find_all('li'):
        text = clean_text(li.get_text())
        if text:
            items.extend(split_numbered_list(text))
            
    # Fallback if no <li> found but content exists (e.g. just p tags or plain text)
    if not items and html_content:
        # Split by <p> tags if present
        if soup.find('p'):
             for p in soup.find_all('p'):
                 text = clean_text(p.get_text())
                 if text:
                     items.extend(split_numbered_list(text))
        else:
            text = clean_text(soup.get_text())
            if text:
                items.extend(split_numbered_list(text))
            
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
    data['title_de'] = clean_text(api_data.get('module_title', ''))
    data['title_en'] = clean_text(api_data.get('module_title_en', ''))
    data['ects'] = float(api_data.get('module_credits', 0) or 0)
    
    # 2. Description (Inhalt + Voraussetzungen)
    content_html_de = api_data.get('module_content') or ''
    content_html_en = api_data.get('module_content_en') or ''
    precond_html_de = api_data.get('module_precondition') or ''
    precond_html_en = api_data.get('module_precondition_en') or ''

    data['content_de_lines'] = parse_html_lines(content_html_de)
    data['content_en_lines'] = parse_html_lines(content_html_en)
    data['precond_de_lines'] = parse_html_lines(precond_html_de)
    data['precond_en_lines'] = parse_html_lines(precond_html_en)
    
    # Extract structural content topics
    # Use the clean text version of content html for splitting
    content_clean = parse_html_content(content_html_de or content_html_en)
    data['content_topics'] = split_content_topics(content_clean)
    
    # 3. Outcomes (Lernergebnisse)
    outcome_html_de = api_data.get('module_outcome') or ''
    outcome_html_en = api_data.get('module_outcome_en') or ''
    data['goals_de'] = parse_html_list(outcome_html_de)
    data['goals_en'] = parse_html_list(outcome_html_en)

    # Backward-compatible fields for JSON generation
    # (Language mixing is acceptable in auto mode; manual phase should translate.)
    data['title'] = data['title_de'] or data['title_en']
    if not data['title']:
        data['title'] = code
    # Description = content + prerequisites, prefer DE then EN
    content_for_desc = parse_html_content(content_html_de or content_html_en)
    precond_for_desc = parse_html_content(precond_html_de or precond_html_en)
    description_text = content_for_desc
    if precond_for_desc and "Keine" not in precond_for_desc and "None" not in precond_for_desc:
        description_text += f"\n\n**Voraussetzungen / Prerequisites:**\n{precond_for_desc}"
    data['description'] = description_text
    data['goals'] = data['goals_de'] or data['goals_en']
    
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
    
    # 1. Content Topics (Inhalte)
    content_topics = scraped_data.get('content_topics', [])
    for i, topic in enumerate(content_topics):
        if not topic: continue
        
        # Create a sub-goal
        sub_id = generate_deterministic_uuid("tum-goal-content", f"{code}-{i}")
        sub_goal_ids.append(sub_id)
        
        # Heuristic Title
        comp_title = topic
        if len(comp_title) > 80:
             comp_title = comp_title[:77] + "..."
        
        sub_goal = {
            "id": sub_id,
            "shortKey": f"tum_{code.lower()}_content{i+1}",
            "title": comp_title,
            "titleEn": "Content",
            "description": topic,
            "descriptionEn": topic,
            "core": True,
            "weight": 0.0,
            "phase": "Modul",
            "area": "Wissen", # Content is Knowledge/Wissen
            "tags": [ f"module:{code}" ],
            "contains": [],
            "requires": []         
        }
        goals_list.append(sub_goal)

    # 2. Competencies (Outcomes)
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

def format_ects(value: float) -> str:
    """Format ECTS/CP value for output."""
    if value is None:
        return ""
    try:
        val = float(value)
    except (TypeError, ValueError):
        return str(value)
    if val.is_integer():
        return str(int(val))
    return str(val)

def append_section(lines: List[str], label: str, content: List[str], bullet: bool = False) -> None:
    lines.append("")
    lines.append(f"{label}:")
    if not content:
        return
    if bullet:
        for item in content:
            if item.startswith("- "):
                lines.append(item)
            else:
                lines.append(f"- {item}")
        return
    lines.extend(content)

def generate_raw_txt(module_input: Dict, scraped_data: Dict, output_dir: Path) -> Path:
    """Writes raw module text for manual curation (phase 1)."""
    code = module_input['code']
    title_de = scraped_data.get('title_de') or module_input.get('title', '')
    title_en = scraped_data.get('title_en') or ""
    api_ects = scraped_data.get('ects', 0)
    input_credits = module_input.get('credits', '')
    ects_value = api_ects
    if (api_ects == 0 or api_ects == 0.0) and input_credits:
        ects_value = input_credits
    ects = format_ects(ects_value)
    semester_plan = module_input.get('semester', '')

    lines: List[str] = []
    lines.append(f"code: {code}")
    lines.append(f"title_de: {title_de}")
    lines.append(f"title_en: {title_en}")
    lines.append(f"ects: {ects}")
    if input_credits:
        lines.append(f"ects_plan: {format_ects(input_credits)}")
    if semester_plan:
        lines.append(f"semester_plan: {semester_plan}")

    append_section(lines, "content_de", scraped_data.get('content_de_lines', []))
    append_section(lines, "content_en", scraped_data.get('content_en_lines', []))
    append_section(lines, "outcomes_de", scraped_data.get('goals_de', []), bullet=True)
    append_section(lines, "outcomes_en", scraped_data.get('goals_en', []), bullet=True)
    append_section(lines, "preconditions_de", scraped_data.get('precond_de_lines', []))
    append_section(lines, "preconditions_en", scraped_data.get('precond_en_lines', []))

    out_filename = f"DE_BAY_U_TUM_{code}.txt"
    out_path = output_dir / out_filename
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines).strip() + "\n")
    logger.info(f"Generated {out_path}")
    return out_path

def main():
    parser = argparse.ArgumentParser(description="Scrape TUM module data.")
    parser.add_argument("input_file", help="Path to xyz.txt input file")
    parser.add_argument("--raw-output", action="store_true", help="Write raw .txt files under input/raw")
    parser.add_argument("--skip-json", action="store_true", help="Skip JSON generation")
    parser.add_argument("--force", action="store_true", help="Overwrite existing output files")
    args = parser.parse_args()

    input_file = Path(args.input_file)
    if not input_file.exists():
        logger.error(f"Input file not found: {input_file}")
        sys.exit(1)
        
    logger.info(f"Reading input from {input_file}")
    
    template_url, modules = parse_input_file(input_file)
    # Fallback template if missing
    if not template_url:
        template_url = "https://academics.nat.tum.de/org/mh/details/mod/$m"
        
    logger.info(f"Found {len(modules)} modules to process.")
    
    json_output_dir = input_file.parent.parent / "json"
    json_output_dir.mkdir(parents=True, exist_ok=True)

    raw_output_dir = None
    if args.raw_output:
        raw_output_dir = input_file.parent / "raw"
        raw_output_dir.mkdir(parents=True, exist_ok=True)
    
    for mod in modules:
        code = mod['code']
        json_out_filename = f"DE_BAY_U_TUM_{code}.de.json"
        json_out_path = json_output_dir / json_out_filename
        raw_out_path = None
        if raw_output_dir:
            raw_out_path = raw_output_dir / f"DE_BAY_U_TUM_{code}.txt"

        need_json = not args.skip_json
        need_raw = raw_output_dir is not None

        if not args.force:
            json_exists = json_out_path.exists() if need_json else True
            raw_exists = raw_out_path.exists() if need_raw else True
            if json_exists and raw_exists:
                logger.info(f"Skipping {code} (Outputs already exist)")
                continue

        api_data = scrape_module_api(code)
        
        if not api_data:
            logger.warning(f"Skipping {code} due to missing data.")
            continue
            
        processed_data = process_module_data(code, api_data)
        if need_raw and (args.force or not raw_out_path.exists()):
            generate_raw_txt(mod, processed_data, raw_output_dir)
        if need_json and (args.force or not json_out_path.exists()):
            generate_json(mod, processed_data, template_url, json_output_dir)
        
        time.sleep(0.2)
        
    logger.info("Done.")

if __name__ == "__main__":
    main()
