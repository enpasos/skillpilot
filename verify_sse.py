import sys
import threading
import time
import json
import urllib.request
import urllib.parse

API_BASE = "http://localhost:8080/api/ui"

def run_sse_listener(learner_id, stop_event):
    url = f"{API_BASE}/updates/{learner_id}"
    print(f"Subscribing to SSE: {url}")
    try:
        with urllib.request.urlopen(url) as response:
            for line in response:
                if stop_event.is_set():
                    break
                decoded = line.decode('utf-8').strip()
                if decoded:
                    print(f"SSE RECEIVED: {decoded}")
                    if "connected" in decoded:
                         print("SUCCESS: Connection established.")
                    if "CURRICULUM_UPDATE" in decoded:
                        print("SUCCESS: Curriculum update event received!")
                        return
    except Exception as e:
        print(f"SSE Listener Error: {e}")

def main():
    # 1. Create Learner
    print("Creating learner...")
    req = urllib.request.Request(f"{API_BASE}/learners", method="POST")
    try:
        with urllib.request.urlopen(req) as res:
            data = json.loads(res.read().decode())
            learner_id = data['state']['skillpilotId']
            print(f"Created learner: {learner_id}")
    except Exception as e:
        print(f"Failed to create learner: {e}")
        return

    # 2. Start Listener
    stop_event = threading.Event()
    t = threading.Thread(target=run_sse_listener, args=(learner_id, stop_event))
    t.start()
    
    # Wait for connection
    time.sleep(2)

    # 3. Trigger Update (Set Curriculum)
    # Need a valid curriculum ID. Usually 'mathematics_en' or similar exists.
    # We'll try to fetch landscapes first.
    print("Fetching landscapes...")
    try:
        with urllib.request.urlopen(f"{API_BASE}/landscapes") as res:
            landscapes = json.loads(res.read().decode())
            if not landscapes:
                print("No landscapes found via /landscapes endpoint (might be wrapped). skip.")
                curriculum_id = "test_curriculum" 
            else:
                 # API usually returns { landscapes: [...] } or list? 
                 # Let's assume list of summaries based on code
                 # actually UpdateController doesn't show landscapes endpoint.
                 # It's in LandscapeController or similar.
                 # Let's just try to set a dummy one, or one we know exists like 'mathematics'
                curriculum_id = "e7c62181-de5d-4432-bbe0-65ee6f049860"
    except:
        curriculum_id = "mathematics"

    print(f"Setting curriculum to {curriculum_id}...")
    url = f"{API_BASE}/learners/{learner_id}/curriculum"
    data = json.dumps({"curriculumId": curriculum_id}).encode('utf-8')
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(url, data=data, headers=headers, method="PUT")
    
    try:
        with urllib.request.urlopen(req) as res:
            print("Curriculum set. Waiting for event...")
    except Exception as e:
        print(f"Failed to set curriculum: {e}")

    # 4. Wait for event
    time.sleep(5)
    stop_event.set()
    t.join(timeout=1)
    print("Done.")

if __name__ == "__main__":
    main()
