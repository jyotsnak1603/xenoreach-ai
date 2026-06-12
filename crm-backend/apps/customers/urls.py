from django.urls import path
from .views import (
    CustomerListView,
    CustomerDetailView,
    OrderListView,
    seed_customers,
    seed_orders,
)

urlpatterns = [
    path("customers/", CustomerListView.as_view()),
    path("customers/<int:pk>/", CustomerDetailView.as_view()),
    path("customers/seed/", seed_customers),

    path("orders/", OrderListView.as_view()),
    path("orders/seed/", seed_orders),
]