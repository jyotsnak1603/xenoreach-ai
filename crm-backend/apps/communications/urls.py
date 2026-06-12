from django.urls import path

from .views import (
    CommunicationListView,
    CommunicationEventListView,
    channel_callback,
)

urlpatterns = [
    path("communications/",CommunicationListView.as_view()),
    path("communication-events/",CommunicationEventListView.as_view()),
    path("receipts/channel-callback/", channel_callback),

]