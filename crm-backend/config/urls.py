from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "online",
        "message": "Welcome to XenoReach AI API. All endpoints are under /api/."
    })
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),

    # Auth (public)
    path("api/", include("apps.accounts.urls")),

    # Core CRM (protected via DEFAULT_PERMISSION_CLASSES)
    path("api/", include("apps.customers.urls")),
    path("api/", include("apps.segments.urls")),
    path("api/", include("apps.campaigns.urls")),
    path("api/", include("apps.communications.urls")),
    path("api/", include("apps.analytics.urls")),
    path("api/", include("apps.ai_engine.urls")),

    # New modules
    path("api/", include("apps.leads.urls")),
    path("api/", include("apps.reports.urls")),
]
