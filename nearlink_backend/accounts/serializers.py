from rest_framework import serializers
from .models import User,FriendRequest
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import authenticate
from django.db.models import Q


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        # 1. Check if the user even exists
        user_exists = User.objects.filter(username=username).exists()
        if not user_exists:
            raise AuthenticationFailed({
                "error_type": "username",
                "message": "User with this username does not exist."
            })

        # 2. Try to authenticate (check password)
        user = authenticate(username=username, password=password)
        
        if user is None:
            raise AuthenticationFailed({
                "error_type": "password",
                "message": "Incorrect password. Please try again."
            })

        if not user.is_active:
            raise AuthenticationFailed({
                "error_type": "account",
                "message": "This account has been disabled."
            })

        # 3. If everything is fine, return the standard tokens
        return super().validate(attrs)
    
class UserSerializer(serializers.ModelSerializer):
    request_status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'latitude', 'longitude', 'bio', 'request_status']

    def get_request_status(self, obj):
        user = self.context['request'].user
        if not user.is_authenticated:
            return "none"

        # Look for any request between these two users
        friend_request = FriendRequest.objects.filter(
            (Q(sender=user, receiver=obj) | Q(sender=obj, receiver=user))
        ).first()

        if not friend_request:
            return "none"
        
        if friend_request.status == 'accepted':
            return "accepted"
        
        if friend_request.status == 'pending':
            if friend_request.sender == user:
                return "sent"  # You sent the request
            else:
                return "received"  # They sent it to you
                
        return "none"


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    class Meta:
        model = User
        fields = ('username','password','email','bio','latitude','longitude')
    def create(self,validate_data):
        user = User.objects.create_user(
            username=validate_data['username'],
            password=validate_data['password'],
            email = validate_data.get('email',''),
            bio = validate_data.get('bio',''),
            latitude = validate_data.get('latitude'),
            longitude = validate_data.get('longitude')
        )            
        return user
    
