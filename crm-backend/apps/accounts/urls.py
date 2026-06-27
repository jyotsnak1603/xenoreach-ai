from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path("auth/register/", views.register, name="auth-register"),
    path("auth/login/", views.login, name="auth-login"),
    path("auth/logout/", views.logout, name="auth-logout"),
    path("auth/me/", views.me, name="auth-me"),
    path("auth/profile/", views.update_profile, name="auth-profile-update"),
    path("auth/change-password/", views.change_password, name="auth-change-password"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    
    path("dev/seed-demo/", views.trigger_seed, name="dev-seed"),
]
