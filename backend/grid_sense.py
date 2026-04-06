import numpy as np

def calculate_entropy(signal):
    hist, _ = np.histogram(signal, bins=10, density=True)
    hist = hist[hist > 0]
    return -np.sum(hist * np.log2(hist))

def calculate_rms(signal):
    return float(np.sqrt(np.mean(np.square(signal))))

def calculate_thd(signal):
    fft_vals = np.abs(np.fft.rfft(signal))
    if len(fft_vals) < 2: return 0.0
    fundamental = np.max(fft_vals[1:5]) if len(fft_vals) >= 5 else fft_vals[1]
    if fundamental == 0: return 0.0
    harmonics = np.sqrt(np.sum(fft_vals[2:]**2))
    return float((harmonics / fundamental) * 100)

def check_frequency(freq):
    if abs(freq - 50) > 0.5:
        return "UNSTABLE"
    return "STABLE"

def run_grid_analysis(voltage, current, frequency):
    v_arr = np.array(voltage)
    entropy_v = calculate_entropy(v_arr)
    rms_v = calculate_rms(v_arr)
    thd_v = calculate_thd(v_arr)
    
    freq_status = check_frequency(frequency)

    # Base classification (HEALTHY, NOISE, FAULT)
    status = "HEALTHY"
    probability_of_fault = 0.0

    if entropy_v > 4.0 and thd_v > 20.0:
        status = "FAULT"
        probability_of_fault = min(1.0, (entropy_v / 10.0) + (thd_v / 100.0))
    elif entropy_v > 2.5 or thd_v > 10.0:
        status = "NOISE"
        probability_of_fault = 0.4
    else:
        status = "HEALTHY"
        probability_of_fault = 0.05

    result = {
        "entropy": float(entropy_v),
        "freq_status": freq_status,
        "alert": "NORMAL",
        "status": status,
        "thd": thd_v,
        "rms": rms_v,
        "probability_of_fault": probability_of_fault
    }

    if entropy_v > 4:
        result["alert"] = "HARMONIC DISTORTION"

    if freq_status == "UNSTABLE":
        result["alert"] = "GRID INSTABILITY"

    # STEP 4: PROCESSING OUTPUT CHECK
    print(f"Processed → Entropy: {entropy_v:.2f} | THD: {thd_v:.2f}% | RMS: {rms_v:.2f} | Status: {status}")

    return result