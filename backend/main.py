from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from grid_sense import run_grid_analysis
from agents import dispatcher_agent
import paho.mqtt.client as mqtt
import json
import threading

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