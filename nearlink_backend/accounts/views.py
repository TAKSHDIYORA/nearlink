from django.shortcuts import render,get_object_or_404
from .models import User, FriendRequest
from .serializers import UserSerializer,RegisterSerializer,CustomTokenObtainPairSerializer
from rest_framework import generics,views,response,status,permissions
from django.db.models import Q
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.exceptions import ValidationError

class MyLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    

#include this comment
class UserSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    
    def get_queryset(self):
        query = self.request.query_params.get('q','')
         # 1. Find all accepted friend IDs
        # We check both directions: where user is sender OR receiver
        user = self.request.user
        friends_as_sender = FriendRequest.objects.filter(
            sender=user, status='accepted'
        ).values_list('receiver_id', flat=True)
        
        friends_as_receiver = FriendRequest.objects.filter(
            receiver=user, status='accepted'
        ).values_list('sender_id', flat=True)

        # Combine them into one set of IDs to exclude
        friend_ids = set(list(friends_as_sender) + list(friends_as_receiver))
        return User.objects.filter(username__icontains=query).exclude(id=self.request.user.id).exclude(id__in=friend_ids) 

class NearbyUserView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        if not (user.latitude and user.longitude):
            return User.objects.none()
        
        if user.latitude is None or user.longitude is None or user.latitude == -1 or user.longitude == -1:
            raise ValidationError({
                "detail": "Please enable location services to see nearby users.",
                "code": "location_disabled"
            })

        # 1. Get IDs of EVERYONE who has a relationship with this user
        # (Sent requests, received requests, accepted friends, or pending)
        interacted_user_ids = FriendRequest.objects.filter(
            Q(sender=user) | Q(receiver=user)
        ).values_list('sender_id', 'receiver_id')

        # Flatten the list of tuples into a single set of IDs
        # e.g., [(1, 2), (1, 5)] becomes {1, 2, 5}
        exclude_ids = {uid for tup in interacted_user_ids for uid in tup}

        # 2. Filter nearby and exclude those IDs + self
        return User.objects.filter(
            latitude__range=(user.latitude - 0.1, user.latitude + 0.1),
            longitude__range=(user.longitude - 0.1, user.longitude + 0.1)
        ).exclude(
            id__in=exclude_ids
        ).exclude(
            id=user.id
        )
               
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
        data = [{"id":r.id,"sender":r.sender.username,"sender_id":r.sender.id} for r in requests] 
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
        print(User.objects.filter(id__in=flat_ids))
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
    def patch(self, request):
        user = request.user
        lat = request.data.get('latitude')
        lng = request.data.get('longitude')
        
        if lat is not None and lng is not None:
            user.latitude = lat
            user.longitude = lng
            user.save()
            return response.Response({"message": "Location updated successfully"})
        return response.Response({"error": "Invalid coordinates"}, status=400)    
        
                 

