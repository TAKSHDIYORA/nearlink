from rest_framework import serializers
from .models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','latitude','longitude','bio']

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

