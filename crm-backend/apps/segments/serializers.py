from rest_framework import serializers
from .models import Segment
from .services import get_customers_for_segment


class SegmentSerializer(serializers.ModelSerializer):
    audience_count = serializers.SerializerMethodField()

    class Meta:
        model = Segment
        fields = "__all__"

    def get_audience_count(self, obj):
        try:
            return get_customers_for_segment(obj).count()
        except Exception:
            return 0