import random
import time
from datetime import datetime, timezone

from app.callbacks import send_callback


CHANNEL_PROBABILITIES = {
    "whatsapp": {
        "delivered": 0.95,
        "opened": 0.80,
        "clicked": 0.35,
        "converted": 0.12,
    },
    "email": {
        "delivered": 0.92,
        "opened": 0.55,
        "clicked": 0.18,
        "converted": 0.06,
    },
    "sms": {
        "delivered": 0.98,
        "opened": 0.45,
        "clicked": 0.10,
        "converted": 0.03,
    },
    "rcs": {
        "delivered": 0.90,
        "opened": 0.65,
        "clicked": 0.25,
        "converted": 0.08,
    },
}


def should_happen(probability: float) -> bool:
    return random.random() <= probability


def build_event(payload, event_type):
    return {
        "communication_id": payload.communication_id,
        "event_type": event_type,
        "channel": payload.channel,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "metadata": {
            "campaign_id": payload.campaign_id,
            "customer_id": payload.customer_id,
            "simulated": True,
        },
    }


def simulate_communication_lifecycle(payload):
    channel = payload.channel.lower()
    probabilities = CHANNEL_PROBABILITIES.get(
        channel,
        CHANNEL_PROBABILITIES["sms"]
    )

    time.sleep(1)
    send_callback(build_event(payload, "sent"))

    if not should_happen(probabilities["delivered"]):
        time.sleep(1)
        send_callback(build_event(payload, "failed"))
        return

    time.sleep(1)
    send_callback(build_event(payload, "delivered"))

    if should_happen(probabilities["opened"]):
        time.sleep(1)
        send_callback(build_event(payload, "opened"))

    if should_happen(probabilities["clicked"]):
        time.sleep(1)
        send_callback(build_event(payload, "clicked"))

    if should_happen(probabilities["converted"]):
        time.sleep(1)
        send_callback(build_event(payload, "converted"))