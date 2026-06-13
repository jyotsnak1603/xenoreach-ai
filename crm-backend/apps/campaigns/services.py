import requests
import threading

CHANNEL_SERVICE_URL = "http://127.0.0.1:9000/send/"

def _sync_dispatch(payload):
    try:
        requests.post(
            CHANNEL_SERVICE_URL,
            json=payload,
            timeout=5
        )
    except requests.RequestException as error:
        print(f"Failed to dispatch to channel service: {error}")

def dispatch_to_channel_service(communication):
    payload = {
        "communication_id": communication.id,
        "campaign_id": communication.campaign.id,
        "customer_id": communication.customer.id,
        "recipient": communication.recipient,
        "channel": communication.channel,
        "message": communication.personalized_message,
    }
    
    # Run synchronously for test simplicity or asynchronously to free up the web worker
    # In production, this would be a Celery task: dispatch_task.delay(payload)
    thread = threading.Thread(target=_sync_dispatch, args=(payload,))
    thread.start()
    
    return True