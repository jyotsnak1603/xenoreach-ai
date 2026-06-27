import json
from django.utils import timezone
from apps.ai_engine.gemini_client import generate_content


def score_lead_with_ai(lead):
    """
    Calls Gemini to compute a lead score 0-100 with reason and conversion probability.
    Returns dict with lead_score, score_reason, conversion_probability.
    """
    prompt = f"""
You are a CRM AI assistant that scores sales leads.

Lead Information:
- Name: {lead.name}
- Company: {lead.company or 'Unknown'}
- Source: {lead.get_source_display()}
- Status: {lead.get_status_display()}
- Email: {'Provided' if lead.email else 'Not provided'}
- Phone: {'Provided' if lead.phone else 'Not provided'}
- Days since created: {(timezone.now() - lead.created_at).days}
- Last contacted: {'Never' if not lead.last_contacted else f'{(timezone.now() - lead.last_contacted).days} days ago'}
- Notes: {lead.notes or 'None'}

Score this lead from 0-100 based on:
- Completeness of contact info
- Source quality (referral=high, cold_call=low)
- Engagement level (status: new=low, interested=high, contacted=medium)
- Time sensitivity

Return ONLY a JSON object like:
{{
  "lead_score": 78,
  "score_reason": "High-quality referral lead with complete contact info and active engagement status.",
  "conversion_probability": "high"
}}

conversion_probability must be exactly one of: "high", "medium", "low"
"""
    try:
        result = json.loads(generate_content(prompt))
        return {
            "lead_score": int(result.get("lead_score", 50)),
            "score_reason": result.get("score_reason", "Score computed based on lead profile."),
            "conversion_probability": result.get("conversion_probability", "medium"),
        }
    except Exception:
        # Deterministic fallback based on source and status
        base = {"new": 30, "contacted": 50, "interested": 75, "converted": 95, "lost": 10}
        source_bonus = {"referral": 20, "website": 10, "email": 5, "whatsapp": 15, "social": 8, "ads": 5, "event": 12, "cold_call": 0, "other": 3}
        score = base.get(lead.status, 40) + source_bonus.get(lead.source, 5)
        score = min(score, 100)
        prob = "high" if score >= 70 else ("medium" if score >= 45 else "low")
        return {
            "lead_score": score,
            "score_reason": f"Score based on {lead.get_status_display()} status and {lead.get_source_display()} source.",
            "conversion_probability": prob,
        }


def generate_followup_message(lead):
    """
    Calls Gemini to generate a personalized follow-up message for the lead.
    Returns a follow-up message string.
    """
    days_inactive = (timezone.now() - (lead.last_contacted or lead.created_at)).days

    prompt = f"""
You are an AI sales assistant helping a CRM user write a follow-up message for a lead.

Lead Details:
- Name: {lead.name}
- Company: {lead.company or 'their company'}
- Status: {lead.get_status_display()}
- Source: {lead.get_source_display()}
- Days since last contact: {days_inactive}
- Notes: {lead.notes or 'No special notes'}

Write a short, warm, personalized follow-up message (2-3 sentences max) that:
1. References how long it's been since contact
2. Provides value or asks a relevant question
3. Ends with a clear call to action

Return ONLY the message text, no JSON, no labels.
"""
    try:
        return generate_content(prompt).strip()
    except Exception:
        return (
            f"Hi {lead.name}, I wanted to follow up on our previous conversation. "
            f"It's been {days_inactive} days and I'd love to reconnect and understand how we can help you. "
            f"Would you be available for a quick 15-minute call this week?"
        )
