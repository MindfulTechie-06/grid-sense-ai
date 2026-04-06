import json
import random
import os

data = []
# 35 normal
for i in range(35):
   data.append({
      "time": i, 
      "voltage": round(random.uniform(228, 232), 2), 
      "current": round(random.uniform(4.8, 5.2), 2), 
      "frequency": round(random.uniform(49.9, 50.1), 2), 
      "state": "normal"
   })

# 35 fault
for i in range(35, 70):
   v = round(random.uniform(180, 210), 2)
   data.append({
      "time": i, 
      "voltage": v, 
      "current": round(random.uniform(6.0, 7.5), 2), 
      "frequency": round(random.uniform(48.5, 49.5), 2), 
      "state": "fault"
   })

# 30 attack
for i in range(70, 100):
   data.append({
      "time": i, 
      "voltage": round(random.uniform(100, 300), 2), 
      "current": round(random.uniform(1.0, 10.0), 2), 
      "frequency": round(random.uniform(47.0, 53.0), 2), 
      "state": "attack"
   })

path = os.path.abspath('c:/Users/LENOVO/grid-sense-ai/frontend/grid-sense/src/data/gridData.json')
with open(path, 'w') as f:
   json.dump(data, f)
print(f"Generated 100 data points to {path}")
