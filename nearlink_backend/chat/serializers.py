from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    # This allows us to see the username instead of just the user ID
    sender_username = serializers.ReadOnlyField(source='sender.username')

    class Meta:
        model = Message
        # Remove 'receiver' from this list
        fields = ['id', 'group', 'sender', 'sender_username', 'content', 'timestamp']