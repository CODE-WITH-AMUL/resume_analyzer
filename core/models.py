from django.contrib.auth.models import User
from django.db import models
import os
from django.core.files import File


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    profile_picture = models.ImageField(upload_to="profile_pictures/", default="default.jpg")

    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    dob = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username}'s Profile"



class CV(models.Model):
    profile = models.ForeignKey(Profile, on_delete=models.CASCADE, related_name="cvs")

    # upload resume
    uploaded_cv = models.FileField(upload_to="cv_files/", null=True, blank=True)

    # extracted text from PDF (after OCR or parsing)
    extracted_text = models.TextField(null=True, blank=True)

    # structured fields
    contact_information = models.TextField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    education = models.TextField(null=True, blank=True)
    experience = models.TextField(null=True, blank=True)
    skills = models.TextField(null=True, blank=True)
    projects = models.TextField(null=True, blank=True)
    languages = models.TextField(null=True, blank=True)
    hobbies = models.TextField(null=True, blank=True)
    certifications = models.TextField(null=True, blank=True)
    awards = models.TextField(null=True, blank=True)

    # -------------------------------------------------------
    # AI Analysis Fields (future proof)
    # -------------------------------------------------------
    overall_score = models.IntegerField(null=True, blank=True)   # 0-100
    grammar_score = models.IntegerField(null=True, blank=True)
    keyword_match_score = models.IntegerField(null=True, blank=True)
    suggestion = models.TextField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.profile.user.username}'s CV"




class Resuma_Report(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='resumareports')
    downloaded_resume = models.FileField(upload_to='downloaded_resumes/', null=True, blank=True)
    report = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Report for {self.user.username}"
    
    def save(self, *args, **kwargs):
        """
        Automatically attach the latest CV for the user when generating the report.
        """
        # Only attach if no resume is already attached
        if not self.downloaded_resume:
            # Get the latest CV for the user
            latest_cv = self.user.profile.cvs.last()  # Assuming user has a profile and CVs
            if latest_cv and latest_cv.uploaded_cv:
                # Copy the CV file into the downloaded_resume field
                self.downloaded_resume.save(
                    os.path.basename(latest_cv.uploaded_cv.name),
                    File(latest_cv.uploaded_cv),
                    save=False
                )
                self.report = "Resume ready for download."
        
        super().save(*args, **kwargs)
