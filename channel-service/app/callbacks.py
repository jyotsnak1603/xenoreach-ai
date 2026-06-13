import os
import requests
from dotenv import load_dotenv
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

load_dotenv()

CRM_CALLBACK_URL = os.getenv(
    "CRM_CALLBACK_URL",
    "http://127.0.0.1:8000/api/receipts/channel-callback/"
)


@retry(
    wait=wait_exponential(multiplier=1, min=2, max=10),
    stop=stop_after_attempt(5),
    retry=retry_if_exception_type(requests.RequestException),
    reraise=True
)
def _do_send_callback(payload: dict):
    response = requests.post(CRM_CALLBACK_URL, json=payload, timeout=5)
    response.raise_for_status()
    return response.status_code, response.text

def send_callback(payload: dict):
    try:
        return _do_send_callback(payload)
    except Exception as error:
        print(f"Failed to send callback after retries: {error}")
        return None, str(error)