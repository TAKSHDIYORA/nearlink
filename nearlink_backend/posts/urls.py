from django.urls import path
from .views import PostListCreateView, PostDetailView, PostLikeToggleView

urlpatterns = [
    path('', PostListCreateView.as_view(), name='posts'),
    path('<int:pk>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:pk>/like/', PostLikeToggleView.as_view(), name='post-like'),
]