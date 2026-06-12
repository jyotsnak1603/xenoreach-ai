from django.urls import path
from .views import campaign_analytics

urlpatterns = [
    path("campaigns/<int:pk>/analytics/", campaign_analytics),
]