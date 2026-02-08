from django.urls import path
from .views import UserListView,UserSearchView,NearbyUserView,RegisterView,SendFriendRequestView,ManageFriendRequestView,FriendsListView,PendingListView,CurrentUserView
from rest_framework_simplejwt.views import TokenObtainPairView , TokenRefreshView
# from accounts.views import RegisterView

urlpatterns = [
    path('auth/me/',CurrentUserView.as_view(),name='curr_user'),
    path('auth/register/',RegisterView.as_view(),name='auth_register'),
    path('auth/login/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('auth/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('users/',UserListView.as_view(),name='user-list'),
    path('users/search/',UserSearchView.as_view(),name='user-search'),
    path('users/nearby/',NearbyUserView.as_view(),name='user-nearby'),
    path('friends/send/<int:receiver_id>/',SendFriendRequestView.as_view()),
    path('friends/requests/',ManageFriendRequestView.as_view()),
    path('friends/requests/<int:request_id>/',ManageFriendRequestView.as_view()),
    path('friends/list/',FriendsListView.as_view()),
    path('friends/pending/',PendingListView.as_view()),
    
]