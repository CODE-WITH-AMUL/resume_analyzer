from django.urls import path
from . import views

urlpatterns = [
    path('api/current-user/', views.current_user, name='current-user'),
    path('api/upload-resume/', views.upload_and_analyze_resume, name='upload-resume'),
    path('api/cv-history/', views.get_cv_history, name='cv-history'),
    path('api/cv/<int:cv_id>/', views.get_cv_detail, name='cv-detail'),
]
