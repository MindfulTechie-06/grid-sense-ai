def dispatcher_agent(data):
    if data["entropy"] > 4:
        return "Recommend Predictive Maintenance"

    if data["freq_status"] == "UNSTABLE":
        return "Recommend Load Shedding"

    return "System Stable"