import json
import os
import uuid
import re
from glob import glob

# Configuration
CURRICULA_DIR = "curricula/DE/BY"

def generate_uuid(string):
    return str(uuid.uuid5(uuid.NAMESPACE_DNS, string))

def repair_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        try:
            data = json.load(f)
        except json.JSONDecodeError:
            print(f"Error decoding {filepath}")
            return

    # 1. Inject Metadata
    data["country"] = "DE"
    data["region"] = "BY"
    
    # 2. Re-generate IDs and fix graph
    # We need to reconstruct the hierarchy to generate stable parent-based IDs
    
    school_type = data.get("schoolType")
    subject = data.get("subject")
    
    if not school_type or not subject:
        print(f"Skipping {filepath}: Missing metadata")
        return

    # Root ID
    # Scraper: curriculum_id = generate_uuid(f"{school_type_name}-{subject['name']}")
    curriculum_id = generate_uuid(f"{school_type}-{subject}")
    data["id"] = curriculum_id
    
    # Build Map of nodes by ID for easy access
    # But wait, original IDs are potentially broken (duplicates).
    # We should iterate structure based on "contains" starting from Root.
    # Identifying Root: Tagged with "root" or checking for "core": true
    
    root_node = next((n for n in data["goals"] if "root" in n.get("tags", [])), None)
    if not root_node:
        print(f"Skipping {filepath}: No root node found")
        return

    # Update Root ID
    root_node_id = generate_uuid(f"{curriculum_id}-root") # Scraper logic
    # In scraper: root_id = generate_uuid(f"{curriculum_id}-root")
    # But wait, the root node in `goals` list has an ID. 
    # Let's map Old -> New ID to update references easily?
    # Problem: Duplicate Old IDs map to DIFFERENT New IDs (based on content).
    # So we cannot use a simple map. We must traverse deeply.
    
    # We need to build a clean list of new nodes
    new_goals_list = []
    
    # Recreate Root Node
    new_root = root_node.copy()
    new_root["id"] = root_node_id
    new_root["contains"] = [] # Will fill
    new_goals_list.append(new_root)
    
    # Helper to find node by old ID in the original list
    # Since duplicates exist, this is tricky.
    # The `contains` array has the bad ID.
    # We need to find "Which of the nodes with Bad ID X is the one referenced here?"
    # In the JSON structure from the scraper:
    # "contains": [id1, id2...]
    # And "goals": [nodeA(id1), nodeB(id2)...]
    # The order was: Grade appended, then Areas appended... 
    # Actually, the scraper appended Areas/Goals as it created them.
    # But for duplicates, the ID pointed to *one* of them (or any).
    # If the Graph is tree-like strictly, can we resolve it?
    # 
    # Actually, simply iterating the *nodes* and checking their type might be safer than following broken links?
    # But we need hierarchy.
    #
    # Let's rely on the fact that existing nodes HAVE `type` and `title`.
    # And we know the hierarchy constraints: Root -> Grade -> Area -> Competence.
    
    # Let's rebuild purely from the node list?
    # No, we lose parentage info if we ignore `contains`.
    #
    # Strategy:
    # 1. Find Root.
    # 2. Iterate Root's `contains`. These are Grade IDs.
    # 3. Find the Grade Node for each ID.
    #    Warning: If multiple Grade Nodes have same ID, we might pick the wrong one?
    #    Scraper: `grade_id = generate_uuid(f"{curriculum_id}-{grade['name']}")`
    #    Grade IDs are likely unique and stable (Grade 5 vs Grade 6).
    #    So mapping Grade ID -> Node is safe.
    # 4. For each Grade Node:
    #    Recalculate Grade ID (should match).
    #    Iterate its `contains` (Area IDs).
    #    Map Area ID -> Node.
    #    Scraper: `area_id = generate_uuid(f"{grade_id}-{area['title']}")`
    #    Area IDs likely unique within a Grade.
    #    So mapping Area ID -> Node is safe.
    # 5. For each Area Node:
    #    Recalculate Area ID.
    #    Iterate its `contains` (Competence IDs).
    #    Map Competence ID -> Node.
    #    CRITICAL: Here we have duplicates. 
    #    BUT: The scraper generated the ID *from the text*.
    #    So if ID is duplicated, it means `text[:20]` was same.
    #    So `contains` has `[BadID, BadID]`.
    #    And we have two Nodes: `{id: BadID, desc: "A..."}` and `{id: BadID, desc: "B..."}`
    #    How do we know which `BadID` in the list maps to `Node A` vs `Node B`?
    #    Actually, in the `contains` list, it's just a list of strings.
    #    The structure implies "This Area contains these children".
    #    We need to find *all* goal nodes that *were intended* to be in this area.
    #    Since the scraper generated the list in order, maybe we can't rely on ID lookup.
    #    
    #    Wait, in the original Scraper:
    #    `area_node["contains"].append(goal_id)`
    #    `curriculum_data["goals"].append(goal_node)`
    #
    #    If we find a Goal Node in the `goals` list, can we know who its parent is? No (no backlink).
    #    
    #    Alternative:
    #    The set of ALL nodes is in `curriculum_data["goals"]`.
    #    We can group them by Type.
    #    
    #    We know Root -> keys into Grades.
    #    Grades -> keys into Areas.
    #    Areas -> keys into Goals.
    #
    #    If `Area1` has `contains: ["dupId", "dupId"]`.
    #    And we have `NodeA(id="dupId")` and `NodeB(id="dupId")`.
    #    Does it matter?
    #    The scraper put `NodeA` and `NodeB` into the `goals` list.
    #    And putting `dupId` into `contains` effectively linked *both* (conceptually) or *one* (technically).
    #    If we just say "This area contains ALL nodes that claim to have this ID", is that correct?
    #    Likely yes. If the scraper generated `dupId` for `Node A`, and put `dupId` in `Area 1`'s list.
    #    It meant `Area 1` contains `Node A`.
    #    If `Area 1` also contains `Node B` (same ID), it put `dupId` again?
    #    Checking scraper:
    #    `goal_id = generate_uuid(...)`
    #    `area_node["contains"].append(goal_id)`
    #    
    #    So `Area 1` would have `["dupId", "dupId"]`.
    #    So we know `Area 1` had 2 children.
    #    And we have 2 nodes with `dupId` in the global list.
    #    We can just Pair them up! 
    #    Since list order is preserved in JSON usually.
    #    
    #    BETTER: Iterate the `goals` list directly.
    #    We can Identify parents by inferring the hierarchy or just reprocessing?
    #    
    #    Actually, we can rebuild the IDs if we can traverse.
    #    The problem is linking the `Area` to the specific `Goal Node` when IDs are ambiguous.
    #    
    #    However, we know:
    #    `grade_id` depends on `curriculum_id`.
    #    `area_id` depends on `grade_id`.
    #    `goal_id` depends on `area_id`.
    #
    #    If we can just map `Old ID -> Correct Node`... we can't if they collide.
    #
    #    Let's look at `node['type']`.
    #    We can collect ALL `grade` nodes.
    #    We can collect ALL `area` nodes.
    #    We can collect ALL `competence` nodes.
    #
    #    For Grades:
    #       Extract `grade_name` from title ("Jahrgangsstufe X"). 
    #       New ID = `uuid5(curr_id + grade_name)`.
    #       Update Node ID.
    #       Update Root's `contains` (replace old ID with New ID).
    #       Wait, Root has `[old_grade_id, ...]`.
    #       Since Grade IDs are unique, `old_grade_id` maps to exactly one Grade Node.
    #       So we can update Root successfully.
    #
    #    For Areas:
    #       We have a Grade Node. It has `contains: [old_area_id, ...]`.
    #       Area IDs *should* be unique within a grade? 
    #       Are there duplicate Area titles in one grade?
    #       "Lernbereich 1: Zahlen" vs "Lernbereich 1: Zahlen (Variant)"?
    #       The Scraper used `parse_curriculum_page`. "Lernbereiche" usually distinct.
    #       So mapping `old_area_id` -> Area Node is likely unique.
    #       So we can update Grade's `contains`.
    #       And we update Area Node ID using `uuid5(grade_id + area_title)`.
    #
    #    For Competences (Goals):
    #       We have an Area Node. It has `contains: [old_goal_id, old_goal_id_2, ...]`.
    #       We have a pool of Competence Nodes.
    #       Many might share `old_goal_id`.
    #       
    #       Crucial Insight: We just need to iterate ALL Competence Nodes in the file.
    #       For each Competence Node:
    #           We need its `Area ID` to generate its new proper UUID.
    #           `new_goal_id = uuid5(AREA_ID + full_description)`.
    #           
    #           BUT we don't know which Area it belongs to if we just iterate the list!
    #           The JSON is flat. The only link is `Area.contains -> GoalID`.
    #           If `GoalID` is ambiguous, we don't know if `Goal A` belongs to `Area X` or `Area Y` (if shared ID).
    #           
    #           However, the scraper logic was:
    #           `goal_id = uuid5(area_id + text[:20])`.
    #           This means the Goal ID ITSELF encoded the Area ID.
    #           So `Goal A` (in Area X) and `Goal B` (in Area Y) would ONLY collide if `Area X` and `Area Y` had the SAME ID (Collision).
    #           
    #           Did Area IDs collide? 
    #           `area_id = uuid5(grade_id + title)`.
    #           If Area Titles were unique in a Grade, Area IDs were unique.
    #           
    #           So, collisions are almost certainly constrained to *within a single Area*.
    #           (i.e., Two goals in `Area X` started with same text).
    #           
    #           Verify:
    #           If `Goal A` and `Goal B` are both in `Area X`.
    #           They both have `old_id_collided`.
    #           So `Area X` contains `[old_id_collided, old_id_collided]`.
    #           And we have `Node A` and `Node B`.
    #           
    #           It doesn't matter which one is which!
    #           They share the same `Area X` parent.
    #           So `new_id_A = uuid5(AreaX_ID + textA)`.
    #           `new_id_B = uuid5(AreaX_ID + textB)`.
    #           
    #           We just need to:
    #           1. Identify `Area X`.
    #           2. Get its children IDs.
    #           3. Find all Goal Nodes that match those IDs.
    #           4. For each such Goal Node, we know its parent is `Area X`.
    #           5. Regenerate its ID.
    #           
    #           Wait, if `Area Y` ALSO has `old_id_collided`?
    #           That implies `uuid5(AreaX + text)` == `uuid5(AreaY + text)`.
    #           This is astronomically unlikely (UUID collision).
    #           The collision happened because `AreaX == AreaY` was implicit? 
    #           No, previous collision was `uuid5(AreaX + text)` == `uuid5(AreaX + other_text)`.
    #           
    #           So yes, we can safely assume that a Goal Node with `old_ID` belongs to the *unique* Area that generated `old_ID`.
    #           And since Area IDs are unique, we just need to map `Old_Goal_ID -> Parent_Area_ID`.
    #           
    #           Algorithm:
    #           1. Create map `Goal_ID -> Area_ID` by iterating all Areas and their `contains` lists.
    #              (Since we assume Goal IDs are unique to an Area parent, this map is 1:1 or N:1).
    #              Wait, if `Goal_ID_1` is in `Area_X`... 
    #              Can `Goal_ID_1` also be in `Area_Y`? Only if `uuid5(AreaX+text) == uuid5(AreaY+text)`. Impossible.
    #              So `Goal_ID` uniquely identifies its parent `Area_ID`.
    #           
    #           2. Iterate all Competence Nodes.
    #              Get `old_id`.
    #              Lookup `Area_ID` from map.
    #              Get `full_description`.
    #              Generate `new_id = uuid5(Area_ID + full_description)`.
    #              Update Node ID.
    #           
    #           3. Update Area `contains` lists.
    #              Since `contains` has `old_ids`, we simply replace them with the `new_ids` we just generated.
    #              But we need to know WHICH `old_id` corresponds to WHICH `new_id`.
    #              
    #              Actually, we can just *rebuild* the `contains` list of the Area.
    #              When iterating Competence Nodes:
    #              Store `(Area_ID, new_goal_id)`.
    #              Then for each Area, `contains = [list of new_goal_ids belonging to this area]`.
    #              
    #              So:
    #              Step 1: Iterate JSON `goals` (Nodes).
    #                 Separate into `root_node`, `grade_nodes`, `area_nodes`, `goal_nodes`.
    #              Step 2: Fix Root.
    #                 `new_curric_id`. `new_root_id`. 
    #                 `root_node.id` = new. 
    #                 Root -> Grade IDs map.
    #              Step 3: Fix Grades.
    #                 For each Grade Node:
    #                    Calculate New ID.
    #                    Store `Old_ID -> New_ID` map.
    #                    (Check for dupes? Grade dupes unlikely).
    #              Step 4: Fix Areas.
    #                 Identify Parent Grade for each Area?
    #                 Map `Area_Old_ID -> Grade_New_ID`?
    #                 Use `grade_node.contains` to build `Area_Old_ID -> Grade_Node`.
    #                 For each Area Node:
    #                     Find Parent Grade. 
    #                     Calculate New ID.
    #                     Store `Old_ID -> New_ID` (or duplicates list)
    #              Step 5: Fix Goals.
    #                 Use `area_node.contains` to build `Goal_Old_ID -> Area_Node`.
    #                 (Note: multiple Goals might map to same Old ID, but they map to same Area).
    #                 For each Goal Node:
    #                     Find Parent Area.
    #                     Calculate New ID (`uuid5(area_new_id + description)`).
    #                     Store `Goal Node` in a list `children_of_area[area_new_id]`.
    #              Step 6: Reassemble.
    #                 Assign `contains` for Root (list of Grade New IDs).
    #                 Assign `contains` for Grades (list of Area New IDs).
    #                 Assign `contains` for Areas (list of `children_of_area[area.id]`).
    #                 Update `goals` list with all new nodes.
    #
    #              This feels robust.

    # Implementation Details:
    # Need to handle extracting names correctly.
    # Grade Name: "Jahrgangsstufe 5" -> "5". 
    # Regex `^Jahrgangsstufe (.+)$`

    grades_lookup = {g["id"]: g for g in data["goals"] if g.get("type") == "grade"}
    areas_lookup = {a["id"]: a for a in data["goals"] if a.get("type") == "area"}
    goals_lookup = {}
    all_goals_nodes = [n for n in data["goals"] if n.get("type") == "competence"]

    # 1. Root
    # Already found root_node.
    # Update Root ID logic above.

    # 2. Map Hierarchy (Top Down)
    
    # Root -> Grades
    grade_ids_in_root = root_node.get("contains", [])
    new_grade_ids = []
    
    processed_grade_ids = set()

    for gid in grade_ids_in_root:
        if gid in processed_grade_ids: continue
        g_node = grades_lookup.get(gid)
        if not g_node: continue
        
        # New Grade ID
        # Extract name
        match = re.search(r"Jahrgangsstufe (.+)", g_node["title"])
        g_name = match.group(1) if match else g_node["title"]
        
        new_g_id = generate_uuid(f"{curriculum_id}-{g_name}")
        g_node["id"] = new_g_id
        new_grade_ids.append(new_g_id)
        processed_grade_ids.add(gid) # Mark old ID as processed
        
        new_goals_list.append(g_node)
        
        # Process Areas for this Grade
        area_ids = g_node.get("contains", [])
        new_area_ids = []
        processed_area_ids = set() # Per grade? Area IDs should be unique globally ideally? Yes uuid5.
        
        for aid in area_ids:
            if aid in processed_area_ids: continue
            a_node = areas_lookup.get(aid)
            if not a_node: continue
            
            # New Area ID
            new_a_id = generate_uuid(f"{new_g_id}-{a_node['title']}")
            a_node["id"] = new_a_id
            new_area_ids.append(new_a_id)
            processed_area_ids.add(aid)
            
            new_goals_list.append(a_node)
            
            # Process Goals for this Area
            # Here we must search the `all_goals_nodes` list for nodes that *had* the old ID
            # The `contains` list has the old IDs.
            # Efficient lookup: map `old_id` -> `[node1, node2]`
            
            # Pre-build goal map for this file
            if 'goal_map' not in locals():
                goal_map = {}
                for gn in all_goals_nodes:
                    goal_map.setdefault(gn["id"], []).append(gn)
            
            goal_ids_in_area = a_node.get("contains", [])
            new_goal_ids_for_area = []
            
            # Since an ID might appear once in `contains` but map to multiple nodes (the specific bug),
            # Duplicate ID in `contains`?
            # Scraper: `area_node["contains"].append(goal_id)`.
            # If generated ID collided, it appended the SAME ID twice.
            # So `contains` has `[X, X]`.
            # And `goal_map[X]` has `[NodeA, NodeB]`.
            # We iterate `contains`. 
            # 1. Get X. `goal_map[X]` -> `[A, B]`.
            #    We process A. Remove from map?
            # 2. Get X. `goal_map[X]` -> `[B]`.
            #    Process B.
            
            # We need a mutable consumption of goal_map entries
            
            for old_goal_id in goal_ids_in_area:
                 candidates = goal_map.get(old_goal_id)
                 if candidates:
                     target_node = candidates.pop(0) # Consume one
                     
                     # New Goal ID
                     # USE DESCRIPTION
                     desc = target_node.get("description", target_node["title"])
                     new_goal_id = generate_uuid(f"{new_a_id}-{desc}")
                     
                     target_node["id"] = new_goal_id
                     new_goal_ids_for_area.append(new_goal_id)
                     
                     new_goals_list.append(target_node)
            
            a_node["contains"] = new_goal_ids_for_area

        g_node["contains"] = new_area_ids

    root_node["contains"] = new_grade_ids
    
    # Filter duplicates in new_goals_list based on ID
    # Because if we had multiple goals with same description in same area, they generated same ID
    # and were both added to list.
    unique_goals_list = []
    seen_goal_ids = set()
    
    for node in new_goals_list:
        if node["id"] not in seen_goal_ids:
            unique_goals_list.append(node)
            seen_goal_ids.add(node["id"])
    
    data["goals"] = unique_goals_list
    
    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=4, ensure_ascii=False)
    print(f"Repaired {filepath}")

def main():
    files = glob(os.path.join(CURRICULA_DIR, "**/*.json"), recursive=True)
    print(f"Found {len(files)} files to repair.")
    for f in files:
        repair_file(f)

if __name__ == "__main__":
    main()
