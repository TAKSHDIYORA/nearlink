from django.shortcuts import render
from .models import User, FriendRequest
from .serializers import UserSerializer,RegisterSerializer
from rest_framework import generics,views,response,status,permissions
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated

# Create your views here.
class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
#1. Search by username

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('q','')
        return User.objects.filter(username__icontains=query).exclude(id=self.request.user.id) 

#2. nearby users
class NearbyUserView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        print(self.request.user.latitude)
        if user.latitude and user.longitude:
           return User.objects.filter(
               latitude__range = (user.latitude - 1,user.latitude+1),
               longitude__range = (user.longitude -1,user.longitude+1)
               ).exclude(id=user.id)
        return User.objects.none()   
               
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer              
        