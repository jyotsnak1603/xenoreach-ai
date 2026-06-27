from django.urls import path
from . import views

urlpatterns = [
    path("reports/dashboard/", views.dashboard_stats, name="reports-dashboard"),
    path("reports/leads-by-source/", views.leads_by_source, name="reports-leads-source"),
    path("reports/leads-by-status/", views.leads_by_status, name="reports-leads-status"),
    path("reports/campaign-trend/", views.campaign_trend, name="reports-campaign-trend"),
    path("reports/notifications/", views.notifications, name="reports-notifications"),
    path("reports/export/leads.csv", views.export_leads_csv, name="reports-export-leads"),
]
