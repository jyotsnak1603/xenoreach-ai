import json

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .gemini_client import generate_content
from .models import AIRecommendation

from apps.analytics.services import calculate_campaign_analytics
from apps.campaigns.models import Campaign

def extract_json(text):
    cleaned = text.strip()

    if cleaned.startswith("```json"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()
    elif cleaned.startswith("```"):
        cleaned = cleaned.replace("```", "").strip()

    return json.loads(cleaned)


@api_view(["POST"])
def generate_message(request):
    goal = request.data.get("goal")

    if not goal:
        return Response(
            {"error": "goal is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    prompt = f"""
You are an AI marketing copywriter for a D2C brand.

Campaign goal:
{goal}

Generate 3 short campaign message variants.

Rules:
- Use {{name}} placeholder for personalization.
- Keep messages suitable for WhatsApp/SMS.
- Return ONLY valid JSON.
- No markdown.
- No explanation.

JSON format:
{{
  "friendly": "",
  "urgent": "",
  "premium": ""
}}
"""

    try:
        ai_text = generate_content(prompt)
        output = extract_json(ai_text)
    except Exception:
        output = {
            "friendly": "Hi {{name}}, we miss you! Come back and enjoy a special offer today.",
            "urgent": "Hi {{name}}, limited-time offer! Shop today before it expires.",
            "premium": "Hi {{name}}, enjoy an exclusive offer curated specially for you."
        }

    AIRecommendation.objects.create(
        recommendation_type="message",
        input_prompt=goal,
        output_json=output
    )

    return Response(output)

@api_view(["POST"])
def recommend_channel(request):
    segment_description = request.data.get("segment_description")
    goal = request.data.get("goal", "")

    if not segment_description:
        return Response(
            {"error": "segment_description is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    prompt = f"""
You are an AI marketing strategist for a D2C brand.

Campaign goal:
{goal}

Target audience:
{segment_description}

Choose the best channel from:
- whatsapp
- sms
- email
- rcs

Rules:
- Return ONLY valid JSON.
- No markdown.
- No explanation outside JSON.
- confidence_score must be an integer between 0 and 100.
- Higher confidence means stronger recommendation certainty.

JSON format:
{{
  "recommended_channel": "whatsapp",
  "reasoning": "Explain why this channel is best.",
  "confidence_score": 85
}}
"""

    try:
        ai_text = generate_content(prompt)
        output = extract_json(ai_text)
    except Exception:
        output = {
            "recommended_channel": "whatsapp",
            "reasoning": "WhatsApp is recommended because it generally gives faster engagement for personalized customer campaigns.",
            "confidence_score": 80
        }

    AIRecommendation.objects.create(
        recommendation_type="channel",
        input_prompt=f"Goal: {goal}\nSegment: {segment_description}",
        output_json=output
    )

    return Response(output)

@api_view(["POST"])
def plan_campaign(request):
    goal = request.data.get("goal")

    if not goal:
        return Response(
            {"error": "goal is required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    prompt = f"""
You are an AI campaign strategist for a D2C brand.

A marketer has this business goal:
{goal}

Create a campaign plan.

Return ONLY valid JSON.
No markdown.
No explanation outside JSON.

Rules:
- segment_rules must use only these possible keys:
  total_spent_gt, last_purchase_days_gt, last_purchase_days_lte, city,
  preferred_channel, age_gte, age_lte, order_count_gte
- recommended_channel must be one of: whatsapp, sms, email, rcs
- message must include {{name}} placeholder
- confidence_score must be integer from 0 to 100

JSON format:
{{
  "segment_name": "",
  "segment_description": "",
  "segment_rules": {{}},
  "message": "",
  "recommended_channel": "",
  "reasoning": "",
  "confidence_score": 85
}}
"""

    try:
        ai_text = generate_content(prompt)
        output = extract_json(ai_text)

        if "message" in output:
            output["message"] = output["message"].replace("{name}", "{{name}}")
    except Exception:
        output = {
            "segment_name": "Inactive Customers",
            "segment_description": "Customers who have not purchased recently",
            "segment_rules": {
                "last_purchase_days_gt": 60
            },
            "message": "Hi {{name}}, we miss you! Enjoy a special offer on your next order.",
            "recommended_channel": "whatsapp",
            "reasoning": "Inactive customers are best reactivated through short, personalized mobile-first campaigns.",
            "confidence_score": 80
        }

    AIRecommendation.objects.create(
        recommendation_type="planner",
        input_prompt=goal,
        output_json=output
    )

    return Response(output)

@api_view(["POST"])
def campaign_ai_insights(request, pk):
    try:
        campaign = Campaign.objects.get(id=pk)
        analytics = calculate_campaign_analytics(pk)
    except Campaign.DoesNotExist:
        return Response(
            {"error": "Campaign not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    prompt = f"""
You are an AI marketing analyst for a D2C CRM.

Analyze this campaign performance and generate useful business insights.

Campaign:
{campaign.name}

Goal:
{campaign.goal}

Channel:
{campaign.channel}

Analytics:
{json.dumps(analytics)}

Return ONLY valid JSON.
No markdown.
No explanation outside JSON.

JSON format:
{{
  "summary": "",
  "what_worked": "",
  "what_did_not_work": "",
  "recommended_next_action": "",
  "best_metric": "",
  "confidence_score": 85
}}
"""

    try:
        ai_text = generate_content(prompt)
        output = extract_json(ai_text)
    except Exception:
        output = {
            "summary": "The campaign generated measurable engagement across the selected audience.",
            "what_worked": "The selected channel produced successful delivery and engagement.",
            "what_did_not_work": "Some users did not progress beyond delivery or open stages.",
            "recommended_next_action": "Run a follow-up campaign with a stronger offer for users who did not click.",
            "best_metric": "delivery_rate",
            "confidence_score": 75
        }

    AIRecommendation.objects.create(
        campaign=campaign,
        recommendation_type="insight",
        input_prompt=json.dumps(analytics),
        output_json=output
    )

    return Response(output)