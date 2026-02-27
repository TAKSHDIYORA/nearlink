from django.urls import path
from .views import  ChatSessionView,CreateGroupView,GroupMessageView,UserRoomsView

urlpatterns = [
    path('with/<int:other_user_id>/', ChatSessionView.as_view(), name='chat-with-user'),
    path('groups/create/', CreateGroupView.as_view(), name='create-group'),
    path('groups/<int:group_id>/', GroupMessageView.as_view(), name='group-messages'),
    path('rooms/', UserRoomsView.as_view()),
]