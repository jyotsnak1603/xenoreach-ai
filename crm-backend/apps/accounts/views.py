from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.management import call_command

from .models import UserProfile
from .serializers import RegisterSerializer, UserSerializer, ProfileUpdateSerializer


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        tokens = get_tokens_for_user(user)
        return Response(
            {"user": UserSerializer(user).data, **tokens},
            status=status.HTTP_201_CREATED,
        )
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email_or_username = request.data.get("email", "")
    password = request.data.get("password", "")

    # Try email first, then username
    user = None
    try:
        u = User.objects.get(email=email_or_username)
        user = authenticate(username=u.username, password=password)
    except User.DoesNotExist:
        user = authenticate(username=email_or_username, password=password)

    if not user:
        return Response(
            {"error": "Invalid credentials. Please check your email and password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )

    tokens = get_tokens_for_user(user)
    return Response({"user": UserSerializer(user).data, **tokens})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        if refresh_token:
            token = RefreshToken(refresh_token)
            token.blacklist()
    except Exception:
        pass
    return Response({"message": "Logged out successfully."})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


@api_view(["PATCH"])
@permission_classes([IsAuthenticated])
def update_profile(request):
    serializer = ProfileUpdateSerializer(data=request.data)
    if serializer.is_valid():
        serializer.update(request.user, serializer.validated_data)
        return Response(UserSerializer(request.user).data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def change_password(request):
    user = request.user
    current = request.data.get("current_password", "")
    new_pass = request.data.get("new_password", "")
    if not user.check_password(current):
        return Response({"error": "Current password is incorrect."}, status=status.HTTP_400_BAD_REQUEST)
    if len(new_pass) < 6:
        return Response({"error": "New password must be at least 6 characters."}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_pass)
    user.save()
    return Response({"message": "Password changed successfully."})

@api_view(['GET'])
@permission_classes([AllowAny])
def trigger_seed(request):
    import traceback
    import threading
    from django.core.management import call_command
    
    def run_seed():
        try:
            call_command('seed_demo')
        except Exception as e:
            print(f"Background seed error: {e}")
            
    try:
        thread = threading.Thread(target=run_seed)
        thread.start()
        return Response({"message": "Demo data seeding has started in the background! Please wait 1-2 minutes for it to complete."})
    except Exception as e:
        return Response({"error": str(e), "traceback": traceback.format_exc()}, status=500)
