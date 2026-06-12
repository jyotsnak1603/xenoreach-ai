from fastapi import FastAPI, BackgroundTasks
from app.schemas import SendRequest, SendResponse
from app.simulator import simulate_communication_lifecycle

app = FastAPI(title="XenoReach Channel Simulator")


@app.get("/")
def health_check():
    return {"service": "channel-simulator", "status": "running"}


@app.post("/send/", response_model=SendResponse)
def send_message(payload: SendRequest, background_tasks: BackgroundTasks):
    background_tasks.add_task(simulate_communication_lifecycle, payload)

    return SendResponse(
        accepted=True,
        communication_id=payload.communication_id,
        message="Communication accepted for simulation",
    )