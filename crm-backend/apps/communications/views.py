from rest_framework import generics

from .models import Communication, CommunicationEvent
from .serializers import (
    CommunicationSerializer,
    CommunicationEventSerializer,
)


class CommunicationListView(generics.ListAPIView):
    queryset = Communication.objects.select_related(
        "campaign",
        "customer"
    ).all()

    serializer_class = CommunicationSerializer


class CommunicationEventListView(generics.ListAPIView):
    queryset = CommunicationEvent.objects.all()
    serializer_class = CommunicationEventSerializer