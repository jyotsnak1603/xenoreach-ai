from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from .models import Segment
from .serializers import SegmentSerializer
from .services import get_customers_for_segment
from apps.customers.serializers import CustomerSerializer


class SegmentListCreateView(generics.ListCreateAPIView):
    serializer_class = SegmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Segment.objects.filter(owner=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


class SegmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = SegmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Segment.objects.filter(owner=self.request.user)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def segment_customers(request, pk):
    try:
        segment = Segment.objects.get(pk=pk, owner=request.user)
    except Segment.DoesNotExist:
        return Response({"error": "Segment not found"}, status=404)
    customers = get_customers_for_segment(segment)
    serializer = CustomerSerializer(customers, many=True)
    return Response({
        "segment": segment.name,
        "rules": segment.rules_json,
        "count": customers.count(),
        "customers": serializer.data
    })