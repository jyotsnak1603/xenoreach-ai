import requests
import threading
from django.conf import settings


def _sync_dispatch(payload):
    try:
        base_url = settings.CHANNEL_SERVICE_URL.rstrip("/")
        url = f"{base_url}/send/"

        response = requests.post(
            url,
            json=payload,
            timeout=10
        )

        print("Channel service response:", response.status_code, response.text)

    except Exception as error:
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

    thread = threading.Thread(target=_sync_dispatch, args=(payload,))
    thread.daemon = True
    thread.start()

    return True