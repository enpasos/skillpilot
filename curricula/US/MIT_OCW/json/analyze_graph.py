import json
import os
from collections import defaultdict

# Paths
GRAPH_PATH = r"\\wsl.localhost\Ubuntu\home\enpasos\projects\skillpilot\curricula\US\MIT_OCW\json\US_MAS_U_MIT_OCW_18_06.en.json"
INPUT_DIR = r"\\wsl.localhost\Ubuntu\home\enpasos\projects\skillpilot\curricula\US\MIT_OCW\input\18.06-spring-2010"

def analyze_graph():
    print("--- SkillGraph Analysis ---")
    with open(GRAPH_PATH, 'r', encoding='utf-8') as f:
        graph = json.load(f)

    # Basic stats
    goals = graph.get("goals", [])
    print(f"Total nodes (goals): {len(goals)}")

    id_to_goal = {g['id']: g for g in goals}
    
    # Identify roots
    all_children = set()
    for g in goals:
        all_children.update(g.get("contains", []))
    
    roots = [g for g in goals if g['id'] not in all_children]
    print(f"Number of root nodes: {len(roots)}")
    
    # Calculate depth and balance
    def get_max_depth(node_id):
        node = id_to_goal.get(node_id)
        if not node: return 0
        children = node.get("contains", [])
        if not children: return 1
        return 1 + max((get_max_depth(c) for c in children), default=0)

    report_lines = []
    
    def print_tree(node_id, level=0):
        node = id_to_goal.get(node_id)
        if not node: return
        children = node.get("contains", [])
        requires = node.get("requires", [])
        weight = node.get("weight", 0)
        indent = "  " * level
        if level <= 1:
            report_lines.append(f"{indent}- {node.get('title')} (id: {node_id}, children: {len(children)}, requires: {len(requires)}, weight: {weight}, depth: {get_max_depth(node_id)})")
        for c in children:
            print_tree(c, level + 1)
            
    children_counts = [len(g.get("contains", [])) for g in goals]
    requires_counts = [len(g.get("requires", [])) for g in goals]
    
    report_lines.append("\n--- Balance / Structure Top Level ---")
    for r in roots:
        print_tree(r['id'])
        
    with open("report.txt", "w", encoding="utf-8") as f:
        f.write("\n".join(report_lines))
        
    print("\n--- Node Connections ---")
    print(f"Avg children per node: {sum(children_counts)/len(children_counts):.2f}")
    if len(children_counts) > 0:
        print(f"Nodes with 0 children (leaves): {children_counts.count(0)}")
        print(f"Avg requires per node: {sum(requires_counts)/len(requires_counts):.2f}")
        print(f"Nodes with 0 requires: {requires_counts.count(0)}")
    else:
        print("No nodes found.")

    # Sources
    sources_in_graph = set()
    for g in goals:
        if g.get("sourceRef"):
            sources_in_graph.add(g.get("sourceRef"))
        
        ext_data = g.get("extendedData", {})
        for link in ext_data.get("sourceLinks", []):
            if link.get("url"):
                sources_in_graph.add(link["url"])
                
    print(f"\nUnique source URLs referenced in graph: {len(sources_in_graph)}")

def analyze_sources():
    print("\n--- Source Coverage ---")
    content_map_path = os.path.join(INPUT_DIR, "content_map.json")
    with open(GRAPH_PATH, 'r', encoding='utf-8') as f:
        graph = json.load(f)
        
    if os.path.exists(content_map_path):
        with open(content_map_path, 'r', encoding='utf-8') as f:
            content_map = json.load(f)
            paths = list(content_map.values())
            print(f"content_map.json values (pages): {len(paths)}")
            
            lectures = [p for p in paths if 'lecture-' in p.lower() or 'mit18_06s10_l' in p.lower() or '18-06_l' in p.lower()]
            problem_sets = [p for p in paths if 'pset' in p.lower() or 'assignment' in p.lower()]
            exams = [p for p in paths if 'exam' in p.lower()]
            
            print(f"Lectures found in content_map: {len(lectures)}")
            print(f"Problem Sets/Assignments found: {len(problem_sets)}")
            print(f"Exams found: {len(exams)}")
            
            graph_urls = set()
            for g in graph.get("goals", []):
                ref = g.get("sourceRef", "")
                if ref:
                    clean_ref = [x for x in ref.split('/') if x][-1]
                    graph_urls.add(clean_ref)
                
                ext = g.get("extendedData", {})
                for l in ext.get("sourceLinks", []):
                    u = l.get("url", "")
                    if u:
                        clean_u = [x for x in u.split('/') if x][-1]
                        graph_urls.add(clean_u)
            
            print(f"Unique source resource names from graph: {len(graph_urls)}")
            
            covered_lectures = [l for l in lectures if any(u in l for u in graph_urls)]
            print(f"Lectures referenced in graph: {len(covered_lectures)}")
            
            covered_psets = [p for p in problem_sets if any(u in p for u in graph_urls)]
            print(f"Problem Sets referenced in graph: {len(covered_psets)}")

            covered_exams = [e for e in exams if any(u in e for u in graph_urls)]
            print(f"Exams referenced in graph: {len(covered_exams)}")

            if lectures:
                print("Missing lectures (sample):")
                missing = sorted([l for l in lectures if l not in covered_lectures])
                for m in missing[:10]:
                    print(f"  - {m}")
                
    else:
        print("content_map.json not found.")

if __name__ == "__main__":
    analyze_graph()
    analyze_sources()
