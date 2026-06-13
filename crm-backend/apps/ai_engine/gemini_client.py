from google import genai
from google.genai import types
from django.conf import settings

client = genai.Client(api_key=settings.GEMINI_API_KEY)

def generate_content(prompt: str) -> str:
    """
    Call Gemini 2.5 Flash with strict JSON output mode.
    Uses google.genai (new SDK) — no more FutureWarning.
    """
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json",
        ),
    )
    return response.text