import paho.mqtt.client as mqtt
import pandas as pd
import numpy as np
import time
import json
from grid_sense import run_grid_analysis

# --- Configuration ---
MQTT_BROKER = "broker.hivemq.com"
MQTT_PORT = 1883
MQTT_TOPIC = "india/grid/health"
CSV_FILE_PATH = "data/Flicker.csv" 
WINDOW_SIZE = 100

# Setup MQTT Client
client = mqtt.Client()

def start_streaming():
    print(f"Loading dataset from {CSV_FILE_PATH}...")
    
    try:
        client.connect(MQTT_BROKER, MQTT_PORT, 60)
        df = pd.read_csv(CSV_FILE_PATH, header=None)
        
        # STEP 9: ERROR CHECKS
        if df.empty:
            print("CRITICAL ERROR: Dataset is empty.")
            return
        if pd.isna(df).any().any():
            print("WARNING: NaN values detected in dataset! Filling with 0.")
            df = df.fillna(0)
            
        # STEP 1: DATASET LOAD CONFIRMATION
        print(f"Dataset loaded: {CSV_FILE_PATH} | Rows: {df.shape[0]} | Columns: {df.shape[1]} (No headers)")
        
    except Exception as e:
        print(f"CRITICAL ERROR: Could not load {CSV_FILE_PATH} or connect to MQTT. {e}")
        return

    print("Flattening array and starting edge stream...")
    # Flatten the 1000x100 matrix to a contiguous 1D array
    signal = df.values.flatten()
    total_points = len(signal)
    
    # We slide over the flat array (step=WINDOW_SIZE//2 for overlap)
    for start_idx in range(0, total_points - WINDOW_SIZE, int(WINDOW_SIZE / 2)):
        v_window = signal[start_idx : start_idx + WINDOW_SIZE].tolist()
        
        # Synthetic current based on voltage
        i_window = [v * np.random.uniform(0.4, 0.6) for v in v_window]
        
        # STEP 2: LIVE DATA STREAM CHECK
        print(f"Streaming Data → V: {v_window[0]:.2f} | I: {i_window[0]:.2f} | f: 50.0")
        
        # STEP 3: WINDOW DATA CHECK
        print(f"Window Size: {len(v_window)} | V_min: {min(v_window):.2f} | V_max: {max(v_window):.2f}")
        
        # Analysis
        analysis = run_grid_analysis(v_window, i_window, 50.0)
        
        payload = {
            "device_id": "EDGE_SENSOR_FLICKER",
            "timestamp": time.time(),
            "status": analysis["status"],
            "entropy": round(analysis["entropy"], 3),
            "thd": round(analysis["thd"], 2),
            "rms": round(analysis["rms"], 2),
            "probability_of_fault": round(analysis["probability_of_fault"], 3),
            "voltage": round(float(analysis["rms"]), 2),
            "current": round(float(np.sqrt(np.mean(np.square(i_window)))), 2),
            "frequency": 50.0, 
            "raw_voltage_window": v_window, 
            "raw_current_window": i_window
        }
        
        client.publish(MQTT_TOPIC, json.dumps(payload))
        
        # STEP 5: MQTT VERIFICATION
        print(f"MQTT Sent → {{status: {analysis['status']}, entropy: {payload['entropy']}}}")
        
        # Simulate real-time stream interval
        time.sleep(1.0)

if __name__ == "__main__":
    start_streaming()