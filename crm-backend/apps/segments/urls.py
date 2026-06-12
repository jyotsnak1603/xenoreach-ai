from django.urls import path
from .views import (
    SegmentListCreateView,
    SegmentDetailView,
    segment_customers,
)

urlpatterns = [
    path("segments/", SegmentListCreateView.as_view()),
    path("segments/<int:pk>/", SegmentDetailView.as_view()),
    path("segments/<int:pk>/customers/", segment_customers),
]