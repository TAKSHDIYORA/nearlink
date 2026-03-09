from django.urls import path
from .views import (
    PostListCreateView,
    PostDetailView,
    PostLikeToggleView,
    UserPostListView,
    CommentListCreateView,
    CommentDeleteView,
    BookmarkToggleView,
    BookmarkedPostsView,
    SharePostView,
    SharedWithMeView,
)

urlpatterns = [
    # ── Posts ──────────────────────────────────────────────
    path('', PostListCreateView.as_view(), name='posts'),                        # GET friends feed / POST new post
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),             # GET / PUT / DELETE a post
    path('user/<int:user_id>/', UserPostListView.as_view(), name='user-posts'),  # GET posts by specific user

    # ── Comments ───────────────────────────────────────────
    path('<int:pk>/comments/', CommentListCreateView.as_view(), name='post-comments'),              # GET / POST comments
    path('<int:pk>/comments/<int:comment_id>/', CommentDeleteView.as_view(), name='comment-delete'),# DELETE comment

    # ── Bookmarks ──────────────────────────────────────────
    path('<int:pk>/bookmark/', BookmarkToggleView.as_view(), name='post-bookmark'),  # POST to bookmark/unbookmark
    path('bookmarked/', BookmarkedPostsView.as_view(), name='bookmarked-posts'),     # GET all bookmarked posts

    # ── Share ──────────────────────────────────────────────
    path('<int:pk>/share/', SharePostView.as_view(), name='post-share'),             # POST to share with a friend
    path('shared-with-me/', SharedWithMeView.as_view(), name='shared-with-me'),      # GET posts shared with me

     # ── Likes ──────────────────────────────────────────────
    path('<int:pk>/like/', PostLikeToggleView.as_view(), name='post-like'),      # POST to like/unlike

]
