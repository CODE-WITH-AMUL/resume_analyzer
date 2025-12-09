from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .models import Profile, CV, Resuma_Report
from .serializers import (
    UserSerializer, ProfileSerializer, CVSerializer, 
    CVUploadSerializer, ResumeAnalysisResponseSerializer, ResumaReportSerializer
)
from .services import analyze_resume_with_ai
import os

@api_view(['GET'])
def current_user(request):
    if request.user.is_authenticated:
        return Response(
            {
                'user': UserSerializer(request.user).data,
                'profile': ProfileSerializer(request.user.profile).data if hasattr(request.user, 'profile') else None
            },
            status=status.HTTP_200_OK
        )
    else:
        return Response(
            {'error': 'Not authenticated'},
            status=status.HTTP_401_UNAUTHORIZED
        )


@api_view(['POST'])
def upload_and_analyze_resume(request):
    if not request.FILES.get('resume'):
        return Response(
            {'error': 'No resume file provided'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    resume_file = request.FILES['resume']
    
    allowed_extensions = ['.pdf', '.docx', '.txt']
    file_extension = os.path.splitext(resume_file.name)[1].lower()
    
    if file_extension not in allowed_extensions:
        return Response(
            {'error': 'Invalid file type. Only PDF, DOCX, and TXT files are allowed'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        if request.user.is_authenticated and hasattr(request.user, 'profile'):
            profile = request.user.profile
        else:
            guest_user, created = User.objects.get_or_create(username='guest_user')
            profile, created = Profile.objects.get_or_create(
                user=guest_user,
                defaults={
                    'email': 'guest@example.com',
                    'first_name': 'Guest',
                    'last_name': 'User'
                }
            )
        
        cv = CV.objects.create(
            profile=profile,
            uploaded_cv=resume_file
        )
        
        file_path = cv.uploaded_cv.path
        
        analysis_result = analyze_resume_with_ai(file_path)
        
        cv.extracted_text = analysis_result['extracted_text']
        cv.overall_score = analysis_result['overall_score']
        cv.grammar_score = analysis_result['grammar_score']
        cv.keyword_match_score = analysis_result['keyword_match_score']
        cv.suggestion = analysis_result['suggestion']
        cv.contact_information = analysis_result['contact_information']
        cv.education = analysis_result['education']
        cv.experience = analysis_result['experience']
        cv.skills = analysis_result['skills']
        cv.projects = analysis_result['projects']
        cv.certifications = analysis_result['certifications']
        cv.save()
        
        response_data = {
            'id': cv.id,
            'overall_score': cv.overall_score,
            'grammar_score': cv.grammar_score,
            'keyword_match_score': cv.keyword_match_score,
            'suggestion': cv.suggestion,
            'extracted_text': cv.extracted_text,
            'contact_information': cv.contact_information,
            'education': cv.education,
            'experience': cv.experience,
            'skills': cv.skills,
            'projects': cv.projects,
            'job_categories': analysis_result['job_categories'],
            'created_at': cv.created_at,
        }
        
        return Response(response_data, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        return Response(
            {'error': f'Error analyzing resume: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def get_cv_history(request):
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Authentication required'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    if not hasattr(request.user, 'profile'):
        return Response(
            {'cvs': []},
            status=status.HTTP_200_OK
        )
    
    cvs = CV.objects.filter(profile=request.user.profile).order_by('-created_at')
    serializer = CVSerializer(cvs, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['GET'])
def get_cv_detail(request, cv_id):
    try:
        cv = CV.objects.get(id=cv_id)
        
        if request.user.is_authenticated and hasattr(request.user, 'profile'):
            if cv.profile != request.user.profile:
                return Response(
                    {'error': 'Access denied'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        serializer = CVSerializer(cv)
        return Response(serializer.data, status=status.HTTP_200_OK)
        
    except CV.DoesNotExist:
        return Response(
            {'error': 'CV not found'},
            status=status.HTTP_404_NOT_FOUND
        )
