from django.test import TestCase
from django.contrib.auth.models import User
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APITestCase, APIRequestFactory
from rest_framework import status
from unittest.mock import patch, MagicMock
from .models import Profile, CV, Resuma_Report
from .serializers import (
    UserSerializer, ProfileSerializer, CVSerializer,
    ResumaReportSerializer
)
from .services import (
    read_resume_from_file, clean_resume_text, detect_job_category,
    extract_structured_data, calculate_scores, analyze_resume_with_ai
)
import tempfile
import os
import json


class ProfileModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_profile_creation(self):
        profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )
        self.assertEqual(str(profile), "testuser's Profile")
        self.assertEqual(profile.first_name, 'John')
        self.assertEqual(profile.last_name, 'Doe')

    def test_profile_unique_email(self):
        Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )
        user2 = User.objects.create_user(
            username='testuser2',
            email='test2@example.com',
            password='testpass123'
        )
        with self.assertRaises(Exception):
            Profile.objects.create(
                user=user2,
                first_name='Jane',
                last_name='Doe',
                email='test@example.com'
            )


class CVModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )

    def test_cv_creation(self):
        cv = CV.objects.create(
            profile=self.profile,
            extracted_text='Sample resume text',
            overall_score=85,
            grammar_score=90,
            keyword_match_score=80
        )
        self.assertEqual(str(cv), "testuser's CV")
        self.assertEqual(cv.overall_score, 85)
        self.assertEqual(cv.grammar_score, 90)

    def test_cv_with_file(self):
        file_content = b'Sample PDF content'
        uploaded_file = SimpleUploadedFile('resume.pdf', file_content, content_type='application/pdf')
        cv = CV.objects.create(
            profile=self.profile,
            uploaded_cv=uploaded_file
        )
        self.assertIn('resume', cv.uploaded_cv.name)
        self.assertTrue(cv.uploaded_cv.name.endswith('.pdf'))


class ResumaReportModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )

    def test_resuma_report_creation(self):
        report = Resuma_Report.objects.create(
            user=self.user,
            report='Sample report'
        )
        self.assertEqual(str(report), 'Report for testuser')
        self.assertEqual(report.report, 'Sample report')

    def test_resuma_report_auto_attach_cv(self):
        file_content = b'Sample PDF'
        uploaded_file = SimpleUploadedFile('resume.pdf', file_content, content_type='application/pdf')
        CV.objects.create(
            profile=self.profile,
            uploaded_cv=uploaded_file
        )
        report = Resuma_Report.objects.create(user=self.user)
        self.assertIsNotNone(report.downloaded_resume)
        self.assertEqual(report.report, 'Resume ready for download.')


class UserSerializerTests(TestCase):
    def test_user_serializer(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            first_name='John',
            last_name='Doe'
        )
        serializer = UserSerializer(user)
        self.assertEqual(serializer.data['username'], 'testuser')
        self.assertEqual(serializer.data['email'], 'test@example.com')
        self.assertIn('id', serializer.data)


class ProfileSerializerTests(TestCase):
    def test_profile_serializer(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        profile = Profile.objects.create(
            user=user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )
        serializer = ProfileSerializer(profile)
        self.assertEqual(serializer.data['first_name'], 'John')
        self.assertEqual(serializer.data['last_name'], 'Doe')
        self.assertIn('user', serializer.data)


class CVSerializerTests(TestCase):
    def test_cv_serializer(self):
        user = User.objects.create_user(
            username='testuser',
            email='test@example.com'
        )
        profile = Profile.objects.create(
            user=user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )
        cv = CV.objects.create(
            profile=profile,
            extracted_text='Sample text',
            overall_score=85
        )
        serializer = CVSerializer(cv)
        self.assertEqual(serializer.data['overall_score'], 85)
        self.assertIn('profile', serializer.data)


class ReadResumeServiceTests(TestCase):
    def test_read_txt_file(self):
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False, encoding='utf-8') as f:
            f.write('Sample resume text')
            f.flush()
            temp_path = f.name
        text = read_resume_from_file(temp_path)
        self.assertEqual(text, 'Sample resume text')
        os.unlink(temp_path)

    def test_read_unsupported_file_type(self):
        with self.assertRaises(ValueError) as context:
            read_resume_from_file('test.xyz')
        self.assertIn('Unsupported file type', str(context.exception))

    @patch('PyPDF2.PdfReader')
    def test_read_pdf_file(self, mock_pdf_reader):
        mock_page = MagicMock()
        mock_page.extract_text.return_value = 'PDF text content'
        mock_pdf_reader.return_value.pages = [mock_page]
        
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            temp_path = f.name
        text = read_resume_from_file(temp_path)
        self.assertIn('PDF text content', text)
        os.unlink(temp_path)

    def test_read_pdf_error(self):
        with tempfile.NamedTemporaryFile(suffix='.pdf', delete=False) as f:
            f.write(b'Invalid PDF content')
            f.flush()
            temp_path = f.name
        with self.assertRaises(ValueError) as context:
            read_resume_from_file(temp_path)
        self.assertIn('Error reading PDF', str(context.exception))
        os.unlink(temp_path)

    @patch('docx2txt.process')
    def test_read_docx_file(self, mock_docx):
        mock_docx.return_value = 'DOCX text content'
        with tempfile.NamedTemporaryFile(suffix='.docx', delete=False) as f:
            temp_path = f.name
        text = read_resume_from_file(temp_path)
        self.assertEqual(text, 'DOCX text content')
        os.unlink(temp_path)


class CleanResumeTextTests(TestCase):
    def test_clean_resume_text_basic(self):
        text = 'This  is   a    test\n\nwith   multiple   spaces'
        cleaned = clean_resume_text(text)
        self.assertEqual(cleaned, 'This is a test with multiple spaces')

    def test_clean_resume_text_removes_urls(self):
        text = 'Check out http://example.com and www.test.com'
        cleaned = clean_resume_text(text)
        self.assertNotIn('http://example.com', cleaned)
        self.assertNotIn('www.test.com', cleaned)

    def test_clean_resume_text_removes_emails(self):
        text = 'Contact me at test@example.com for info'
        cleaned = clean_resume_text(text)
        self.assertNotIn('test@example.com', cleaned)

    def test_clean_resume_text_max_words(self):
        text = ' '.join(['word'] * 3000)
        cleaned = clean_resume_text(text, max_words=100)
        self.assertEqual(len(cleaned.split()), 100)

    def test_clean_resume_text_special_characters(self):
        text = 'Test@#$%^&*()text with special chars'
        cleaned = clean_resume_text(text)
        self.assertNotIn('@', cleaned)
        self.assertNotIn('#', cleaned)


class DetectJobCategoryTests(TestCase):
    def test_detect_data_science(self):
        text = 'I have experience with python, machine learning, and pandas'
        categories = detect_job_category(text)
        self.assertIn('Data Science', categories)

    def test_detect_web_development(self):
        text = 'Skilled in HTML, CSS, JavaScript, React and Django'
        categories = detect_job_category(text)
        self.assertIn('Web Development', categories)

    def test_detect_mobile_development(self):
        text = 'Experienced in Android development with Kotlin'
        categories = detect_job_category(text)
        self.assertIn('Mobile Development', categories)

    def test_detect_devops(self):
        text = 'Expert in Docker, Kubernetes, and AWS infrastructure'
        categories = detect_job_category(text)
        self.assertIn('DevOps', categories)

    def test_detect_multiple_categories(self):
        text = 'Python developer with Django and Docker experience'
        categories = detect_job_category(text)
        self.assertIn('Data Science', categories)
        self.assertIn('Web Development', categories)

    def test_detect_no_category(self):
        text = 'I like reading books and playing chess'
        categories = detect_job_category(text)
        self.assertEqual(categories, ['General'])


class ExtractStructuredDataTests(TestCase):
    def test_extract_structured_data(self):
        ai_json = {
            'name': 'John Doe',
            'email': 'john@example.com',
            'phone_number': '1234567890',
            'education': [{'degree': 'BS', 'major': 'CS'}],
            'work_experience': [{'company': 'ABC Inc', 'role': 'Developer'}],
            'skills': ['Python', 'Django'],
            'projects': [{'name': 'Project X'}],
            'certifications': [{'name': 'AWS Certified'}]
        }
        result = extract_structured_data(ai_json)
        self.assertIn('contact_information', result)
        self.assertIn('John Doe', result['contact_information'])
        self.assertIn('education', result)
        self.assertIn('skills', result)

    def test_extract_structured_data_missing_fields(self):
        ai_json = {'name': 'John Doe'}
        result = extract_structured_data(ai_json)
        self.assertIn('contact_information', result)
        self.assertIn('education', result)


class CalculateScoresTests(TestCase):
    def test_calculate_scores_basic(self):
        ai_json = {
            'candidate_score': 75,
            'skills': ['Python', 'Django', 'JavaScript']
        }
        scores = calculate_scores(ai_json)
        self.assertEqual(scores['overall_score'], 75)
        self.assertIsInstance(scores['grammar_score'], int)
        self.assertIsInstance(scores['keyword_match_score'], int)

    def test_calculate_scores_high_skills(self):
        ai_json = {
            'candidate_score': 90,
            'skills': ['Python', 'Java', 'C++', 'JavaScript', 'Go']
        }
        scores = calculate_scores(ai_json)
        self.assertEqual(scores['overall_score'], 90)
        self.assertGreater(scores['keyword_match_score'], 0)

    def test_calculate_scores_no_skills(self):
        ai_json = {
            'candidate_score': 50,
            'skills': []
        }
        scores = calculate_scores(ai_json)
        self.assertEqual(scores['overall_score'], 50)
        self.assertEqual(scores['keyword_match_score'], 0)

    def test_calculate_scores_boundary(self):
        ai_json = {
            'candidate_score': 0,
            'skills': []
        }
        scores = calculate_scores(ai_json)
        self.assertGreaterEqual(scores['grammar_score'], 0)
        self.assertLessEqual(scores['grammar_score'], 100)


class RegisterUserViewTests(APITestCase):
    def test_register_user_success(self):
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'testpass123',
            'first_name': 'John',
            'last_name': 'Doe'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertTrue(User.objects.filter(username='newuser').exists())
        self.assertTrue(Profile.objects.filter(user__username='newuser').exists())

    def test_register_user_missing_username(self):
        data = {
            'email': 'test@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_register_user_missing_email(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_missing_password(self):
        data = {
            'username': 'testuser',
            'email': 'test@example.com'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_user_duplicate_username(self):
        User.objects.create_user(
            username='existinguser',
            email='existing@example.com',
            password='pass123'
        )
        data = {
            'username': 'existinguser',
            'email': 'new@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Username already exists', response.data['error'])

    def test_register_user_duplicate_email(self):
        User.objects.create_user(
            username='user1',
            email='existing@example.com',
            password='pass123'
        )
        data = {
            'username': 'user2',
            'email': 'existing@example.com',
            'password': 'testpass123'
        }
        response = self.client.post('/api/register/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Email already exists', response.data['error'])


class LoginUserViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_login_user_success(self):
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post('/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Login successful')

    def test_login_user_invalid_credentials(self):
        data = {
            'username': 'testuser',
            'password': 'wrongpassword'
        }
        response = self.client.post('/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Invalid credentials', response.data['error'])

    def test_login_user_missing_username(self):
        data = {
            'password': 'testpass123'
        }
        response = self.client.post('/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_user_missing_password(self):
        data = {
            'username': 'testuser'
        }
        response = self.client.post('/api/login/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LogoutUserViewTests(APITestCase):
    def test_logout_user(self):
        response = self.client.post('/api/logout/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Logout successful')


class CurrentUserViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )

    def test_current_user_authenticated(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/current-user/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn('profile', response.data)

    def test_current_user_not_authenticated(self):
        response = self.client.get('/api/current-user/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Not authenticated', response.data['error'])


class UploadAndAnalyzeResumeViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )

    @patch('core.views.analyze_resume_with_ai')
    def test_upload_resume_authenticated_success(self, mock_analyze):
        mock_analyze.return_value = {
            'extracted_text': 'Sample text',
            'overall_score': 85,
            'grammar_score': 90,
            'keyword_match_score': 80,
            'suggestion': 'Good resume',
            'contact_information': '{}',
            'education': '[]',
            'experience': '[]',
            'skills': '[]',
            'projects': '[]',
            'certifications': '[]',
            'job_categories': ['Web Development']
        }
        
        self.client.force_authenticate(user=self.user)
        file_content = b'Sample PDF content'
        resume = SimpleUploadedFile('resume.pdf', file_content, content_type='application/pdf')
        
        response = self.client.post('/api/upload-resume/', {'resume': resume}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('overall_score', response.data)
        self.assertEqual(response.data['overall_score'], 85)

    def test_upload_resume_no_file(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/upload-resume/', {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('No resume file provided', response.data['error'])

    def test_upload_resume_invalid_file_type(self):
        self.client.force_authenticate(user=self.user)
        file_content = b'Invalid content'
        resume = SimpleUploadedFile('resume.xyz', file_content, content_type='application/xyz')
        
        response = self.client.post('/api/upload-resume/', {'resume': resume}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('Invalid file type', response.data['error'])

    @patch('core.views.analyze_resume_with_ai')
    def test_upload_resume_guest_user(self, mock_analyze):
        mock_analyze.return_value = {
            'extracted_text': 'Sample text',
            'overall_score': 75,
            'grammar_score': 80,
            'keyword_match_score': 70,
            'suggestion': 'Good resume',
            'contact_information': '{}',
            'education': '[]',
            'experience': '[]',
            'skills': '[]',
            'projects': '[]',
            'certifications': '[]',
            'job_categories': ['General']
        }
        
        file_content = b'Sample PDF content'
        resume = SimpleUploadedFile('resume.pdf', file_content, content_type='application/pdf')
        
        response = self.client.post('/api/upload-resume/', {'resume': resume}, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='guest_user').exists())


class GetCVHistoryViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )

    def test_get_cv_history_authenticated(self):
        CV.objects.create(profile=self.profile, extracted_text='Resume 1')
        CV.objects.create(profile=self.profile, extracted_text='Resume 2')
        
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/cv-history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_get_cv_history_not_authenticated(self):
        response = self.client.get('/api/cv-history/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('Authentication required', response.data['error'])

    def test_get_cv_history_no_profile(self):
        user_no_profile = User.objects.create_user(
            username='noprofile',
            email='noprofile@example.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=user_no_profile)
        response = self.client.get('/api/cv-history/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['cvs'], [])


class GetCVDetailViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            email='test@example.com'
        )
        self.cv = CV.objects.create(
            profile=self.profile,
            extracted_text='Sample resume',
            overall_score=85
        )

    def test_get_cv_detail_success(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get(f'/api/cv/{self.cv.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['overall_score'], 85)

    def test_get_cv_detail_access_denied(self):
        other_user = User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='testpass123'
        )
        other_profile = Profile.objects.create(
            user=other_user,
            first_name='Jane',
            last_name='Doe',
            email='other@example.com'
        )
        
        self.client.force_authenticate(user=other_user)
        response = self.client.get(f'/api/cv/{self.cv.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Access denied', response.data['error'])

    def test_get_cv_detail_not_found(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/cv/99999/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('CV not found', response.data['error'])
