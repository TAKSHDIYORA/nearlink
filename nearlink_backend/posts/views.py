from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Post, Comment, Bookmark, SharedPost
from .serializers import PostSerializer, CommentSerializer, BookmarkSerializer, SharedPostSerializer
from accounts.models import FriendRequest


def get_friends(user):
    """Helper: returns a queryset of Users who are accepted friends of the given user."""
    accepted = FriendRequest.objects.filter(
        status='accepted'
    ).filter(
        sender=user
    ).values_list('receiver', flat=True)

    accepted_reverse = FriendRequest.objects.filter(
        status='accepted'
    ).filter(
        receiver=user
    ).values_list('sender', flat=True)

    friend_ids = set(list(accepted) + list(accepted_reverse))
    return friend_ids


# ─── POST VIEWS ─────────────────────────────────────────────────────────────

class PostListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/posts/         → Friends-only feed (posts by the user + their friends)
    POST /api/posts/         → Create a new post
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        friend_ids = get_friends(user)
        # Include own posts + friends' posts
        visible_ids = friend_ids | {user.id}
        return Post.objects.filter(author__id__in=visible_ids).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/posts/<id>/   → View a single post
    PUT    /api/posts/<id>/   → Edit your post
    DELETE /api/posts/<id>/   → Delete your post
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return Post.objects.filter(author=self.request.user)
        return Post.objects.all()


class UserPostListView(generics.ListAPIView):
    """
    GET /api/posts/user/<user_id>/  → All posts by a specific user (for Profile page)
    """
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Post.objects.filter(author_id=user_id).order_by('-created_at')


# ─── LIKE VIEW ───────────────────────────────────────────────────────────────

class PostLikeToggleView(APIView):
    """
    POST /api/posts/<id>/like/  → Like or unlike a post
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            return Response({'liked': False}, status=status.HTTP_200_OK)
        else:
            post.likes.add(request.user)
            return Response({'liked': True}, status=status.HTTP_200_OK)


# ─── COMMENT VIEWS ───────────────────────────────────────────────────────────

class CommentListCreateView(generics.ListCreateAPIView):
    """
    GET  /api/posts/<id>/comments/  → List all comments on a post
    POST /api/posts/<id>/comments/  → Add a comment to a post
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        post_id = self.kwargs.get('pk')
        return Comment.objects.filter(post_id=post_id).order_by('created_at')

    def perform_create(self, serializer):
        post = get_object_or_404(Post, pk=self.kwargs.get('pk'))
        serializer.save(author=self.request.user, post=post)


class CommentDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/posts/<post_id>/comments/<comment_id>/  → Delete your own comment
    """
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Comment.objects.filter(author=self.request.user)


# ─── BOOKMARK VIEWS ──────────────────────────────────────────────────────────

class BookmarkToggleView(APIView):
    """
    POST /api/posts/<id>/bookmark/  → Bookmark or un-bookmark a post
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        bookmark, created = Bookmark.objects.get_or_create(user=request.user, post=post)
        if not created:
            bookmark.delete()
            return Response({'bookmarked': False}, status=status.HTTP_200_OK)
        return Response({'bookmarked': True}, status=status.HTTP_201_CREATED)


class BookmarkedPostsView(generics.ListAPIView):
    """
    GET /api/posts/bookmarked/  → List all posts the user has bookmarked
    """
    serializer_class = BookmarkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bookmark.objects.filter(user=self.request.user).order_by('-created_at')


# ─── SHARE VIEWS ─────────────────────────────────────────────────────────────

class SharePostView(APIView):
    """
    POST /api/posts/<id>/share/  → Share a post with a friend
    Body: { "recipient": <user_id>, "message": "optional message" }
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        post = get_object_or_404(Post, pk=pk)
        recipient_id = request.data.get('recipient')
        message = request.data.get('message', '')

        if not recipient_id:
            return Response({'error': 'recipient is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Make sure the recipient is actually a friend
        friend_ids = get_friends(request.user)
        if int(recipient_id) not in friend_ids:
            return Response({'error': 'You can only share posts with friends'}, status=status.HTTP_403_FORBIDDEN)

        from django.contrib.auth import get_user_model
        User = get_user_model()
        recipient = get_object_or_404(User, pk=recipient_id)

        shared = SharedPost.objects.create(
            sender=request.user,
            recipient=recipient,
            post=post,
            message=message
        )
        serializer = SharedPostSerializer(shared, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SharedWithMeView(generics.ListAPIView):
    """
    GET /api/posts/shared-with-me/  → List all posts shared with the logged-in user
    """
    serializer_class = SharedPostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SharedPost.objects.filter(recipient=self.request.user).order_by('-shared_at')
