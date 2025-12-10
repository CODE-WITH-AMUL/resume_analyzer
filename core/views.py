#core views.py
import os
from django.db import transaction
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from django.core.exceptions import ValidationError

from .models import CV, Profile, Resuma_Report
from .serializers import CVSerializer, ProfileSerializer, UserSerializer, ResumaReportSerializer
from .services import analyze_resume_with_ai


# -----------------------------
# Custom Authentication Classes
# -----------------------------
class CsrfExemptSessionAuthentication(SessionAuthentication):
    """
    SessionAuthentication with CSRF check disabled
    """
    def enforce_csrf(self, request):
        return  # To not perform the csrf check previously happening


# -----------------------------
# Current User
# -----------------------------
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def current_user(request):
    """
    Get current authenticated user information
    """
    if not request.user.is_authenticated:
        return Response(
            {'error': 'Not authenticated'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    try:
        user_data = UserSerializer(request.user).data
        profile_data = None
        
        if hasattr(request.user, 'profile'):
            profile_data = ProfileSerializer(request.user.profile).data
        else:
            # Create profile if it doesn't exist
            profile, created = Profile.objects.get_or_create(
                user=request.user,
                defaults={
                    'email': request.user.email or '',
                    'first_name': request.user.first_name or '',
                    'last_name': request.user.last_name or ''
                }
            )
            profile_data = ProfileSerializer(profile).data
        
        return Response(
            {
                'user': user_data,
                'profile': profile_data
            },
            status=status.HTTP_200_OK
        )
    except Exception as e:
        return Response(
            {'error': f'Error fetching user data: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# -----------------------------
# Upload Resume (CSRF Exempt) - FIXED for your model
# -----------------------------
@api_view(['POST'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def upload_and_analyze_resume(request):
    """
    Upload and analyze a resume file
    """
    # Validate file presence
    if 'resume' not in request.FILES:
        return Response(
            {'error': 'No resume file provided'}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    resume_file = request.FILES['resume']
    original_filename = resume_file.name
    file_extension = os.path.splitext(original_filename)[1].lower()
    
    # Validate file size (max 10MB)
    max_size = 10 * 1024 * 1024  # 10MB in bytes
    if resume_file.size > max_size:
        return Response(
            {'error': 'File size exceeds maximum limit of 10MB'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate file extension
    allowed_extensions = ['.pdf', '.docx', '.txt', '.doc']
    
    if file_extension not in allowed_extensions:
        return Response(
            {'error': f'Invalid file type. Allowed types: {", ".join(allowed_extensions)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        with transaction.atomic():
            # Determine user profile
            if request.user.is_authenticated:
                # Use authenticated user's profile or create one
                profile, created = Profile.objects.get_or_create(
                    user=request.user,
                    defaults={
                        'email': request.user.email or '',
                        'first_name': request.user.first_name or '',
                        'last_name': request.user.last_name or '',
                        'dob': None
                    }
                )
                is_guest = False
                username = request.user.username
            else:
                # Create or get guest user and profile
                guest_user, _ = User.objects.get_or_create(
                    username='guest_user',
                    defaults={
                        'email': 'guest@example.com',
                        'first_name': 'Guest',
                        'last_name': 'User'
                    }
                )
                profile, _ = Profile.objects.get_or_create(
                    user=guest_user,
                    defaults={
                        'email': 'guest@example.com',
                        'first_name': 'Guest',
                        'last_name': 'User',
                        'dob': None
                    }
                )
                is_guest = True
                username = 'guest_user'
            
            # Create CV record - using your existing model fields
            cv = CV.objects.create(
                profile=profile,
                uploaded_cv=resume_file,
            )
            
            # Get file path for analysis
            if not os.path.exists(cv.uploaded_cv.path):
                raise FileNotFoundError(f"Uploaded file not found at: {cv.uploaded_cv.path}")
            
            # Analyze resume with AI
            analysis_result = analyze_resume_with_ai(cv.uploaded_cv.path)
            
            # Validate analysis result
            if not isinstance(analysis_result, dict):
                raise ValidationError("Invalid analysis result format")
            
            # Update CV with analysis results based on your model fields
            update_fields = [
                'overall_score', 'grammar_score', 'keyword_match_score',
                'suggestion', 'extracted_text', 'contact_information',
                'address', 'education', 'experience', 'skills', 'projects',
                'languages', 'hobbies', 'certifications', 'awards'
            ]
            
            for field in update_fields:
                if field in analysis_result:
                    setattr(cv, field, analysis_result[field])
            
            # Handle job categories separately (store in suggestion or create new field if needed)
            if 'job_categories' in analysis_result:
                # Store job categories in suggestion field if you don't have a separate field
                job_categories_text = f"Suggested Job Categories: {', '.join(analysis_result['job_categories'])}"
                if cv.suggestion:
                    cv.suggestion = f"{cv.suggestion}\n\n{job_categories_text}"
                else:
                    cv.suggestion = job_categories_text
            
            cv.save()
            
            # Also create a Resuma_Report if the model exists
            report_data = None
            if hasattr(analysis_result, 'get'):
                report_data = {
                    'overall_score': analysis_result.get('overall_score', 0),
                    'grammar_score': analysis_result.get('grammar_score', 0),
                    'keyword_match_score': analysis_result.get('keyword_match_score', 0),
                    'suggestions': analysis_result.get('suggestion', ''),
                    'extracted_info': str({
                        'contact': analysis_result.get('contact_information', ''),
                        'education': analysis_result.get('education', ''),
                        'experience': analysis_result.get('experience', ''),
                        'skills': analysis_result.get('skills', ''),
                        'projects': analysis_result.get('projects', '')
                    })
                }
            
            if report_data and hasattr(profile, 'user'):
                from django.core.files.base import ContentFile
                # By creating a new ContentFile, we are duplicating the file content
                # instead of moving the original file, which would cause issues when
                # trying to access cv.uploaded_cv later.
                cv.uploaded_cv.seek(0)
                file_copy = ContentFile(cv.uploaded_cv.read())
                # Create the report and save the copied file
                report = Resuma_Report(user=profile.user, report=report_data)
                report.downloaded_resume.save(os.path.basename(cv.uploaded_cv.name), file_copy)
                report.save()
            
            # Prepare response data matching your model
            response_data = {
                'id': cv.id,
                'overall_score': cv.overall_score or 0,
                'grammar_score': cv.grammar_score or 0,
                'keyword_match_score': cv.keyword_match_score or 0,
                'suggestion': cv.suggestion or '',
                'extracted_text': cv.extracted_text[:1000] + '...' if cv.extracted_text and len(cv.extracted_text) > 1000 else (cv.extracted_text or ''),
                'contact_information': cv.contact_information or '',
                'education': cv.education or '',
                'experience': cv.experience or '',
                'skills': cv.skills or '',
                'projects': cv.projects or '',
                'languages': cv.languages or '',
                'hobbies': cv.hobbies or '',
                'certifications': cv.certifications or '',
                'awards': cv.awards or '',
                'address': cv.address or '',
                'job_categories': analysis_result.get('job_categories', []) if isinstance(analysis_result, dict) else [],
                'is_guest_upload': is_guest,
                'username': username,
                'original_filename': original_filename,
                'file_size': resume_file.size,
                'file_type': file_extension,
                'created_at': cv.created_at,
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
    
    except FileNotFoundError as e:
        return Response(
            {'error': f'File not found: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except ValidationError as e:
        return Response(
            {'error': f'Validation error: {str(e)}'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        # Log the error
        import traceback
        print(f"Error analyzing resume: {str(e)}")
        print(traceback.format_exc())
        
        return Response(
            {'error': f'An error occurred while processing your resume: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# -----------------------------
# Get CV History
# -----------------------------
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([AllowAny])
def get_cv_history(request):
    """
    Get CV history for authenticated user or guest
    """
    try:
        if request.user.is_authenticated:
            profile = getattr(request.user, 'profile', None)
            if not profile:
                # Create profile if it doesn't exist
                profile, created = Profile.objects.get_or_create(
                    user=request.user,
                    defaults={
                        'email': request.user.email or '',
                        'first_name': request.user.first_name or '',
                        'last_name': request.user.last_name or ''
                    }
                )
        else:
            # For guest, get or create guest user's profile
            guest_user, _ = User.objects.get_or_create(
                username='guest_user',
                defaults={
                    'email': 'guest@example.com',
                    'first_name': 'Guest',
                    'last_name': 'User'
                }
            )
            profile, _ = Profile.objects.get_or_create(
                user=guest_user,
                defaults={
                    'email': 'guest@example.com',
                    'first_name': 'Guest',
                    'last_name': 'User'
                }
            )

        # Get CVs ordered by creation date (newest first)
        cvs = CV.objects.filter(profile=profile).order_by('-created_at')

        # Get basic info for each CV (not full analysis to reduce payload)
        cv_list = []
        for cv in cvs[:50]:  # Limit to 50 most recent
            cv_list.append({
                'id': cv.id,
                'file_name': cv.uploaded_cv.name if cv.uploaded_cv else 'Unknown',
                'overall_score': cv.overall_score,
                'created_at': cv.created_at,
                'file_size': cv.uploaded_cv.size if cv.uploaded_cv else 0,
            })

        return Response(
            {
                'count': len(cv_list),
                'results': cv_list
            },
            status=status.HTTP_200_OK
        )

    except Exception as e:
        return Response(
            {'error': f'Error fetching CV history: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# -----------------------------
# Get CV Detail
# -----------------------------
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_cv_detail(request, cv_id):
    """
    Get detailed information about a specific CV
    """
    try:
        # Get CV object
        cv = get_object_or_404(CV, id=cv_id)
        
        # Get user's profile
        user_profile = getattr(request.user, 'profile', None)
        if not user_profile:
            # Create profile if it doesn't exist
            user_profile, _ = Profile.objects.get_or_create(
                user=request.user,
                defaults={
                    'email': request.user.email or '',
                    'first_name': request.user.first_name or '',
                    'last_name': request.user.last_name or '',
                    'dob': None
                }
            )
        
        # Check ownership
        if cv.profile != user_profile:
            return Response(
                {'error': 'Access denied. You do not have permission to view this CV.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Use serializer for consistent formatting
        serializer = CVSerializer(cv)
        
        # Add file metadata
        data = serializer.data
        if cv.uploaded_cv:
            data['file_name'] = cv.uploaded_cv.name
            data['file_size'] = cv.uploaded_cv.size
            data['file_url'] = cv.uploaded_cv.url if hasattr(cv.uploaded_cv, 'url') else ''
        
        return Response(data, status=status.HTTP_200_OK)
    
    except CV.DoesNotExist:
        return Response(
            {'error': 'CV not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error fetching CV details: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# -----------------------------
# Delete CV
# -----------------------------
@api_view(['DELETE'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def delete_cv(request, cv_id):
    """
    Delete a specific CV
    """
    try:
        cv = get_object_or_404(CV, id=cv_id)
        
        # Check ownership
        user_profile = getattr(request.user, 'profile', None)
        if not user_profile or cv.profile != user_profile:
            return Response(
                {'error': 'Access denied. You do not have permission to delete this CV.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Delete the file from storage
        if cv.uploaded_cv and os.path.exists(cv.uploaded_cv.path):
            try:
                os.remove(cv.uploaded_cv.path)
            except:
                pass  # Continue even if file deletion fails
        
        # Delete the CV record
        cv.delete()
        
        return Response(
            {'message': 'CV deleted successfully'},
            status=status.HTTP_200_OK
        )
    
    except CV.DoesNotExist:
        return Response(
            {'error': 'CV not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        return Response(
            {'error': f'Error deleting CV: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# -----------------------------
# Get User Reports (Resuma_Report)
# -----------------------------
@api_view(['GET'])
@authentication_classes([CsrfExemptSessionAuthentication])
@permission_classes([IsAuthenticated])
def get_user_reports(request):
    """
    Get Resuma_Report history for authenticated user
    """
    try:
        reports = Resuma_Report.objects.filter(user=request.user).order_by('-created_at')
        serializer = ResumaReportSerializer(reports, many=True)
        return Response(
            {
                'count': len(serializer.data),
                'results': serializer.data
            },
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {'error': f'Error fetching reports: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
