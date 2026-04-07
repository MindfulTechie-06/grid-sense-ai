from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from grid_sense import run_grid_analysis
from agents import dispatcher_agent
import paho.mqtt.client as mqtt
import json
import threading
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_data = {}
grid_history = []

TOTAL_NODES = 24
grid_nodes = [f"STREET_{chr(65+i)}_TRANSFORMER" for i in range(TOTAL_NODES)]
current_faulty_node = None

def get_microgrid_id(node_id):
    idx = ord(node_id[7]) - 65
    if idx < 6: return "MICROGRID_ALPHA"
    elif idx < 12: return "MICROGRID_BETA"
    elif idx < 18: return "MICROGRID_GAMMA"
    else: return "MICROGRID_DELTA"

# --- MQTT SETUP ---
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "india/grid/health"

def on_connect(client, userdata, flags, rc):
    print(f"Connected to MQTT broker at {MQTT_BROKER}")
    client.subscribe(MQTT_TOPIC)

def on_message(client, userdata, msg):
    global latest_data, grid_history
    try:
        payload = json.loads(msg.payload.decode())
        latest_data = payload
        grid_history.append(payload)
        
        # STEP 6: CLOUD BACKEND CHECK
        print(f"Cloud Received → {payload}")
        
        # Cap logic to avoid memory leak
        if len(grid_history) > 100:
            grid_history.pop(0)
    except Exception as e:
        print("Error parsing MQTT message:", e)

mqtt_client = mqtt.Client()
mqtt_client.on_connect = on_connect
mqtt_client.on_message = on_message

def start_mqtt():
    try:
        mqtt_client.connect(MQTT_BROKER, MQTT_PORT, 60)
        mqtt_client.loop_start()
        print("MQTT Subscriber loop started")
    except Exception as e:
        print(f"Failed to connect to MQTT on startup: {e}")

# Start the background thread for MQTT
start_mqtt()
# ------------------

@app.get("/stream")
def get_stream():
    return {
        "latest": latest_data,
        "history": grid_history
    }

@app.post("/analyze")
def analyze(data: dict):
    result = run_grid_analysis(
        data["voltage"],
        data["current"],
        data["frequency"]
    )

    decision = dispatcher_agent(result)

    return {
        "analysis": result,
        "decision": decision
    }

@app.get("/grid-health")
def grid_health():
    # STEP 7: API VALIDATION
    if not latest_data:
        return {"status": "waiting", "message": "No MQTT data received yet"}
        
    last_voltage_window = latest_data.get("raw_voltage_window", [])
    last_val = last_voltage_window[-1] if last_voltage_window else None
    
    return {
        "timestamp": latest_data.get("timestamp"),
        "last_entropy": latest_data.get("entropy"),
        "last_dataset_value": last_val,
        "status": latest_data.get("status")
    }

@app.get("/grid-network-status")
def grid_network_status():
    global current_faulty_node
    
    if not latest_data:
        return {
            "active_nodes": [{"node_id": n, "microgrid_id": get_microgrid_id(n), "voltage": 220.0, "entropy": 0.1, "status": "ACTIVE"} for n in grid_nodes],
            "isolated_nodes": [],
            "fault_node": None,
            "impact": {"isolated_houses": 0, "active_houses": TOTAL_NODES * 416}
        }
        
    status = latest_data.get("status", "HEALTHY")
    entropy = latest_data.get("entropy", 0.1)
    
    # Check for overall anomaly
    overall_fault = status in ["FAULT", "ATTACK"] or entropy > 0.8
    
    if overall_fault:
        if current_faulty_node is None:
            current_faulty_node = random.choice(grid_nodes)
    else:
        current_faulty_node = None

    active_nodes = []
    isolated_nodes = []
    
    for node in grid_nodes:
        if overall_fault and node == current_faulty_node:
            isolated_nodes.append({
                "node_id": node,
                "microgrid_id": get_microgrid_id(node),
                "voltage": latest_data.get("raw_voltage_window", [150])[-1] if latest_data.get("raw_voltage_window") else 150,
                "entropy": entropy,
                "status": "ISOLATED"
            })
        else:
            active_nodes.append({
                "node_id": node,
                "microgrid_id": get_microgrid_id(node),
                "voltage": round(220 + random.uniform(-3, 3), 1),
                "entropy": round(random.uniform(0.1, 0.4), 3),
                "status": "ACTIVE"
            })
            
    return {
        "active_nodes": active_nodes,
        "isolated_nodes": isolated_nodes,
        "fault_node": current_faulty_node,
        "impact": {
            "isolated_houses": len(isolated_nodes) * 416,
            "active_houses": len(active_nodes) * 416
        }
    }