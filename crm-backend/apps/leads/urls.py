from django.urls import path
from . import views

urlpatterns = [
    path("leads/", views.LeadListCreateView.as_view(), name="lead-list-create"),
    path("leads/<int:pk>/", views.LeadDetailView.as_view(), name="lead-detail"),
    path("leads/<int:pk>/score/", views.score_lead, name="lead-score"),
    path("leads/<int:pk>/followup/", views.generate_followup, name="lead-followup"),
    path("leads/<int:pk>/contacted/", views.mark_contacted, name="lead-contacted"),
    path("leads/<int:pk>/activities/", views.lead_activities, name="lead-activities"),
]
