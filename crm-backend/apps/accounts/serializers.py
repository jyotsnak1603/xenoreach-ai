from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    password2 = serializers.CharField(write_only=True, label="Confirm Password")
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, default="marketing_manager")
    company = serializers.CharField(max_length=120, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["first_name", "last_name", "email", "username", "password", "password2", "role", "company"]

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value

    def validate(self, data):
        if data["password"] != data["password2"]:
            raise serializers.ValidationError({"password2": "Passwords do not match."})
        return data

    def create(self, validated_data):
        role = validated_data.pop("role", "marketing_manager")
        company = validated_data.pop("company", "")
        validated_data.pop("password2")
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, role=role, company=company)
        return user


class UserProfileSerializer(serializers.ModelSerializer):
    role_display = serializers.CharField(source="get_role_display", read_only=True)

    class Meta:
        model = UserProfile
        fields = ["role", "role_display", "company", "phone", "bio", "avatar_initials"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "full_name", "profile"]

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class ProfileUpdateSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=50, required=False)
    last_name = serializers.CharField(max_length=50, required=False)
    email = serializers.EmailField(required=False)
    company = serializers.CharField(max_length=120, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserProfile.ROLE_CHOICES, required=False)

    def update(self, user, validated_data):
        user.first_name = validated_data.get("first_name", user.first_name)
        user.last_name = validated_data.get("last_name", user.last_name)
        email = validated_data.get("email", user.email)
        if email != user.email and User.objects.filter(email=email).exclude(pk=user.pk).exists():
            raise serializers.ValidationError({"email": "Email already taken."})
        user.email = email
        user.save()

        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.company = validated_data.get("company", profile.company)
        profile.phone = validated_data.get("phone", profile.phone)
        profile.bio = validated_data.get("bio", profile.bio)
        if "role" in validated_data:
            profile.role = validated_data["role"]
        profile.save()
        return user
