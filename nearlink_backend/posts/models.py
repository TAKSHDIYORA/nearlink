from django.db import models
from django.conf import settings

class Post(models.Model):
    author = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    image = models.ImageField(upload_to='post_images/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Optional: Simple Like System
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_posts', blank=True)

    def __str__(self):
        return f"{self.author.username} - {self.content[:20]}"