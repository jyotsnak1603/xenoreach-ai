from django.urls import path
from .views import (generate_message, recommend_channel, plan_campaign, campaign_ai_insights,)

urlpatterns = [
    path("ai/generate-message/", generate_message),
    path("ai/recommend-channel/", recommend_channel),
    path("ai/plan-campaign/", plan_campaign),
    path("campaigns/<int:pk>/ai-insights/", campaign_ai_insights),

]