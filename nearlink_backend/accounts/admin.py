from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# This makes your Custom User look nice in the admin (with password reset, etc.)
class CustomUserAdmin(UserAdmin):
    model = User
    # Add your custom fields (bio, lat, long) to the admin form
    fieldsets = UserAdmin.fieldsets + (
        (None, {'fields': ('bio', 'latitude', 'longitude')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('bio', 'latitude', 'longitude')}),
    )

# Register your models
admin.site.register(User, CustomUserAdmin)
# admin.site.register(FriendRequest)