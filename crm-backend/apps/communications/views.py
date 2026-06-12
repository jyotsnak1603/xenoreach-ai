from rest_framework import generics, status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.utils import timezone
from django.db import IntegrityError

from .models import Communication, CommunicationEvent
from .serializers import CommunicationSerializer, CommunicationEventSerializer


class CommunicationListView(generics.ListAPIView):
    queryset = Communication.objects.select_related(
        "campaign",
        "customer"
    ).all()
    serializer_class = CommunicationSerializer


class CommunicationEventListView(generics.ListAPIView):
    queryset = CommunicationEvent.objects.all()
    serializer_class = CommunicationEventSerializer


VALID_TRANSITIONS = {
    "created": ["sent"],
    "sent": ["delivered", "failed"],
    "delivered": ["opened", "read", "clicked", "converted"],
    "opened": ["clicked", "converted"],
    "read": ["clicked", "converted"],
    "clicked": ["converted"],
    "converted": [],
    "failed": [],
}


@api_view(["POST"])
def channel_callback(request):
    communication_id = request.data.get("communication_id")
    event_type = request.data.get("event_type")
    channel = request.data.get("channel")

    if not communication_id or not event_type or not channel:
        return Response(
            {"error": "communication_id, event_type and channel are required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        communication = Communication.objects.get(id=communication_id)
    except Communication.DoesNotExist:
        return Response(
            {"error": "Communication not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    current_status = communication.current_status
    allowed_next = VALID_TRANSITIONS.get(current_status, [])

    if event_type not in allowed_next:
        return Response(
            {
                "error": "Invalid status transition",
                "current_status": current_status,
                "event_type": event_type,
            },
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        CommunicationEvent.objects.create(
            communication=communication,
            event_type=event_type,
            channel=channel,
            metadata_json=request.data,
        )
    except IntegrityError:
        return Response(
            {"message": "Duplicate callback ignored"},
            status=status.HTTP_200_OK
        )

    now = timezone.now()
    communication.current_status = event_type

    if event_type == "sent":
        communication.sent_at = now
    elif event_type == "delivered":
        communication.delivered_at = now
    elif event_type == "failed":
        communication.failed_at = now
    elif event_type == "opened":
        communication.opened_at = now
    elif event_type == "read":
        communication.read_at = now
    elif event_type == "clicked":
        communication.clicked_at = now
    elif event_type == "converted":
        communication.converted_at = now

    communication.save()

    return Response(
        {
            "message": "Callback processed successfully",
            "communication_id": communication.id,
            "new_status": communication.current_status,
        },
        status=status.HTTP_200_OK
    )