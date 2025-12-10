from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)
    email = models.EmailField(max_length=255, blank=True)
    dob = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.user.username})"


class CV(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name='cvs')
    uploaded_cv = models.FileField(upload_to='resumes/')
    
    # Extracted data fields
    extracted_text = models.TextField(blank=True)
    contact_information = models.TextField(blank=True)
    address = models.TextField(blank=True)
    education = models.TextField(blank=True)
    experience = models.TextField(blank=True)
    skills = models.TextField(blank=True)
    projects = models.TextField(blank=True)
    languages = models.TextField(blank=True)
    hobbies = models.TextField(blank=True)
    certifications = models.TextField(blank=True)
    awards = models.TextField(blank=True)
    
    # Analysis scores
    overall_score = models.IntegerField(default=0)
    grammar_score = models.IntegerField(default=0)
    keyword_match_score = models.IntegerField(default=0)
    suggestion = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"CV {self.id} for {self.profile.user.username}"
    
    @property
    def file_name(self):
        return self.uploaded_cv.name if self.uploaded_cv else ""
    
    @property
    def file_size(self):
        return self.uploaded_cv.size if self.uploaded_cv else 0
    
    @property
    def file_type(self):
        import os
        if self.uploaded_cv:
            return os.path.splitext(self.uploaded_cv.name)[1].lower()
        return ""


class Resuma_Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    downloaded_resume = models.FileField(upload_to='reports/')
    report = models.JSONField(default=dict)
    created_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Report {self.id} for {self.user.username}"