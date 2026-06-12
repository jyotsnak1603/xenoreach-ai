import requests


CHANNEL_SERVICE_URL = "http://127.0.0.1:9000/send/"


def dispatch_to_channel_service(communication):
    payload = {
        "communication_id": communication.id,
        "campaign_id": communication.campaign.id,
        "customer_id": communication.customer.id,
        "recipient": communication.recipient,
        "channel": communication.channel,
        "message": communication.personalized_message,
    }

    try:
        response = requests.post(
            CHANNEL_SERVICE_URL,
            json=payload,
            timeout=5
        )
        return response.status_code, response.json()
    except requests.RequestException as error:
        return None, {"error": str(error)}