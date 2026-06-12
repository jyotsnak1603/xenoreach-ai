import os
import requests
from dotenv import load_dotenv

load_dotenv()

CRM_CALLBACK_URL = os.getenv(
    "CRM_CALLBACK_URL",
    "http://127.0.0.1:8000/api/receipts/channel-callback/"
)


def send_callback(payload: dict):
    try:
        response = requests.post(CRM_CALLBACK_URL, json=payload, timeout=5)
        return response.status_code, response.text
    except requests.RequestException as error:
        return None, str(error)