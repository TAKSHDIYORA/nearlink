from django.contrib import admin
from .models import Post, Comment, Bookmark, SharedPost

@admin.register(Post)
class PostAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'content', 'created_at']
    search_fields = ['author__username', 'content']

@admin.register(Comment)
class CommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'author', 'post', 'content', 'created_at']
    search_fields = ['author__username', 'content']

@admin.register(Bookmark)
class BookmarkAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'post', 'created_at']

@admin.register(SharedPost)
class SharedPostAdmin(admin.ModelAdmin):
    list_display = ['id', 'sender', 'recipient', 'post', 'shared_at']
