import numpy as np

def calculate_entropy(signal):
    hist, _ = np.histogram(signal, bins=10, density=True)
    hist = hist[hist > 0]
    return -np.sum(hist * np.log2(hist))

def check_frequency(freq):
    if abs(freq - 50) > 0.5:
        return "UNSTABLE"
    return "STABLE"

def run_grid_analysis(voltage, current, frequency):
    entropy_v = calculate_entropy(np.array(voltage))

    freq_status = check_frequency(frequency)

    result = {
        "entropy": float(entropy_v),
        "freq_status": freq_status,
        "alert": "NORMAL"
    }

    if entropy_v > 4:
        result["alert"] = "HARMONIC DISTORTION"

    if freq_status == "UNSTABLE":
        result["alert"] = "GRID INSTABILITY"

    return result