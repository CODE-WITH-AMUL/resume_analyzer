from django.contrib import admin
from .models import Profile, CV, Resuma_Report


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'email', 'first_name', 'last_name']
    search_fields = ['user__username', 'email', 'first_name', 'last_name']
    list_filter = ['dob']


@admin.register(CV)
class CVAdmin(admin.ModelAdmin):
    list_display = ['profile', 'overall_score', 'grammar_score', 'keyword_match_score', 'created_at']
    search_fields = ['profile__user__username', 'extracted_text']
    list_filter = ['created_at', 'overall_score']
    readonly_fields = ['created_at']


@admin.register(Resuma_Report)
class ResumaReportAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at']
    search_fields = ['user__username', 'report']
    list_filter = ['created_at']
    readonly_fields = ['created_at']
