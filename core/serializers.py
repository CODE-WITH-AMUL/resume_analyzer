from django.contrib.auth.models import User
from rest_framework import serializers

from .models import CV, Profile, Resuma_Report


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class ProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Profile
        fields = ['id', 'user', 'profile_picture', 'first_name', 'last_name', 'email', 'dob', 'created_at', 'updated_at']


class CVSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = CV
        fields = [
            'id', 'profile', 'uploaded_cv', 'extracted_text',
            'contact_information', 'address', 'education', 'experience',
            'skills', 'projects', 'languages', 'hobbies', 'certifications',
            'awards', 'overall_score', 'grammar_score', 'keyword_match_score',
            'suggestion', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'extracted_text', 'contact_information', 'address', 'education',
            'experience', 'skills', 'projects', 'languages', 'hobbies',
            'certifications', 'awards', 'overall_score', 'grammar_score',
            'keyword_match_score', 'suggestion', 'created_at', 'updated_at'
        ]


class CVUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = ['uploaded_cv']


class ResumeAnalysisResponseSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    overall_score = serializers.IntegerField()
    grammar_score = serializers.IntegerField()
    keyword_match_score = serializers.IntegerField()
    suggestion = serializers.CharField()
    extracted_text = serializers.CharField()
    contact_information = serializers.CharField()
    education = serializers.CharField()
    experience = serializers.CharField()
    skills = serializers.CharField()
    projects = serializers.CharField()
    job_categories = serializers.ListField(child=serializers.CharField())
    created_at = serializers.DateTimeField()


class ResumaReportSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Resuma_Report
        fields = ['id', 'user', 'downloaded_resume', 'report', 'created_at']
        read_only_fields = ['created_at']