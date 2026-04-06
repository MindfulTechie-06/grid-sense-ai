from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from grid_sense import run_grid_analysis
from agents import dispatcher_agent

app = FastAPI()

# ✅ ADD THIS EXACTLY HERE (before routes)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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