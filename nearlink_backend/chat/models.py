from django.db import models
from django.conf import settings
# Create your models here.

class ChatGroup(models.Model):
    name = models.CharField(max_length=255)
    members = models.ManyToManyField(settings.AUTH_USER_MODEL,related_name='chat_groups')
    is_group = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.name

class Message(models.Model):
    group = models.ForeignKey(
        ChatGroup, 
        on_delete=models.CASCADE, 
        related_name='messages', 
        null=True, 
        blank=True
    )
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['timestamp']