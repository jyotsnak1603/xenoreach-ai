import json
from pydantic import BaseModel, Field

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .gemini_client import generate_content
from .models import AIRecommendation

from apps.analytics.services import calculate_campaign_analytics
from apps.campaigns.models import Campaign

# ==============================================================================
# Pydantic Schemas for AI Structured Outputs
# ==============================================================================

class MessageVariantsSchema(BaseModel):
    friendly: str = Field(description="A friendly, casual message variant using {{name}} placeholder.")
    urgent: str = Field(description="An urgent, limited-time message variant using {{name}} placeholder.")
    premium: str = Field(description="A premium, exclusive message variant using {{name}} placeholder.")

class ChannelRecommendationSchema(BaseModel):
    recommended_channel: str = Field(description="Must be exactly one of: whatsapp, sms, email, rcs")
    reasoning: str = Field(description="Explain why this channel is the best choice.")
    confidence_score: int = Field(description="Integer between 0 and 100")

class CampaignPlanSchema(BaseModel):
    segment_name: str = Field(description="Short, catchy name for the audience segment")
    segment_description: str = Field(description="Detailed description of who this audience is")
    segment_rules: dict = Field(description="JSON rules object using keys like total_spent_gt, city, last_purchase_days_gt, etc.")
    message: str = Field(description="The primary personalized message template using {{name}}")
    recommended_channel: str = Field(description="whatsapp, sms, email, or rcs")
    reasoning: str = Field(description="Why this specific campaign strategy will work")
    confidence_score: int = Field(description="Integer between 0 and 100")

class AIInsightsSchema(BaseModel):
    summary: str = Field(description="High-level summary of the campaign performance")
    what_worked: str = Field(description="What specific aspects succeeded")
    what_did_not_work: str = Field(description="Where did the campaign underperform")
    recommended_next_action: str = Field(description="What should the marketer do next")
    best_metric: str = Field(description="The standout metric name (e.g., delivery_rate, conversion_rate)")
    confidence_score: int = Field(description="Integer between 0 and 100")


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

You must rigidly adhere to this JSON Schema for your output:
{json.dumps(MessageVariantsSchema.model_json_schema(), indent=2)}
"""

    try:
        ai_text = generate_content(prompt)
        output = json.loads(ai_text)
    except Exception as e:
        print(f"AI Generation Failed: {e}")
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

You must rigidly adhere to this JSON Schema for your output:
{json.dumps(ChannelRecommendationSchema.model_json_schema(), indent=2)}
"""

    try:
        ai_text = generate_content(prompt)
        output = json.loads(ai_text)
    except Exception as e:
        print(f"AI Generation Failed: {e}")
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

You must rigidly adhere to this JSON Schema for your output:
{json.dumps(CampaignPlanSchema.model_json_schema(), indent=2)}
"""

    try:
        ai_text = generate_content(prompt)
        output = json.loads(ai_text)

        if "message" in output:
            output["message"] = output["message"].replace("{name}", "{{name}}")
    except Exception as e:
        print(f"AI Generation Failed: {e}")
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

You must rigidly adhere to this JSON Schema for your output:
{json.dumps(AIInsightsSchema.model_json_schema(), indent=2)}
"""

    try:
        ai_text = generate_content(prompt)
        output = json.loads(ai_text)
    except Exception as e:
        print(f"AI Generation Failed: {e}")
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