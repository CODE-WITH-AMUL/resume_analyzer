from django.conf import settings
from django.conf.urls.static import static
from django.urls import path

from . import views

urlpatterns = [
    path('current-user/', views.current_user, name='current_user'),
    path('upload-resume/', views.upload_and_analyze_resume, name='upload_resume'),
    path('cv-history/', views.get_cv_history, name='cv_history'),
    path('cv-detail/<int:cv_id>/', views.get_cv_detail, name='cv_detail'),
    path('delete-cv/<int:cv_id>/', views.delete_cv, name='delete_cv'),
    path('reports/', views.get_user_reports, name='user_reports'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)