import requests
import json

def check_module(code):
    url = f"https://academics.nat.tum.de/api/v1/mhb/{code}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()
        print(f"--- {code} ---")
        print("Raw Module Content:")
        print(data.get('module_content'))
        print("Raw Module Outcome:")
        print(data.get('module_outcome'))
    except Exception as e:
        print(f"Error fetching {code}: {e}")

# check_module("PH0005")
# check_module("CH1104")
check_module("PH0001")
