from django.shortcuts import render,get_object_or_404
from .models import User, FriendRequest
from .serializers import UserSerializer,RegisterSerializer
from rest_framework import generics,views,response,status,permissions
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    

class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('q','')
        return User.objects.filter(username__icontains=query).exclude(id=self.request.user.id) 

class NearbyUserView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        print(self.request.user.latitude)
        if user.latitude and user.longitude:
           return User.objects.filter(
               latitude__range = (user.latitude - 0.1,user.latitude+0.1),
               longitude__range = (user.longitude -0.1,user.longitude+0.1)
               ).exclude(id=user.id)
        return User.objects.none()   
               
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer              

class SendFriendRequestView(views.APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request, receiver_id):
        receiver = get_object_or_404(User, id=receiver_id)
        
        if receiver == request.user:
            return response.Response({"error": "You can't add yourself"}, status=400)
        
        existing_request = FriendRequest.objects.filter(
            (Q(sender=request.user, receiver=receiver) | 
             Q(sender=receiver, receiver=request.user))
        ).first()

        if existing_request:
            if existing_request.status == 'accepted':
                return response.Response({"message": "You are already friends!"}, status=400)
            if existing_request.sender == request.user:
                return response.Response({"message": "Request already sent!"}, status=400)
            if existing_request.receiver == request.user:
                return response.Response({"message": "This person already sent you a request! check your pending list."}, status=400)

        FriendRequest.objects.create(
            sender=request.user,
            receiver=receiver,
            status='pending'
        )
        
        return response.Response({"message": "Friend request sent!"}, status=status.HTTP_201_CREATED)

class ManageFriendRequestView(views.APIView):
    permission_classes = [IsAuthenticated]  
    
    def get(self,request):
        requests = FriendRequest.objects.filter(receiver=request.user,status='pending')
        data = [{"id":r.id,"sender":r.sender.username} for r in requests] 
        return response.Response(data)
    
    def patch(self,request,request_id):
        action = request.data.get('action')
        try:
            fr = FriendRequest.objects.get(id=request_id,receiver=request.user)
            fr.status = action
            fr.save()
            return response.Response({"message":f"Request {action}"}) 
        except FriendRequest.DoesNotExist:
            return response.Response({"error":"Request not found"},status=404)  
        

class FriendsListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        friend_ids = FriendRequest.objects.filter(
            (Q(sender=user)|Q(receiver=user)),
            status='accepted'
        ).values_list('sender_id','receiver_id')
        
        flat_ids = set([item for sublist in friend_ids for item in sublist])
        flat_ids.discard(user.id)
        return User.objects.filter(id__in=flat_ids)     
    
class PendingListView(views.APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 1. Requests I received (Incoming)
        received = FriendRequest.objects.filter(receiver=request.user, status='pending')
        # 2. Requests I sent (Outgoing)
        sent = FriendRequest.objects.filter(sender=request.user, status='pending')

        return response.Response({
            "received": [{"id": r.id, "username": r.sender.username, "bio": r.sender.bio} for r in received],
            "sent": [{"id": r.id, "username": r.receiver.username, "bio": r.receiver.bio} for r in sent]
        })   
        
class CurrentUserView(views.APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        user = request.user
        return response.Response({
            "username": user.username,
            "email": user.email,
            "bio": user.bio,
            "latitude": user.latitude,
            "longitude": user.longitude
        })           

