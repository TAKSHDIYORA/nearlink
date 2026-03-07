from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Post
from .serializers import PostSerializer

# 1. GET all posts and POST a new one
class PostListCreateView(generics.ListCreateAPIView):
    # Get all posts from the database, newest at the top
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    
    # Anyone can see posts, but only logged-in users can create them
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def perform_create(self, serializer):
        # Automatically set the 'author' to the user currently logged in
        serializer.save(author=self.request.user)

# 2. GET, UPDATE, or DELETE a specific post
class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    
    # Only the owner of the post can edit or delete it
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        # If the user is trying to delete/edit, ensure they own it
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            return Post.objects.filter(author=self.request.user)
        return Post.objects.all()

# 3. GET only the posts by a specific user (for Profile pages)
class UserPostListView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        return Post.objects.filter(author_id=user_id).order_by('-created_at')

# 4. (Optional) Simple Like Toggle View
class PostLikeToggleView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            post = Post.objects.get(pk=pk)
        except Post.DoesNotExist:
            return Response({'error': 'Post not found'}, status=status.HTTP_404_NOT_FOUND)

        if post.likes.filter(id=request.user.id).exists():
            post.likes.remove(request.user)
            return Response({'liked': False}, status=status.HTTP_200_OK)
        else:
            post.likes.add(request.user)
            return Response({'liked': True}, status=status.HTTP_200_OK)