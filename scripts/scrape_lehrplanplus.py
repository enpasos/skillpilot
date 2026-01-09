import requests
from bs4 import BeautifulSoup
import json
import uuid
import re
import os
import time

# Configuration
BASE_URL = "https://www.lehrplanplus.bayern.de"
OUTPUT_DIR = "curricula/DE/BY"
LIMIT_SCHOOL_TYPES = 1000  # Process all school types
LIMIT_SUBJECTS_PER_TYPE = 1000 # Process all subjects

def get_soup(url):
    """Fetches a URL and returns a BeautifulSoup object."""
    try:
        response = requests.get(url)
        response.raise_for_status()
        return BeautifulSoup(response.content, 'html.parser')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return None

def clean_text(text):
    if not text:
        return ""
    return re.sub(r'\s+', ' ', text).strip()

def get_school_types():
    """Scrapes the homepage for school types."""
    soup = get_soup(BASE_URL)
    if not soup:
        return []

    results = []
    # School types are often in the sidebar or main nav.
    # From exploration: links having '/schulart/' path.
    # Only distinct school types.
    seen = set()
    for link in soup.find_all('a', href=True):
        href = link['href']
        if '/schulart/' in href and href.count('/') == 2: # simple /schulart/gymnasium
             name = clean_text(link.text)
             # Basic filter to ensure it's a school type link
             if name and href not in seen:
                 results.append({"name": name, "url": BASE_URL + href})
                 seen.add(href)
    return results

def get_subjects(school_type_url):
    """Scrapes the subjects page for a school type."""
    # Pattern: .../inhalt/fachlehrplaene
    if school_type_url.endswith("/"):
        school_type_url = school_type_url[:-1]
    
    subjects_url = f"{school_type_url}/inhalt/fachlehrplaene"
    soup = get_soup(subjects_url)
    if not soup:
        return []

    results = []
    # Navigationshilfe -> Fach -> Links
    # We look for links that have 'w_fach=' or look like subject links.
    # From chunk: .../fachlehrplaene?w_schulart=...&w_fach=...
    # Or just iterate all links in the main content area if possible.
    # Let's search for links containing 'fachlehrplaene' and 'w_fach' or seemingly valid subject links.
    
    seen = set()
    for link in soup.find_all('a', href=True):
        href = link['href']
        # Check if it's a subject link
        if 'w_fach=' in href or ('/inhalt/fachlehrplaene' in href and 'w_fach' in href):
             name = clean_text(link.text)
             if name and href not in seen and name != "Fachlehrpläne":
                 full_url = href if href.startswith("http") else BASE_URL + href
                 # Extract subject code or ID for key if needed, or just use name
                 results.append({"name": name, "url": full_url})
                 seen.add(href)
    return results

def get_grades(subject_url):
    """Scrapes the subject page (which lists grades)."""
    soup = get_soup(subject_url)
    if not soup:
        return []

    results = []
    # Links with 'w_jgs='
    seen = set()
    for link in soup.find_all('a', href=True):
        href = link['href']
        if 'w_jgs=' in href:
            name = clean_text(link.text)
            if name and href not in seen:
                full_url = href if href.startswith("http") else BASE_URL + href
                results.append({"name": name, "url": full_url})
                seen.add(href)
    return results

def parse_curriculum_page(grade_url, prefix=""):
    """Parses the final curriculum page with Lernbereiche and Kompetenzerwartungen."""
    soup = get_soup(grade_url)
    if not soup:
        return []

    areas = []

    # Check for "Ausprägung" (variants like Einstündig/Zweistündig)
    # These appear as links with 'w_auspraegung='
    auspraegung_links = []
    seen_links = set()
    for link in soup.find_all('a', href=True):
        href = link['href']
        if 'w_auspraegung=' in href and href not in seen_links:
             # Basic filter to ensure it's valid
             name = clean_text(link.text)
             if name:
                 full_url = href if href.startswith("http") else BASE_URL + href
                 auspraegung_links.append({"name": name, "url": full_url})
                 seen_links.add(href)
    
    # If variants found, recurse
    if auspraegung_links:
        print(f"      Found {len(auspraegung_links)} variants (Ausprägung). Recursing.")
        for variant in auspraegung_links:
            # Recursive call with prefix
            variant_prefix = f"{prefix} {variant['name']}: " if prefix else f"{variant['name']}: "
            # Clean up redundant prefixes if any
            areas.extend(parse_curriculum_page(variant['url'], prefix=variant_prefix.strip()))
        return areas


    # Normal Parsing for Content Page
    headers = soup.find_all(re.compile('^h[2-6]$'))
    
    current_area = None
    
    for header in headers:
        text = clean_text(header.text)
        if "Lernbereich" in text:
            if current_area:
                areas.append(current_area)
            
            title = f"{prefix} {text}" if prefix else text
            current_area = {"title": title, "goals": []}
        
        elif "Kompetenzerwartungen" in text and current_area:
            # The goals are likely in the next <ul> or valid sibling.
            # Let's look at the next sibling.
            nxt = header.find_next_sibling()
            while nxt and nxt.name not in ['h2', 'h3', 'h4', 'h5', 'h6', 'div']: 
                # Be careful not to skip too much
                if nxt.name == 'ul':
                    for li in nxt.find_all('li'):
                        goal_text = clean_text(li.text)
                        if goal_text:
                            current_area["goals"].append(goal_text)
                    break # Found the goals list
                nxt = nxt.find_next_sibling()
    
    if current_area:
        areas.append(current_area)
        
    return areas

def generate_uuid(string):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, string))

def save_curriculum(school_type, subject_name, grade_name, areas):
    # Construct the JSON structure
    # This JSON represents ONE Grade of ONE Subject.
    # In SkillPilot, do we bundle all grades into one Subject file?
    # Usually "Curriculum" implies the whole subject path (e.g., Math Gymnasium).
    # Grades are sub-nodes.
    
    # But here we are iterating. If I save per grade, I might fragment it.
    # Better to aggregate grades for a subject.
    pass 

def process_subject(school_type_name, subject):
    print(f"  Processing Subject: {subject['name']}")
    
    # subject_curriculum structure
    curriculum_id = generate_uuid(f"{school_type_name}-{subject['name']}")
    
    curriculum_data = {
        "id": curriculum_id,
        "title": f"{subject['name']} ({school_type_name})",
        "titleEn": f"{subject['name']} ({school_type_name})", # Placeholder translation
        "description": f"Curriculum for {subject['name']} at {school_type_name}, Bavaria.",
        "descriptionEn": f"Curriculum for {subject['name']} at {school_type_name}, Bavaria.",
        "locale": "de-DE",
        "country": "DE",
        "region": "BY",
        "schoolType": school_type_name,
        "subject": subject['name'],
        "goals": [] # Top level: Grades
    }
    
    grades = get_grades(subject['url'])
    print(f"    Found {len(grades)} grades.")
    
    for grade in grades:
        print(f"    Processing Grade: {grade['name']}")
        time.sleep(0.5) # Polite delay
        
        grade_id = generate_uuid(f"{curriculum_id}-{grade['name']}")
        
        grade_node = {
            "id": grade_id,
            "title": f"Jahrgangsstufe {grade['name']}",
            "type": "grade",
            "contains": []
        }
        
        areas = parse_curriculum_page(grade['url'])
        
        seen_ids = set()
        # Pre-fill seen_ids with what we've already added to curriculum_data["goals"]
        for g in curriculum_data["goals"]:
            seen_ids.add(g["id"])

        for area in areas:
            area_id = generate_uuid(f"{grade_id}-{area['title']}")
            
            # Check if area already exists
            if area_id not in seen_ids:
                area_node = {
                    "id": area_id,
                    "title": area['title'],
                    "type": "area",
                    "contains": []
                }
                curriculum_data["goals"].append(area_node)
                seen_ids.add(area_id)
            else:
                # If area exists, we need to find it to add children to it?
                # Or just skip re-adding it. But we need its reference to add to grade.
                # In this scraper logic, areas are usually distinct per run unless recursion repeats them.
                # If recursion repeated them, we might want to extend the EXISTING area's contains list?
                # For simplicity/safety: if exists, assume it's the same logical area.
                # We need to find the node index if we want to modify it (add more children),
                # but typically `parse_curriculum_page` returns a flat list of areas. 
                # If duplicates occur here, it means `areas` list has duplicates OR we processed this area in a previous grade (unlikely) 
                # or previous iteration. 
                # Let's just find the existing node to append children if needed, or simply append children to the NEWLY created structure 
                # but we can't create a new node.
                # Actually, `areas` comes from ONE `parse_curriculum_page` call.
                # If `areas` has duplicates, we handle it here.
                # We need the `area_node` object to append `contains`.
                area_node = next((g for g in curriculum_data["goals"] if g["id"] == area_id), None)

            # Ensure we have the link in Grade
            if area_id not in grade_node["contains"]:
                grade_node["contains"].append(area_id)

            
            for goal_text in area["goals"]:
                # FIX: Use full text for UUID generation to avoid collisions on common prefixes
                goal_id = generate_uuid(f"{area_id}-{goal_text}") 
                
                if goal_id not in seen_ids:
                    goal_node = {
                        "id": goal_id,
                        # Truncate title for UI, but keep full description
                        "title": goal_text[:100] + "..." if len(goal_text) > 100 else goal_text,
                        "description": goal_text,
                        "type": "competence"
                    }
                    curriculum_data["goals"].append(goal_node)
                    seen_ids.add(goal_id)
                
                # Add link to Area
                if area_node and goal_id not in area_node["contains"]:
                    area_node["contains"].append(goal_id)
                
        # Add Grade to global goals list if not present
        if grade_id not in seen_ids:
            curriculum_data["goals"].append(grade_node)
            seen_ids.add(grade_id)
        else:
             # Update existing grade node if needed?
             pass
        
        # Add link from Root (to be added) to Grade?
        # Typically the main structure has a Root node containing Grades.
        pass

    # Create Root Node
    root_id = generate_uuid(f"{curriculum_id}-root")
    root_node = {
        "id": root_id,
        "title": f"{subject['name']} ({school_type_name})",
        "core": True,
        "contains": [generate_uuid(f"{curriculum_id}-{g['name']}") for g in grades],
        "tags": ["root", "structure"]
    }
    curriculum_data["goals"].append(root_node)

    # Save
    dir_path = os.path.join(OUTPUT_DIR, school_type_name.replace(" ", "_"))
    os.makedirs(dir_path, exist_ok=True)
    
    filename = f"{subject['name'].replace(' ', '_').replace('/', '_')}.json"
    filepath = os.path.join(dir_path, filename)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(curriculum_data, f, indent=4, ensure_ascii=False)
    
    print(f"    Saved to {filepath}")


def main():
    print("Scraping LehrplanPLUS...")
    
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    school_types = get_school_types()
    print(f"Found {len(school_types)} school types.")
    
    for idx, st in enumerate(school_types):
        if idx >= LIMIT_SCHOOL_TYPES:
            break
            
        print(f"Processing School Type: {st['name']}")
        subjects = get_subjects(st['url'])
        print(f"  Found {len(subjects)} subjects.")
        
        for s_idx, subj in enumerate(subjects):
            if s_idx >= LIMIT_SUBJECTS_PER_TYPE:
                break
                
            process_subject(st['name'], subj)
            time.sleep(1)

if __name__ == "__main__":
    main()
