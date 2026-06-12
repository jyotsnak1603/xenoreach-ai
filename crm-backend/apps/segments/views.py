from rest_framework import generics
from rest_framework.response import Response
from rest_framework.decorators import api_view

from .models import Segment
from .serializers import SegmentSerializer
from .services import get_customers_for_segment
from apps.customers.serializers import CustomerSerializer


class SegmentListCreateView(generics.ListCreateAPIView):
    queryset = Segment.objects.all().order_by("-created_at")
    serializer_class = SegmentSerializer


class SegmentDetailView(generics.RetrieveAPIView):
    queryset = Segment.objects.all()
    serializer_class = SegmentSerializer


@api_view(["GET"])
def segment_customers(request, pk):
    segment = Segment.objects.get(pk=pk)
    customers = get_customers_for_segment(segment)
    serializer = CustomerSerializer(customers, many=True)

    return Response({
        "segment": segment.name,
        "rules": segment.rules_json,
        "count": customers.count(),
        "customers": serializer.data
    })