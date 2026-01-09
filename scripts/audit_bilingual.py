#!/usr/bin/env python3
"""
Audits JSON files for bilingual field consistency.
Reports nodes where title == titleEn or description == descriptionEn.
"""
import json
import sys
from pathlib import Path

def audit_bilingual(json_dir: Path):
    """Audit all JSON files for bilingual field issues."""
    
    issues = []
    
    for file_path in sorted(json_dir.glob("DE_BAY_U_TUM_*.de.json")):
        # Skip landscape files
        if any(x in file_path.name for x in ["BSC_", "MSC_", "PHYSIK", "INFORMATIK", "QST"]):
            continue
            
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            for goal in data.get('goals', []):
                title = goal.get('title', '')
                titleEn = goal.get('titleEn', '')
                desc = goal.get('description', '')
                descEn = goal.get('descriptionEn', '')
                
                # Check if title and titleEn are identical (likely missing translation)
                if title and titleEn and title == titleEn:
                    issues.append({
                        'file': file_path.name,
                        'id': goal.get('id', 'N/A')[:8],
                        'shortKey': goal.get('shortKey', 'N/A'),
                        'issue': 'title == titleEn',
                        'sample': title[:60] + '...' if len(title) > 60 else title
                    })
                    
                # Check if description and descriptionEn are identical
                if desc and descEn and desc == descEn and len(desc) > 50:
                    issues.append({
                        'file': file_path.name,
                        'id': goal.get('id', 'N/A')[:8],
                        'shortKey': goal.get('shortKey', 'N/A'),
                        'issue': 'desc == descEn',
                        'sample': desc[:60] + '...' if len(desc) > 60 else desc
                    })
                    
        except Exception as e:
            print(f"[ERROR] {file_path.name}: {e}")
    
    # Summary
    print(f"\n=== Bilingual Audit Report for {json_dir} ===\n")
    
    if not issues:
        print("✓ All files have distinct DE/EN fields!")
        return
    
    # Group by file
    files_with_issues = set(i['file'] for i in issues)
    print(f"Files with identical DE/EN fields: {len(files_with_issues)}/{len(list(json_dir.glob('DE_BAY_U_TUM_*.de.json')))}")
    print()
    
    for issue in issues[:30]:  # Show first 30
        print(f"[{issue['issue']}] {issue['file']} -> {issue['shortKey']}")
        print(f"   {issue['sample']}")
        print()
    
    if len(issues) > 30:
        print(f"... and {len(issues) - 30} more issues")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        json_dir = Path(sys.argv[1])
    else:
        json_dir = Path("curricula/DE/BY/TUM/Quantum_Science_and_Technology/MSc_QST/json")
    
    audit_bilingual(json_dir)
