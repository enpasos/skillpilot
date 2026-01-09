import requests
import json

def check_module(code):
    url = f"https://academics.nat.tum.de/api/v1/mhb/{code}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print(f"--- {code} ---")
        # Print FULL JSON to see what we have
        print(json.dumps(data, indent=2, ensure_ascii=True)) 
    except Exception as e:
        print(f"Error fetching {code}: {e}")

check_module("NAT5008m")
# check_module("NAT3034") 
