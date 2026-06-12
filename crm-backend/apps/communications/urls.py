from django.urls import path

from .views import (
    CommunicationListView,
    CommunicationEventListView,
)

urlpatterns = [
    path(
        "communications/",
        CommunicationListView.as_view()
    ),
    path(
        "communication-events/",
        CommunicationEventListView.as_view()
    ),
]