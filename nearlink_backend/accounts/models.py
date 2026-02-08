from django.db import models
from django.contrib.auth.models import AbstractUser
# Create your models here.

class User(AbstractUser):
    bio = models.TextField(blank=True)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    
    def __str__(self):
        return self.username
    
    
class FriendRequest(models.Model):
    sender = models.ForeignKey(User, related_name ='sent_request',on_delete=models.CASCADE)
    receiver = models.ForeignKey(User, related_name='receive_requests',on_delete=models.CASCADE)
    status = models.CharField(
        max_length=20,
        choices=[('pending','Pending'),('accepted','Accepted'),('rejected','Rejected')],
        default='pending'
        
    )    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('sender','receiver')
    def __str__(self):
        return f"{self.sender} -> {self.receiver} ({self.status})"         