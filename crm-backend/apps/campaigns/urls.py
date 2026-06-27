from django.urls import path
from .views import CampaignListCreateView, CampaignDetailView, launch_campaign, duplicate_campaign

urlpatterns = [
    path("campaigns/", CampaignListCreateView.as_view()),
    path("campaigns/<int:pk>/", CampaignDetailView.as_view()),
    path("campaigns/<int:pk>/launch/", launch_campaign),
    path("campaigns/<int:pk>/duplicate/", duplicate_campaign),
]