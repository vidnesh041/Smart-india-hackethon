import urllib.request
import json

# Test 1: paginated list
url = 'http://127.0.0.1:8000/api/schemes?page=1&limit=3'
r = urllib.request.urlopen(url)
data = json.loads(r.read())
print(f"=== Paginated API Test ===")
print(f"HTTP Status: {r.status}")
print(f"Total schemes: {data['total']}")
print(f"Total pages: {data['total_pages']}")
print(f"Schemes on this page: {len(data['schemes'])}")
print(f"First scheme: {data['schemes'][0]['scheme_name'][:70]}")
print(f"Ministry: {data['schemes'][0].get('ministry', 'N/A')}")
print()

# Test 2: search
url2 = 'http://127.0.0.1:8000/api/schemes?page=1&limit=3&search=mudra'
r2 = urllib.request.urlopen(url2)
data2 = json.loads(r2.read())
print(f"=== Search 'mudra' ===")
print(f"Results found: {data2['total']}")
if data2['schemes']:
    print(f"First match: {data2['schemes'][0]['scheme_name'][:70]}")
