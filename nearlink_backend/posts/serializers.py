from rest_framework import serializers
from .models import Post

class PostSerializer(serializers.ModelSerializer):
    # This grabs the username from the related User model so React can show it
    author_username = serializers.ReadOnlyField(source='author.username')
    
    # This counts the likes for us automatically
    likes_count = serializers.SerializerMethodField()
    
    # This checks if the person currently logged in has liked this post
    is_liked = serializers.SerializerMethodField()

    class Meta:
        model = Post
        fields = [
            'id', 
            'author', 
            'author_username', 
            'content', 
            'image', 
            'created_at', 
            'likes_count', 
            'is_liked'
        ]
        # 'author' is read-only because we set it automatically in the View
        read_only_fields = ['author', 'created_at']

    def get_likes_count(self, obj):
        return obj.likes.count()

    def get_is_liked(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.likes.filter(id=request.user.id).exists()
        return False