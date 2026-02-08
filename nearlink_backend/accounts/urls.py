from django.urls import path
from .views import UserListView,UserSearchView,NearbyUserView,RegisterView
from rest_framework_simplejwt.views import TokenObtainPairView , TokenRefreshView
# from accounts.views import RegisterView

urlpatterns = [
    path('auth/register/',RegisterView.as_view(),name='auth_register'),
    path('auth/login/',TokenObtainPairView.as_view(),name='token_obtain_pair'),
    path('auth/refresh/',TokenRefreshView.as_view(),name='token_refresh'),
    path('users/',UserListView.as_view(),name='user-list'),
    path('users/search/',UserSearchView.as_view(),name='user-search'),
    path('users/nearby/',NearbyUserView.as_view(),name='user-nearby'),
    
]