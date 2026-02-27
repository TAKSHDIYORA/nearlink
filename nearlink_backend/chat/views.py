from django.shortcuts import render
from rest_framework import views,response,permissions
from django.db.models import Q
from .models import Message,ChatGroup
from .serializers import MessageSerializer
import pusher
import os
pusher_client = pusher.Pusher(
    app_id=os.getenv("app_id"),
    key=os.getenv("key"),
    secret=os.getenv("secret"),
    cluster=os.getenv("cluster"),
    ssl=True
)
class ChatSessionView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, other_user_id):
        chat = ChatGroup.objects.filter(is_group=False, members=request.user).filter(members__id=other_user_id).first()
        
        if not chat:
            chat = ChatGroup.objects.create(is_group=False)
            chat.members.add(request.user, other_user_id)

        messages = chat.messages.all().order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return response.Response({"group_id": chat.id, "messages": serializer.data})

    def post(self, request, other_user_id):
        content = request.data.get('content')
        chat = ChatGroup.objects.filter(is_group=False, members=request.user).filter(members__id=other_user_id).first()

        if not chat:
            return response.Response({"error": "Chat session not found"}, status=404)

        message = Message.objects.create(group=chat, sender=request.user, content=content)

        pusher_client.trigger(
            f'chat-{chat.id}', 
            'new-message', 
            {
                'id': message.id,
                'content': message.content,
                'sender_username': request.user.username,
                'timestamp': str(message.timestamp)
            }
        )
        return response.Response({"status": "Message Sent"}, status=201)
    
class CreateGroupView(views.APIView):
    def post(self, request):
        name = request.data.get('name')
        member_ids = request.data.get('members', []) # List of IDs: [2, 5, 10]

        if not name or not member_ids:
            return response.Response({"error": "Name and members required"}, status=400)

        # 1. Create the Group
        group = ChatGroup.objects.create(name=name, is_group=True)
        
        # 2. Add the creator and the selected friends
        group.members.add(request.user)
        for m_id in member_ids:
            group.members.add(m_id)

        return response.Response({
            "id": group.id,
            "name": group.name,
            "message": "Group created successfully!"
        }, status=201)    
        
        
# Add this class to your views.py
class GroupMessageView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, group_id):
        # Ensure the user is actually a member of this group
        try:
            chat = ChatGroup.objects.get(id=group_id, members=request.user)
        except ChatGroup.DoesNotExist:
            return response.Response({"error": "Group not found or Access Denied"}, status=404)

        messages = chat.messages.all().order_by('timestamp')
        serializer = MessageSerializer(messages, many=True)
        return response.Response({
            "group_id": chat.id, 
            "messages": serializer.data,
            "group_name": chat.name
        })

    def post(self, request, group_id):
        content = request.data.get('content')
        try:
            chat = ChatGroup.objects.get(id=group_id, members=request.user)
        except ChatGroup.DoesNotExist:
            return response.Response({"error": "Access Denied"}, status=403)

        message = Message.objects.create(group=chat, sender=request.user, content=content)

        # Trigger Pusher (Same logic as 1v1)
        pusher_client.trigger(
            f'chat-{chat.id}', 
            'new-message', 
            {
                'id': message.id,
                'content': message.content,
                'sender_username': request.user.username,
                'timestamp': str(message.timestamp)
            }
        )
        return response.Response({"status": "Message Sent"}, status=201)        
class UserRoomsView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        rooms = request.user.chat_groups.all()
        data = []
        for room in rooms:
            if not room.is_group:
                # For 1v1, get the name of the other person
                other_user = room.members.exclude(id=request.user.id).first()
                display_name = other_user.username if other_user else "Unknown"
                other_user_id = other_user.id if other_user else None
            else:
                display_name = room.name
                other_user_id = None
                
            data.append({
                "id": room.id,
                "display_name": display_name,
                "is_group": room.is_group,
                "other_user_id": other_user_id # Important for 1v1 logic
            })
        return response.Response(data)    