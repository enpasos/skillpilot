import re
from bs4 import BeautifulSoup

def clean_text(text: str) -> str:
    if not text:
        return ""
    text = text.replace('\u200b', '')
    return re.sub(r'\s+', ' ', text).strip()

def split_numbered_list(text: str):
    # Match:
    # 1. Text
    # 1) Text
    # 1.) Text
    # (1) Text
    # Regex: \s(?=\(?\d+[\.\)]+\s)
    # Explanation:
    # \s+ : split on whitespace
    # (?=...) : followed by
    # \(? : optional opening paren
    # \d+ : digits
    # [\.\)]+ : one or more dot or closing paren
    # \s : space
    split_items = re.split(r'\s+(?=\(?\d+[\.\)]+\s)', text)
    results = []
    if len(split_items) > 1:
        for it in split_items:
            it = it.strip()
            if it:
                results.append(it)
    else:
        results.append(text)
    return results

html_content = """<p>Nach der erfolgreichen Teilnahme an diesem Modul ist der/die Studierende in der Lage: 1.) Differentialgleichungen mit Randwertbedingungen zu lösen. 2.) die Maxwellgleichungen zur Berechnung von Feldverteilungen anzuwenden. 3.) Wellengleichungen im Vakuum und in Materie zu lösen.</p>"""


soup = BeautifulSoup(html_content, 'html.parser')
items = []
if soup.find('p'):
     for p in soup.find_all('p'):
         text = clean_text(p.get_text())
         if text:
             # OLD LOGIC: items.append(text)
             # NEW LOGIC:
             items.extend(split_numbered_list(text))

print(f"Found {len(items)} items:")
for i in items:
    print(f"- {i}")
